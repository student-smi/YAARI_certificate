# CertiForge — The Modern Bulk Certificate Infrastructure SaaS

> **Design once. Upload your recipient data. Generate hundreds of professional certificates in minutes.**

CertiForge is a production-ready, high-performance SaaS web application built with an original brand identity, luxury typography, vector-accurate PDF generation, and public cryptographic QR verification.

---

## 🌟 Key Architecture & Features

### 1. 🎨 Drag & Drop Certificate Studio
- **Two Editing Modes:**
  - **Simple Mode:** Designed for beginners, exposing core fields: Recipient Name, Program/Course, Issue Date, Logo, Signatures, and QR code.
  - **Advanced Mode:** Full fine-grain positioning coordinates (X/Y percentages), layer ordering (Z-Index), font families, font weights, letter spacing, line height, borders, and custom divider lines.
- **Dynamic Variable System:** Auto-replaces placeholders like `{{name}}`, `{{course}}`, `{{date}}`, `{{certificate_id}}`, and `{{organization}}`.
- **Autosave Engine:** Instant persistence with reactive state synchronization and status indicators (*Saved*, *Saving...*).
- **Interactive Live Test Preview:** Renders 300 DPI vector mockups directly in-app.

### 2. 📊 Excel & CSV Bulk Data Pipeline
- **Formats Supported:** `.xlsx`, `.xls`, and `.csv`.
- **Intelligent Heuristic Column Matcher:** Automatically detects and pairs column headers (e.g. *"Student Name"* or *"Participant"* ➔ `{{name}}`).
- **Data Validation & Sanitization:** Detects empty rows, duplicate certificate IDs, and malformed email addresses before generation.
- **1-Click Sample File Generator:** Built-in *"Download Sample Excel"* button produces a pre-formatted spreadsheet.

### 3. ⚡ High-Speed Bulk Generation Engine
- **Non-blocking Asynchronous Batching:** Processes batches (10 to 25,000+ certificates) smoothly without browser freezing.
- **Vector 300 DPI Print Quality:** Built using jsPDF with authentic borders (Double Metallic Gold, Diplomatic Navy, Tech Emerald), signature scripts, and seal emblems.
- **Output Packaging:**
  - **Download ZIP Archive:** Organized structure (`CERT-001_Aarav_Patel.pdf`, etc.) with manifest JSON.
  - **Single Sample PDF Export:** Download individual certificates with 1 click.

### 4. 🛡️ Public Cryptographic QR Verification Portal
- **Scannable QR Codes:** Every certificate contains an auto-generated high-density QR code targeting `/verify/{certificate_id}`.
- **Public Credential Page:** `/verify` and hash-routed `#verify/CERT-...` displaying the verified badge, candidate name, program, issuer authority, and issue date.

### 5. 📧 Email Delivery Simulator
- Send individualized certificate attachments directly to recipient inboxes.
- Dynamic email body templates with candidate placeholders, reply-to configuration, and real-time delivery tracking counters (*Sent*, *Delivered*, *Bounced*).

### 6. 💳 SaaS Billing & Razorpay Integration
- **Configurable Pricing:** Tiers (**Free**, **Starter**, **Pro**, **Business**) editable in real-time from the **Admin Pricing Configurator** in Settings.
- **Razorpay Sandbox Simulation:** Test UPI/VPA, Card, and NetBanking payments with order ID generation and instant plan activation.
- **Live Usage Gauges:** Tracks monthly certificate quotas, storage, and email credits with proactive upgrade alerts.

### 7. 🔌 Developer REST API & White-Labeling
- Dedicated **API & Dev Playground** with instant API key creation and code examples in **cURL**, **Node.js**, and **Python**.
- Custom verification domain and white-label branding toggles.

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

Dev server default URL: `http://127.0.0.1:5173/`
