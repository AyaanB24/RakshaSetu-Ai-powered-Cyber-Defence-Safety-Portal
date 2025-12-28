"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { store, type Case, type CaseStatus } from "@/lib/store"
import { RealtimeChannel } from "@supabase/supabase-js"

export function useCases(userId?: string, isAdmin: boolean = false) {
    const [cases, setCases] = useState<Case[]>([])
    const [loading, setLoading] = useState(true)

    const fetchCases = useCallback(async () => {
        // If admin, we fetch all. If not admin, we need userId.
        if (!isAdmin && !userId) {
            setCases([])
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            let query = supabase
                .from("cases")
                .select(`
          *,
          analysis_results (*),
          evidence (*)
        `)
                .order("created_at", { ascending: false })

            // Only filter by user if NOT admin
            if (!isAdmin && userId) {
                query = query.eq("profile_id", userId)
            }

            const { data: casesData, error: casesError } = await query

            if (casesError) {
                throw casesError
            }

            const formattedCases: Case[] = casesData.map((c: any) => ({
                id: c.id,
                userId: c.profile_id,
                // For admin view, having 'Unknown' is okay if profile join isn't perfect, 
                // but typically we'd join profiles. For now, sticking to current schema limits.
                userName: c.profile_id === userId ? "You" : "User",
                userRole: "serving", // Placeholder as 'role' is in profiles, not joined here effectively yet without join

                attackType: c.analysis_results?.[0]?.ai_threat_type || "Unknown",
                severity: (c.analysis_results?.[0]?.risk_score && c.analysis_results[0].risk_score > 70) ? "High" : (c.analysis_results?.[0]?.risk_score > 40 ? "Medium" : "Low"),
                confidence: c.analysis_results?.[0]?.risk_score || 0,
                description: c.description,
                evidence: c.evidence?.map((e: any) => e.ipfs_cid) || [],
                status: c.status,
                submittedAt: new Date(c.created_at),
                updatedAt: new Date(c.updated_at),
                affectedSystem: undefined,
                location: undefined,
                mitigationSteps: c.analysis_results?.[0]?.mitigation_steps || []
            }))

            setCases(formattedCases)

        } catch (error) {
            console.error("Error fetching cases:", error)
        } finally {
            setLoading(false)
        }
    }, [userId, isAdmin])

    useEffect(() => {
        fetchCases()
    }, [fetchCases])

    // Real-time subscription
    useEffect(() => {
        // If admin, listen to ALL cases. If user, only theirs.
        // However, RLS might block 'all'. We'll assume policy allows or we just listen to public w/ filter.
        const filter = isAdmin ? undefined : (userId ? `profile_id=eq.${userId}` : undefined)

        if (!isAdmin && !userId) return

        const channel = supabase
            .channel('cases-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'cases',
                    filter: filter
                },
                (payload) => {
                    console.log('Real-time update:', payload)
                    fetchCases()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, isAdmin, fetchCases])

    const createCase = async (caseData: Omit<Case, "id" | "submittedAt" | "updatedAt">) => {
        if (!userId) throw new Error("User not found")

        try {
            // 1. Insert Case
            const { data: newCase, error: caseError } = await supabase
                .from("cases")
                .insert({
                    profile_id: userId,
                    type: 'REPORT', // Default
                    status: caseData.status.toUpperCase().replace(' ', '_'), // enum conversion
                    title: caseData.attackType, // Using attack type as title for now
                    description: caseData.description,
                })
                .select()
                .single()

            if (caseError) throw caseError

            // 2. Insert Analysis Results
            const { error: analysisError } = await supabase
                .from("analysis_results")
                .insert({
                    case_id: newCase.id,
                    ai_threat_type: caseData.attackType,
                    risk_score: caseData.confidence, // Using confidence as proxy for risk score
                    summary: caseData.description,
                    mitigation_steps: caseData.mitigationSteps
                })

            if (analysisError) throw analysisError

            // 3. Insert Evidence
            if (caseData.evidence && caseData.evidence.length > 0) {
                const evidenceInserts = caseData.evidence.map(file => ({
                    case_id: newCase.id,
                    ipfs_cid: file, // Storing filename as CID for now
                    file_type: 'unknown'
                }))

                const { error: evidenceError } = await supabase
                    .from("evidence")
                    .insert(evidenceInserts)

                if (evidenceError) throw evidenceError
            }

            await fetchCases() // Refresh list

            // Construct full object to return to UI
            const fullCase: Case = {
                id: newCase.id,
                userId: userId,
                userName: caseData.userName || "Unknown",
                userRole: caseData.userRole || "serving",
                attackType: caseData.attackType,
                severity: caseData.severity,
                confidence: caseData.confidence,
                description: caseData.description,
                evidence: caseData.evidence,
                status: newCase.status,
                submittedAt: new Date(newCase.created_at),
                updatedAt: new Date(newCase.updated_at),
                mitigationSteps: caseData.mitigationSteps,
                affectedSystem: caseData.affectedSystem,
                location: caseData.location
            }

            return fullCase

        } catch (error) {
            console.error("Error creating case:", error)
            throw error
        }
    }

    const updateCaseStatus = async (caseId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("cases")
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq("id", caseId)

            if (error) throw error
            await fetchCases()
        } catch (error) {
            console.error("Error updating case status:", error)
            throw error
        }
    }

    return {
        cases,
        loading,
        createCase,
        updateCaseStatus,
        refreshCases: fetchCases
    }
}
