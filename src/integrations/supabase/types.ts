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
      attendance_records: {
        Row: {
          created_at: string
          date: string
          id: string
          marked_at: string | null
          modification_id: string | null
          status: string
          student_id: string
          timetable_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          marked_at?: string | null
          modification_id?: string | null
          status: string
          student_id: string
          timetable_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          marked_at?: string | null
          modification_id?: string | null
          status?: string
          student_id?: string
          timetable_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_modification_id_fkey"
            columns: ["modification_id"]
            isOneToOne: false
            referencedRelation: "class_modifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_timetable_id_fkey"
            columns: ["timetable_id"]
            isOneToOne: false
            referencedRelation: "timetable"
            referencedColumns: ["id"]
          },
        ]
      }
      class_modifications: {
        Row: {
          created_at: string | null
          id: string
          modification_type: string
          notes: string | null
          original_date: string
          original_timetable_id: string
          rescheduled_date: string | null
          rescheduled_end_time: string | null
          rescheduled_room: string | null
          rescheduled_start_time: string | null
          student_id: string
          swapped_with_timetable_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          modification_type: string
          notes?: string | null
          original_date: string
          original_timetable_id: string
          rescheduled_date?: string | null
          rescheduled_end_time?: string | null
          rescheduled_room?: string | null
          rescheduled_start_time?: string | null
          student_id: string
          swapped_with_timetable_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          modification_type?: string
          notes?: string | null
          original_date?: string
          original_timetable_id?: string
          rescheduled_date?: string | null
          rescheduled_end_time?: string | null
          rescheduled_room?: string | null
          rescheduled_start_time?: string | null
          student_id?: string
          swapped_with_timetable_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_modifications_original_timetable_id_fkey"
            columns: ["original_timetable_id"]
            isOneToOne: false
            referencedRelation: "timetable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_modifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_modifications_swapped_with_timetable_id_fkey"
            columns: ["swapped_with_timetable_id"]
            isOneToOne: false
            referencedRelation: "timetable"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          batch: string | null
          branch: string | null
          college_id: string
          created_at: string
          full_name: string
          id: string
          roll_number: string | null
          section: string | null
          semester: number | null
          updated_at: string
          year: number | null
        }
        Insert: {
          avatar_url?: string | null
          batch?: string | null
          branch?: string | null
          college_id: string
          created_at?: string
          full_name: string
          id: string
          roll_number?: string | null
          section?: string | null
          semester?: number | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          avatar_url?: string | null
          batch?: string | null
          branch?: string | null
          college_id?: string
          created_at?: string
          full_name?: string
          id?: string
          roll_number?: string | null
          section?: string | null
          semester?: number | null
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      timetable: {
        Row: {
          class_type: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          professor_name: string
          room: string | null
          section: string
          start_time: string
          subject_code: string
          subject_name: string
          updated_at: string
        }
        Insert: {
          class_type: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          professor_name: string
          room?: string | null
          section: string
          start_time: string
          subject_code: string
          subject_name: string
          updated_at?: string
        }
        Update: {
          class_type?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          professor_name?: string
          room?: string | null
          section?: string
          start_time?: string
          subject_code?: string
          subject_name?: string
          updated_at?: string
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
    Enums: {},
  },
} as const
