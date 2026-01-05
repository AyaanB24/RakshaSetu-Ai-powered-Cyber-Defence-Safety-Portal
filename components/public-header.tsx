"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Menu, X } from "lucide-react"

interface PublicHeaderProps {
    activePage?: "login" | "signup" | "landing"
}

export function PublicHeader({ activePage }: PublicHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 md:gap-3 transition-opacity hover:opacity-90">
                    <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    <span className="text-lg md:text-xl font-bold tracking-tight text-foreground">RakshaSetu</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-3">
                    {activePage !== "login" && (
                        <Link href="/login">
                            <Button size="sm" variant="ghost" className="text-sm font-medium">
                                Login
                            </Button>
                        </Link>
                    )}
                    {activePage !== "signup" && (
                        <Link href="/signup">
                            <Button size="sm" className="text-sm shadow-md">
                                Sign Up
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Trigger */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Mobile Nav Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-x-0 top-16 z-40 border-b border-border bg-card p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200 md:hidden">
                    <div className="flex flex-col gap-4">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant={activePage === "login" ? "default" : "outline"} className="w-full justify-center py-6 text-base font-semibold">
                                {activePage === "login" ? "Login (Active)" : "Existing User Login"}
                            </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant={activePage === "signup" ? "default" : "outline"} className="w-full justify-center py-6 text-base font-semibold shadow-lg">
                                {activePage === "signup" ? "Sign Up (Active)" : "Create New Account"}
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    )
}
