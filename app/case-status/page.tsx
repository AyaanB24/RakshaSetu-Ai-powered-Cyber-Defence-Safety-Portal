"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserShell } from "@/components/user-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Clock, CheckCircle2, Eye, Download } from "lucide-react"
import { generateCasePdf } from "@/lib/generate-pdf"
import { store, type User, type Case } from "@/lib/store"
import { useCases } from "@/hooks/use-cases"

const handleDownload = (caseItem: Case) => {
  generateCasePdf(caseItem)
}

export default function CaseStatusPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const currentUser = store.getUser()
    if (!currentUser || currentUser.role === "admin") {
      router.push("/login")
      return
    }
    setUser(currentUser)
  }, [router])

  const { cases, loading } = useCases(user?.id)

  if (!user) return null

  const statusCounts = {
    submitted: cases.filter((c) => c.status?.toUpperCase() === "SUBMITTED").length,
    underReview: cases.filter((c) => c.status?.toUpperCase() === "UNDER_REVIEW" || c.status === "Under Review").length,
    resolved: cases.filter((c) => c.status?.toUpperCase() === "RESOLVED" || c.status?.toUpperCase() === "ACTION_TAKEN" || c.status === "Resolved").length,
  }

  return (
    <UserShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Case Status</h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">Track your incident reports and download detailed reports</p>
        </div>

        {/* Status Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{statusCounts.submitted}</div>
                <div className="text-sm text-muted-foreground">Submitted</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{statusCounts.underReview}</div>
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
                <div className="text-2xl font-bold text-foreground">{statusCounts.resolved}</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cases Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>All Cases - Report / Complaint Area</CardTitle>
            <CardDescription>View and download comprehensive reports for your incidents</CardDescription>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">No cases reported yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Your incident reports will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cases.map((caseItem) => (
                  <Dialog key={caseItem.id}>
                    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                      <DialogTrigger asChild>
                        <div className="flex flex-1 cursor-pointer items-center gap-4 transition-colors hover:opacity-80">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-foreground">{caseItem.id}</span>
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
                              <Badge variant="outline" className="text-xs">
                                {caseItem.severity}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Submitted: {new Date(caseItem.submittedAt).toLocaleString()}
                            </p>
                            {caseItem.status !== "Submitted" && (
                              <p className="text-xs text-muted-foreground">
                                Updated: {new Date(caseItem.updatedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
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
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </DialogTrigger>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(caseItem)}
                        className="bg-transparent"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>

                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Case Details & Report</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Case Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-lg border border-border bg-muted/50 p-3">
                            <div className="mb-1 text-xs text-muted-foreground">Case ID</div>
                            <div className="font-mono text-sm font-bold text-foreground">{caseItem.id}</div>
                          </div>
                          <div className="rounded-lg border border-border bg-muted/50 p-3">
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

                        {/* AI Classification */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-foreground">AI Classification</h4>
                          <div className="grid gap-3 sm:grid-cols-3">
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
                          </div>
                        </div>

                        {/* Description */}
                        {caseItem.description && (
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-foreground">Description</h4>
                            <p className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-foreground">
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

                        {/* Evidence */}
                        {caseItem.evidence.length > 0 && (
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-foreground">Evidence Files</h4>
                            <div className="space-y-2">
                              {caseItem.evidence.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                                >
                                  <FileText className="h-4 w-4 text-primary" />
                                  <span className="text-sm text-foreground">{file}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {caseItem.mitigationSteps && caseItem.mitigationSteps.length > 0 && (
                          <div className="rounded-lg border border-border bg-card p-4">
                            <h4 className="mb-3 text-sm font-semibold text-foreground">
                              Safety Guidelines & Mitigation Steps
                            </h4>
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

                        {/* Timeline */}
                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-foreground">Timeline</h4>
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                                  <FileText className="h-4 w-4 text-primary" />
                                </div>
                                {caseItem.status !== "Submitted" && <div className="h-full w-0.5 bg-border"></div>}
                              </div>
                              <div className="pb-4">
                                <div className="text-sm font-medium text-foreground">Submitted</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(caseItem.submittedAt).toLocaleString()}
                                </div>
                              </div>
                            </div>

                            {(caseItem.status?.toUpperCase() === "UNDER_REVIEW" || caseItem.status === "Under Review") && (
                              <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20">
                                    <Clock className="h-4 w-4 text-secondary" />
                                  </div>
                                  <div className="h-full w-0.5 bg-border"></div>
                                </div>
                                <div className="pb-4">
                                  <div className="text-sm font-medium text-foreground">Under Review</div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(caseItem.updatedAt).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            )}

                            {(caseItem.status?.toUpperCase() === "RESOLVED" || caseItem.status?.toUpperCase() === "ACTION_TAKEN" || caseItem.status === "Resolved") && (
                              <>
                                <div className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20">
                                      <Clock className="h-4 w-4 text-secondary" />
                                    </div>
                                    <div className="h-full w-0.5 bg-border"></div>
                                  </div>
                                  <div className="pb-4">
                                    <div className="text-sm font-medium text-foreground">Under Review</div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(caseItem.updatedAt).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-foreground">Resolved</div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(caseItem.updatedAt).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={() => handleDownload(caseItem)}
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Full Report
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserShell>
  )
}
