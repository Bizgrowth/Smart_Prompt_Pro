-- AI Prompt Pro Database Schema
-- This SQL file creates all 5 tables with complete schema as specified

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: PROMPT_PROJECTS
-- Master table for organizing prompt engineering work
CREATE TABLE IF NOT EXISTS prompt_projects (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name VARCHAR(100) NOT NULL CHECK (LENGTH(project_name) >= 5 AND LENGTH(project_name) <= 100),
    use_case_category VARCHAR(50) NOT NULL CHECK (use_case_category IN (
        'Customer Support',
        'Content Generation',
        'Data Analysis',
        'Lead Qualification',
        'Email Automation',
        'Sales Enablement',
        'Process Automation',
        'Other'
    )),
    business_objective TEXT NOT NULL CHECK (LENGTH(business_objective) >= 20 AND LENGTH(business_objective) <= 500),
    target_audience VARCHAR(200) NOT NULL CHECK (LENGTH(target_audience) >= 10 AND LENGTH(target_audience) <= 200),
    created_date TIMESTAMP DEFAULT NOW(),
    last_modified TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'In Review', 'Active', 'Archived')),
    owner UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    CONSTRAINT project_name_unique_per_user UNIQUE (owner, project_name)
);

-- Table 2: PROMPT_COMPONENTS
-- Core prompt engineering fields following best practices
CREATE TABLE IF NOT EXISTS prompt_components (
    component_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES prompt_projects(project_id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    
    -- ROLE DEFINITION
    ai_role TEXT NOT NULL CHECK (LENGTH(ai_role) >= 20 AND LENGTH(ai_role) <= 300),
    role_expertise TEXT[], -- Multi-select: Technical Knowledge, Industry Experience, etc.
    tone_voice VARCHAR(50) NOT NULL CHECK (tone_voice IN (
        'Professional', 'Friendly', 'Technical', 'Casual', 'Formal', 'Empathetic', 'Direct'
    )),
    
    -- CONTEXT & BACKGROUND
    business_context TEXT NOT NULL CHECK (LENGTH(business_context) >= 50 AND LENGTH(business_context) <= 1000),
    constraints TEXT CHECK (LENGTH(constraints) <= 500),
    knowledge_sources TEXT CHECK (LENGTH(knowledge_sources) <= 500),
    brand_guidelines VARCHAR(300),
    
    -- TASK & INSTRUCTIONS
    primary_task TEXT NOT NULL CHECK (LENGTH(primary_task) >= 30 AND LENGTH(primary_task) <= 500),
    step_by_step_process TEXT CHECK (LENGTH(step_by_step_process) <= 1000),
    success_criteria TEXT NOT NULL CHECK (LENGTH(success_criteria) >= 20 AND LENGTH(success_criteria) <= 500),
    
    -- INPUT SPECIFICATIONS
    input_format VARCHAR(50) NOT NULL CHECK (input_format IN (
        'Text', 'Structured Data (JSON)', 'Form Fields', 'Email', 'Chat Message', 'File Upload', 'Multiple Formats'
    )),
    input_example_1 TEXT CHECK (LENGTH(input_example_1) <= 1000),
    input_example_2 TEXT CHECK (LENGTH(input_example_2) <= 1000),
    input_validation VARCHAR(300),
    
    -- OUTPUT SPECIFICATIONS
    output_format VARCHAR(50) NOT NULL CHECK (output_format IN (
        'Plain Text', 'Markdown', 'JSON', 'HTML', 'Structured Template', 'Bullet Points', 'Numbered List'
    )),
    output_structure TEXT CHECK (LENGTH(output_structure) <= 1000),
    output_length VARCHAR(50) NOT NULL CHECK (output_length IN (
        'Concise (1-2 sentences)', 'Brief (1 paragraph)', 'Standard (2-3 paragraphs)', 
        'Detailed (4+ paragraphs)', 'Variable based on input'
    )),
    output_example_good TEXT CHECK (LENGTH(output_example_good) <= 2000),
    output_example_bad TEXT CHECK (LENGTH(output_example_bad) <= 2000),
    
    -- EXAMPLES & FEW-SHOT LEARNING
    example_scenario_1 TEXT CHECK (LENGTH(example_scenario_1) <= 1500),
    example_scenario_2 TEXT CHECK (LENGTH(example_scenario_2) <= 1500),
    example_scenario_3 TEXT CHECK (LENGTH(example_scenario_3) <= 1500),
    
    -- EDGE CASES & GUARDRAILS
    edge_case_handling TEXT CHECK (LENGTH(edge_case_handling) <= 800),
    forbidden_responses TEXT CHECK (LENGTH(forbidden_responses) <= 500),
    escalation_triggers TEXT CHECK (LENGTH(escalation_triggers) <= 500),
    fallback_response VARCHAR(300),
    
    -- QUALITY & REFINEMENT
    testing_notes TEXT CHECK (LENGTH(testing_notes) <= 1000),
    iteration_goals TEXT CHECK (LENGTH(iteration_goals) <= 500),
    performance_metrics VARCHAR(300),
    
    created_date TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT version_unique_per_project UNIQUE (project_id, version_number)
);

-- Table 3: PROMPT_TEMPLATES
-- Reusable templates for common use cases
CREATE TABLE IF NOT EXISTS prompt_templates (
    template_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) NOT NULL CHECK (LENGTH(template_name) >= 5 AND LENGTH(template_name) <= 100),
    use_case_category VARCHAR(50) NOT NULL,
    template_description VARCHAR(300) NOT NULL CHECK (LENGTH(template_description) >= 20 AND LENGTH(template_description) <= 300),
    
    -- Pre-filled fields
    pre_filled_role TEXT NOT NULL CHECK (LENGTH(pre_filled_role) >= 20 AND LENGTH(pre_filled_role) <= 300),
    pre_filled_context TEXT CHECK (LENGTH(pre_filled_context) <= 500),
    pre_filled_task TEXT NOT NULL CHECK (LENGTH(pre_filled_task) >= 30 AND LENGTH(pre_filled_task) <= 500),
    pre_filled_output_format VARCHAR(200),
    
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_date TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT template_name_unique UNIQUE (template_name, created_by)
);

