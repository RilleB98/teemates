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

    console.log('Starting cleanup of inactive and single-member group chats...')

    let totalDeletedCount = 0

    // First: Clean up group chats with only 1 member
    console.log('Step 1: Checking for group chats with only 1 member...')
    
    const { data: singleMemberGroups, error: singleMemberError } = await supabase
      .from('group_chat_members')
      .select('group_chat_id, group_chats!inner(name)')
      .group('group_chat_id')
      .having('count(*) = 1')

    if (singleMemberError) {
      console.error('Error finding single member groups:', singleMemberError)
    } else {
      console.log(`Found ${singleMemberGroups?.length || 0} group chats with only 1 member`)
      
      for (const group of singleMemberGroups || []) {
        console.log(`Deleting single-member group: ${group.group_chats.name}`)
        
        const chatRoomId = `group_${group.group_chat_id}`
        
        // Delete messages
        await supabase.from('messages').delete().eq('chat_room_id', chatRoomId)
        
        // Delete members
        await supabase.from('group_chat_members').delete().eq('group_chat_id', group.group_chat_id)
        
        // Delete group chat
        await supabase.from('group_chats').delete().eq('id', group.group_chat_id)
        
        totalDeletedCount++
        console.log(`Successfully deleted single-member group: ${group.group_chats.name}`)
      }
    }

    // Second: Clean up inactive group chats (1 month old)
    console.log('Step 2: Checking for inactive group chats...')
    
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    console.log(`Cutoff date: ${oneMonthAgo.toISOString()}`)

    // Get remaining group chats
    const { data: groupChats, error: groupChatsError } = await supabase
      .from('group_chats')
      .select('id, name, created_at')

    if (groupChatsError) {
      console.error('Error fetching group chats:', groupChatsError)
      throw groupChatsError
    }

    console.log(`Found ${groupChats?.length || 0} group chats to check for inactivity`)

    let inactiveDeletedCount = 0

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

        inactiveDeletedCount++
        totalDeletedCount++
        console.log(`Successfully deleted inactive group chat: ${groupChat.name}`)
      }
    }

    console.log(`Cleanup completed. Total deleted: ${totalDeletedCount} group chats (${totalDeletedCount - inactiveDeletedCount} single-member, ${inactiveDeletedCount} inactive)`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cleanup completed. Total deleted: ${totalDeletedCount} group chats (${totalDeletedCount - inactiveDeletedCount} single-member, ${inactiveDeletedCount} inactive)`,
        totalDeleted: totalDeletedCount,
        singleMemberDeleted: totalDeletedCount - inactiveDeletedCount,
        inactiveDeleted: inactiveDeletedCount
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