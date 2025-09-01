import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender_profile?: {
    name: string;
    avatar_url: string;
  };
  receiver_profile?: {
    name: string;
    avatar_url: string;
  };
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  profile: {
    name: string;
    avatar_url: string;
    handicap: number;
    home_club: string;
    age: number | null;
  };
}

export const useFriends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchPendingRequests();
      fetchSentRequests();
      
      // Set up real-time subscription for profile updates
      const profilesChannel = supabase
        .channel('profiles-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles'
          },
          () => {
            // Refetch friends when any profile is updated
            fetchFriends();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(profilesChannel);
      };
    }
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;

    try {
      // Get accepted friendships where I'm the user
      const { data: myFriends, error: myError } = await supabase
        .from('friends')
        .select('id, friend_id')
        .eq('status', 'accepted')
        .eq('user_id', user.id);

      if (myError) throw myError;

      // Get accepted friendships where I'm the friend
      const { data: friendsOfMe, error: friendError } = await supabase
        .from('friends')
        .select('id, user_id')
        .eq('status', 'accepted')
        .eq('friend_id', user.id);

      if (friendError) throw friendError;

      // Get all friend IDs
      const friendIds = [
        ...(myFriends?.map(f => f.friend_id) || []),
        ...(friendsOfMe?.map(f => f.user_id) || [])
      ];

      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      // Get profiles for all friends
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url, handicap, home_club, age')
        .in('user_id', friendIds);

      if (profileError) throw profileError;

      const friendsList = profiles?.map(profile => ({
        id: myFriends?.find(f => f.friend_id === profile.user_id)?.id || 
            friendsOfMe?.find(f => f.user_id === profile.user_id)?.id || '',
        user_id: user.id,
        friend_id: profile.user_id,
        profile: {
          name: profile.name || 'Okänd användare',
          avatar_url: profile.avatar_url || '',
          handicap: profile.handicap || 0,
          home_club: profile.home_club || '',
          age: profile.age || null
        }
      })) || [];

      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const refreshFriends = () => {
    fetchFriends();
  };

  const fetchPendingRequests = async () => {
    if (!user) return;

    try {
      const { data: requests, error } = await supabase
        .from('friends')
        .select('id, user_id, friend_id, status, created_at')
        .eq('status', 'pending')
        .eq('friend_id', user.id);

      if (error) throw error;

      if (!requests || requests.length === 0) {
        setPendingRequests([]);
        return;
      }

      // Get sender profiles
      const senderIds = requests.map(r => r.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', senderIds);

      if (profileError) throw profileError;

      const requestsWithProfiles = requests.map(request => ({
        id: request.id,
        user_id: request.user_id,
        friend_id: request.friend_id,
        status: request.status as 'pending',
        created_at: request.created_at,
        sender_profile: {
          name: profiles?.find(p => p.user_id === request.user_id)?.name || 'Okänd användare',
          avatar_url: profiles?.find(p => p.user_id === request.user_id)?.avatar_url || ''
        }
      }));

      setPendingRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const fetchSentRequests = async () => {
    if (!user) return;

    try {
      const { data: requests, error } = await supabase
        .from('friends')
        .select('id, user_id, friend_id, status, created_at')
        .eq('status', 'pending')
        .eq('user_id', user.id);

      if (error) throw error;

      if (!requests || requests.length === 0) {
        setSentRequests([]);
        return;
      }

      // Get receiver profiles
      const receiverIds = requests.map(r => r.friend_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', receiverIds);

      if (profileError) throw profileError;

      const requestsWithProfiles = requests.map(request => ({
        id: request.id,
        user_id: request.user_id,
        friend_id: request.friend_id,
        status: request.status as 'pending',
        created_at: request.created_at,
        receiver_profile: {
          name: profiles?.find(p => p.user_id === request.friend_id)?.name || 'Okänd användare',
          avatar_url: profiles?.find(p => p.user_id === request.friend_id)?.avatar_url || ''
        }
      }));

      setSentRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Vänförfrågan skickad",
        description: "Din vänförfrågan har skickats framgångsrikt."
      });

      fetchSentRequests();
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Fel",
        description: "Kunde inte skicka vänförfrågan.",
        variant: "destructive"
      });
      return false;
    }
  };

  const acceptFriendRequest = async (requestId: string, senderId: string) => {
    if (!user) return;

    try {
      // Update the request status
      const { error: updateError } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create the reverse friendship
      const { error: insertError } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: senderId,
          status: 'accepted'
        });

      if (insertError) throw insertError;

      toast({
        title: "Vänförfrågan accepterad",
        description: "Ni är nu vänner!"
      });

      fetchFriends();
      fetchPendingRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Fel",
        description: "Kunde inte acceptera vänförfrågan.",
        variant: "destructive"
      });
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Vänförfrågan avvisad",
        description: "Förfrågan har avvisats."
      });

      fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast({
        title: "Fel",
        description: "Kunde inte avvisa vänförfrågan.",
        variant: "destructive"
      });
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Vän borttagen",
        description: "Vänskapet har avslutats."
      });

      fetchFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ta bort vännen.",
        variant: "destructive"
      });
    }
  };

  const removeFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Vänförfrågan borttagen",
        description: "Din skickade vänförfrågan har tagits bort."
      });

      fetchSentRequests();
    } catch (error) {
      console.error('Error removing friend request:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ta bort vänförfrågan.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    setLoading(false);
  }, [friends, pendingRequests, sentRequests]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    removeFriendRequest,
    refetch: () => {
      fetchFriends();
      fetchPendingRequests();
      fetchSentRequests();
    }
  };
};