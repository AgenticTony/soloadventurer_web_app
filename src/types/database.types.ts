export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      activities: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean | null
          is_location_specific: boolean | null
          location_restriction: unknown
          name: string
          sort_order: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_location_specific?: boolean | null
          location_restriction?: unknown
          name: string
          sort_order?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_location_specific?: boolean | null
          location_restriction?: unknown
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'blocks_blocked_id_fkey'
            columns: ['blocked_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'blocks_blocked_id_fkey'
            columns: ['blocked_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'blocks_blocker_id_fkey'
            columns: ['blocker_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'blocks_blocker_id_fkey'
            columns: ['blocker_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      check_ins: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          meetup_checkin_id: string | null
          scheduled_at: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          meetup_checkin_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          meetup_checkin_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_check_ins_meetup_checkin'
            columns: ['meetup_checkin_id']
            isOneToOne: false
            referencedRelation: 'meetup_checkins'
            referencedColumns: ['id']
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          journal_id: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          journal_id: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          journal_id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comments_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'comments_journal_id_fkey'
            columns: ['journal_id']
            isOneToOne: false
            referencedRelation: 'journals'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'comments'
            referencedColumns: ['id']
          },
        ]
      }
      connections: {
        Row: {
          activity_id: string | null
          created_at: string
          id: string
          overlap_days: number | null
          overlap_end_date: string | null
          overlap_start_date: string | null
          recipient_id: string
          recipient_trip_id: string | null
          requester_id: string
          requester_trip_id: string | null
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          activity_id?: string | null
          created_at?: string
          id?: string
          overlap_days?: number | null
          overlap_end_date?: string | null
          overlap_start_date?: string | null
          recipient_id: string
          recipient_trip_id?: string | null
          requester_id: string
          requester_trip_id?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          activity_id?: string | null
          created_at?: string
          id?: string
          overlap_days?: number | null
          overlap_end_date?: string | null
          overlap_start_date?: string | null
          recipient_id?: string
          recipient_trip_id?: string | null
          requester_id?: string
          requester_trip_id?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'connections_recipient_trip_id_fkey'
            columns: ['recipient_trip_id']
            isOneToOne: false
            referencedRelation: 'trip_summaries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'connections_recipient_trip_id_fkey'
            columns: ['recipient_trip_id']
            isOneToOne: false
            referencedRelation: 'trips'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'connections_requester_trip_id_fkey'
            columns: ['requester_trip_id']
            isOneToOne: false
            referencedRelation: 'trip_summaries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'connections_requester_trip_id_fkey'
            columns: ['requester_trip_id']
            isOneToOne: false
            referencedRelation: 'trips'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_connections_activity'
            columns: ['activity_id']
            isOneToOne: false
            referencedRelation: 'activities'
            referencedColumns: ['id']
          },
        ]
      }
      content_privacy_settings: {
        Row: {
          allow_comments_from: Database['public']['Enums']['comment_permission']
          allow_reshares: boolean
          created_at: string
          default_post_audience: Database['public']['Enums']['content_audience']
          id: string
          include_in_destination_feed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_comments_from?: Database['public']['Enums']['comment_permission']
          allow_reshares?: boolean
          created_at?: string
          default_post_audience?: Database['public']['Enums']['content_audience']
          id?: string
          include_in_destination_feed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_comments_from?: Database['public']['Enums']['comment_permission']
          allow_reshares?: boolean
          created_at?: string
          default_post_audience?: Database['public']['Enums']['content_audience']
          id?: string
          include_in_destination_feed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'content_privacy_settings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'content_privacy_settings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      feed_items: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          object_id: string
          object_type: string
          owner_id: string
          verb: Database['public']['Enums']['feed_verb']
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          object_id: string
          object_type: string
          owner_id: string
          verb: Database['public']['Enums']['feed_verb']
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          object_id?: string
          object_type?: string
          owner_id?: string
          verb?: Database['public']['Enums']['feed_verb']
        }
        Relationships: [
          {
            foreignKeyName: 'feed_items_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'feed_items_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'feed_items_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'feed_items_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
          status: Database['public']['Enums']['follow_status']
          updated_at: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
          status?: Database['public']['Enums']['follow_status']
          updated_at?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
          status?: Database['public']['Enums']['follow_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'follows_follower_id_fkey'
            columns: ['follower_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follows_follower_id_fkey'
            columns: ['follower_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'follows_following_id_fkey'
            columns: ['following_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follows_following_id_fkey'
            columns: ['following_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      gender_change_audit_log: {
        Row: {
          change_reason: string | null
          changed_at: string
          id: string
          ip_address: unknown
          new_gender: string
          new_gender_verified: boolean | null
          old_gender: string
          old_gender_verified: boolean | null
          user_agent: string | null
          user_id: string
          was_women_only_enabled: boolean | null
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          id?: string
          ip_address?: unknown
          new_gender: string
          new_gender_verified?: boolean | null
          old_gender: string
          old_gender_verified?: boolean | null
          user_agent?: string | null
          user_id: string
          was_women_only_enabled?: boolean | null
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          id?: string
          ip_address?: unknown
          new_gender?: string
          new_gender_verified?: boolean | null
          old_gender?: string
          old_gender_verified?: boolean | null
          user_agent?: string | null
          user_id?: string
          was_women_only_enabled?: boolean | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string | null
          entry_date: string
          id: string
          is_favorite: boolean | null
          last_synced_at: string | null
          latitude: number | null
          location_accuracy: number | null
          location_name: string | null
          longitude: number | null
          mood: string | null
          sync_status: string | null
          text_search: unknown
          title: string
          trip_id: string | null
          updated_at: string | null
          user_id: string
          weather_data: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          entry_date?: string
          id?: string
          is_favorite?: boolean | null
          last_synced_at?: string | null
          latitude?: number | null
          location_accuracy?: number | null
          location_name?: string | null
          longitude?: number | null
          mood?: string | null
          sync_status?: string | null
          text_search?: unknown
          title: string
          trip_id?: string | null
          updated_at?: string | null
          user_id: string
          weather_data?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          entry_date?: string
          id?: string
          is_favorite?: boolean | null
          last_synced_at?: string | null
          latitude?: number | null
          location_accuracy?: number | null
          location_name?: string | null
          longitude?: number | null
          mood?: string | null
          sync_status?: string | null
          text_search?: unknown
          title?: string
          trip_id?: string | null
          updated_at?: string | null
          user_id?: string
          weather_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'journal_entries_trip_id_fkey'
            columns: ['trip_id']
            isOneToOne: false
            referencedRelation: 'trip_summaries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'journal_entries_trip_id_fkey'
            columns: ['trip_id']
            isOneToOne: false
            referencedRelation: 'trips'
            referencedColumns: ['id']
          },
        ]
      }
      journal_tags: {
        Row: {
          created_at: string | null
          journal_entry_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          journal_entry_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          journal_entry_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'journal_tags_journal_entry_id_fkey'
            columns: ['journal_entry_id']
            isOneToOne: false
            referencedRelation: 'journal_entries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'journal_tags_journal_entry_id_fkey'
            columns: ['journal_entry_id']
            isOneToOne: false
            referencedRelation: 'journal_entries_with_media'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'journal_tags_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'tags'
            referencedColumns: ['id']
          },
        ]
      }
      journals: {
        Row: {
          audience: Database['public']['Enums']['content_audience']
          body: string | null
          comment_count: number
          content: string | null
          content_type: string
          country_code: string | null
          created_at: string
          deleted_at: string | null
          id: string
          latitude: number | null
          location_name: string | null
          location_point: unknown
          longitude: number | null
          reaction_count: number
          search_vector: unknown
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: Database['public']['Enums']['content_audience']
          body?: string | null
          comment_count?: number
          content?: string | null
          content_type?: string
          country_code?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          location_point?: unknown
          longitude?: number | null
          reaction_count?: number
          search_vector?: unknown
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: Database['public']['Enums']['content_audience']
          body?: string | null
          comment_count?: number
          content?: string | null
          content_type?: string
          country_code?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          location_point?: unknown
          longitude?: number | null
          reaction_count?: number
          search_vector?: unknown
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      media_items: {
        Row: {
          caption: string | null
          created_at: string | null
          duration: number | null
          exif_data: Json | null
          file_size: number | null
          height: number | null
          id: string
          is_cover: boolean | null
          journal_entry_id: string
          last_synced_at: string | null
          media_type: string
          mime_type: string | null
          order_index: number | null
          original_filename: string | null
          storage_path: string
          sync_status: string | null
          thumbnail_path: string | null
          updated_at: string | null
          upload_progress: number | null
          upload_status: string | null
          user_id: string
          width: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          duration?: number | null
          exif_data?: Json | null
          file_size?: number | null
          height?: number | null
          id?: string
          is_cover?: boolean | null
          journal_entry_id: string
          last_synced_at?: string | null
          media_type: string
          mime_type?: string | null
          order_index?: number | null
          original_filename?: string | null
          storage_path: string
          sync_status?: string | null
          thumbnail_path?: string | null
          updated_at?: string | null
          upload_progress?: number | null
          upload_status?: string | null
          user_id: string
          width?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          duration?: number | null
          exif_data?: Json | null
          file_size?: number | null
          height?: number | null
          id?: string
          is_cover?: boolean | null
          journal_entry_id?: string
          last_synced_at?: string | null
          media_type?: string
          mime_type?: string | null
          order_index?: number | null
          original_filename?: string | null
          storage_path?: string
          sync_status?: string | null
          thumbnail_path?: string | null
          updated_at?: string | null
          upload_progress?: number | null
          upload_status?: string | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'media_items_journal_entry_id_fkey'
            columns: ['journal_entry_id']
            isOneToOne: false
            referencedRelation: 'journal_entries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'media_items_journal_entry_id_fkey'
            columns: ['journal_entry_id']
            isOneToOne: false
            referencedRelation: 'journal_entries_with_media'
            referencedColumns: ['id']
          },
        ]
      }
      meetup_checkins: {
        Row: {
          activated_at: string | null
          alerted_at: string | null
          cancelled_at: string | null
          checked_in_at: string | null
          checkin_buffer_mins: number
          created_at: string
          id: string
          last_known_at: string | null
          last_known_point: unknown
          location_name: string | null
          meeting_note: string | null
          meetup_time: string
          sos_triggered_at: string | null
          status: Database['public']['Enums']['checkin_status']
          trusted_contact_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          alerted_at?: string | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          checkin_buffer_mins?: number
          created_at?: string
          id?: string
          last_known_at?: string | null
          last_known_point?: unknown
          location_name?: string | null
          meeting_note?: string | null
          meetup_time: string
          sos_triggered_at?: string | null
          status?: Database['public']['Enums']['checkin_status']
          trusted_contact_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          alerted_at?: string | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          checkin_buffer_mins?: number
          created_at?: string
          id?: string
          last_known_at?: string | null
          last_known_point?: unknown
          location_name?: string | null
          meeting_note?: string | null
          meetup_time?: string
          sos_triggered_at?: string | null
          status?: Database['public']['Enums']['checkin_status']
          trusted_contact_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'meetup_checkins_trusted_contact_id_fkey'
            columns: ['trusted_contact_id']
            isOneToOne: false
            referencedRelation: 'trusted_contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'meetup_checkins_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'meetup_checkins_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      meetup_outcomes: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          meetup_id: string
          no_show_user_id: string | null
          outcome: string
          user_a_id: string
          user_b_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          meetup_id: string
          no_show_user_id?: string | null
          outcome: string
          user_a_id: string
          user_b_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          meetup_id?: string
          no_show_user_id?: string | null
          outcome?: string
          user_a_id?: string
          user_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'meetup_outcomes_meetup_id_fkey'
            columns: ['meetup_id']
            isOneToOne: true
            referencedRelation: 'meetups'
            referencedColumns: ['id']
          },
        ]
      }
      meetups: {
        Row: {
          a_met_at: string | null
          b_met_at: string | null
          cancelled_at: string | null
          completed_at: string | null
          connection_id: string | null
          created_at: string
          id: string
          location_name: string | null
          location_point: unknown
          meetup_time: string
          proposed_by: string
          status: Database['public']['Enums']['meetup_status']
          updated_at: string
          user_a_id: string
          user_b_id: string
        }
        Insert: {
          a_met_at?: string | null
          b_met_at?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          connection_id?: string | null
          created_at?: string
          id?: string
          location_name?: string | null
          location_point?: unknown
          meetup_time: string
          proposed_by: string
          status?: Database['public']['Enums']['meetup_status']
          updated_at?: string
          user_a_id: string
          user_b_id: string
        }
        Update: {
          a_met_at?: string | null
          b_met_at?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          connection_id?: string | null
          created_at?: string
          id?: string
          location_name?: string | null
          location_point?: unknown
          meetup_time?: string
          proposed_by?: string
          status?: Database['public']['Enums']['meetup_status']
          updated_at?: string
          user_a_id?: string
          user_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'meetups_connection_id_fkey'
            columns: ['connection_id']
            isOneToOne: false
            referencedRelation: 'connections'
            referencedColumns: ['id']
          },
        ]
      }
      member_reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          meetup_id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
          updated_at: string
          would_meet_again: boolean
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          meetup_id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
          updated_at?: string
          would_meet_again: boolean
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          meetup_id?: string
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
          updated_at?: string
          would_meet_again?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'member_reviews_meetup_id_fkey'
            columns: ['meetup_id']
            isOneToOne: false
            referencedRelation: 'meetups'
            referencedColumns: ['id']
          },
        ]
      }
      messages: {
        Row: {
          activity_id: string | null
          client_created_at: string | null
          client_message_id: string | null
          connection_id: string
          content: string
          delivered_at: string | null
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
          sent_at: string
        }
        Insert: {
          activity_id?: string | null
          client_created_at?: string | null
          client_message_id?: string | null
          connection_id: string
          content: string
          delivered_at?: string | null
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
          sent_at?: string
        }
        Update: {
          activity_id?: string | null
          client_created_at?: string | null
          client_message_id?: string | null
          connection_id?: string
          content?: string
          delivered_at?: string | null
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_activity_id_fkey'
            columns: ['activity_id']
            isOneToOne: false
            referencedRelation: 'activities'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_connection_id_fkey'
            columns: ['connection_id']
            isOneToOne: false
            referencedRelation: 'connections'
            referencedColumns: ['id']
          },
        ]
      }
      notification_tokens: {
        Row: {
          app_version: string | null
          created_at: string
          device_id: string | null
          device_name: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          os_version: string | null
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_id?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          os_version?: string | null
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_id?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          os_version?: string | null
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notification_tokens_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notification_tokens_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string
          id: string
          object_id: string | null
          object_type: string | null
          read: boolean
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          object_id?: string | null
          object_type?: string | null
          read?: boolean
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          object_id?: string | null
          object_type?: string | null
          read?: boolean
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      offline_changes: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          operation: string
          record_id: string
          synced_at: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          operation: string
          record_id: string
          synced_at?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          operation?: string
          record_id?: string
          synced_at?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_privacy_settings: {
        Row: {
          created_at: string
          discoverable_by_destination: boolean
          gender_filter: string[] | null
          id: string
          min_viewer_age: number | null
          show_location: boolean
          updated_at: string
          user_id: string
          verified_only: boolean
          visibility: Database['public']['Enums']['profile_visibility']
        }
        Insert: {
          created_at?: string
          discoverable_by_destination?: boolean
          gender_filter?: string[] | null
          id?: string
          min_viewer_age?: number | null
          show_location?: boolean
          updated_at?: string
          user_id: string
          verified_only?: boolean
          visibility?: Database['public']['Enums']['profile_visibility']
        }
        Update: {
          created_at?: string
          discoverable_by_destination?: boolean
          gender_filter?: string[] | null
          id?: string
          min_viewer_age?: number | null
          show_location?: boolean
          updated_at?: string
          user_id?: string
          verified_only?: boolean
          visibility?: Database['public']['Enums']['profile_visibility']
        }
        Relationships: [
          {
            foreignKeyName: 'profile_privacy_settings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'profile_privacy_settings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      profiles: {
        Row: {
          age_range: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          email: string | null
          embedding_updated_at: string | null
          full_name: string | null
          gender: string | null
          gender_verified: boolean | null
          home_country: string | null
          id: string
          is_active: boolean
          location: string | null
          phone: string | null
          preferences: Json
          profile_embedding: string | null
          search_vector: unknown
          updated_at: string
          username: string | null
          verification_required: boolean | null
          website_url: string | null
          women_only_mode_enabled: boolean | null
          women_only_mode_enabled_at: string | null
        }
        Insert: {
          age_range?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          embedding_updated_at?: string | null
          full_name?: string | null
          gender?: string | null
          gender_verified?: boolean | null
          home_country?: string | null
          id: string
          is_active?: boolean
          location?: string | null
          phone?: string | null
          preferences?: Json
          profile_embedding?: string | null
          search_vector?: unknown
          updated_at?: string
          username?: string | null
          verification_required?: boolean | null
          website_url?: string | null
          women_only_mode_enabled?: boolean | null
          women_only_mode_enabled_at?: string | null
        }
        Update: {
          age_range?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          embedding_updated_at?: string | null
          full_name?: string | null
          gender?: string | null
          gender_verified?: boolean | null
          home_country?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          phone?: string | null
          preferences?: Json
          profile_embedding?: string | null
          search_vector?: unknown
          updated_at?: string
          username?: string | null
          verification_required?: boolean | null
          website_url?: string | null
          women_only_mode_enabled?: boolean | null
          women_only_mode_enabled_at?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          reaction: Database['public']['Enums']['reaction_type']
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction?: Database['public']['Enums']['reaction_type']
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction?: Database['public']['Enums']['reaction_type']
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          target_id: string
          target_type: Database['public']['Enums']['report_target_type']
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          target_id: string
          target_type: Database['public']['Enums']['report_target_type']
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          target_id?: string
          target_type?: Database['public']['Enums']['report_target_type']
        }
        Relationships: [
          {
            foreignKeyName: 'reports_reporter_id_fkey'
            columns: ['reporter_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_reporter_id_fkey'
            columns: ['reporter_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'reports_resolved_by_fkey'
            columns: ['resolved_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_resolved_by_fkey'
            columns: ['resolved_by']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      safety_alerts: {
        Row: {
          alert_type: Database['public']['Enums']['alert_type']
          checkin_id: string
          delivered_at: string | null
          delivery_channel: string
          delivery_ref: string | null
          id: string
          last_known_at: string | null
          last_known_point: unknown
          resolved_at: string | null
          sent_at: string
          user_id: string
        }
        Insert: {
          alert_type: Database['public']['Enums']['alert_type']
          checkin_id: string
          delivered_at?: string | null
          delivery_channel?: string
          delivery_ref?: string | null
          id?: string
          last_known_at?: string | null
          last_known_point?: unknown
          resolved_at?: string | null
          sent_at?: string
          user_id: string
        }
        Update: {
          alert_type?: Database['public']['Enums']['alert_type']
          checkin_id?: string
          delivered_at?: string | null
          delivery_channel?: string
          delivery_ref?: string | null
          id?: string
          last_known_at?: string | null
          last_known_point?: unknown
          resolved_at?: string | null
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'safety_alerts_checkin_id_fkey'
            columns: ['checkin_id']
            isOneToOne: false
            referencedRelation: 'meetup_checkins'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'safety_alerts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'safety_alerts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      shared_links: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_viewed_at: string | null
          password_hash: string | null
          slug: string
          trip_id: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_viewed_at?: string | null
          password_hash?: string | null
          slug: string
          trip_id: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_viewed_at?: string | null
          password_hash?: string | null
          slug?: string
          trip_id?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'shared_links_trip_id_fkey'
            columns: ['trip_id']
            isOneToOne: false
            referencedRelation: 'trip_summaries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'shared_links_trip_id_fkey'
            columns: ['trip_id']
            isOneToOne: false
            referencedRelation: 'trips'
            referencedColumns: ['id']
          },
        ]
      }
      shared_meetups: {
        Row: {
          created_at: string
          id: string
          location_name: string
          meeting_with: string
          meetup_time: string
          notes: string | null
          shared_with_contact_ids: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_name: string
          meeting_with: string
          meetup_time: string
          notes?: string | null
          shared_with_contact_ids?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_name?: string
          meeting_with?: string
          meetup_time?: string
          notes?: string | null
          shared_with_contact_ids?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'shared_meetups_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'shared_meetups_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      sos_alerts: {
        Row: {
          accuracy: number | null
          acknowledged_contact_ids: string[]
          address: string | null
          altitude: number | null
          battery_level: number | null
          cancelled_at: string | null
          check_in_id: string | null
          created_at: string
          first_acknowledged_at: string | null
          id: string
          latitude: number | null
          location: unknown
          location_at: string
          longitude: number | null
          message: string | null
          metadata: Json | null
          notified_contact_ids: string[]
          place_name: string | null
          resolved_at: string | null
          status: Database['public']['Enums']['sos_alert_status']
          triggered_at: string
          trip_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          acknowledged_contact_ids?: string[]
          address?: string | null
          altitude?: number | null
          battery_level?: number | null
          cancelled_at?: string | null
          check_in_id?: string | null
          created_at?: string
          first_acknowledged_at?: string | null
          id?: string
          latitude?: number | null
          location?: unknown
          location_at?: string
          longitude?: number | null
          message?: string | null
          metadata?: Json | null
          notified_contact_ids?: string[]
          place_name?: string | null
          resolved_at?: string | null
          status?: Database['public']['Enums']['sos_alert_status']
          triggered_at?: string
          trip_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          acknowledged_contact_ids?: string[]
          address?: string | null
          altitude?: number | null
          battery_level?: number | null
          cancelled_at?: string | null
          check_in_id?: string | null
          created_at?: string
          first_acknowledged_at?: string | null
          id?: string
          latitude?: number | null
          location?: unknown
          location_at?: string
          longitude?: number | null
          message?: string | null
          metadata?: Json | null
          notified_contact_ids?: string[]
          place_name?: string | null
          resolved_at?: string | null
          status?: Database['public']['Enums']['sos_alert_status']
          triggered_at?: string
          trip_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sos_alerts_check_in_id_fkey'
            columns: ['check_in_id']
            isOneToOne: false
            referencedRelation: 'check_ins'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sos_alerts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sos_alerts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      travel_preferences: {
        Row: {
          accommodation_types: string[]
          avoid_destinations: string[]
          created_at: string
          id: string
          is_flexible_dates: boolean
          max_budget: number
          max_trip_duration: number
          min_budget: number
          min_trip_duration: number
          preferred_destinations: string[]
          transportation_types: string[]
          travel_styles: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          accommodation_types?: string[]
          avoid_destinations?: string[]
          created_at?: string
          id?: string
          is_flexible_dates?: boolean
          max_budget?: number
          max_trip_duration?: number
          min_budget?: number
          min_trip_duration?: number
          preferred_destinations?: string[]
          transportation_types?: string[]
          travel_styles?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          accommodation_types?: string[]
          avoid_destinations?: string[]
          created_at?: string
          id?: string
          is_flexible_dates?: boolean
          max_budget?: number
          max_trip_duration?: number
          min_budget?: number
          min_trip_duration?: number
          preferred_destinations?: string[]
          transportation_types?: string[]
          travel_styles?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'travel_preferences_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'travel_preferences_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      trips: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          destination: string | null
          destination_city: string | null
          destination_country: string | null
          destination_name: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          last_synced_at: string | null
          location: unknown
          name: string
          start_date: string
          sync_status: string | null
          updated_at: string | null
          user_id: string
          visibility: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          destination?: string | null
          destination_city?: string | null
          destination_country?: string | null
          destination_name?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          last_synced_at?: string | null
          location?: unknown
          name: string
          start_date: string
          sync_status?: string | null
          updated_at?: string | null
          user_id: string
          visibility?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          destination?: string | null
          destination_city?: string | null
          destination_country?: string | null
          destination_name?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          last_synced_at?: string | null
          location?: unknown
          name?: string
          start_date?: string
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      trusted_contacts: {
        Row: {
          contact_email: string | null
          contact_email_enc: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_phone_enc: string | null
          contact_user_id: string | null
          created_at: string
          id: string
          is_active: boolean
          receives_emergency_alerts: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_email_enc?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_phone_enc?: string | null
          contact_user_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          receives_emergency_alerts?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          contact_email_enc?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_phone_enc?: string | null
          contact_user_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          receives_emergency_alerts?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          chat_id: string
          expires_at: string
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          chat_id: string
          expires_at?: string
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          expires_at?: string
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'typing_indicators_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'typing_indicators_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      user_activities: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_activities_activity_id_fkey'
            columns: ['activity_id']
            isOneToOne: false
            referencedRelation: 'activities'
            referencedColumns: ['id']
          },
        ]
      }
      user_verification: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          provider: string | null
          provider_ref: string | null
          revoked_at: string | null
          tier: Database['public']['Enums']['verification_tier']
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string | null
          provider_ref?: string | null
          revoked_at?: string | null
          tier?: Database['public']['Enums']['verification_tier']
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string | null
          provider_ref?: string | null
          revoked_at?: string | null
          tier?: Database['public']['Enums']['verification_tier']
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_verification_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_verification_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'verified_women'
            referencedColumns: ['user_id']
          },
        ]
      }
      verification_records: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          provider: string
          provider_breakdown: Json | null
          provider_reference: string | null
          provider_result: Json | null
          provider_workflow_id: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
          verification_type: string
          verified_date_of_birth: string | null
          verified_gender: string | null
          verified_nationality: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string
          provider_breakdown?: Json | null
          provider_reference?: string | null
          provider_result?: Json | null
          provider_workflow_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_type: string
          verified_date_of_birth?: string | null
          verified_gender?: string | null
          verified_nationality?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string
          provider_breakdown?: Json | null
          provider_reference?: string | null
          provider_result?: Json | null
          provider_workflow_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_type?: string
          verified_date_of_birth?: string | null
          verified_gender?: string | null
          verified_nationality?: string | null
        }
        Relationships: []
      }
      women_only_space_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          space_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          space_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          space_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'women_only_space_members_space_id_fkey'
            columns: ['space_id']
            isOneToOne: false
            referencedRelation: 'women_only_spaces'
            referencedColumns: ['id']
          },
        ]
      }
      women_only_spaces: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          location: unknown
          location_name: string | null
          max_members: number | null
          name: string
          radius_meters: number | null
          require_approval: boolean | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          location?: unknown
          location_name?: string | null
          max_members?: number | null
          name: string
          radius_meters?: number | null
          require_approval?: boolean | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          location?: unknown
          location_name?: string | null
          max_members?: number | null
          name?: string
          radius_meters?: number | null
          require_approval?: boolean | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      journal_entries_with_media: {
        Row: {
          content: string | null
          created_at: string | null
          entry_date: string | null
          id: string | null
          is_favorite: boolean | null
          last_synced_at: string | null
          latitude: number | null
          location_accuracy: number | null
          location_name: string | null
          longitude: number | null
          media_count: number | null
          mood: string | null
          photo_paths: string[] | null
          sync_status: string | null
          tag_names: string[] | null
          text_search: unknown
          title: string | null
          trip_end_date: string | null
          trip_id: string | null
          trip_name: string | null
          trip_start_date: string | null
          updated_at: string | null
          user_id: string | null
          video_paths: string[] | null
          weather_data: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'journal_entries_trip_id_fkey'
            columns: ['trip_id']
            isOneToOne: false
            referencedRelation: 'trip_summaries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'journal_entries_trip_id_fkey'
            columns: ['trip_id']
            isOneToOne: false
            referencedRelation: 'trips'
            referencedColumns: ['id']
          },
        ]
      }
      rls_policy_summary: {
        Row: {
          cmd: string | null
          permissive: string | null
          policyname: unknown
          qual: string | null
          roles: unknown[] | null
          schemaname: unknown
          tablename: unknown
          with_check: string | null
        }
        Relationships: []
      }
      shared_links_with_trips: {
        Row: {
          created_at: string | null
          expires_at: string | null
          has_password: boolean | null
          id: string | null
          is_active: boolean | null
          last_viewed_at: string | null
          slug: string | null
          trip_cover_image_url: string | null
          trip_description: string | null
          trip_destination: string | null
          trip_end_date: string | null
          trip_id: string | null
          trip_is_public: boolean | null
          trip_name: string | null
          trip_start_date: string | null
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'shared_links_trip_id_fkey'
            columns: ['trip_id']
            isOneToOne: false
            referencedRelation: 'trip_summaries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'shared_links_trip_id_fkey'
            columns: ['trip_id']
            isOneToOne: false
            referencedRelation: 'trips'
            referencedColumns: ['id']
          },
        ]
      }
      trip_summaries: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          destination: string | null
          end_date: string | null
          entry_count: number | null
          first_entry_date: string | null
          id: string | null
          is_public: boolean | null
          last_entry_date: string | null
          media_count: number | null
          name: string | null
          start_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      verified_women: {
        Row: {
          first_name: string | null
          home_country: string | null
          user_id: string | null
          verification_expires_at: string | null
          verified_at: string | null
          women_only_mode_enabled: boolean | null
          women_only_mode_enabled_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ''?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      accept_connection_request: {
        Args: { p_accepting_user_id: string; p_connection_id: string }
        Returns: boolean
      }
      acknowledge_sos_alert: {
        Args: { p_alert_id: string; p_contact_id: string }
        Returns: undefined
      }
      addauth: { Args: { '': string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      archive_expired_trips: { Args: never; Returns: number }
      are_users_blocked: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
      auth_user_verification_tier: {
        Args: never
        Returns: Database['public']['Enums']['verification_tier']
      }
      caller_trip_overlaps: {
        Args: { check_user: string; range_end: string; range_start: string }
        Returns: boolean
      }
      can_access_women_only_spaces: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      can_be_shown_in_women_only: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      cancel_meetup: { Args: { p_meetup_id: string }; Returns: undefined }
      cancel_sos_alert: { Args: { p_alert_id: string }; Returns: undefined }
      clear_typing_indicator: {
        Args: { p_chat_id: string; p_user_id: string }
        Returns: undefined
      }
      complete_meetup: { Args: { p_meetup_id: string }; Returns: undefined }
      create_connection_from_match: {
        Args: {
          p_activity_id?: string
          p_initial_message?: string
          p_recipient_id: string
          p_requester_id: string
        }
        Returns: string
      }
      create_shared_link: {
        Args: {
          p_expires_at?: string
          p_password?: string
          p_trip_id: string
          p_user_id: string
        }
        Returns: string
      }
      decline_connection_request: {
        Args: { p_connection_id: string; p_declining_user_id: string }
        Returns: boolean
      }
      disable_women_only_mode: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      disablelongtransactions: { Args: never; Returns: string }
      distance_between_points: {
        Args: { p_point1: unknown; p_point2: unknown }
        Returns: number
      }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enable_women_only_mode: { Args: { p_user_id: string }; Returns: boolean }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      fanout_post_to_feeds: {
        Args: { p_author_id: string; p_journal_id: string }
        Returns: undefined
      }
      find_potential_matches: {
        Args: { p_limit?: number; p_radius_meters?: number; p_user_id: string }
        Returns: {
          age_range: string
          destination_name: string
          distance_meters: number
          first_name: string
          gender: string
          gender_verified: boolean
          home_country: string
          matching_activities: string[]
          overlap_days: number
          overlap_end_date: string
          overlap_start_date: string
          trip_end_date: string
          trip_id: string
          trip_start_date: string
          user_id: string
        }[]
      }
      find_semantic_matches: {
        Args: {
          p_match_threshold?: number
          p_max_results?: number
          p_query_user_id: string
        }
        Returns: {
          avatar_url: string
          destination_name: string
          display_name: string
          end_date: string
          semantic_score: number
          start_date: string
          user_id: string
        }[]
      }
      find_trips_near_location: {
        Args: {
          p_end_date?: string
          p_limit?: number
          p_location: unknown
          p_radius_meters?: number
          p_start_date?: string
        }
        Returns: {
          destination_name: string
          distance_meters: number
          end_date: string
          start_date: string
          trip_id: string
          user_id: string
        }[]
      }
      find_women_only_spaces_nearby: {
        Args: {
          p_limit?: number
          p_location: unknown
          p_radius_meters?: number
          p_user_id: string
        }
        Returns: {
          description: string
          distance_meters: number
          is_member: boolean
          location_name: string
          member_count: number
          name: string
          space_id: string
        }[]
      }
      generate_unique_slug: { Args: never; Returns: string }
      geometry: { Args: { '': string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { '': string }; Returns: unknown }
      get_active_sos_alert: {
        Args: { p_user_id: string }
        Returns: {
          acknowledged_contact_ids: string[]
          battery_level: number
          id: string
          latitude: number
          longitude: number
          message: string
          notified_contact_ids: string[]
          status: Database['public']['Enums']['sos_alert_status']
          triggered_at: string
        }[]
      }
      get_destination_posts: {
        Args: {
          p_before?: string
          p_lat: number
          p_limit?: number
          p_lon: number
          p_radius_km?: number
        }
        Returns: {
          author_avatar: string
          author_id: string
          author_username: string
          body: string
          comment_count: number
          created_at: string
          distance_km: number
          journal_id: string
          location_name: string
          reaction_count: number
        }[]
      }
      get_entries_near_location: {
        Args: { lat: number; lng: number; radius_km: number; user_id: string }
        Returns: {
          content: string
          created_at: string | null
          entry_date: string
          id: string
          is_favorite: boolean | null
          last_synced_at: string | null
          latitude: number | null
          location_accuracy: number | null
          location_name: string | null
          longitude: number | null
          mood: string | null
          sync_status: string | null
          text_search: unknown
          title: string
          trip_id: string | null
          updated_at: string | null
          user_id: string
          weather_data: Json | null
        }[]
        SetofOptions: {
          from: '*'
          to: 'journal_entries'
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_profile_embedding: { Args: { p_user_id: string }; Returns: string }
      get_profile_safe: {
        Args: { p_username: string }
        Returns: {
          avatar_url: string
          bio: string
          display_name: string
          follower_count: number
          following_count: number
          home_country: string
          id: string
          is_following: boolean
          pending_follow: boolean
          post_count: number
          tier: Database['public']['Enums']['verification_tier']
          username: string
          visibility: Database['public']['Enums']['profile_visibility']
          website_url: string
        }[]
      }
      get_typing_users: {
        Args: { p_chat_id: string }
        Returns: {
          started_at: string
          user_id: string
        }[]
      }
      get_unread_message_count: { Args: never; Returns: number }
      get_unread_notification_count: { Args: never; Returns: number }
      get_user_feed: {
        Args: { p_before?: string; p_limit?: number }
        Returns: {
          actor_avatar: string
          actor_id: string
          actor_username: string
          created_at: string
          feed_item_id: string
          object_id: string
          object_type: string
          verb: Database['public']['Enums']['feed_verb']
        }[]
      }
      get_user_match_stats: { Args: { p_user_id: string }; Returns: Json }
      gettransactionid: { Args: never; Returns: unknown }
      has_active_connection: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
      hash_password: { Args: { password: string }; Returns: string }
      increment_link_view_count: {
        Args: { link_slug: string }
        Returns: undefined
      }
      is_share_recipient: {
        Args: { contact_row_ids: string[]; reader: string }
        Returns: boolean
      }
      is_verified_female: { Args: { check_user: string }; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      make_point: { Args: { p_lat: number; p_lng: number }; Returns: unknown }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      propose_meetup: {
        Args: {
          p_connection_id: string
          p_location_name?: string
          p_meetup_time: string
        }
        Returns: string
      }
      report_no_show: { Args: { p_meetup_id: string }; Returns: undefined }
      reputation_score: { Args: { p_user_id: string }; Returns: Json }
      resolve_sos_alert: { Args: { p_alert_id: string }; Returns: undefined }
      respond_meetup: {
        Args: { p_accept: boolean; p_meetup_id: string }
        Returns: undefined
      }
      search_journal_entries: {
        Args: {
          p_end_date?: string
          p_limit?: number
          p_mood?: string
          p_offset?: number
          p_search_query: string
          p_start_date?: string
          p_tag_ids?: string[]
          p_trip_id?: string
          p_user_id: string
        }
        Returns: {
          content: string
          entry_date: string
          id: string
          location_name: string
          media_count: number
          mood: string
          rank: number
          title: string
          trip_id: string
          trip_name: string
        }[]
      }
      search_profiles: {
        Args: {
          p_country?: string
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_verified_only?: boolean
        }
        Returns: {
          avatar_url: string
          display_name: string
          follower_count: number
          home_country: string
          id: string
          tier: Database['public']['Enums']['verification_tier']
          username: string
          visibility: Database['public']['Enums']['profile_visibility']
        }[]
      }
      set_typing_indicator: {
        Args: { p_chat_id: string; p_user_id: string }
        Returns: undefined
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { '': string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { '': string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { '': string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { '': string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { '': string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { '': string }; Returns: string }
      st_astext: { Args: { '': string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { '': string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { '': string }; Returns: unknown }
      st_geographyfromtext: { Args: { '': string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { '': string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { '': string }; Returns: unknown }
      st_geomfromewkt: { Args: { '': string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { '': Json }; Returns: unknown }
        | { Args: { '': Json }; Returns: unknown }
        | { Args: { '': string }; Returns: unknown }
      st_geomfromgml: { Args: { '': string }; Returns: unknown }
      st_geomfromkml: { Args: { '': string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { '': string }; Returns: unknown }
      st_gmltosql: { Args: { '': string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database['public']['CompositeTypes']['valid_detail']
        SetofOptions: {
          from: '*'
          to: 'valid_detail'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { '': string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { '': string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { '': string }; Returns: unknown }
      st_mpointfromtext: { Args: { '': string }; Returns: unknown }
      st_mpolyfromtext: { Args: { '': string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { '': string }; Returns: unknown }
      st_multipointfromtext: { Args: { '': string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { '': string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { '': string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { '': string }; Returns: unknown }
      st_polygonfromtext: { Args: { '': string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { '': string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      submit_review: {
        Args: {
          p_content?: string
          p_meetup_id: string
          p_rating: number
          p_would_meet_again: boolean
        }
        Returns: string
      }
      trigger_sos: {
        Args: {
          p_accuracy?: number
          p_address?: string
          p_altitude?: number
          p_battery_level?: number
          p_latitude: number
          p_longitude: number
          p_message?: string
          p_trip_id?: string
          p_user_id: string
        }
        Returns: string
      }
      unlockrows: { Args: { '': string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      users_are_blocked: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
      users_have_trip_overlap: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
      validate_shared_link_access: {
        Args: { link_slug: string; password?: string }
        Returns: {
          error_message: string
          is_expired: boolean
          is_valid: boolean
          requires_password: boolean
          trip_id: string
        }[]
      }
      verify_password: {
        Args: { link_id: string; password: string }
        Returns: boolean
      }
      verify_rls_enabled: {
        Args: never
        Returns: {
          rls_enabled: boolean
          table_name: string
        }[]
      }
      viewer_follows: {
        Args: { p_target: string; p_viewer: string }
        Returns: boolean
      }
      wants_women_only: { Args: { check_user: string }; Returns: boolean }
    }
    Enums: {
      alert_type: 'reminder' | 'escalation' | 'sos'
      checkin_status: 'scheduled' | 'active' | 'checked_in' | 'alerted' | 'sos' | 'cancelled'
      comment_permission: 'all' | 'followers' | 'verified' | 'none'
      content_audience: 'public' | 'community' | 'followers' | 'verified' | 'private'
      feed_verb: 'posted' | 'followed' | 'reacted' | 'commented'
      follow_status: 'pending' | 'accepted'
      meetup_status: 'proposed' | 'confirmed' | 'completed' | 'cancelled'
      profile_visibility: 'hidden' | 'community' | 'public'
      reaction_type: 'like' | 'love' | 'inspire' | 'helpful'
      report_target_type: 'profile' | 'post' | 'comment' | 'message'
      sos_alert_status: 'active' | 'acknowledged' | 'resolved' | 'cancelled'
      verification_tier: 'unverified' | 'email' | 'id_verified'
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_type: ['reminder', 'escalation', 'sos'],
      checkin_status: ['scheduled', 'active', 'checked_in', 'alerted', 'sos', 'cancelled'],
      comment_permission: ['all', 'followers', 'verified', 'none'],
      content_audience: ['public', 'community', 'followers', 'verified', 'private'],
      feed_verb: ['posted', 'followed', 'reacted', 'commented'],
      follow_status: ['pending', 'accepted'],
      meetup_status: ['proposed', 'confirmed', 'completed', 'cancelled'],
      profile_visibility: ['hidden', 'community', 'public'],
      reaction_type: ['like', 'love', 'inspire', 'helpful'],
      report_target_type: ['profile', 'post', 'comment', 'message'],
      sos_alert_status: ['active', 'acknowledged', 'resolved', 'cancelled'],
      verification_tier: ['unverified', 'email', 'id_verified'],
    },
  },
} as const
