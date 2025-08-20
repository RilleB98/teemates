import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface GroupChat {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupChatMember {
  id: string;
  group_chat_id: string;
  user_id: string;
  added_by: string;
  added_at: string;
  profile?: {
    name: string;
    avatar_url?: string;
  };
}

export const useGroupChats = () => {
  const { user } = useAuth();
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroupChats = async () => {
    if (!user) {
      setGroupChats([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('group_chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setGroupChats(data || []);
    } catch (error) {
      console.error('Error fetching group chats:', error);
      setGroupChats([]);
    } finally {
      setLoading(false);
    }
  };

  const createGroupChat = async (name: string, memberIds: string[]) => {
    if (!user) return null;

    try {
      // Create the group chat
      const { data: groupChat, error: groupError } = await supabase
        .from('group_chats')
        .insert({
          name,
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add the creator as a member
      const membersToAdd = [user.id, ...memberIds].map(userId => ({
        group_chat_id: groupChat.id,
        user_id: userId,
        added_by: user.id
      }));

      const { error: membersError } = await supabase
        .from('group_chat_members')
        .insert(membersToAdd);

      if (membersError) throw membersError;

      await fetchGroupChats();
      return groupChat;
    } catch (error) {
      console.error('Error creating group chat:', error);
      return null;
    }
  };

  const addMemberToGroup = async (groupChatId: string, userId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('group_chat_members')
        .insert({
          group_chat_id: groupChatId,
          user_id: userId,
          added_by: user.id
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding member to group:', error);
      return false;
    }
  };

  const getGroupMembers = async (groupChatId: string) => {
    try {
      // First get the members
      const { data: members, error: membersError } = await supabase
        .from('group_chat_members')
        .select('*')
        .eq('group_chat_id', groupChatId);

      if (membersError) throw membersError;

      if (!members || members.length === 0) return [];

      // Then get their profiles
      const userIds = members.map(m => m.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      return members.map(member => ({
        ...member,
        profile: profiles?.find(p => p.user_id === member.user_id) || undefined
      })) as GroupChatMember[];
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  };

  const removeMemberFromGroup = async (groupChatId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('group_chat_members')
        .delete()
        .eq('group_chat_id', groupChatId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing member from group:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchGroupChats();

    // Set up real-time subscription
    const channel = supabase
      .channel('group-chats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_chats'
        },
        () => {
          fetchGroupChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    groupChats,
    loading,
    createGroupChat,
    addMemberToGroup,
    getGroupMembers,
    removeMemberFromGroup,
    refetch: fetchGroupChats
  };
};