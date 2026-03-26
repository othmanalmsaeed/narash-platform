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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string | null
          date: string
          entry_time: string | null
          exit_time: string | null
          id: string
          placement_id: string
          recorded_by: string
          school_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          entry_time?: string | null
          exit_time?: string | null
          id?: string
          placement_id: string
          recorded_by: string
          school_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          entry_time?: string | null
          exit_time?: string | null
          id?: string
          placement_id?: string
          recorded_by?: string
          school_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_placement_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["audit_action"]
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_value: Json | null
          previous_value: Json | null
          reason: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          school_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          previous_value?: Json | null
          reason?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          school_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          previous_value?: Json | null
          reason?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          school_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_records: {
        Row: {
          checked: boolean | null
          checked_by: string | null
          created_at: string | null
          date: string | null
          id: string
          school_id: string
          skill_category: string
          skill_name: string
          student_id: string
        }
        Insert: {
          checked?: boolean | null
          checked_by?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          school_id: string
          skill_category: string
          skill_name: string
          student_id: string
        }
        Update: {
          checked?: boolean | null
          checked_by?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          school_id?: string
          skill_category?: string
          skill_name?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_records_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          accreditation_status:
            | Database["public"]["Enums"]["accreditation_status"]
            | null
          capacity: number
          company_size: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          region: string
          school_id: string
          sector: string
          updated_at: string | null
        }
        Insert: {
          accreditation_status?:
            | Database["public"]["Enums"]["accreditation_status"]
            | null
          capacity?: number
          company_size?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          region: string
          school_id: string
          sector: string
          updated_at?: string | null
        }
        Update: {
          accreditation_status?:
            | Database["public"]["Enums"]["accreditation_status"]
            | null
          capacity?: number
          company_size?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          region?: string
          school_id?: string
          sector?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      corrective_action_plans: {
        Row: {
          created_at: string | null
          created_by: string
          deadline: string
          id: string
          outcome_notes: string | null
          plan_description: string
          school_id: string
          status: Database["public"]["Enums"]["corrective_status"]
          student_id: string
          updated_at: string | null
          violation_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deadline: string
          id?: string
          outcome_notes?: string | null
          plan_description: string
          school_id: string
          status?: Database["public"]["Enums"]["corrective_status"]
          student_id: string
          updated_at?: string | null
          violation_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deadline?: string
          id?: string
          outcome_notes?: string | null
          plan_description?: string
          school_id?: string
          status?: Database["public"]["Enums"]["corrective_status"]
          student_id?: string
          updated_at?: string | null
          violation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "corrective_action_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_action_plans_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_action_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_action_plans_violation_id_fkey"
            columns: ["violation_id"]
            isOneToOne: false
            referencedRelation: "policy_violations"
            referencedColumns: ["id"]
          },
        ]
      }
      cross_school_training_requests: {
        Row: {
          created_at: string | null
          destination_approved_at: string | null
          destination_approved_by: string | null
          destination_school_id: string
          id: string
          objective_id: string
          reason: string
          rejection_reason: string | null
          source_approved_at: string | null
          source_approved_by: string | null
          source_school_id: string
          status: Database["public"]["Enums"]["cross_training_status"]
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          destination_approved_at?: string | null
          destination_approved_by?: string | null
          destination_school_id: string
          id?: string
          objective_id: string
          reason: string
          rejection_reason?: string | null
          source_approved_at?: string | null
          source_approved_by?: string | null
          source_school_id: string
          status?: Database["public"]["Enums"]["cross_training_status"]
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          destination_approved_at?: string | null
          destination_approved_by?: string | null
          destination_school_id?: string
          id?: string
          objective_id?: string
          reason?: string
          rejection_reason?: string | null
          source_approved_at?: string | null
          source_approved_by?: string | null
          source_school_id?: string
          status?: Database["public"]["Enums"]["cross_training_status"]
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cross_school_training_requests_destination_approved_by_fkey"
            columns: ["destination_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_school_training_requests_destination_school_id_fkey"
            columns: ["destination_school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_school_training_requests_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "pathway_skills_matrix"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_school_training_requests_source_approved_by_fkey"
            columns: ["source_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_school_training_requests_source_school_id_fkey"
            columns: ["source_school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_school_training_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_entries: {
        Row: {
          content: string
          created_at: string | null
          date: string
          id: string
          school_id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          date: string
          id?: string
          school_id: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          school_id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diary_entries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diary_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations_company: {
        Row: {
          comment: string | null
          created_at: string | null
          date: string
          evaluator_id: string
          id: string
          is_locked: boolean | null
          rating: number
          school_id: string
          student_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          date: string
          evaluator_id: string
          id?: string
          is_locked?: boolean | null
          rating: number
          school_id: string
          student_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          date?: string
          evaluator_id?: string
          id?: string
          is_locked?: boolean | null
          rating?: number
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_company_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_company_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_company_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations_school: {
        Row: {
          created_at: string | null
          date: string
          evaluator_id: string
          grade: Database["public"]["Enums"]["unit_grade"]
          id: string
          is_locked: boolean | null
          notes: string | null
          school_id: string
          student_id: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          evaluator_id: string
          grade: Database["public"]["Enums"]["unit_grade"]
          id?: string
          is_locked?: boolean | null
          notes?: string | null
          school_id: string
          student_id: string
          unit: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          evaluator_id?: string
          grade?: Database["public"]["Enums"]["unit_grade"]
          id?: string
          is_locked?: boolean | null
          notes?: string | null
          school_id?: string
          student_id?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_school_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_school_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_school_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_records: {
        Row: {
          created_at: string | null
          description: string | null
          feedback: string | null
          file_path: string
          file_size_bytes: number | null
          file_type: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          status: Database["public"]["Enums"]["evidence_status"] | null
          student_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feedback?: string | null
          file_path: string
          file_size_bytes?: number | null
          file_type: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["evidence_status"] | null
          student_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feedback?: string | null
          file_path?: string
          file_size_bytes?: number | null
          file_type?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["evidence_status"] | null
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_records_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      external_trainer_contracts: {
        Row: {
          completed_hours: number
          created_at: string | null
          created_by: string
          end_date: string
          final_report: string | null
          financial_amount: number | null
          id: string
          ministry_representative: string | null
          school_id: string
          school_representative: string | null
          skill_program: string
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          total_days: number
          total_hours: number
          trainee_evaluation_notes: string | null
          trainer_email: string | null
          trainer_name: string
          trainer_phone: string | null
          trainer_specialization: string
          updated_at: string | null
        }
        Insert: {
          completed_hours?: number
          created_at?: string | null
          created_by: string
          end_date: string
          final_report?: string | null
          financial_amount?: number | null
          id?: string
          ministry_representative?: string | null
          school_id: string
          school_representative?: string | null
          skill_program: string
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          total_days: number
          total_hours: number
          trainee_evaluation_notes?: string | null
          trainer_email?: string | null
          trainer_name: string
          trainer_phone?: string | null
          trainer_specialization: string
          updated_at?: string | null
        }
        Update: {
          completed_hours?: number
          created_at?: string | null
          created_by?: string
          end_date?: string
          final_report?: string | null
          financial_amount?: number | null
          id?: string
          ministry_representative?: string | null
          school_id?: string
          school_representative?: string | null
          skill_program?: string
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          total_days?: number
          total_hours?: number
          trainee_evaluation_notes?: string | null
          trainer_email?: string | null
          trainer_name?: string
          trainer_phone?: string | null
          trainer_specialization?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_trainer_contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_trainer_contracts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_visits: {
        Row: {
          conducted_by: string
          created_at: string | null
          id: string
          notes: string | null
          placement_id: string
          school_id: string
          student_id: string
          visit_date: string
          visit_type: string
        }
        Insert: {
          conducted_by: string
          created_at?: string | null
          id?: string
          notes?: string | null
          placement_id: string
          school_id: string
          student_id: string
          visit_date: string
          visit_type: string
        }
        Update: {
          conducted_by?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          placement_id?: string
          school_id?: string
          student_id?: string
          visit_date?: string
          visit_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_visits_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_visits_placement_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_visits_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_visits_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size_bytes: number | null
          file_type: string
          id: string
          incident_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          document_type?: string
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          file_type: string
          id?: string
          incident_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          file_type?: string
          id?: string
          incident_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_documents_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "training_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          challenges: string | null
          created_at: string | null
          date: string
          goals: string | null
          id: string
          learned: string | null
          school_id: string
          solutions: string | null
          student_id: string
          week_label: string
        }
        Insert: {
          challenges?: string | null
          created_at?: string | null
          date: string
          goals?: string | null
          id?: string
          learned?: string | null
          school_id: string
          solutions?: string | null
          student_id: string
          week_label: string
        }
        Update: {
          challenges?: string | null
          created_at?: string | null
          date?: string
          goals?: string | null
          id?: string
          learned?: string | null
          school_id?: string
          solutions?: string | null
          student_id?: string
          week_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_goals: {
        Row: {
          created_at: string | null
          date: string
          goals: string[]
          id: string
          school_id: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          goals?: string[]
          id?: string
          school_id: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          goals?: string[]
          id?: string
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_goals_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_goals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_read: boolean
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      observations: {
        Row: {
          activities: string | null
          created_at: string | null
          date: string
          evidence: string | null
          id: string
          observer_id: string
          questions: string | null
          recommendations: string | null
          school_id: string
          student_id: string
        }
        Insert: {
          activities?: string | null
          created_at?: string | null
          date: string
          evidence?: string | null
          id?: string
          observer_id: string
          questions?: string | null
          recommendations?: string | null
          school_id: string
          student_id: string
        }
        Update: {
          activities?: string | null
          created_at?: string | null
          date?: string
          evidence?: string | null
          id?: string
          observer_id?: string
          questions?: string | null
          recommendations?: string | null
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "observations_observer_id_fkey"
            columns: ["observer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      pathway_skills_matrix: {
        Row: {
          applications: string[]
          created_at: string | null
          id: string
          objective_number: number
          objective_title: string
          sector: string
          skills: string[]
          topics: string[]
        }
        Insert: {
          applications?: string[]
          created_at?: string | null
          id?: string
          objective_number: number
          objective_title: string
          sector: string
          skills?: string[]
          topics?: string[]
        }
        Update: {
          applications?: string[]
          created_at?: string | null
          id?: string
          objective_number?: number
          objective_title?: string
          sector?: string
          skills?: string[]
          topics?: string[]
        }
        Relationships: []
      }
      placements: {
        Row: {
          agreement_signed: boolean | null
          agreement_signed_date: string | null
          company_id: string
          company_supervisor_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          learning_goals_text: string | null
          school_id: string
          school_supervisor_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["placement_status"] | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          agreement_signed?: boolean | null
          agreement_signed_date?: string | null
          company_id: string
          company_supervisor_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          learning_goals_text?: string | null
          school_id: string
          school_supervisor_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["placement_status"] | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          agreement_signed?: boolean | null
          agreement_signed_date?: string | null
          company_id?: string
          company_supervisor_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          learning_goals_text?: string | null
          school_id?: string
          school_supervisor_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["placement_status"] | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "placements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_company_supervisor_id_fkey"
            columns: ["company_supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_school_supervisor_id_fkey"
            columns: ["school_supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_violations: {
        Row: {
          absence_count: number | null
          created_at: string | null
          created_by: string
          description: string
          id: string
          related_entity_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          school_id: string
          severity: Database["public"]["Enums"]["violation_severity"]
          status: Database["public"]["Enums"]["violation_status"]
          student_id: string
          updated_at: string | null
          violation_type: Database["public"]["Enums"]["violation_type"]
        }
        Insert: {
          absence_count?: number | null
          created_at?: string | null
          created_by: string
          description: string
          id?: string
          related_entity_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          school_id: string
          severity?: Database["public"]["Enums"]["violation_severity"]
          status?: Database["public"]["Enums"]["violation_status"]
          student_id: string
          updated_at?: string | null
          violation_type: Database["public"]["Enums"]["violation_type"]
        }
        Update: {
          absence_count?: number | null
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          related_entity_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          school_id?: string
          severity?: Database["public"]["Enums"]["violation_severity"]
          status?: Database["public"]["Enums"]["violation_status"]
          student_id?: string
          updated_at?: string | null
          violation_type?: Database["public"]["Enums"]["violation_type"]
        }
        Relationships: [
          {
            foreignKeyName: "policy_violations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_violations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_violations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_violations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          school_id: string | null
          supervisor_capacity: number | null
          supervisor_current_load: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id: string
          phone?: string | null
          school_id?: string | null
          supervisor_capacity?: number | null
          supervisor_current_load?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          school_id?: string | null
          supervisor_capacity?: number | null
          supervisor_current_load?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      program_authorizations: {
        Row: {
          approval_authority: string
          approval_date: string | null
          approval_reference: string
          authorized_sectors: Json
          authorized_student_quota: number
          budget_envelope_reference: string | null
          created_at: string | null
          cycle_year: number
          id: string
          school_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approval_authority?: string
          approval_date?: string | null
          approval_reference?: string
          authorized_sectors?: Json
          authorized_student_quota?: number
          budget_envelope_reference?: string | null
          created_at?: string | null
          cycle_year: number
          id?: string
          school_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approval_authority?: string
          approval_date?: string | null
          approval_reference?: string
          authorized_sectors?: Json
          authorized_student_quota?: number
          budget_envelope_reference?: string | null
          created_at?: string | null
          cycle_year?: number
          id?: string
          school_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_authorizations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      program_cycles: {
        Row: {
          assessment_windows: Json
          created_at: string | null
          end_date: string
          id: string
          name: string
          reporting_deadlines: Json
          school_id: string
          start_date: string
          status: string
          updated_at: string | null
          visit_windows: Json
        }
        Insert: {
          assessment_windows?: Json
          created_at?: string | null
          end_date: string
          id?: string
          name: string
          reporting_deadlines?: Json
          school_id: string
          start_date: string
          status?: string
          updated_at?: string | null
          visit_windows?: Json
        }
        Update: {
          assessment_windows?: Json
          created_at?: string | null
          end_date?: string
          id?: string
          name?: string
          reporting_deadlines?: Json
          school_id?: string
          start_date?: string
          status?: string
          updated_at?: string | null
          visit_windows?: Json
        }
        Relationships: [
          {
            foreignKeyName: "program_cycles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      program_risks: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          impact: string
          last_reviewed: string | null
          likelihood: string
          mitigation_plan: string | null
          owner_authority: string | null
          review_frequency: string | null
          school_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          impact?: string
          last_reviewed?: string | null
          likelihood?: string
          mitigation_plan?: string | null
          owner_authority?: string | null
          review_frequency?: string | null
          school_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          impact?: string
          last_reviewed?: string | null
          likelihood?: string
          mitigation_plan?: string | null
          owner_authority?: string | null
          review_frequency?: string | null
          school_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_risks_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      qualification_mappings: {
        Row: {
          created_at: string | null
          endorsed_by: string | null
          endorsement_reference: string | null
          id: string
          learning_outcome_domains: Json
          mapped_nqf_level: number
          pathway_name: string
          school_id: string
          sector: string
          status: string
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string | null
          endorsed_by?: string | null
          endorsement_reference?: string | null
          id?: string
          learning_outcome_domains?: Json
          mapped_nqf_level?: number
          pathway_name: string
          school_id: string
          sector: string
          status?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string | null
          endorsed_by?: string | null
          endorsement_reference?: string | null
          id?: string
          learning_outcome_domains?: Json
          mapped_nqf_level?: number
          pathway_name?: string
          school_id?: string
          sector?: string
          status?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qualification_mappings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      resubmission_requests: {
        Row: {
          created_at: string | null
          created_by: string
          evidence_id: string
          id: string
          new_deadline: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          school_id: string
          status: Database["public"]["Enums"]["resubmission_status"]
          student_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          evidence_id: string
          id?: string
          new_deadline: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["resubmission_status"]
          student_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          evidence_id?: string
          id?: string
          new_deadline?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["resubmission_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resubmission_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resubmission_requests_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resubmission_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resubmission_requests_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resubmission_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      school_selected_objectives: {
        Row: {
          created_at: string | null
          cycle_year: number
          id: string
          objective_id: string
          school_id: string
          selected_by: string
        }
        Insert: {
          created_at?: string | null
          cycle_year: number
          id?: string
          objective_id: string
          school_id: string
          selected_by: string
        }
        Update: {
          created_at?: string | null
          cycle_year?: number
          id?: string
          objective_id?: string
          school_id?: string
          selected_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_selected_objectives_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "pathway_skills_matrix"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_selected_objectives_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_selected_objectives_selected_by_fkey"
            columns: ["selected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          district: string | null
          id: string
          is_active: boolean | null
          name: string
          region: string
          school_type: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          district?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          region: string
          school_type?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          district?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          region?: string
          school_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      specializations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          sector: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sector: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sector?: string
        }
        Relationships: []
      }
      student_phase_log: {
        Row: {
          entered_at: string | null
          id: string
          notes: string | null
          phase: number
          status: string
          student_id: string
          triggered_by: string | null
        }
        Insert: {
          entered_at?: string | null
          id?: string
          notes?: string | null
          phase: number
          status: string
          student_id: string
          triggered_by?: string | null
        }
        Update: {
          entered_at?: string | null
          id?: string
          notes?: string | null
          phase?: number
          status?: string
          student_id?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_phase_log_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          completed_hours: number | null
          coverage_end_date: string | null
          coverage_start_date: string | null
          created_at: string | null
          current_phase: number | null
          eligible_for_recognition: boolean | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          final_grade: Database["public"]["Enums"]["unit_grade"] | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          grade_level: string | null
          graduated_at: string | null
          graduation_approved_by: string | null
          health_coverage_status:
            | Database["public"]["Enums"]["health_coverage_status"]
            | null
          id: string
          national_id: string | null
          school_id: string
          specialization_id: string | null
          status: Database["public"]["Enums"]["student_status"] | null
          student_number: string
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          completed_hours?: number | null
          coverage_end_date?: string | null
          coverage_start_date?: string | null
          created_at?: string | null
          current_phase?: number | null
          eligible_for_recognition?: boolean | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          final_grade?: Database["public"]["Enums"]["unit_grade"] | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          grade_level?: string | null
          graduated_at?: string | null
          graduation_approved_by?: string | null
          health_coverage_status?:
            | Database["public"]["Enums"]["health_coverage_status"]
            | null
          id: string
          national_id?: string | null
          school_id: string
          specialization_id?: string | null
          status?: Database["public"]["Enums"]["student_status"] | null
          student_number: string
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_hours?: number | null
          coverage_end_date?: string | null
          coverage_start_date?: string | null
          created_at?: string | null
          current_phase?: number | null
          eligible_for_recognition?: boolean | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          final_grade?: Database["public"]["Enums"]["unit_grade"] | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          grade_level?: string | null
          graduated_at?: string | null
          graduation_approved_by?: string | null
          health_coverage_status?:
            | Database["public"]["Enums"]["health_coverage_status"]
            | null
          id?: string
          national_id?: string | null
          school_id?: string
          specialization_id?: string | null
          status?: Database["public"]["Enums"]["student_status"] | null
          student_number?: string
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          int_value: number
          key: string
          updated_at: string
        }
        Insert: {
          int_value: number
          key: string
          updated_at?: string
        }
        Update: {
          int_value?: number
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_incidents: {
        Row: {
          actions_taken: string | null
          created_at: string | null
          description: string
          first_aid_provided: boolean | null
          follow_up_notes: string | null
          id: string
          incident_date: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          location: string | null
          medical_report_summary: string | null
          reported_by: string
          resolved_at: string | null
          school_id: string
          severity: Database["public"]["Enums"]["incident_severity"]
          status: Database["public"]["Enums"]["incident_status"]
          student_id: string
          updated_at: string | null
        }
        Insert: {
          actions_taken?: string | null
          created_at?: string | null
          description: string
          first_aid_provided?: boolean | null
          follow_up_notes?: string | null
          id?: string
          incident_date: string
          incident_type?: Database["public"]["Enums"]["incident_type"]
          location?: string | null
          medical_report_summary?: string | null
          reported_by: string
          resolved_at?: string | null
          school_id: string
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          student_id: string
          updated_at?: string | null
        }
        Update: {
          actions_taken?: string | null
          created_at?: string | null
          description?: string
          first_aid_provided?: boolean | null
          follow_up_notes?: string | null
          id?: string
          incident_date?: string
          incident_type?: Database["public"]["Enums"]["incident_type"]
          location?: string | null
          medical_report_summary?: string | null
          reported_by?: string
          resolved_at?: string | null
          school_id?: string
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_incidents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_incidents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      witness_statements: {
        Row: {
          activity: string
          company_supervisor_id: string
          created_at: string | null
          date: string
          grade_d: boolean | null
          grade_m: boolean | null
          grade_p: boolean | null
          id: string
          school_id: string
          student_id: string
          unit_number: string
        }
        Insert: {
          activity: string
          company_supervisor_id: string
          created_at?: string | null
          date: string
          grade_d?: boolean | null
          grade_m?: boolean | null
          grade_p?: boolean | null
          id?: string
          school_id: string
          student_id: string
          unit_number: string
        }
        Update: {
          activity?: string
          company_supervisor_id?: string
          created_at?: string | null
          date?: string
          grade_d?: boolean | null
          grade_m?: boolean | null
          grade_p?: boolean | null
          id?: string
          school_id?: string
          student_id?: string
          unit_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "witness_statements_company_supervisor_id_fkey"
            columns: ["company_supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "witness_statements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "witness_statements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calc_final_grade: {
        Args: { _student_id: string }
        Returns: Database["public"]["Enums"]["unit_grade"]
      }
      create_notification: {
        Args: {
          _body: string
          _related_entity_id?: string
          _related_entity_type?: string
          _title: string
          _type?: string
          _user_id: string
        }
        Returns: string
      }
      get_attendance_hours_per_day: { Args: never; Returns: number }
      get_cross_training_schools: {
        Args: { _cycle_year: number; _student_school_id: string }
        Returns: {
          objective_id: string
          objective_number: number
          objective_title: string
          region: string
          school_id: string
          school_name: string
          sector: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_school_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_audit_log: {
        Args: {
          _action: Database["public"]["Enums"]["audit_action"]
          _entity_id?: string
          _entity_type: string
          _new?: Json
          _prev?: Json
          _reason?: string
        }
        Returns: string
      }
      is_company_supervisor_of: {
        Args: { _student_id: string; _user_id: string }
        Returns: boolean
      }
      is_same_region: {
        Args: { _school_id: string; _user_id: string }
        Returns: boolean
      }
      is_school_supervisor_of: {
        Args: { _student_id: string; _user_id: string }
        Returns: boolean
      }
      lock_dual_assessment: {
        Args: {
          _company_eval_id: string
          _school_eval_id: string
          _student_id: string
          _unit: string
        }
        Returns: Json
      }
      notify_school_admins: {
        Args: {
          _body: string
          _related_entity_id?: string
          _related_entity_type?: string
          _school_id: string
          _title: string
          _type?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      accreditation_status: "pending" | "approved" | "suspended" | "revoked"
      app_role:
        | "student"
        | "company_supervisor"
        | "school_supervisor"
        | "admin"
        | "regional"
        | "ministry"
      attendance_status:
        | "present"
        | "absent"
        | "late"
        | "early_leave"
        | "excused"
      audit_action:
        | "CREATE"
        | "UPDATE"
        | "DELETE"
        | "APPROVE"
        | "REJECT"
        | "LOCK"
      contract_status: "draft" | "active" | "completed" | "terminated"
      corrective_status: "pending" | "in_progress" | "completed" | "failed"
      cross_training_status:
        | "pending"
        | "approved_source"
        | "approved_destination"
        | "fully_approved"
        | "rejected"
        | "completed"
      evidence_status: "pending" | "approved" | "rejected"
      gender_type: "male" | "female"
      health_coverage_status: "active" | "expired" | "not_covered" | "pending"
      incident_severity: "minor" | "moderate" | "serious" | "critical"
      incident_status:
        | "reported"
        | "first_aid"
        | "medical_report"
        | "under_treatment"
        | "resolved"
        | "closed"
      incident_type:
        | "work_injury"
        | "equipment_accident"
        | "chemical_exposure"
        | "fall"
        | "other"
      placement_status: "pending" | "active" | "completed" | "cancelled"
      resubmission_status: "pending" | "submitted" | "approved" | "rejected"
      student_status:
        | "enrolled"
        | "training"
        | "completed"
        | "withdrawn"
        | "not_started"
        | "searching"
        | "matched"
        | "under_review"
        | "pending_graduation"
        | "graduated"
        | "closed"
      unit_grade: "P" | "M" | "D"
      violation_severity:
        | "warning"
        | "formal_warning"
        | "action_plan"
        | "referral"
      violation_status: "open" | "acknowledged" | "resolved" | "escalated"
      violation_type:
        | "absence"
        | "non_submission"
        | "late_submission"
        | "evidence_rejected"
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
      accreditation_status: ["pending", "approved", "suspended", "revoked"],
      app_role: [
        "student",
        "company_supervisor",
        "school_supervisor",
        "admin",
        "regional",
        "ministry",
      ],
      attendance_status: [
        "present",
        "absent",
        "late",
        "early_leave",
        "excused",
      ],
      audit_action: ["CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", "LOCK"],
      contract_status: ["draft", "active", "completed", "terminated"],
      corrective_status: ["pending", "in_progress", "completed", "failed"],
      cross_training_status: [
        "pending",
        "approved_source",
        "approved_destination",
        "fully_approved",
        "rejected",
        "completed",
      ],
      evidence_status: ["pending", "approved", "rejected"],
      gender_type: ["male", "female"],
      health_coverage_status: ["active", "expired", "not_covered", "pending"],
      incident_severity: ["minor", "moderate", "serious", "critical"],
      incident_status: [
        "reported",
        "first_aid",
        "medical_report",
        "under_treatment",
        "resolved",
        "closed",
      ],
      incident_type: [
        "work_injury",
        "equipment_accident",
        "chemical_exposure",
        "fall",
        "other",
      ],
      placement_status: ["pending", "active", "completed", "cancelled"],
      resubmission_status: ["pending", "submitted", "approved", "rejected"],
      student_status: [
        "enrolled",
        "training",
        "completed",
        "withdrawn",
        "not_started",
        "searching",
        "matched",
        "under_review",
        "pending_graduation",
        "graduated",
        "closed",
      ],
      unit_grade: ["P", "M", "D"],
      violation_severity: [
        "warning",
        "formal_warning",
        "action_plan",
        "referral",
      ],
      violation_status: ["open", "acknowledged", "resolved", "escalated"],
      violation_type: [
        "absence",
        "non_submission",
        "late_submission",
        "evidence_rejected",
      ],
    },
  },
} as const
