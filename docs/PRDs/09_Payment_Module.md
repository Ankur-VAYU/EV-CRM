# Product Requirements Document (PRD)
## Module 9: Payments & Expense Module

### 1. Introduction
**Purpose:** Guarantee a mathematically precise accounting trail of all incoming cash flows (Sales) and outgoing leakage (Expenditures). 

### 2. Objectives
- Consolidate incoming capital via dual-channels (Physical Cash / Digital UPI).
- Provide an auditing trail mapping who collected the money securely.
- Control outgoing vendor payments or operational purchases.

### 3. User Personas
- **Finance Manager / Admin:** The sole authority for approving payouts and reconciling the daily 'Cash Register' closing amounts against digital logs.
- **Sales Executive:** Accepts customer transaction, forcing them to declare precisely *who* collected it and *how* (Cash vs UPI).

### 4. Functional Requirements
#### 4.1 Incoming Ledger (`payments` table)
- Hard links to a `sale_no`.
- Requires precise declaration: `amount`, `payment_mode` (Cash/UPI/Finance Bank Transfer).
- **Security Control Log:** Tracks `collected_by` (Logged-in employee name/email) and `cash_by_whom`.

#### 4.2 Outgoing Ledger (`expenses` table)
- Standardized form capturing: `voucher_no`, `associated_no` (if linked to a specific Service Ticket), `expense_type`.
- Requires declaration of `paid_by` (Employee Name), `given_to` (Vendor), and `paid_via` (Cash/UPI).

#### 4.3 Daily Reconciliation Metrics
- Total Income vs Total Expense dashboards mapping the net flow logically.
- Filters enabling views restricted exactly strictly by day `.toISOString().split('T')[0]`, or by Showroom Branch (`showroom`).
