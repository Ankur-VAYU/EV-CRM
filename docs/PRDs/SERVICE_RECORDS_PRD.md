# PRD: Service Records & Job Cards

## 1. Overview
Manages post-sale operations, including routine maintenance, repairs, and warranty claims.

## 2. Key Features
- **Job Card Creation**: Log a vehicle's arrival, reported problems, and assigned technician.
- **Parts & Labor Integration**: Select parts from inventory and track technician time.
- **Detailed Payment Collection**:
    - **Split Payments**: Collect parts/labor charges via Cash and UPI.
    - **UPI Account Selection**: Track which bank account (Main/Staff) received the UPI payment.
- **Service History**: Maintain a permanent timeline for every vehicle registration.
- **Automatic Status Sync**: Move from `OPEN` -> `DIAGNOSIS` -> `REPAIRING` -> `CLOSED`.

## 3. Financial Flow
- Service revenue is calculated as `Parts Charge + Labor Charge`.
- Upon closing, a transaction record is created in the `payments` table.
