# Granular RBAC System Implementation

## Overview
Implemented a comprehensive Role-Based Access Control (RBAC) system with granular permissions (View/Edit/Delete) for each module, replacing the previous Department/Designation-based matrix.

## Database Schema Changes

### New Tables

#### 1. `roles`
```sql
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `permission_matrix` (Updated)
```sql
CREATE TABLE IF NOT EXISTS permission_matrix (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id INTEGER,
  module TEXT NOT NULL,
  can_view INTEGER DEFAULT 0,
  can_edit INTEGER DEFAULT 0,
  can_delete INTEGER DEFAULT 0,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  UNIQUE(role_id, module)
);
```

#### 3. `user_roles`
```sql
CREATE TABLE IF NOT EXISTS user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  role_id INTEGER NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  UNIQUE(user_email, role_id)
);
```

## Backend API Endpoints

### Role Management
- `GET /api/roles` - Fetch all roles
- `POST /api/roles` - Create a new role
- `DELETE /api/roles/:id` - Delete a role (cascades to permissions and user assignments)

### Permission Matrix
- `GET /api/permission-matrix` - Fetch all permissions with role names
- `POST /api/permission-matrix` - Create or update permission for a role-module pair
- `DELETE /api/permission-matrix/:id` - Delete a specific permission

### User Role Assignments
- `GET /api/user-roles` - Fetch all user-role assignments
- `POST /api/user-roles` - Assign a role to a user
- `DELETE /api/user-roles/:id` - Remove a role from a user

### Authentication Updates
- `/api/login` - Now returns permissions as an object:
  ```javascript
  {
    user: { ...userDetails },
    permissions: {
      dashboard: { view: true, edit: true, delete: true },
      leads: { view: true, edit: false, delete: false },
      // ...
    }
  }
  ```
- `/api/profile` - Updated to match login response format

## Frontend Changes

### Store (`src/store.js`)
Added new state and actions:
- `roles` - Array of custom roles
- `userRoles` - Array of user-role assignments
- `fetchRoles()`, `addRole()`, `deleteRole()`
- `updatePermission()` - Replaces old `addPermission()` and `removePermission()`
- `fetchUserRoles()`, `assignUserRole()`, `removeUserRole()`

### App Component (`src/App.jsx`)
- Updated to filter tabs based on `permissions[module].view === true`
- Changed permission structure from array to object

### Access Control Component (`src/components/AccessControl.jsx`)
Complete redesign with:
1. **Role Management Section**
   - Create custom roles with name and description
   - Delete roles (cascades to permissions)
   
2. **Permission Matrix**
   - Interactive table for each role
   - Toggle View/Edit/Delete permissions per module
   - Visual indicators (green for view, blue for edit, red for delete)

3. **User Role Assignment**
   - Assign multiple roles to users
   - View all current assignments
   - Remove role assignments

4. **Account Approvals** (retained from previous version)
5. **Audit Log** (retained from previous version)

## Permission Logic

### For Admins (super_admin, admin)
- Full access to all modules (view, edit, delete)

### For Regular Users
- Permissions aggregated from all assigned roles using OR logic
- If any role grants a permission, the user has it
- Example: If Role A grants "view" and Role B grants "edit", user has both

## Migration Path

### From Old System
The old Department/Designation-based system is replaced. To migrate:

1. Create roles matching your common department-designation combinations
2. Set permissions for each role
3. Assign roles to users based on their email

### Example Migration
Old: `Sales` department + `Manager` designation → `leads` module
New: 
1. Create role "Sales Manager"
2. Set permissions: `leads` → view: ✓, edit: ✓, delete: ✓
3. Assign "Sales Manager" role to all sales managers

## Security Features

1. **Cascading Deletes**: Deleting a role removes all associated permissions and user assignments
2. **Unique Constraints**: Prevents duplicate role assignments
3. **Granular Control**: Separate View/Edit/Delete permissions for fine-grained access
4. **Audit Trail**: All permission changes are logged
5. **Session Persistence**: Permissions cached in localStorage for performance

## Usage Example

### Creating a Custom Role
```javascript
// Admin creates "Inventory Clerk" role
POST /api/roles
{
  "role_name": "Inventory Clerk",
  "description": "Can view and edit inventory, no delete access"
}

// Set permissions
POST /api/permission-matrix
{
  "role_id": 5,
  "module": "inventory",
  "can_view": 1,
  "can_edit": 1,
  "can_delete": 0
}

// Assign to user
POST /api/user-roles
{
  "user_email": "clerk@vayu.com",
  "role_id": 5
}
```

## Benefits

1. **Flexibility**: Create unlimited custom roles
2. **Granularity**: Control view/edit/delete separately
3. **Scalability**: Users can have multiple roles
4. **Maintainability**: Change role permissions without touching user assignments
5. **Clarity**: Clear visual interface for permission management
