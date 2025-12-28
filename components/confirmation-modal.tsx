"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, FileText, Download } from "lucide-react"
import type { Case } from "@/lib/store"

interface ConfirmationModalProps {
  open: boolean
  onClose: () => void
  caseData: Case | null
}

import { generateCasePdf } from "@/lib/generate-pdf"

// Removed local generatePDFReport function


export function ConfirmationModal({ open, onClose, caseData }: ConfirmationModalProps) {
  if (!caseData) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">Incident Submitted Successfully</DialogTitle>
          <DialogDescription className="text-center">
            Your report has been received and is now under CERT review
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Case Details
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Case ID</div>
                <div className="font-mono text-sm font-bold text-foreground">{caseData.id}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">AI-Detected Attack Type</div>
                <Badge variant="outline" className="mt-1 border-destructive/50 text-destructive">
                  {caseData.attackType}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <Badge variant="outline" className="mt-1">
                  {caseData.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-primary/10 p-3 text-sm text-foreground">
            <p className="font-medium">What to do now / Next recommended actions:</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>• Your report is now visible in the Case Status section</li>
              <li>• CERT team will review your evidence and update the status</li>
              <li>• Download your report for your records using the button below</li>
              <li>• You will receive real-time status updates</li>
              <li>• Follow the mitigation steps provided in your report</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => generateCasePdf(caseData)} variant="outline" className="flex-1 bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button onClick={onClose} className="flex-1">
            Track Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
