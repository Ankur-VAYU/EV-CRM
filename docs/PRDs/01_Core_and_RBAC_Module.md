# Product Requirements Document (PRD)
## Module 1: Core & Role-Based Access Control (RBAC) System

### 1. Introduction
**Purpose:** Establish the core infrastructure for secure entry into the Vayu Ops System. This module ensures that users are authenticated and properly authorized based on strict hierarchical operational roles.

### 2. Objectives
- Ensure secure access to the system.
- Implement granular control over what modules each user role can view, edit, delete, or create.
- Segregate operations for Super Admins, Branch Admins, Managers, and specific field workers (Technicians/Servicemen).

### 3. User Personas
- **Super Admin:** Unrestricted access to all data, configuration, system backups, and global deletion rights across all branches.
- **Admin / Branch Manager:** Access to all reports, leads, sales, inventory, and employees within assigned locations. 
- **Employee (Sales/Operations):** Restricted access; primarily views "Employee Hub", processes their assigned Tasks, clocks attendance, handles allocated Leads, and creates conditional Sales entries.
- **Serviceman / Technician:** Strict access to specific modules (Service Records & RSA tracking) heavily focused on mobile interaction flows.

### 4. Functional Requirements
#### 4.1 Authentication Flow
- E-Mail & Password based authentication logic.
- Upon successful authentication, payload generates `vayu_session` and mapped `vayu_permissions` mapped into `localStorage`.
- "Remember Me" utility handling.

#### 4.2 RBAC Matrix Management
- Interface enabling Super Admins to toggle access matrices (Checkboxes: View, Edit, Delete) across the 15+ sub-modules dynamically linked to roles (not directly to users).
- Changes to the RBAC matrix auto-syncs without requiring session resets.

#### 4.3 Sidebar & Routing Segregation
- The Navigation Sidebar dynamically mounts tabs based on verified permissions. If a technician lacks `leads: { view: true }`, the Lead tab explicitly unmounts from the DOM entirely.
- Fallback route handling (unauthorized URL hits kick back to `/dashboard`).

### 5. Non-Functional Requirements
- **Security:** State is not trusted exclusively on the frontend. The backend validates actions checking the `role` attached to the user against sensitive `.run()` or `.all()` executions.
- **Auditing:** All major user role changes, log-ins, and permission adjustments log to an `audit_logs` SQL table.
