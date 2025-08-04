import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useUnreadMessagesByFriend = () => {
  const { user } = useAuth();
  const [unreadByFriend, setUnreadByFriend] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) {
      setUnreadByFriend({});
      return;
    }

    const fetchUnreadByFriend = async () => {
      try {
        // Get all accepted friends
        const { data: friends, error: friendsError } = await supabase
          .from('friends')
          .select('user_id, friend_id')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (friendsError) throw friendsError;

        const unreadCounts: Record<string, number> = {};

        // For each friend, check unread messages
        for (const friend of friends || []) {
          const friendId = friend.user_id === user.id ? friend.friend_id : friend.user_id;
          const chatRoomId = user.id < friendId ? `${user.id}_${friendId}` : `${friendId}_${user.id}`;

          // Get messages from this friend in this chat
          const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('id')
            .eq('chat_room_id', chatRoomId)
            .eq('user_id', friendId); // Only messages from this friend

          if (messagesError) {
            console.error('Error fetching messages for friend:', friendId, messagesError);
            continue;
          }

          if (!messages || messages.length === 0) {
            unreadCounts[friendId] = 0;
            continue;
          }

          // Check which of these messages are read by current user
          const messageIds = messages.map(m => m.id);
          const { data: readMessages, error: readError } = await supabase
            .from('message_reads')
            .select('message_id')
            .eq('user_id', user.id)
            .in('message_id', messageIds);

          if (readError) {
            console.error('Error fetching read status for friend:', friendId, readError);
            continue;
          }

          const readMessageIds = new Set(readMessages?.map(r => r.message_id) || []);
          const unreadCount = messages.filter(m => !readMessageIds.has(m.id)).length;
          unreadCounts[friendId] = unreadCount;
        }

        setUnreadByFriend(unreadCounts);
      } catch (error) {
        console.error('Error fetching unread messages by friend:', error);
        setUnreadByFriend({});
      }
    };

    fetchUnreadByFriend();

    // Set up real-time subscription for message updates
    const channel = supabase
      .channel('unread-by-friend-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refetch when new messages arrive
          fetchUnreadByFriend();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reads'
        },
        (payload) => {
          // Update when messages are marked as read
          if (payload.new.user_id === user.id) {
            fetchUnreadByFriend();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return unreadByFriend;
};