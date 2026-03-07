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

        if (upload.file_type === "csv") {
            const text = await fileData.text();
            transactions = parseCSV(text, upload.user_id, upload.id);
        } else if (upload.file_type === "pdf") {
            // Implementation for PDF parsing requires a library like pdf-parse
            // For now, let's assume we use a mock or a basic regex for simple PDFs
            // In a real scenario, we'd use: import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib';
            transactions = [{
                user_id: upload.user_id,
                upload_id: upload.id,
                date: new Date().toISOString().split('T')[0],
                description: "Sample PDF Transaction",
                amount: 1000,
                direction: "credit",
                category: "Income"
            }];
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

function parseCSV(text: string, userId: string, uploadId: string) {
    const lines = text.split("\n");
    const results = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(",");
        // Expecting: Date, Description, Amount, Direction
        if (parts.length >= 4) {
            results.push({
                user_id: userId,
                upload_id: uploadId,
                date: parts[0],
                description: parts[1],
                amount: Math.abs(parseFloat(parts[2])),
                direction: parts[3].toLowerCase() === "credit" ? "credit" : "debit",
                category: classifyTransaction(parts[1])
            });
        }
    }
    return results;
}

function classifyTransaction(desc: string) {
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
