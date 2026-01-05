"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UserShell } from "@/components/user-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, AlertCircle, Shield, TrendingUp } from "lucide-react"
import { useCases } from "@/hooks/use-cases"
import { supabase } from "@/lib/supabase"
import { store, type User, type Case } from "@/lib/store"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  const { cases, loading } = useCases(user?.id)
  const recentCases = cases.slice(0, 5)

  useEffect(() => {
    const checkUser = async () => {
      const storeUser = store.getUser()
      if (storeUser && storeUser.role !== "admin") {
        setUser(storeUser)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser({
          id: session.user.id,
          name: session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
          role: "serving"
        })
        return
      }

      router.push("/login")
    }
    checkUser()
  }, [router])

  if (!user) return null

  return (
    <UserShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">
            Real-time cyber threat protection and incident management
          </p>
        </div>

        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-4 md:p-6">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/20">
              <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm md:text-base font-semibold text-foreground">Your Security Posture</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                All systems operational. Active threat monitoring enabled.
              </p>
            </div>
            <Badge className="bg-primary text-primary-foreground text-xs">Secure</Badge>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
          <Card className="border-border">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg">Check Suspicious Content</CardTitle>
                  <CardDescription className="text-xs md:text-sm">AI-powered threat analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <p className="mb-4 text-xs md:text-sm text-muted-foreground">
                Upload suspicious files, messages, or links for instant AI analysis and threat detection.
              </p>
              <Link href="/check-content">
                <Button className="w-full text-sm">Analyze Content</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                  <AlertCircle className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg">Report Cyber Incident</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Submit evidence to CERT</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <p className="mb-4 text-xs md:text-sm text-muted-foreground">
                Report confirmed cyber threats with evidence for immediate CERT investigation.
              </p>
              <Link href="/report-attack">
                <Button variant="outline" className="w-full bg-transparent text-sm">
                  File Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base md:text-lg">Recent Cases</CardTitle>
                <CardDescription className="text-xs md:text-sm">Your recent incident reports</CardDescription>
              </div>
              <Link href="/case-status">
                <Button variant="outline" size="sm" className="text-xs bg-transparent">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            {recentCases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="mb-3 h-10 w-10 md:h-12 md:w-12 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">No cases reported yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Your incident reports will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 md:p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs md:text-sm font-medium text-foreground">
                          {caseItem.id}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            caseItem.severity === "High"
                              ? "border-destructive/50 text-destructive text-xs"
                              : caseItem.severity === "Medium"
                                ? "border-secondary/50 text-secondary text-xs"
                                : "border-primary/50 text-primary text-xs"
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
                        (caseItem.status?.toUpperCase() === "RESOLVED" || caseItem.status?.toUpperCase() === "ACTION_TAKEN" || caseItem.status === "Resolved")
                          ? "default"
                          : (caseItem.status?.toUpperCase() === "UNDER_REVIEW" || caseItem.status === "Under Review")
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs self-start sm:self-center"
                    >
                      {caseItem.status?.toUpperCase() === "ACTION_TAKEN" ? "Resolved" : caseItem.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserShell>
  )
}
