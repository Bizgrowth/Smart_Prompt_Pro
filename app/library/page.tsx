'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { ProjectWithMetadata, USE_CASE_CATEGORIES } from '@/lib/types/prompt'
import styles from './library.module.css'

export default function LibraryPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<ProjectWithMetadata[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithMetadata[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'created_date' | 'last_modified'>('last_modified')
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load projects
  useEffect(() => {
    async function loadProjects() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      const { data: projectsData } = await supabase
        .from('prompt_projects')
        .select(`
          *,
          prompt_components (
            component_id,
            version_number,
            created_date
          )
        `)
        .eq('owner', user.id)
        .order('last_modified', { ascending: false })

      if (projectsData) {
        setProjects(projectsData as any)
      }

      setLoading(false)
    }

    loadProjects()
  }, [])

  // Apply search and filters with memoization
  useEffect(() => {
    let result = [...projects]

    // Search filter (using debounced query)
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      result = result.filter(p =>
        p.project_name.toLowerCase().includes(query) ||
        p.business_objective.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.use_case_category === categoryFilter)
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a[sortBy]).getTime()
      const dateB = new Date(b[sortBy]).getTime()
      return dateB - dateA // Newest first
    })

    setFilteredProjects(result)
  }, [projects, debouncedSearchQuery, categoryFilter, sortBy])

  // Handle edit
  function handleEdit(project: ProjectWithMetadata) {
    // Get latest component version
    const latestComponent = project.prompt_components
      .sort((a, b) => b.version_number - a.version_number)[0]

    router.push(
      `/builder/advanced?projectId=${project.project_id}&componentId=${latestComponent.component_id}`
    )
  }

  // Handle delete
  function handleDelete(projectId: string) {
    setProjectToDelete(projectId)
    setDeleteModalOpen(true)
  }

  async function confirmDelete() {
    if (!projectToDelete) return

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('prompt_projects')
        .delete()
        .eq('project_id', projectToDelete)

      if (!error) {
        setProjects(projects.filter(p => p.project_id !== projectToDelete))
      }

      setDeleteModalOpen(false)
      setProjectToDelete(null)
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDeleting(false)
    }
  }

  function cancelDelete() {
    setDeleteModalOpen(false)
    setProjectToDelete(null)
  }

  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get status badge color
  function getStatusColor(status: string): string {
    switch (status) {
      case 'Active':
        return styles.statusActive
      case 'Draft':
        return styles.statusDraft
      case 'In Review':
        return styles.statusInReview
      case 'Archived':
        return styles.statusArchived
      default:
        return styles.statusDraft
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Prompt Library</h1>
          <button
            onClick={() => router.push('/builder/advanced')}
            className={styles.createButton}
          >
            + Create New Prompt
          </button>
        </div>

        {projects.length > 0 && (
          <div className={styles.controls}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterBar}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Categories</option>
                {USE_CASE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'created_date' | 'last_modified')}
                className={styles.filterSelect}
              >
                <option value="last_modified">Recently Modified</option>
                <option value="created_date">Recently Created</option>
              </select>
            </div>
          </div>
        )}

        {filteredProjects.length === 0 && projects.length > 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🔍</div>
            <h2>No results found</h2>
            <p>Try adjusting your search or filters</p>
          </div>
        )}

        {projects.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📝</div>
            <h2>No prompts yet</h2>
            <p>Create your first prompt in the Advanced Builder</p>
            <button
              onClick={() => router.push('/builder/advanced')}
              className={styles.emptyStateButton}
            >
              Get Started
            </button>
          </div>
        )}

        {filteredProjects.length > 0 && (
          <div className={styles.projectsGrid}>
            {filteredProjects.map(project => {
              const versionCount = project.prompt_components.length

              return (
                <div key={project.project_id} className={styles.projectCard}>
                  <div className={styles.projectCardHeader}>
                    <div>
                      <h3 className={styles.projectName}>{project.project_name}</h3>
                      <span className={styles.categoryBadge}>
                        {project.use_case_category}
                      </span>
                    </div>
                    <span className={`${styles.statusBadge} ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  <p className={styles.projectDescription}>
                    {project.business_objective}
                  </p>

                  <div className={styles.projectMeta}>
                    <span>Target: {project.target_audience}</span>
                  </div>

                  <div className={styles.projectMeta}>
                    <span>Created: {formatDate(project.created_date)}</span>
                    <span>Modified: {formatDate(project.last_modified)}</span>
                  </div>

                  <div className={styles.projectMeta}>
                    <span>{versionCount} {versionCount === 1 ? 'version' : 'versions'}</span>
                  </div>

                  <div className={styles.projectActions}>
                    <button
                      onClick={() => handleEdit(project)}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.project_id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className={styles.modal} onClick={cancelDelete}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2>Delete Project?</h2>
              <p>
                Are you sure you want to delete this project? This will also delete all
                associated versions. This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button
                  onClick={cancelDelete}
                  className={styles.cancelButton}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className={styles.confirmDeleteButton}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
