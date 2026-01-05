"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Shield, Mail, MessageSquare, Linkedin, Globe, CheckCircle2, Award, ArrowRight, Loader2, Instagram, Facebook, Ghost, Cpu } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const platforms = [
    { id: "Email", icon: Mail, label: "Email" },
    { id: "WhatsApp", icon: MessageSquare, label: "WhatsApp" },
    { id: "LinkedIn", icon: Linkedin, label: "LinkedIn" },
    { id: "Website", icon: Globe, label: "Website" },
    { id: "Instagram", icon: Instagram, label: "Instagram" },
    { id: "Facebook", icon: Facebook, label: "Facebook" },
    { id: "Snapchat", icon: Ghost, label: "Snapchat" },
]

const responseOptions = [
    { id: "ignore", label: "Ignore" },
    { id: "proceed", label: "Proceed without verification" },
    { id: "verify", label: "Verify authenticity" },
    { id: "share", label: "Share with others" },
]

type Step = "platform" | "generating" | "scenario" | "evaluating" | "feedback" | "completion"

export function TrainingModule() {
    const [step, setStep] = useState<Step>("platform")
    const [platform, setPlatform] = useState("")
    const [scenario, setScenario] = useState("")
    const [selectedOption, setSelectedOption] = useState("")
    const [evaluation, setEvaluation] = useState<{ feedback: string; score: number } | null>(null)
    const [loading, setLoading] = useState(false)

    const handlePlatformSelect = async (p: string) => {
        setPlatform(p)
        setStep("generating")
        setLoading(true)
        try {
            const res = await fetch("/api/training", {
                method: "POST",
                body: JSON.stringify({ action: "generate", platform: p }),
            })
            const data = await res.json()
            if (data.scenario) {
                setScenario(data.scenario)
                setStep("scenario")
            } else {
                toast.error("Failed to generate scenario. Please try again.")
                setStep("platform")
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.")
            setStep("platform")
        } finally {
            setLoading(false)
        }
    }

    const handleOptionSubmit = async () => {
        if (!selectedOption) return
        setStep("evaluating")
        setLoading(true)
        try {
            const optionLabel = responseOptions.find((o) => o.id === selectedOption)?.label || ""
            const res = await fetch("/api/training", {
                method: "POST",
                body: JSON.stringify({
                    action: "evaluate",
                    scenario,
                    selectedOption: optionLabel,
                }),
            })
            const data = await res.json()
            if (data.feedback) {
                setEvaluation(data)
                setStep("feedback")
            } else {
                toast.error("Failed to evaluate response. Please try again.")
                setStep("scenario")
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.")
            setStep("scenario")
        } finally {
            setLoading(false)
        }
    }

    const resetTraining = () => {
        setStep("platform")
        setPlatform("")
        setScenario("")
        setSelectedOption("")
        setEvaluation(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <div className="hidden sm:block">
                    <Badge variant="outline" className="px-3 py-1">Educational Only</Badge>
                </div>
            </div>

            {step === "platform" && (
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle>Step 1: Select a Platform</CardTitle>
                        <CardDescription>Choose a communication platform for the training scenario.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {platforms.map((p) => (
                            <Button
                                key={p.id}
                                variant="outline"
                                className="flex h-32 flex-col items-center justify-center gap-3 border-2 hover:border-primary hover:bg-primary/5"
                                onClick={() => handlePlatformSelect(p.id)}
                            >
                                <p.icon className="h-8 w-8 text-primary" />
                                <span>{p.label}</span>
                            </Button>
                        ))}
                    </CardContent>
                    <CardFooter className="justify-center border-t bg-muted/20 py-3">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Cpu className="h-3 w-3" />
                            Fortified by Google Gemini Intelligence
                        </p>
                    </CardFooter>
                </Card>
            )}

            {step === "generating" && (
                <Card className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-medium">Generating Scenario...</p>
                    <p className="text-sm text-muted-foreground">Our AI is crafting a realistic experience for {platform}.</p>
                </Card>
            )}

            {step === "scenario" && (
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Step 2: Scenario for {platform}
                        </CardTitle>
                        <CardDescription>Read the scenario below and choose the most appropriate action.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-lg bg-muted p-6 italic shadow-inner">
                            "{scenario}"
                        </div>
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Your Response:</Label>
                            <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="grid gap-3">
                                {responseOptions.map((o) => (
                                    <div key={o.id} className="flex items-center space-x-3 rounded-md border p-3 hover:bg-muted/50">
                                        <RadioGroupItem value={o.id} id={o.id} />
                                        <Label htmlFor={o.id} className="flex-1 cursor-pointer font-normal">
                                            {o.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="ml-auto gap-2" size="lg" disabled={!selectedOption} onClick={handleOptionSubmit}>
                            Submit Response <ArrowRight className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === "evaluating" && (
                <Card className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-medium">Evaluating Response...</p>
                    <p className="text-sm text-muted-foreground">Analyzing your choice based on awareness principles.</p>
                </Card>
            )}

            {step === "feedback" && evaluation && (
                <Card className="border-2 border-primary/20">
                    <CardHeader className="text-center">
                        <CardTitle>Step 3: Evaluation & Feedback</CardTitle>
                        <CardDescription>Here's how you performed in this scenario.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="relative flex h-32 w-32 items-center justify-center">
                                <svg className="h-full w-full rotate-[-90deg]">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="60"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        className="text-muted"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="60"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray={377}
                                        strokeDashoffset={377 - (377 * evaluation.score) / 100}
                                        className="text-primary transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold">{evaluation.score}</span>
                                    <span className="text-xs uppercase text-muted-foreground">Score</span>
                                </div>
                            </div>
                            <p className="text-xl font-semibold">
                                {evaluation.score >= 80 ? "Excellent Awareness!" : evaluation.score >= 60 ? "Good Job!" : "Learning Opportunity!"}
                            </p>
                        </div>

                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <h4 className="mb-2 font-bold text-primary">AI Evaluation</h4>
                            <p className="leading-relaxed text-muted-foreground">{evaluation.feedback}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={resetTraining}>Try Another Platform</Button>
                        <Button className="gap-2" onClick={() => setStep("completion")}>
                            Finish Training <CheckCircle2 className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === "completion" && (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                    <Card className="border-2 border-green-500/20 bg-green-50/10 text-center">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-green-700">Training Completed Successfully</CardTitle>
                            <CardDescription className="text-lg">
                                Congratulations! You've successfully completed the Cyber Awareness Training module.
                            </CardDescription>
                            <div className="mt-6 flex flex-col items-center gap-2">
                                <Badge variant="secondary" className="px-4 py-1.5 text-sm font-semibold bg-primary/10 text-primary border-primary/20">
                                    <Cpu className="mr-2 h-4 w-4" />
                                    Powered by Google Gemini
                                </Badge>
                                <p className="text-xs text-muted-foreground italic">"Your AI Sentinel in the Cyber World"</p>
                            </div>
                        </CardHeader>
                    </Card>

                    <div className="flex justify-center pt-8">
                        <Button size="lg" variant="outline" onClick={resetTraining} className="min-w-[200px]">
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
