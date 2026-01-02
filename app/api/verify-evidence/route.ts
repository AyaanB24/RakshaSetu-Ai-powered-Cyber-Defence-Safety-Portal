import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { verifySignature } from "@/lib/crypto-utils"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// RSA Public Key from Env
const PUBLIC_KEY = process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY?.replace(/\\n/g, '\n').trim() || ""

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate User
        const authHeader = request.headers.get("Authorization")
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const token = authHeader.replace("Bearer ", "")
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            console.error("[VERIFY]: Auth error", authError?.message)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        console.log("[VERIFY REQUEST]: Authenticated as", user.email)

        // Security Check: Only CERT Admin can verify
        if (user.email !== "cert.admin@gov.in") {
            console.warn("[FORBIDDEN]: User", user.email, "tried to access admin verification")
            return NextResponse.json({ error: "Forbidden: CERT Admin access required" }, { status: 403 });
        }

        // 2. Fetch Evidence Metadata
        const body = await request.json()
        const evidenceId = body.evidenceId
        const ipfsCid = body.ipfsCid?.trim()

        console.log("[VERIFY]: Querying for", evidenceId ? `ID: ${evidenceId}` : `CID: ${ipfsCid}`)

        let query = supabase.from("evidence").select("*")
        if (evidenceId) {
            query = query.eq("id", evidenceId)
        } else if (ipfsCid) {
            query = query.eq("ipfs_cid", ipfsCid)
        } else {
            return NextResponse.json({ error: "Missing evidence identification" }, { status: 400 })
        }

        const { data: evidence, error: dbError } = await query.maybeSingle()

        if (dbError) {
            console.error("[VERIFY DB ERROR]:", dbError.message);
            return NextResponse.json({ error: "Database query failed", details: dbError.message }, { status: 500 })
        }

        if (!evidence) {
            console.warn("[VERIFY]: Record not found in DB for CID:", ipfsCid);
            return NextResponse.json({
                error: "Evidence record not found",
                details: `Could not find database record for ${evidenceId ? `ID: ${evidenceId}` : `CID: ${ipfsCid}`}. Please ensure this case was submitted successfully.`
            }, { status: 404 })
        }

        console.log("[VERIFY]: Stored Hash:", evidence.sha256_hash)

        // Check if hash exists in DB
        if (!evidence.sha256_hash) {
            console.warn("[VERIFY]: Missing stored hash for evidence", evidence.id)
            return NextResponse.json({
                verified: false,
                reason: "Legacy Evidence",
                details: "This evidence was uploaded before cryptographic tracking was enabled. It cannot be verified."
            })
        }

        // 3. Download File from IPFS
        const ipfsUrl = `https://ipfs.filebase.io/ipfs/${evidence.ipfs_cid}`
        const response = await fetch(ipfsUrl)
        if (!response.ok) {
            throw new Error(`Failed to fetch file from IPFS: ${response.statusText}`)
        }
        const buffer = Buffer.from(await response.arrayBuffer())

        // 4. Recompute Hash
        const computedHash = crypto.createHash("sha256").update(buffer).digest("hex")
        console.log("[VERIFY]: Computed Hash:", computedHash)
        console.log("[VERIFY]: File Buffer Size:", buffer.length)

        // 5. Compare Hashes
        if (computedHash !== evidence.sha256_hash) {
            return NextResponse.json({
                verified: false,
                reason: "Hash Mismatch",
                details: "The content of the file has been altered or corrupted since upload."
            })
        }

        // 6. Verify RSA Signature
        const isValid = verifySignature(computedHash, evidence.rsa_signature, PUBLIC_KEY);

        if (!isValid) {
            return NextResponse.json({
                verified: false,
                reason: "Invalid Signature",
                details: "The cryptographic signature does not match the system public key. The producer of this evidence could not be verified."
            })
        }

        return NextResponse.json({
            verified: true,
            reason: "Integrity Verified",
            details: "Evidence integrity and authenticity verified via RSA-256."
        })

    } catch (error: any) {
        console.error("[VERIFY ERROR]:", error)
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
    }
}
