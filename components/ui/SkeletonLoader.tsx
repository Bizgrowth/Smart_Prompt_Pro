import styles from './SkeletonLoader.module.css'

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'dashboard'
  count?: number
}

export default function SkeletonLoader({ variant = 'text', count = 1 }: SkeletonLoaderProps) {
  if (variant === 'dashboard') {
    return (
      <div className={styles.dashboardSkeleton}>
        <div className={styles.header}>
          <div className={styles.skeletonBox} style={{ width: '200px', height: '40px' }} />
          <div className={styles.skeletonBox} style={{ width: '100px', height: '36px' }} />
        </div>

        <div className={styles.welcome}>
          <div className={styles.skeletonBox} style={{ width: '300px', height: '32px' }} />
          <div className={styles.skeletonBox} style={{ width: '400px', height: '20px', marginTop: '8px' }} />
        </div>

        <div className={styles.quickActions}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.actionCardSkeleton}>
              <div className={styles.skeletonCircle} />
              <div className={styles.skeletonBox} style={{ width: '150px', height: '24px' }} />
              <div className={styles.skeletonBox} style={{ width: '100%', height: '16px', marginTop: '8px' }} />
            </div>
          ))}
        </div>

        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.statCardSkeleton}>
              <div className={styles.skeletonBox} style={{ width: '60px', height: '40px' }} />
              <div className={styles.skeletonBox} style={{ width: '120px', height: '16px', marginTop: '8px' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={styles.cardSkeletonContainer}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={styles.cardSkeleton}>
            <div className={styles.cardHeader}>
              <div className={styles.skeletonBox} style={{ width: '60%', height: '24px' }} />
              <div className={styles.skeletonBox} style={{ width: '80px', height: '24px' }} />
            </div>
            <div className={styles.skeletonBox} style={{ width: '100%', height: '16px', marginTop: '12px' }} />
            <div className={styles.skeletonBox} style={{ width: '80%', height: '16px', marginTop: '8px' }} />
            <div className={styles.cardFooter}>
              <div className={styles.skeletonBox} style={{ width: '100px', height: '16px' }} />
              <div className={styles.skeletonBox} style={{ width: '100px', height: '16px' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.textSkeletonContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonBox} style={{ width: '100%', height: '20px' }} />
      ))}
    </div>
  )
}
