"use client"

import { UserShell } from "@/components/user-shell"
import { TrainingModule } from "@/components/training-module"
import { Badge } from "@/components/ui/badge"
import { Cpu, BookOpen, Target, Zap, ShieldCheck } from "lucide-react"

export default function TrainingPage() {
    return (
        <UserShell>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
                            Cyber Awareness <span className="text-primary underline decoration-primary/30">Training</span>
                        </h1>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 px-2 py-0">
                                <Cpu className="mr-1 h-3 w-3" />
                                Intelligence by Google Gemini
                            </Badge>
                            <span className="text-xs text-muted-foreground">— Sharp. Precise. Safe.</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Training Module */}
                    <div className="lg:col-span-2">
                        <TrainingModule />
                    </div>

                    {/* Supplementary Information */}
                    <div className="space-y-6">
                        {/* How it Works Section */}
                        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2 border-b border-border pb-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold text-foreground">How it Works</h2>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { step: 1, title: "Pick Your Platform", desc: "Choose WhatsApp, Email, or SMS simulator." },
                                    { step: 2, title: "Analyze Scenario", desc: "AI generates a realistic, high-risk cyber threat." },
                                    { step: 3, title: "Take Action", desc: "Decide whether to report, block, or ignore." },
                                    { step: 4, title: "Instant Feedback", desc: "Get detailed analysis of your response from Gemini." }
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-3">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Why This Training? Section */}
                        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2 border-b border-border pb-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold text-foreground">Why This Training?</h2>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    { icon: Zap, text: "Risk-Free Practice in simulated environments." },
                                    { icon: Target, text: "AI-Driven Scenarios tailored for Defence personnel." },
                                    { icon: Cpu, text: "Precision Evaluation powered by Google Gemini AI." }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <span className="text-xs text-muted-foreground">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </UserShell>
    )
}
