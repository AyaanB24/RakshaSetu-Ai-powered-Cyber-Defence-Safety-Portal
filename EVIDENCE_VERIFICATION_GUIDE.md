# RakshaSetu: Cryptographic Evidence Verification Setup

This document outlines the steps to enable tamper-proof evidence verification in RakshaSetu.

## 1. Database Schema
Run the following SQL in your Supabase SQL Editor to update the `evidence` table:

```sql
-- Update evidence table with cryptographic fields
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS sha256_hash TEXT;
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS rsa_signature TEXT;
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Ensure RLS allows admin to read all evidence and users to read their own
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read all evidence" ON evidence
FOR SELECT TO authenticated
USING (auth.jwt() ->> 'email' = 'cert.admin@gov.in');

CREATE POLICY "Users can read own evidence" ON evidence
FOR SELECT TO authenticated
USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()));
```

## 2. RSA Key Generation
Generate your 2048-bit RSA key pair using the provided script or OpenSSL:

```bash
# Using OpenSSL
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

## 3. Environment Variables
Add the following to your `.env.local`:

```
# RSA Cryptography (use \n for newlines if setting via dashboard, or wrap in quotes)
RSA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
NEXT_PUBLIC_RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

---

## 4. Explanation for Judges (Pitch points)

### **How it works:**
1. **IPFS Immutability**: Files uploaded to IPFS are addressed by their content (CID). If even a single bit changes, the CID changes. This provides **Data Immutability**.
2. **SHA-256 Integrity**: Before uploading to IPFS, we compute a SHA-256 hash of the raw file. This hash is a unique "fingerprint". If the file is tampered with, the hash will never match. This ensures **Forensic Integrity**.
3. **RSA Digital Signatures**: The CERT system signs the file's hash using its Private Key. Anyone with the Public Key can verify that the signature is valid. This provides **Authenticity** (comes from CERT) and **Non-Repudiation** (CERT cannot deny they signed it).

### **The "Tamper-Proof" Guarantee:**
- If an attacker gains access to IPFS and replaces a file, the **CID won't match** the one stored in our secure database.
- If an attacker gains access to our database and changes the CID, the **RSA signature** (which was generated on the original hash) will fail verification.
- To successfully tamper with a report, an attacker would need both the IPFS gateway access AND the CERT's Private Key.

**RakshaSetu transforms a simple "upload" into a "forensically verifiable chain of custody."**
