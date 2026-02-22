# Product Requirements Document (PRD)
## Module 10: Rider (Customer) Ecosystem

### 1. Introduction
**Purpose:** Function as the ultimate "Golden Record" combining demographic, vehicle, service, and administrative data attached to a singular electric-vehicle owner.

### 2. Objectives
- Merge completely decoupled data points (Sales receipts, subsequent breakdown incidents, referral success) onto a single `UnifiedCustomerProfile`.
- Track vehicle health implicitly via connected service tickets.
- Manage "Uptime Pass" subscription statuses safely.

### 3. User Personas
- **Showroom Admin:** Edits basic profile structures, phone numbers, or addresses.
- **Rider (Customer Role):** When logged in directly with `user.role === 'customer'`, they view a walled-garden dashboard strictly filtering data attached natively to their own email/phone.

### 4. Functional Requirements
#### 4.1 "Golden Record" Aggregation
- Central Component: `<UnifiedCustomerProfile />`. 
- Logic queries: Base `customers` data (Name/Phone).
- Logic `Array.filter()` sweeps: 
  - `sales` table looking for matching `vehicle_reg`.
  - `service_records` table mapping a timeline of repairs.
  - `rsa_tracking` visualizing dispatch emergencies.

#### 4.2 Subscription / Loyalty Triggers
- Checks boolean parameters indicating whether an explicit user holds an `uptime_pass_status`. 
- Verifies string logic handling `uptime_pass_expiry` dates against `Date.now()`. If it has expired, system flags profile visually indicating necessary renewal action to Sales Execs.

#### 4.3 KYC Compliance Linkage
- Securely retains `aadhar_number` and physical `address` strings pulled organically from their very first approved entry in the `pending_sales` pipeline. 
