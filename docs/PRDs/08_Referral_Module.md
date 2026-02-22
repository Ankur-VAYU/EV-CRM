# Product Requirements Document (PRD)
## Module 8: Referral Network Module

### 1. Introduction
**Purpose:** Build an organic marketing loop capitalizing on post-sale customer satisfaction by monetarily incentivizing them to refer new leads.

### 2. Objectives
- Generate dynamic, unique Referral Codes per customer immediately upon their initial vehicle purchase.
- Track incoming referral redemptions specifically linked against these codes.
- Manage and document monetary payouts related to successful referrals.

### 3. User Personas
- **Customer (Referrer):** Locates their `referral_code` in their Rider Profile to hand out.
- **Sales Executive:** Enters the `referral_code` accurately during a totally new sale approval process.
- **Admin/Finance:** Disperses the default `referral_amount` to the original customer after reviewing the successful referral ledger.

### 4. Functional Requirements
#### 4.1 Code Generation Engine
- Automatically maps a unique 6-8 alphanumeric string when a Sale successfully writes a target row in `customers`. The column `referral_code UNIQUE` ensures no overlapping.

#### 4.2 Redemption Lifecycle
- The `Sales` module captures `referral` (referencing the original string).
- Upon approval of that sale, the system checks `referrals` network for a matching code.
- Registers a "Success" flag indicating the original customer is now owed the predefined `referral_amount` (Default: ₹500, configurable).

#### 4.3 Financial Distribution Tracking
- Ledger visualizing `Name`, `Phone`, `Address`, `Pan No`, `Aadhar No` alongside their outstanding owed referral balances.
- Future versions must support an explicit `Payout Action` linking the expenditure inherently into the `Expenses` module (Module 3.3).
