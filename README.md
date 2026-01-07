# 🛡️ RakshaSetu  
### Secure Cyber Reporting & Awareness Platform for Defence Users

RakshaSetu is a defence-centric cyber security platform built to **protect defence personnel, veterans, and defence families** from rising cyber threats such as phishing, impersonation, honey-traps, fake welfare schemes, and identity fraud.

It provides a **trusted, priority-driven bridge between defence users and CERT authorities**, while also strengthening cyber readiness through realistic AI-based training.

---

## 🚨 Problem Statement

- Defence users are increasingly targeted by cyber adversaries using fake official messages and social engineering.
- Existing civilian cyber complaint portals are overloaded and **do not prioritize defence-linked incidents**.
- There is **no dedicated system** to securely analyze suspicious content or preserve evidence without tampering.
- Lack of practical cyber training leaves users unprepared for real-world attacks.
- CERT authorities receive delayed, unstructured, and unverifiable reports.

---

## 💡 Proposed Solution

RakshaSetu delivers a **secure, end-to-end cyber defence workflow**:

- Dedicated cyber incident reporting for defence users
- Tamper-proof evidence storage using decentralized technology
- Real-time CERT dashboard with prioritized case handling
- AI-powered cyber awareness training using Google Gemini
- Suspicious content analysis before damage occurs

---

## ✨ Core Features

### 🔐 Secure Incident Reporting
- Structured reporting for cyber incidents
- Supports text, screenshots, files, and links
- Generates a unique Case ID for tracking

### 📂 Tamper-Proof Evidence Storage
- Evidence stored on **IPFS via Filebase**
- Each file generates a **CID (Content Identifier)**
- Ensures integrity, authenticity, and non-repudiation

### 👮 CERT Authority Dashboard
- Dedicated CERT admin access
- View reports, verify evidence, update case status
- Real-time status reflection to users

### 🧠 Cyber Awareness Training (Google Gemini API)
- Generates **realistic defence-specific threat scenarios**
- Platforms covered: WhatsApp, Email, Website, LinkedIn, Instagram, SMS
- Evaluates user responses and provides:
  - Safety feedback
  - Risk score
  - Preventive guidance

### ⚠️ Suspicious Content Checker
- Users can submit suspicious messages or links
- Early identification of potential cyber threats

---

## 🧱 High-Level Architecture

User / CERT Admin
      ↓
Frontend Web Application
      ↓
Supabase (Auth + Database + Realtime)
      ↓
IPFS (Filebase) – Evidence Storage
      ↓
CERT Review & Case Management
      ↓
Google Gemini API – Training & Evaluation


---

## 🛠️ Technology Stack

### Frontend
- Next.js / React
- Tailwind CSS / ShadCN UI

### Backend & Database
- Supabase (Authentication, PostgreSQL, Realtime)

### Evidence Storage
- IPFS via Filebase (Web3 Storage)

### Google Technologies Used
- **Google Gemini API** – AI-driven cyber training & scenario evaluation
- **Google Cloud Build** – CI/CD automation for deployment

---

## 👥 User Roles

### Defence User
- Register & log in securely
- Report cyber incidents
- Upload evidence
- Track case status
- Practice cyber training

### CERT Admin
- Access defence-priority reports
- View and verify tamper-proof evidence
- Update and manage case lifecycle

---

## 🎯 Impact & Benefits

- Enables **early identification** of cyber threats
- Ensures **trusted, verifiable evidence** reaches CERT
- Improves cyber readiness through hands-on AI training
- Reduces response time with structured, prioritized reporting
- Strengthens national cyber defence posture

---

## 🚀 Project Status

✅ UI Completed  
✅ Supabase Auth & Database  
✅ Secure Reporting Flow  
✅ IPFS Evidence Storage  
✅ CERT Admin Dashboard  
✅ Google Gemini API Integration  
✅ Working Hackathon Prototype  

---

## 🏁 Hackathon Summary

RakshaSetu demonstrates how **AI + decentralized storage + secure reporting** can protect defence users from cyber threats while enabling faster, smarter CERT response — **without disturbing existing defence workflows**.

---

### 🇮🇳 Tagline
**“Protecting those who protect the nation — digitally.”**
