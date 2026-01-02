import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { createClient } from "@supabase/supabase-js"
import { generateHash, signHash } from "@/lib/crypto-utils"

/**
 * RakshaSetu IPFS Upload API with Cryptographic Signing
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const s3 = new S3Client({
    endpoint: "https://s3.filebase.com",
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.FILEBASE_KEY || "",
        secretAccessKey: process.env.FILEBASE_SECRET || "",
    },
})

// RSA Private Key from Env
const PRIVATE_KEY = process.env.RSA_PRIVATE_KEY?.replace(/\\n/g, '\n').trim() || ""
console.log("[UPLOAD CONFIG]: RSA Private Key Loaded:", !!PRIVATE_KEY)

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("Authorization")
        if (!authHeader) return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 })

        const token = authHeader.replace("Bearer ", "")
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const caseId = formData.get("case_id") as string | null

        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

        // 1. Read Buffer & Cryptographic Processing
        const buffer = Buffer.from(await file.arrayBuffer())

        // a) Generate SHA-256 Hash
        const hash = generateHash(buffer)

        // b) Sign Hash using RSA Private Key
        let signature = ""
        if (PRIVATE_KEY) {
            signature = signHash(hash, PRIVATE_KEY)
        } else {
            console.warn("RSA_PRIVATE_KEY not configured. Skipping signature.")
        }

        // 2. Upload to Filebase/IPFS
        const bucketName = process.env.FILEBASE_BUCKET
        if (!bucketName) throw new Error("FILEBASE_BUCKET not configured")

        const fileKey = `${Date.now()}-${file.name}`
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
            Body: buffer,
            ContentType: file.type,
        })

        const s3Response = await s3.send(command)
        let cid = (s3Response as any).$metadata?.headers?.["x-amz-meta-cid"]

        // Quick fallback for CID: try HeadObject if PutObject response header is missing
        if (!cid) {
            console.log("CID missing from PutObject response, trying HeadObject fallback for key:", fileKey)
            try {
                const head = await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: fileKey }))
                cid = head.Metadata?.cid || (head.$metadata as any)?.headers?.["x-amz-meta-cid"]
            } catch (e: any) {
                console.error("HeadObject fallback failed:", e.message)
            }
        }

        if (!cid) throw new Error("Failed to retrieve IPFS CID from Filebase")

        // 3. Store Metadata in Supabase
        if (caseId && caseId !== "temp-id") {
            const { error: dbError } = await supabase
                .from("evidence")
                .insert({
                    case_id: caseId,
                    ipfs_cid: cid,
                    sha256_hash: hash,
                    rsa_signature: signature,
                    file_type: file.type,
                })

            if (dbError) console.error("DB Error:", dbError.message)
        }

        return NextResponse.json({
            success: true,
            cid: cid,
            hash: hash,
            signature: signature,
            ipfs_url: `https://ipfs.filebase.io/ipfs/${cid}`
        })

    } catch (error: any) {
        console.error("[UPLOAD ERROR]:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
