import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const YOCO_SECRET_KEY = Deno.env.get('YOCO_SECRET_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { checkoutId } = await req.json()

        if (!checkoutId) {
            throw new Error('Checkout ID is required')
        }

        console.log(`Verifying checkout: ${checkoutId}`)

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

    } catch (error) {
        console.error('Internal error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            },
        )
    }
})
