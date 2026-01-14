import { NextRequest, NextResponse } from 'next/server'

type ConversationMessage = {
    role: 'user' | 'assistant' | 'system'
    content: string
}

export async function POST(request: NextRequest) {
    try {
        const { conversationHistory, apiKey, provider } = await request.json()

        if (!conversationHistory || !apiKey || !provider) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        let output = ''

        if (provider === 'claude') {
            // Convert conversation history to Claude format
            const messages = conversationHistory.map((msg: ConversationMessage) => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            }))

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
                    max_tokens: 4096,
                    messages: messages
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('Claude API Error:', errorData)
                throw new Error(errorData.error?.message || 'Claude API request failed')
            }

            const data = await response.json()
            output = data.content[0].text

        } else if (provider === 'gemini') {
            // Convert conversation history to Gemini format
            const contents = conversationHistory.map((msg: ConversationMessage) => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }))

            // Call Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        maxOutputTokens: 4096,
                        temperature: 0.7
                    }
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('Gemini API Error:', errorData)
                throw new Error(errorData.error?.message || 'Gemini API request failed')
            }

            const data = await response.json()
            output = data.candidates[0].content.parts[0].text

        } else {
            return NextResponse.json(
                { error: 'Invalid provider' },
                { status: 400 }
            )
        }

        return NextResponse.json({ output })

    } catch (error: any) {
        console.error('Continue Conversation Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
