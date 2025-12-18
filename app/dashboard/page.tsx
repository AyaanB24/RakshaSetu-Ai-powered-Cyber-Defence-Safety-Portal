"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UserSidebar } from "@/components/user-sidebar"
import { UserHeader } from "@/components/user-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, AlertCircle, Shield, TrendingUp } from "lucide-react"
import { store, type User, type Case } from "@/lib/store"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [recentCases, setRecentCases] = useState<Case[]>([])

  useEffect(() => {
    const currentUser = store.getUser()
    if (!currentUser || currentUser.role === "admin") {
      router.push("/login")
      return
    }

    setUser(currentUser)
    setRecentCases(store.getUserCases(currentUser.id).slice(0, 5))

    const unsubscribe = store.subscribe(() => {
      const updatedUser = store.getUser()
      if (updatedUser && updatedUser.id === currentUser.id) {
        setRecentCases(store.getUserCases(updatedUser.id).slice(0, 5))
      }
    })

    return unsubscribe
  }, [router])

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      <UserSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <UserHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Real-time cyber threat protection and incident management</p>
            </div>

            {/* Security Posture */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Your Security Posture</h3>
                  <p className="text-sm text-muted-foreground">
                    All systems operational. Active threat monitoring enabled.
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground">Secure</Badge>
              </CardContent>
            </Card>

            {/* Action Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Search className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Check Suspicious Content</CardTitle>
                      <CardDescription>AI-powered threat analysis</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Upload suspicious files, messages, or links for instant AI analysis and threat detection.
                  </p>
                  <Link href="/check-content">
                    <Button className="w-full">Analyze Content</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                      <AlertCircle className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <CardTitle>Report Cyber Incident</CardTitle>
                      <CardDescription>Submit evidence to CERT</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Report confirmed cyber threats with evidence for immediate CERT investigation.
                  </p>
                  <Link href="/report-attack">
                    <Button variant="outline" className="w-full bg-transparent">
                      File Report
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Cases */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Cases</CardTitle>
                    <CardDescription>Your recent incident reports</CardDescription>
                  </div>
                  <Link href="/case-status">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentCases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <TrendingUp className="mb-3 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">No cases reported yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">Your incident reports will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentCases.map((caseItem) => (
                      <div
                        key={caseItem.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium text-foreground">{caseItem.id}</span>
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
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(caseItem.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            caseItem.status === "Resolved"
                              ? "default"
                              : caseItem.status === "Under Review"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {caseItem.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
