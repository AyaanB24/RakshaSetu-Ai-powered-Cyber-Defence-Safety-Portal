import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Eye, FileText, AlertTriangle } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">RakshaSetu</span>
          </div>
          <Link href="/login">
            <Button size="sm" variant="outline">
              Secure Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Defence-Grade Security Platform</span>
          </div>

          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            RakshaSetu — Real-Time Cyber Protection for Defence Personnel
          </h1>

          <p className="mb-8 text-balance text-lg text-muted-foreground md:text-xl">
            A secure AI-driven platform for threat detection, evidence preservation, and coordinated CERT response.
          </p>

          <Link href="/login">
            <Button size="lg" className="font-semibold">
              Proceed to Secure Login
            </Button>
          </Link>
        </div>

        {/* Warning Banner */}
        <div className="mx-auto mt-12 max-w-2xl rounded-lg border border-secondary/50 bg-secondary/20 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-secondary" />
            <p className="text-sm font-medium text-foreground">
              Access restricted to Defence Personnel, Veterans, and Dependents only.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border bg-card p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">Detect</h3>
            <p className="text-sm text-muted-foreground">AI-Based Threat Identification</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Advanced machine learning algorithms automatically detect and classify cyber threats in real-time.
            </p>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">Protect</h3>
            <p className="text-sm text-muted-foreground">Secure Evidence Handling</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Military-grade encryption ensures all evidence is securely stored and preserved for investigation.
            </p>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">Report</h3>
            <p className="text-sm text-muted-foreground">CERT-Integrated Case Management</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Seamless integration with CERT workflows for rapid incident response and resolution.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>RakshaSetu - Cyber Protection Platform for Indian Defence Forces</p>
          <p className="mt-2">All activities are monitored and logged for security purposes.</p>
        </div>
      </footer>
    </div>
  )
}
