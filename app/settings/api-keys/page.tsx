'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import styles from './settings.module.css'

interface APIKeys {
    claude: string
    openai: string
    gemini: string
}

export default function ApiKeysPage() {
    const [user, setUser] = useState<any>(null)
    const [keys, setKeys] = useState<APIKeys>({
        claude: '',
        openai: '',
        gemini: ''
    })
    const [showKeys, setShowKeys] = useState({
        claude: false,
        openai: false,
        gemini: false
    })
    const [saved, setSaved] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            console.log('Checking user authentication...')
            try {
                const { data: { user }, error } = await supabase.auth.getUser()
                console.log('Auth response:', { user, error })

                if (!user) {
                    console.log('No user found, redirecting to login...')
                    router.push('/auth/login')
                    return
                }

                console.log('User authenticated:', user.email)
                setUser(user)

                // Load keys from localStorage
                const storedKeys = localStorage.getItem('llm_api_keys')
                console.log('Stored keys:', storedKeys)
                if (storedKeys) {
                    try {
                        setKeys(JSON.parse(storedKeys))
                    } catch (e) {
                        console.error('Failed to load API keys', e)
                    }
                }
            } catch (err) {
                console.error('Error in checkUser:', err)
            }
        }

        checkUser()
    }, [router, supabase.auth])

    const handleSave = () => {
        console.log('Save button clicked!')
        console.log('Keys to save:', keys)
        try {
            // Save to localStorage (encrypted in production)
            localStorage.setItem('llm_api_keys', JSON.stringify(keys))
            console.log('Successfully saved to localStorage')

            // Show success message
            setSaved(true)
            console.log('Success message should now be visible!')

            // Hide success message after 3 seconds
            setTimeout(() => {
                setSaved(false)
                console.log('Success message hidden')
            }, 3000)
        } catch (error) {
            console.error('Error saving to localStorage:', error)
            alert('Error saving API keys: ' + error)
        }
    }

    const handleClear = (provider: keyof APIKeys) => {
        setKeys(prev => ({ ...prev, [provider]: '' }))
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
                        ← Back to Dashboard
                    </Button>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.content}>
                    <h2 className={styles.title}>API Keys Configuration</h2>
                    <p className={styles.subtitle}>
                        Store your LLM API keys securely. Keys are stored in your browser only and never sent to our servers.
                    </p>

                    {saved && (
                        <div className={styles.successMessage}>
                            ✅ API keys saved successfully!
                        </div>
                    )}

                    <div className={styles.keysContainer}>
                        {/* Claude API Key */}
                        <div className={styles.keyCard}>
                            <div className={styles.keyHeader}>
                                <div>
                                    <h3>🤖 Claude (Anthropic)</h3>
                                    <p className={styles.keyDescription}>
                                        For Claude-3 models (Opus, Sonnet, Haiku)
                                    </p>
                                </div>
                                <a
                                    href="https://console.anthropic.com/settings/keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.getKeyLink}
                                >
                                    Get API Key →
                                </a>
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type={showKeys.claude ? 'text' : 'password'}
                                    value={keys.claude}
                                    onChange={(e) => setKeys(prev => ({ ...prev, claude: e.target.value }))}
                                    placeholder="sk-ant-api03-..."
                                    className={styles.input}
                                />
                                <button
                                    onClick={() => setShowKeys(prev => ({ ...prev, claude: !prev.claude }))}
                                    className={styles.toggleButton}
                                >
                                    {showKeys.claude ? '👁️' : '👁️‍🗨️'}
                                </button>
                                {keys.claude && (
                                    <button
                                        onClick={() => handleClear('claude')}
                                        className={styles.clearButton}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Google Gemini API Key */}
                        <div className={styles.keyCard}>
                            <div className={styles.keyHeader}>
                                <div>
                                    <h3>🔷 Google Gemini</h3>
                                    <p className={styles.keyDescription}>
                                        For Gemini Pro and Gemini Pro Vision
                                    </p>
                                </div>
                                <a
                                    href="https://makersuite.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.getKeyLink}
                                >
                                    Get API Key →
                                </a>
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type={showKeys.gemini ? 'text' : 'password'}
                                    value={keys.gemini}
                                    onChange={(e) => setKeys(prev => ({ ...prev, gemini: e.target.value }))}
                                    placeholder="AIza..."
                                    className={styles.input}
                                />
                                <button
                                    onClick={() => setShowKeys(prev => ({ ...prev, gemini: !prev.gemini }))}
                                    className={styles.toggleButton}
                                >
                                    {showKeys.gemini ? '👁️' : '👁️‍🗨️'}
                                </button>
                                {keys.gemini && (
                                    <button
                                        onClick={() => handleClear('gemini')}
                                        className={styles.clearButton}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* OpenAI API Key */}
                        <div className={styles.keyCard}>
                            <div className={styles.keyHeader}>
                                <div>
                                    <h3>⚡ OpenAI (ChatGPT)</h3>
                                    <p className={styles.keyDescription}>
                                        For GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
                                    </p>
                                </div>
                                <a
                                    href="https://platform.openai.com/api-keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.getKeyLink}
                                >
                                    Get API Key →
                                </a>
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type={showKeys.openai ? 'text' : 'password'}
                                    value={keys.openai}
                                    onChange={(e) => setKeys(prev => ({ ...prev, openai: e.target.value }))}
                                    placeholder="sk-..."
                                    className={styles.input}
                                />
                                <button
                                    onClick={() => setShowKeys(prev => ({ ...prev, openai: !prev.openai }))}
                                    className={styles.toggleButton}
                                >
                                    {showKeys.openai ? '👁️' : '👁️‍🗨️'}
                                </button>
                                {keys.openai && (
                                    <button
                                        onClick={() => handleClear('openai')}
                                        className={styles.clearButton}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleSave}
                            fullWidth
                        >
                            💾 Save API Keys
                        </Button>
                    </div>

                    <div className={styles.infoBox}>
                        <h4>🔒 Security Information</h4>
                        <ul>
                            <li>API keys are stored in your browser's localStorage only</li>
                            <li>Keys are never sent to our servers</li>
                            <li>You can clear keys at any time</li>
                            <li>Keep your API keys private - never share them</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    )
}
