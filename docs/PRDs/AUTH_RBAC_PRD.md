# PRD: Auth & Role-Based Access Control (RBAC)

## 1. Overview
Ensures the security of the VAYU Ops system by managing user identities and granular permissions.

## 2. Roles & Permissions
- **Super Admin**: Master access. Can manage other Admins, approve accounts, and view all financial data.
- **Admin**: Full management of leads, sales, and inventory. Cannot delete other Admins.
- **Employee**: Daily operations (Add Leads, Inventory update, Service Entry). Cannot view P&L or delete records.
- **Technician**: Access restricted to Service module.
- **Customer (Rider)**: Read-only access to their own vehicle history via Mobile Login.

## 3. Security Features
- **Admin Approval**: All new signups are `pending` by default. An Admin must approve the account before login is possible.
- **Audit Logs**: Every login and critical action (Price change, Deletion) is timestamped and recorded.
- **Audit Table**: `audit_logs` keeps track of `action`, `performed_by`, and `timestamp`.
