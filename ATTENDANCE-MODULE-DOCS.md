# Attendance Module - Implementation Summary

## Features Implemented

### 1. Employee Dashboard - Attendance Features

#### Status Persistence
- **Auto-detection**: When an employee logs in, the system automatically checks if they have already clocked in today
- **Visual Indicator**: Shows a green pulsing "ACTIVE" badge when employee is clocked in
- **Status Display**: Shows last action time (clock in/out)

#### Clock In/Out Process
- **Photo Verification**: Employee must take a selfie when clocking in or out
- **Location Tracking**: GPS coordinates are automatically captured
- **Camera Modal**: Clean UI with camera preview, capture, and retake options
- **Confirmation**: Employee can review photo before submitting

#### Auto-Logout Feature
- **Time-based**: Automatically logs out employees at 8:00 PM (20:00)
- **Alert System**: Shows alert message before auto-logout
- **Background Check**: Runs every minute to check if it's past 8 PM
- **No Photo Required**: Auto-logout doesn't require photo/location (system-initiated)

### 2. Admin Dashboard - Attendance Management

#### Overview Statistics
- **Total Staff Present**: Count of employees currently clocked in
- **Total Hours Logged**: Sum of all hours worked today
- **Average Shift**: Average hours per employee

#### Detailed Records Table
Displays for each attendance record:
- Employee Name
- Designation
- Clock In Time
- Clock Out Time
- Total Hours Worked
- Verification Button (to view photo/location)
- Status (Active/Completed)

#### Verification Modal
When admin clicks the verification button:
- **Clock In Section**:
  - Timestamp
  - Employee selfie
  - GPS location with Google Maps link
  
- **Clock Out Section**:
  - Timestamp
  - Employee selfie
  - GPS location with Google Maps link

#### Search & Filter
- Date picker to view historical records
- Search by employee name or designation
- Real-time filtering

## Database Schema

### Attendance Table
```sql
CREATE TABLE attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER,
  date DATE,
  clock_in DATETIME,
  clock_out DATETIME,
  status TEXT,
  total_hours REAL,
  clock_in_photo TEXT,      -- Base64 encoded image
  clock_out_photo TEXT,      -- Base64 encoded image
  clock_in_location TEXT,    -- "latitude,longitude"
  clock_out_location TEXT,   -- "latitude,longitude"
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### POST /api/attendance/clock-in
**Request Body:**
```json
{
  "employee_id": 1,
  "photo": "data:image/jpeg;base64,...",
  "location": "28.6139,77.2090"
}
```

**Response:**
```json
{
  "success": true,
  "id": 123,
  "clock_in": "2026-01-29T10:30:00.000Z"
}
```

### POST /api/attendance/clock-out
**Request Body:**
```json
{
  "employee_id": 1,
  "photo": "data:image/jpeg;base64,...",
  "location": "28.6139,77.2090"
}
```

**Response:**
```json
{
  "success": true,
  "clock_out": "2026-01-29T18:30:00.000Z",
  "total_hours": "8.00"
}
```

### GET /api/attendance?date=2026-01-29
**Response:**
```json
[
  {
    "id": 123,
    "employee_id": 1,
    "employee_name": "John Doe",
    "designation": "Sales Executive",
    "date": "2026-01-29",
    "clock_in": "2026-01-29T10:30:00.000Z",
    "clock_out": "2026-01-29T18:30:00.000Z",
    "total_hours": 8.0,
    "clock_in_photo": "data:image/jpeg;base64,...",
    "clock_out_photo": "data:image/jpeg;base64,...",
    "clock_in_location": "28.6139,77.2090",
    "clock_out_location": "28.6140,77.2091",
    "status": "Present"
  }
]
```

## User Flows

### Employee Flow
1. Employee logs into the system
2. Dashboard automatically checks if already clocked in today
3. If not clocked in:
   - Click "Clock In" button
   - Camera modal opens
   - Allow camera permission
   - Take selfie
   - Review and confirm
   - System captures GPS location
   - Status changes to "ACTIVE" with green indicator
4. During work day:
   - Green "ACTIVE" badge visible
   - Can clock out anytime
5. Clock Out:
   - Click "Clock Out" button
   - Same camera/location process
   - Status changes to "checked-out"
6. Auto-logout:
   - At 8:00 PM, system automatically clocks out
   - Alert shown to employee
   - No photo/location required for auto-logout

### Admin Flow
1. Admin navigates to "Attendance" tab
2. Views daily statistics dashboard
3. Can change date to view historical records
4. Sees list of all employees with their times
5. Click verification icon (map pin) to view:
   - Employee photos (clock in/out)
   - GPS locations with Google Maps links
   - Timestamps
6. Can search/filter records by name or designation

## Technical Implementation

### Frontend Components
- **EmployeeDashboard.jsx**: Employee attendance UI with camera integration
- **AttendanceManagement.jsx**: Admin view with verification modal
- **store.js**: Zustand state management for attendance data

### Backend
- **server.js**: API endpoints for clock in/out and fetching records
- **vayu.db**: SQLite database with attendance table

### Key Technologies
- **Camera API**: `navigator.mediaDevices.getUserMedia()`
- **Geolocation API**: `navigator.geolocation.getCurrentPosition()`
- **Canvas API**: For capturing photo from video stream
- **Base64 Encoding**: For storing images in database
- **React Hooks**: useState, useEffect, useRef for state management
- **Lucide Icons**: For UI icons (Camera, MapPin, Clock, etc.)

## Security & Privacy Considerations
- Photos stored as base64 in database (consider moving to file storage for production)
- GPS coordinates stored as text strings
- Auto-logout ensures employees don't forget to clock out
- Verification photos provide proof of attendance
- Location data helps verify employee was at work location

## Future Enhancements (Potential)
- [ ] Geofencing: Only allow clock in/out within specific radius of office
- [ ] Face recognition: Verify employee identity from photo
- [ ] Shift management: Different auto-logout times for different shifts
- [ ] Notifications: Remind employees to clock in/out
- [ ] Reports: Weekly/monthly attendance reports with charts
- [ ] Export: Download attendance data as CSV/Excel
- [ ] Mobile app: Dedicated mobile app for easier photo capture
- [ ] Offline support: Queue clock in/out when offline, sync when online
