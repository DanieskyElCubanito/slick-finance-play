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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          login_hash: string
          telegram_id: number
          token_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          login_hash: string
          telegram_id: number
          token_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          login_hash?: string
          telegram_id?: number
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "telegram_admin_roles"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      economy_proposals: {
        Row: {
          created_at: string
          goal: string
          id: string
          model: string
          proposal: Json | null
          status: string
          telegram_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          goal: string
          id?: string
          model: string
          proposal?: Json | null
          status?: string
          telegram_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          goal?: string
          id?: string
          model?: string
          proposal?: Json | null
          status?: string
          telegram_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "economy_proposals_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "telegram_admin_roles"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      game_events: {
        Row: {
          action: string
          carrot_delta: number
          coin_delta: number
          created_at: string
          id: string
          resulting_version: number
          telegram_id: number
          updated_at: string
        }
        Insert: {
          action: string
          carrot_delta: number
          coin_delta: number
          created_at?: string
          id: string
          resulting_version: number
          telegram_id: number
          updated_at?: string
        }
        Update: {
          action?: string
          carrot_delta?: number
          coin_delta?: number
          created_at?: string
          id?: string
          resulting_version?: number
          telegram_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_events_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "player_profiles"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      player_games: {
        Row: {
          created_at: string
          state: Json
          telegram_id: number
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          state: Json
          telegram_id: number
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          state?: Json
          telegram_id?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_games_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "player_profiles"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      player_profiles: {
        Row: {
          created_at: string
          display_name: string
          photo_url: string | null
          preferences: Json
          telegram_id: number
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          photo_url?: string | null
          preferences?: Json
          telegram_id: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          photo_url?: string | null
          preferences?: Json
          telegram_id?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      player_sessions: {
        Row: {
          created_at: string
          expires_at: string
          login_hash: string
          telegram_id: number
          token_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          login_hash: string
          telegram_id: number
          token_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          login_hash?: string
          telegram_id?: number
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_sessions_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "player_profiles"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      telegram_admin_roles: {
        Row: {
          created_at: string
          role: string
          telegram_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          role?: string
          telegram_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          role?: string
          telegram_id?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      commit_game_action: {
        Args: {
          p_action: string
          p_carrots: number
          p_coins: number
          p_event: string
          p_player: number
          p_state: Json
          p_version: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
