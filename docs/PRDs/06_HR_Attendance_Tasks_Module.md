# Product Requirements Document (PRD)
## Module 6: HR Hub, Tasks & Internal Operations

### 1. Introduction
**Purpose:** Optimize internal human resources through geofenced time-tracking, rigid personal task accountability, and a comprehensive Employee Hub interfacing natively.

### 2. Objectives
- Digitally log attendance utilizing modern hardware verification mapping (Webcams & GPS).
- Prevent operations gaps via explicit task assignments featuring strict turnaround limits.
- Incentivize lead follow-through using a focused "Employee view."

### 3. User Personas
- **Employee:** Uses this module sequentially every morning (Clock in -> Check Tasks -> Follow-up Leads -> Clock Out).
- **Admin:** Uses this to build the broader operational engine (Creates Tasks -> Audits location histories for fake attendance).

### 4. Functional Requirements
#### 4.1 Live Attendance Gate
- "Clock In" button intercepts the sequence. It demands HTML5 Camera permissions and HTML5 Geolocation API permissions before it can execute.
- Generates a Base64 Image Hash string and Latitude/Longitude coordinate map saved directly into `attendance` specific to that `.toISOString().split('T')[0]` date.
- Auto Logout functionality actively sweeps the state and force-terminates sessions checking the clock dynamically.

#### 4.2 Actionable Task Delegation
- An explicit "To do" -> "In Progress" -> "Done" micro-pipeline.
- Sub-fields for `Expected_TAT` (Turnaround Time) alongside rigid deadlines map expectations securely.
- "Feedback & Notes": Async real-time saving mechanism on `Blur()` events to prevent long-form logging data losses.

#### 4.3 Real-Time Internal Notifications
- When an employee hits "Done", the system queries `tasks.created_by`. 
- Synthesizes a silent internal alert into the `notifications` table, projecting a red Bell `(🔔)` unread-count counter globally onto the assigned Admin's Navbar across the entire ecosystem. 

### 5. Extension Guidelines
- Future mobile integrations of this module should explicitly tap native Swift/Kotlin GPS libraries for even deeper Geofencing rules beyond standard browser limits.
