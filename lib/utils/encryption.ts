/**
 * Simple encryption/decryption for API keys
 * Uses the Web Crypto API with AES-GCM encryption
 * Keys are encrypted with a user-specific key derived from their user ID
 */

// Generate a consistent encryption key from user ID
async function deriveKey(userId: string): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(userId + '_ai_prompt_pro_secret'),
        'PBKDF2',
        false,
        ['deriveKey']
    )

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('ai_prompt_pro_salt'),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    )
}

/**
 * Encrypt an API key
 * @param plaintext - The API key to encrypt
 * @param userId - The user's ID (used to derive encryption key)
 * @returns Base64 encoded encrypted string (IV + ciphertext)
 */
export async function encryptApiKey(plaintext: string, userId: string): Promise<string> {
    if (!plaintext) return ''

    try {
        const key = await deriveKey(userId)
        const encoder = new TextEncoder()
        const iv = crypto.getRandomValues(new Uint8Array(12))

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(plaintext)
        )

        // Combine IV and ciphertext
        const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length)
        combined.set(iv)
        combined.set(new Uint8Array(encrypted), iv.length)

        // Convert to base64
        return btoa(String.fromCharCode(...combined))
    } catch (error) {
        console.error('Encryption error:', error)
        return ''
    }
}

/**
 * Decrypt an API key
 * @param ciphertext - Base64 encoded encrypted string
 * @param userId - The user's ID (used to derive encryption key)
 * @returns The decrypted API key
 */
export async function decryptApiKey(ciphertext: string, userId: string): Promise<string> {
    if (!ciphertext) return ''

    try {
        const key = await deriveKey(userId)

        // Decode from base64
        const combined = new Uint8Array(
            atob(ciphertext).split('').map(c => c.charCodeAt(0))
        )

        // Extract IV and ciphertext
        const iv = combined.slice(0, 12)
        const encrypted = combined.slice(12)

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encrypted
        )

        return new TextDecoder().decode(decrypted)
    } catch (error) {
        console.error('Decryption error:', error)
        return ''
    }
}

/**
 * Encrypt all API keys
 */
export async function encryptApiKeys(
    keys: { claude?: string; gemini?: string; openai?: string },
    userId: string
): Promise<{ claude_encrypted: string; gemini_encrypted: string; openai_encrypted: string }> {
    const [claude_encrypted, gemini_encrypted, openai_encrypted] = await Promise.all([
        encryptApiKey(keys.claude || '', userId),
        encryptApiKey(keys.gemini || '', userId),
        encryptApiKey(keys.openai || '', userId)
    ])

    return { claude_encrypted, gemini_encrypted, openai_encrypted }
}

/**
 * Decrypt all API keys
 */
export async function decryptApiKeys(
    encrypted: { claude_encrypted?: string; gemini_encrypted?: string; openai_encrypted?: string },
    userId: string
): Promise<{ claude: string; gemini: string; openai: string }> {
    const [claude, gemini, openai] = await Promise.all([
        decryptApiKey(encrypted.claude_encrypted || '', userId),
        decryptApiKey(encrypted.gemini_encrypted || '', userId),
        decryptApiKey(encrypted.openai_encrypted || '', userId)
    ])

    return { claude, gemini, openai }
}
