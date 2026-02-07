# PRD: Lead Management (CRM)

## 1. Overview
The Lead Management module is designed to capture, track, and convert potential customers (leads) for VAYU EV Scooters. It serves as the top of the funnel for the business operations.

## 2. Target Audience
- Sales Managers
- Showroom Staff
- Admins

## 3. Key Features
- **Lead Capture**: Form to add leads with Name, Phone (10 digits verified), Showroom, and Source (Walk-in, Referral, etc.).
- **Pipeline Tracking**: status-based workflow: `New` -> `Contacted` -> `Test Ride` -> `Converted` -> `Lost`.
- **Duplicate Prevention**: Backend check to ensure a phone number isn't registered twice in the active pipeline.
- **Bulk Operations**: Ability to upload CSVs of leads and bulk-assign them to staff.
- **Notes & History**: Log chronological interactions with each lead.

## 4. User Flow
1. Staff adds a lead via the "Add Lead" button.
2. Lead appears in the "Lead Management" list.
3. Staff updates status as the customer progresses (e.g., after a test ride).
4. Admin/Staff converts a lead to a Sale (triggers the Sales module).

## 5. Success Metrics
- Average time from "New" to "Converted".
- Lead-to-Sale Conversion Ratio.
- Showroom-wise lead performance.
