import crypto from 'crypto';

/**
 * RakshaSetu Cryptographic Utilities
 * 
 * Uses SHA-256 for integrity (ensures file hasn't changed)
 * Uses RSA-256 for authenticity (ensures signature came from CERT)
 */

/**
 * Generates a SHA-256 hash of a file buffer
 */
export function generateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer as any).digest('hex');
}

/**
 * Signs a hash using the RSA private key
 * Returns a Base64 encoded signature
 */
export function signHash(hash: string, privateKey: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(hash);
    sign.end();
    return sign.sign(privateKey, 'base64');
}

/**
 * Verifies a signature using the RSA public key
 * Returns true if valid, false otherwise
 */
export function verifySignature(hash: string, signature: string, publicKey: string): boolean {
    try {
        const verify = crypto.createVerify('SHA256');
        verify.update(hash);
        verify.end();
        return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
        console.error('Verification error:', error);
        return false;
    }
}
