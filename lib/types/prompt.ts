// Enums for dropdown options

export const USE_CASE_CATEGORIES = [
  'Customer Support',
  'Content Generation',
  'Data Analysis',
  'Lead Qualification',
  'Email Automation',
  'Sales Enablement',
  'Process Automation',
  'Other'
] as const

export const TONE_VOICE_OPTIONS = [
  'Professional',
  'Friendly',
  'Technical',
  'Casual',
  'Formal',
  'Empathetic',
  'Direct'
] as const

export const INPUT_FORMAT_OPTIONS = [
  'Text',
  'Structured Data (JSON)',
  'Form Fields',
  'Email',
  'Chat Message',
  'File Upload',
  'Multiple Formats'
] as const

export const OUTPUT_FORMAT_OPTIONS = [
  'Plain Text',
  'Markdown',
  'JSON',
  'HTML',
  'Structured Template',
  'Bullet Points',
  'Numbered List'
] as const

export const OUTPUT_LENGTH_OPTIONS = [
  'Concise (1-2 sentences)',
  'Brief (1 paragraph)',
  'Standard (2-3 paragraphs)',
  'Detailed (4+ paragraphs)',
  'Variable based on input'
] as const

// Type definitions

export type UseCaseCategory = typeof USE_CASE_CATEGORIES[number]
export type ToneVoice = typeof TONE_VOICE_OPTIONS[number]
export type InputFormat = typeof INPUT_FORMAT_OPTIONS[number]
export type OutputFormat = typeof OUTPUT_FORMAT_OPTIONS[number]
export type OutputLength = typeof OUTPUT_LENGTH_OPTIONS[number]

// Interface for form data combining project + component fields
export interface PromptFormData {
  // From prompt_projects
  project_name: string
  use_case_category: string
  business_objective: string
  target_audience: string

  // From prompt_components (32 fields)
  ai_role: string
  role_expertise: string[] | null
  tone_voice: string
  business_context: string
  constraints: string | null
  knowledge_sources: string | null
  brand_guidelines: string | null
  primary_task: string
  step_by_step_process: string | null
  success_criteria: string
  input_format: string
  input_example_1: string | null
  input_example_2: string | null
  input_validation: string | null
  output_format: string
  output_structure: string | null
  output_length: string
  output_example_good: string | null
  output_example_bad: string | null
  example_scenario_1: string | null
  example_scenario_2: string | null
  example_scenario_3: string | null
  edge_case_handling: string | null
  forbidden_responses: string | null
  escalation_triggers: string | null
  fallback_response: string | null
  testing_notes: string | null
  iteration_goals: string | null
  performance_metrics: string | null
}

// Initial empty form data
export const INITIAL_FORM_DATA: PromptFormData = {
  project_name: '',
  use_case_category: '',
  business_objective: '',
  target_audience: '',
  ai_role: '',
  role_expertise: null,
  tone_voice: '',
  business_context: '',
  constraints: null,
  knowledge_sources: null,
  brand_guidelines: null,
  primary_task: '',
  step_by_step_process: null,
  success_criteria: '',
  input_format: 'Text',
  input_example_1: null,
  input_example_2: null,
  input_validation: null,
  output_format: 'Plain Text',
  output_structure: null,
  output_length: 'Standard (2-3 paragraphs)',
  output_example_good: null,
  output_example_bad: null,
  example_scenario_1: null,
  example_scenario_2: null,
  example_scenario_3: null,
  edge_case_handling: null,
  forbidden_responses: null,
  escalation_triggers: null,
  fallback_response: null,
  testing_notes: null,
  iteration_goals: null,
  performance_metrics: null
}

// Project list item for dropdown
export interface ProjectListItem {
  project_id: string
  project_name: string
  use_case_category: string
  last_modified: string
}

// Project with metadata for library
export interface ProjectWithMetadata {
  project_id: string
  project_name: string
  use_case_category: string
  business_objective: string
  target_audience: string
  created_date: string
  last_modified: string
  status: string
  owner: string
  prompt_components: Array<{
    component_id: string
    version_number: number
    created_date: string
  }>
}
