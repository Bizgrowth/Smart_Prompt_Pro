// Auto-generated database types
// This is a placeholder - will be generated from your actual Supabase project
export type Database = {
    public: {
        Tables: {
            prompt_projects: {
                Row: {
                    project_id: string
                    project_name: string
                    use_case_category: string
                    business_objective: string
                    target_audience: string
                    created_date: string
                    last_modified: string
                    status: string
                    owner: string
                }
                Insert: {
                    project_id?: string
                    project_name: string
                    use_case_category: string
                    business_objective: string
                    target_audience: string
                    created_date?: string
                    last_modified?: string
                    status?: string
                    owner: string
                }
                Update: {
                    project_id?: string
                    project_name?: string
                    use_case_category?: string
                    business_objective?: string
                    target_audience?: string
                    created_date?: string
                    last_modified?: string
                    status?: string
                    owner?: string
                }
            }
            // Add other tables as needed
        }
    }
}
