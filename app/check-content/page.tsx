"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserSidebar } from "@/components/user-sidebar"
import { UserHeader } from "@/components/user-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, ImageIcon, Music, Video, File, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import { store, type User } from "@/lib/store"
import { analyzeContent, type AnalysisResult } from "@/lib/ai-detector"

export default function CheckContentPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [textContent, setTextContent] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  useEffect(() => {
    const currentUser = store.getUser()
    if (!currentUser || currentUser.role === "admin") {
      router.push("/login")
      return
    }
    setUser(currentUser)
  }, [router])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setAnalysisResult(null)
    }
  }

  const handleAnalyze = async () => {
    if (!textContent && !uploadedFile) return

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const content = textContent || `File analysis: ${uploadedFile?.name}`
      const result = await analyzeContent(content, uploadedFile?.type)
      setAnalysisResult(result)
    } catch (error) {
      console.error("[v0] Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReportIncident = () => {
    router.push(`/report-attack?preload=${encodeURIComponent(textContent || uploadedFile?.name || "")}`)
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      <UserSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <UserHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Check Suspicious Content</h1>
              <p className="mt-1 text-muted-foreground">AI-powered threat detection and analysis</p>
            </div>

            {/* Upload Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Upload Content for Analysis</CardTitle>
                <CardDescription>Text, images, audio, video, or document files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Text Input */}
                <div className="space-y-2">
                  <Label htmlFor="text-content">Paste Text or URL</Label>
                  <Textarea
                    id="text-content"
                    placeholder="Paste suspicious message, email content, or URL here..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Or Upload File</Label>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" className="relative cursor-pointer bg-transparent" asChild>
                      <label>
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                        <input
                          type="file"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </Button>
                    {uploadedFile && (
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
                        {uploadedFile.type.startsWith("image/") && <ImageIcon className="h-4 w-4 text-primary" />}
                        {uploadedFile.type.startsWith("audio/") && <Music className="h-4 w-4 text-primary" />}
                        {uploadedFile.type.startsWith("video/") && <Video className="h-4 w-4 text-primary" />}
                        {(uploadedFile.type.includes("pdf") || uploadedFile.type.includes("document")) && (
                          <FileText className="h-4 w-4 text-primary" />
                        )}
                        {!uploadedFile.type.startsWith("image/") &&
                          !uploadedFile.type.startsWith("audio/") &&
                          !uploadedFile.type.startsWith("video/") &&
                          !uploadedFile.type.includes("pdf") &&
                          !uploadedFile.type.includes("document") && <File className="h-4 w-4 text-primary" />}
                        <span className="text-sm text-foreground">{uploadedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analyze Button */}
                <Button
                  onClick={handleAnalyze}
                  disabled={(!textContent && !uploadedFile) || isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    "Analyze Content"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Result */}
            {analysisResult && (
              <Card
                className={
                  analysisResult.isSuspicious
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-primary/50 bg-primary/5"
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {analysisResult.isSuspicious ? (
                          <AlertTriangle className="h-6 w-6 text-destructive" />
                        ) : (
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        )}
                        <CardTitle>
                          {analysisResult.isSuspicious ? "Suspicious Content Detected" : "Content is Safe"}
                        </CardTitle>
                      </div>
                      <CardDescription className="mt-2">AI Analysis Complete</CardDescription>
                    </div>
                    <Badge
                      variant={analysisResult.isSuspicious ? "destructive" : "default"}
                      className={
                        analysisResult.isSuspicious
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-primary text-primary-foreground"
                      }
                    >
                      {analysisResult.isSuspicious ? "Threat Detected" : "Safe"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResult.detectedFormat && (
                    <Alert className="border-border bg-muted/50">
                      <AlertDescription className="text-xs">
                        <span className="font-medium">Analyzed Format:</span> {analysisResult.detectedFormat}
                        {uploadedFile && ` (${uploadedFile.name})`}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* AI-Detected Attack Type */}
                  {analysisResult.isSuspicious && (
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="mb-2 text-sm font-medium text-muted-foreground">AI-Detected Attack Type</div>
                      <div className="text-2xl font-bold text-foreground">{analysisResult.attackType}</div>
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="mb-1 text-sm font-medium text-muted-foreground">Confidence Score</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{analysisResult.confidence}%</span>
                        <span className="text-sm text-muted-foreground">Accuracy</span>
                      </div>
                    </div>
                    {analysisResult.isSuspicious && (
                      <div className="rounded-lg border border-border bg-card p-4">
                        <div className="mb-1 text-sm font-medium text-muted-foreground">Risk Severity</div>
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
                    )}
                  </div>

                  <Alert>
                    <AlertDescription className="text-sm leading-relaxed">
                      {analysisResult.explanation}
                    </AlertDescription>
                  </Alert>

                  {analysisResult.mitigationSteps && analysisResult.mitigationSteps.length > 0 && (
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="mb-3 text-sm font-semibold text-foreground">
                        {analysisResult.isSuspicious
                          ? "Safety Guidelines & Mitigation Steps"
                          : "Security Best Practices"}
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

                  {/* Report Button */}
                  {analysisResult.isSuspicious && (
                    <div className="pt-2">
                      <Button onClick={handleReportIncident} className="w-full" size="lg">
                        Report this Incident to CERT
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
