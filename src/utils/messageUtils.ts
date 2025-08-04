import { supabase } from '@/integrations/supabase/client';

export const markMessagesAsRead = async (messageIds: string[], userId: string) => {
  if (!messageIds.length || !userId) return;

  try {
    // Insert read records for all message IDs
    // Use upsert to avoid conflicts if already marked as read
    const readRecords = messageIds.map(messageId => ({
      user_id: userId,
      message_id: messageId
    }));

    const { error } = await supabase
      .from('message_reads')
      .upsert(readRecords, { 
        onConflict: 'user_id,message_id',
        ignoreDuplicates: true 
      });

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
  }
};