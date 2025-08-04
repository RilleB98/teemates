import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LatestMessage {
  content: string;
  created_at: string;
  user_id: string;
}

export const useLatestMessages = () => {
  const { user } = useAuth();
  const [latestMessages, setLatestMessages] = useState<Record<string, LatestMessage>>({});

  useEffect(() => {
    if (!user) {
      setLatestMessages({});
      return;
    }

    const fetchLatestMessages = async () => {
      try {
        // Get all accepted friends
        const { data: friends, error: friendsError } = await supabase
          .from('friends')
          .select('user_id, friend_id')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (friendsError) throw friendsError;

        const latestMsgs: Record<string, LatestMessage> = {};

        // For each friend, get the latest message in their chat
        for (const friend of friends || []) {
          const friendId = friend.user_id === user.id ? friend.friend_id : friend.user_id;
          const chatRoomId = user.id < friendId ? `${user.id}_${friendId}` : `${friendId}_${user.id}`;

          // Get the latest message from this chat
          const { data: message, error: messageError } = await supabase
            .from('messages')
            .select('content, created_at, user_id')
            .eq('chat_room_id', chatRoomId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (messageError && messageError.code !== 'PGRST116') {
            console.error('Error fetching latest message for friend:', friendId, messageError);
            continue;
          }

          if (message) {
            latestMsgs[friendId] = message;
          }
        }

        setLatestMessages(latestMsgs);
      } catch (error) {
        console.error('Error fetching latest messages:', error);
        setLatestMessages({});
      }
    };

    fetchLatestMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('latest-messages-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refetch when new messages arrive
          fetchLatestMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return latestMessages;
};