import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const respond = (data: object, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const { uploadId } = await req.json();
        if (!uploadId) return respond({ success: false, error: "Missing uploadId" }, 400);

        // 1. Fetch upload record
        const { data: upload, error: uploadErr } = await supabase
            .from("financial_uploads")
            .select("*")
            .eq("id", uploadId)
            .single();

        if (uploadErr || !upload) {
            return respond({ success: false, error: "Upload not found" }, 404);
        }

        // Update status to processing
        await supabase.from("financial_uploads").update({ status: "processing" }).eq("id", uploadId);

        // 2. Download file from storage
        const { data: fileData, error: downloadErr } = await supabase.storage
            .from("financial-docs")
            .download(upload.storage_path);

        if (downloadErr || !fileData) {
            const msg = downloadErr?.message || "File download failed";
            await supabase.from("financial_uploads").update({ status: "error", error_message: msg }).eq("id", uploadId);
            return respond({ success: false, error: msg }, 500);
        }

        // 3. Parse file based on type
        let transactions: any[] = [];

        try {
            if (upload.file_type === "csv") {
                const text = await fileData.text();
                transactions = parseCSV(text, upload.user_id, upload.id);
            } else if (upload.file_type === "pdf" || upload.file_type === "image" || upload.file_type === "png" || upload.file_type === "jpg" || upload.file_type === "jpeg") {
                const mimeType = upload.file_type === "pdf" ? "application/pdf" : `image/${upload.file_type.replace('jpg', 'jpeg')}`;
                const bytes = await fileData.arrayBuffer();
                transactions = await extractWithAI(bytes, mimeType, upload.user_id, upload.id);
            }
        } catch (e: any) {
            console.error("Extraction error:", e);
            await supabase.from("financial_uploads").update({ status: "error", error_message: "AI extraction failed: " + e.message }).eq("id", uploadId);
            return respond({ success: false, error: e.message }, 500);
        }

        if (transactions.length === 0) {
            await supabase.from("financial_uploads").update({ status: "error", error_message: "No transactions found" }).eq("id", uploadId);
            return respond({ success: false, error: "No transactions found" }, 400);
        }

        // 4. Save transactions
        const { error: insertErr } = await supabase.from("financial_transactions").insert(transactions);
        if (insertErr) {
            await supabase.from("financial_uploads").update({ status: "error", error_message: insertErr.message }).eq("id", uploadId);
            return respond({ success: false, error: insertErr.message }, 500);
        }

        // 5. Update analysis (Simple aggregation for now)
        await updateAnalysis(upload.user_id);

        // 6. Mark as completed
        await supabase.from("financial_uploads").update({ status: "completed" }).eq("id", uploadId);

        return respond({ success: true, count: transactions.length });

    } catch (err: any) {
        console.error("Unhandled error:", err);
        return respond({ success: false, error: err?.message || String(err) }, 500);
    }
});

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

async function extractWithAI(bytes: ArrayBuffer, mimeType: string, userId: string, uploadId: string) {
    const bytesArr = new Uint8Array(bytes);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytesArr.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytesArr.subarray(i, i + chunkSize) as any);
    }
    const base64Data = btoa(binary);

    const prompt = `Extract all financial transactions from this document. 
    Return a valid JSON array of objects with these keys: 
    - date (YYYY-MM-DD)
    - description
    - amount (numeric positive)
    - direction ('credit' or 'debit')
    - category (one of: 'Payroll', 'Rent', 'Transport', 'Food & Dining', 'Utilities', 'Other')

    Return ONLY the raw JSON array. No markdown, no filler.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: mimeType, data: base64Data } }
                ]
            }],
            generationConfig: { temperature: 0.1, response_mime_type: "application/json" }
        })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("Gemini Error:", err);
        throw new Error("AI Extraction failed");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return [];

    try {
        const rawJson = JSON.parse(text);
        return rawJson.map((tx: any) => ({
            ...tx,
            user_id: userId,
            upload_id: uploadId,
            amount: Math.abs(parseFloat(tx.amount) || 0)
        }));
    } catch (e) {
        console.error("JSON Parse Error:", e, text);
        return [];
    }
}

function parseCSV(text: string, userId: string, uploadId: string) {
    const lines = text.split("\n");
    const results = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(",").map(p => p.trim());

        // Expecting: Date, Description, Amount, Direction
        if (parts.length >= 3) {
            const rawDate = parts[0];
            const description = parts[1] || "No description";
            const amount = parseFloat(parts[2].replace(/[^\d.-]/g, ''));
            const direction = (parts[3] || "debit").toLowerCase() === "credit" ? "credit" : "debit";

            if (isNaN(amount)) {
                console.warn(`Invalid amount on line ${i}: ${parts[2]}`);
                continue;
            }

            // Simple date validation/normalization
            let formattedDate = rawDate;
            if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
                try {
                    const d = new Date(rawDate);
                    if (!isNaN(d.getTime())) {
                        formattedDate = d.toISOString().split('T')[0];
                    } else {
                        formattedDate = new Date().toISOString().split('T')[0];
                    }
                } catch {
                    formattedDate = new Date().toISOString().split('T')[0];
                }
            }

            results.push({
                user_id: userId,
                upload_id: uploadId,
                date: formattedDate,
                description: description,
                amount: Math.abs(amount),
                direction: direction,
                category: classifyTransaction(description)
            });
        }
    }
    return results;
}

function classifyTransaction(desc: string) {
    if (!desc) return "Other";
    const d = desc.toLowerCase();
    if (d.includes("salary") || d.includes("payroll")) return "Payroll";
    if (d.includes("rent") || d.includes("lease")) return "Rent";
    if (d.includes("uber") || d.includes("bolt") || d.includes("transport")) return "Transport";
    if (d.includes("restaurant") || d.includes("cafe") || d.includes("food")) return "Food & Dining";
    if (d.includes("electric") || d.includes("water") || d.includes("internet")) return "Utilities";
    return "Other";
}

async function updateAnalysis(userId: string) {
    const { data: txs } = await supabase
        .from("financial_transactions")
        .select("amount, direction, date")
        .eq("user_id", userId);

    if (!txs || txs.length === 0) return;

    let income = 0;
    let expenses = 0;
    txs.forEach((t: any) => {
        if (t.direction === "credit") income += Number(t.amount);
        else expenses += Number(t.amount);
    });

    const net = income - expenses;
    const healthScore = calculateHealthScore(income, expenses);

    const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM

    await supabase.from("financial_analysis").upsert({
        user_id: userId,
        month_year: monthYear,
        total_income: income,
        total_expenses: expenses,
        net_cash_flow: net,
        health_score: healthScore,
        updated_at: new Date().toISOString()
    });
}

function calculateHealthScore(income: number, expenses: number) {
    if (income === 0) return 0;
    const ratio = (income - expenses) / income;
    let score = 50 + (ratio * 50);
    return Math.max(0, Math.min(100, Math.round(score)));
}
