'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import styles from './quick.module.css'

type WorkflowStep = 'input' | 'edit' | 'preview' | 'output'

type ConversationMessage = {
    role: 'user' | 'assistant' | 'system'
    content: string
}

export default function QuickModePage() {
    const [user, setUser] = useState<any>(null)
    const [description, setDescription] = useState('')
    const [selectedModel, setSelectedModel] = useState<'claude' | 'gemini'>('claude')
    const [loading, setLoading] = useState(false)
    const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('input')
    const [extractedFields, setExtractedFields] = useState<any>(null)
    const [aiSuggestedFields, setAiSuggestedFields] = useState<Set<string>>(new Set())
    const [generatedPrompt, setGeneratedPrompt] = useState<string>('')
    const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
    const [followUpMessage, setFollowUpMessage] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }
            setUser(user)
        }
        checkUser()
    }, [router, supabase.auth])

    const handleAnalyze = async () => {
        if (!description.trim()) {
            setError('Please describe what kind of prompt you want to create')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Get API keys from localStorage
            const keysStr = localStorage.getItem('llm_api_keys')
            if (!keysStr) {
                setError('Please configure your API keys in Settings first')
                setLoading(false)
                return
            }

            const keys = JSON.parse(keysStr)
            const apiKey = selectedModel === 'claude' ? keys.claude : keys.gemini

            if (!apiKey) {
                setError(`Please add your ${selectedModel === 'claude' ? 'Claude' : 'Google Gemini'} API key in Settings`)
                setLoading(false)
                return
            }

            // Call our API route (server-side) to avoid CORS
            const response = await fetch('/api/analyze-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description,
                    apiKey,
                    provider: selectedModel
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('API Error Response:', errorData)
                throw new Error(errorData.error || 'Failed to analyze prompt')
            }

            const data = await response.json()
            console.log('API Success Response:', data)
            setExtractedFields(data.fields)

            // Mark all fields as AI-suggested initially
            setAiSuggestedFields(new Set([
                'project_name',
                'use_case_category',
                'business_objective',
                'target_audience',
                'ai_role',
                'tone_voice',
                'business_context',
                'primary_task',
                'success_criteria'
            ]))

            setWorkflowStep('edit')

        } catch (err: any) {
            console.error('Error:', err)
            setError(err.message || 'Failed to analyze prompt. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleFieldChange = (fieldName: string, value: any) => {
        setExtractedFields({ ...extractedFields, [fieldName]: value })
        // Remove from AI-suggested when user edits
        const newSuggested = new Set(aiSuggestedFields)
        newSuggested.delete(fieldName)
        setAiSuggestedFields(newSuggested)
    }

    const handleGeneratePrompt = () => {
        // Compile all fields into a structured prompt
        const prompt = `# AI Role
${extractedFields.ai_role}

# Tone & Voice
${extractedFields.tone_voice}

# Business Context
${extractedFields.business_context}

# Primary Task
${extractedFields.primary_task}

# Success Criteria
${extractedFields.success_criteria}

# Input Format
${extractedFields.input_format}

# Output Format
${extractedFields.output_format}

# Output Length
${extractedFields.output_length}

# Target Audience
${extractedFields.target_audience}

# Business Objective
${extractedFields.business_objective}`

        setGeneratedPrompt(prompt)
        setWorkflowStep('preview')
    }

    const handleSendToLLM = async () => {
        setLoading(true)
        setError(null)

        try {
            const keysStr = localStorage.getItem('llm_api_keys')
            if (!keysStr) {
                setError('Please configure your API keys in Settings first')
                setLoading(false)
                return
            }

            const keys = JSON.parse(keysStr)
            const apiKey = selectedModel === 'claude' ? keys.claude : keys.gemini

            if (!apiKey) {
                setError(`Please add your ${selectedModel === 'claude' ? 'Claude' : 'Google Gemini'} API key in Settings`)
                setLoading(false)
                return
            }

            // Initialize conversation with system prompt
            const initialMessage: ConversationMessage = {
                role: 'user',
                content: `Here is a system prompt that defines your role and task. Please acknowledge that you understand the instructions and are ready to help:\n\n${generatedPrompt}`
            }

            // Call API to execute prompt with LLM
            const response = await fetch('/api/execute-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: generatedPrompt,
                    apiKey,
                    provider: selectedModel
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to execute prompt')
            }

            const data = await response.json()

            const assistantMessage: ConversationMessage = {
                role: 'assistant',
                content: data.output
            }

            setConversationHistory([initialMessage, assistantMessage])
            setWorkflowStep('output')

        } catch (err: any) {
            console.error('Error:', err)
            setError(err.message || 'Failed to execute prompt. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleContinueConversation = async () => {
        if (!followUpMessage.trim()) return

        setLoading(true)
        setError(null)

        try {
            const keysStr = localStorage.getItem('llm_api_keys')
            if (!keysStr) {
                setError('Please configure your API keys in Settings first')
                setLoading(false)
                return
            }

            const keys = JSON.parse(keysStr)
            const apiKey = selectedModel === 'claude' ? keys.claude : keys.gemini

            if (!apiKey) {
                setError(`Please add your ${selectedModel === 'claude' ? 'Claude' : 'Google Gemini'} API key in Settings`)
                setLoading(false)
                return
            }

            // Add user message to history
            const userMessage: ConversationMessage = {
                role: 'user',
                content: followUpMessage
            }

            const updatedHistory = [...conversationHistory, userMessage]

            // Call API with conversation history
            const response = await fetch('/api/continue-conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversationHistory: updatedHistory,
                    apiKey,
                    provider: selectedModel
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to continue conversation')
            }

            const data = await response.json()

            const assistantMessage: ConversationMessage = {
                role: 'assistant',
                content: data.output
            }

            setConversationHistory([...updatedHistory, assistantMessage])
            setFollowUpMessage('')

        } catch (err: any) {
            console.error('Error:', err)
            setError(err.message || 'Failed to continue conversation. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!extractedFields || !user) return

        setLoading(true)
        try {
            // Create project
            const { data: project, error: projectError } = await supabase
                .from('prompt_projects')
                .insert({
                    project_name: extractedFields.project_name,
                    use_case_category: extractedFields.use_case_category,
                    business_objective: extractedFields.business_objective,
                    target_audience: extractedFields.target_audience,
                    status: 'Draft',
                    owner: user.id
                })
                .select()
                .single()

            if (projectError) throw projectError

            // Create component
            const { error: componentError } = await supabase
                .from('prompt_components')
                .insert({
                    project_id: project.project_id,
                    version_number: 1,
                    ai_role: extractedFields.ai_role,
                    tone_voice: extractedFields.tone_voice,
                    business_context: extractedFields.business_context,
                    primary_task: extractedFields.primary_task,
                    success_criteria: extractedFields.success_criteria,
                    input_format: extractedFields.input_format,
                    output_format: extractedFields.output_format,
                    output_length: extractedFields.output_length
                })

            if (componentError) throw componentError

            // Redirect to library
            router.push('/library')

        } catch (err: any) {
            setError(err.message || 'Failed to save prompt')
        } finally {
            setLoading(false)
        }
    }

    const handleCopyOutput = () => {
        const fullConversation = conversationHistory
            .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
            .join('\n\n')
        navigator.clipboard.writeText(fullConversation)
        alert('Conversation copied to clipboard!')
    }

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(generatedPrompt)
        alert('Prompt copied to clipboard!')
    }

    if (!user) {
        return <div className={styles.loading}>Loading...</div>
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.logo}>AI Prompt Pro</h1>
                    <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                        ← Dashboard
                    </Button>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.content}>
                    <h2 className={styles.title}>⚡ Quick Mode Prompt Builder</h2>
                    <p className={styles.subtitle}>
                        Describe your prompt in natural language. AI will help structure it professionally.
                    </p>

                    {/* Workflow Progress Indicator */}
                    <div className={styles.progressSteps}>
                        <div className={`${styles.step} ${workflowStep === 'input' ? styles.stepActive : styles.stepComplete}`}>
                            <div className={styles.stepNumber}>1</div>
                            <div className={styles.stepLabel}>Describe</div>
                        </div>
                        <div className={styles.stepLine}></div>
                        <div className={`${styles.step} ${workflowStep === 'edit' ? styles.stepActive : workflowStep === 'input' ? '' : styles.stepComplete}`}>
                            <div className={styles.stepNumber}>2</div>
                            <div className={styles.stepLabel}>Edit Fields</div>
                        </div>
                        <div className={styles.stepLine}></div>
                        <div className={`${styles.step} ${workflowStep === 'preview' ? styles.stepActive : workflowStep === 'input' || workflowStep === 'edit' ? '' : styles.stepComplete}`}>
                            <div className={styles.stepNumber}>3</div>
                            <div className={styles.stepLabel}>Preview Prompt</div>
                        </div>
                        <div className={styles.stepLine}></div>
                        <div className={`${styles.step} ${workflowStep === 'output' ? styles.stepActive : ''}`}>
                            <div className={styles.stepNumber}>4</div>
                            <div className={styles.stepLabel}>View Output</div>
                        </div>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    {/* Step 1: Input Description */}
                    {workflowStep === 'input' && (
                        <div className={styles.inputSection}>
                            <div className={styles.modelSelector}>
                                <label className={styles.modelLabel}>
                                    Choose AI Model:
                                </label>
                                <div className={styles.modelButtons}>
                                    <button
                                        onClick={() => setSelectedModel('claude')}
                                        className={`${styles.modelButton} ${selectedModel === 'claude' ? styles.modelButtonActive : ''}`}
                                    >
                                        🤖 Claude 3.5 Sonnet
                                    </button>
                                    <button
                                        onClick={() => setSelectedModel('gemini')}
                                        className={`${styles.modelButton} ${selectedModel === 'gemini' ? styles.modelButtonActive : ''}`}
                                    >
                                        🔷 Google Gemini Pro
                                    </button>
                                </div>
                            </div>

                            <label className={styles.label}>
                                Describe the prompt you want to create:
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Example: I need a customer support chatbot for my SaaS company that helps users troubleshoot API integration issues in a friendly but technical tone..."
                                className={styles.textarea}
                                rows={8}
                            />

                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleAnalyze}
                                loading={loading}
                                fullWidth
                            >
                                {loading ? `Analyzing with ${selectedModel === 'claude' ? 'Claude' : 'Gemini'}...` : `🔍 Analyze with ${selectedModel === 'claude' ? 'Claude' : 'Gemini'}`}
                            </Button>

                            <div className={styles.hint}>
                                <strong>Tip:</strong> Include details about your use case, target audience, tone, and what you want the AI to do.
                            </div>
                        </div>
                    )}

                    {/* Step 2: Edit Fields */}
                    {workflowStep === 'edit' && (
                        <div className={styles.resultsSection}>
                            <div className={styles.successBox}>
                                ✅ Successfully extracted prompt structure!
                                <span className={styles.aiIndicatorLegend}>
                                    <span className={styles.aiSuggestedBadge}>✨ AI Suggested</span> fields can be edited
                                </span>
                            </div>

                            <div className={styles.fieldsGrid}>
                                <div className={styles.field}>
                                    <label>
                                        Project Name
                                        {aiSuggestedFields.has('project_name') && <span className={styles.aiSuggestedBadge}>✨ AI Suggested</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={extractedFields.project_name}
                                        onChange={(e) => handleFieldChange('project_name', e.target.value)}
                                        className={`${styles.input} ${aiSuggestedFields.has('project_name') ? styles.aiSuggested : ''}`}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>
                                        Use Case Category
                                        {aiSuggestedFields.has('use_case_category') && <span className={styles.aiSuggestedBadge}>✨ AI Suggested</span>}
                                    </label>
                                    <select
                                        value={extractedFields.use_case_category}
                                        onChange={(e) => handleFieldChange('use_case_category', e.target.value)}
                                        className={`${styles.input} ${aiSuggestedFields.has('use_case_category') ? styles.aiSuggested : ''}`}
                                    >
                                        <option value="Customer Support">Customer Support</option>
                                        <option value="Content Generation">Content Generation</option>
                                        <option value="Data Analysis">Data Analysis</option>
                                        <option value="Lead Qualification">Lead Qualification</option>
                                        <option value="Email Automation">Email Automation</option>
                                        <option value="Sales Enablement">Sales Enablement</option>
                                        <option value="Process Automation">Process Automation</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className={styles.field}>
                                    <label>
                                        Business Objective
                                        {aiSuggestedFields.has('business_objective') && <span className={styles.aiSuggestedBadge}>✨ AI Suggested</span>}
                                    </label>
                                    <textarea
                                        value={extractedFields.business_objective}
                                        onChange={(e) => handleFieldChange('business_objective', e.target.value)}
                                        className={`${styles.textarea} ${aiSuggestedFields.has('business_objective') ? styles.aiSuggested : ''}`}
                                        rows={2}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>
                                        Target Audience
                                        {aiSuggestedFields.has('target_audience') && <span className={styles.aiSuggestedBadge}>✨ AI Suggested</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={extractedFields.target_audience}
                                        onChange={(e) => handleFieldChange('target_audience', e.target.value)}
                                        className={`${styles.input} ${aiSuggestedFields.has('target_audience') ? styles.aiSuggested : ''}`}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>
                                        AI Role
                                        {aiSuggestedFields.has('ai_role') && <span className={styles.aiSuggestedBadge}>✨ AI Suggested</span>}
                                    </label>
                                    <textarea
                                        value={extractedFields.ai_role}
                                        onChange={(e) => handleFieldChange('ai_role', e.target.value)}
                                        className={`${styles.textarea} ${aiSuggestedFields.has('ai_role') ? styles.aiSuggested : ''}`}
                                        rows={2}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>
                                        Tone/Voice
                                        {aiSuggestedFields.has('tone_voice') && <span className={styles.aiSuggestedBadge}>✨ AI Suggested</span>}
                                    </label>
                                    <select
                                        value={extractedFields.tone_voice}
                                        onChange={(e) => handleFieldChange('tone_voice', e.target.value)}
                                        className={`${styles.input} ${aiSuggestedFields.has('tone_voice') ? styles.aiSuggested : ''}`}
                                    >
                                        <option value="Professional">Professional</option>
                                        <option value="Friendly">Friendly</option>
                                        <option value="Technical">Technical</option>
                                        <option value="Casual">Casual</option>
                                        <option value="Formal">Formal</option>
                                        <option value="Empathetic">Empathetic</option>
                                        <option value="Direct">Direct</option>
                                    </select>
                                </div>

                                <div className={styles.fieldFull}>
                                    <label>
                                        Business Context
                                        {aiSuggestedFields.has('business_context') && <span className={styles.aiSuggestedBadge}>✨ AI Suggested</span>}
                                    </label>
                                    <textarea
                                        value={extractedFields.business_context}
                                        onChange={(e) => handleFieldChange('business_context', e.target.value)}
                                        className={`${styles.textarea} ${aiSuggestedFields.has('business_context') ? styles.aiSuggested : ''}`}
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.fieldFull}>
                                    <label>
                                        Primary Task
                                        {aiSuggestedFields.has('primary_task') && <span className={styles.aiSuggestedBadge}>✨ AI Suggested</span>}
                                    </label>
                                    <textarea
                                        value={extractedFields.primary_task}
                                        onChange={(e) => handleFieldChange('primary_task', e.target.value)}
                                        className={`${styles.textarea} ${aiSuggestedFields.has('primary_task') ? styles.aiSuggested : ''}`}
                                        rows={2}
                                    />
                                </div>

                                <div className={styles.fieldFull}>
                                    <label>
                                        Success Criteria
                                        {aiSuggestedFields.has('success_criteria') && <span className={styles.aiSuggestedBadge}>✨ AI Suggested</span>}
                                    </label>
                                    <textarea
                                        value={extractedFields.success_criteria}
                                        onChange={(e) => handleFieldChange('success_criteria', e.target.value)}
                                        className={`${styles.textarea} ${aiSuggestedFields.has('success_criteria') ? styles.aiSuggested : ''}`}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <Button
                                    variant="secondary"
                                    onClick={() => setWorkflowStep('input')}
                                >
                                    ← Back to Description
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleGeneratePrompt}
                                >
                                    📄 Generate Prompt Preview →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview Prompt */}
                    {workflowStep === 'preview' && (
                        <div className={styles.previewSection}>
                            <div className={styles.previewHeader}>
                                <h3>📄 Generated Prompt Preview</h3>
                                <Button
                                    variant="secondary"
                                    onClick={handleCopyPrompt}
                                >
                                    📋 Copy Prompt
                                </Button>
                            </div>

                            <div className={styles.promptPreview}>
                                <pre className={styles.promptText}>{generatedPrompt}</pre>
                            </div>

                            <div className={styles.actions}>
                                <Button
                                    variant="secondary"
                                    onClick={() => setWorkflowStep('edit')}
                                >
                                    ← Back to Edit Fields
                                </Button>
                                <div className={styles.actionGroup}>
                                    <Button
                                        variant="primary"
                                        onClick={handleSave}
                                        loading={loading}
                                    >
                                        💾 Save to Library
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={handleSendToLLM}
                                        loading={loading}
                                    >
                                        {loading ? 'Sending...' : '🚀 Send to LLM →'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: View Output & Continue Conversation */}
                    {workflowStep === 'output' && (
                        <div className={styles.outputSection}>
                            <div className={styles.outputHeader}>
                                <h3>💬 Conversation</h3>
                                <Button
                                    variant="secondary"
                                    onClick={handleCopyOutput}
                                >
                                    📋 Copy Conversation
                                </Button>
                            </div>

                            <div className={styles.conversationContainer}>
                                {conversationHistory.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.message} ${
                                            message.role === 'user' ? styles.userMessage : styles.assistantMessage
                                        }`}
                                    >
                                        <div className={styles.messageHeader}>
                                            <strong>{message.role === 'user' ? '👤 You' : '🤖 Assistant'}</strong>
                                        </div>
                                        <div className={styles.messageContent}>
                                            {message.content}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Continue Conversation Input */}
                            <div className={styles.continueSection}>
                                <h4>Continue the conversation:</h4>
                                <textarea
                                    value={followUpMessage}
                                    onChange={(e) => setFollowUpMessage(e.target.value)}
                                    placeholder="Type your follow-up message..."
                                    className={styles.textarea}
                                    rows={4}
                                    disabled={loading}
                                />
                                <Button
                                    variant="primary"
                                    onClick={handleContinueConversation}
                                    loading={loading}
                                    disabled={!followUpMessage.trim() || loading}
                                >
                                    {loading ? 'Sending...' : '📤 Send Message'}
                                </Button>
                            </div>

                            <div className={styles.actions}>
                                <Button
                                    variant="secondary"
                                    onClick={() => setWorkflowStep('preview')}
                                >
                                    ← Back to Preview
                                </Button>
                                <div className={styles.actionGroup}>
                                    <Button
                                        variant="primary"
                                        onClick={handleSave}
                                        loading={loading}
                                    >
                                        💾 Save to Library
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setWorkflowStep('input')
                                            setExtractedFields(null)
                                            setGeneratedPrompt('')
                                            setConversationHistory([])
                                            setFollowUpMessage('')
                                            setDescription('')
                                        }}
                                    >
                                        🔄 Start New Prompt
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
