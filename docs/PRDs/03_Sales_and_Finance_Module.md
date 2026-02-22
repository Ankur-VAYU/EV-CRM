# Product Requirements Document (PRD)
## Module 3: Sales, Finance & Accounting

### 1. Introduction
**Purpose:** Act as the definitive financial ledger for the operation. It tracks vehicle handovers, finance schedules (EMIs), down-payments, associated payouts, and systemic expenses.

### 2. Objectives
- Capture detailed vehicle metrics tied precisely to high-value cash exchanges or banking finance logs.
- Map distinct `Customer Profiles` organically upon the approval of a sale.
- Ensure strict tracking of `payments` (cash bounds) versus `expenses` (outgoing flows).

### 3. User Personas
- **Admin / Auditor:** Approves "Pending Sales", reviews comprehensive `PaymentManagement` lists ensuring cash-collected totals match physical registers.
- **Sales Executive:** Submits conditional sales parameters (cash upfront, EMI details if financed) into the pending approval flow.

### 4. Functional Requirements
#### 4.1 Pending Sales Review Hub
- An admin-exclusive table catching `/api/pending-sales` payloads.
- An "Approve" click:
  1. Writes to `sales`.
  2. Creates new Rider Profile in `customers`.
  3. Formally withdraws `-1 quantity` in the `inventory` table explicitly against the defined `vehicle_sku` or `motor_no`.
- A "Reject" click formally denies the transaction with a log.

#### 4.2 Comprehensive Sale Logging
Fields explicitly captured: 
- Hard Identifiers: `vehicle_reg`, `chasis_no`, `battery_id`, `motor_no`.
- KYC Identifiers: `aadhar_number`, address.
- Finance Identifiers: `selling_price`, `cash_upi_amount`, `finance_dp_cash`, `finance_loan_number`, `finance_bank`.

#### 4.3 Expenditure Tracking
- Separate utility capturing internal monetary leakage. 
- Form requiring `voucher_no`, `expense_type`, `given_to`, `amount`, and via `paid_by` (Cash vs UPI). 

### 5. Technical Constraints
- Absolute transactional safety. If a sale is "Approved" but an inventory update fails due to a bad SKU, the application must roll back (database transaction blocks).
- Decimal storage for financial values (Real precision in SQLite / Numeric in Postgres).
