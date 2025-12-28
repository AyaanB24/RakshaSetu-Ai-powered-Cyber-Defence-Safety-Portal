import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Case } from "./store"

export const generateCasePdf = (caseData: Case) => {
    const doc = new jsPDF()

    // --- Header ---
    doc.setFillColor(34, 197, 94) // Primary color (green-500 equivalent)
    doc.rect(0, 0, 210, 20, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("RakshaSetu - CERT Incident Report", 14, 13)

    doc.setTextColor(0, 0, 0)

    // --- Case Meta Info ---
    const startY = 30
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, startY)

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`CASE ID: ${caseData.id}`, 14, startY + 10)

    // Status Badge-like repr
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Status: ${caseData.status}`, 14, startY + 16)
    doc.text(`Submitted By: ${caseData.userName} (${caseData.userRole})`, 14, startY + 22)
    doc.text(`Date: ${new Date(caseData.submittedAt).toLocaleDateString()}`, 14, startY + 28)

    // --- Assessment Table ---
    const tableStartY = startY + 35

    autoTable(doc, {
        startY: tableStartY,
        head: [['AI Threat Assessment', 'Details']],
        body: [
            ['Attack Type', caseData.attackType],
            ['Risk Severity', caseData.severity],
            ['Confidence Score', `${caseData.confidence}%`],
            ['Affected System', caseData.affectedSystem || 'N/A'],
            ['Generic Location', caseData.location || 'N/A']
        ],
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66] },
    })

    // --- Description ---
    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 10

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Incident Description:", 14, finalY)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const descLines = doc.splitTextToSize(caseData.description, 180)
    doc.text(descLines, 14, finalY + 7)

    finalY += 7 + (descLines.length * 5) + 5

    // --- Evidence ---
    if (caseData.evidence.length > 0) {
        autoTable(doc, {
            startY: finalY,
            head: [['Evidence Files']],
            body: caseData.evidence.map(f => [f]),
            theme: 'plain',
        })
        // @ts-ignore
        finalY = doc.lastAutoTable.finalY + 10
    }

    // --- Mitigation Steps ---
    if (caseData.mitigationSteps && caseData.mitigationSteps.length > 0) {
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("Recommended Mitigation Steps:", 14, finalY)

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        let stepY = finalY + 7
        caseData.mitigationSteps.forEach((step, i) => {
            const stepText = `${i + 1}. ${step}`
            const lines = doc.splitTextToSize(stepText, 180)
            doc.text(lines, 14, stepY)
            stepY += (lines.length * 5) + 2
        })
    }

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text('Official RakshaSetu CERT Document - Confidential', 105, 290, { align: 'center' })
    }

    doc.save(`RakshaSetu_Report_${caseData.id}.pdf`)
}
