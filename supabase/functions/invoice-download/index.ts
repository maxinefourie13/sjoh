import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let token = ''
  try {
    if (req.method === 'GET') {
      token = new URL(req.url).searchParams.get('token') ?? ''
    } else {
      const body = await req.json()
      token = body.token ?? body.access_token ?? ''
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!token || token.length < 24) {
    return new Response(JSON.stringify({ error: 'Invalid invoice link' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('invoice_number, doc_type, customer_name, customer_email, line_items, subtotal_zar, vat_zar, total_zar, vat_included, notes, issued_at, sent_at, pdf_path, access_token_expires_at, business:businesses(name, email, phone, city, province)')
    .eq('access_token', token)
    .maybeSingle()

  if (error) {
    console.error('Invoice lookup failed', { error })
    return new Response(JSON.stringify({ error: 'Could not load invoice' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!invoice?.pdf_path) {
    return new Response(JSON.stringify({ error: 'Invoice not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (
    invoice.access_token_expires_at &&
    new Date(invoice.access_token_expires_at).getTime() < Date.now()
  ) {
    return new Response(JSON.stringify({ error: 'This invoice link has expired' }), {
      status: 410,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data: signed, error: signError } = await supabase.storage
    .from('invoice-pdfs')
    .createSignedUrl(invoice.pdf_path, 60 * 15, {
      download: `${invoice.invoice_number}.pdf`,
    })

  if (signError || !signed?.signedUrl) {
    console.error('Invoice signed URL failed', { signError, path: invoice.pdf_path })
    return new Response(JSON.stringify({ error: 'Could not prepare invoice download' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      invoice: {
        invoice_number: invoice.invoice_number,
        doc_type: invoice.doc_type ?? 'invoice',
        customer_name: invoice.customer_name,
        customer_email: invoice.customer_email,
        line_items: invoice.line_items,
        subtotal_zar: invoice.subtotal_zar,
        vat_zar: invoice.vat_zar,
        total_zar: invoice.total_zar,
        vat_included: invoice.vat_included,
        notes: invoice.notes,
        issued_at: invoice.issued_at,
        sent_at: invoice.sent_at,
        business: invoice.business,
      },
      signedUrl: signed.signedUrl,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
})
