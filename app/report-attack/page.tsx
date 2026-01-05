"use client"

import type React from "react"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { UserShell } from "@/components/user-shell"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Shield, Loader2, CheckCircle2, ExternalLink } from "lucide-react"
import { store, type User, type Case } from "@/lib/store"
import { analyzeContent, type AnalysisResult } from "@/lib/ai-detector"
import { useCases } from "@/hooks/use-cases"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Progress } from "@/components/ui/progress"

function ReportAttackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const { createCase } = useCases(user?.id)
  const [description, setDescription] = useState("")
  const [affectedSystem, setAffectedSystem] = useState("")
  const [location, setLocation] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submittedCase, setSubmittedCase] = useState<Case | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [ipfsResult, setIpfsResult] = useState<{ [key: string]: { cid: string, url: string } }>({})
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const currentUser = store.getUser()
    if (!currentUser || currentUser.role === "admin") {
      router.push("/login")
      return
    }
    setUser(currentUser)

    const preload = searchParams.get("preload")
    if (preload) {
      setDescription(decodeURIComponent(preload))
    }
  }, [router, searchParams])

  useEffect(() => {
    if (description && !analysisResult) {
      handleAnalyze()
    }
  }, [description])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])

    files.forEach(file => {
      uploadToIPFS(file)
    })
  }

  const handleAnalyze = async () => {
    if (!description && uploadedFiles.length === 0) return

    setIsAnalyzing(true)

    try {
      const content = description || `Evidence files: ${uploadedFiles.map((f) => f.name).join(", ")}`
      const result = await analyzeContent(content, uploadedFiles[0]?.type)
      setAnalysisResult(result)
    } catch (error) {
      console.error("[v0] Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const uploadToIPFS = async (file: File) => {
    if (!user) return

    setIsUploading(true)
    setUploadProgress((prev) => ({ ...prev, [file.name]: 10 }))

    try {
      let session;
      try {
        const { data } = await supabase.auth.getSession()
        session = data.session;
      } catch (err: any) {
        console.error("Session retrieval error:", err)
        if (err.message.includes("refresh_token_not_found") || err.message.includes("Invalid Refresh Token")) {
          throw new Error("Your session has expired. Please log out and log in again.")
        }
        throw err;
      }

      if (!session) throw new Error("No active Supabase session found. Please log in.")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("case_id", "temp-id")

      setUploadProgress((prev) => ({ ...prev, [file.name]: 40 }))

      const response = await fetch("/api/upload-evidence", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const result = await response.json()
      setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))
      setIpfsResult((prev) => ({
        ...prev,
        [file.name]: {
          cid: result.cid,
          url: result.ipfs_url,
          hash: result.hash,
          signature: result.signature
        }
      }))

      toast({
        title: "Success",
        description: `File "${file.name}" secured on IPFS.`,
      })
    } catch (error: any) {
      console.error("IPFS Upload error:", error)
      setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }))

      toast({
        title: "Upload Failed",
        description: error.message || "Failed to secure evidence on IPFS.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleIpfsUploadAll = async () => {
    const pendingFiles = uploadedFiles.filter(file => !ipfsResult[file.name] && uploadProgress[file.name] !== 100)
    await Promise.all(pendingFiles.map(file => uploadToIPFS(file)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !analysisResult) return

    try {
      const newCase = await createCase({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        attackType: analysisResult.attackType,
        severity: analysisResult.severity,
        confidence: analysisResult.confidence,
        description: description || "No description provided",
        evidence: Object.values(ipfsResult).map((r: any) => r.cid).length > 0
          ? Object.values(ipfsResult).map((r: any) => r.cid)
          : uploadedFiles.map((f) => f.name),
        cryptographicEvidence: Object.values(ipfsResult).map((r: any) => ({
          cid: r.cid,
          hash: r.hash,
          signature: r.signature
        })),
        status: "Submitted",
        affectedSystem: affectedSystem || undefined,
        location: location || undefined,
        mitigationSteps: analysisResult.mitigationSteps,
      })

      setSubmittedCase(newCase)
      setShowModal(true)

      setDescription("")
      setAffectedSystem("")
      setLocation("")
      setUploadedFiles([])
      setAnalysisResult(null)
      setIpfsResult({})
      setUploadProgress({})
    } catch (error) {
      console.error("Error submitting case:", error)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    router.push("/case-status")
  }

  if (!user) return null

  const currentDateTime = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  return (
    <UserShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Report Cyber Incident</h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">Submit evidence for CERT investigation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Evidence Upload */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Upload Evidence</CardTitle>
              <CardDescription>
                Screenshots, files, or any relevant digital evidence (multi-format support)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" className="relative w-full cursor-pointer bg-transparent" asChild>
                  <label>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files (Text, Image, Audio, Video, Document)
                    <input
                      type="file"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      multiple
                      accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                    />
                  </label>
                </Button>

                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-2 rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-primary/50 text-primary">
                            {file.type.split("/")[0] || "file"}
                          </Badge>
                          <span className="flex-1 text-sm text-foreground">{file.name}</span>
                          <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>

                        {uploadProgress[file.name] !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>{uploadProgress[file.name] === -1 ? "Upload Failed" : (uploadProgress[file.name] === 100 ? "Uploaded to IPFS" : "Uploading...")}</span>
                              <span>{uploadProgress[file.name] === -1 ? "" : `${Math.max(0, uploadProgress[file.name])}%`}</span>
                            </div>
                            <Progress value={uploadProgress[file.name] === -1 ? 0 : uploadProgress[file.name]} className="h-1" />
                          </div>
                        )}

                        {ipfsResult[file.name] && (
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                              <CheckCircle2 className="h-3 w-3" />
                              Evidence secured on IPFS
                            </div>
                            <div className="flex flex-col gap-1 rounded bg-muted/30 p-2 text-[10px]">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground font-mono truncate mr-2">CID: {ipfsResult[file.name].cid}</span>
                                <a
                                  href={ipfsResult[file.name].url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-0.5 shrink-0"
                                >
                                  View <ExternalLink className="h-2 w-2" />
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {!isUploading && uploadedFiles.some(f => !ipfsResult[f.name]) && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs"
                        onClick={handleIpfsUploadAll}
                      >
                        Secure All Evidence on IPFS
                      </Button>
                    )}

                    {isUploading && (
                      <Button disabled variant="secondary" size="sm" className="w-full text-xs">
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Securing Evidence...
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <Alert className="border-primary/50 bg-primary/5">
                <Shield className="h-4 w-4 text-primary" />
                <AlertDescription className="text-xs">
                  All evidence is encrypted before secure storage.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
              <CardDescription>Provide information about the cyber incident</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what happened, when you noticed it, and any other relevant details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="affected-system">Affected System / App / Platform</Label>
                <Input
                  id="affected-system"
                  placeholder="e.g., Email, WhatsApp, Defence Portal, Banking App"
                  value={affectedSystem}
                  onChange={(e) => setAffectedSystem(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  placeholder="e.g., Delhi, Mumbai, Remote Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <Label className="text-xs text-muted-foreground">Date & Time</Label>
                  <div className="mt-1 text-sm font-medium text-foreground">{currentDateTime}</div>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <Label className="text-xs text-muted-foreground">Reported By</Label>
                  <div className="mt-1 text-sm font-medium text-foreground">{user.name}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Panel */}
          {!analysisResult && !isAnalyzing && (description || uploadedFiles.length > 0) && (
            <Button type="button" onClick={handleAnalyze} variant="outline" className="w-full bg-transparent">
              Run AI Threat Analysis
            </Button>
          )}

          {isAnalyzing && (
            <Card className="border-border">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium text-foreground">AI Analysis in Progress...</p>
                  <p className="text-xs text-muted-foreground">Detecting threat patterns and classification</p>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisResult && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>AI Threat Analysis Results</CardTitle>
                <CardDescription>Comprehensive threat assessment and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResult.detectedFormat && (
                  <Alert className="border-border bg-muted/50">
                    <AlertDescription className="text-xs">
                      <span className="font-medium">Format Analyzed:</span> {analysisResult.detectedFormat}
                      {uploadedFiles[0] && ` (${uploadedFiles[0].name})`}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-1 text-xs text-muted-foreground">Detected Attack Type</div>
                    <div className="text-lg font-bold text-foreground">{analysisResult.attackType}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-1 text-xs text-muted-foreground">Risk Severity</div>
                    <Badge
                      variant="outline"
                      className={
                        analysisResult.severity === "High"
                          ? "border-destructive/50 text-destructive"
                          : analysisResult.severity === "Medium"
                            ? "border-secondary/50 text-secondary"
                            : "border-primary/50 text-primary"
                      }
                    >
                      {analysisResult.severity}
                    </Badge>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-1 text-xs text-muted-foreground">Confidence Score</div>
                    <div className="text-lg font-bold text-foreground">{analysisResult.confidence}%</div>
                  </div>
                </div>

                {analysisResult.mitigationSteps && analysisResult.mitigationSteps.length > 0 && (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 text-sm font-semibold text-foreground">
                      Recommended Next Steps / Safety Guidance
                    </div>
                    <ul className="space-y-2">
                      {analysisResult.mitigationSteps.map((step, index) => (
                        <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-primary">•</span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!analysisResult || (!description && uploadedFiles.length === 0)}
          >
            Submit Incident Report
          </Button>
        </form>
      </div>
      <ConfirmationModal open={showModal} onClose={handleModalClose} caseData={submittedCase} />
    </UserShell >
  )
}

export default function ReportAttackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportAttackContent />
    </Suspense>
  )
}
