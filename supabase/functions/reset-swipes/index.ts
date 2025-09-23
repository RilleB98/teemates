import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: user } = await supabaseClient.auth.getUser(token)
    
    if (!user.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { targetUserIds } = await req.json()

    // Delete swipes
    const { error: swipeError } = await supabaseClient
      .from('user_swipes')
      .delete()
      .eq('user_id', user.user.id)
      .in('target_user_id', targetUserIds)

    if (swipeError) {
      console.error('Error deleting swipes:', swipeError)
      return new Response(JSON.stringify({ error: swipeError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Delete restrictions
    const { error: restrictionError } = await supabaseClient
      .from('swipe_restrictions')
      .delete()
      .eq('user_id', user.user.id)
      .in('target_user_id', targetUserIds)

    if (restrictionError) {
      console.error('Error deleting restrictions:', restrictionError)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})