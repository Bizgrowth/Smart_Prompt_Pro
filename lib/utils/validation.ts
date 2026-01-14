import { PromptFormData } from '../types/prompt'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// Validation for 8 required fields
export function validatePromptForm(data: PromptFormData): ValidationResult {
  const errors: Record<string, string> = {}

  // 1. project_name (required, 5-100 chars)
  if (!data.project_name || data.project_name.trim().length < 5) {
    errors.project_name = 'Project name must be at least 5 characters'
  } else if (data.project_name.length > 100) {
    errors.project_name = 'Project name must be under 100 characters'
  }

  // 2. use_case_category (required)
  if (!data.use_case_category) {
    errors.use_case_category = 'Use case category is required'
  }

  // 3. business_objective (required, 20-500 chars)
  if (!data.business_objective || data.business_objective.trim().length < 20) {
    errors.business_objective = 'Business objective must be at least 20 characters'
  } else if (data.business_objective.length > 500) {
    errors.business_objective = 'Business objective must be under 500 characters'
  }

  // 4. target_audience (required, 10-200 chars)
  if (!data.target_audience || data.target_audience.trim().length < 10) {
    errors.target_audience = 'Target audience must be at least 10 characters'
  } else if (data.target_audience.length > 200) {
    errors.target_audience = 'Target audience must be under 200 characters'
  }

  // 5. ai_role (required, 20-300 chars)
  if (!data.ai_role || data.ai_role.trim().length < 20) {
    errors.ai_role = 'AI role must be at least 20 characters'
  } else if (data.ai_role.length > 300) {
    errors.ai_role = 'AI role must be under 300 characters'
  }

  // 6. tone_voice (required)
  if (!data.tone_voice) {
    errors.tone_voice = 'Tone & voice is required'
  }

  // 7. primary_task (required, 30-500 chars)
  if (!data.primary_task || data.primary_task.trim().length < 30) {
    errors.primary_task = 'Primary task must be at least 30 characters'
  } else if (data.primary_task.length > 500) {
    errors.primary_task = 'Primary task must be under 500 characters'
  }

  // 8. success_criteria (required, 20-500 chars)
  if (!data.success_criteria || data.success_criteria.trim().length < 20) {
    errors.success_criteria = 'Success criteria must be at least 20 characters'
  } else if (data.success_criteria.length > 500) {
    errors.success_criteria = 'Success criteria must be under 500 characters'
  }

  // Optional field length validations
  if (data.business_context && data.business_context.length > 1000) {
    errors.business_context = 'Business context must be under 1000 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Individual field validation for real-time feedback
export function validateField(field: string, value: any): string | null {
  const data = { [field]: value } as any

  switch (field) {
    case 'project_name':
      if (!value || value.trim().length < 5) {
        return 'Project name must be at least 5 characters'
      }
      if (value.length > 100) {
        return 'Project name must be under 100 characters'
      }
      break

    case 'use_case_category':
      if (!value) {
        return 'Use case category is required'
      }
      break

    case 'business_objective':
      if (!value || value.trim().length < 20) {
        return 'Business objective must be at least 20 characters'
      }
      if (value.length > 500) {
        return 'Business objective must be under 500 characters'
      }
      break

    case 'target_audience':
      if (!value || value.trim().length < 10) {
        return 'Target audience must be at least 10 characters'
      }
      if (value.length > 200) {
        return 'Target audience must be under 200 characters'
      }
      break

    case 'ai_role':
      if (!value || value.trim().length < 20) {
        return 'AI role must be at least 20 characters'
      }
      if (value.length > 300) {
        return 'AI role must be under 300 characters'
      }
      break

    case 'tone_voice':
      if (!value) {
        return 'Tone & voice is required'
      }
      break

    case 'primary_task':
      if (!value || value.trim().length < 30) {
        return 'Primary task must be at least 30 characters'
      }
      if (value.length > 500) {
        return 'Primary task must be under 500 characters'
      }
      break

    case 'success_criteria':
      if (!value || value.trim().length < 20) {
        return 'Success criteria must be at least 20 characters'
      }
      if (value.length > 500) {
        return 'Success criteria must be under 500 characters'
      }
      break

    case 'business_context':
      if (value && value.length > 1000) {
        return 'Business context must be under 1000 characters'
      }
      break
  }

  return null
}

// Get the tab index that contains a specific field
export function getTabForField(field: string): number {
  const tabFields = [
    // Tab 0: Basic Information
    ['project_name', 'use_case_category', 'business_objective', 'target_audience'],
    // Tab 1: AI Configuration
    ['ai_role', 'role_expertise', 'tone_voice', 'business_context'],
    // Tab 2: Task Definition
    ['primary_task', 'success_criteria', 'constraints', 'knowledge_sources', 'brand_guidelines'],
    // Tab 3: Input/Output
    ['input_format', 'input_example_1', 'input_example_2', 'input_validation',
     'output_format', 'output_structure', 'output_length', 'output_example_good', 'output_example_bad'],
    // Tab 4: Instructions
    ['step_by_step_process'],
    // Tab 5: Context & Examples
    ['example_scenario_1', 'example_scenario_2', 'example_scenario_3'],
    // Tab 6: Quality & Safety
    ['edge_case_handling', 'forbidden_responses', 'escalation_triggers', 'fallback_response'],
    // Tab 7: Advanced
    ['testing_notes', 'iteration_goals', 'performance_metrics']
  ]

  for (let i = 0; i < tabFields.length; i++) {
    if (tabFields[i].includes(field)) {
      return i
    }
  }

  return 0 // Default to first tab if not found
}
