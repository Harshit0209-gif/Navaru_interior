// Hand-written mirror of supabase/schema.sql. Keep in sync when the schema changes.

export type ProjectStatus = 'Completed' | 'Ongoing' | 'Upcoming'
export type PublishStatus = 'draft' | 'published' | 'archived'
export type BookingStatus = 'new' | 'pending' | 'contacted' | 'completed' | 'rejected'
export type EnquiryStatus = 'unread' | 'read' | 'replied' | 'archived'
export type MediaBucket = 'portfolio-images' | 'website-assets'

// Item shapes for the jsonb array columns on `site_content`.
export interface StatItem {
  value: number
  suffix: string
  label: string
}
export interface ServiceItem {
  icon: string
  title: string
  description: string
  bullets: string[]
  image_url: string | null
}
export interface TestimonialItem {
  quote: string
  name: string
  role: string
}
export interface ValueItem {
  icon: string
  title: string
  description: string
}
export interface ProcessStepItem {
  title: string
  description: string
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          display_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          id: string
          slug: string
          title: string
          category_id: string | null
          location: string | null
          completion_year: number | null
          short_description: string
          detailed_description: string | null
          cover_image_url: string
          client_name: string | null
          area: string | null
          services_provided: string[]
          project_status: ProjectStatus
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string[]
          status: PublishStatus
          is_featured: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          category_id?: string | null
          location?: string | null
          completion_year?: number | null
          short_description: string
          detailed_description?: string | null
          cover_image_url: string
          client_name?: string | null
          area?: string | null
          services_provided?: string[]
          project_status?: ProjectStatus
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[]
          status?: PublishStatus
          is_featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['portfolio_projects']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'portfolio_projects_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      portfolio_images: {
        Row: {
          id: string
          project_id: string
          image_url: string
          alt_text: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          image_url: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['portfolio_images']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'portfolio_images_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'portfolio_projects'
            referencedColumns: ['id']
          },
        ]
      }
      book_design_requests: {
        Row: {
          id: string
          project_id: string | null
          project_name: string
          customer_name: string
          phone: string
          email: string
          city: string | null
          state: string | null
          country: string | null
          address: string | null
          property_type: string | null
          design_type: string | null
          budget: string | null
          preferred_date: string | null
          message: string | null
          attachment_url: string | null
          status: BookingStatus
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          project_name: string
          customer_name: string
          phone: string
          email: string
          city?: string | null
          state?: string | null
          country?: string | null
          address?: string | null
          property_type?: string | null
          design_type?: string | null
          budget?: string | null
          preferred_date?: string | null
          message?: string | null
          attachment_url?: string | null
          status?: BookingStatus
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['book_design_requests']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'book_design_requests_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'portfolio_projects'
            referencedColumns: ['id']
          },
        ]
      }
      contact_enquiries: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string
          subject: string | null
          message: string
          attachment_url: string | null
          status: EnquiryStatus
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email: string
          subject?: string | null
          message: string
          attachment_url?: string | null
          status?: EnquiryStatus
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['contact_enquiries']['Insert']>
        Relationships: []
      }
      media_assets: {
        Row: {
          id: string
          bucket_id: MediaBucket
          folder: string
          file_name: string
          file_path: string
          public_url: string
          mime_type: string
          size_bytes: number
          width: number | null
          height: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bucket_id: MediaBucket
          folder?: string
          file_name: string
          file_path: string
          public_url: string
          mime_type: string
          size_bytes: number
          width?: number | null
          height?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['media_assets']['Insert']>
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          company_name: string
          logo_url: string | null
          favicon_url: string | null
          contact_phones: string[]
          whatsapp_number: string | null
          email: string | null
          address: string | null
          google_maps_embed_url: string | null
          social_instagram: string | null
          social_facebook: string | null
          social_linkedin: string | null
          social_pinterest: string | null
          social_youtube: string | null
          social_twitter: string | null
          footer_tagline: string | null
          footer_cta_heading: string | null
          footer_bottom_tagline: string | null
          seo_default_title: string | null
          seo_default_description: string | null
          seo_og_image_url: string | null
          seo_keywords: string[]
          ga_measurement_id: string | null
          meta_theme_color: string | null
          meta_robots: string
          google_site_verification: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          company_name?: string
          logo_url?: string | null
          favicon_url?: string | null
          contact_phones?: string[]
          whatsapp_number?: string | null
          email?: string | null
          address?: string | null
          google_maps_embed_url?: string | null
          social_instagram?: string | null
          social_facebook?: string | null
          social_linkedin?: string | null
          social_pinterest?: string | null
          social_youtube?: string | null
          social_twitter?: string | null
          footer_tagline?: string | null
          footer_cta_heading?: string | null
          footer_bottom_tagline?: string | null
          seo_default_title?: string | null
          seo_default_description?: string | null
          seo_og_image_url?: string | null
          seo_keywords?: string[]
          ga_measurement_id?: string | null
          meta_theme_color?: string | null
          meta_robots?: string
          google_site_verification?: string | null
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>
        Relationships: []
      }
      site_content: {
        Row: {
          id: string
          hero_kicker: string | null
          hero_headline: string | null
          hero_subtext: string | null
          hero_cta_primary_label: string | null
          hero_cta_secondary_label: string | null
          hero_image_url: string | null
          hero_video_url: string | null
          about_eyebrow: string | null
          about_title: string | null
          about_body: string | null
          mission_title: string | null
          mission_body: string | null
          vision_title: string | null
          vision_body: string | null
          philosophy_eyebrow: string | null
          philosophy_title: string | null
          philosophy_body: string | null
          services_summary_eyebrow: string | null
          services_summary_title: string | null
          services_summary_body: string | null
          portfolio_eyebrow: string | null
          portfolio_title: string | null
          portfolio_button_label: string | null
          about_page_eyebrow: string | null
          about_page_title: string | null
          about_page_description: string | null
          about_story_eyebrow: string | null
          about_story_title: string | null
          about_story_body: string | null
          about_story_image_url: string | null
          values_eyebrow: string | null
          values_title: string | null
          process_eyebrow: string | null
          process_title: string | null
          process_body: string | null
          services_page_eyebrow: string | null
          services_page_title: string | null
          services_page_description: string | null
          services_cta_eyebrow: string | null
          services_cta_heading: string | null
          services_cta_button_label: string | null
          contact_page_eyebrow: string | null
          contact_page_title: string | null
          contact_page_description: string | null
          stats: StatItem[]
          services: ServiceItem[]
          testimonials: TestimonialItem[]
          values: ValueItem[]
          process_steps: ProcessStepItem[]
          updated_at: string
        }
        Insert: {
          id?: string
          hero_kicker?: string | null
          hero_headline?: string | null
          hero_subtext?: string | null
          hero_cta_primary_label?: string | null
          hero_cta_secondary_label?: string | null
          hero_image_url?: string | null
          hero_video_url?: string | null
          about_eyebrow?: string | null
          about_title?: string | null
          about_body?: string | null
          mission_title?: string | null
          mission_body?: string | null
          vision_title?: string | null
          vision_body?: string | null
          philosophy_eyebrow?: string | null
          philosophy_title?: string | null
          philosophy_body?: string | null
          services_summary_eyebrow?: string | null
          services_summary_title?: string | null
          services_summary_body?: string | null
          portfolio_eyebrow?: string | null
          portfolio_title?: string | null
          portfolio_button_label?: string | null
          about_page_eyebrow?: string | null
          about_page_title?: string | null
          about_page_description?: string | null
          about_story_eyebrow?: string | null
          about_story_title?: string | null
          about_story_body?: string | null
          about_story_image_url?: string | null
          values_eyebrow?: string | null
          values_title?: string | null
          process_eyebrow?: string | null
          process_title?: string | null
          process_body?: string | null
          services_page_eyebrow?: string | null
          services_page_title?: string | null
          services_page_description?: string | null
          services_cta_eyebrow?: string | null
          services_cta_heading?: string | null
          services_cta_button_label?: string | null
          contact_page_eyebrow?: string | null
          contact_page_title?: string | null
          contact_page_description?: string | null
          stats?: StatItem[]
          services?: ServiceItem[]
          testimonials?: TestimonialItem[]
          values?: ValueItem[]
          process_steps?: ProcessStepItem[]
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['site_content']['Insert']>
        Relationships: []
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          user_email: string | null
          action: string
          record_type: string | null
          record_id: string | null
          description: string
          metadata: Record<string, unknown> | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          action: string
          record_type?: string | null
          record_id?: string | null
          description: string
          metadata?: Record<string, unknown> | null
          ip_address?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
