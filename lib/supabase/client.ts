import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createClient() {
    // Hardcoded for now - will be replaced with env vars
    const supabaseUrl = 'https://rtfehrkoxpdepjmtpbco.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0ZmVocmtveHBkZXBqbXRwYmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODM0MTQsImV4cCI6MjA4Mzg1OTQxNH0.BdyjI1QLMpYKEuJX0a61UTFEOWrAygR32cq7eJHjbE4'

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
