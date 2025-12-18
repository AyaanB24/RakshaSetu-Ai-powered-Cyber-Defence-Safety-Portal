import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Eye, FileText, AlertTriangle } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-3">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <span className="text-lg md:text-xl font-bold tracking-tight text-foreground">RakshaSetu</span>
          </div>
          <Link href="/login">
            <Button size="sm" variant="outline" className="text-xs md:text-sm bg-transparent">
              Secure Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 md:px-4 py-1.5 text-xs md:text-sm text-primary">
            <Shield className="h-3 w-3 md:h-4 md:w-4" />
            <span className="font-medium">Defence-Grade Security Platform</span>
          </div>

          <h1 className="mb-4 md:mb-6 text-balance text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            RakshaSetu — Real-Time Cyber Protection for Defence Personnel
          </h1>

          <p className="mb-6 md:mb-8 text-balance text-base md:text-lg lg:text-xl text-muted-foreground px-4">
            A secure AI-driven platform for threat detection, evidence preservation, and coordinated CERT response.
          </p>

          <Link href="/login">
            <Button size="lg" className="font-semibold text-sm md:text-base">
              Proceed to Secure Login
            </Button>
          </Link>
        </div>

        {/* Warning Banner */}
        <div className="mx-auto mt-8 md:mt-12 max-w-2xl rounded-lg border border-secondary/50 bg-secondary/20 p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-secondary flex-shrink-0" />
            <p className="text-xs md:text-sm font-medium text-foreground">
              Access restricted to Defence Personnel, Veterans, and Dependents only.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border bg-card p-5 md:p-6">
            <div className="mb-3 md:mb-4 inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary/10">
              <Eye className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg md:text-xl font-bold text-foreground">Detect</h3>
            <p className="text-xs md:text-sm text-muted-foreground">AI-Based Threat Identification</p>
            <p className="mt-2 md:mt-3 text-xs md:text-sm text-muted-foreground">
              Advanced machine learning algorithms automatically detect and classify cyber threats in real-time.
            </p>
          </Card>

          <Card className="border-border bg-card p-5 md:p-6">
            <div className="mb-3 md:mb-4 inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg md:text-xl font-bold text-foreground">Protect</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Secure Evidence Handling</p>
            <p className="mt-2 md:mt-3 text-xs md:text-sm text-muted-foreground">
              Military-grade encryption ensures all evidence is securely stored and preserved for investigation.
            </p>
          </Card>

          <Card className="border-border bg-card p-5 md:p-6">
            <div className="mb-3 md:mb-4 inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg md:text-xl font-bold text-foreground">Report</h3>
            <p className="text-xs md:text-sm text-muted-foreground">CERT-Integrated Case Management</p>
            <p className="mt-2 md:mt-3 text-xs md:text-sm text-muted-foreground">
              Seamless integration with CERT workflows for rapid incident response and resolution.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 md:mt-20 border-t border-border bg-card/50 py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6 text-center text-xs md:text-sm text-muted-foreground">
          <p>RakshaSetu - Cyber Protection Platform for Indian Defence Forces</p>
          <p className="mt-2">All activities are monitored and logged for security purposes.</p>
        </div>
      </footer>
    </div>
  )
}
