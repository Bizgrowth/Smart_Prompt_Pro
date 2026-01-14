'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { encryptApiKeys, decryptApiKeys } from '@/lib/utils/encryption'
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
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saved, setSaved] = useState(false)
    const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'error'>('local')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const loadUserAndKeys = async () => {
            setLoading(true)
            try {
                const { data: { user }, error } = await supabase.auth.getUser()

                if (!user) {
                    router.push('/auth/login')
                    return
                }

                setUser(user)

                // Try to load from Supabase first (cloud sync)
                const { data: settings, error: settingsError } = await (supabase
                    .from('user_settings') as any)
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (settings && !settingsError) {
                    // Decrypt keys from database
                    const decryptedKeys = await decryptApiKeys({
                        claude_encrypted: settings.claude_api_key_encrypted,
                        gemini_encrypted: settings.gemini_api_key_encrypted,
                        openai_encrypted: settings.openai_api_key_encrypted
                    }, user.id)

                    setKeys(decryptedKeys)
                    setSyncStatus('synced')

                    // Also update localStorage for offline access
                    localStorage.setItem('llm_api_keys', JSON.stringify(decryptedKeys))
                } else {
                    // Fallback to localStorage
                    const storedKeys = localStorage.getItem('llm_api_keys')
                    if (storedKeys) {
                        try {
                            setKeys(JSON.parse(storedKeys))
                            setSyncStatus('local')
                        } catch (e) {
                            console.error('Failed to parse stored keys', e)
                        }
                    }
                }
            } catch (err) {
                console.error('Error loading user/keys:', err)
                setSyncStatus('error')
            } finally {
                setLoading(false)
            }
        }

        loadUserAndKeys()
    }, [router, supabase])

    const handleSave = async () => {
        if (!user) return

        setSaving(true)
        try {
            // Encrypt keys
            const encryptedKeys = await encryptApiKeys(keys, user.id)

            // Save to Supabase (upsert)
            const { error } = await (supabase
                .from('user_settings') as any)
                .upsert({
                    user_id: user.id,
                    claude_api_key_encrypted: encryptedKeys.claude_encrypted,
                    gemini_api_key_encrypted: encryptedKeys.gemini_encrypted,
                    openai_api_key_encrypted: encryptedKeys.openai_encrypted,
                    last_modified: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                })

            if (error) {
                console.error('Error saving to Supabase:', error)
                // Fallback to localStorage only
                localStorage.setItem('llm_api_keys', JSON.stringify(keys))
                setSyncStatus('local')
            } else {
                // Also save to localStorage for offline access
                localStorage.setItem('llm_api_keys', JSON.stringify(keys))
                setSyncStatus('synced')
            }

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)

        } catch (error) {
            console.error('Error saving API keys:', error)
            // Fallback to localStorage
            localStorage.setItem('llm_api_keys', JSON.stringify(keys))
            setSyncStatus('local')
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } finally {
            setSaving(false)
        }
    }

    const handleClear = (provider: keyof APIKeys) => {
        setKeys(prev => ({ ...prev, [provider]: '' }))
    }

    if (loading) {
        return <div className={styles.loading}>Loading...</div>
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
                        Store your LLM API keys securely. Keys are encrypted and synced across your devices.
                    </p>

                    {/* Sync Status Indicator */}
                    <div className={`${styles.syncStatus} ${styles[syncStatus]}`}>
                        {syncStatus === 'synced' && '☁️ Synced to cloud - available on all your devices'}
                        {syncStatus === 'local' && '💾 Stored locally - save to sync to cloud'}
                        {syncStatus === 'error' && '⚠️ Sync error - keys stored locally'}
                    </div>

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
                            loading={saving}
                            fullWidth
                        >
                            {saving ? 'Saving...' : '💾 Save & Sync API Keys'}
                        </Button>
                    </div>

                    <div className={styles.infoBox}>
                        <h4>🔒 Security Information</h4>
                        <ul>
                            <li>API keys are encrypted before being stored in the cloud</li>
                            <li>Encryption uses your unique user ID as the key</li>
                            <li>Keys sync automatically across all your devices</li>
                            <li>Local backup stored in browser for offline access</li>
                            <li>Keep your API keys private - never share them</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    )
}
