import type { PromptComponent } from '../supabase/types';

/**
 * Compiles a PromptComponent into a full, formatted prompt text
 * following best practices for LLM prompt engineering
 */
export function compilePrompt(component: PromptComponent): string {
    const sections: string[] = [];

    // ROLE SECTION
    if (component.ai_role) {
        sections.push(`ROLE:`);
        sections.push(component.ai_role);
        sections.push('');
    }

    // CONTEXT SECTION
    if (component.business_context) {
        sections.push(`CONTEXT:`);
        sections.push(component.business_context);

        if (component.knowledge_sources) {
            sections.push('');
            sections.push(`Knowledge Sources: ${component.knowledge_sources}`);
        }

        if (component.brand_guidelines) {
            sections.push('');
            sections.push(`Brand Guidelines: ${component.brand_guidelines}`);
        }
        sections.push('');
    }

    // CONSTRAINTS SECTION
    if (component.constraints) {
        sections.push(`CONSTRAINTS:`);
        component.constraints.split('\n').forEach(constraint => {
            if (constraint.trim()) {
                sections.push(`- ${constraint.trim()}`);
            }
        });
        sections.push('');
    }

    // TASK SECTION
    if (component.primary_task) {
        sections.push(`YOUR TASK:`);
        sections.push(component.primary_task);
        sections.push('');
    }

    // PROCESS SECTION
    if (component.step_by_step_process) {
        sections.push(`PROCESS:`);
        const steps = component.step_by_step_process.split('\n');
        steps.forEach((step, index) => {
            if (step.trim()) {
                sections.push(`${index + 1}. ${step.trim()}`);
            }
        });
        sections.push('');
    }

    // INPUT FORMAT SECTION
    if (component.input_format) {
        sections.push(`INPUT FORMAT: ${component.input_format}`);
        if (component.input_validation) {
            sections.push(`Input Validation: ${component.input_validation}`);
        }
        sections.push('');
    }

    // OUTPUT FORMAT SECTION
    if (component.output_format || component.output_structure) {
        sections.push(`OUTPUT FORMAT:`);
        if (component.output_format) {
            sections.push(`Type: ${component.output_format}`);
        }
        if (component.output_length) {
            sections.push(`Length: ${component.output_length}`);
        }
        if (component.output_structure) {
            sections.push('');
            sections.push('Structure:');
            sections.push(component.output_structure);
        }
        sections.push('');
    }

    // EXAMPLES SECTION
    const examples = [
        component.example_scenario_1,
        component.example_scenario_2,
        component.example_scenario_3,
    ].filter(Boolean);

    if (examples.length > 0) {
        sections.push(`EXAMPLES:`);
        sections.push('');
        examples.forEach((example, index) => {
            sections.push(`Example ${index + 1}:`);
            sections.push(example!);
            sections.push('');
        });
    }

    // GOOD/BAD OUTPUT EXAMPLES
    if (component.output_example_good || component.output_example_bad) {
        if (component.output_example_good) {
            sections.push(`GOOD OUTPUT EXAMPLE:`);
            sections.push(component.output_example_good);
            sections.push('');
        }
        if (component.output_example_bad) {
            sections.push(`AVOID (Bad Example):`);
            sections.push(component.output_example_bad);
            sections.push('');
        }
    }

    // EDGE CASES & GUARDRAILS
    if (component.edge_case_handling) {
        sections.push(`EDGE CASE HANDLING:`);
        component.edge_case_handling.split('\n').forEach(edge => {
            if (edge.trim()) {
                sections.push(`- ${edge.trim()}`);
            }
        });
        sections.push('');
    }

    // FORBIDDEN RESPONSES
    if (component.forbidden_responses) {
        sections.push(`NEVER:`);
        component.forbidden_responses.split('\n').forEach(forbidden => {
            if (forbidden.trim()) {
                sections.push(`- ${forbidden.trim()}`);
            }
        });
        sections.push('');
    }

    // ESCALATION TRIGGERS
    if (component.escalation_triggers) {
        sections.push(`ESCALATE IMMEDIATELY FOR:`);
        component.escalation_triggers.split('\n').forEach(trigger => {
            if (trigger.trim()) {
                sections.push(`- ${trigger.trim()}`);
            }
        });
        sections.push('');
    }

    // FALLBACK
    if (component.fallback_response) {
        sections.push(`FALLBACK RESPONSE:`);
        sections.push(`If uncertain, use: "${component.fallback_response}"`);
        sections.push('');
    }

    // SUCCESS CRITERIA
    if (component.success_criteria) {
        sections.push(`SUCCESS CRITERIA:`);
        sections.push(component.success_criteria);
    }

    return sections.join('\n').trim();
}

/**
 * Estimates token count for a given text
 * Rough approximation: 1 token ≈ 4 characters
 */
export function estimateTokenCount(text: string): number {
    return Math.round(text.length / 4);
}

/**
 * Validates a prompt component has all required fields
 */
export function validateComponent(component: Partial<PromptComponent>): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Required fields
    if (!component.ai_role || component.ai_role.length < 20) {
        errors.push('AI Role must be at least 20 characters');
    }

    if (!component.tone_voice) {
        errors.push('Tone/Voice is required');
    }

    if (!component.business_context || component.business_context.length < 50) {
        errors.push('Business Context must be at least 50 characters');
    }

    if (!component.primary_task || component.primary_task.length < 30) {
        errors.push('Primary Task must be at least 30 characters');
    }

    if (!component.success_criteria || component.success_criteria.length < 20) {
        errors.push('Success Criteria must be at least 20 characters');
    }

    if (!component.input_format) {
        errors.push('Input Format is required');
    }

    if (!component.output_format) {
        errors.push('Output Format is required');
    }

    if (!component.output_length) {
        errors.push('Output Length is required');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
