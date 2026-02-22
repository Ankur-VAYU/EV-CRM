# Product Requirements Document (PRD)
## Module 2: CRM & Lead Management

### 1. Introduction
**Purpose:** Create a centralized CRM funnel optimizing the lifecycle of prospective electric vehicle buyers from initial raw entry to converted customer state.

### 2. Objectives
- Capture prospective leads via organic entry or public Lead Forms (`/fill-lead`).
- Move leads seamlessly through specific pipeline stages: New -> Contacted -> Test Drive -> Negotiating -> Converted.
- Guarantee active follow-ups mapped heavily through automated "Next Call Date" prompts. 

### 3. User Personas
- **Admin:** Monitors the complete pipeline, re-assigns dormant leads to newer salespeople, views total conversion analytics.
- **Sales Executive:** Interacts exclusively with leads assigned to them. Triggers daily tasks off "Follow-ups Due Today". 

### 4. Functional Requirements
#### 4.1 Public Webhook / Form Entry 
- An external unauthenticated route allowing public marketing funnels or on-ground marketing teams to push "Raw Leads" straight into the DB.

#### 4.2 Pipeline Management Board
- Visual tabular/Kanban architecture displaying a lead's name, dedicated showroom location, phone, and source (e.g., Organic, Facebook ads).
- Ability to shift status dynamically.

#### 4.3 Activity Notes & Communication Log
- Distinct sub-table (`lead_notes`) attached to every primary lead. 
- Salespeople input short logs (e.g., "Customer wants to delay till Diwali") which append forever with accurate `created_at` timestamp.

#### 4.4 Conversion Protocol
- Converted leads do not map to "Sales" directly.
- The system must require the salesperson to initiate a "Convert to Sale" sequence -> prompts financial metrics -> queues it into `pending_sales` requiring Admin explicit approval to turn it into an official asset transfer.

### 5. Technical Stack Implications
- Heavy reliance on rapid updates. Zustands array splicing ensures visually fluid movement when changing statuses without server waiting visual lag.
- Queries primarily use inner joins against `employees` to map `assigned_to` accurately.
