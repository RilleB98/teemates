import { useEffect } from 'react';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log('🚀 usePushNotifications: Starting initialization');
    console.log('📱 Is native platform:', Capacitor.isNativePlatform());
    console.log('👤 User exists:', !!user);
    
    if (!Capacitor.isNativePlatform() || !user) {
      console.log('❌ Skipping push notifications - not native platform or no user');
      return;
    }

    const initializePushNotifications = async () => {
      try {
        console.log('🔔 Requesting push notification permissions...');
        // Request permission to use push notifications
        // iOS will prompt user and return if they granted permission or not
        // Android will just grant without prompting
        const permStatus = await PushNotifications.requestPermissions();
        console.log('📋 Permission status:', permStatus);
        
        if (permStatus.receive === 'granted') {
          console.log('✅ Permission granted, registering...');
          // Register with Apple / Google to receive push via APNS/FCM
          await PushNotifications.register();
        } else {
          console.log('❌ Push notification permission denied');
        }
      } catch (error) {
        console.error('❌ Error initializing push notifications:', error);
      }
    };

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('🔔 Push registration success, token: ' + token.value);
      
      // Store the token in the user's profile for sending notifications
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({ 
            user_id: user.id, 
            push_token: token.value 
          });
        
        if (error) {
          console.error('❌ Error storing push token:', error);
        } else {
          console.log('✅ Push token saved successfully for user:', user.id);
        }
      } catch (error) {
        console.error('❌ Error storing push token:', error);
      }
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      toast({
        title: notification.title || 'Ny notifikation',
        description: notification.body,
      });
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push notification action performed: ' + JSON.stringify(notification));
      
      // Handle navigation based on notification data
      const data = notification.notification.data;
      if (data?.type === 'friend_request') {
        // Navigate to friends page
        window.location.href = '/friends';
      } else if (data?.type === 'message') {
        // Navigate to messages page
        window.location.href = '/messages';
      }
    });

    initializePushNotifications();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user]);

  const sendNotification = async (recipientId: string, title: string, body: string, type: 'message' | 'friend_request') => {
    try {
      // Get recipient's push token
      const { data: profile } = await supabase
        .from('profiles')
        .select('push_token')
        .eq('user_id', recipientId)
        .single();

      if (!profile?.push_token) {
        console.log('No push token found for recipient');
        return;
      }

      // Send notification via edge function
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          token: profile.push_token,
          title,
          body,
          data: { type }
        }
      });

      if (error) {
        console.error('Error sending push notification:', error);
      }
    } catch (error) {
      console.error('Error in sendNotification:', error);
    }
  };

  return { sendNotification };
};