-- Table 4: GENERATED_PROMPTS
-- Final compiled prompts ready to use with LLM execution results
CREATE TABLE IF NOT EXISTS generated_prompts (
    generated_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES prompt_projects(project_id) ON DELETE CASCADE,
    component_id UUID NOT NULL REFERENCES prompt_components(component_id) ON DELETE CASCADE,
    
    full_prompt_text TEXT NOT NULL,
    prompt_token_count INTEGER,
    
    -- LLM Execution Details
    llm_provider VARCHAR(20) CHECK (llm_provider IN ('Claude', 'OpenAI', 'Gemini')),
    llm_model VARCHAR(50),
    execution_input TEXT,
    execution_output TEXT,
    execution_date TIMESTAMP,
    execution_token_count INTEGER,
    execution_cost DECIMAL(10, 4),
    
    generated_date TIMESTAMP DEFAULT NOW(),
    tested BOOLEAN DEFAULT FALSE,
    test_results TEXT CHECK (LENGTH(test_results) <= 2000),
    deployed_to VARCHAR(200),
    performance_rating DECIMAL(2, 1) CHECK (performance_rating >= 1 AND performance_rating <= 5)
);

-- Table 5: PERFORMANCE_TRACKING
-- Monitor prompt effectiveness over time
CREATE TABLE IF NOT EXISTS performance_tracking (
    tracking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generated_id UUID NOT NULL REFERENCES generated_prompts(generated_id) ON DELETE CASCADE,
    
    date_used DATE NOT NULL DEFAULT CURRENT_DATE,
    use_count INTEGER NOT NULL DEFAULT 0 CHECK (use_count >= 0),
    success_rate DECIMAL(5, 2) CHECK (success_rate >= 0 AND success_rate <= 100),
    average_response_time DECIMAL(10, 2), -- in seconds
    user_satisfaction DECIMAL(2, 1) CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
    issues_identified TEXT CHECK (LENGTH(issues_identified) <= 1000),
    
    CONSTRAINT tracking_unique_per_day UNIQUE (generated_id, date_used)
);

-- Create indexes for better query performance
CREATE INDEX idx_prompt_projects_owner ON prompt_projects(owner);
CREATE INDEX idx_prompt_projects_status ON prompt_projects(status);
CREATE INDEX idx_prompt_components_project ON prompt_components(project_id);
CREATE INDEX idx_generated_prompts_project ON generated_prompts(project_id);
CREATE INDEX idx_generated_prompts_component ON generated_prompts(component_id);
CREATE INDEX idx_performance_tracking_generated ON performance_tracking(generated_id);
CREATE INDEX idx_performance_tracking_date ON performance_tracking(date_used);

