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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      billing_lifecycle_notifications: {
        Row: {
          anchor_date: string
          id: string
          kind: string
          metadata: Json
          sent_at: string
          user_id: string
        }
        Insert: {
          anchor_date: string
          id?: string
          kind: string
          metadata?: Json
          sent_at?: string
          user_id: string
        }
        Update: {
          anchor_date?: string
          id?: string
          kind?: string
          metadata?: Json
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_follows: {
        Row: {
          business_id: string
          created_at: string
          follower_id: string
          id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          follower_id: string
          id?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          follower_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_follows_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_follows_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      business_google_reviews: {
        Row: {
          author_name: string
          author_photo_url: string | null
          business_id: string
          created_at: string
          id: string
          language: string | null
          rating: number
          relative_time: string | null
          text: string | null
          time: string | null
        }
        Insert: {
          author_name: string
          author_photo_url?: string | null
          business_id: string
          created_at?: string
          id?: string
          language?: string | null
          rating: number
          relative_time?: string | null
          text?: string | null
          time?: string | null
        }
        Update: {
          author_name?: string
          author_photo_url?: string | null
          business_id?: string
          created_at?: string
          id?: string
          language?: string | null
          rating?: number
          relative_time?: string | null
          text?: string | null
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_google_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_google_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      business_images: {
        Row: {
          business_id: string
          created_at: string
          id: string
          sort_order: number
          storage_path: string | null
          url: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          sort_order?: number
          storage_path?: string | null
          url: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          storage_path?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_images_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_images_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          category_name: string
          category_slug: string
          certifications: string[]
          certified_pro: boolean
          city: string
          created_at: string
          description: string | null
          email: string | null
          flagged_for_review: boolean
          followers_count: number
          google_maps_url: string | null
          google_place_id: string | null
          google_rating: number | null
          google_review_count: number | null
          google_reviews_last_fetched_at: string | null
          hours: string | null
          id: string
          image_url: string | null
          is_suspended: boolean
          is_verified: boolean
          last_active_at: string
          listing_status: string
          logo_url: string | null
          name: string
          no_show_count: number
          owner_id: string
          phone: string | null
          plan: Database["public"]["Enums"]["business_plan"]
          pre_launch: boolean
          province: string
          rating: number
          report_count: number
          response_rate: number
          review_count: number
          secondary_categories: string[]
          slug: string
          strikes: number
          tags: string[]
          trust_score: number
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category_name: string
          category_slug: string
          certifications?: string[]
          certified_pro?: boolean
          city: string
          created_at?: string
          description?: string | null
          email?: string | null
          flagged_for_review?: boolean
          followers_count?: number
          google_maps_url?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          google_reviews_last_fetched_at?: string | null
          hours?: string | null
          id?: string
          image_url?: string | null
          is_suspended?: boolean
          is_verified?: boolean
          last_active_at?: string
          listing_status?: string
          logo_url?: string | null
          name: string
          no_show_count?: number
          owner_id: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["business_plan"]
          pre_launch?: boolean
          province: string
          rating?: number
          report_count?: number
          response_rate?: number
          review_count?: number
          secondary_categories?: string[]
          slug: string
          strikes?: number
          tags?: string[]
          trust_score?: number
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category_name?: string
          category_slug?: string
          certifications?: string[]
          certified_pro?: boolean
          city?: string
          created_at?: string
          description?: string | null
          email?: string | null
          flagged_for_review?: boolean
          followers_count?: number
          google_maps_url?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          google_reviews_last_fetched_at?: string | null
          hours?: string | null
          id?: string
          image_url?: string | null
          is_suspended?: boolean
          is_verified?: boolean
          last_active_at?: string
          listing_status?: string
          logo_url?: string | null
          name?: string
          no_show_count?: number
          owner_id?: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["business_plan"]
          pre_launch?: boolean
          province?: string
          rating?: number
          report_count?: number
          response_rate?: number
          review_count?: number
          secondary_categories?: string[]
          slug?: string
          strikes?: number
          tags?: string[]
          trust_score?: number
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      contact_reveals: {
        Row: {
          business_id: string
          created_at: string
          id: string
          viewer_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          viewer_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          viewer_id?: string
        }
        Relationships: []
      }
      coupon_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          tier: Database["public"]["Enums"]["sjoh_tier"]
          trial_days: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          tier?: Database["public"]["Enums"]["sjoh_tier"]
          trial_days?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          tier?: Database["public"]["Enums"]["sjoh_tier"]
          trial_days?: number
        }
        Relationships: []
      }
      deal_memos: {
        Row: {
          accepted_at: string | null
          business_id: string
          cancelled_at: string | null
          client_email: string
          client_phone: string | null
          client_user_id: string | null
          completed_at: string | null
          completion_notes: string | null
          completion_photo_url: string | null
          created_at: string
          id: string
          job_title: string
          pro_user_id: string
          review_chaser_sent_at: string | null
          scope_of_work: string
          status: Database["public"]["Enums"]["deal_memo_status"]
          total_amount_zar: number
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          business_id: string
          cancelled_at?: string | null
          client_email: string
          client_phone?: string | null
          client_user_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          completion_photo_url?: string | null
          created_at?: string
          id?: string
          job_title: string
          pro_user_id: string
          review_chaser_sent_at?: string | null
          scope_of_work: string
          status?: Database["public"]["Enums"]["deal_memo_status"]
          total_amount_zar: number
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          business_id?: string
          cancelled_at?: string | null
          client_email?: string
          client_phone?: string | null
          client_user_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          completion_photo_url?: string | null
          created_at?: string
          id?: string
          job_title?: string
          pro_user_id?: string
          review_chaser_sent_at?: string | null
          scope_of_work?: string
          status?: Database["public"]["Enums"]["deal_memo_status"]
          total_amount_zar?: number
          updated_at?: string
        }
        Relationships: []
      }
      dispute_actions: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          dispute_id: string
          id: string
          metadata: Json
          notes: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          dispute_id: string
          id?: string
          metadata?: Json
          notes?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          dispute_id?: string
          id?: string
          metadata?: Json
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_actions_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          assigned_admin_id: string | null
          business_id: string | null
          category: Database["public"]["Enums"]["dispute_category"]
          created_at: string
          deal_memo_id: string | null
          details: string | null
          evidence_urls: Json
          id: string
          opportunity_id: string | null
          pro_suspended_at: string | null
          pro_user_id: string | null
          reference: string
          reporter_email: string | null
          reporter_id: string | null
          reporter_name: string | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["dispute_severity"]
          status: Database["public"]["Enums"]["dispute_status"]
          summary: string
          updated_at: string
        }
        Insert: {
          assigned_admin_id?: string | null
          business_id?: string | null
          category?: Database["public"]["Enums"]["dispute_category"]
          created_at?: string
          deal_memo_id?: string | null
          details?: string | null
          evidence_urls?: Json
          id?: string
          opportunity_id?: string | null
          pro_suspended_at?: string | null
          pro_user_id?: string | null
          reference?: string
          reporter_email?: string | null
          reporter_id?: string | null
          reporter_name?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["dispute_severity"]
          status?: Database["public"]["Enums"]["dispute_status"]
          summary: string
          updated_at?: string
        }
        Update: {
          assigned_admin_id?: string | null
          business_id?: string | null
          category?: Database["public"]["Enums"]["dispute_category"]
          created_at?: string
          deal_memo_id?: string | null
          details?: string | null
          evidence_urls?: Json
          id?: string
          opportunity_id?: string | null
          pro_suspended_at?: string | null
          pro_user_id?: string | null
          reference?: string
          reporter_email?: string | null
          reporter_id?: string | null
          reporter_name?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["dispute_severity"]
          status?: Database["public"]["Enums"]["dispute_status"]
          summary?: string
          updated_at?: string
        }
        Relationships: []
      }
      early_access_signups: {
        Row: {
          claimed_founding_spot: boolean
          created_at: string
          email: string
          id: string
          role: string
          source: string | null
        }
        Insert: {
          claimed_founding_spot?: boolean
          created_at?: string
          email: string
          id?: string
          role: string
          source?: string | null
        }
        Update: {
          claimed_founding_spot?: boolean
          created_at?: string
          email?: string
          id?: string
          role?: string
          source?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      hermes_campaigns: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          goal: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          goal?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          goal?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      hermes_findings: {
        Row: {
          allowed_next_step: string | null
          business_name: string | null
          campaign_id: string | null
          category: string | null
          city_area: string | null
          confidence_score: number | null
          contact_type: string | null
          country: string
          created_at: string
          data: Json
          email_marketing_allowed_now: string
          finding_type: string
          id: string
          notes: string | null
          popia_consent_status: string
          province: string | null
          source_checked_date: string
          source_name: string | null
          source_url: string | null
          status: string
          task_id: string | null
          updated_at: string
        }
        Insert: {
          allowed_next_step?: string | null
          business_name?: string | null
          campaign_id?: string | null
          category?: string | null
          city_area?: string | null
          confidence_score?: number | null
          contact_type?: string | null
          country?: string
          created_at?: string
          data?: Json
          email_marketing_allowed_now?: string
          finding_type: string
          id?: string
          notes?: string | null
          popia_consent_status?: string
          province?: string | null
          source_checked_date?: string
          source_name?: string | null
          source_url?: string | null
          status?: string
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          allowed_next_step?: string | null
          business_name?: string | null
          campaign_id?: string | null
          category?: string | null
          city_area?: string | null
          confidence_score?: number | null
          contact_type?: string | null
          country?: string
          created_at?: string
          data?: Json
          email_marketing_allowed_now?: string
          finding_type?: string
          id?: string
          notes?: string | null
          popia_consent_status?: string
          province?: string | null
          source_checked_date?: string
          source_name?: string | null
          source_url?: string | null
          status?: string
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hermes_findings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "hermes_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hermes_findings_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "hermes_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      hermes_tasks: {
        Row: {
          attempts: number
          campaign_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          next_run_at: string
          payload: Json
          priority: number
          result: Json | null
          status: string
          task_type: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          next_run_at?: string
          payload?: Json
          priority?: number
          result?: Json | null
          status?: string
          task_type: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          next_run_at?: string
          payload?: Json
          priority?: number
          result?: Json | null
          status?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hermes_tasks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "hermes_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          access_token: string | null
          access_token_expires_at: string | null
          business_id: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          deal_memo_id: string | null
          doc_type: string
          email_error: string | null
          email_message_id: string | null
          id: string
          invoice_number: string
          issued_at: string
          line_items: Json
          notes: string | null
          pdf_path: string | null
          pro_user_id: string
          sent_at: string | null
          status: string
          subtotal_zar: number
          total_zar: number
          vat_included: boolean
          vat_zar: number
        }
        Insert: {
          access_token?: string | null
          access_token_expires_at?: string | null
          business_id: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          deal_memo_id?: string | null
          doc_type?: string
          email_error?: string | null
          email_message_id?: string | null
          id?: string
          invoice_number: string
          issued_at?: string
          line_items?: Json
          notes?: string | null
          pdf_path?: string | null
          pro_user_id: string
          sent_at?: string | null
          status?: string
          subtotal_zar?: number
          total_zar?: number
          vat_included?: boolean
          vat_zar?: number
        }
        Update: {
          access_token?: string | null
          access_token_expires_at?: string | null
          business_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          deal_memo_id?: string | null
          doc_type?: string
          email_error?: string | null
          email_message_id?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string
          line_items?: Json
          notes?: string | null
          pdf_path?: string | null
          pro_user_id?: string
          sent_at?: string | null
          status?: string
          subtotal_zar?: number
          total_zar?: number
          vat_included?: boolean
          vat_zar?: number
        }
        Relationships: []
      }
      no_show_reports: {
        Row: {
          business_id: string
          created_at: string
          deal_memo_id: string | null
          id: string
          proposal_id: string | null
          reason: string | null
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          business_id: string
          created_at?: string
          deal_memo_id?: string | null
          id?: string
          proposal_id?: string | null
          reason?: string | null
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          deal_memo_id?: string | null
          id?: string
          proposal_id?: string | null
          reason?: string | null
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "no_show_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "no_show_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "no_show_reports_deal_memo_id_fkey"
            columns: ["deal_memo_id"]
            isOneToOne: false
            referencedRelation: "deal_memos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "no_show_reports_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          applicants_count: number
          attachments: Json
          budget: number
          budget_type: Database["public"]["Enums"]["budget_type"]
          category_name: string
          category_slug: string
          city: string
          client_email: string | null
          client_id: string | null
          client_phone: string | null
          contact_preference: string | null
          created_at: string
          deadline: string | null
          description: string
          external_contact_url: string | null
          id: string
          is_concierge_lead: boolean
          is_urgent: boolean
          posted_by_name: string | null
          province: string
          requirements: string[]
          stale_fallback_notified_at: string | null
          status: Database["public"]["Enums"]["opportunity_status"]
          title: string
          updated_at: string
          urgent_boost_amount_cents: number | null
          urgent_boost_paid_at: string | null
        }
        Insert: {
          applicants_count?: number
          attachments?: Json
          budget?: number
          budget_type?: Database["public"]["Enums"]["budget_type"]
          category_name: string
          category_slug: string
          city: string
          client_email?: string | null
          client_id?: string | null
          client_phone?: string | null
          contact_preference?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          external_contact_url?: string | null
          id?: string
          is_concierge_lead?: boolean
          is_urgent?: boolean
          posted_by_name?: string | null
          province: string
          requirements?: string[]
          stale_fallback_notified_at?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          title: string
          updated_at?: string
          urgent_boost_amount_cents?: number | null
          urgent_boost_paid_at?: string | null
        }
        Update: {
          applicants_count?: number
          attachments?: Json
          budget?: number
          budget_type?: Database["public"]["Enums"]["budget_type"]
          category_name?: string
          category_slug?: string
          city?: string
          client_email?: string | null
          client_id?: string | null
          client_phone?: string | null
          contact_preference?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          external_contact_url?: string | null
          id?: string
          is_concierge_lead?: boolean
          is_urgent?: boolean
          posted_by_name?: string | null
          province?: string
          requirements?: string[]
          stale_fallback_notified_at?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          title?: string
          updated_at?: string
          urgent_boost_amount_cents?: number | null
          urgent_boost_paid_at?: string | null
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount_cents: number | null
          billing_cycle: Database["public"]["Enums"]["billing_cycle"] | null
          created_at: string
          currency: string | null
          error_message: string | null
          id: string
          kind: Database["public"]["Enums"]["payment_event_kind"]
          payfast_payment_status: string
          payfast_pf_payment_id: string
          processed: boolean
          processed_at: string | null
          provider: string
          raw: Json
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"] | null
          created_at?: string
          currency?: string | null
          error_message?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["payment_event_kind"]
          payfast_payment_status: string
          payfast_pf_payment_id: string
          processed?: boolean
          processed_at?: string | null
          provider?: string
          raw: Json
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"] | null
          created_at?: string
          currency?: string | null
          error_message?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["payment_event_kind"]
          payfast_payment_status?: string
          payfast_pf_payment_id?: string
          processed?: boolean
          processed_at?: string | null
          provider?: string
          raw?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      pro_referrals: {
        Row: {
          created_at: string
          id: string
          redeemed_at: string | null
          referee_credit_applied_at: string | null
          referee_user_id: string
          referral_code: string
          referrer_credit_applied_at: string | null
          referrer_user_id: string
          status: Database["public"]["Enums"]["pro_referral_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          redeemed_at?: string | null
          referee_credit_applied_at?: string | null
          referee_user_id: string
          referral_code: string
          referrer_credit_applied_at?: string | null
          referrer_user_id: string
          status?: Database["public"]["Enums"]["pro_referral_status"]
        }
        Update: {
          created_at?: string
          id?: string
          redeemed_at?: string | null
          referee_credit_applied_at?: string | null
          referee_user_id?: string
          referral_code?: string
          referrer_credit_applied_at?: string | null
          referrer_user_id?: string
          status?: Database["public"]["Enums"]["pro_referral_status"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          province: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          province?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          province?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          business_id: string
          created_at: string
          deal_memo_id: string | null
          id: string
          message: string
          opportunity_id: string
          provider_id: string
          quote_amount: number | null
          status: Database["public"]["Enums"]["proposal_status"]
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          deal_memo_id?: string | null
          id?: string
          message: string
          opportunity_id: string
          provider_id: string
          quote_amount?: number | null
          status?: Database["public"]["Enums"]["proposal_status"]
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          deal_memo_id?: string | null
          id?: string
          message?: string
          opportunity_id?: string
          provider_id?: string
          quote_amount?: number | null
          status?: Database["public"]["Enums"]["proposal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_deal_memo_id_fkey"
            columns: ["deal_memo_id"]
            isOneToOne: false
            referencedRelation: "deal_memos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities_public"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_balances: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          email_alerts_optin: boolean
          founding_proposals_period_start: string
          founding_proposals_used_this_month: number
          id: string
          next_renewal_at: string | null
          onesignal_player_id: string | null
          payfast_subscription_token: string | null
          payfast_token: string | null
          push_alerts_optin: boolean
          referral_code: string | null
          tier: Database["public"]["Enums"]["sjoh_tier"]
          tier_expires_at: string | null
          trial_ends_at: string | null
          updated_at: string
          urgent_alerts_optin: boolean
          user_id: string
          whatsapp_alerts_optin: boolean
          whatsapp_number: string | null
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          email_alerts_optin?: boolean
          founding_proposals_period_start?: string
          founding_proposals_used_this_month?: number
          id?: string
          next_renewal_at?: string | null
          onesignal_player_id?: string | null
          payfast_subscription_token?: string | null
          payfast_token?: string | null
          push_alerts_optin?: boolean
          referral_code?: string | null
          tier?: Database["public"]["Enums"]["sjoh_tier"]
          tier_expires_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          urgent_alerts_optin?: boolean
          user_id: string
          whatsapp_alerts_optin?: boolean
          whatsapp_number?: string | null
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          email_alerts_optin?: boolean
          founding_proposals_period_start?: string
          founding_proposals_used_this_month?: number
          id?: string
          next_renewal_at?: string | null
          onesignal_player_id?: string | null
          payfast_subscription_token?: string | null
          payfast_token?: string | null
          push_alerts_optin?: boolean
          referral_code?: string | null
          tier?: Database["public"]["Enums"]["sjoh_tier"]
          tier_expires_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          urgent_alerts_optin?: boolean
          user_id?: string
          whatsapp_alerts_optin?: boolean
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      quote_revisions: {
        Row: {
          created_at: string
          deal_memo_id: string
          id: string
          new_amount_zar: number
          previous_amount_zar: number
          pro_user_id: string
          reason: string
          responded_at: string | null
          responded_by: string | null
          scope_addition: string | null
          status: Database["public"]["Enums"]["quote_revision_status"]
        }
        Insert: {
          created_at?: string
          deal_memo_id: string
          id?: string
          new_amount_zar: number
          previous_amount_zar: number
          pro_user_id: string
          reason: string
          responded_at?: string | null
          responded_by?: string | null
          scope_addition?: string | null
          status?: Database["public"]["Enums"]["quote_revision_status"]
        }
        Update: {
          created_at?: string
          deal_memo_id?: string
          id?: string
          new_amount_zar?: number
          previous_amount_zar?: number
          pro_user_id?: string
          reason?: string
          responded_at?: string | null
          responded_by?: string | null
          scope_addition?: string | null
          status?: Database["public"]["Enums"]["quote_revision_status"]
        }
        Relationships: [
          {
            foreignKeyName: "quote_revisions_deal_memo_id_fkey"
            columns: ["deal_memo_id"]
            isOneToOne: false
            referencedRelation: "deal_memos"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string
          business_id: string
          created_at: string
          deal_memo_id: string | null
          id: string
          is_verified_hire: boolean
          is_verified_transaction: boolean
          rating: number
          reviewer_company: string | null
          reviewer_id: string | null
          reviewer_name: string
          source: string
        }
        Insert: {
          body: string
          business_id: string
          created_at?: string
          deal_memo_id?: string | null
          id?: string
          is_verified_hire?: boolean
          is_verified_transaction?: boolean
          rating: number
          reviewer_company?: string | null
          reviewer_id?: string | null
          reviewer_name: string
          source?: string
        }
        Update: {
          body?: string
          business_id?: string
          created_at?: string
          deal_memo_id?: string | null
          id?: string
          is_verified_hire?: boolean
          is_verified_transaction?: boolean
          rating?: number
          reviewer_company?: string | null
          reviewer_id?: string | null
          reviewer_name?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          price_from: number
          price_type: Database["public"]["Enums"]["price_type"]
          sort_order: number
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price_from?: number
          price_type?: Database["public"]["Enums"]["price_type"]
          sort_order?: number
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price_from?: number
          price_type?: Database["public"]["Enums"]["price_type"]
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      trial_code_redemptions: {
        Row: {
          code: string
          id: string
          redeemed_at: string
          tier: Database["public"]["Enums"]["sjoh_tier"]
          trial_days: number
          trial_ends_at: string
          user_id: string
        }
        Insert: {
          code: string
          id?: string
          redeemed_at?: string
          tier?: Database["public"]["Enums"]["sjoh_tier"]
          trial_days?: number
          trial_ends_at: string
          user_id: string
        }
        Update: {
          code?: string
          id?: string
          redeemed_at?: string
          tier?: Database["public"]["Enums"]["sjoh_tier"]
          trial_days?: number
          trial_ends_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          business_id: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          business_id: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses_public"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      businesses_public: {
        Row: {
          address: string | null
          category_name: string | null
          category_slug: string | null
          certifications: string[] | null
          certified_pro: boolean | null
          city: string | null
          created_at: string | null
          description: string | null
          followers_count: number | null
          hours: string | null
          id: string | null
          image_url: string | null
          is_verified: boolean | null
          logo_url: string | null
          name: string | null
          owner_id: string | null
          plan: Database["public"]["Enums"]["business_plan"] | null
          pre_launch: boolean | null
          province: string | null
          rating: number | null
          response_rate: number | null
          review_count: number | null
          slug: string | null
          tags: string[] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category_name?: string | null
          category_slug?: string | null
          certifications?: string[] | null
          certified_pro?: boolean | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          followers_count?: number | null
          hours?: string | null
          id?: string | null
          image_url?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string | null
          owner_id?: string | null
          plan?: Database["public"]["Enums"]["business_plan"] | null
          pre_launch?: boolean | null
          province?: string | null
          rating?: number | null
          response_rate?: number | null
          review_count?: number | null
          slug?: string | null
          tags?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category_name?: string | null
          category_slug?: string | null
          certifications?: string[] | null
          certified_pro?: boolean | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          followers_count?: number | null
          hours?: string | null
          id?: string | null
          image_url?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string | null
          owner_id?: string | null
          plan?: Database["public"]["Enums"]["business_plan"] | null
          pre_launch?: boolean | null
          province?: string | null
          rating?: number | null
          response_rate?: number | null
          review_count?: number | null
          slug?: string | null
          tags?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      founding_spot_counts: {
        Row: {
          cap: number | null
          claimed: number | null
          remaining: number | null
          role: string | null
        }
        Relationships: []
      }
      opportunities_public: {
        Row: {
          applicants_count: number | null
          attachments: Json | null
          budget: number | null
          budget_type: Database["public"]["Enums"]["budget_type"] | null
          category_name: string | null
          category_slug: string | null
          city: string | null
          client_id: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string | null
          is_concierge_lead: boolean | null
          is_urgent: boolean | null
          posted_by_name: string | null
          province: string | null
          requirements: string[] | null
          status: Database["public"]["Enums"]["opportunity_status"] | null
          title: string | null
          updated_at: string | null
          urgent_boost_amount_cents: number | null
          urgent_boost_paid_at: string | null
        }
        Insert: {
          applicants_count?: number | null
          attachments?: Json | null
          budget?: number | null
          budget_type?: Database["public"]["Enums"]["budget_type"] | null
          category_name?: string | null
          category_slug?: string | null
          city?: string | null
          client_id?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string | null
          is_concierge_lead?: boolean | null
          is_urgent?: boolean | null
          posted_by_name?: string | null
          province?: string | null
          requirements?: string[] | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          title?: string | null
          updated_at?: string | null
          urgent_boost_amount_cents?: number | null
          urgent_boost_paid_at?: string | null
        }
        Update: {
          applicants_count?: number | null
          attachments?: Json | null
          budget?: number | null
          budget_type?: Database["public"]["Enums"]["budget_type"] | null
          category_name?: string | null
          category_slug?: string | null
          city?: string | null
          client_id?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string | null
          is_concierge_lead?: boolean | null
          is_urgent?: boolean | null
          posted_by_name?: string | null
          province?: string | null
          requirements?: string[] | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          title?: string | null
          updated_at?: string | null
          urgent_boost_amount_cents?: number | null
          urgent_boost_paid_at?: string | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          province: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          province?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          province?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_deal_memo: { Args: { _id: string }; Returns: undefined }
      accept_quote: {
        Args: { _proposal_id: string }
        Returns: {
          client_email: string
          client_phone: string
          contact_preference: string
        }[]
      }
      admin_create_founding_signup: {
        Args: { _email: string; _role: string }
        Returns: string
      }
      admin_platform_stats: { Args: never; Returns: Json }
      admin_platform_stats_service: { Args: never; Returns: Json }
      admin_set_founding_spot: {
        Args: { _claimed: boolean; _signup_id: string }
        Returns: boolean
      }
      apply_pro_referral_reward: {
        Args: { _referee_user_id: string }
        Returns: undefined
      }
      apply_subscription_payment:
        | {
            Args: {
              _customer_code: string
              _next_renewal: string
              _subscription_code: string
              _tier: Database["public"]["Enums"]["sjoh_tier"]
              _user_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              _billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
              _next_renewal: string
              _payfast_subscription_token: string
              _payfast_token: string
              _tier: Database["public"]["Enums"]["sjoh_tier"]
              _user_id: string
            }
            Returns: undefined
          }
      apply_urgent_boost: {
        Args: {
          _amount_cents: number
          _opportunity_id: string
          _reference: string
          _user_id: string
        }
        Returns: boolean
      }
      bump_last_active: { Args: never; Returns: undefined }
      business_avg_response_hours: {
        Args: { _business_id: string }
        Returns: number
      }
      business_last_completed_at: {
        Args: { _business_id: string }
        Returns: string
      }
      business_lead_count: {
        Args: { _business_id: string; _since?: string }
        Returns: number
      }
      business_verified_hires_count: {
        Args: { _business_id: string }
        Returns: number
      }
      can_use_founding_proposal: {
        Args: { _user_id: string }
        Returns: boolean
      }
      cancel_deal_memo: { Args: { _id: string }; Returns: undefined }
      cancel_quote_revision: {
        Args: { _revision_id: string }
        Returns: undefined
      }
      check_rate_limit: {
        Args: { _action: string; _max: number; _window_seconds: number }
        Returns: undefined
      }
      claim_founding_spot: { Args: { _signup_id: string }; Returns: boolean }
      claim_hermes_task: {
        Args: { _worker_id: string }
        Returns: {
          attempts: number
          campaign_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          next_run_at: string
          payload: Json
          priority: number
          result: Json | null
          status: string
          task_type: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "hermes_tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_referral_code: { Args: { _code: string }; Returns: string }
      complete_deal_memo: { Args: { _id: string }; Returns: undefined }
      count_active_pros: {
        Args: { _category_slug: string; _city?: string; _province: string }
        Returns: number
      }
      current_user_roles: { Args: never; Returns: string[] }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      find_fallback_pros_for_opportunity: {
        Args: { _opportunity_id: string }
        Returns: {
          city: string
          id: string
          name: string
          province: string
          rating: number
          review_count: number
          slug: string
        }[]
      }
      generate_referral_code: { Args: never; Returns: string }
      get_founding_spot_counts: {
        Args: never
        Returns: {
          cap: number
          claimed: number
          remaining: number
          role: string
        }[]
      }
      get_founding_spots_remaining: { Args: never; Returns: number }
      get_my_opportunity: {
        Args: { _id: string }
        Returns: {
          attachments: Json
          budget: number
          category_name: string
          category_slug: string
          city: string
          client_email: string
          client_phone: string
          contact_preference: string
          created_at: string
          description: string
          id: string
          is_urgent: boolean
          province: string
          status: Database["public"]["Enums"]["opportunity_status"]
          title: string
        }[]
      }
      get_my_referral_summary: {
        Args: never
        Returns: {
          pending_count: number
          redeemed_count: number
          referral_code: string
          total_free_months: number
        }[]
      }
      get_opportunity_for_viewer: {
        Args: { _opportunity_id: string }
        Returns: {
          applicants_count: number
          attachments: Json
          budget: number
          budget_type: Database["public"]["Enums"]["budget_type"]
          can_view_full: boolean
          category_name: string
          category_slug: string
          city: string
          created_at: string
          deadline: string
          description: string
          id: string
          is_urgent: boolean
          posted_by_name: string
          province: string
          requirements: string[]
          status: Database["public"]["Enums"]["opportunity_status"]
          title: string
        }[]
      }
      get_revealed_contact: {
        Args: { _proposal_id: string }
        Returns: {
          client_email: string
          client_phone: string
          contact_preference: string
          reason: string
          revealed: boolean
        }[]
      }
      has_active_listing_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_verified_pro_access: { Args: { _user_id: string }; Returns: boolean }
      is_founding_member: { Args: { _user_id: string }; Returns: boolean }
      lapse_subscription: {
        Args: { _subscription_token: string }
        Returns: undefined
      }
      lock_lapsed_trials: { Args: never; Returns: number }
      mark_chaser_sent: { Args: { _id: string }; Returns: undefined }
      mark_deal_memo_complete: {
        Args: {
          _completion_notes?: string
          _completion_photo_url?: string
          _deal_memo_id: string
        }
        Returns: {
          accepted_at: string | null
          business_id: string
          cancelled_at: string | null
          client_email: string
          client_phone: string | null
          client_user_id: string | null
          completed_at: string | null
          completion_notes: string | null
          completion_photo_url: string | null
          created_at: string
          id: string
          job_title: string
          pro_user_id: string
          review_chaser_sent_at: string | null
          scope_of_work: string
          status: Database["public"]["Enums"]["deal_memo_status"]
          total_amount_zar: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "deal_memos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      provider_status: { Args: { _user_id: string }; Returns: string }
      reactivate_listing: { Args: { _business_id: string }; Returns: boolean }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      recompute_trust_score: {
        Args: { _business_id: string }
        Returns: undefined
      }
      redeem_trial_code: {
        Args: { _code: string }
        Returns: {
          code: string
          tier: Database["public"]["Enums"]["sjoh_tier"]
          trial_ends_at: string
        }[]
      }
      report_business: {
        Args: { _business_id: string; _details?: string; _reason: string }
        Returns: string
      }
      request_quote_revision: {
        Args: {
          _deal_memo_id: string
          _new_amount: number
          _reason: string
          _scope_addition?: string
        }
        Returns: string
      }
      respond_to_quote_revision: {
        Args: { _accept: boolean; _revision_id: string }
        Returns: undefined
      }
      reveal_contact: {
        Args: { _business_id: string }
        Returns: {
          email: string
          phone: string
        }[]
      }
      review_link_status: {
        Args: { _business_slug: string }
        Returns: {
          active: boolean
          business_name: string
        }[]
      }
      run_lifecycle_sweep: { Args: never; Returns: Json }
      set_business_pre_launch: {
        Args: { _business_id: string; _pre_launch: boolean }
        Returns: boolean
      }
      set_email_alerts_optin: {
        Args: { _enabled: boolean }
        Returns: undefined
      }
      set_push_subscription: {
        Args: { _enabled: boolean; _player_id: string }
        Returns: undefined
      }
      set_secondary_categories: {
        Args: { _business_id: string; _slugs: string[] }
        Returns: undefined
      }
      set_whatsapp_alerts: {
        Args: { _enabled: boolean; _number: string }
        Returns: undefined
      }
      submit_invited_review: {
        Args: {
          _body: string
          _business_slug: string
          _rating: number
          _reviewer_company?: string
          _reviewer_name: string
        }
        Returns: string
      }
      submit_proposal: {
        Args: {
          _business_id: string
          _message: string
          _opportunity_id: string
          _quote_amount: number
        }
        Returns: string
      }
      submit_verified_review: {
        Args: {
          _body: string
          _deal_memo_id: string
          _rating: number
          _reviewer_company?: string
          _reviewer_name: string
        }
        Returns: string
      }
      suspend_pro_from_dispute: {
        Args: { _dispute_id: string; _reason?: string }
        Returns: undefined
      }
      transition_listing_states: {
        Args: never
        Returns: {
          to_archived: number
          to_dormant: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "business_owner" | "client"
      billing_cycle: "monthly" | "annual"
      budget_type: "fixed" | "estimate" | "negotiable"
      business_plan: "free" | "standard" | "featured"
      deal_memo_status: "pending" | "accepted" | "completed" | "cancelled"
      dispute_category:
        | "fraud"
        | "no_show"
        | "poor_workmanship"
        | "safety"
        | "harassment"
        | "payment"
        | "identity"
        | "other"
      dispute_severity: "low" | "medium" | "high" | "critical"
      dispute_status:
        | "open"
        | "investigating"
        | "pro_suspended"
        | "data_provided"
        | "resolved"
        | "rejected"
      opportunity_status: "open" | "closed" | "awarded"
      payment_event_kind:
        | "subscription_charge"
        | "subscription_disable"
        | "subscription_payment_failed"
        | "klap_topup_charge"
        | "urgent_fee_charge"
        | "other"
        | "urgent_boost"
        | "subscription_cancelled"
      price_type: "fixed" | "from" | "quote"
      pro_referral_status: "pending" | "redeemed" | "expired"
      proposal_status:
        | "pending"
        | "shortlisted"
        | "won"
        | "lost"
        | "withdrawn"
        | "accepted"
      quote_revision_status: "pending" | "accepted" | "rejected" | "cancelled"
      sjoh_tier:
        | "none"
        | "basic_trial"
        | "basic"
        | "verified_pro_trial"
        | "verified_pro"
        | "locked"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "business_owner", "client"],
      billing_cycle: ["monthly", "annual"],
      budget_type: ["fixed", "estimate", "negotiable"],
      business_plan: ["free", "standard", "featured"],
      deal_memo_status: ["pending", "accepted", "completed", "cancelled"],
      dispute_category: [
        "fraud",
        "no_show",
        "poor_workmanship",
        "safety",
        "harassment",
        "payment",
        "identity",
        "other",
      ],
      dispute_severity: ["low", "medium", "high", "critical"],
      dispute_status: [
        "open",
        "investigating",
        "pro_suspended",
        "data_provided",
        "resolved",
        "rejected",
      ],
      opportunity_status: ["open", "closed", "awarded"],
      payment_event_kind: [
        "subscription_charge",
        "subscription_disable",
        "subscription_payment_failed",
        "klap_topup_charge",
        "urgent_fee_charge",
        "other",
        "urgent_boost",
        "subscription_cancelled",
      ],
      price_type: ["fixed", "from", "quote"],
      pro_referral_status: ["pending", "redeemed", "expired"],
      proposal_status: [
        "pending",
        "shortlisted",
        "won",
        "lost",
        "withdrawn",
        "accepted",
      ],
      quote_revision_status: ["pending", "accepted", "rejected", "cancelled"],
      sjoh_tier: [
        "none",
        "basic_trial",
        "basic",
        "verified_pro_trial",
        "verified_pro",
        "locked",
      ],
    },
  },
} as const
