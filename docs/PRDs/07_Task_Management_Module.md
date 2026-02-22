# Product Requirements Document (PRD)
## Module 7: Task Management Module

### 1. Introduction
**Purpose:** Provide structured, accountable, and transparent delegation of internal company operations and follow-ups.

### 2. Objectives
- Enable any permitted user (Admin to Employee) to delegate actionable items across the organization.
- Keep strict tracking on Turnaround Times (TAT) and concrete Due Dates.
- Enable transparent conversation inside tasks via inline Feedback parameters.

### 3. User Personas
- **Task Assigner (Admin/Manager):** Creates, delegates, monitors task progression, and receives completion notifications.
- **Task Assignee (Employee):** Locates tasks in their dashboard Hub. Hits `In Progress` / `Done` and occasionally updates notes against obstacles.

### 4. Functional Requirements
#### 4.1 Delegation Subsystem
- Form capturing: `Title`, `Description`, `Assigned_To` (Dropdown connected to `employees` database list), `Due_Date` (Calendar block), and `Expected_TAT` (Natural language string, e.g., "48 hours").
- All parameters sync as discrete columns in the `tasks` SQLite table.

#### 4.2 Status State Machine
- Strict boolean looping UI: `Todo` -> `In Progress` -> `Done`.
- Toggling is performed via minimal UI components (Lucide React icons turning from Grey -> Amber -> Green) ensuring single-click actionability.

#### 4.3 Notification Engine
- Event Hooks: If an assignee changes status to `Done`, or if the Assigner adjusts the `Due_Date`/`Expected_TAT` forward.
- Backend intercepts the `PUT /api/tasks/:id` call.
- Synthesizes `INSERT INTO notifications` containing formatted string templates alerting the relevant party.
- Header `<Bell />` component continuously tracks `<Array>.filter(n => !n.is_read)`.

#### 4.4 Inline Feedback Saving Protocol
- Distinct `<textarea>` block injected onto individual Task cards.
- Actively attached to an `onBlur` Javascript listener. When user clicks outside the box, it seamlessly executes `updateTask()` pushing payload to server without needing an explicit "Save" button to prevent data loss. 
