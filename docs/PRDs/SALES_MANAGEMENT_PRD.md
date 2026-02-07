# PRD: Sales Management (POS)

## 1. Overview
The Sales Management module handles the finalization of a deal, recording customer details, vehicle allocation, and payment collection.

## 2. Key Features
- **Conversion from Lead**: Seamlessly pull data from the Lead module to avoid double entry.
- **Vehicle Allocation**: Select a specific SKU from the active Inventory.
- **Payment Split**: Support for Cash, UPI, and Finance. Detailed tracking of Cash/UPI breakdown.
- **Financial Breakdown**: Automated calculation of Down Payment, Loan Amount (for Finance), and EMI schedules.
- **Customer Profiling**: Automatically creates a "Rider Profile" upon sale completion.

## 3. Data Requirements
- Vehicle Registration Number
- Customer Aadhar & Address
- Salesperson Attribution
- Payment Mode & Date

## 4. Business Logic
- **Inventory Check**: A sale cannot be completed if the selected SKU is not marked as 'available'.
- **Payment Validation**: Total collected amounts (Cash + UPI or Down Payment + Loan) must match the Selling Price.
