import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Function to fetch unread message count
    const fetchUnreadCount = async () => {
      try {
        // Get all private chat rooms for this user
        const { data: friends, error: friendsError } = await supabase
          .from('friends')
          .select('user_id, friend_id')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (friendsError) throw friendsError;

        // Generate all possible chat room IDs for this user
        const chatRoomIds = friends?.map(friend => {
          const otherUserId = friend.user_id === user.id ? friend.friend_id : friend.user_id;
          return user.id < otherUserId ? `${user.id}_${otherUserId}` : `${otherUserId}_${user.id}`;
        }) || [];

        if (chatRoomIds.length === 0) {
          setUnreadCount(0);
          return;
        }

        // Get messages from others in all chat rooms
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('id, user_id, chat_room_id')
          .in('chat_room_id', chatRoomIds)
          .neq('user_id', user.id); // Only messages from others

        if (messagesError) throw messagesError;

        if (!messages || messages.length === 0) {
          setUnreadCount(0);
          return;
        }

        // Get read status for these messages
        const messageIds = messages.map(m => m.id);
        const { data: readMessages, error: readError } = await supabase
          .from('message_reads')
          .select('message_id')
          .eq('user_id', user.id)
          .in('message_id', messageIds);

        if (readError) throw readError;

        // Calculate unread count
        const readMessageIds = new Set(readMessages?.map(r => r.message_id) || []);
        const unreadMessages = messages.filter(m => !readMessageIds.has(m.id));
        
        setUnreadCount(unreadMessages.length);
      } catch (error) {
        console.error('Error fetching unread message count:', error);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();

    // Set up real-time subscription to update count when new messages arrive or are marked as read
    const channel = supabase
      .channel('message-count-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          // If the new message is not from the current user, refetch count
          if (payload.new.user_id !== user.id) {
            fetchUnreadCount();
          }
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
          // If the current user marked a message as read, refetch count
          if (payload.new.user_id === user.id) {
            fetchUnreadCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return unreadCount;
};