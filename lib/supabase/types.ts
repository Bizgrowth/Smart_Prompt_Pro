// TypeScript types matching the Supabase database schema

export type UseCaseCategory =
    | 'Customer Support'
    | 'Content Generation'
    | 'Data Analysis'
    | 'Lead Qualification'
    | 'Email Automation'
    | 'Sales Enablement'
    | 'Process Automation'
    | 'Other';

export type ProjectStatus = 'Draft' | 'In Review' | 'Active' | 'Archived';

export type ToneVoice =
    | 'Professional'
    | 'Friendly'
    | 'Technical'
    | 'Casual'
    | 'Formal'
    | 'Empathetic'
    | 'Direct';

export type InputFormat =
    | 'Text'
    | 'Structured Data (JSON)'
    | 'Form Fields'
    | 'Email'
    | 'Chat Message'
    | 'File Upload'
    | 'Multiple Formats';

export type OutputFormat =
    | 'Plain Text'
    | 'Markdown'
    | 'JSON'
    | 'HTML'
    | 'Structured Template'
    | 'Bullet Points'
    | 'Numbered List';

export type OutputLength =
    | 'Concise (1-2 sentences)'
    | 'Brief (1 paragraph)'
    | 'Standard (2-3 paragraphs)'
    | 'Detailed (4+ paragraphs)'
    | 'Variable based on input';

export type LLMProvider = 'Claude' | 'OpenAI' | 'Gemini';

export type RoleExpertise =
    | 'Technical Knowledge'
    | 'Industry Experience'
    | 'Communication Style'
    | 'Problem-Solving Approach'
    | 'Empathy & Emotional Intelligence';

// Database table types
export interface PromptProject {
    project_id: string;
    project_name: string;
    use_case_category: UseCaseCategory;
    business_objective: string;
    target_audience: string;
    created_date: string;
    last_modified: string;
    status: ProjectStatus;
    owner: string;
}

export interface PromptComponent {
    component_id: string;
    project_id: string;
    version_number: number;

    // ROLE DEFINITION
    ai_role: string;
    role_expertise: RoleExpertise[] | null;
    tone_voice: ToneVoice;

    // CONTEXT & BACKGROUND
    business_context: string;
    constraints: string | null;
    knowledge_sources: string | null;
    brand_guidelines: string | null;

    // TASK & INSTRUCTIONS
    primary_task: string;
    step_by_step_process: string | null;
    success_criteria: string;

    // INPUT SPECIFICATIONS
    input_format: InputFormat;
    input_example_1: string | null;
    input_example_2: string | null;
    input_validation: string | null;

    // OUTPUT SPECIFICATIONS
    output_format: OutputFormat;
    output_structure: string | null;
    output_length: OutputLength;
    output_example_good: string | null;
    output_example_bad: string | null;

    // EXAMPLES & FEW-SHOT LEARNING
    example_scenario_1: string | null;
    example_scenario_2: string | null;
    example_scenario_3: string | null;

    // EDGE CASES & GUARDRAILS
    edge_case_handling: string | null;
    forbidden_responses: string | null;
    escalation_triggers: string | null;
    fallback_response: string | null;

    // QUALITY & REFINEMENT
    testing_notes: string | null;
    iteration_goals: string | null;
    performance_metrics: string | null;

    created_date: string;
}

export interface PromptTemplate {
    template_id: string;
    template_name: string;
    use_case_category: string;
    template_description: string;
    pre_filled_role: string;
    pre_filled_context: string | null;
    pre_filled_task: string;
    pre_filled_output_format: string | null;
    is_public: boolean;
    created_by: string;
    created_date: string;
}

export interface GeneratedPrompt {
    generated_id: string;
    project_id: string;
    component_id: string;
    full_prompt_text: string;
    prompt_token_count: number | null;

    // LLM Execution Details
    llm_provider: LLMProvider | null;
    llm_model: string | null;
    execution_input: string | null;
    execution_output: string | null;
    execution_date: string | null;
    execution_token_count: number | null;
    execution_cost: number | null;

    generated_date: string;
    tested: boolean;
    test_results: string | null;
    deployed_to: string | null;
    performance_rating: number | null;
}

export interface PerformanceTracking {
    tracking_id: string;
    generated_id: string;
    date_used: string;
    use_count: number;
    success_rate: number | null;
    average_response_time: number | null;
    user_satisfaction: number | null;
    issues_identified: string | null;
}

// Create types for inserting new records (without auto-generated fields)
export type PromptProjectInsert = Omit<
    PromptProject,
    'project_id' | 'created_date' | 'last_modified'
>;

export type PromptComponentInsert = Omit<
    PromptComponent,
    'component_id' | 'created_date'
>;

export type PromptTemplateInsert = Omit<
    PromptTemplate,
    'template_id' | 'created_date'
>;

export type GeneratedPromptInsert = Omit<
    GeneratedPrompt,
    'generated_id' | 'generated_date'
>;

export type PerformanceTrackingInsert = Omit<
    PerformanceTracking,
    'tracking_id'
>;

// Update types (all fields optional except ID)
export type PromptProjectUpdate = Partial<Omit<PromptProject, 'project_id'>>;
export type PromptComponentUpdate = Partial<Omit<PromptComponent, 'component_id'>>;
export type PromptTemplateUpdate = Partial<Omit<PromptTemplate, 'template_id'>>;
export type GeneratedPromptUpdate = Partial<Omit<GeneratedPrompt, 'generated_id'>>;
export type PerformanceTrackingUpdate = Partial<Omit<PerformanceTracking, 'tracking_id'>>;

// Combined types with relationships
export interface ProjectWithComponents extends PromptProject {
    components: PromptComponent[];
}

export interface ProjectWithLatestComponent extends PromptProject {
    latest_component: PromptComponent | null;
}

export interface GeneratedPromptWithDetails extends GeneratedPrompt {
    project: PromptProject;
    component: PromptComponent;
    performance: PerformanceTracking[];
}
