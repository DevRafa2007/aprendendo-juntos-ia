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
      courses: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration: number | null
          id: string
          image_url: string | null
          instructor_id: string
          level: string | null
          price: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          image_url?: string | null
          instructor_id: string
          level?: string | null
          price?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          image_url?: string | null
          instructor_id?: string
          level?: string | null
          price?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed: boolean | null
          course_id: string
          enrolled_at: string
          id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_progress_sync: {
        Row: {
          id: string
          user_id: string
          content_id: string
          progress_percent: number
          completed: boolean
          last_position: Json | null
          created_at: string
          updated_at: string
          last_synced_at: string
          version: number
          client_timestamp: number | null
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          progress_percent?: number
          completed?: boolean
          last_position?: Json | null
          created_at?: string
          updated_at?: string
          last_synced_at?: string
          version?: number
          client_timestamp?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          progress_percent?: number
          completed?: boolean
          last_position?: Json | null
          created_at?: string
          updated_at?: string
          last_synced_at?: string
          version?: number
          client_timestamp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_sync_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_sync_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          }
        ]
      }
      content_interactions: {
        Row: {
          id: string
          user_id: string
          content_id: string
          interaction_type: string
          interaction_data: Json | null
          created_at: string
          client_timestamp: number | null
          synced: boolean
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          interaction_type: string
          interaction_data?: Json | null
          created_at?: string
          client_timestamp?: number | null
          synced?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          interaction_type?: string
          interaction_data?: Json | null
          created_at?: string
          client_timestamp?: number | null
          synced?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "content_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_interactions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          }
        ]
      }
      sync_queue: {
        Row: {
          id: string
          user_id: string
          queue_type: string
          payload: Json
          status: string
          error_message: string | null
          retry_count: number
          created_at: string
          updated_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          queue_type: string
          payload: Json
          status?: string
          error_message?: string | null
          retry_count?: number
          created_at?: string
          updated_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          queue_type?: string
          payload?: Json
          status?: string
          error_message?: string | null
          retry_count?: number
          created_at?: string
          updated_at?: string
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          device_info: string | null
          last_activity: string
          is_online: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          device_info?: string | null
          last_activity?: string
          is_online?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          device_info?: string | null
          last_activity?: string
          is_online?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      course_reviews: {
        Row: {
          id: string
          course_id: string
          user_id: string
          rating: number
          title: string
          comment: string
          created_at: string
          updated_at: string
          is_verified: boolean
          is_featured: boolean
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          rating: number
          title: string
          comment: string
          created_at?: string
          updated_at?: string
          is_verified?: boolean
          is_featured?: boolean
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          rating?: number
          title?: string
          comment?: string
          created_at?: string
          updated_at?: string
          is_verified?: boolean
          is_featured?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      review_comments: {
        Row: {
          id: string
          review_id: string
          user_id: string
          parent_id: string | null
          comment: string
          created_at: string
          updated_at: string
          is_deleted: boolean
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          parent_id?: string | null
          comment: string
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          parent_id?: string | null
          comment?: string
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "review_comments_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "course_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "review_comments"
            referencedColumns: ["id"]
          }
        ]
      }
      review_reactions: {
        Row: {
          id: string
          review_id: string
          user_id: string
          reaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          reaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          reaction_type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reactions_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "course_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      review_reports: {
        Row: {
          id: string
          review_id: string | null
          comment_id: string | null
          reporter_id: string
          reason: string
          details: string | null
          status: string
          created_at: string
          updated_at: string
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          review_id?: string | null
          comment_id?: string | null
          reporter_id: string
          reason: string
          details?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: string
          review_id?: string | null
          comment_id?: string | null
          reporter_id?: string
          reason?: string
          details?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "course_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "review_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      course_review_metrics: {
        Row: {
          course_id: string
          total_reviews: number
          avg_rating: number
          rating_counts: Json
          last_updated: string
        }
        Insert: {
          course_id: string
          total_reviews?: number
          avg_rating?: number
          rating_counts?: Json
          last_updated?: string
        }
        Update: {
          course_id?: string
          total_reviews?: number
          avg_rating?: number
          rating_counts?: Json
          last_updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_review_metrics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
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
