export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      criteria: {
        Row: {
          created_at: string
          decision_id: string
          id: string
          name: string
          weight: number
        }
        Insert: {
          created_at?: string
          decision_id: string
          id?: string
          name: string
          weight?: number
        }
        Update: {
          created_at?: string
          decision_id?: string
          id?: string
          name?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "criteria_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          ai_recommendation: string | null
          created_at: string
          deadline: string | null
          description: string | null
          favorite_option: string | null
          id: string
          notes: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_recommendation?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          favorite_option?: string | null
          id?: string
          notes?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_recommendation?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          favorite_option?: string | null
          id?: string
          notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          created_at: string
          criterion_id: string
          decision_id: string
          id: string
          option_id: string
          score: number
        }
        Insert: {
          created_at?: string
          criterion_id: string
          decision_id: string
          id?: string
          option_id: string
          score: number
        }
        Update: {
          created_at?: string
          criterion_id?: string
          decision_id?: string
          id?: string
          option_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
        ]
      }
      melodies: {
        Row: {
          bpm: number
          created_at: string
          description: string | null
          genre: string | null
          id: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bpm?: number
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bpm?: number
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      melody_notes: {
        Row: {
          created_at: string
          duration: number
          id: string
          melody_id: string
          note: number
          start: number
          updated_at: string
          velocity: number
        }
        Insert: {
          created_at?: string
          duration: number
          id?: string
          melody_id: string
          note: number
          start: number
          updated_at?: string
          velocity?: number
        }
        Update: {
          created_at?: string
          duration?: number
          id?: string
          melody_id?: string
          note?: number
          start?: number
          updated_at?: string
          velocity?: number
        }
        Relationships: [
          {
            foreignKeyName: "melody_notes_melody_id_fkey"
            columns: ["melody_id"]
            isOneToOne: false
            referencedRelation: "melodies"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          created_at: string
          decision_id: string
          description: string | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          decision_id: string
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          decision_id?: string
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      track_notes: {
        Row: {
          created_at: string
          duration: number
          id: string
          note: number
          start: number
          track_id: string
          updated_at: string
          velocity: number
        }
        Insert: {
          created_at?: string
          duration: number
          id?: string
          note: number
          start: number
          track_id: string
          updated_at?: string
          velocity?: number
        }
        Update: {
          created_at?: string
          duration?: number
          id?: string
          note?: number
          start?: number
          track_id?: string
          updated_at?: string
          velocity?: number
        }
        Relationships: [
          {
            foreignKeyName: "track_notes_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          created_at: string
          id: string
          instrument: string
          mute: boolean
          pan: number
          solo: boolean
          title: string
          updated_at: string
          user_id: string | null
          volume: number
        }
        Insert: {
          created_at?: string
          id?: string
          instrument?: string
          mute?: boolean
          pan?: number
          solo?: boolean
          title: string
          updated_at?: string
          user_id?: string | null
          volume?: number
        }
        Update: {
          created_at?: string
          id?: string
          instrument?: string
          mute?: boolean
          pan?: number
          solo?: boolean
          title?: string
          updated_at?: string
          user_id?: string | null
          volume?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
