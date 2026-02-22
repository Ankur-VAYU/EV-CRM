# Product Requirements Document (PRD)
## Module 5: Customer Profiles, Service Records & RSA

### 1. Introduction
**Purpose:** Manage the post-sale lifecycle, ensuring the actual vehicles remain active and issues are repaired rapidly, both in-shop (Service) and dynamically on-road (Roadside Assistance).

### 2. Objectives
- Anchor everything around a "Unified Customer Profile" preventing duplicate data.
- Track Service lifecycles distinctly across shop floors.
- Dispatch geolocated mechanics for immediate roadside emergencies.

### 3. User Personas
- **Rider (Customer):** Theoretically accesses a stripped down 'Customer' portal to view their active pass, service logs, and initiate an RSA request.
- **Serviceman / Technician:** Uses a mobile-heavy UI to update service tickets in real time, check-off tasks, and hit 'Completed' on-field during an RSA call out.
- **Admin:** Dispatches RSA to specific active servicemen.

### 4. Functional Requirements
#### 4.1 Unified Customer Base
- Single source table reading `customers`. Links natively into `sales`, `service_records`, `referrals`.

#### 4.2 Service Ticket Tracking
- Ticket routing mapping: `OPEN` -> `DIAGNOSIS` -> `CONSENT_PENDING` -> `REPAIRING` -> `TESTING` -> `HANDOVER` -> `CLOSED`.
- Hard checklists: `checklist_test_drive`, `checklist_replaced_returned` to guarantee strict mechanical safety protocols.
- "Customer Consent" digital blocker ensuring clients approve cost estimations before major tearing down. 

#### 4.3 Roadside Assistance (RSA) Dispatch
- Interactive map utility or geographic ping mapping. 
- Servicemen are marked "Dispatched" and track metrics: `dispatch_time` -> `arrival_time` -> `completion_time` via native mobile timing hits. 

### 5. UI/UX Directives
- RSA flows must be inherently responsive. Mobile technicians will navigate these interfaces identically on 6-inch screens via the "Slide-in Menu" and single-tap button increments.