-- Row Level Security (RLS) Policies
ALTER TABLE prompt_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for prompt_projects
CREATE POLICY "Users can view their own projects" ON prompt_projects
    FOR SELECT USING (auth.uid() = owner);

CREATE POLICY "Users can insert their own projects" ON prompt_projects
    FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can update their own projects" ON prompt_projects
    FOR UPDATE USING (auth.uid() = owner);

CREATE POLICY "Users can delete their own projects" ON prompt_projects
    FOR DELETE USING (auth.uid() = owner);

-- Policies for prompt_components
CREATE POLICY "Users can view components of their projects" ON prompt_components
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM prompt_projects 
            WHERE prompt_projects.project_id = prompt_components.project_id 
            AND prompt_projects.owner = auth.uid()
        )
    );

CREATE POLICY "Users can insert components for their projects" ON prompt_components
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM prompt_projects 
            WHERE prompt_projects.project_id = prompt_components.project_id 
            AND prompt_projects.owner = auth.uid()
        )
    );

CREATE POLICY "Users can update components of their projects" ON prompt_components
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM prompt_projects 
            WHERE prompt_projects.project_id = prompt_components.project_id 
            AND prompt_projects.owner = auth.uid()
        )
    );

CREATE POLICY "Users can delete components of their projects" ON prompt_components
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM prompt_projects 
            WHERE prompt_projects.project_id = prompt_components.project_id 
            AND prompt_projects.owner = auth.uid()
        )
    );

-- Policies for prompt_templates
CREATE POLICY "Users can view public templates and their own" ON prompt_templates
    FOR SELECT USING (is_public = TRUE OR auth.uid() = created_by);

CREATE POLICY "Users can insert their own templates" ON prompt_templates
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" ON prompt_templates
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" ON prompt_templates
    FOR DELETE USING (auth.uid() = created_by);

-- Policies for generated_prompts (inherit from projects)
CREATE POLICY "Users can view generated prompts from their projects" ON generated_prompts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM prompt_projects 
            WHERE prompt_projects.project_id = generated_prompts.project_id 
            AND prompt_projects.owner = auth.uid()
        )
    );

CREATE POLICY "Users can insert generated prompts for their projects" ON generated_prompts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM prompt_projects 
            WHERE prompt_projects.project_id = generated_prompts.project_id 
            AND prompt_projects.owner = auth.uid()
        )
    );

CREATE POLICY "Users can update generated prompts from their projects" ON generated_prompts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM prompt_projects 
            WHERE prompt_projects.project_id = generated_prompts.project_id 
            AND prompt_projects.owner = auth.uid()
        )
    );

CREATE POLICY "Users can delete generated prompts from their projects" ON generated_prompts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM prompt_projects 
            WHERE prompt_projects.project_id = generated_prompts.project_id 
            AND prompt_projects.owner = auth.uid()
        )
    );

-- Policies for performance_tracking (inherit from generated_prompts)
CREATE POLICY "Users can view performance tracking for their prompts" ON performance_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM generated_prompts 
            JOIN prompt_projects ON generated_prompts.project_id = prompt_projects.project_id
            WHERE generated_prompts.generated_id = performance_tracking.generated_id 
            AND prompt_projects.owner = auth.uid()
        )
    );

CREATE POLICY "Users can insert performance tracking for their prompts" ON performance_tracking
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM generated_prompts 
            JOIN prompt_projects ON generated_prompts.project_id = prompt_projects.project_id
            WHERE generated_prompts.generated_id = performance_tracking.generated_id 
            AND prompt_projects.owner = auth.uid()
        )
    );

CREATE POLICY "Users can update performance tracking for their prompts" ON performance_tracking
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM generated_prompts 
            JOIN prompt_projects ON generated_prompts.project_id = prompt_projects.project_id
            WHERE generated_prompts.generated_id = performance_tracking.generated_id 
            AND prompt_projects.owner = auth.uid()
        )
    );

CREATE POLICY "Users can delete performance tracking for their prompts" ON performance_tracking
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM generated_prompts 
            JOIN prompt_projects ON generated_prompts.project_id = prompt_projects.project_id
            WHERE generated_prompts.generated_id = performance_tracking.generated_id 
            AND prompt_projects.owner = auth.uid()
        )
    );
