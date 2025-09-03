import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePushNotifications } from './usePushNotifications';

export const useNotificationProcessor = () => {
  const { user } = useAuth();
  const { sendNotification } = usePushNotifications();

  useEffect(() => {
    if (!user) return;

    // Function to process pending notifications
    const processNotifications = async () => {
      try {
        // Get unprocessed notifications for this user
        const { data: notifications, error } = await supabase
          .from('notification_queue')
          .select('*')
          .eq('recipient_id', user.id)
          .eq('processed', false)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        if (!notifications || notifications.length === 0) return;

        // Get sender profiles separately
        const senderIds = [...new Set(notifications.map(n => n.sender_id))];
        const { data: senders } = await supabase
          .from('profiles')
          .select('user_id, name, avatar_url')
          .in('user_id', senderIds);

        // Process each notification
        for (const notification of notifications) {
          try {
            const sender = senders?.find(s => s.user_id === notification.sender_id);
            const senderName = sender?.name || 'Någon';
            
            // For web testing - show toast notification instead of push
            if (!notification.processed) {
              console.log(`Push notification would be sent: ${senderName} - ${notification.message_content}`);
              
              // Notification would be shown
            }
            
            // Send push notification (only works on native)
            await sendNotification(
              user.id,
              `Nytt meddelande från ${senderName}`,
              notification.message_content,
              'message'
            );

            // Mark as processed
            await supabase
              .from('notification_queue')
              .update({ processed: true })
              .eq('id', notification.id);

          } catch (error) {
            console.error('Error processing notification:', notification.id, error);
          }
        }
      } catch (error) {
        console.error('Error in processNotifications:', error);
      }
    };

    // Process notifications immediately
    processNotifications();

    // Set up real-time listener for new notifications
    const channel = supabase
      .channel('notification_queue_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_queue',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          // Process the new notification
          processNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, sendNotification]);
};