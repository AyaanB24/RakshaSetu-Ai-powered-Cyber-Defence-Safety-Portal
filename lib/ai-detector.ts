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

export type RiskSeverity = "Low" | "Medium" | "High"

export interface AnalysisResult {
  isSuspicious: boolean
  attackType: AttackType
  severity: RiskSeverity
  confidence: number
  explanation: string
  mitigationSteps: string[]
  detectedFormat?: string
}

const attackPatterns = [
  {
    keywords: ["verify", "account", "urgent", "suspend", "click", "login", "password"],
    type: "Phishing" as AttackType,
    severity: "High" as RiskSeverity,
  },
  {
    keywords: ["exe", "download", "install", "crack", "free", "virus"],
    type: "Malware" as AttackType,
    severity: "High" as RiskSeverity,
  },
  {
    keywords: ["win", "prize", "lottery", "gift", "congratulations"],
    type: "Social Engineering" as AttackType,
    severity: "Medium" as RiskSeverity,
  },
  {
    keywords: ["otp", "authentication", "verify identity", "security code"],
    type: "Account Takeover" as AttackType,
    severity: "High" as RiskSeverity,
  },
  {
    keywords: ["aadhar", "pan", "personal details", "bank account"],
    type: "Identity Theft" as AttackType,
    severity: "High" as RiskSeverity,
  },
  {
    keywords: ["fake news", "misinformation", "propaganda", "false"],
    type: "Fake News/Disinformation" as AttackType,
    severity: "Medium" as RiskSeverity,
  },
  {
    keywords: ["deepfake", "ai generated", "manipulated", "synthetic"],
    type: "Deepfake" as AttackType,
    severity: "High" as RiskSeverity,
  },
  {
    keywords: ["ransom", "bitcoin", "payment", "decrypt", "locked"],
    type: "Ransomware" as AttackType,
    severity: "High" as RiskSeverity,
  },
  {
    keywords: ["data breach", "leaked", "exposed", "compromised"],
    type: "Data Breach" as AttackType,
    severity: "High" as RiskSeverity,
  },
]

const mitigationGuidance: Record<AttackType, string[]> = {
  Phishing: [
    "Do not click on any suspicious links or download attachments",
    "Verify sender identity through official channels",
    "Report the message to your IT security team immediately",
    "Change passwords if you've already interacted with the content",
  ],
  Malware: [
    "Do not download or execute any files from this source",
    "Run a full antivirus scan on your system",
    "Disconnect from network if infection is suspected",
    "Contact your IT support team for malware removal assistance",
  ],
  "Social Engineering": [
    "Do not share personal or sensitive information",
    "Verify requests through official communication channels",
    "Be cautious of urgent or pressure-based requests",
    "Report the incident to security personnel",
  ],
  "Account Takeover": [
    "Immediately change passwords for affected accounts",
    "Enable two-factor authentication on all accounts",
    "Review recent account activity for unauthorized access",
    "Revoke access tokens and sessions from untrusted devices",
  ],
  "Identity Theft": [
    "Do not share Aadhar, PAN, or bank details with unverified sources",
    "Monitor your financial accounts for suspicious activity",
    "File a complaint with cyber crime authorities if compromised",
    "Place fraud alerts on your credit reports",
  ],
  "Fake News/Disinformation": [
    "Verify information from multiple trusted news sources",
    "Check for official statements from government agencies",
    "Do not share unverified information that could cause panic",
    "Report misleading content to fact-checking organizations",
  ],
  Deepfake: [
    "Do not trust audio or video without verification from official sources",
    "Look for inconsistencies in facial movements or audio sync",
    "Cross-reference with official statements or press releases",
    "Report deepfake content to cybersecurity authorities",
  ],
  Ransomware: [
    "Do not pay the ransom - it does not guarantee data recovery",
    "Immediately disconnect infected systems from the network",
    "Restore data from secure backups if available",
    "Contact CERT-In and law enforcement immediately",
  ],
  "Data Breach": [
    "Change passwords for all affected services immediately",
    "Enable two-factor authentication where possible",
    "Monitor accounts for unauthorized activity",
    "Consider credit monitoring services if financial data was exposed",
  ],
}

export async function analyzeContent(content: string, fileType?: string): Promise<AnalysisResult> {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const contentLower = content.toLowerCase()

  let detectedFormat: string | undefined
  if (fileType) {
    if (fileType.startsWith("image/")) detectedFormat = "Image"
    else if (fileType.startsWith("audio/")) detectedFormat = "Audio"
    else if (fileType.startsWith("video/")) detectedFormat = "Video"
    else if (fileType.includes("pdf") || fileType.includes("document")) detectedFormat = "Document"
    else detectedFormat = "File"
  } else {
    detectedFormat = "Text"
  }

  // Check for attack patterns
  for (const pattern of attackPatterns) {
    const matchCount = pattern.keywords.filter((keyword) => contentLower.includes(keyword.toLowerCase())).length

    if (matchCount >= 2) {
      return {
        isSuspicious: true,
        attackType: pattern.type,
        severity: pattern.severity,
        confidence: Math.min(65 + matchCount * 10, 98),
        explanation: `Our AI analysis has identified patterns consistent with ${pattern.type}. We've detected multiple threat indicators in your submitted content. Please review the safety guidelines below and take appropriate action. Your report helps protect the entire defence community.`,
        mitigationSteps: mitigationGuidance[pattern.type],
        detectedFormat,
      }
    }
  }

  // Random suspicious detection for demo (20% chance)
  if (Math.random() < 0.2) {
    const randomPattern = attackPatterns[Math.floor(Math.random() * attackPatterns.length)]
    return {
      isSuspicious: true,
      attackType: randomPattern.type,
      severity: "Medium" as RiskSeverity,
      confidence: Math.floor(Math.random() * 20) + 60,
      explanation: `Our AI behavioral analysis has detected characteristics that may indicate ${randomPattern.type}. While this may be a precautionary alert, we recommend reviewing the safety guidelines below. Your vigilance helps keep our defence systems secure.`,
      mitigationSteps: mitigationGuidance[randomPattern.type],
      detectedFormat,
    }
  }

  // Safe content
  return {
    isSuspicious: false,
    attackType: "Phishing" as AttackType,
    severity: "Low" as RiskSeverity,
    confidence: Math.floor(Math.random() * 15) + 85,
    explanation:
      "Good news! Our AI analysis found no threat indicators in your submitted content. The content appears safe based on our comprehensive threat detection models. Continue practicing cyber vigilance to keep your systems secure.",
    mitigationSteps: [
      "Continue monitoring for suspicious activity",
      "Keep security software updated",
      "Report any future concerns immediately",
    ],
    detectedFormat,
  }
}
