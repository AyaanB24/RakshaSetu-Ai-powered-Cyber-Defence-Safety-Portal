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
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { PublicHeader } from "@/components/public-header"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userRole, setUserRole] = useState<"serving" | "ex-serviceman" | "dependent">("serving")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [echsNo, setEchsNo] = useState("")
  const [dependentId, setDependentId] = useState("")
  const [unit, setUnit] = useState("")
  const [password, setPassword] = useState("")

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Construct auth email
      // Auth email is the email provided by the user for all roles
      const authEmail = email

      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: authEmail,
        password: password,
        options: {
          data: {
            full_name: name,
            role: userRole,
            echs_number: userRole === "ex-serviceman" ? echsNo : undefined,
            dependent_id: userRole === "dependent" ? dependentId : undefined,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("No user created")

      // 2. Create Profile linked to Auth User
      const profileData: any = {
        id: authData.user.id,
        role: userRole,
        full_name: name,
        created_at: new Date().toISOString(),
      }

      if (userRole === "serving") {
        profileData.email = email
        profileData.unit = unit
      } else if (userRole === "ex-serviceman") {
        profileData.email = email // personal email stored in profile, but not used for auth username
        profileData.echs_number = echsNo
      } else if (userRole === "dependent") {
        profileData.email = email
        profileData.dependent_id = dependentId
      }

      const { error: profileError } = await supabase.from("profiles").insert([profileData])

      if (profileError) throw profileError

      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account before logging in.",
      })
      setTimeout(() => router.push("/login"), 3000)
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <PublicHeader activePage="signup" />

      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="mx-auto max-w-2xl">
          <Card className="border-border bg-card">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl text-foreground">Create New Account</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Register for RakshaSetu Defence Portal
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <form onSubmit={handleSignup} className="space-y-4 md:space-y-6">
                {/* Role Selection */}
                <div className="space-y-4">
                  <Label className="text-foreground">Select Your Role</Label>
                  <RadioGroup value={userRole} onValueChange={(value) => setUserRole(value as any)}>
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

                {/* Common Fields */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Role-specific Fields */}
                {userRole === "serving" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Office Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@indianarmy.mil"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit/Command</Label>
                      <Input
                        id="unit"
                        type="text"
                        placeholder="Enter unit or command"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
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
                        value={echsNo}
                        onChange={(e) => setEchsNo(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Personal Email (for authentication)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {userRole === "dependent" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="yourname@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dep-id">Dependent ID</Label>
                      <Input
                        id="dep-id"
                        type="text"
                        placeholder="DEP-XXXXX"
                        value={dependentId}
                        onChange={(e) => setDependentId(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Create Account
                </Button>

                <div className="rounded-lg border border-secondary/50 bg-secondary/20 p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-secondary" />
                    <p className="text-xs text-foreground">
                      All registrations are verified. Civilian access is strictly prohibited.
                    </p>
                  </div>
                </div>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link href="/login" className="text-primary hover:underline">
                    Login here
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
