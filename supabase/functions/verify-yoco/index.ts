import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const YOCO_SECRET_KEY = Deno.env.get('YOCO_SECRET_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json().catch(() => ({}));
        const { checkoutId } = body;

        if (!checkoutId) {
            throw new Error('Checkout ID is required');
        }

        if (!YOCO_SECRET_KEY) {
            throw new Error('YOCO_SECRET_KEY is not configured in Supabase secrets');
        }

        console.log(`Verifying checkout: ${checkoutId}`);

        const response = await fetch(`https://online.yoco.com/v1/checkouts/${checkoutId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Yoco API error:', data)
            throw new Error(data.message || 'Failed to verify payment with Yoco')
        }

        console.log('Payment verified successfully:', data.status)

        return new Response(
            JSON.stringify({
                success: data.status === 'successful',
                status: data.status,
                amount: data.amount,
                currency: data.currency,
                metadata: data.metadata
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            },
        )

    } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Internal error:', errorMessage);
        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            },
        )
    }
})
