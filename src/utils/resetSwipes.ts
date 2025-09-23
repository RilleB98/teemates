import { supabase } from "@/integrations/supabase/client";

export const resetSwipesForUsers = async (targetUserIds: string[]) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      'https://fzhmvraztypgemyrguxw.supabase.co/functions/v1/reset-swipes',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserIds
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to reset swipes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error resetting swipes:', error);
    throw error;
  }
};