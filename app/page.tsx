import Link from 'next/link'
import styles from './page.module.css'

export default function HomePage() {
    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <header className={styles.hero}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h1 className={styles.title}>
                            AI Prompt Pro
                        </h1>
                        <p className={styles.subtitle}>
                            Professional Prompt Engineering Platform
                        </p>
                        <p className={styles.description}>
                            Create, manage, and optimize high-quality prompts for Claude, ChatGPT, and Gemini.
                            Store your work, track performance, and never lose your best prompts again.
                        </p>

                        <div className={styles.ctaButtons}>
                            <Link href="/auth/signup" className={styles.primaryButton}>
                                Get Started Free
                            </Link>
                            <Link href="/auth/login" className={styles.secondaryButton}>
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className={styles.features}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Powerful Features</h2>

                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🎯</div>
                            <h3>Multi-LLM Support</h3>
                            <p>
                                Work with Claude, ChatGPT, and Gemini from a single platform.
                                Test and compare responses across different models.
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>⚡</div>
                            <h3>Quick & Advanced Modes</h3>
                            <p>
                                Use natural language for quick prompts, or dive deep with our
                                comprehensive structured form following industry best practices.
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>📚</div>
                            <h3>Prompt Library</h3>
                            <p>
                                Store all your prompts in the cloud. Access from any device,
                                search, filter, and organize your prompt engineering work.
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>📊</div>
                            <h3>Performance Tracking</h3>
                            <p>
                                Monitor success rates, usage patterns, and effectiveness.
                                Iterate and improve based on real data.
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🎨</div>
                            <h3>Template System</h3>
                            <p>
                                Start from pre-built templates for common use cases or
                                create your own reusable templates.
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>📱</div>
                            <h3>Mobile Responsive</h3>
                            <p>
                                Work on any device. Fully responsive design optimized
                                for desktop, tablet, and mobile.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className={styles.useCases}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Built for Business</h2>
                    <p className={styles.useCasesIntro}>
                        Perfect for managing prompts across your business engagements
                    </p>

                    <div className={styles.useCaseList}>
                        <div className={styles.useCaseItem}>Customer Support Automation</div>
                        <div className={styles.useCaseItem}>Content Generation</div>
                        <div className={styles.useCaseItem}>Data Analysis</div>
                        <div className={styles.useCaseItem}>Lead Qualification</div>
                        <div className={styles.useCaseItem}>Email Automation</div>
                        <div className={styles.useCaseItem}>Sales Enablement</div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="container">
                    <p>© 2026 AI Prompt Pro. Professional Prompt Engineering Platform.</p>
                </div>
            </footer>
        </div>
    )
}
