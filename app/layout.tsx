import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/AuthContext'

export const metadata: Metadata = {
    title: 'AI Prompt Pro - Professional Prompt Engineering Platform',
    description: 'Create, manage, and optimize AI prompts for Claude, ChatGPT, and Gemini. Store your prompts, track performance, and improve your AI interactions.',
    keywords: ['AI', 'prompts', 'prompt engineering', 'Claude', 'ChatGPT', 'Gemini', 'LLM'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
