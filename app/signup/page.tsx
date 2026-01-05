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

  // Form fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [echsNo, setEchsNo] = useState("")
  const [dependentId, setDependentId] = useState("")
  const [serviceNo, setServiceNo] = useState("")
  const [unit, setUnit] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)

  const handleSendOtp = () => {
    if (userRole === "serving" && !email) {
      toast({ title: "Error", description: "Please enter your defence email", variant: "destructive" })
      return
    }
    if ((userRole === "ex-serviceman" || userRole === "dependent") && !mobile) {
      toast({ title: "Error", description: "Please enter your mobile number", variant: "destructive" })
      return
    }

    setOtpSent(true)
    toast({
      title: "OTP Sent",
      description: userRole === "serving" ? "OTP sent to your defence email" : "OTP sent to your mobile number",
    })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otpSent) {
      toast({ title: "Error", description: "Please request OTP first", variant: "destructive" })
      return
    }

    if (otp !== "123456") {
      toast({
        title: "Invalid OTP",
        description: "Please check the OTP and try again.",
        variant: "destructive",
      })
      return
    }

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email || `${mobile}@rakshasetu.local`, // Fallback for mobile-only users
        password: password,
        options: {
          data: {
            full_name: name,
            role: userRole,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("No user created")

      // 2. Create Profile linked to Auth User
      const profileData: any = {
        id: authData.user.id, // Critical: Link to auth.users
        role: userRole,
        full_name: name,
        created_at: new Date().toISOString(),
      }

      if (userRole === "serving") {
        profileData.email = email
        profileData.service_number = serviceNo
        profileData.unit = unit
      } else if (userRole === "ex-serviceman") {
        profileData.echs_number = echsNo
        profileData.mobile = mobile
        profileData.service_number = serviceNo
      } else if (userRole === "dependent") {
        profileData.dependent_id = dependentId
        profileData.mobile = mobile
        profileData.service_number = serviceNo
      }

      const { error: profileError } = await supabase.from("profiles").insert([profileData])

      if (profileError) throw profileError

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Redirecting to login...",
      })
      setTimeout(() => router.push("/login"), 2000)
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
                      <Label htmlFor="email">Defence Email</Label>
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
                      <Label htmlFor="service-no">Service Number</Label>
                      <Input
                        id="service-no"
                        type="text"
                        placeholder="Enter service number"
                        value={serviceNo}
                        onChange={(e) => setServiceNo(e.target.value)}
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
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="Enter mobile number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-no-ex">Service Number (Last Held)</Label>
                      <Input
                        id="service-no-ex"
                        type="text"
                        placeholder="Enter last service number"
                        value={serviceNo}
                        onChange={(e) => setServiceNo(e.target.value)}
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
                        placeholder="DEP-XXXXX (if existing)"
                        value={dependentId}
                        onChange={(e) => setDependentId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile-dep">Mobile Number</Label>
                      <Input
                        id="mobile-dep"
                        type="tel"
                        placeholder="Enter mobile number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sponsor-no">Sponsor Service Number</Label>
                      <Input
                        id="sponsor-no"
                        type="text"
                        placeholder="Enter sponsor's service number"
                        value={serviceNo}
                        onChange={(e) => setServiceNo(e.target.value)}
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

                {/* OTP Section */}
                <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground">Verification</Label>
                    {otpSent && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>

                  {!otpSent ? (
                    <Button type="button" onClick={handleSendOtp} variant="outline" className="w-full bg-transparent">
                      Send OTP
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        required
                      />
                      <Button
                        type="button"
                        onClick={handleSendOtp}
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                      >
                        Resend OTP
                      </Button>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={!otpSent}>
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

                <div className="mt-4 space-y-2 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Demo OTP for Testing:</p>
                  <p className="text-xs text-muted-foreground">Use OTP: 123456</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
