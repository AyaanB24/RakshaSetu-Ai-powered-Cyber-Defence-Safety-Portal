"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Shield, AlertTriangle } from "lucide-react"
import { store, type UserRole } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { PublicHeader } from "@/components/public-header"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  // User login state
  const [userRole, setUserRole] = useState<UserRole>("serving")
  const [userEmail, setUserEmail] = useState("")
  const [userEchs, setUserEchs] = useState("")
  const [userDepId, setUserDepId] = useState("")
  const [userPassword, setUserPassword] = useState("")

  // Admin login state
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let authEmail = userEmail

      if (userRole === "ex-serviceman") {
        if (!userEmail) {
          toast({ title: "Error", description: "Email is required", variant: "destructive" })
          return
        }
        if (!userEchs) {
          toast({ title: "Error", description: "ECHS Number is required", variant: "destructive" })
          return
        }
      } else if (userRole === "dependent") {
        if (!userDepId) {
          toast({ title: "Error", description: "Dependent ID is required", variant: "destructive" })
          return
        }
        if (!userEmail) {
          toast({ title: "Error", description: "Email is required", variant: "destructive" })
          return
        }
        // Use actual email for auth
        authEmail = userEmail
      } else if (userRole === "serving") {
        if (!userEmail) {
          toast({ title: "Error", description: "Office Email is required", variant: "destructive" })
          return
        }
      }

      // 1. Sign In with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: userPassword,
      })

      if (authError) throw new Error(authError.message)
      if (!authData.user) throw new Error("Authentication failed")

      // 2. Fetch Profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      if (error || !data) {
        throw new Error("Profile not found")
      }

      // 3. Verify Role matches
      if (data.role !== userRole) {
        throw new Error("Role mismatch. Please login with the correct role.")
      }

      // 4. Specific checks
      if (userRole === "ex-serviceman") {
        const profileEchs = (data.echs_number || "").trim().toLowerCase();
        const inputEchs = userEchs.trim().toLowerCase();
        if (profileEchs !== inputEchs) {
          throw new Error("ECHS Number mismatch. Please verify your details.")
        }
      }

      if (userRole === "dependent") {
        if (data.dependent_id !== userDepId) {
          throw new Error("Dependent ID mismatch. Please verify your ID.")
        }
      }

      store.setUser({
        id: data.id,
        role: data.role as UserRole,
        email: data.email,
        name: data.full_name,
        echsNo: data.echs_number,
        dependentId: data.dependent_id,
      })

      toast({ title: "Login successful", description: `Welcome, ${data.full_name}` })
      router.push("/dashboard")

    } catch (error: any) {
      console.error("Login Error Full Object:", error)
      const errorMsg = error.message || "Invalid credentials."

      // Handle "Email not confirmed" specifically
      if (errorMsg.includes("Email not confirmed")) {
        toast({
          title: "Account Not Verified",
          description: "Your ECHS account is waiting for approval. Please contact Admin or check if auto-confirmation is enabled.",
          variant: "destructive",
        })
        return
      }

      const errorDetails = error.details || error.hint || ""

      toast({
        title: "Authentication failed",
        description: `${errorMsg} ${errorDetails ? `(${errorDetails})` : ''}`,
        variant: "destructive",
      })
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // 1. Sign In with Supabase Auth for Admin
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      })

      if (authError) throw new Error(authError.message)
      if (!authData.user) throw new Error("Authentication failed")

      // 2. Mock state for dashboard compatibility
      store.setUser({
        id: authData.user.id,
        role: "admin",
        email: adminEmail,
        name: "CERT Admin",
      })

      toast({ title: "Admin login successful", description: "Access granted to CERT Dashboard" })
      router.push("/admin")

    } catch (error: any) {
      console.error(error)
      toast({
        title: "Authentication failed",
        description: error.message || "Invalid admin credentials.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <PublicHeader activePage="login" />

      {/* Demo Credentials for Judges */}
      <div className="container mx-auto px-4 pt-8">
        <div className="mx-auto max-w-6xl rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="mb-2 font-semibold text-primary">Demo Credentials (For Judges)</h3>
              <div className="grid gap-x-8 gap-y-2 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <span className="font-medium text-foreground">Serving Personnel</span>
                  <div className="text-muted-foreground">Em: ayaanbargir24@gmail.com</div>
                  <div className="text-muted-foreground">Pass: 123456789</div>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-foreground">Ex-Serviceman</span>
                  <div className="text-muted-foreground">Em: ayaanbargir024@gmail.com</div>
                  <div className="text-muted-foreground">ECHS: ECSH-778812</div>
                  <div className="text-muted-foreground">Pass: 123456</div>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-foreground">Dependent</span>
                  <div className="text-muted-foreground">Em: asiyamujawar05@gmail.com</div>
                  <div className="text-muted-foreground">ID: DEP-44321</div>
                  <div className="text-muted-foreground">Pass: 123456</div>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-foreground">CERT Admin</span>
                  <div className="text-muted-foreground">Em: cert.admin@gov.in</div>
                  <div className="text-muted-foreground">Pass: Raksha@123</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          {/* User Access Card */}
          <Card className="border-border bg-card">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl text-foreground">User Access</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Defence Ecosystem Login</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <form onSubmit={handleUserLogin} className="space-y-4 md:space-y-6">
                <div className="space-y-4">
                  <Label className="text-foreground">Select Role</Label>
                  <RadioGroup value={userRole} onValueChange={(value) => setUserRole(value as UserRole)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="serving" id="serving" />
                      <Label htmlFor="serving" className="font-normal">
                        Serving Defence Personnel
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ex-serviceman" id="ex-serviceman" />
                      <Label htmlFor="ex-serviceman" className="font-normal">
                        Ex-Serviceman
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dependent" id="dependent" />
                      <Label htmlFor="dependent" className="font-normal">
                        Defence Dependent
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {userRole === "serving" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Office Email</Label>
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="name@indianarmy.mil"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-password">Password</Label>
                      <Input
                        id="user-password"
                        type="password"
                        placeholder="Enter Password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {userRole === "ex-serviceman" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="ex-email">Email</Label>
                      <Input
                        id="ex-email"
                        type="email"
                        placeholder="yourname@domain.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="echs">ECHS Number</Label>
                      <Input
                        id="echs"
                        type="text"
                        placeholder="ECHS-778812"
                        value={userEchs}
                        onChange={(e) => setUserEchs(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ex-password">Password</Label>
                      <Input
                        id="ex-password"
                        type="password"
                        placeholder="Enter Password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {userRole === "dependent" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="dep-email">Email</Label>
                      <Input
                        id="dep-email"
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dep-id">Dependent ID</Label>
                      <Input
                        id="dep-id"
                        type="text"
                        placeholder="DEP-44321"
                        value={userDepId}
                        onChange={(e) => setUserDepId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dep-password">Password</Label>
                      <Input
                        id="dep-password"
                        type="password"
                        placeholder="Enter Password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full">
                  Secure Login
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">New user? </span>
                  <Link href="/signup" className="text-primary hover:underline">
                    Create an account
                  </Link>
                </div>

                <div className="rounded-lg border border-secondary/50 bg-secondary/20 p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-secondary" />
                    <p className="text-xs text-foreground">Civilian access is strictly prohibited.</p>
                  </div>
                </div>


              </form>
            </CardContent>
          </Card>

          {/* CERT Admin Access Card */}
          <Card className="border-border bg-card">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl text-foreground">CERT Authority Access</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Administrative Login Only</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <form onSubmit={handleAdminLogin} className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@gov.in"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Admin Login
                </Button>

                <div className="rounded-lg border border-destructive/50 bg-destructive/20 p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive-foreground" />
                    <p className="text-xs text-foreground">
                      Admin access is restricted. No registration available. Unauthorized access attempts are logged.
                    </p>
                  </div>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
