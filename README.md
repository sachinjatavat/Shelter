# 🍲 Surplus-To-Shelter: Unified Multi-Category Aid & Logistics Platform

> **Connecting Donors, Verified NGO Shelters, and Courier Drivers with Multi-Category Aid Matching (Food, Clothes, Blankets, Books, Medicines, Funds), Instant PhonePe UPI QR Code Donations, Live Animated GPS Route Telemetry, Interactive Analytics Hubs (Pie/Bar Charts), 1-Click WhatsApp Dispatch Alerts, & Section 80G Tax Certificates.**

![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=flat-square&logo=node.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald?style=flat-square&logo=supabase)
![Express](https://img.shields.io/badge/Express-API-blue?style=flat-square&logo=express)
![Vite](https://img.shields.io/badge/Vite-Frontend-purple?style=flat-square&logo=vite)
![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-Leaflet-blueviolet?style=flat-square)
![UPI](https://img.shields.io/badge/UPI-PhonePe%20%7C%20GPay%20%7C%20Paytm-purple?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-amber?style=flat-square)

---

## 📊 Executive Summary & Project Pitch

**Surplus-To-Shelter** is an end-to-end humanitarian rescue and logistics ecosystem that automates the collection and distribution of surplus food, winter clothing, blankets, educational books, medical first-aid supplies, and monetary relief from commercial donors and individuals to verified NGO shelters and community centers.

By integrating **multi-category aid routing**, **instant PhonePe UPI QR Code donations**, **100% free OpenStreetMap live animated GPS tracking**, **interactive pie & bar chart analytics across all portals**, **government NGO-DARPAN verification & admin appeal workflows**, **1-click WhatsApp dispatch alerts with handover PINs**, **IoT thermal cold-chain telemetry**, and automated **Section 80G Tax Deduction Certificate generation**, Surplus-To-Shelter eliminates waste, simplifies logistics, and accelerates relief delivery.

---

## 🌟 Detailed Platform Portals & Features

### 1. 🏪 Donor & Restaurant Portal
- **Multi-Category Donation Posting (`restaurant-post.html`)**: Clean, intuitive form supporting:
  - 🍲 **Fresh Cooked Meals & Food Rations**: Weight (kg), meal servings, cooking time, and dietary type.
  - 🧥 **Clothes & Footwear**: Clean winter coats, sweaters, and footwear sorted by condition.
  - 🛏️ **Thermal Blankets & Bedding**: Quilted blankets and sleeping mats.
  - 📚 **Books & Stationery**: School textbooks, storybooks, and educational supplies.
  - 🩹 **Medicines & First Aid**: OTC medicines with safety expiry and batch verification.
  - 🧼 **Hygiene Packs**: Soaps, sanitizers, dental kits, and sanitary products.
  - 💳 **Monetary Contributions & Instant UPI PhonePe QR Code**: Donors select verified beneficiary shelters and scan the dynamic PhonePe UPI QR code via PhonePe, Google Pay, Paytm, or BHIM.
- **📱 Instant PhonePe UPI QR Code Donation Rail**:
  - Embedded high-resolution PhonePe UPI QR Code (`images/donation-upi-qr.jpg`).
  - Interactive popup modal displaying dynamic amount (e.g. ₹2,500) and beneficiary name.
  - Direct 1-click payment confirmation with instant ledger entry and 80G tax receipt issuance.
- **📊 Interactive Analytics Hub (`restaurant-dashboard.html`)**:
  - Live SVG Donut / Pie Chart & Bar Graph toggle.
  - Visual breakdown across Food Rescue, Warm Clothing, Blankets, Educational Books, Medicines, and Monetary Grants.
- **Smart Recipient Matching (`restaurant-matching.html`)**: Evaluates nearby verified NGOs by distance, live capacity, and immediate necessity ranking.
- **🗺️ Live Animated GPS Route Radar**: Real-time Leaflet route map showing delivery courier van advancing along city coordinates with live ETA countdown and target shelter switching.
- **Donation History & Relief Ledger (`restaurant-history.html`, `restaurant-donations.html`)**: Complete verified relief ledger with category filters, delivery timeline, and direct UPI QR donation shortcuts.
- **Active Pickup Tracker (`restaurant-pickups.html`)**: Real-time monitoring of assigned courier drivers, live vehicle telemetry, and 1-click WhatsApp dispatch passes.
- **ESG Impact & 80G Tax Hub (`restaurant-impact.html`)**: Real-time calculation of tax deductions earned, CO₂ reduced, landfill diversion, and 1-click printable PDF 80G tax certificates.

---

### 2. 🤝 NGO & Shelter Portal (`ngo-dashboard.html`)
- **Government NGO-DARPAN Verification Status**: Real-time badge display showing Darpan ID verification (`KA/2021/0284752`), 80G status, and validity.
- **🚨 Admin Rejection & Instant Appeal Workflow**:
  - If rejected by administrators (e.g., mismatched certificate or expired Darpan registration), a high-visibility rejection alert banner appears on the NGO Dashboard.
  - Displays administrator remarks, rejection reason, and exact timestamp.
  - Includes a 1-click **"Submit Appeal & Re-verify"** action allowing the NGO to update their credentials and request priority re-review.
- **📊 Intake & Capacity Analytics Hub**: Dynamic Pie/Donut and Bar Charts detailing item distributions (Prepared Food vs. Blankets vs. Medicines) and warehouse capacity.
- **Live Aid Feed & 1-Click Claiming**: Real-time feed of available surplus batches. Locks item batches, generates a unique **Handover PIN** (e.g., `4829`), and auto-assigns driver dispatch.
- **Emergency Crisis Red Alert Broadcast**: Trigger urgent alerts for Cold Waves, Floods, or Storms to solicit immediate community supplies.

---

### 3. 🚚 Driver Courier Portal (`driver-dashboard.html`)
- **📊 Fleet Delivery & Performance Hub**: Interactive Pie/Donut and Bar Charts showing mission statuses (Completed, In Transit, Dispatched) and weekly Eco-Points earned.
- **Open Pickup Market (`driver-available.html`)**: Browse pending rescue missions with estimated pay, distance, cargo specifications, and urgency.
- **Active Mission Execution (`driver-active.html`)**: Turn-by-turn navigation monitor, live animated vehicle GPS tracking, site contact calling, and 1-click WhatsApp dispatch passes.
- **Interactive Route Guidance (`driver-route.html`)**: Live Leaflet navigation map with dynamic ETA recalculation and milestone progress HUD.
- **Earnings & Impact Hub (`driver-impact.html`, `driver-history.html`)**: Track total mission earnings, base pay, distance allowances, emergency surge bonuses, and eco-points.

---

### 4. 🛡️ Admin Command Center (`admin-dashboard.html`)
- **🏛️ NGO DARPAN Verification Governance**:
  - Review pending NGO registrations with official Darpan IDs.
  - 1-Click Approve with instant verified badge generation.
  - 1-Click Reject with structured rejection reasons (Invalid ID, Expired 80G, Unverifiable Site, Non-compliant Documentation) that instantly notify the NGO dashboard.
  - Process inbound NGO re-verification appeals with audit timestamps.
- **📊 Platform Telemetry Hub**: Full platform-wide analytics charts tracking total kg rescued, meals provided, active drivers, and relief disbursements.

---

### 5. 🗄️ Database Inspector & Dev Gateway (`db-viewer.html`)
- Live inspector to monitor Supabase Cloud PostgreSQL database tables (`users`, `donations`, `pickups`).
- One-click cache cleaner, record deletion, and test data seeder for rapid testing.

---

## 🛠️ Specialized Technical Engines

### 📱 1. Instant PhonePe UPI QR Code Rail (`images/donation-upi-qr.jpg`)
* **Zero Intermediary Fees**: Routes monetary donations directly to shelter bank accounts without gateway commission cuts.
* **Universal UPI Compatibility**: Scannable using **PhonePe**, **Google Pay**, **Paytm**, **BHIM**, or any mobile banking app.
* **Dynamic Modal Flow**: In `restaurant-post.html`, donors choosing monetary contributions are automatically presented with the high-resolution QR modal, dynamic amount display, and 1-click payment confirmation button.
* **Server Verification Webhook**: Backend API (`server/index.js`) validates orders and generates immutable receipts.

### 📈 2. Interactive Charts & Pie Analytics Engine
* **Modern Lightweight SVG Data Visualizations**: Rendered across all 4 platform portals with smooth gradients and hover cards.
* **Pie / Donut & Bar Graph Dual Mode**: Single-click toggling between radial distribution and comparative bar breakdowns.
* **Real-time Synchronization**: Dynamically updates as donations are registered, claimed, and delivered.

### 🗺️ 3. Live Animated GPS Route Map Engine (`js/maps.js`)
* **100% Free OpenStreetMap & Leaflet Integration**: Operates without Google Maps API keys or commercial billing requirements.
* **Coordinate Interpolation & Vehicle Simulation**:
  * Animates delivery courier van smoothly across real street waypoints.
  * Calculates dynamic bearing/heading angle to rotate the van marker realistically in the direction of motion.
  * Draws dual polylines: solid glowing emerald trail for traveled path and dashed trail for remaining distance.
* **Interactive Telemetry HUD**: Live speedometer (32–46 km/h), countdown ETA, and camera recenter controls.

### 📲 4. 1-Click WhatsApp & SMS Dispatch Alerts (`js/whatsapp-alerts.js`)
* **Zero-Cost Deep-Linking (`https://wa.me/?text=...`)**:
  * Role templates for **Courier Driver**, **NGO Shelter Intake Officer**, and **Donor**.
  * Embeds item specifications, donor site, arrival ETA, live route link, and **Handover PIN** (`4829`).
* **Interactive WhatsApp Modal**: Dark WhatsApp preview bubble, role switcher tabs, and clipboard copy.

### 📄 5. Section 80G Tax Certificate PDF Generator (`js/pdf-generator.js`)
* Computes Fair Market Value based on category valuation standards.
* Calculates 50% Section 80G Tax Deduction under Indian Income Tax Act, 1961.
* Generates official, print-ready digital certificates with SHA256 verification hash and certified non-profit trust seal.

---

## 📖 Comprehensive Step-by-Step Usage Guide

### Scenario A: How to Pay Monetary Donation via PhonePe UPI QR Code
1. Open the platform at `http://localhost:3000` and go to **Donor Portal** (`restaurant-post.html`).
2. Click the **Monetary Contribution** category pill (or select "Donate Money (UPI QR)").
3. Select the beneficiary shelter (e.g., *Hope Shelter & Care Center*) and specify your donation amount (e.g., *₹2,500*).
4. Click **Post Donation** (or click **Enlarge QR Code & Complete Donation**).
5. The **PhonePe UPI QR Code Modal** will immediately appear on screen.
6. Open **PhonePe**, **Google Pay**, or **Paytm** on your mobile phone, scan the QR code, and complete the UPI transfer.
7. Click **"I Have Completed Payment"** in the modal.
8. The payment is instantly recorded in the Supabase ledger, and a Section 80G Tax Receipt is generated!

### Scenario B: How an NGO Handles Rejection & Submits an Appeal
1. When an administrator rejects an NGO's verification in `admin-dashboard.html` with a reason (e.g. *Invalid NGO-DARPAN ID*), the NGO's dashboard (`ngo-dashboard.html`) immediately reflects the rejection.
2. A prominent red alert banner informs the shelter: *"Verification Request Rejected by Administrator"*, detailing the reason and date.
3. The NGO clicks **"Submit Appeal & Re-verify"**.
4. An appeal modal opens allowing them to input their updated DARPAN ID and supplementary notes.
5. Upon submission, status shifts to *"Appeal Submitted - Under Administrator Review"*, alerting the Admin Command Center for prompt re-evaluation.

### Scenario C: How a Donor Posts Multi-Category Aid & Claims 80G Tax Credit
1. Open **Post Donation** (`restaurant-post.html`) and select any category (Food, Clothes, Blankets, Books, Medicines).
2. Enter item quantity, condition, and pickup window. Click **Post Donation**.
3. Navigate to **Recipient Matching** (`restaurant-matching.html`) to view the **Live Animated GPS Route Radar** and assign an NGO.
4. Click **Confirm Dispatch** to trigger the courier assignment and 1-click WhatsApp Dispatch Pass with Handover PIN (`4829`).
5. After delivery, visit **ESG Impact** (`restaurant-impact.html`) to download your 80G tax deduction PDF certificate.

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph FRONTEND["1. Multi-Portal UI Tier"]
        R["🏪 Donor Portal<br/>(restaurant-dashboard.html, restaurant-post.html)"]
        N["🤝 NGO Shelter Portal<br/>(ngo-dashboard.html)"]
        D["🚚 Driver Courier Portal<br/>(driver-dashboard.html, driver-active.html)"]
        A["🛡️ Admin Command Center<br/>(admin-dashboard.html)"]
        DBV["🗄️ DB Inspector<br/>(db-viewer.html)"]
    end

    subgraph ENGINES["2. Specialized Platform Engines"]
        UPI["📱 PhonePe UPI QR Rail<br/>(images/donation-upi-qr.jpg)"]
        CHARTS["📊 Interactive Pie / Donut & Bar Analytics"]
        MAPS["🗺️ Leaflet / OSM GPS Route Engine"]
        WA["📲 1-Click WhatsApp Dispatch Service"]
        PDF["📄 80G Tax Receipt PDF Generator"]
        DARPAN["🏛️ NGO DARPAN Verification & Appeal Engine"]
    end

    subgraph BACKEND["3. Backend API & Persistence Tier"]
        API["⚙️ Express REST API (:5000)<br/>server/index.js"]
        DB[(🗄️ Supabase Cloud PostgreSQL)]
        LS["💾 LocalStorage Sync Cache"]
    end

    R --> UPI
    R --> CHARTS
    R --> PDF
    N --> DARPAN
    N --> CHARTS
    D --> MAPS
    D --> WA
    D --> CHARTS
    A --> DARPAN
    A --> CHARTS
    ENGINES --> API
    API --> DB
    DB --> LS
```

---

## 📁 Repository Directory Structure

```text
donate/
├── index.html                     # Central Portal Switcher & Auth Gateway
├── restaurant-dashboard.html      # Donor Main Dashboard & Analytics Hub (Pie/Bar)
├── restaurant-post.html           # Multi-Category Posting & PhonePe UPI QR Modal
├── restaurant-matching.html       # Smart Recipient Matching & Live GPS Radar
├── restaurant-donations.html      # Active Donation Manifest & UPI Quick Actions
├── restaurant-history.html        # Donor Past Donation History & 80G Receipts
├── restaurant-pickups.html        # Live Driver Dispatch & WhatsApp Pass Hub
├── restaurant-notifications.html  # Alerts & Emergency Crisis Feed
├── restaurant-impact.html         # ESG Impact Dashboard & 80G Tax Certificates
├── restaurant-settings.html       # Donor Profile & Pickup Preferences
├── ngo-dashboard.html             # NGO Intake, Darpan Verification & Appeal Hub
├── driver-dashboard.html          # Driver Active Missions & Fleet Analytics (Pie/Bar)
├── driver-available.html          # Driver Open Pickup Market
├── driver-active.html             # Live Navigation, Animated GPS Van & IoT Telemetry
├── driver-route.html              # Turn-by-Turn Mission Route Guidance
├── driver-history.html            # Driver Delivery History & Payout Log
├── driver-impact.html             # Driver Eco-Points & Community Impact Badges
├── driver-notifications.html      # Real-Time Pickups & Emergency Alerts Feed
├── driver-settings.html           # Driver Profile, Vehicle Info & Pay Preferences
├── admin-dashboard.html           # Admin Command Center, Darpan Audits & Platform Hub
├── db-viewer.html                 # Supabase & Local Database Inspector
├── images/
│   └── donation-upi-qr.jpg        # High-Resolution PhonePe UPI QR Code Asset
├── css/
│   └── animations.css             # Universal Button Motion, Radar Pulse & Transitions
├── js/
│   ├── app.js                     # Unified Multi-Portal Navigation & State Controller
│   ├── maps.js                    # Leaflet + OpenStreetMap Live Animated Route Map Engine
│   ├── search.js                  # Universal Smart Search & Verified NGO Autocomplete
│   ├── whatsapp-alerts.js         # 1-Click WhatsApp & SMS Dispatch Alerts Module
│   ├── motion.js                  # Global Interactivity & Emergency Crisis Sync
│   ├── pdf-generator.js           # 80G Tax Deduction Certificate PDF Generator
│   ├── supabase.js                # Supabase SDK Client & Local Bridge
│   ├── tutorial.js                # Interactive Platform Walkthrough & Guidance
│   └── new-user-cleaner.js        # State Sanitizer for New Test Sessions
├── server/
│   └── index.js                   # Express REST API Backend (:5000)
└── supabase/
    ├── schema.sql                 # Core PostgreSQL Database Schema
    └── migrations/
        └── 20261013_ngo_verification_system.sql  # NGO DARPAN & Appeal Verification
```

---

## 🗄️ Database Schema Summary (`supabase/schema.sql`)

- **`users`**: User profiles (`id`, `name`, `email`, `role`, `phone`, `address`, `darpan_id`, `verification_status`, `rejection_reason`).
- **`donations`**: Aid records (`id`, `title`, `category`, `donation_type`, `quantity_kg`, `portions`, `condition`, `donor_id`, `recipient_id`, `status`).
- **`pickups`**: Delivery dispatch records (`id`, `donation_id`, `driver_id`, `status`, `temp_celsius`, `seal_verified`, `pickup_time`, `delivery_time`).

---

## ⚡ Local Development & Setup

### Prerequisites
- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/sachinjatavat/sts.git
cd sts
npm install
```

### Step 2: Environment Configuration
Create or inspect `.env` in the root directory:
```env
PORT=5000
SUPABASE_URL=https://juhjxcxbrirzfppjghlj.supabase.co
SUPABASE_ANON_KEY=sb_publishable__Q6ZFUUsSS6a28VjJRCL-w_DixWn7_Y
```

### Step 3: Launch Servers
```bash
# Start Vite Frontend Dev Server (Port 3000)
npm run dev

# Start Express Backend Server (Port 5000)
npm run server
```

Open your browser at **`http://localhost:3000`**.

---

## 👥 Project Team & Credits

Developed with ❤️ for community welfare, zero-waste logistics, and transparent humanitarian relief:

- 🌟 **Sachin**
- 🌟 **Krishna**
- 🌟 **Nitesh**
- 🌟 **Priyanshi**

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.
