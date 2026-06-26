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
      audit_log: {
        Row: {
          action: string
          id: string
          ip_address: unknown
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      banana_account_mappings: {
        Row: {
          account_debit: string
          category_key: string
          category_label: string
          created_at: string
          id: string
          is_default: boolean
          unternehmen_id: string
          updated_at: string
          vat_code: string | null
        }
        Insert: {
          account_debit: string
          category_key: string
          category_label: string
          created_at?: string
          id?: string
          is_default?: boolean
          unternehmen_id: string
          updated_at?: string
          vat_code?: string | null
        }
        Update: {
          account_debit?: string
          category_key?: string
          category_label?: string
          created_at?: string
          id?: string
          is_default?: boolean
          unternehmen_id?: string
          updated_at?: string
          vat_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banana_account_mappings_unternehmen_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: false
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
        ]
      }
      banana_export_counters: {
        Row: {
          current_count: number
          current_year: number
          unternehmen_id: string
          updated_at: string
        }
        Insert: {
          current_count?: number
          current_year: number
          unternehmen_id: string
          updated_at?: string
        }
        Update: {
          current_count?: number
          current_year?: number
          unternehmen_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banana_export_counters_unternehmen_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: true
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
        ]
      }
      client_note_audit: {
        Row: {
          action: string
          client_id: string
          created_at: string
          id: string
          note_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          client_id: string
          created_at?: string
          id?: string
          note_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          client_id?: string
          created_at?: string
          id?: string
          note_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_note_audit_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "client_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          author_id: string | null
          client_id: string | null
          company_id: string | null
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          session_date: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          client_id?: string | null
          company_id?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          session_date?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          client_id?: string | null
          company_id?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          session_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          birthdate: string | null
          city: string | null
          company_id: string
          contact_person: string | null
          contact_person_first_name: string | null
          contact_person_last_name: string | null
          contact_person_salutation:
            | Database["public"]["Enums"]["salutation_t"]
            | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          notes: string | null
          salutation: Database["public"]["Enums"]["salutation_t"] | null
          unternehmen_id: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          birthdate?: string | null
          city?: string | null
          company_id: string
          contact_person?: string | null
          contact_person_first_name?: string | null
          contact_person_last_name?: string | null
          contact_person_salutation?:
            | Database["public"]["Enums"]["salutation_t"]
            | null
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          salutation?: Database["public"]["Enums"]["salutation_t"] | null
          unternehmen_id?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          birthdate?: string | null
          city?: string | null
          company_id?: string
          contact_person?: string | null
          contact_person_first_name?: string | null
          contact_person_last_name?: string | null
          contact_person_salutation?:
            | Database["public"]["Enums"]["salutation_t"]
            | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          salutation?: Database["public"]["Enums"]["salutation_t"] | null
          unternehmen_id?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_erp_company_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: false
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          expense_view_preference: string
          first_name: string
          hourly_rate: number
          id: string
          km_rate: number | null
          last_name: string
          phone: string | null
          unternehmen_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expense_view_preference?: string
          first_name: string
          hourly_rate?: number
          id: string
          km_rate?: number | null
          last_name: string
          phone?: string | null
          unternehmen_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expense_view_preference?: string
          first_name?: string
          hourly_rate?: number
          id?: string
          km_rate?: number | null
          last_name?: string
          phone?: string | null
          unternehmen_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_erp_company_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: false
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          unternehmen_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          unternehmen_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          unternehmen_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_erp_company_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: false
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_line_items: {
        Row: {
          ai_confidence: number | null
          amount: number
          banana_category_key: string | null
          category: string | null
          created_at: string
          description: string
          expense_id: string
          id: string
          position: number
          updated_at: string
        }
        Insert: {
          ai_confidence?: number | null
          amount: number
          banana_category_key?: string | null
          category?: string | null
          created_at?: string
          description: string
          expense_id: string
          id?: string
          position: number
          updated_at?: string
        }
        Update: {
          ai_confidence?: number | null
          amount?: number
          banana_category_key?: string | null
          category?: string | null
          created_at?: string
          description?: string
          expense_id?: string
          id?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_line_items_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          ai_confidence: number | null
          ai_model_used: string | null
          amount: number
          banana_category_key: string | null
          banana_exported_at: string | null
          banana_external_ref: string | null
          banana_payment_method: string | null
          category: string
          client_id: string | null
          company_id: string | null
          created_at: string
          employee_id: string
          expense_date: string
          extracted_at: string | null
          id: string
          imported_via_bono: boolean | null
          is_recurring_monthly: boolean | null
          notes: string | null
          processing_error: string | null
          receipt_image_url: string | null
          recurrence_frequency: string | null
          recurring_expense_id: string | null
          status: string
          unternehmen_id: string | null
          updated_at: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_model_used?: string | null
          amount: number
          banana_category_key?: string | null
          banana_exported_at?: string | null
          banana_external_ref?: string | null
          banana_payment_method?: string | null
          category: string
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          employee_id: string
          expense_date: string
          extracted_at?: string | null
          id?: string
          imported_via_bono?: boolean | null
          is_recurring_monthly?: boolean | null
          notes?: string | null
          processing_error?: string | null
          receipt_image_url?: string | null
          recurrence_frequency?: string | null
          recurring_expense_id?: string | null
          status?: string
          unternehmen_id?: string | null
          updated_at?: string
        }
        Update: {
          ai_confidence?: number | null
          ai_model_used?: string | null
          amount?: number
          banana_category_key?: string | null
          banana_exported_at?: string | null
          banana_external_ref?: string | null
          banana_payment_method?: string | null
          category?: string
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          employee_id?: string
          expense_date?: string
          extracted_at?: string | null
          id?: string
          imported_via_bono?: boolean | null
          is_recurring_monthly?: boolean | null
          notes?: string | null
          processing_error?: string | null
          receipt_image_url?: string | null
          recurrence_frequency?: string | null
          recurring_expense_id?: string | null
          status?: string
          unternehmen_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_erp_company_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: false
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_recurring_expense_id_fkey"
            columns: ["recurring_expense_id"]
            isOneToOne: false
            referencedRelation: "recurring_expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      html_invoice_templates: {
        Row: {
          created_at: string | null
          css_content: string
          html_content: string
          id: string
          name: string
          unternehmen_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          css_content?: string
          html_content: string
          id?: string
          name: string
          unternehmen_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          css_content?: string
          html_content?: string
          id?: string
          name?: string
          unternehmen_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "html_invoice_templates_erp_company_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: false
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_templates: {
        Row: {
          ai_agent_history: Json | null
          ai_supervisor_feedback: Json | null
          ai_supervisor_html: string | null
          created_at: string | null
          css_url: string | null
          deckblatt_css: string | null
          deckblatt_enabled: boolean | null
          deckblatt_html: string | null
          editable_css: string | null
          editable_html: string | null
          file_url: string
          html_url: string | null
          id: string
          mapping: Json | null
          name: string
          unternehmen_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_agent_history?: Json | null
          ai_supervisor_feedback?: Json | null
          ai_supervisor_html?: string | null
          created_at?: string | null
          css_url?: string | null
          deckblatt_css?: string | null
          deckblatt_enabled?: boolean | null
          deckblatt_html?: string | null
          editable_css?: string | null
          editable_html?: string | null
          file_url: string
          html_url?: string | null
          id?: string
          mapping?: Json | null
          name: string
          unternehmen_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_agent_history?: Json | null
          ai_supervisor_feedback?: Json | null
          ai_supervisor_html?: string | null
          created_at?: string | null
          css_url?: string | null
          deckblatt_css?: string | null
          deckblatt_enabled?: boolean | null
          deckblatt_html?: string | null
          editable_css?: string | null
          editable_html?: string | null
          file_url?: string
          html_url?: string | null
          id?: string
          mapping?: Json | null
          name?: string
          unternehmen_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_templates_erp_company_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: false
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          company_id: string
          created_at: string
          id: string
          invoice_number: string
          pdf_url: string | null
          period_end: string
          period_start: string
          status: string
          subtotal: number
          total: number
          unternehmen_id: string | null
          updated_at: string
          vat_amount: number
          work_report_url: string | null
        }
        Insert: {
          client_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          invoice_number: string
          pdf_url?: string | null
          period_end: string
          period_start: string
          status?: string
          subtotal?: number
          total?: number
          unternehmen_id?: string | null
          updated_at?: string
          vat_amount?: number
          work_report_url?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          invoice_number?: string
          pdf_url?: string | null
          period_end?: string
          period_start?: string
          status?: string
          subtotal?: number
          total?: number
          unternehmen_id?: string | null
          updated_at?: string
          vat_amount?: number
          work_report_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_erp_company_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: false
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
        ]
      }
      kunden: {
        Row: {
          address: string | null
          birthdate: string | null
          building_number: string | null
          city: string | null
          contact_person: string | null
          contact_person_first_name: string | null
          contact_person_last_name: string | null
          contact_person_salutation:
            | Database["public"]["Enums"]["salutation_t"]
            | null
          country: string | null
          created_at: string
          customer_type: string | null
          email: string | null
          iban: string | null
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
          salutation: Database["public"]["Enums"]["salutation_t"] | null
          unternehmen_id: string | null
          updated_at: string
          vat_number: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          birthdate?: string | null
          building_number?: string | null
          city?: string | null
          contact_person?: string | null
          contact_person_first_name?: string | null
          contact_person_last_name?: string | null
          contact_person_salutation?:
            | Database["public"]["Enums"]["salutation_t"]
            | null
          country?: string | null
          created_at?: string
          customer_type?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          salutation?: Database["public"]["Enums"]["salutation_t"] | null
          unternehmen_id?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          birthdate?: string | null
          building_number?: string | null
          city?: string | null
          contact_person?: string | null
          contact_person_first_name?: string | null
          contact_person_last_name?: string | null
          contact_person_salutation?:
            | Database["public"]["Enums"]["salutation_t"]
            | null
          country?: string | null
          created_at?: string
          customer_type?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          salutation?: Database["public"]["Enums"]["salutation_t"] | null
          unternehmen_id?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_erp_company_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: false
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_expenses: {
        Row: {
          amount: number
          category: string
          company_id: string | null
          created_at: string | null
          employee_id: string
          frequency: string | null
          id: string
          interval: number | null
          interval_months: number | null
          is_active: boolean | null
          last_generated_date: string | null
          notes: string | null
          receipt_image_url: string | null
          recurrence_day: number | null
          start_date: string
          unternehmen_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          company_id?: string | null
          created_at?: string | null
          employee_id: string
          frequency?: string | null
          id?: string
          interval?: number | null
          interval_months?: number | null
          is_active?: boolean | null
          last_generated_date?: string | null
          notes?: string | null
          receipt_image_url?: string | null
          recurrence_day?: number | null
          start_date: string
          unternehmen_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          company_id?: string | null
          created_at?: string | null
          employee_id?: string
          frequency?: string | null
          id?: string
          interval?: number | null
          interval_months?: number | null
          is_active?: boolean | null
          last_generated_date?: string | null
          notes?: string | null
          receipt_image_url?: string | null
          recurrence_day?: number | null
          start_date?: string
          unternehmen_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_expenses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_expenses_erp_company_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: false
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
        ]
      }
      system_error_log: {
        Row: {
          context: Json | null
          created_at: string
          error_message: string
          error_type: string
          id: string
          notified: boolean
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          error_message: string
          error_type: string
          id?: string
          notified?: boolean
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          error_message?: string
          error_type?: string
          id?: string
          notified?: boolean
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          activity_description: string | null
          category: string | null
          client_id: string | null
          company_id: string
          created_at: string
          date: string
          employee_id: string
          end_time: string
          id: string
          internal_notes: string | null
          invoice_id: string | null
          is_billed: boolean | null
          start_time: string
          total_hours: number
          travel_distance_km: number | null
          travel_expense_amount: number | null
          travel_from: string | null
          travel_to: string | null
          unternehmen_id: string | null
          updated_at: string
        }
        Insert: {
          activity_description?: string | null
          category?: string | null
          client_id?: string | null
          company_id: string
          created_at?: string
          date: string
          employee_id: string
          end_time: string
          id?: string
          internal_notes?: string | null
          invoice_id?: string | null
          is_billed?: boolean | null
          start_time: string
          total_hours: number
          travel_distance_km?: number | null
          travel_expense_amount?: number | null
          travel_from?: string | null
          travel_to?: string | null
          unternehmen_id?: string | null
          updated_at?: string
        }
        Update: {
          activity_description?: string | null
          category?: string | null
          client_id?: string | null
          company_id?: string
          created_at?: string
          date?: string
          employee_id?: string
          end_time?: string
          id?: string
          internal_notes?: string | null
          invoice_id?: string | null
          is_billed?: boolean | null
          start_time?: string
          total_hours?: number
          travel_distance_km?: number | null
          travel_expense_amount?: number | null
          travel_from?: string | null
          travel_to?: string | null
          unternehmen_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_erp_company_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: false
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entry_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          unternehmen_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          unternehmen_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          unternehmen_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entry_categories_erp_company_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: false
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
        ]
      }
      unternehmen: {
        Row: {
          address: string | null
          banana_default_payment_method: string | null
          banana_export_enabled: boolean
          banana_export_granularity: string | null
          building_number: string | null
          city: string | null
          client_hierarchy_mode: string
          client_notes_visibility: string
          company_name: string
          country: string | null
          created_at: string
          default_invoice_template_id: string | null
          email: string | null
          expense_client_linking_enabled: boolean
          expense_line_items_enabled: boolean
          iban: string | null
          id: string
          is_mwst_pflichtig: boolean | null
          logo_url: string | null
          phone: string | null
          spesen_hauptordner_id: string | null
          spesen_speicherort: string | null
          updated_at: string
          user_id: string | null
          vat_number: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          banana_default_payment_method?: string | null
          banana_export_enabled?: boolean
          banana_export_granularity?: string | null
          building_number?: string | null
          city?: string | null
          client_hierarchy_mode?: string
          client_notes_visibility?: string
          company_name: string
          country?: string | null
          created_at?: string
          default_invoice_template_id?: string | null
          email?: string | null
          expense_client_linking_enabled?: boolean
          expense_line_items_enabled?: boolean
          iban?: string | null
          id?: string
          is_mwst_pflichtig?: boolean | null
          logo_url?: string | null
          phone?: string | null
          spesen_hauptordner_id?: string | null
          spesen_speicherort?: string | null
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          banana_default_payment_method?: string | null
          banana_export_enabled?: boolean
          banana_export_granularity?: string | null
          building_number?: string | null
          city?: string | null
          client_hierarchy_mode?: string
          client_notes_visibility?: string
          company_name?: string
          country?: string | null
          created_at?: string
          default_invoice_template_id?: string | null
          email?: string | null
          expense_client_linking_enabled?: boolean
          expense_line_items_enabled?: boolean
          iban?: string | null
          id?: string
          is_mwst_pflichtig?: boolean | null
          logo_url?: string | null
          phone?: string | null
          spesen_hauptordner_id?: string | null
          spesen_speicherort?: string | null
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unternehmen_default_invoice_template_id_fkey"
            columns: ["default_invoice_template_id"]
            isOneToOne: false
            referencedRelation: "invoice_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      unternehmen_settings_audit: {
        Row: {
          changed_at: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          unternehmen_id: string
          user_id: string | null
        }
        Insert: {
          changed_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          unternehmen_id: string
          user_id?: string | null
        }
        Update: {
          changed_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          unternehmen_id?: string
          user_id?: string | null
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
    }
    Views: {
      unbilled_time_entries: {
        Row: {
          activity_description: string | null
          category: string | null
          client_id: string | null
          client_name: string | null
          company_id: string | null
          company_name: string | null
          created_at: string | null
          date: string | null
          employee_id: string | null
          employee_name: string | null
          end_time: string | null
          hourly_rate: number | null
          id: string | null
          internal_notes: string | null
          invoice_id: string | null
          is_billed: boolean | null
          labor_cost: number | null
          start_time: string | null
          total_cost: number | null
          total_hours: number | null
          travel_cost: number | null
          travel_distance_km: number | null
          travel_expense_amount: number | null
          travel_from: string | null
          travel_to: string | null
          unternehmen_id: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_erp_company_id_fkey"
            columns: ["unternehmen_id"]
            isOneToOne: false
            referencedRelation: "unternehmen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      banana_default_mapping_seeds: {
        Args: never
        Returns: {
          account_debit: string
          category_key: string
          category_label: string
          vat_code: string | null
        }[]
      }
      get_user_erp_company_id: { Args: never; Returns: string }
      get_user_notes_visibility: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invoke_expense_ai_extraction: {
        Args: { _expense_id: string }
        Returns: undefined
      }
      next_banana_external_ref: {
        Args: { p_unternehmen_id: string }
        Returns: string
      }
      reset_banana_mapping: {
        Args: { p_unternehmen_id: string; p_category_key: string }
        Returns: Database["public"]["Tables"]["banana_account_mappings"]["Row"]
      }
      seed_banana_default_mappings: {
        Args: { p_unternehmen_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "employee"
      salutation_t: "Herr" | "Frau" | "Divers"
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
      app_role: ["admin", "employee"],
      salutation_t: ["Herr", "Frau", "Divers"],
    },
  },
} as const
