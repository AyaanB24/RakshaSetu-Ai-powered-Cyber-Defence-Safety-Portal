import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Secure Admin Evidence Gateway
 * GET /api/admin/view-evidence?cid=<ipfs_cid>
 */
export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate User
        const authHeader = request.headers.get("Authorization")
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const token = authHeader.replace("Bearer ", "")
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Role Check: Strictly CERT Admin
        // In a real-world scenario, we'd check a 'role' claim or a table. 
        // For this hackathon, we use the verified admin email.
        if (user.email !== "cert.admin@gov.in") {
            return NextResponse.json({ error: "Forbidden: CERT Admin access required" }, { status: 403 })
        }

        // 3. Extract CID
        const { searchParams } = new URL(request.url)
        const cid = searchParams.get("cid")

        if (!cid) {
            return NextResponse.json({ error: "Missing CID parameter" }, { status: 400 })
        }

        // 4. Construct Secure Gateway URL
        // We use a public gateway but we don't expose it until the backend validates the session.
        // Filebase/IPFS content is public if you have the CID, but this API acts as a 
        // gated gateway for the Admin UI.
        const gatewayUrl = `https://ipfs.filebase.io/ipfs/${cid}`

        // 5. Option A: Redirect to the gateway
        // Option B: Stream (More secure but heavier)
        // For hackathon speed/UX, we'll return the URL for the frontend to open in a new tab.
        return NextResponse.json({ url: gatewayUrl })

    } catch (error: any) {
        console.error("[VIEW EVIDENCE ERROR]:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
