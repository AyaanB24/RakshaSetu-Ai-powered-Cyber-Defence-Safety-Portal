"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, FileText, Clock, CheckCircle2, AlertTriangle, LogOut, Eye, TrendingUp, Download, CheckCircle, XCircle, ExternalLink, Lock } from "lucide-react"
import type { User, Case, CaseStatus } from "@/lib/store"
import { store } from "@/lib/store"
import { useCases } from "@/hooks/use-cases"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { generateCasePdf } from "@/lib/generate-pdf"

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [selectedTab, setSelectedTab] = useState("new")
  const [verifying, setVerifying] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] = useState<{ [key: string]: { verified: boolean, reason: string } }>({})
  const [showSecurityWarning, setShowSecurityWarning] = useState(false)
  const [pendingEvidenceCid, setPendingEvidenceCid] = useState<string | null>(null)

  const handleEvidenceClick = (cid: string) => {
    if (verificationResult[cid]?.verified) {
      handleViewEvidence(cid)
    } else {
      setPendingEvidenceCid(cid)
      setShowSecurityWarning(true)
    }
  }

  // Admin access to cases
  const { cases, updateCaseStatus, loading } = useCases(user?.id, true)

  useEffect(() => {
    const checkUser = async () => {
      // 1. Check Supabase session first (Truth Source)
      const { data: { session } } = await supabase.auth.getSession()

      if (session && session.user.email === "cert.admin@gov.in") {
        setUser({
          id: session.user.id,
          name: "CERT Admin",
          email: session.user.email,
          role: "admin",
        })
        return
      }

      // 2. If no valid admin session, check store for fallback (but warn if mismatch)
      const storeUser = store.getUser()
      if (storeUser && storeUser.role === "admin" && storeUser.email === "cert.admin@gov.in") {
        // Double check if session exists
        if (!session) {
          router.push("/login")
          return
        }
        setUser(storeUser)
        return
      }

      // 3. Unauthorized access
      toast({ title: "Access Denied", description: "CERT Admin session required.", variant: "destructive" })
      router.push("/login")
    }
    checkUser()
  }, [router, toast])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    store.setUser(null)
    router.push("/")
  }

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    try {
      await updateCaseStatus(caseId, newStatus)
      toast({ title: "Status updated", description: `Case ${caseId} marked as ${newStatus}` })
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Unauthorized or database error.",
        variant: "destructive"
      })
    }
  }

  const handleVerify = async (cid: string) => {
    setVerifying(cid)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch("/api/verify-evidence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ ipfsCid: cid })
      })
      const result = await response.json()
      setVerificationResult(prev => ({ ...prev, [cid]: { verified: result.verified, reason: result.reason || result.error } }))

      if (result.verified) {
        toast({ title: "Verification Success", description: "Evidence integrity confirmed." })
      } else {
        toast({ title: "Verification Failed", description: result.details || result.reason || "Tampering detected!", variant: "destructive" })
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Verification service unavailable.", variant: "destructive" })
    } finally {
      setVerifying(null)
    }
  }

  const handleViewEvidence = async (cid: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/admin/view-evidence?cid=${cid}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`
        }
      })

      const result = await response.json()

      if (response.ok && result.url) {
        window.open(result.url, "_blank")
      } else {
        toast({
          title: "Access Denied",
          description: result.error || "You do not have permission to view this evidence.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Evidence service unavailable.", variant: "destructive" })
    }
  }

  if (!user) return <div className="p-8 text-center">Loading admin session...</div>

  // Filter cases logic - normalize status for comparison
  const newCases = cases.filter((c) => c.status?.toUpperCase() === "SUBMITTED")
  const underReviewCases = cases.filter((c) => c.status?.toUpperCase() === "UNDER_REVIEW" || c.status === "Under Review")
  const resolvedCases = cases.filter((c) => c.status?.toUpperCase() === "RESOLVED" || c.status?.toUpperCase() === "ACTION_TAKEN" || c.status === "Resolved")

  const CaseCard = ({ caseItem }: { caseItem: Case }) => (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50">
          <div className="mb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground truncate max-w-[150px]">{caseItem.id}</span>
                <Badge
                  variant="outline"
                  className={
                    caseItem.severity === "High"
                      ? "border-destructive/50 text-destructive"
                      : caseItem.severity === "Medium"
                        ? "border-secondary/50 text-secondary"
                        : "border-primary/50 text-primary"
                  }
                >
                  {caseItem.attackType}
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">{caseItem.userName}</span>
                <Badge variant="outline" className="text-xs">
                  {caseItem.userRole}
                </Badge>
              </div>
            </div>
            <Eye className="h-4 w-4 text-muted-foreground self-end sm:self-start" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">{new Date(caseItem.submittedAt).toLocaleString()}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Confidence:</span>
              <span className="text-xs font-medium text-foreground">{caseItem.confidence}%</span>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="w-[98vw] !max-w-[98vw] h-[95vh] p-0 flex flex-col bg-zinc-950 border-zinc-800 text-zinc-100 overflow-hidden translate-y-[-50%]">
        <DialogHeader className="p-8 border-b border-zinc-800 bg-zinc-900/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight">Case Details - Admin View</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Comprehensive evidence overview and forensic verification for Case ID: {caseItem.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 md:grid-cols-12 md:divide-x md:divide-zinc-800">
            {/* LEFT COLUMN: INFORMATION & NARRATIVE (65%) */}
            <div className="md:col-span-8 p-10 overflow-y-auto custom-scrollbar space-y-10">
              {/* PRIMARY INFO GRID */}
              <div className="grid grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 shadow-sm">
                  <p className="text-xs font-semibold text-zinc-500 mb-3">Case ID</p>
                  <p className="font-mono text-sm text-zinc-200 break-all">{caseItem.id}</p>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 shadow-sm">
                  <p className="text-xs font-semibold text-zinc-500 mb-3">Reported By</p>
                  <p className="text-base font-bold text-white">{caseItem.userName}</p>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 shadow-sm">
                  <p className="text-xs font-semibold text-zinc-500 mb-3">Role</p>
                  <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700 text-zinc-400 uppercase text-[10px] px-3">
                    {caseItem.userRole}
                  </Badge>
                </div>
              </div>

              {/* AI CLASSIFICATION SUMMARY */}
              <section className="space-y-5">
                <h3 className="text-sm font-semibold text-zinc-200">AI Classification Summary</h3>
                <div className="grid grid-cols-3 gap-8">
                  <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm">
                    <p className="text-xs font-semibold text-zinc-500 mb-2">Attack Type</p>
                    <p className="text-base font-medium text-zinc-200 italic">{caseItem.attackType}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm">
                    <p className="text-xs font-semibold text-zinc-500 mb-2">Severity</p>
                    <Badge className={`${caseItem.severity === 'High' ? 'bg-red-500/10 text-red-500 border-none' : 'bg-green-500/10 text-green-500 border-none'} uppercase text-[10px] px-3`}>
                      {caseItem.severity}
                    </Badge>
                  </div>
                  <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm">
                    <p className="text-xs font-semibold text-zinc-500 mb-2">Confidence</p>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-white font-mono">{caseItem.confidence}%</span>
                      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                        <div className="h-full bg-blue-500" style={{ width: `${caseItem.confidence}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* INCIDENT DESCRIPTION */}
              <section className="space-y-5">
                <h3 className="text-sm font-semibold text-zinc-200">Incident Description</h3>
                <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm relative group overflow-hidden">
                  <p className="relative z-10 text-zinc-300 text-lg leading-relaxed font-medium whitespace-pre-wrap selection:bg-blue-500 selection:text-white">
                    {caseItem.description}
                  </p>
                </div>
              </section>

              {/* TECHNICAL LOCALE */}
              <div className="grid grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm">
                  <p className="text-xs font-semibold text-zinc-500 mb-3">Affected System</p>
                  <p className="text-sm font-mono text-zinc-300 uppercase tracking-widest">{caseItem.affectedSystem || "whatsapp"}</p>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm">
                  <p className="text-xs font-semibold text-zinc-500 mb-3">Location</p>
                  <p className="text-sm font-mono text-zinc-300 uppercase tracking-widest">{caseItem.location || "Delhi"}</p>
                </div>
              </div>

              {/* MITIGATION STEPS */}
              {caseItem.mitigationSteps && caseItem.mitigationSteps.length > 0 && (
                <section className="space-y-5">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 border-l-2 border-primary pl-4 italic">REMEDIATION_PROTOCOL</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {caseItem.mitigationSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-6 p-7 rounded-[2rem] bg-zinc-900 border border-zinc-800 group hover:border-primary/30 transition-all cursor-default">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-sm font-black shrink-0 border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-zinc-400 font-bold leading-relaxed uppercase tracking-tight group-hover:text-zinc-100">{step}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN: EVIDENCE & ACTIONS (35%) */}
            <div className="md:col-span-4 p-10 overflow-y-auto custom-scrollbar bg-zinc-950/50 flex flex-col h-full">
              <div className="flex flex-col h-full gap-8">
                {/* STATUS BADGE */}
                <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</span>
                  <Badge className="bg-blue-500/10 text-blue-500 border-none uppercase px-4 py-1 font-bold">
                    {caseItem.status?.toUpperCase() || "SUBMITTED"}
                  </Badge>
                </div>

                {/* EVIDENCE SECTION */}
                <section className="space-y-6">
                  <h3 className="text-sm font-semibold text-zinc-200">Evidence Files (Cryptographic Verification)</h3>

                  <div className="space-y-6">
                    {caseItem.evidence.length > 0 ? (
                      caseItem.evidence.map((file, index) => (
                        <div key={index} className="p-7 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 space-y-6 group transition-all relative overflow-hidden">
                          <div className="flex items-center gap-6">
                            <div className="h-10 w-10 flex items-center justify-center text-zinc-500">
                              <FileText className="h-8 w-8" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-zinc-200 truncate" title={file}>{file}</p>
                              <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tight">
                                {verificationResult[file]?.verified ? "Integrity Verified" : "Locked: Verify Integrity"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-12 text-xs font-semibold rounded-2xl border-zinc-800 hover:bg-zinc-800 transition-all ${verificationResult[file]?.verified ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-zinc-400'}`}
                              onClick={() => verificationResult[file]?.verified ? handleEvidenceClick(file) : handleVerify(file)}
                              disabled={verifying === file}
                            >
                              {verifying === file ? "Verifying..." : verificationResult[file]?.verified ? "View Evidence" : "Verify Integrity"}
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-16 rounded-[2.5rem] border-2 border-dashed border-zinc-800/30 text-center bg-zinc-900/10">
                        <p className="text-xs font-semibold text-zinc-600 uppercase italic">No Evidence Collected</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* ADMIN ACTIONS */}
                <section className="space-y-6 mt-auto">
                  <h3 className="text-sm font-semibold text-zinc-200">Admin Actions</h3>
                  <div className="flex flex-col gap-4">
                    {(caseItem.status?.toUpperCase() === "SUBMITTED") && (
                      <Button onClick={() => handleStatusChange(caseItem.id, "UNDER_REVIEW")} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transition-all text-sm">
                        Mark as Under Review
                      </Button>
                    )}
                    {(caseItem.status?.toUpperCase() === "UNDER_REVIEW" || caseItem.status === "Under Review") && (
                      <Button onClick={() => handleStatusChange(caseItem.id, "ACTION_TAKEN")} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all text-sm">
                        Finalize Case
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => generateCasePdf(caseItem)}
                      className="w-full h-14 border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold rounded-2xl flex items-center justify-center gap-2"
                    >
                      <Download className="h-5 w-5" /> Download Report
                    </Button>
                  </div>
                </section>

                <p className="text-[10px] text-zinc-500 text-center italic mt-4">
                  All actions are logged for accountability and traceability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Admin Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2 md:gap-3">
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <div>
                <span className="text-sm md:text-lg font-bold tracking-tight text-foreground">
                  RakshaSetu CERT Admin
                </span>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Cyber Emergency Response Team</p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-foreground">{user.name}</div>
                <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                  Administrator
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Dashboard Overview */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">CERT Dashboard</h1>
              <p className="mt-1 text-sm md:text-base text-muted-foreground">
                Real-time incident monitoring and case management
              </p>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
              <Card className="border-border">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{cases.length}</div>
                    <div className="text-sm text-muted-foreground">Total Cases</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{newCases.length}</div>
                    <div className="text-sm text-muted-foreground">New Cases</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{underReviewCases.length}</div>
                    <div className="text-sm text-muted-foreground">Under Review</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{resolvedCases.length}</div>
                    <div className="text-sm text-muted-foreground">Resolved</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cases Tabs */}
            <Card className="border-border">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Case Management</CardTitle>
                <CardDescription className="text-xs md:text-sm">Review and manage reported incidents</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="new" className="relative text-xs sm:text-sm">
                      New Cases
                      {newCases.length > 0 && (
                        <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1 text-xs">
                          {newCases.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="review" className="relative text-xs sm:text-sm">
                      Under Review
                      {underReviewCases.length > 0 && (
                        <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1 text-xs">
                          {underReviewCases.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="resolved" className="text-xs sm:text-sm">Resolved</TabsTrigger>
                  </TabsList>

                  <TabsContent value="new" className="mt-6 space-y-3">
                    {newCases.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="mb-3 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-sm font-medium text-muted-foreground">No new cases</p>
                      </div>
                    ) : (
                      newCases.map((caseItem) => <CaseCard key={caseItem.id} caseItem={caseItem} />)
                    )}
                  </TabsContent>

                  <TabsContent value="review" className="mt-6 space-y-3">
                    {underReviewCases.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Clock className="mb-3 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-sm font-medium text-muted-foreground">No cases under review</p>
                      </div>
                    ) : (
                      underReviewCases.map((caseItem) => <CaseCard key={caseItem.id} caseItem={caseItem} />)
                    )}
                  </TabsContent>

                  <TabsContent value="resolved" className="mt-6 space-y-3">
                    {resolvedCases.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle2 className="mb-3 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-sm font-medium text-muted-foreground">No resolved cases</p>
                      </div>
                    ) : (
                      resolvedCases.map((caseItem) => <CaseCard key={caseItem.id} caseItem={caseItem} />)
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Audit Log Notice */}
            <Alert className="border-primary/50 bg-primary/5">
              <Shield className="h-4 w-4 text-primary" />
              <AlertDescription>
                All administrative actions are logged for accountability and traceability. Case updates are reflected in
                user views in real-time.
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </div>

      <Dialog open={showSecurityWarning} onOpenChange={setShowSecurityWarning}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <AlertTriangle className="h-6 w-6" />
              <DialogTitle className="text-amber-500">Security Protocol</DialogTitle>
            </div>
            <DialogDescription className="font-medium text-foreground">
              Access to evidence is restricted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            <p>You are attempting to access a secured evidence file. To maintain the Chain of Custody:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Verify the file integrity signature first.</li>
              <li>Confirm no tampering has occurred.</li>
            </ul>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowSecurityWarning(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowSecurityWarning(false)
                if (pendingEvidenceCid) handleVerify(pendingEvidenceCid)
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Verify Integrity Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
