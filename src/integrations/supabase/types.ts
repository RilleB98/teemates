export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_room_members: {
        Row: {
          chat_room_id: string
          id: string
          user_id: string
        }
        Insert: {
          chat_room_id: string
          id?: string
          user_id: string
        }
        Update: {
          chat_room_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_golf_courses: {
        Row: {
          created_at: string
          golf_course_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          golf_course_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          golf_course_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      golf_courses: {
        Row: {
          created_at: string
          id: string
          image: string
          latitude: number
          location: string
          longitude: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string
          latitude?: number
          location: string
          longitude?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string
          latitude?: number
          location?: string
          longitude?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_chat_members: {
        Row: {
          added_at: string
          added_by: string
          group_chat_id: string
          id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          added_by: string
          group_chat_id: string
          id?: string
          user_id: string
        }
        Update: {
          added_at?: string
          added_by?: string
          group_chat_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_chat_members_group_chat_id_fkey"
            columns: ["group_chat_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      group_chats: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_reads: {
        Row: {
          created_at: string
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_room_id: string
          content: string
          created_at: string
          id: string
          sender_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_room_id: string
          content: string
          created_at?: string
          id?: string
          sender_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_room_id?: string
          content?: string
          created_at?: string
          id?: string
          sender_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          created_at: string | null
          id: string
          message_content: string
          notification_type: string
          processed: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_content: string
          notification_type?: string
          processed?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_content?: string
          notification_type?: string
          processed?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string
          gender: string | null
          golf_id: string | null
          handicap: number | null
          home_city: string | null
          home_club: string | null
          id: string
          last_location: Json | null
          last_swipe_reset: string | null
          location_enabled: boolean | null
          manual_premium: boolean
          name: string | null
          push_token: string | null
          selected_course: Json | null
          swipes_today: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          gender?: string | null
          golf_id?: string | null
          handicap?: number | null
          home_city?: string | null
          home_club?: string | null
          id?: string
          last_location?: Json | null
          last_swipe_reset?: string | null
          location_enabled?: boolean | null
          manual_premium?: boolean
          name?: string | null
          push_token?: string | null
          selected_course?: Json | null
          swipes_today?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          gender?: string | null
          golf_id?: string | null
          handicap?: number | null
          home_city?: string | null
          home_club?: string | null
          id?: string
          last_location?: Json | null
          last_swipe_reset?: string | null
          location_enabled?: boolean | null
          manual_premium?: boolean
          name?: string | null
          push_token?: string | null
          selected_course?: Json | null
          swipes_today?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      round_suggestion_participants: {
        Row: {
          created_at: string
          id: string
          round_suggestion_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          round_suggestion_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          round_suggestion_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_round_participants_suggestion"
            columns: ["round_suggestion_id"]
            isOneToOne: false
            referencedRelation: "round_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      round_suggestions: {
        Row: {
          created_at: string
          golf_course_id: string
          group_chat_id: string | null
          id: string
          max_players: number | null
          message: string | null
          suggested_date: string
          suggested_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          golf_course_id: string
          group_chat_id?: string | null
          id?: string
          max_players?: number | null
          message?: string | null
          suggested_date: string
          suggested_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          golf_course_id?: string
          group_chat_id?: string | null
          id?: string
          max_players?: number | null
          message?: string | null
          suggested_date?: string
          suggested_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_round_suggestions_golf_course"
            columns: ["golf_course_id"]
            isOneToOne: false
            referencedRelation: "golf_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_round_suggestions_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "round_suggestions_group_chat_id_fkey"
            columns: ["group_chat_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      user_photos: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_main_photo: boolean
          photo_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_main_photo?: boolean
          photo_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_main_photo?: boolean
          photo_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_swipe_counts: {
        Row: {
          created_at: string
          id: string
          last_reset_date: string
          swipe_count: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_reset_date?: string
          swipe_count?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_reset_date?: string
          swipe_count?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_swipes: {
        Row: {
          created_at: string
          id: string
          swipe_direction: string
          target_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          swipe_direction: string
          target_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          swipe_direction?: string
          target_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tokens: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform: string
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_chat_room: {
        Args: { _chat_room_id: string; _user_id: string }
        Returns: boolean
      }
      generate_chat_room_id: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      get_admin_user_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_profiles: number
          incomplete_profiles: number
          total_users: number
        }[]
      }
      get_golf_club_user_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          home_club: string
          user_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_group_chat_member: {
        Args: { _group_chat_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_chat_id: string; _user_id: string }
        Returns: boolean
      }
      is_user_group_member: {
        Args: { _group_chat_id: string; _user_id: string }
        Returns: boolean
      }
      search_profiles_by_golf_id: {
        Args: { search_golf_id: string }
        Returns: {
          avatar_url: string
          golf_id: string
          handicap: number
          home_club: string
          name: string
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
