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

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  // User login state
  const [userRole, setUserRole] = useState<UserRole>("serving")
  const [userEmail, setUserEmail] = useState("")
  const [userMobile, setUserMobile] = useState("")
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

      // For non-serving roles, construct email from mobile (as done in signup)
      if (userRole !== "serving") {
        if (!userMobile) {
          toast({ title: "Error", description: "Mobile number is required", variant: "destructive" })
          return
        }
        authEmail = `${userMobile}@rakshasetu.local`
      }

      // 1. Sign In with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: userPassword,
      })

      if (authError) throw new Error(authError.message)
      if (!authData.user) throw new Error("Authentication failed")

      // 2. Fetch Profile
      // Now that we are logged in, RLS should allow us to read our own profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      if (error || !data) {
        throw new Error("Profile not found")
      }

      // 3. Verify Role matches (optional security check)
      if (data.role !== userRole) {
        throw new Error("Role mismatch. Please login with the correct role.")
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
      console.error(error)
      toast({
        title: "Authentication failed",
        description: error.message || "Invalid credentials.",
        variant: "destructive",
      })
    }
  }

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (adminEmail === "cert.admin@gov.in" && adminPassword === "Raksha@123") {
      store.setUser({
        id: "admin-001",
        role: "admin",
        email: adminEmail,
        name: "CERT Admin",
      })
      toast({ title: "Admin login successful", description: "Access granted to CERT Dashboard" })
      router.push("/admin")
    } else {
      toast({
        title: "Authentication failed",
        description: "Invalid admin credentials.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <span className="text-lg md:text-xl font-bold tracking-tight text-foreground">RakshaSetu</span>
          </Link>
          <Link href="/signup">
            <Button variant="outline" size="sm">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mx-auto grid max-w-6xl gap-6 md:gap-8 lg:grid-cols-2">
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
                      <Label htmlFor="user-email">Defence Email</Label>
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
                      <Label htmlFor="echs">ECHS Number</Label>
                      <Input
                        id="echs"
                        type="text"
                        placeholder="ECHS-XXXXXX"
                        value={userEchs}
                        onChange={(e) => setUserEchs(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="Enter mobile number"
                        value={userMobile}
                        onChange={(e) => setUserMobile(e.target.value)}
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
                      <Label htmlFor="dep-id">Dependent ID</Label>
                      <Input
                        id="dep-id"
                        type="text"
                        placeholder="DEP-XXXXX"
                        value={userDepId}
                        onChange={(e) => setUserDepId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dep-mobile">Mobile Number</Label>
                      <Input
                        id="dep-mobile"
                        type="tel"
                        placeholder="Enter mobile number"
                        value={userMobile}
                        onChange={(e) => setUserMobile(e.target.value)}
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

                <div className="mt-6 space-y-2 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Demo Credentials:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Serving: rajat.singh@indianarmy.mil | Pass: 123456</li>
                    <li>• Ex-Serviceman: ECHS-778812 | Pass: 123456</li>
                    <li>• Dependent: DEP-44321 | Pass: 123456</li>
                    <li>• Admin: cert.admin@gov.in | Pass: Raksha@123</li>
                  </ul>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
