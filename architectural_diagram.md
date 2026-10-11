# 🏗️ Surplus-To-Shelter — System Architecture & Design Specification

![Surplus-To-Shelter System Architecture Diagram](file:///C:/Users/sachi/.gemini/antigravity-ide/brain/c73e6a3e-ee12-4de6-921a-87478ee68cf6/system_architecture_diagram_1790310270538.jpg)

---

## 1. High-Level System Architecture Diagram

```mermaid
flowchart TB
    subgraph Client_Layer ["Client & Role Portals (HTML5 / Vanilla JS / Tailwind CSS)"]
        direction LR
        AUTH["🔐 Auth & Landing Page<br/>(index.html)"]
        REST["🏪 Restaurant Portal<br/>(restaurant-dashboard.html<br/>restaurant-post.html)"]
        NGO["🤝 NGO / Shelter Portal<br/>(ngo-dashboard.html)"]
        DRIVER["🚚 Driver Courier Portal<br/>(driver-dashboard.html<br/>driver-active.html)"]
        DBV["🗄️ DB Inspector<br/>(db-viewer.html)"]
    end

    subgraph Client_SDK ["Client Service & Sync Layer"]
        SDK["js/supabase.js<br/>(Supabase Service SDK)"]
        MOTION["js/motion.js<br/>(UI Motion & Header Sync)"]
        LS["localStorage<br/>(Client Cache & Event Bus)"]
    end

    subgraph Backend_Layer ["Backend API Server (Node.js / Express - Port 5000)"]
        API["Express App Router<br/>(server/index.js)"]
        
        subgraph Services ["Backend Core Services"]
            AUTH_SRV["Auth Service"]
            MATCH_ENG["Algorithmic NGO Matcher"]
            EXP_ENG["Expiry Protection Engine"]
            REASSIGN_ENG["Driver Reassignment Engine"]
            QR_ENG["QR Verification Engine"]
        end

        MEM_DB[("In-Memory State Fallback<br/>(memoryDb)")]
    end

    subgraph Database_Layer ["Persistence Layer (Supabase PostgreSQL / Cloud DB)"]
        SUPA[("Supabase PostgreSQL DB")]
        
        T_USERS["public.users"]
        T_DON["public.donations"]
        T_NGO["public.ngos"]
        T_PU["public.pickups"]
        T_QR["public.qr_verification_logs"]
        T_IMP["public.impact_logs"]
    end

    %% Client Interactions
    REST -->|"Post Donation / Crisis Broadcast"| SDK
    NGO -->|"Claim Food / Confirm Receipt"| SDK
    DRIVER -->|"Accept Pickup / Verify QR"| SDK
    AUTH -->|"Login / Register"| SDK
    DBV -->|"Inspect Database"| SDK

    %% Client SDK to LocalStorage & Express
    SDK <-->|"3-Tier Sync & Offline Cache"| LS
    SDK -->|"HTTP / REST API Calls"| API
    MOTION <-->|"Header UI Sync & Events"| LS

    %% Backend Router Internal Connections
    API --> AUTH_SRV
    API --> MATCH_ENG
    API --> EXP_ENG
    API --> REASSIGN_ENG
    API --> QR_ENG

    AUTH_SRV <--> MEM_DB
    MATCH_ENG <--> MEM_DB
    EXP_ENG <--> MEM_DB
    REASSIGN_ENG <--> MEM_DB
    QR_ENG <--> MEM_DB

    %% Backend to Database
    API <-->|"SQL Queries & RPC"| SUPA
    SUPA --- T_USERS
    SUPA --- T_DON
    SUPA --- T_NGO
    SUPA --- T_PU
    SUPA --- T_QR
    SUPA --- T_IMP
```

---

## 2. 3-Tier Sync & Event Synchronization Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Restaurant as 🏪 Restaurant Partner
    participant Portal as Client Browser UI
    participant SDK as Client SDK (js/supabase.js)
    participant LocalCache as LocalStorage & Window Events
    participant ExpressAPI as Express Backend API (Port 5000)
    participant PostgreSQL as Supabase PostgreSQL

    Restaurant->>Portal: Submit New Donation ("Choco", 20kg)
    Portal->>SDK: SupabaseService.createDonation(data)
    SDK->>LocalCache: saveLocalDonation() [Store in local_donations]
    SDK->>ExpressAPI: POST /api/donations
    
    alt Express Server Online
        ExpressAPI->>ExpressAPI: Execute Algorithmic NGO Auto-Matcher
        ExpressAPI->>PostgreSQL: INSERT INTO public.donations
        PostgreSQL-->>ExpressAPI: Return Saved Record + NGO Match Score
        ExpressAPI-->>SDK: { success: true, donation, match }
    else Offline / Fallback Mode
        ExpressAPI--xSDK: Connection Timeout
        SDK->>SDK: Fall back to local object creation
    end

    SDK->>LocalCache: Dispatch 'storage' and 'profileUpdated' events
    LocalCache-->>Portal: NGO & Driver Portals auto-poll & update UI instantly
```

---

## 3. End-to-End Food Rescue Lifecycle Workflow

```mermaid
flowchart TD
    A["1. Restaurant Posts Food<br/>(quantity, category, expiry window)"] --> B{"2. Expiry Protection Check"}
    B -- "Expired (0m remaining)" --> C["🛑 SAFETY BLOCKED<br/>(Donation Marked EXPIRED)"]
    B -- "Valid (Usable Window)" --> D["3. Algorithmic NGO Matcher"]
    
    D -->|"Distance + Capacity + Category"| E["4. Highest Match Assigned<br/>(e.g., Hope Shelter - Score: 94%)"]
    E --> F["5. NGO Claims / Accepts Food"]
    
    F --> G["6. Driver Dispatch System"]
    G --> H{"7. Driver Status"}
    
    H -- "Driver Cancels" --> I["⚡ Auto Driver Reassignment<br/>(Next Nearest Courier Assigned)"]
    I --> J["8. Driver Arrives at Kitchen"]
    H -- "Driver Accepts" --> J
    
    J --> K["9. Pickup Verification<br/>(PIN / QR Code Handover)"]
    K --> L["10. In-Transit GPS Tracking"]
    L --> M["11. Delivery at Shelter"]
    M --> N["12. NGO Receipt Verification & Weight Check"]
    N --> O["🎉 Rescued & Added to Inventory<br/>(CO2 & Impact Metrics Updated)"]
```

---

## 4. Key Subsystem Components

| Component | Responsibility | Primary Files |
| :--- | :--- | :--- |
| **Auth & Profile Management** | User registration, role-based login (Restaurant/NGO/Driver), dynamic user profile name synchronization across headers without touching sidebars. | [`index.html`](file:///c:/Users/sachi/OneDrive/Desktop/Shelter/index.html), [`js/motion.js`](file:///c:/Users/sachi/OneDrive/Desktop/Shelter/js/motion.js) |
| **Donation Engine** | Posting surplus food, calculating remaining expiry timers, urgency badges, and managing donation lifecycles. | [`restaurant-post.html`](file:///c:/Users/sachi/OneDrive/Desktop/Shelter/restaurant-post.html), [`js/supabase.js`](file:///c:/Users/sachi/OneDrive/Desktop/Shelter/js/supabase.js) |
| **Algorithmic NGO Matcher** | Computes match scores (0-100%) evaluating distance (Haversine formula), shelter capacity buffer, accepted food categories, and expiry urgency. | [`server/index.js`](file:///c:/Users/sachi/OneDrive/Desktop/Shelter/server/index.js) (`/api/donations/auto-match`) |
| **NGO Intake & Logistics** | Dynamic rendering of available surplus queue, live tracking of incoming active delivery couriers, single-click food receipt verification, emergency crisis alert broadcast. | [`ngo-dashboard.html`](file:///c:/Users/sachi/OneDrive/Desktop/Shelter/ngo-dashboard.html) |
| **Driver Dispatch & Verification** | Courier queue dispatch, turn-by-turn route visualizer, automated fallback reassignment on cancellation, dual QR code scanning verification. | [`driver-dashboard.html`](file:///c:/Users/sachi/OneDrive/Desktop/Shelter/driver-dashboard.html), [`driver-active.html`](file:///c:/Users/sachi/OneDrive/Desktop/Shelter/driver-active.html) |
| **Database Inspector** | Live inspection of Supabase PostgreSQL tables and local memory stores. | [`db-viewer.html`](file:///c:/Users/sachi/OneDrive/Desktop/Shelter/db-viewer.html) |

---

## 5. Database Schema & Data Models

```mermaid
erDiagram
    USERS ||--o{ DONATIONS : posts
    USERS ||--o{ PICKUPS : drives
    NGOS ||--o{ DONATIONS : receives
    DONATIONS ||--o| PICKUPS : requires
    DONATIONS ||--o{ QR_VERIFICATIONS : generates
    DONATIONS ||--o{ REASSIGNMENTS : triggers

    USERS {
        uuid id PK
        string email
        string name
        string role
        string phone
        string address
        float lat
        float lng
    }

    NGOS {
        uuid id PK
        string name
        float capacity_kg
        float current_load_kg
        string_array accepted_categories
        float lat
        float lng
    }

    DONATIONS {
        string id PK
        string title
        string category
        float quantity_kg
        int portions
        string donor_name
        string recipient_ngo
        string driver_name
        string status
        int match_score
        int expiry_minutes
        timestamp created_at
    }

    PICKUPS {
        string id PK
        string donation_id FK
        string driver_name
        string vehicle_number
        int eta_minutes
        string status
    }

    QR_VERIFICATIONS {
        string id PK
        string donation_id FK
        string token
        string type
        boolean verified
        timestamp verified_at
    }
```
