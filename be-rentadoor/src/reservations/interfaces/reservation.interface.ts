export interface IReservation {
  id: number;
  property_id: number;
  property_title?: string;
  user_id: number;
  owner_id: number;
  status: string; // 'pendiente', 'preaprobada_admin', 'aprobada', 'rechazada_admin', 'rechazada_owner', etc.
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;

  main_applicant_name?: string;
  main_applicant_email?: string;
  main_applicant_phone?: string;
  adults_count?: number;
  children_count?: number;
  cohabitants?: string;
  monthly_income?: number;
  total_household_income?: number;
  income_documents?: string[];
  income_source?: string;
  employer_name?: string;
  profession?: string;
  cuit_cuil?: string;

  additional_documents?: string[];
  owner_property_title?: string;

  admin_preapproved?: boolean;
  admin_preapproved_at?: string;
  owner_approved?: boolean;
  owner_approved_at?: string;
  cancellation_reason?: string;

  contract_url?: string;
  contract_status?: string;
} 