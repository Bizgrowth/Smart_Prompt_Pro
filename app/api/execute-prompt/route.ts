import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { prompt, apiKey, provider } = await request.json()

        if (!prompt || !apiKey || !provider) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        let output = ''

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
                    max_tokens: 4096,
                    messages: [
                        {
                            role: 'user',
                            content: `Here is a system prompt that defines your role and task. Please acknowledge that you understand the instructions and are ready to help:\n\n${prompt}`
                        }
                    ]
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
            // Call Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Here is a system prompt that defines your role and task. Please acknowledge that you understand the instructions and are ready to help:\n\n${prompt}`
                                }
                            ]
                        }
                    ],
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
        console.error('Execute Prompt Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
