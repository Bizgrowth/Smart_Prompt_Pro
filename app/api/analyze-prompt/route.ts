import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    console.log('API Route Hit: /api/analyze-prompt')
    try {
        const { description, apiKey: userApiKey, provider = 'claude' } = await request.json()
        console.log('Request data:', { description: description?.substring(0, 50), provider })

        if (!description) {
            console.log('Error: No description provided')
            return NextResponse.json(
                { error: 'Description is required' },
                { status: 400 }
            )
        }

        // Use user's API key if provided, otherwise fall back to server env vars
        let apiKey = userApiKey
        if (!apiKey) {
            if (provider === 'claude') {
                apiKey = process.env.CLAUDE_API_KEY
            } else if (provider === 'gemini') {
                apiKey = process.env.GEMINI_API_KEY
            }
        }

        if (!apiKey) {
            console.log('Error: No API key available')
            return NextResponse.json(
                { error: `No API key available for ${provider}. Please configure in Settings or contact admin.` },
                { status: 400 }
            )
        }

        console.log('Calling AI provider:', provider)

        const promptTemplate = `You are a prompt engineering expert. A user wants to create an AI prompt with this description:

"${description}"

Extract and structure the following information from their description. If something is not mentioned, use reasonable defaults based on common use cases:

Return ONLY a JSON object (no markdown, no explanation) with these exact fields:
{
  "project_name": "Short descriptive name (5-50 chars)",
  "use_case_category": "One of: Customer Support, Content Generation, Data Analysis, Lead Qualification, Email Automation, Sales Enablement, Process Automation, Other",
  "business_objective": "What business problem this solves (20-200 chars)",
  "target_audience": "Who will use this (10-100 chars)",
  "ai_role": "The AI's expertise and persona (20-150 chars)",
  "tone_voice": "One of: Professional, Friendly, Technical, Casual, Formal, Empathetic, Direct",
  "business_context": "Background the AI needs (50-500 chars)",
  "primary_task": "Main task the AI will accomplish (30-200 chars)",
  "success_criteria": "How to measure success (20-200 chars)",
  "input_format": "One of: Text, Email, Chat Message, Form Fields, Other",
  "output_format": "One of: Plain Text, Markdown, JSON, Structured Template, Bullet Points",
  "output_length": "One of: Concise (1-2 sentences), Brief (1 paragraph), Standard (2-3 paragraphs), Detailed (4+ paragraphs)"
}`

        let responseText: string

        if (provider === 'claude') {
            // Call Claude API
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 2000,
                    messages: [{
                        role: 'user',
                        content: promptTemplate
                    }]
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('Claude API Error:', errorData)
                return NextResponse.json(
                    { error: errorData.error?.message || 'Failed to analyze prompt with Claude' },
                    { status: response.status }
                )
            }

            const data = await response.json()
            console.log('Claude API response received')
            responseText = data.content[0].text
        } else {
            // Call Gemini API (using Gemini 2.0 - newest model)
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: promptTemplate
                            }]
                        }]
                    })
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                return NextResponse.json(
                    { error: errorData.error?.message || 'Failed to analyze prompt with Gemini' },
                    { status: response.status }
                )
            }

            const data = await response.json()
            responseText = data.candidates[0].content.parts[0].text
        }

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json(
                { error: 'Failed to extract structured data from AI response' },
                { status: 500 }
            )
        }

        const fields = JSON.parse(jsonMatch[0])
        console.log('Successfully extracted fields, returning response')

        return NextResponse.json({ fields }, { status: 200 })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
