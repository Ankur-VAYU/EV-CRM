# Product Requirements Document (PRD)
## Module 4: Inventory Management System

### 1. Introduction
**Purpose:** Automate stock-keeping unit (SKU) tracing, particularly tailored for complex EV manufacturing items (e.g., individual batteries, chassis frames, spare controllers).

### 2. Objectives
- Eliminate blind spots in hardware tracking.
- Distinguish between complete vehicle stock and spare repair parts.
- Automatically trigger "Low Stock" alerts to operations staff when parts fall below safety thresholds.

### 3. User Personas
- **Inventory Manager:** Creates net-new SKUs, logs Purchase Orders (PO), and bulk updates component quantities.
- **Admin:** Broad oversight.
- **Service Technician:** Views inventory strictly to pull "Parts used" against a live Service Ticket.

### 4. Functional Requirements
#### 4.1 Granular Data Model
- Hardware specific columns: `motor_no`, `controller_no`, `chasis_no`, `unique_no`, `colour`.
- Battery specific columns: `volt`, `amp`, `warranty_duration`.

#### 4.2 Status Lifecycles
- `available` (default) vs `sold`/`used`.
- Once a sale executes, the exact SKU maps its status to `sold` preventing double-assignment to a separate customer ticket.

#### 4.3 Smart Reorder Logistics
- Logic loop comparing `quantity <= reorder_level`.
- Dashboard dynamically filters this output warning users immediately upon login indicating precisely which part needs a fresh vendor purchase order. 

### 5. Data Volume Implications
- Inventory tables grow massively. Frontend lists require memoization and eventually pagination if SKUs exceed 2,000+ entries.
