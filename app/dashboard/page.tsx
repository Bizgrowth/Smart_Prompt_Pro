'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { useAuth, ProtectedRoute } from '@/lib/contexts/AuthContext'
import TutorialModal from '@/components/tutorial/TutorialModal'
import styles from './dashboard.module.css'

export default function DashboardPage() {
    const router = useRouter()
    const { user, signOut } = useAuth()
    const [showTutorial, setShowTutorial] = useState(false)

    useEffect(() => {
        // Check if user has completed tutorial
        const tutorialCompleted = localStorage.getItem('ai-prompt-pro-tutorial-completed')
        if (!tutorialCompleted && user) {
            // Show tutorial after a brief delay for better UX
            const timer = setTimeout(() => {
                setShowTutorial(true)
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [user])

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    const handleOpenTutorial = () => {
        setShowTutorial(true)
    }

    return (
        <ProtectedRoute>
            <div className={styles.container}>
                {/* Tutorial Modal */}
                <TutorialModal
                    isOpen={showTutorial}
                    onClose={() => setShowTutorial(false)}
                />

                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <div>
                            <h1 className={styles.logo}>AI Prompt Pro</h1>
                            <p className={styles.userEmail}>{user?.email}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Button variant="secondary" onClick={handleOpenTutorial}>
                                Help
                            </Button>
                            <Button variant="secondary" onClick={handleSignOut}>
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className={styles.main}>
                    <div className={styles.welcomeSection}>
                        <h2 className={styles.welcomeTitle}>Welcome to Your Dashboard</h2>
                        <p className={styles.welcomeText}>
                            Get started by creating your first prompt project or exploring templates.
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className={styles.quickActions}>
                        <Link href="/builder/quick" className={styles.actionCard}>
                            <div className={styles.actionIcon}>⚡</div>
                            <h3>Quick Mode</h3>
                            <p>Create a prompt using natural language</p>
                        </Link>

                        <Link href="/builder/advanced" className={styles.actionCard}>
                            <div className={styles.actionIcon}>🎯</div>
                            <h3>Advanced Builder</h3>
                            <p>Full structured prompt engineering form</p>
                        </Link>

                        <Link href="/templates" className={styles.actionCard}>
                            <div className={styles.actionIcon}>📚</div>
                            <h3>Templates</h3>
                            <p>Browse pre-built prompt templates</p>
                        </Link>

                        <Link href="/library" className={styles.actionCard}>
                            <div className={styles.actionIcon}>💾</div>
                            <h3>My Library</h3>
                            <p>View saved prompts and projects</p>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>0</div>
                            <div className={styles.statLabel}>Total Projects</div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statValue}>0</div>
                            <div className={styles.statLabel}>Saved Prompts</div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statValue}>0</div>
                            <div className={styles.statLabel}>Executions</div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statValue}>-</div>
                            <div className={styles.statLabel}>Avg. Success Rate</div>
                        </div>
                    </div>

                    {/* Getting Started Guide */}
                    <div className={styles.guideSection}>
                        <h3>Getting Started</h3>
                        <div className={styles.stepsContainer}>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>1</div>
                                <div>
                                    <h4>Set Up Your API Keys</h4>
                                    <p>Add API keys for Claude, ChatGPT, or Gemini to execute prompts</p>
                                    <Link href="/settings/api-keys" className={styles.stepLink}>
                                        Configure API Keys →
                                    </Link>
                                </div>
                            </div>

                            <div className={styles.step}>
                                <div className={styles.stepNumber}>2</div>
                                <div>
                                    <h4>Create Your First Project</h4>
                                    <p>Use Quick Mode for natural language or Advanced Builder for detailed control</p>
                                    <Link href="/builder/quick" className={styles.stepLink}>
                                        Start Building →
                                    </Link>
                                </div>
                            </div>

                            <div className={styles.step}>
                                <div className={styles.stepNumber}>3</div>
                                <div>
                                    <h4>Execute & Track Performance</h4>
                                    <p>Run your prompts against different LLMs and monitor their effectiveness</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    )
}
