// MedSafe AI — Core TypeScript Types & Models

export interface User {
  id: string
  name: string
  email: string
  is_active: boolean
  created_at?: string
  profile?: UserProfile | null
}

export interface UserProfile {
  user_id: string
  age?: number | null
  allergies?: string[]
  existing_conditions?: string[]
  updated_at?: string
}

export interface AuthTokens {
  access_token: string
  token_type: string
  expires_in: number
}

export interface MedicineSearchResult {
  id: string
  brand_name?: string | null
  generic_name: string
  active_ingredients?: string[] | null
  drug_class?: string | null
  dosage_form?: string | null
}

export interface MedicineDetail extends MedicineSearchResult {
  description?: string | null
  uses?: string | null
  mechanism?: string | null
  side_effects?: string | null
  warnings?: string | null
  contraindications?: string | null
  storage_information?: string | null
  source?: string | null
  source_url?: string | null
  last_verified?: string | null
}

export interface MedicineSearchResponse {
  results: MedicineSearchResult[]
  total: number
  page: number
  limit: number
  query: string
}

export interface Medication {
  id: string
  medicine_id?: string | null
  entered_name: string
  formulation?: string | null
  user_notes?: string | null
  created_at: string
  medicine?: MedicineSearchResult | null
}

export interface MedicationCreatePayload {
  medicine_id?: string | null
  entered_name: string
  formulation?: string | null
  user_notes?: string | null
}

export interface InteractionAlert {
  alert_type: string
  severity: 'low' | 'moderate' | 'high' | 'contraindicated' | string
  medicine_a: string
  medicine_b: string
  description: string
  recommendation: string
  source?: string | null
  source_url?: string | null
}

export interface DuplicateIngredientAlert {
  alert_type: string
  severity: string
  ingredient: string
  found_in: string[]
  description: string
  source?: string | null
}

export interface SafetyCheckResponse {
  check_id: string
  status: 'no_known_issue' | 'potential_interaction' | 'duplicate_ingredient' | 'warning' | 'insufficient_information' | string
  overall_severity?: 'low' | 'moderate' | 'high' | 'contraindicated' | null
  interactions: InteractionAlert[]
  duplicate_ingredients: DuplicateIngredientAlert[]
  warnings: string[]
  source_references: string[]
  disclaimer: string
}

export interface SafetyCheckRequest {
  existing_medication_ids: string[]
  new_medication_id: string
}

export interface DetectedMedicineCandidate {
  detected_text: string
  matched_medicine_id?: string | null
  matched_medicine_name?: string | null
  confidence: number
  requires_confirmation: boolean
}

export interface ScannerResponse {
  result_id: string
  extracted_text: string
  detected_medicines: DetectedMedicineCandidate[]
  overall_confidence: number
  requires_confirmation: boolean
  created_at: string
  notice: string
}

export interface SourceReference {
  title: string
  url?: string | null
  source_type: string
}

export interface AssistantResponse {
  query_id: string
  answer: string
  important_information?: string | null
  safety_considerations?: string | null
  sources: SourceReference[]
  disclaimer?: string | null
  was_refused: boolean
  refusal_reason?: string | null
  created_at: string
}

export interface SearchTrendItem {
  date: string
  medicine_id: string
  medicine_name: string
  generic_name: string
  drug_class?: string | null
  search_count: number
}

export interface InteractionTrendItem {
  medicine_a: string
  medicine_b: string
  severity: string
  alert_count: number
  last_flagged: string
}

export interface SafetySummaryItem {
  total_checks: number
  interactions_detected: number
  duplicates_detected: number
  severity_breakdown: Record<string, number>
}
