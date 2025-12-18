"use client"

export type UserRole = "serving" | "ex-serviceman" | "dependent" | "admin"

export interface User {
  id: string
  role: UserRole
  email?: string
  name: string
  echsNo?: string
  dependentId?: string
}

export type AttackType =
  | "Phishing"
  | "Malware"
  | "Social Engineering"
  | "Account Takeover"
  | "Identity Theft"
  | "Fake News/Disinformation"
  | "Deepfake"
  | "Ransomware"
  | "Data Breach"

export type CaseStatus = "Submitted" | "Under Review" | "Resolved"

export type RiskSeverity = "Low" | "Medium" | "High"

export interface Case {
  id: string
  userId: string
  userName: string
  userRole: UserRole
  attackType: AttackType
  severity: RiskSeverity
  confidence: number
  description: string
  evidence: string[]
  status: CaseStatus
  submittedAt: Date
  updatedAt: Date
  affectedSystem?: string
  location?: string
  mitigationSteps?: string[]
}

// Global state
let currentUser: User | null = null
let cases: Case[] = []
let listeners: (() => void)[] = []

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export const store = {
  // User management
  setUser(user: User | null) {
    currentUser = user
    notifyListeners()
  },
  getUser(): User | null {
    return currentUser
  },

  // Case management
  addCase(caseData: Omit<Case, "id" | "submittedAt" | "updatedAt">) {
    const newCase: Case = {
      ...caseData,
      id: `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      submittedAt: new Date(),
      updatedAt: new Date(),
    }
    cases = [newCase, ...cases]
    notifyListeners()
    return newCase
  },

  getCases(): Case[] {
    return cases
  },

  getUserCases(userId: string): Case[] {
    return cases.filter((c) => c.userId === userId)
  },

  updateCaseStatus(caseId: string, status: CaseStatus) {
    cases = cases.map((c) => (c.id === caseId ? { ...c, status, updatedAt: new Date() } : c))
    notifyListeners()
  },

  // Subscribe to changes
  subscribe(listener: () => void) {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
}
