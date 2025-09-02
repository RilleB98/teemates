import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting cleanup of inactive group chats...')

    // Calculate the cutoff date (1 month ago)
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    console.log(`Cutoff date: ${oneMonthAgo.toISOString()}`)

    // Get all group chats
    const { data: groupChats, error: groupChatsError } = await supabase
      .from('group_chats')
      .select('id, name, created_at')

    if (groupChatsError) {
      console.error('Error fetching group chats:', groupChatsError)
      throw groupChatsError
    }

    console.log(`Found ${groupChats?.length || 0} group chats to check`)

    let deletedCount = 0

    for (const groupChat of groupChats || []) {
      console.log(`Checking group chat: ${groupChat.name} (${groupChat.id})`)
      
      // Get the latest message for this group chat
      const chatRoomId = `group_${groupChat.id}`
      const { data: latestMessages, error: messagesError } = await supabase
        .from('messages')
        .select('created_at')
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (messagesError) {
        console.error(`Error fetching messages for group ${groupChat.id}:`, messagesError)
        continue
      }

      let shouldDelete = false
      
      if (!latestMessages || latestMessages.length === 0) {
        // No messages at all, check if group was created more than 1 month ago
        const groupCreatedAt = new Date(groupChat.created_at)
        shouldDelete = groupCreatedAt < oneMonthAgo
        console.log(`No messages found. Group created: ${groupCreatedAt.toISOString()}, should delete: ${shouldDelete}`)
      } else {
        // Check if latest message is older than 1 month
        const latestMessageDate = new Date(latestMessages[0].created_at)
        shouldDelete = latestMessageDate < oneMonthAgo
        console.log(`Latest message: ${latestMessageDate.toISOString()}, should delete: ${shouldDelete}`)
      }

      if (shouldDelete) {
        console.log(`Deleting inactive group chat: ${groupChat.name}`)
        
        // Delete group chat members first (due to foreign key constraints)
        const { error: deleteMembersError } = await supabase
          .from('group_chat_members')
          .delete()
          .eq('group_chat_id', groupChat.id)

        if (deleteMembersError) {
          console.error(`Error deleting members for group ${groupChat.id}:`, deleteMembersError)
          continue
        }

        // Delete messages for this group chat
        const { error: deleteMessagesError } = await supabase
          .from('messages')
          .delete()
          .eq('chat_room_id', chatRoomId)

        if (deleteMessagesError) {
          console.error(`Error deleting messages for group ${groupChat.id}:`, deleteMessagesError)
          continue
        }

        // Delete the group chat itself
        const { error: deleteGroupError } = await supabase
          .from('group_chats')
          .delete()
          .eq('id', groupChat.id)

        if (deleteGroupError) {
          console.error(`Error deleting group chat ${groupChat.id}:`, deleteGroupError)
          continue
        }

        deletedCount++
        console.log(`Successfully deleted group chat: ${groupChat.name}`)
      }
    }

    console.log(`Cleanup completed. Deleted ${deletedCount} inactive group chats.`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cleanup completed. Deleted ${deletedCount} inactive group chats.`,
        deletedCount 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in cleanup function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})