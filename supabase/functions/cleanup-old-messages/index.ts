import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Calculate date for 1 year ago
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const oneYearAgoISO = oneYearAgo.toISOString()

    console.log(`Starting cleanup of messages older than: ${oneYearAgoISO}`)

    // First, get count of messages to be deleted for logging
    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', oneYearAgoISO)

    console.log(`Found ${messageCount} messages to delete`)

    if (messageCount === 0) {
      console.log('No old messages to delete')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No old messages to delete',
          deletedCount: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Get message IDs that will be deleted (for cleaning up message_reads)
    const { data: messagesToDelete } = await supabase
      .from('messages')
      .select('id')
      .lt('created_at', oneYearAgoISO)

    const messageIds = messagesToDelete?.map(msg => msg.id) || []

    // Delete related message_reads first (to avoid foreign key issues if they exist)
    if (messageIds.length > 0) {
      const { error: readsError } = await supabase
        .from('message_reads')
        .delete()
        .in('message_id', messageIds)

      if (readsError) {
        console.error('Error deleting message reads:', readsError)
        // Continue with deletion even if this fails, as message_reads might not exist
      } else {
        console.log('Successfully deleted related message reads')
      }
    }

    // Delete old messages
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .lt('created_at', oneYearAgoISO)

    if (deleteError) {
      console.error('Error deleting old messages:', deleteError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to delete old messages',
          details: deleteError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    console.log(`Successfully deleted ${messageCount} old messages`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully deleted ${messageCount} messages older than 1 year`,
        deletedCount: messageCount,
        cutoffDate: oneYearAgoISO
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Unexpected error in cleanup function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})