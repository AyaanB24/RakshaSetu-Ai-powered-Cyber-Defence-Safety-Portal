"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, FileText, Clock, CheckCircle2, AlertTriangle, LogOut, Eye, TrendingUp, Download } from "lucide-react"
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

  // Admin access to cases
  const { cases, updateCaseStatus, loading } = useCases(user?.id, true)

  useEffect(() => {
    const checkUser = async () => {
      // 1. Check store first (for mock login)
      const storeUser = store.getUser()
      if (storeUser && storeUser.role === "admin") {
        setUser(storeUser)
        return
      }

      // 2. Check Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser({
          id: session.user.id,
          name: session.user.email?.split("@")[0] || "Admin",
          email: session.user.email || "",
          role: "admin", // forcing role for UI
        })
        return
      }

      // 3. Fallback to login
      router.push("/login")
    }
    checkUser()
  }, [router])

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

      <DialogContent className="w-[95%] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Case Details - Admin View</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Case Overview */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <div className="mb-1 text-xs text-muted-foreground">Case ID</div>
              <div className="font-mono text-sm font-bold text-foreground break-all">{caseItem.id}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <div className="mb-1 text-xs text-muted-foreground">Reported By</div>
              <div className="text-sm font-medium text-foreground">{caseItem.userName}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <div className="mb-1 text-xs text-muted-foreground">Role</div>
              <Badge variant="outline" className="border-primary/50 text-primary">
                {caseItem.userRole}
              </Badge>
            </div>
          </div>

          {/* AI Classification Summary */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">AI Classification Summary</h4>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-1 text-xs text-muted-foreground">Attack Type</div>
                <div className="text-sm font-medium text-foreground">{caseItem.attackType}</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-1 text-xs text-muted-foreground">Severity</div>
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
                  {caseItem.severity}
                </Badge>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-1 text-xs text-muted-foreground">Confidence</div>
                <div className="text-sm font-medium text-foreground">{caseItem.confidence}%</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-1 text-xs text-muted-foreground">Status</div>
                <Badge
                  variant={
                    (caseItem.status?.toUpperCase() === "RESOLVED" || caseItem.status?.toUpperCase() === "ACTION_TAKEN" || caseItem.status === "Resolved")
                      ? "default"
                      : (caseItem.status?.toUpperCase() === "UNDER_REVIEW" || caseItem.status === "Under Review")
                        ? "secondary"
                        : "outline"
                  }
                >
                  {caseItem.status?.toUpperCase() === "ACTION_TAKEN" ? "Resolved" : caseItem.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          {caseItem.description && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Incident Description</h4>
              <p className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-foreground whitespace-pre-wrap">
                {caseItem.description}
              </p>
            </div>
          )}

          {(caseItem.affectedSystem || caseItem.location) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {caseItem.affectedSystem && (
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <div className="mb-1 text-xs text-muted-foreground">Affected System</div>
                  <div className="text-sm font-medium text-foreground">{caseItem.affectedSystem}</div>
                </div>
              )}
              {caseItem.location && (
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <div className="mb-1 text-xs text-muted-foreground">Location</div>
                  <div className="text-sm font-medium text-foreground">{caseItem.location}</div>
                </div>
              )}
            </div>
          )}

          {/* Evidence Preview */}
          {caseItem.evidence.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Evidence Files (Read-Only)</h4>
              <div className="space-y-2">
                {caseItem.evidence.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground truncate">{file}</span>
                    <Badge variant="outline" className="ml-auto text-xs shrink-0">
                      Encrypted
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {caseItem.mitigationSteps && caseItem.mitigationSteps.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="mb-3 text-sm font-semibold text-foreground">Safety Guidelines & Mitigation Steps</h4>
              <ul className="space-y-2">
                {caseItem.mitigationSteps.map((step, index) => (
                  <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">•</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Admin Actions */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Admin Actions</h4>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                {(caseItem.status?.toUpperCase() === "SUBMITTED") && (
                  <Button onClick={() => handleStatusChange(caseItem.id, "UNDER_REVIEW")} className="w-full">
                    Mark as Under Review
                  </Button>
                )}
                {(caseItem.status?.toUpperCase() === "UNDER_REVIEW" || caseItem.status === "Under Review") && (
                  <Button onClick={() => handleStatusChange(caseItem.id, "ACTION_TAKEN")} className="w-full">
                    Mark as Resolved / Action Taken
                  </Button>
                )}
                {(caseItem.status?.toUpperCase() === "RESOLVED" || caseItem.status?.toUpperCase() === "ACTION_TAKEN" || caseItem.status === "Resolved") && (
                  <div className="flex w-full items-center justify-center rounded-lg border border-primary/50 bg-primary/10 p-3">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Case Resolved</span>
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={() => generateCasePdf(caseItem)} className="sm:w-auto w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>

          {/* Audit Notice */}
          <Alert className="border-primary/50 bg-primary/5">
            <Shield className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs">
              All actions are logged for accountability and traceability.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
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
  )
}
