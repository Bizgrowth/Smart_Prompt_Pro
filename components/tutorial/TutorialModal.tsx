'use client'

import { useState, useEffect } from 'react'
import styles from './TutorialModal.module.css'

interface TutorialStep {
  title: string
  description: string
  icon: string
  action?: {
    text: string
    href: string
  }
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to AI Prompt Pro!',
    description: 'Your professional platform for creating, managing, and optimizing AI prompts for Claude, ChatGPT, and Gemini. Let\'s get you started in just a few steps.',
    icon: '👋',
  },
  {
    title: 'Set Up Your API Keys',
    description: 'To execute prompts, you\'ll need to add API keys for your preferred AI models. You can add them now or skip this step and add them later in Settings.',
    icon: '🔑',
    action: {
      text: 'Configure API Keys',
      href: '/settings/api-keys',
    },
  },
  {
    title: 'Two Ways to Build Prompts',
    description: 'Quick Mode: Describe what you want in natural language, and AI will help structure it. Advanced Builder: Get full control with our comprehensive prompt engineering form.',
    icon: '⚡',
  },
  {
    title: 'Quick Mode Builder',
    description: 'Perfect for getting started fast. Just describe your prompt idea in plain English, and our AI will help you refine it into a professional prompt.',
    icon: '🚀',
    action: {
      text: 'Try Quick Mode',
      href: '/builder/quick',
    },
  },
  {
    title: 'Advanced Builder',
    description: 'For maximum control, use the Advanced Builder with structured fields for context, persona, examples, constraints, and more. Perfect for complex prompts.',
    icon: '🎯',
    action: {
      text: 'Open Advanced Builder',
      href: '/builder/advanced',
    },
  },
  {
    title: 'Save & Manage Your Library',
    description: 'All your prompts are automatically saved to your library. Version your prompts, track performance, and organize by category.',
    icon: '💾',
    action: {
      text: 'View Library',
      href: '/library',
    },
  },
  {
    title: 'You\'re All Set!',
    description: 'You\'re ready to create amazing AI prompts! Remember, you can always access this tutorial again from the Help menu in your dashboard.',
    icon: '🎉',
  },
]

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const handleFinish = () => {
    localStorage.setItem('ai-prompt-pro-tutorial-completed', 'true')
    onClose()
  }

  const handleAction = (href: string) => {
    localStorage.setItem('ai-prompt-pro-tutorial-completed', 'true')
    window.location.href = href
  }

  const step = TUTORIAL_STEPS[currentStep]
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1

  return (
    <div className={styles.overlay} onClick={handleSkip}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.icon}>{step.icon}</div>
          <h2 className={styles.title}>{step.title}</h2>
          <p className={styles.description}>{step.description}</p>

          {/* Step indicator */}
          <div className={styles.stepIndicator}>
            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
          </div>

          {/* Action button if available */}
          {step.action && (
            <button
              className={styles.actionButton}
              onClick={() => handleAction(step.action!.href)}
            >
              {step.action.text} →
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className={styles.navigation}>
          <button
            className={styles.skipButton}
            onClick={handleSkip}
          >
            Skip Tutorial
          </button>

          <div className={styles.navButtons}>
            {currentStep > 0 && (
              <button
                className={styles.previousButton}
                onClick={handlePrevious}
              >
                ← Previous
              </button>
            )}
            <button
              className={styles.nextButton}
              onClick={handleNext}
            >
              {isLastStep ? 'Get Started' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Dots indicator */}
        <div className={styles.dots}>
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={`${styles.dot} ${index === currentStep ? styles.activeDot : ''}`}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
