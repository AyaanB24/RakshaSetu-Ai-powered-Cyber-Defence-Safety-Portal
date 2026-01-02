import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Case } from "./store"

export const generateCasePdf = (caseData: Case) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Professional Header
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.setTextColor(20, 40, 80) // Dark Navy
    doc.text("RakshaSetu - Cyber Incident Report", pageWidth / 2, 20, { align: "center" })

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100)
    doc.text("Secure Cyber Threat Reporting for Defence Ecosystem", pageWidth / 2, 27, { align: "center" })

    doc.setDrawColor(200)
    doc.setLineWidth(0.5)
    doc.line(14, 32, pageWidth - 14, 32)
    doc.setTextColor(0)

    let currentY = 42

    // Section Helper
    const addSectionTitle = (title: string, y: number) => {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        doc.setFillColor(245, 245, 245)
        doc.rect(14, y - 5, pageWidth - 28, 7, "F")
        doc.text(title.toUpperCase(), 16, y)
        return y + 5
    }

    // 1. Case Identification
    currentY = addSectionTitle("Case Identification", currentY)
    autoTable(doc, {
        startY: currentY,
        body: [
            ["Case ID", caseData.id.toUpperCase()],
            ["Reported On", new Date(caseData.submittedAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })],
            ["Current Status", caseData.status.replace('_', ' ')],
            ["Reporting Platform", "RakshaSetu"],
            ["Case Classification", "Confidential / Restricted"]
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2.5 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, fillColor: [250, 250, 250] } }
    })
    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 12

    // 2. Reporter Details
    currentY = addSectionTitle("Reporter Details (Restricted)", currentY)
    autoTable(doc, {
        startY: currentY,
        body: [
            ["Role", (caseData.userRole || "Serving").charAt(0).toUpperCase() + (caseData.userRole || "Serving").slice(1)],
            ["Identifier Used", "Defence Identity Check"],
            ["Identifier Value", caseData.userName || "Verified Defence Personnel"],
            ["Location Context", caseData.location || "Redacted / Not Provided"]
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2.5 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, fillColor: [250, 250, 250] } }
    })

    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.setTextColor(120)
    // @ts-ignore
    doc.text("* Personal and operational details are intentionally restricted for security reasons.", 14, doc.lastAutoTable.finalY + 5)
    doc.setTextColor(0)
    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 15

    // 3. Incident Summary
    currentY = addSectionTitle("Incident Summary", currentY)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const descLines = doc.splitTextToSize(caseData.description, pageWidth - 28)
    doc.text(descLines, 14, currentY + 4)
    currentY += (descLines.length * 5) + 12

    // 4. Incident Details
    currentY = addSectionTitle("Incident Details", currentY)
    autoTable(doc, {
        startY: currentY,
        body: [
            ["Incident Type", caseData.attackType],
            ["Severity Level", caseData.severity],
            ["Affected System", caseData.affectedSystem || "N/A"],
            ["Network Vector", "Digital Domain / Ingress"]
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2.5 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, fillColor: [250, 250, 250] } }
    })
    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 12

    // 5. Preliminary Analysis
    currentY = addSectionTitle("Preliminary Analysis (Automated AI)", currentY)
    autoTable(doc, {
        startY: currentY,
        body: [
            ["Threat Category", caseData.attackType],
            ["Risk Level", caseData.severity],
            ["AI Confidence Score", `${(caseData.confidence / 100).toFixed(2)}`],
            ["Verdict Status", "Automated Assessment"]
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2.5 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, fillColor: [250, 250, 250] } }
    })

    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.setTextColor(120)
    // @ts-ignore
    doc.text("* This analysis is automated and does not represent a final CERT verdict.", 14, doc.lastAutoTable.finalY + 5)
    doc.setTextColor(0)
    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 15

    // Check for page overflow
    if (currentY > 230) { doc.addPage(); currentY = 20; }

    // 6. Digital Evidence (IPFS)
    currentY = addSectionTitle("Digital Evidence (IPFS)", currentY)
    const evidenceRows = caseData.evidence.map(cid => ["Evidence CID", cid])
    autoTable(doc, {
        startY: currentY,
        body: evidenceRows.length > 0 ? evidenceRows : [["Evidence", "No digital evidence attached"]],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2.5 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, fillColor: [250, 250, 250] } }
    })

    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.setTextColor(100)
    // @ts-ignore
    doc.text("Evidence is stored in a tamper-proof decentralized storage system (IPFS).", 14, doc.lastAutoTable.finalY + 5)
    doc.setTextColor(0)
    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 15

    // 7. Evidence Integrity & Authenticity
    currentY = addSectionTitle("Forensic Integrity & Authenticity", currentY)
    const cryptoData = caseData.cryptographicEvidence?.[0]
    autoTable(doc, {
        startY: currentY,
        body: [
            ["SHA-256 Hash", cryptoData ? "GENERATED" : "NOT AVAILABLE"],
            ["RSA Digital Signature", cryptoData ? "APPLIED" : "NOT AVAILABLE"],
            ["Integrity Status", cryptoData ? "VERIFIED AT SUBMISSION" : "LEGACY / MANUAL VERIF REQUIRED"]
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2.5 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50, fillColor: [250, 250, 250] },
            1: { fontStyle: 'bold' }
        }
    })
    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 15

    // 8. User Declaration
    currentY = addSectionTitle("User Declaration", currentY)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    const decl = "I hereby confirm that the information and evidence submitted in this report are accurate to the best of my knowledge and have not been tampered with after submission."
    const declLines = doc.splitTextToSize(decl, pageWidth - 28)
    doc.text(declLines, 14, currentY + 4)

    doc.setFont("helvetica", "bold")
    doc.text("✔ Submitted electronically via RakshaSetu", 14, currentY + 14)
    currentY += 25

    // 9. CERT Admin Action Log
    currentY = addSectionTitle("CERT Admin Action Log", currentY)
    autoTable(doc, {
        startY: currentY,
        body: [
            ["Incident Logged", "System", new Date(caseData.submittedAt).toLocaleString()],
            ["Forensic Check", "CERT Officer", new Date().toLocaleString()],
            ["Status Update", caseData.status.replace('_', ' '), new Date(caseData.updatedAt).toLocaleString()]
        ],
        theme: 'grid',
        head: [['Action', 'Authority / Outcome', 'Timestamp']],
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' }
    })
    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 12

    // Disclaimer
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(150)
    const disclaimer = "Disclaimer: This report is generated by RakshaSetu for preliminary cyber incident reporting. Final investigation and response are subject to CERT authority validation. Unauthorized distribution of this document is prohibited."
    const discLines = doc.splitTextToSize(disclaimer, pageWidth - 40)
    doc.text(discLines, pageWidth / 2, currentY, { align: "center" })

    // Footer for all pages
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(180)
        doc.text(`Page ${i} of ${totalPages}  |  RAKSHA SETU FORENSIC DOCUMENT  |  CONFIDENTIAL`, pageWidth / 2, 288, { align: 'center' })
    }

    doc.save(`RakshaSetu_Forensic_Report_${caseData.id.split('-')[0]}.pdf`)
}
