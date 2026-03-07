import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

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
        const { userId } = await req.json();
        if (!userId) return respond({ success: false, error: "Missing userId" }, 400);

        // 1. Fetch Transactions & Analysis
        const { data: txs } = await supabase
            .from("financial_transactions")
            .select("*")
            .eq("user_id", userId)
            .order("date", { ascending: false })
            .limit(100);

        const { data: analysis } = await supabase
            .from("financial_analysis")
            .select("*")
            .eq("user_id", userId)
            .order("month_year", { ascending: false })
            .limit(1)
            .single();

        if (!txs || txs.length === 0) {
            return respond({ success: false, error: "No transaction data found to analyze." }, 400);
        }

        // 2. Prepare Data for AI
        const dataSummary = `
            USER FINANCIAL DATA SUMMARY:
            Total Income: R${analysis?.total_income || 0}
            Total Expenses: R${analysis?.total_expenses || 0}
            Net Cash Flow: R${analysis?.net_cash_flow || 0}
            Health Score: ${analysis?.health_score || 0}%
            
            RECENT TRANSACTIONS (Last 100):
            ${txs.map(t => `${t.date} | ${t.description} | R${t.amount} | ${t.direction} | ${t.category}`).join("\n")}
        `;

        // 3. Call Gemini AI
        const systemPrompt = `You are the LCX Business Financial Architect. 
        Your goal is to provide a deep, high-end vertical analysis of a business's financial health based on transaction data.
        
        FORMAT YOUR RESPONSE WITH:
        1. EXECUTIVE SUMMARY (Overall health in 2-3 sentences)
        2. PROFITABILITY INSIGHTS (Where is the money coming from?)
        3. EXPENSE LEAK DETECTION (Is there unusual spending? Too many subscriptions?)
        4. SURVIVAL & RUNWAY (Based on net flow, how long can they last?)
        5. STRATEGIC RECOMMENDATIONS (3 actionable steps for improvement)

        Be professional, data-driven, and elite. Do not use generic filler. Use Rand (R) as currency.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: 'user', parts: [{ text: dataSummary }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
            }),
        });

        const aiData = await response.json();
        if (!response.ok) throw new Error(aiData.error?.message || "AI Analysis failed");

        const aiText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "No insights generated.";

        // 4. Save AI Report
        const { data: report, error: reportErr } = await supabase
            .from("financial_ai_reports")
            .upsert({
                user_id: userId,
                report_summary: aiText,
                full_insights: aiData,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (reportErr) throw reportErr;

        return respond({ success: true, report });

    } catch (err: any) {
        console.error("AI Generation Error:", err);
        return respond({ success: false, error: err?.message || String(err) }, 500);
    }
});
