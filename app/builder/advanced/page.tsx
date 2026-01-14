'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import {
  PromptFormData,
  INITIAL_FORM_DATA,
  ProjectListItem,
  USE_CASE_CATEGORIES,
  TONE_VOICE_OPTIONS,
  INPUT_FORMAT_OPTIONS,
  OUTPUT_FORMAT_OPTIONS,
  OUTPUT_LENGTH_OPTIONS
} from '@/lib/types/prompt'
import { validatePromptForm, validateField, getTabForField } from '@/lib/utils/validation'
import styles from './advanced.module.css'

const TAB_NAMES = [
  'Basic Information',
  'AI Configuration',
  'Task Definition',
  'Input/Output',
  'Instructions',
  'Context & Examples',
  'Quality & Safety',
  'Advanced'
]

export default function AdvancedBuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Auth state
  const [user, setUser] = useState<User | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState<number>(0)
  const [projectMode, setProjectMode] = useState<'new' | 'existing'>('new')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [existingProjects, setExistingProjects] = useState<ProjectListItem[]>([])

  // Form state
  const [formData, setFormData] = useState<PromptFormData>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // Loading/Error state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null)

  // Check authentication and load data
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Load user's existing projects for dropdown
      const { data: projects } = await supabase
        .from('prompt_projects')
        .select('project_id, project_name, use_case_category, last_modified')
        .eq('owner', user.id)
        .order('last_modified', { ascending: false })

      if (projects) {
        setExistingProjects(projects)
      }

      // Check if editing existing project
      const projectId = searchParams.get('projectId')
      const componentId = searchParams.get('componentId')

      if (projectId && componentId) {
        await loadProjectForEditing(projectId, componentId)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  // Load project data for editing
  async function loadProjectForEditing(projectId: string, componentId: string) {
    const { data: project } = await supabase
      .from('prompt_projects')
      .select('*')
      .eq('project_id', projectId)
      .single()

    const { data: component } = await supabase
      .from('prompt_components')
      .select('*')
      .eq('component_id', componentId)
      .single()

    if (project && component) {
      setFormData({
        project_name: project.project_name,
        use_case_category: project.use_case_category,
        business_objective: project.business_objective,
        target_audience: project.target_audience,
        ai_role: component.ai_role,
        role_expertise: component.role_expertise,
        tone_voice: component.tone_voice,
        business_context: component.business_context,
        constraints: component.constraints,
        knowledge_sources: component.knowledge_sources,
        brand_guidelines: component.brand_guidelines,
        primary_task: component.primary_task,
        step_by_step_process: component.step_by_step_process,
        success_criteria: component.success_criteria,
        input_format: component.input_format,
        input_example_1: component.input_example_1,
        input_example_2: component.input_example_2,
        input_validation: component.input_validation,
        output_format: component.output_format,
        output_structure: component.output_structure,
        output_length: component.output_length,
        output_example_good: component.output_example_good,
        output_example_bad: component.output_example_bad,
        example_scenario_1: component.example_scenario_1,
        example_scenario_2: component.example_scenario_2,
        example_scenario_3: component.example_scenario_3,
        edge_case_handling: component.edge_case_handling,
        forbidden_responses: component.forbidden_responses,
        escalation_triggers: component.escalation_triggers,
        fallback_response: component.fallback_response,
        testing_notes: component.testing_notes,
        iteration_goals: component.iteration_goals,
        performance_metrics: component.performance_metrics
      })
      setIsEditMode(true)
      setEditingComponentId(componentId)
      setSelectedProjectId(projectId)
    }
  }

  // Handle field change
  function handleFieldChange(field: keyof PromptFormData, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Handle field blur (for validation)
  function handleFieldBlur(field: keyof PromptFormData) {
    setTouchedFields(prev => new Set([...prev, field]))

    const error = validateField(field, formData[field])
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  // Handle save
  async function handleSave() {
    const validation = validatePromptForm(formData)

    if (!validation.isValid) {
      setErrors(validation.errors)

      // Jump to first tab with error
      const firstErrorField = Object.keys(validation.errors)[0]
      const tabIndex = getTabForField(firstErrorField)
      setActiveTab(tabIndex)

      return
    }

    if (isEditMode) {
      await handleUpdateExisting()
    } else if (projectMode === 'new') {
      await handleSaveNewProject()
    } else {
      await handleSaveExistingProject()
    }
  }

  // Save new project
  async function handleSaveNewProject() {
    setSaving(true)
    setError(null)

    try {
      // 1. Insert into prompt_projects
      const { data: project, error: projectError } = await supabase
        .from('prompt_projects')
        .insert({
          project_name: formData.project_name,
          use_case_category: formData.use_case_category,
          business_objective: formData.business_objective,
          target_audience: formData.target_audience,
          status: 'Draft',
          owner: user!.id
        })
        .select()
        .single()

      if (projectError) throw projectError

      // 2. Insert into prompt_components
      const { error: componentError } = await supabase
        .from('prompt_components')
        .insert({
          project_id: project.project_id,
          version_number: 1,
          ai_role: formData.ai_role,
          role_expertise: formData.role_expertise,
          tone_voice: formData.tone_voice,
          business_context: formData.business_context,
          constraints: formData.constraints,
          knowledge_sources: formData.knowledge_sources,
          brand_guidelines: formData.brand_guidelines,
          primary_task: formData.primary_task,
          step_by_step_process: formData.step_by_step_process,
          success_criteria: formData.success_criteria,
          input_format: formData.input_format,
          input_example_1: formData.input_example_1,
          input_example_2: formData.input_example_2,
          input_validation: formData.input_validation,
          output_format: formData.output_format,
          output_structure: formData.output_structure,
          output_length: formData.output_length,
          output_example_good: formData.output_example_good,
          output_example_bad: formData.output_example_bad,
          example_scenario_1: formData.example_scenario_1,
          example_scenario_2: formData.example_scenario_2,
          example_scenario_3: formData.example_scenario_3,
          edge_case_handling: formData.edge_case_handling,
          forbidden_responses: formData.forbidden_responses,
          escalation_triggers: formData.escalation_triggers,
          fallback_response: formData.fallback_response,
          testing_notes: formData.testing_notes,
          iteration_goals: formData.iteration_goals,
          performance_metrics: formData.performance_metrics
        })

      if (componentError) throw componentError

      // 3. Redirect to library
      router.push('/library')
    } catch (err: any) {
      setError(err.message || 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  // Save new version to existing project
  async function handleSaveExistingProject() {
    if (!selectedProjectId) return

    setSaving(true)
    setError(null)

    try {
      // Get max version number
      const { data: versions } = await supabase
        .from('prompt_components')
        .select('version_number')
        .eq('project_id', selectedProjectId)
        .order('version_number', { ascending: false })
        .limit(1)

      const nextVersion = versions?.[0]?.version_number + 1 || 1

      // Insert new component version
      const { error: componentError } = await supabase
        .from('prompt_components')
        .insert({
          project_id: selectedProjectId,
          version_number: nextVersion,
          ai_role: formData.ai_role,
          role_expertise: formData.role_expertise,
          tone_voice: formData.tone_voice,
          business_context: formData.business_context,
          constraints: formData.constraints,
          knowledge_sources: formData.knowledge_sources,
          brand_guidelines: formData.brand_guidelines,
          primary_task: formData.primary_task,
          step_by_step_process: formData.step_by_step_process,
          success_criteria: formData.success_criteria,
          input_format: formData.input_format,
          input_example_1: formData.input_example_1,
          input_example_2: formData.input_example_2,
          input_validation: formData.input_validation,
          output_format: formData.output_format,
          output_structure: formData.output_structure,
          output_length: formData.output_length,
          output_example_good: formData.output_example_good,
          output_example_bad: formData.output_example_bad,
          example_scenario_1: formData.example_scenario_1,
          example_scenario_2: formData.example_scenario_2,
          example_scenario_3: formData.example_scenario_3,
          edge_case_handling: formData.edge_case_handling,
          forbidden_responses: formData.forbidden_responses,
          escalation_triggers: formData.escalation_triggers,
          fallback_response: formData.fallback_response,
          testing_notes: formData.testing_notes,
          iteration_goals: formData.iteration_goals,
          performance_metrics: formData.performance_metrics
        })

      if (componentError) throw componentError

      // Update last_modified
      await supabase
        .from('prompt_projects')
        .update({ last_modified: new Date().toISOString() })
        .eq('project_id', selectedProjectId)

      // Redirect to library
      router.push('/library')
    } catch (err: any) {
      setError(err.message || 'Failed to save version')
    } finally {
      setSaving(false)
    }
  }

  // Update existing project and component
  async function handleUpdateExisting() {
    if (!selectedProjectId || !editingComponentId) return

    setSaving(true)
    setError(null)

    try {
      // Update prompt_projects
      const { error: projectError } = await supabase
        .from('prompt_projects')
        .update({
          project_name: formData.project_name,
          use_case_category: formData.use_case_category,
          business_objective: formData.business_objective,
          target_audience: formData.target_audience,
          last_modified: new Date().toISOString()
        })
        .eq('project_id', selectedProjectId)

      if (projectError) throw projectError

      // Update prompt_components
      const { error: componentError } = await supabase
        .from('prompt_components')
        .update({
          ai_role: formData.ai_role,
          role_expertise: formData.role_expertise,
          tone_voice: formData.tone_voice,
          business_context: formData.business_context,
          constraints: formData.constraints,
          knowledge_sources: formData.knowledge_sources,
          brand_guidelines: formData.brand_guidelines,
          primary_task: formData.primary_task,
          step_by_step_process: formData.step_by_step_process,
          success_criteria: formData.success_criteria,
          input_format: formData.input_format,
          input_example_1: formData.input_example_1,
          input_example_2: formData.input_example_2,
          input_validation: formData.input_validation,
          output_format: formData.output_format,
          output_structure: formData.output_structure,
          output_length: formData.output_length,
          output_example_good: formData.output_example_good,
          output_example_bad: formData.output_example_bad,
          example_scenario_1: formData.example_scenario_1,
          example_scenario_2: formData.example_scenario_2,
          example_scenario_3: formData.example_scenario_3,
          edge_case_handling: formData.edge_case_handling,
          forbidden_responses: formData.forbidden_responses,
          escalation_triggers: formData.escalation_triggers,
          fallback_response: formData.fallback_response,
          testing_notes: formData.testing_notes,
          iteration_goals: formData.iteration_goals,
          performance_metrics: formData.performance_metrics
        })
        .eq('component_id', editingComponentId)

      if (componentError) throw componentError

      // Redirect to library
      router.push('/library')
    } catch (err: any) {
      setError(err.message || 'Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  // Check if tab has errors
  function tabHasErrors(tabIndex: number): boolean {
    const tabFields = [
      ['project_name', 'use_case_category', 'business_objective', 'target_audience'],
      ['ai_role', 'role_expertise', 'tone_voice', 'business_context'],
      ['primary_task', 'success_criteria', 'constraints', 'knowledge_sources', 'brand_guidelines'],
      ['input_format', 'input_example_1', 'input_example_2', 'input_validation',
       'output_format', 'output_structure', 'output_length', 'output_example_good', 'output_example_bad'],
      ['step_by_step_process'],
      ['example_scenario_1', 'example_scenario_2', 'example_scenario_3'],
      ['edge_case_handling', 'forbidden_responses', 'escalation_triggers', 'fallback_response'],
      ['testing_notes', 'iteration_goals', 'performance_metrics']
    ]

    return tabFields[tabIndex]?.some(field => errors[field]) || false
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Advanced Prompt Builder</h1>
          <button
            onClick={() => router.push('/library')}
            className={styles.backButton}
          >
            Back to Library
          </button>
        </div>

        {!isEditMode && (
          <div className={styles.projectSelector}>
            <h3>Project Mode</h3>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  checked={projectMode === 'new'}
                  onChange={() => setProjectMode('new')}
                />
                <span>Create New Project</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  checked={projectMode === 'existing'}
                  onChange={() => setProjectMode('existing')}
                />
                <span>Add Version to Existing Project</span>
              </label>
            </div>

            {projectMode === 'existing' && (
              <Select
                label="Select Project"
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                options={existingProjects.map(p => ({
                  value: p.project_id,
                  label: `${p.project_name} (${p.use_case_category})`
                }))}
                placeholder="Choose a project..."
                required
              />
            )}
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}

        <div className={styles.tabContainer}>
          <div className={styles.tabNavigation}>
            <div className={styles.tabList}>
              {TAB_NAMES.map((name, index) => (
                <button
                  key={index}
                  className={`${styles.tabButton} ${activeTab === index ? styles.tabButtonActive : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  <span>{name}</span>
                  {tabHasErrors(index) && <span className={styles.errorIndicator} />}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.tabContent}>
            {/* Tab 0: Basic Information */}
            {activeTab === 0 && (
              <div className={styles.formSection}>
                <h2>Basic Information</h2>
                <div className={styles.fieldsGrid}>
                  <div className={styles.field}>
                    <Input
                      label="Project Name"
                      required
                      value={formData.project_name}
                      onChange={(e) => handleFieldChange('project_name', e.target.value)}
                      onBlur={() => handleFieldBlur('project_name')}
                      error={errors.project_name}
                      placeholder="e.g., E-commerce Customer Support Assistant"
                      disabled={projectMode === 'existing'}
                    />
                  </div>
                  <div className={styles.field}>
                    <Select
                      label="Use Case Category"
                      required
                      value={formData.use_case_category}
                      onChange={(e) => handleFieldChange('use_case_category', e.target.value)}
                      onBlur={() => handleFieldBlur('use_case_category')}
                      error={errors.use_case_category}
                      options={USE_CASE_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                      placeholder="Select category..."
                      disabled={projectMode === 'existing'}
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Business Objective"
                      required
                      value={formData.business_objective}
                      onChange={(e) => handleFieldChange('business_objective', e.target.value)}
                      onBlur={() => handleFieldBlur('business_objective')}
                      error={errors.business_objective}
                      placeholder="e.g., Reduce response time and improve customer satisfaction by automating common support inquiries"
                      maxLength={500}
                      showCount
                      disabled={projectMode === 'existing'}
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Input
                      label="Target Audience"
                      required
                      value={formData.target_audience}
                      onChange={(e) => handleFieldChange('target_audience', e.target.value)}
                      onBlur={() => handleFieldBlur('target_audience')}
                      error={errors.target_audience}
                      placeholder="e.g., Online shoppers seeking help with orders, returns, and product questions"
                      disabled={projectMode === 'existing'}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 1: AI Configuration */}
            {activeTab === 1 && (
              <div className={styles.formSection}>
                <h2>AI Configuration</h2>
                <div className={styles.fieldsGrid}>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="AI Role"
                      required
                      value={formData.ai_role}
                      onChange={(e) => handleFieldChange('ai_role', e.target.value)}
                      onBlur={() => handleFieldBlur('ai_role')}
                      error={errors.ai_role}
                      placeholder="e.g., You are an expert e-commerce support specialist with deep knowledge of order processing, shipping policies, and product troubleshooting"
                      maxLength={300}
                      showCount
                    />
                  </div>
                  <div className={styles.field}>
                    <Select
                      label="Tone & Voice"
                      required
                      value={formData.tone_voice}
                      onChange={(e) => handleFieldChange('tone_voice', e.target.value)}
                      onBlur={() => handleFieldBlur('tone_voice')}
                      error={errors.tone_voice}
                      options={TONE_VOICE_OPTIONS.map(tone => ({ value: tone, label: tone }))}
                      placeholder="Select tone..."
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Business Context"
                      required
                      value={formData.business_context}
                      onChange={(e) => handleFieldChange('business_context', e.target.value)}
                      onBlur={() => handleFieldBlur('business_context')}
                      error={errors.business_context}
                      placeholder="e.g., Our company ships worldwide, offers 30-day returns, and has a price-match guarantee. Peak season is November-December"
                      maxLength={1000}
                      showCount
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Task Definition */}
            {activeTab === 2 && (
              <div className={styles.formSection}>
                <h2>Task Definition</h2>
                <div className={styles.fieldsGrid}>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Primary Task"
                      required
                      value={formData.primary_task}
                      onChange={(e) => handleFieldChange('primary_task', e.target.value)}
                      onBlur={() => handleFieldBlur('primary_task')}
                      error={errors.primary_task}
                      placeholder="e.g., Answer customer questions about orders, provide shipping updates, process return requests, and troubleshoot product issues"
                      maxLength={500}
                      showCount
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Success Criteria"
                      required
                      value={formData.success_criteria}
                      onChange={(e) => handleFieldChange('success_criteria', e.target.value)}
                      onBlur={() => handleFieldBlur('success_criteria')}
                      error={errors.success_criteria}
                      placeholder="e.g., Customer receives accurate answer within 30 seconds, issue is resolved without human escalation 80% of the time"
                      maxLength={500}
                      showCount
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Constraints & Limitations"
                      value={formData.constraints || ''}
                      onChange={(e) => handleFieldChange('constraints', e.target.value || null)}
                      placeholder="e.g., Cannot offer refunds over $500, cannot change delivery addresses after shipment, must verify customer identity for account changes"
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Knowledge Sources"
                      value={formData.knowledge_sources || ''}
                      onChange={(e) => handleFieldChange('knowledge_sources', e.target.value || null)}
                      placeholder="e.g., Product catalog database, shipping policy documentation, FAQ knowledge base, order tracking system"
                    />
                  </div>
                  <div className={styles.field}>
                    <Input
                      label="Brand Guidelines"
                      value={formData.brand_guidelines || ''}
                      onChange={(e) => handleFieldChange('brand_guidelines', e.target.value || null)}
                      placeholder="e.g., https://company.com/brand-voice-guide or 'Use friendly, conversational tone; avoid jargon'"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Input/Output */}
            {activeTab === 3 && (
              <div className={styles.formSection}>
                <h2>Input/Output Specifications</h2>
                <div className={styles.fieldsGrid}>
                  <div className={styles.field}>
                    <Select
                      label="Input Format"
                      required
                      value={formData.input_format}
                      onChange={(e) => handleFieldChange('input_format', e.target.value)}
                      onBlur={() => handleFieldBlur('input_format')}
                      error={errors.input_format}
                      options={INPUT_FORMAT_OPTIONS.map(fmt => ({ value: fmt, label: fmt }))}
                      placeholder="Select format..."
                    />
                  </div>
                  <div className={styles.field}>
                    <Select
                      label="Output Format"
                      required
                      value={formData.output_format}
                      onChange={(e) => handleFieldChange('output_format', e.target.value)}
                      onBlur={() => handleFieldBlur('output_format')}
                      error={errors.output_format}
                      options={OUTPUT_FORMAT_OPTIONS.map(fmt => ({ value: fmt, label: fmt }))}
                      placeholder="Select format..."
                    />
                  </div>
                  <div className={styles.field}>
                    <Select
                      label="Output Length"
                      required
                      value={formData.output_length}
                      onChange={(e) => handleFieldChange('output_length', e.target.value)}
                      onBlur={() => handleFieldBlur('output_length')}
                      error={errors.output_length}
                      options={OUTPUT_LENGTH_OPTIONS.map(len => ({ value: len, label: len }))}
                      placeholder="Select length..."
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Input Example 1"
                      value={formData.input_example_1 || ''}
                      onChange={(e) => handleFieldChange('input_example_1', e.target.value || null)}
                      placeholder="e.g., 'Where is my order #12345?' or 'I want to return a defective product'"
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Input Example 2"
                      value={formData.input_example_2 || ''}
                      onChange={(e) => handleFieldChange('input_example_2', e.target.value || null)}
                      placeholder="e.g., 'Can I change my shipping address?' or 'What's your price match policy?'"
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Output Structure"
                      value={formData.output_structure || ''}
                      onChange={(e) => handleFieldChange('output_structure', e.target.value || null)}
                      placeholder="e.g., Start with direct answer, include relevant links, end with 'Is there anything else I can help you with?'"
                    />
                  </div>
                  <div className={styles.field}>
                    <Textarea
                      label="Good Output Example"
                      value={formData.output_example_good || ''}
                      onChange={(e) => handleFieldChange('output_example_good', e.target.value || null)}
                      placeholder="e.g., 'Your order #12345 shipped yesterday via FedEx. Track it here: [link]. Expected delivery: Jan 15. Anything else?'"
                    />
                  </div>
                  <div className={styles.field}>
                    <Textarea
                      label="Bad Output Example"
                      value={formData.output_example_bad || ''}
                      onChange={(e) => handleFieldChange('output_example_bad', e.target.value || null)}
                      placeholder="e.g., 'I don't know' or 'Contact support' (too vague, unhelpful, doesn't use available data)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Instructions */}
            {activeTab === 4 && (
              <div className={styles.formSection}>
                <h2>Instructions</h2>
                <div className={styles.fieldsGrid}>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Step-by-Step Process"
                      value={formData.step_by_step_process || ''}
                      onChange={(e) => handleFieldChange('step_by_step_process', e.target.value || null)}
                      placeholder="e.g., 1. Identify the customer's issue category 2. Look up order details in system 3. Provide specific answer with data 4. Offer next steps or escalation if needed"
                      rows={10}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Context & Examples */}
            {activeTab === 5 && (
              <div className={styles.formSection}>
                <h2>Context & Examples</h2>
                <div className={styles.fieldsGrid}>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Example Scenario 1"
                      value={formData.example_scenario_1 || ''}
                      onChange={(e) => handleFieldChange('example_scenario_1', e.target.value || null)}
                      placeholder="e.g., Customer asks: 'My package says delivered but I didn't receive it' → AI checks tracking, sees signed delivery, asks for delivery location verification, offers filing claim if needed"
                      rows={6}
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Example Scenario 2"
                      value={formData.example_scenario_2 || ''}
                      onChange={(e) => handleFieldChange('example_scenario_2', e.target.value || null)}
                      placeholder="e.g., Customer: 'I want to return my shirt, it doesn't fit' → AI confirms order date (within 30 days), asks for reason, provides return label link, explains refund timeline"
                      rows={6}
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Example Scenario 3"
                      value={formData.example_scenario_3 || ''}
                      onChange={(e) => handleFieldChange('example_scenario_3', e.target.value || null)}
                      placeholder="e.g., Customer: 'Do you price match?' → AI explains price match policy, asks for competitor link, verifies item is identical and in stock, provides instructions for price adjustment"
                      rows={6}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: Quality & Safety */}
            {activeTab === 6 && (
              <div className={styles.formSection}>
                <h2>Quality & Safety</h2>
                <div className={styles.fieldsGrid}>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Edge Case Handling"
                      value={formData.edge_case_handling || ''}
                      onChange={(e) => handleFieldChange('edge_case_handling', e.target.value || null)}
                      placeholder="e.g., If order number not found, ask customer to verify. If international shipping, explain customs delays. If out of stock, offer alternative products"
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Forbidden Responses"
                      value={formData.forbidden_responses || ''}
                      onChange={(e) => handleFieldChange('forbidden_responses', e.target.value || null)}
                      placeholder="e.g., Never promise refunds without policy check, never share other customers' data, never make unauthorized account changes, never guarantee delivery dates"
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Escalation Triggers"
                      value={formData.escalation_triggers || ''}
                      onChange={(e) => handleFieldChange('escalation_triggers', e.target.value || null)}
                      placeholder="e.g., Angry/abusive language, requests over $500, suspected fraud, technical issues the AI can't solve, legal/compliance questions"
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Input
                      label="Fallback Response"
                      value={formData.fallback_response || ''}
                      onChange={(e) => handleFieldChange('fallback_response', e.target.value || null)}
                      placeholder="e.g., 'I want to make sure I give you accurate information. Let me connect you with a specialist who can help with this specific request.'"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 7: Advanced */}
            {activeTab === 7 && (
              <div className={styles.formSection}>
                <h2>Advanced Options</h2>
                <div className={styles.fieldsGrid}>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Testing Notes"
                      value={formData.testing_notes || ''}
                      onChange={(e) => handleFieldChange('testing_notes', e.target.value || null)}
                      placeholder="e.g., Test with various order statuses, international addresses, expired return windows, price match edge cases"
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Textarea
                      label="Iteration Goals"
                      value={formData.iteration_goals || ''}
                      onChange={(e) => handleFieldChange('iteration_goals', e.target.value || null)}
                      placeholder="e.g., Add multilingual support, integrate with CRM for personalized responses, improve handling of bulk orders, add proactive order status updates"
                    />
                  </div>
                  <div className={styles.fieldFull}>
                    <Input
                      label="Performance Metrics"
                      value={formData.performance_metrics || ''}
                      onChange={(e) => handleFieldChange('performance_metrics', e.target.value || null)}
                      placeholder="e.g., Response time under 2 seconds, customer satisfaction score above 4.5/5, resolution rate above 85%"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.actions}>
              <button
                onClick={handleSave}
                disabled={saving}
                className={styles.saveButton}
              >
                {saving ? 'Saving...' : isEditMode ? 'Update Project' : 'Save Project'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
