export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          created_at: string
          updated_at: string | null
          phone: string | null
          avatar_url: string | null
          status: string | null
          status_updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          created_at?: string
          updated_at?: string | null
          phone?: string | null
          avatar_url?: string | null
          status?: string | null
          status_updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          created_at?: string
          updated_at?: string | null
          phone?: string | null
          avatar_url?: string | null
          status?: string | null
          status_updated_at?: string | null
        }
      }
      places: {
        Row: {
          id: string
          name: string
          google_place_id: string | null
          address: string | null
          lat: number | null
          lng: number | null
          created_at: string
          created_by: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          google_place_id?: string | null
          address?: string | null
          lat?: number | null
          lng?: number | null
          created_at?: string
          created_by: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          google_place_id?: string | null
          address?: string | null
          lat?: number | null
          lng?: number | null
          created_at?: string
          created_by?: string
          updated_at?: string | null
        }
      }
      check_ins: {
        Row: {
          id: string
          user_id: string
          place_id: string
          activity: string | null
          privacy_level: string
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          place_id: string
          activity?: string | null
          privacy_level?: string
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          place_id?: string
          activity?: string | null
          privacy_level?: string
          created_at?: string
          expires_at?: string | null
        }
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: string
          created_at: string
          updated_at: string | null
          hope_to_bump: boolean
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: string
          created_at?: string
          updated_at?: string | null
          hope_to_bump?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: string
          created_at?: string
          updated_at?: string | null
          hope_to_bump?: boolean
        }
      }
      meetups: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          place_id: string | null
          meetup_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          place_id?: string | null
          meetup_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          place_id?: string | null
          meetup_date?: string
          notes?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          notification_preferences: Json | null
          do_not_disturb: boolean
          do_not_disturb_until: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          notification_preferences?: Json | null
          do_not_disturb?: boolean
          do_not_disturb_until?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          notification_preferences?: Json | null
          do_not_disturb?: boolean
          do_not_disturb_until?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      privacy_level: 'public' | 'friends' | 'private'
      friend_status: 'pending' | 'accepted' | 'rejected'
    }
  }
} 