const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const morgan = require('morgan');
const path = require('path');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const ROLE_PERMISSIONS = {
    super_admin: ['all'],
    admin: ['manage_users', 'view_reports', 'manage_inventory', 'manage_sales', 'manage_service'],
    employee: ['view_tasks', 'view_inventory', 'create_sales'],
    serviceman: ['view_service_tasks', 'update_service_status'],
    technician: ['view_service_tasks', 'update_service_status']
};

console.log('Starting VAYU Backend Server...');

// Database setup
const db = new Database(path.join(__dirname, 'vayu.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Default Super Admin (Email: admin@vayu.com, Password: admin)
  INSERT OR IGNORE INTO accounts (email, password, name, role, status) VALUES 
  ('admin@vayu.com', 'admin', 'Abnish', 'super_admin', 'approved');

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    target_id INTEGER,
    performed_by TEXT, -- Admin name
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    source TEXT,
    status TEXT,
    notes TEXT,
    assigned_to TEXT,
    stage TEXT,
    showroom TEXT DEFAULT 'Main Showroom',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS raw_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    source TEXT,
    showroom TEXT DEFAULT 'Main Showroom',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT,
    item_name TEXT,
    sku TEXT UNIQUE,
    quantity INTEGER,
    unit_cost REAL,
    reorder_level INTEGER,
    showroom TEXT DEFAULT 'Main Showroom',
    po_no TEXT,
    purchase_date TEXT,
    warranty TEXT,
    warranty_duration TEXT,
    warranty_parts TEXT,
    unique_no TEXT UNIQUE,
    model TEXT,
    colour TEXT,
    chasis_no TEXT,
    motor_no TEXT,
    controller_no TEXT,
    volt TEXT,
    amp TEXT,
    breakdown_volt TEXT,
    size TEXT,
    watt TEXT,
    controller_type TEXT,
    status TEXT DEFAULT 'available', -- available, sold
    customer_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS lead_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    vehicle_registration TEXT,
    purchase_date TEXT,
    uptime_pass_status TEXT,
    uptime_pass_expiry TEXT,
    showroom TEXT DEFAULT 'Main Showroom',
    aadhar_number TEXT,
    address TEXT,
    alt_phone TEXT,
    referral_code TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    vehicle_reg TEXT,
    selling_price REAL,
    payment_mode TEXT,
    uptime_pass BOOLEAN,
    showroom TEXT DEFAULT 'Main Showroom',
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    mode_of_sale TEXT,
    cash_upi_amount REAL,
    cash_cash_amount REAL,
    cash_collected_by TEXT,
    finance_down_payment REAL,
    finance_dp_cash REAL,
    finance_dp_cash_by TEXT,
    finance_dp_upi REAL,
    finance_loan_number TEXT,
    finance_emi REAL,
    finance_tenure INTEGER,
    finance_schedule TEXT,
    finance_start_date TEXT,
    finance_bank TEXT,
    battery_type TEXT,
    battery_id TEXT,
    battery_sku TEXT,
    battery_driver_id TEXT,
    vehicle_sku TEXT,
    vehicle_model TEXT,
    aadhar_number TEXT,
    address TEXT,
    alt_phone TEXT,
    business_type TEXT DEFAULT 'sale' -- sale, service
  );

  CREATE TABLE IF NOT EXISTS service_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    customer_name TEXT,
    vehicle_registration TEXT,
    service_type TEXT,
    issue_description TEXT,
    parts_charge REAL,
    labor_charge REAL,
    total_charge REAL,
    showroom TEXT DEFAULT 'Main Showroom',
    service_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'OPEN', -- OPEN, DIAGNOSIS, CONSENT_PENDING, REPAIRING, TESTING, HANDOVER, CLOSED
    response_time_mins INTEGER,
    parts_used TEXT, -- JSON string
    ticket_no TEXT UNIQUE,
    phone TEXT,
    raised_by TEXT, -- Customer, Employee
    rsa_required INTEGER DEFAULT 0,
    rsa_location TEXT,
    assigned_serviceman_id INTEGER,
    assigned_serviceman_name TEXT,
    diagnosis_start_time DATETIME,
    exact_issue TEXT,
    estimated_tat TEXT,
    estimated_cost REAL,
    customer_consent INTEGER, -- NULL, 1 (Yes), 0 (No)
    checklist_solved INTEGER DEFAULT 0,
    checklist_test_drive INTEGER DEFAULT 0,
    checklist_no_parts_left INTEGER DEFAULT 0,
    checklist_replaced_returned INTEGER DEFAULT 0,
    customer_feedback TEXT,
    payment_mode TEXT,
    closing_time DATETIME
  );

  CREATE TABLE IF NOT EXISTS rsa_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_record_id INTEGER,
    customer_location TEXT,
    dispatch_time TEXT,
    arrival_time TEXT,
    completion_time TEXT,
    serviceman_name TEXT,
    status TEXT,
    showroom TEXT DEFAULT 'Main Showroom'
  );

  INSERT OR IGNORE INTO showrooms (name) VALUES ('Main Showroom'), ('VAYU North'), ('VAYU South'), ('VAYU West');

  CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT UNIQUE,
    address TEXT,
    pan_no TEXT,
    aadhar_no TEXT,
    referral_code TEXT UNIQUE,
    referral_amount REAL DEFAULT 500,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_no TEXT,
    amount REAL,
    payment_mode TEXT,
    collected_by TEXT,
    cash_by_whom TEXT,
    upi_account TEXT,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_no TEXT,
    associated_no TEXT,
    expense_type TEXT,
    expense_date TEXT,
    given_to TEXT,
    amount REAL,
    paid_by TEXT,
    paid_via TEXT,
    cash_by_whom TEXT,
    upi_account TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE,
    name TEXT,
    mobile TEXT,
    email TEXT,
    dob TEXT,
    aadhar_no TEXT,
    department TEXT,
    designation TEXT,
    manager_name TEXT,
    date_of_joining TEXT,
    status TEXT DEFAULT 'active',
    availability_status TEXT DEFAULT 'offline',
    inactive_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    date DATE,
    clock_in DATETIME,
    clock_out DATETIME,
    status TEXT, -- Present, Absent, Half-Day
    total_hours REAL,
    clock_in_photo TEXT,
    clock_in_location TEXT,
    clock_out_photo TEXT,
    clock_out_location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

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

  CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    UNIQUE(user_email, role_id)
  );
`);

// Ensure default admin has an employee record for attendance
try {
    const adminEmail = 'admin@vayu.com';
    const existingEmp = db.prepare('SELECT id FROM employees WHERE email = ?').get(adminEmail);
    if (!existingEmp) {
        db.prepare(`
            INSERT INTO employees (name, email, designation, department, status, date_of_joining) 
            VALUES (?, ?, ?, ?, ?, ?)
        `).run('Abnish', adminEmail, 'Super Admin', 'Management', 'active', new Date().toISOString().split('T')[0]);
        console.log('[Setup] Created default employee record for Admin');
    }
} catch (e) {
    console.error('[Setup] Failed to ensure default employee:', e);
}

// Migration Helper
const migrate = () => {
    try {
        const salesCols = db.prepare('PRAGMA table_info(sales)').all().map(c => c.name);
        const custCols = db.prepare('PRAGMA table_info(customers)').all().map(c => c.name);

        // Sales Migrations
        if (!salesCols.includes('mode_of_sale')) db.prepare('ALTER TABLE sales ADD COLUMN mode_of_sale TEXT').run();
        if (!salesCols.includes('cash_upi_amount')) db.prepare('ALTER TABLE sales ADD COLUMN cash_upi_amount REAL').run();
        if (!salesCols.includes('cash_cash_amount')) db.prepare('ALTER TABLE sales ADD COLUMN cash_cash_amount REAL').run();
        if (!salesCols.includes('cash_collected_by')) db.prepare('ALTER TABLE sales ADD COLUMN cash_collected_by TEXT').run();
        if (!salesCols.includes('finance_down_payment')) db.prepare('ALTER TABLE sales ADD COLUMN finance_down_payment REAL').run();
        if (!salesCols.includes('finance_dp_cash')) db.prepare('ALTER TABLE sales ADD COLUMN finance_dp_cash REAL').run();
        if (!salesCols.includes('finance_dp_cash_by')) db.prepare('ALTER TABLE sales ADD COLUMN finance_dp_cash_by TEXT').run();
        if (!salesCols.includes('finance_dp_upi')) db.prepare('ALTER TABLE sales ADD COLUMN finance_dp_upi REAL').run();
        if (!salesCols.includes('finance_loan_number')) db.prepare('ALTER TABLE sales ADD COLUMN finance_loan_number TEXT').run();
        if (!salesCols.includes('finance_emi')) db.prepare('ALTER TABLE sales ADD COLUMN finance_emi REAL').run();
        if (!salesCols.includes('finance_tenure')) db.prepare('ALTER TABLE sales ADD COLUMN finance_tenure INTEGER').run();
        if (!salesCols.includes('finance_schedule')) db.prepare('ALTER TABLE sales ADD COLUMN finance_schedule TEXT').run();
        if (!salesCols.includes('finance_start_date')) db.prepare('ALTER TABLE sales ADD COLUMN finance_start_date TEXT').run();
        if (!salesCols.includes('finance_bank')) db.prepare('ALTER TABLE sales ADD COLUMN finance_bank TEXT').run();
        if (!salesCols.includes('battery_type')) db.prepare('ALTER TABLE sales ADD COLUMN battery_type TEXT').run();
        if (!salesCols.includes('battery_id')) db.prepare('ALTER TABLE sales ADD COLUMN battery_id TEXT').run();
        if (!salesCols.includes('battery_sku')) db.prepare('ALTER TABLE sales ADD COLUMN battery_sku TEXT').run();
        if (!salesCols.includes('battery_driver_id')) db.prepare('ALTER TABLE sales ADD COLUMN battery_driver_id TEXT').run();
        if (!salesCols.includes('vehicle_sku')) db.prepare('ALTER TABLE sales ADD COLUMN vehicle_sku TEXT').run();
        if (!salesCols.includes('vehicle_model')) db.prepare('ALTER TABLE sales ADD COLUMN vehicle_model TEXT').run();
        if (!salesCols.includes('salesperson')) db.prepare('ALTER TABLE sales ADD COLUMN salesperson TEXT').run();
        if (!salesCols.includes('referral')) db.prepare('ALTER TABLE sales ADD COLUMN referral TEXT').run();
        if (!salesCols.includes('aadhar_number')) db.prepare('ALTER TABLE sales ADD COLUMN aadhar_number TEXT').run();
        if (!salesCols.includes('address')) db.prepare('ALTER TABLE sales ADD COLUMN address TEXT').run();
        if (!salesCols.includes('alt_phone')) db.prepare('ALTER TABLE sales ADD COLUMN alt_phone TEXT').run();

        // Customer Migrations
        if (!custCols.includes('aadhar_number')) db.prepare('ALTER TABLE customers ADD COLUMN aadhar_number TEXT').run();
        if (!custCols.includes('address')) db.prepare('ALTER TABLE customers ADD COLUMN address TEXT').run();
        if (!custCols.includes('alt_phone')) db.prepare('ALTER TABLE customers ADD COLUMN alt_phone TEXT').run();
        // Referral Migrations
        const refCols = db.prepare('PRAGMA table_info(referrals)').all().map(c => c.name);
        if (!refCols.includes('referral_amount')) db.prepare('ALTER TABLE referrals ADD COLUMN referral_amount REAL DEFAULT 500').run();
        if (!refCols.includes('phone')) {
            // Already there but ensure it's unique if possible - sqlite doesn't support easy UNIQUE alter
        }

        // Customer + Referral Sync & Format Update
        if (!custCols.includes('referral_code')) db.prepare('ALTER TABLE customers ADD COLUMN referral_code TEXT').run();

        // Business Type & Service Tracking
        if (!salesCols.includes('business_type')) db.prepare('ALTER TABLE sales ADD COLUMN business_type TEXT DEFAULT "sale"').run();

        const serviceCols = db.prepare('PRAGMA table_info(service_records)').all().map(c => c.name);
        if (!serviceCols.includes('ticket_no')) db.prepare('ALTER TABLE service_records ADD COLUMN ticket_no TEXT').run();
        if (!serviceCols.includes('phone')) db.prepare('ALTER TABLE service_records ADD COLUMN phone TEXT').run();
        if (!serviceCols.includes('raised_by')) db.prepare('ALTER TABLE service_records ADD COLUMN raised_by TEXT').run();
        if (!serviceCols.includes('rsa_required')) db.prepare('ALTER TABLE service_records ADD COLUMN rsa_required INTEGER DEFAULT 0').run();
        if (!serviceCols.includes('rsa_location')) db.prepare('ALTER TABLE service_records ADD COLUMN rsa_location TEXT').run();
        if (!serviceCols.includes('assigned_serviceman_id')) db.prepare('ALTER TABLE service_records ADD COLUMN assigned_serviceman_id INTEGER').run();
        if (!serviceCols.includes('assigned_serviceman_name')) db.prepare('ALTER TABLE service_records ADD COLUMN assigned_serviceman_name TEXT').run();
        if (!serviceCols.includes('diagnosis_start_time')) db.prepare('ALTER TABLE service_records ADD COLUMN diagnosis_start_time DATETIME').run();
        if (!serviceCols.includes('exact_issue')) db.prepare('ALTER TABLE service_records ADD COLUMN exact_issue TEXT').run();
        if (!serviceCols.includes('estimated_tat')) db.prepare('ALTER TABLE service_records ADD COLUMN estimated_tat TEXT').run();
        if (!serviceCols.includes('estimated_cost')) db.prepare('ALTER TABLE service_records ADD COLUMN estimated_cost REAL').run();
        if (!serviceCols.includes('customer_consent')) db.prepare('ALTER TABLE service_records ADD COLUMN customer_consent INTEGER').run();
        if (!serviceCols.includes('checklist_solved')) db.prepare('ALTER TABLE service_records ADD COLUMN checklist_solved INTEGER DEFAULT 0').run();
        if (!serviceCols.includes('checklist_test_drive')) db.prepare('ALTER TABLE service_records ADD COLUMN checklist_test_drive INTEGER DEFAULT 0').run();
        if (!serviceCols.includes('checklist_no_parts_left')) db.prepare('ALTER TABLE service_records ADD COLUMN checklist_no_parts_left INTEGER DEFAULT 0').run();
        if (!serviceCols.includes('checklist_replaced_returned')) db.prepare('ALTER TABLE service_records ADD COLUMN checklist_replaced_returned INTEGER DEFAULT 0').run();
        if (!serviceCols.includes('customer_feedback')) db.prepare('ALTER TABLE service_records ADD COLUMN customer_feedback TEXT').run();
        if (!serviceCols.includes('payment_mode')) db.prepare('ALTER TABLE service_records ADD COLUMN payment_mode TEXT').run();
        if (!serviceCols.includes('closing_time')) db.prepare('ALTER TABLE service_records ADD COLUMN closing_time DATETIME').run();

        const allCust = db.prepare('SELECT * FROM customers').all();
        allCust.forEach(c => {
            let code = c.referral_code;
            if (!code || !code.startsWith('VU-')) {
                const random = Math.random().toString(36).substring(2, 7).toUpperCase();
                code = `VU-${random}`;
                db.prepare('UPDATE customers SET referral_code = ? WHERE id = ?').run(code, c.id);
            }

            // Sync to referrals table
            const existingRef = db.prepare('SELECT id FROM referrals WHERE phone = ?').get(c.phone);
            if (existingRef) {
                db.prepare('UPDATE referrals SET referral_code = ?, name = ?, address = ?, aadhar_no = ? WHERE id = ?').run(
                    code, c.name, c.address, c.aadhar_number, existingRef.id
                );
            } else {
                db.prepare('INSERT INTO referrals (name, phone, address, aadhar_no, referral_code) VALUES (?, ?, ?, ?, ?)').run(
                    c.name, c.phone, c.address, c.aadhar_number, code
                );
            }
        });

        // Payments Migrations
        const payCols = db.prepare('PRAGMA table_info(payments)').all().map(c => c.name);
        if (!payCols.includes('cash_by_whom')) db.prepare('ALTER TABLE payments ADD COLUMN cash_by_whom TEXT').run();
        if (!payCols.includes('upi_account')) db.prepare('ALTER TABLE payments ADD COLUMN upi_account TEXT').run();

        // Expenses Migrations
        const expCols = db.prepare('PRAGMA table_info(expenses)').all().map(c => c.name);
        if (!expCols.includes('cash_by_whom')) db.prepare('ALTER TABLE expenses ADD COLUMN cash_by_whom TEXT').run();
        if (!expCols.includes('upi_account')) db.prepare('ALTER TABLE expenses ADD COLUMN upi_account TEXT').run();

        // Inventory Migrations
        const invCols = db.prepare('PRAGMA table_info(inventory)').all().map(c => c.name);
        if (!invCols.includes('po_no')) db.prepare('ALTER TABLE inventory ADD COLUMN po_no TEXT').run();
        if (!invCols.includes('purchase_date')) db.prepare('ALTER TABLE inventory ADD COLUMN purchase_date TEXT').run();
        if (!invCols.includes('warranty')) db.prepare('ALTER TABLE inventory ADD COLUMN warranty TEXT').run();
        if (!invCols.includes('warranty_duration')) db.prepare('ALTER TABLE inventory ADD COLUMN warranty_duration TEXT').run();
        if (!invCols.includes('warranty_parts')) db.prepare('ALTER TABLE inventory ADD COLUMN warranty_parts TEXT').run();
        if (!invCols.includes('unique_no')) db.prepare('ALTER TABLE inventory ADD COLUMN unique_no TEXT').run();
        if (!invCols.includes('model')) db.prepare('ALTER TABLE inventory ADD COLUMN model TEXT').run();
        if (!invCols.includes('colour')) db.prepare('ALTER TABLE inventory ADD COLUMN colour TEXT').run();
        if (!invCols.includes('chasis_no')) db.prepare('ALTER TABLE inventory ADD COLUMN chasis_no TEXT').run();
        if (!invCols.includes('motor_no')) db.prepare('ALTER TABLE inventory ADD COLUMN motor_no TEXT').run();
        if (!invCols.includes('controller_no')) db.prepare('ALTER TABLE inventory ADD COLUMN controller_no TEXT').run();
        if (!invCols.includes('volt')) db.prepare('ALTER TABLE inventory ADD COLUMN volt TEXT').run();
        if (!invCols.includes('amp')) db.prepare('ALTER TABLE inventory ADD COLUMN amp TEXT').run();
        if (!invCols.includes('breakdown_volt')) db.prepare('ALTER TABLE inventory ADD COLUMN breakdown_volt TEXT').run();
        if (!invCols.includes('size')) db.prepare('ALTER TABLE inventory ADD COLUMN size TEXT').run();
        if (!invCols.includes('watt')) db.prepare('ALTER TABLE inventory ADD COLUMN watt TEXT').run();
        if (!invCols.includes('controller_type')) db.prepare('ALTER TABLE inventory ADD COLUMN controller_type TEXT').run();
        if (!invCols.includes('status')) db.prepare('ALTER TABLE inventory ADD COLUMN status TEXT DEFAULT "available"').run();
        if (!invCols.includes('customer_id')) db.prepare('ALTER TABLE inventory ADD COLUMN customer_id INTEGER').run();

        // Raw Leads Migrations
        const rawLeadsCheck = db.prepare('PRAGMA table_info(raw_leads)').all();
        const rawLeadsCols = rawLeadsCheck.map(c => c.name);
        if (!rawLeadsCols.includes('lead_filled_by')) db.prepare('ALTER TABLE raw_leads ADD COLUMN lead_filled_by TEXT').run();
        if (!rawLeadsCols.includes('assigned_to')) db.prepare('ALTER TABLE raw_leads ADD COLUMN assigned_to TEXT').run();
        if (!rawLeadsCols.includes('referral_code')) db.prepare('ALTER TABLE raw_leads ADD COLUMN referral_code TEXT').run();

        // Employee Migrations
        const empCols = db.prepare('PRAGMA table_info(employees)').all().map(c => c.name);
        if (!empCols.includes('status')) db.prepare('ALTER TABLE employees ADD COLUMN status TEXT DEFAULT "active"').run();
        if (!empCols.includes('availability_status')) db.prepare('ALTER TABLE employees ADD COLUMN availability_status TEXT DEFAULT "offline"').run();
        if (!empCols.includes('inactive_date')) db.prepare('ALTER TABLE employees ADD COLUMN inactive_date TEXT').run();

        // Attendance Migrations
        const attCols = db.prepare('PRAGMA table_info(attendance)').all().map(c => c.name);
        if (!attCols.includes('clock_in_photo')) db.prepare('ALTER TABLE attendance ADD COLUMN clock_in_photo TEXT').run();
        if (!attCols.includes('clock_in_location')) db.prepare('ALTER TABLE attendance ADD COLUMN clock_in_location TEXT').run();
        if (!attCols.includes('clock_out_photo')) db.prepare('ALTER TABLE attendance ADD COLUMN clock_out_photo TEXT').run();
        if (!attCols.includes('clock_out_location')) db.prepare('ALTER TABLE attendance ADD COLUMN clock_out_location TEXT').run();

        // Add sale_no column if it doesn't exist
        if (!salesCols.includes('sale_no')) {
            // Add column without UNIQUE constraint first (SQLite limitation)
            db.prepare('ALTER TABLE sales ADD COLUMN sale_no TEXT').run();
            console.log('[Migration] Added sale_no column to sales table');

            // Generate sale numbers for existing records
            const existingSales = db.prepare('SELECT id FROM sales WHERE sale_no IS NULL ORDER BY id').all();
            existingSales.forEach((sale, index) => {
                const saleNo = `SALE-${String(index + 1).padStart(4, '0')}`;
                db.prepare('UPDATE sales SET sale_no = ? WHERE id = ?').run(saleNo, sale.id);
            });
            console.log(`[Migration] Generated sale numbers for ${existingSales.length} existing sales`);

            // Now add unique index
            try {
                db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_sale_no ON sales(sale_no)').run();
            } catch (e) {
                console.log('[Migration] Index creation skipped/failed', e.message);
            }
        }

        // Backfill Payments table if empty
        const paymentCount = db.prepare('SELECT COUNT(*) as count FROM payments').get();
        if (paymentCount.count === 0) {
            console.log('[Migration] Backfilling payments table from existing sales...');
            const allSales = db.prepare('SELECT * FROM sales').all();
            let backfillCount = 0;
            allSales.forEach(s => {
                const pDate = s.sale_date || new Date().toISOString().split('T')[0];
                if (s.payment_mode === 'cash') {
                    if (s.cash_upi_amount > 0) {
                        db.prepare('INSERT INTO payments (sale_no, amount, payment_mode, collected_by, payment_date) VALUES (?, ?, ?, ?, ?)').run(
                            s.sale_no, s.cash_upi_amount, 'UPI', s.cash_collected_by || s.salesperson || 'System', pDate
                        );
                        backfillCount++;
                    }
                    if (s.cash_cash_amount > 0) {
                        db.prepare('INSERT INTO payments (sale_no, amount, payment_mode, collected_by, payment_date) VALUES (?, ?, ?, ?, ?)').run(
                            s.sale_no, s.cash_cash_amount, 'Cash', s.cash_collected_by || s.salesperson || 'System', pDate
                        );
                        backfillCount++;
                    }
                } else if (s.payment_mode === 'finance') {
                    if (s.finance_dp_upi > 0) {
                        db.prepare('INSERT INTO payments (sale_no, amount, payment_mode, collected_by, payment_date) VALUES (?, ?, ?, ?, ?)').run(
                            s.sale_no, s.finance_dp_upi, 'UPI', s.finance_dp_cash_by || s.salesperson || 'System', pDate
                        );
                        backfillCount++;
                    }
                    if (s.finance_dp_cash > 0) {
                        db.prepare('INSERT INTO payments (sale_no, amount, payment_mode, collected_by, payment_date) VALUES (?, ?, ?, ?, ?)').run(
                            s.sale_no, s.finance_dp_cash, 'Cash', s.finance_dp_cash_by || s.salesperson || 'System', pDate
                        );
                        backfillCount++;
                    }
                }
            });
            console.log(`[Migration] Backfilled ${backfillCount} payment records from ${allSales.length} sales`);
        }

        // Fix Timestamps (Add 'Z' to existing SQLite default timestamps to ensure UTC parsing)
        const rawTimeFix = db.prepare("UPDATE raw_leads SET timestamp = timestamp || 'Z' WHERE timestamp NOT LIKE '%Z' AND length(timestamp) = 19").run();
        if (rawTimeFix.changes > 0) console.log(`[Migration] Fixed timestamps for ${rawTimeFix.changes} raw_leads`);

        const leadTimeFix = db.prepare("UPDATE leads SET created_at = created_at || 'Z' WHERE created_at NOT LIKE '%Z' AND length(created_at) = 19").run();
        if (leadTimeFix.changes > 0) console.log(`[Migration] Fixed timestamps for ${leadTimeFix.changes} leads`);

    } catch (e) {
        console.error('Migration failed:', e);
    }
};
migrate();

// Ensure accounts table has manager_email
try {
    const tableInfo = db.prepare('PRAGMA table_info(accounts)').all();
    if (!tableInfo.some(col => col.name === 'manager_email')) {
        db.prepare('ALTER TABLE accounts ADD COLUMN manager_email TEXT').run();
        console.log('[Migration] Added manager_email column to accounts table');
    }
} catch (e) {
    console.error('[Migration] Failed to add manager_email column:', e);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Showrooms API
app.get('/api/showrooms', (req, res) => {
    try {
        const showrooms = db.prepare('SELECT name FROM showrooms').all();
        res.json(showrooms.map(s => s.name));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/showrooms', (req, res) => {
    const { name } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO showrooms (name) VALUES (?)');
        stmt.run(name);
        res.json({ name });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Showroom already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/showrooms/:name', (req, res) => {
    const { name } = req.params;
    console.log(`[DELETE] Request to remove showroom: "${name}"`);
    try {
        // Only delete from the showrooms list. Historical records in sales/service/leads 
        // will preserve the string value of the showroom name.
        const stmt = db.prepare('DELETE FROM showrooms WHERE name = ?');
        const result = stmt.run(name);
        console.log(`[DELETE] Result for "${name}": changes=${result.changes}`);

        if (result.changes > 0) {
            res.json({ success: true });
        } else {
            console.warn(`[DELETE] Showroom "${name}" not found in DB.`);
            res.status(404).json({ error: 'Showroom not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Routes



app.post('/api/register', (req, res) => {
    const { email, password, name, role } = req.body;
    try {
        const info = db.prepare('INSERT INTO accounts (email, password, name, role, status) VALUES (?, ?, ?, ?, ?)')
            .run(email, password, name, role, 'pending');
        res.json({ id: info.lastInsertRowid, email, name, role, status: 'pending' });
    } catch (e) {
        res.status(400).json({ error: 'Email already exists' });
    }
});


app.post('/api/rider-login', (req, res) => {
    const { phone } = req.body;
    // Check if customer exists with this phone number
    const customer = db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone);

    if (!customer) {
        return res.status(404).json({ error: 'No rider found with this mobile number. Please contact the showroom.' });
    }

    // Return as a virtual user with role 'customer'
    res.json({
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        role: 'customer',
        customer_id: customer.id,
        vehicle_registration: customer.vehicle_registration
    });
});

app.get('/api/accounts', (req, res) => {
    const rows = db.prepare('SELECT id, email, name, role, status, manager_email, created_at FROM accounts').all();
    res.json(rows);
});
// Alias for legacy/potential frontend calls
app.get('/api/users', (req, res) => {
    const rows = db.prepare('SELECT id, email, name, role, status, manager_email, created_at FROM accounts').all();
    res.json(rows);
});

app.put('/api/accounts/:id/status', (req, res) => {
    const { status, adminName, adminRole } = req.body;
    const target = db.prepare('SELECT role FROM accounts WHERE id = ?').get(req.params.id);

    if (!target) return res.status(404).json({ error: 'User not found' });

    // Security Logic: 
    // 1. Only super_admin can modify an admin or another super_admin.
    // 2. Admins cannot modify other admins.
    if ((target.role === 'admin' || target.role === 'super_admin') && adminRole !== 'super_admin') {
        return res.status(403).json({ error: 'Permission denied. Only Super Admin can modify Admin accounts.' });
    }

    db.prepare('UPDATE accounts SET status = ? WHERE id = ?').run(status, req.params.id);

    // Record audit log
    db.prepare('INSERT INTO audit_logs (action, target_id, performed_by) VALUES (?, ?, ?)')
        .run(`ACCOUNT_${status.toUpperCase()}`, req.params.id, adminName);

    res.json({ success: true });
});

app.put('/api/accounts/:id/password', (req, res) => {
    const { password, adminName } = req.body;
    db.prepare('UPDATE accounts SET password = ? WHERE id = ?').run(password, req.params.id);

    // Record audit log
    db.prepare('INSERT INTO audit_logs (action, target_id, performed_by) VALUES (?, ?, ?)')
        .run('PASSWORD_RESET', req.params.id, adminName);

    res.json({ success: true });
});

app.put('/api/accounts/:id/manager', (req, res) => {
    const { managerEmail, adminName } = req.body;

    // Verify manager exists if email provided
    if (managerEmail) {
        const manager = db.prepare('SELECT id FROM accounts WHERE email = ?').get(managerEmail);
        if (!manager) return res.status(404).json({ error: 'Manager email not found' });
    }

    db.prepare('UPDATE accounts SET manager_email = ? WHERE id = ?').run(managerEmail || null, req.params.id);

    // Record audit log
    db.prepare('INSERT INTO audit_logs (action, target_id, performed_by) VALUES (?, ?, ?)')
        .run(`MANAGER_UPDATE_TO_${managerEmail || 'NONE'}`, req.params.id, adminName);

    res.json({ success: true });
});

app.get('/api/audit-logs', (req, res) => {
    const rows = db.prepare(`
    SELECT a.*, acc.name as target_name 
    FROM audit_logs a 
    LEFT JOIN accounts acc ON a.target_id = acc.id
    ORDER BY a.timestamp DESC
  `).all();
    res.json(rows);
});

app.post('/api/audit-logs', (req, res) => {
    const { action, target_id, performed_by } = req.body;
    db.prepare('INSERT INTO audit_logs (action, target_id, performed_by) VALUES (?, ?, ?)')
        .run(action, target_id, performed_by);
    res.json({ success: true });
});

// Leads
// Leads
app.get('/api/leads', (req, res) => {
    // Row Level Security
    const { email, role } = req.query;

    // Base query
    let query = 'SELECT * FROM leads';
    const params = [];

    // Access Control Logic
    if (email && role && role !== 'admin' && role !== 'super_admin') {
        // User sees:
        // 1. Leads assigned to them
        // 2. Leads assigned to people who report to them (if they are a manager)
        query += `
            WHERE assigned_to = ? 
            OR assigned_to IN (SELECT email FROM accounts WHERE manager_email = ?)
        `;
        params.push(email, email);
    }

    query += ' ORDER BY created_at DESC';

    try {
        const rows = db.prepare(query).all(...params);
        res.json(rows);
    } catch (err) {
        // Handle migration for new columns if they don't exist yet on GET
        if (err.message.includes('no such column')) {
            try {
                // Determine missing columns defensively
                const check = db.prepare('PRAGMA table_info(leads)').all();
                const cols = check.map(c => c.name);

                if (!cols.includes('frequency')) db.prepare('ALTER TABLE leads ADD COLUMN frequency INTEGER DEFAULT 1').run();
                if (!cols.includes('next_call_date')) db.prepare('ALTER TABLE leads ADD COLUMN next_call_date DATETIME').run();
                if (!cols.includes('current_call_date')) db.prepare('ALTER TABLE leads ADD COLUMN current_call_date DATETIME').run();

                // Check for accounts.manager_email column as well since we use it in the query
                const accCheck = db.prepare('PRAGMA table_info(accounts)').all();
                const accCols = accCheck.map(c => c.name);
                if (!accCols.includes('manager_email')) {
                    db.prepare('ALTER TABLE accounts ADD COLUMN manager_email TEXT').run();
                }

                // Retry
                const rows = db.prepare(query).all(...params);
                res.json(rows);
            } catch (e) {
                res.status(500).json({ error: e.message });
            }
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

app.get('/api/raw-leads', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM raw_leads ORDER BY timestamp DESC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/leads/:id/notes', (req, res) => {
    try {
        const notes = db.prepare('SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC').all(req.params.id);
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/leads', (req, res) => {
    const { name, phone, source, status, notes, showroom, assigned_to, stage, next_call_date, current_call_date, filled_by, referral_code } = req.body;

    // Log to Raw Leads (Time Machine)
    try {
        db.prepare('INSERT INTO raw_leads (timestamp, name, phone, source, showroom, lead_filled_by, assigned_to, referral_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
            new Date().toISOString(), name, phone, source, showroom || 'Main Showroom', filled_by, assigned_to, referral_code
        );
    } catch (err) {
        console.error('Failed to log raw lead:', err);
    }

    // Check for existing lead by phone
    const existing = db.prepare('SELECT * FROM leads WHERE phone = ?').get(phone);

    try {
        if (existing) {
            // Update existing lead
            const newFreq = (existing.frequency || 1) + 1;
            const stmt = db.prepare(`
                UPDATE leads 
                SET frequency = ?, 
                    stage = ?, 
                    notes = ?, 
                    current_call_date = ?, 
                    next_call_date = ?,
                    source = ? 
                WHERE id = ?
            `);
            stmt.run(newFreq, stage, notes || existing.notes, current_call_date || new Date().toISOString(), next_call_date, source, existing.id);

            // Add note to history if new note provided
            if (notes) {
                db.prepare('INSERT INTO lead_notes (lead_id, note) VALUES (?, ?)').run(existing.id, notes);
            }

            res.json({
                ...existing,
                frequency: newFreq,
                stage,
                notes,
                next_call_date,
                current_call_date,
                isDuplicate: true,
                duplicateMessage: `This lead already exists! Phone: ${phone} was previously added by ${existing.filled_by || 'Unknown'}. Frequency updated to ${newFreq}.`,
                existingLeadData: {
                    name: existing.name,
                    phone: existing.phone,
                    source: existing.source,
                    showroom: existing.showroom,
                    assigned_to: existing.assigned_to,
                    frequency: newFreq,
                    created_at: existing.created_at
                }
            });
        } else {
            // New Lead
            const stmt = db.prepare(`
                INSERT INTO leads (name, phone, source, status, notes, showroom, assigned_to, stage, frequency, next_call_date, current_call_date, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const info = stmt.run(
                name, phone, source, status, notes, showroom || 'Main Showroom',
                assigned_to, stage, 1, next_call_date, current_call_date || new Date().toISOString(), new Date().toISOString()
            );

            // Add initial note
            if (notes) {
                db.prepare('INSERT INTO lead_notes (lead_id, note) VALUES (?, ?)').run(info.lastInsertRowid, notes);
            }

            res.json({ id: info.lastInsertRowid, ...req.body, frequency: 1 });
        }
    } catch (err) {
        // Migration Catch-all
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/leads/:id', (req, res) => {
    const { status, next_call_date, current_call_date, notes, stage, frequency, assigned_to, name, phone, source, showroom } = req.body;

    const updates = [];
    const values = [];

    if (status) { updates.push('status = ?'); values.push(status); }
    if (next_call_date) { updates.push('next_call_date = ?'); values.push(next_call_date); }
    if (current_call_date) { updates.push('current_call_date = ?'); values.push(current_call_date); }
    if (notes) { updates.push('notes = ?'); values.push(notes); }
    if (stage) { updates.push('stage = ?'); values.push(stage); }
    if (frequency) { updates.push('frequency = ?'); values.push(frequency); }
    if (assigned_to !== undefined) { updates.push('assigned_to = ?'); values.push(assigned_to); }
    if (name) { updates.push('name = ?'); values.push(name); }
    if (phone) { updates.push('phone = ?'); values.push(phone); }
    if (source) { updates.push('source = ?'); values.push(source); }
    if (showroom) { updates.push('showroom = ?'); values.push(showroom); }

    if (updates.length > 0) {
        values.push(req.params.id);
        const query = `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`;
        try {
            db.prepare(query).run(...values);

            // Log note history if note is updated
            if (notes) {
                db.prepare('INSERT INTO lead_notes (lead_id, note) VALUES (?, ?)').run(req.params.id, notes);
            }

            // Fetch updated lead to return
            const updatedLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
            res.json(updatedLead);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json({ success: true }); // No updates needed
    }
});

app.delete('/api/leads/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cleanup bad data (self-healing)
try {
    const info = db.prepare('DELETE FROM leads WHERE name IS NULL OR phone IS NULL').run();
    if (info.changes > 0) console.log(`[Cleanup] Removed ${info.changes} corrupted leads.`);
} catch (e) {
    console.error('Cleanup failed', e);
}

// Inventory
app.get('/api/inventory', (req, res) => {
    // Return ALL inventory items (sold and available) so they appear in the ledger
    const rows = db.prepare('SELECT * FROM inventory').all();
    res.json(rows);
});

app.get('/api/all-inventory', (req, res) => {
    const rows = db.prepare('SELECT * FROM inventory').all();
    res.json(rows);
});

app.post('/api/inventory/bulk', (req, res) => {
    try {
        const items = req.body;
        console.log(`[Bulk Upload] Received ${items ? items.length : 0} items for upload.`);

        if (!Array.isArray(items)) {
            console.error('[Bulk Upload] Error: Body is not an array');
            return res.status(400).json({ error: 'Invalid data format. Expected an array of items.' });
        }
        const insert = db.prepare(`INSERT OR REPLACE INTO inventory (
            item_type, item_name, sku, quantity, unit_cost, reorder_level, showroom,
            po_no, purchase_date, warranty, warranty_duration, warranty_parts,
            unique_no, model, colour, chasis_no, motor_no, controller_no,
            volt, amp, breakdown_volt, size, watt, controller_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        const insertMany = db.transaction((data) => {
            for (const item of data) {
                try {
                    insert.run(
                        item.item_type, item.item_name, item.sku, Number(item.quantity || 1), Number(item.unit_cost || 0),
                        Number(item.reorder_level || 5), item.showroom || 'Main Showroom',
                        item.po_no, item.purchase_date, item.warranty, item.warranty_duration, item.warranty_parts,
                        item.unique_no, item.model, item.colour, item.chasis_no, item.motor_no, item.controller_no,
                        item.volt, item.amp, item.breakdown_volt, item.size, item.watt, item.controller_type
                    );
                } catch (rowErr) {
                    console.error('[Bulk Upload] Row Error:', rowErr.message, item);
                    throw rowErr; // Re-throw to abort transaction
                }
            }
        });

        insertMany(items);
        console.log('[Bulk Upload] Success');
        res.json({ success: true, count: items.length });
    } catch (err) {
        console.error('[Bulk Upload] Transaction Error:', err);
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/inventory', (req, res) => {
    try {
        const {
            item_type, item_name, sku, quantity, unit_cost, reorder_level, showroom,
            po_no, purchase_date, warranty, warranty_duration, warranty_parts,
            unique_no, model, colour, chasis_no, motor_no, controller_no,
            volt, amp, breakdown_volt, size, watt, controller_type
        } = req.body;

        const info = db.prepare(`INSERT INTO inventory (
            item_type, item_name, sku, quantity, unit_cost, reorder_level, showroom,
            po_no, purchase_date, warranty, warranty_duration, warranty_parts,
            unique_no, model, colour, chasis_no, motor_no, controller_no,
            volt, amp, breakdown_volt, size, watt, controller_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
            item_type, item_name, sku, quantity, unit_cost, reorder_level, showroom,
            po_no, purchase_date, warranty, warranty_duration, warranty_parts,
            unique_no, model, colour, chasis_no, motor_no, controller_no,
            volt, amp, breakdown_volt, size, watt, controller_type
        );
        res.json({ id: info.lastInsertRowid, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/inventory/:id', (req, res) => {
    const { quantity } = req.body;
    db.prepare('UPDATE inventory SET quantity = ? WHERE id = ?').run(quantity, req.params.id);
    res.json({ success: true });
});

// Customers
app.get('/api/customers', (req, res) => {
    const rows = db.prepare('SELECT * FROM customers ORDER BY id DESC').all();
    res.json(rows);
});

app.post('/api/customers', (req, res) => {
    const { name, phone, vehicle_registration, purchase_date, uptime_pass_status, uptime_pass_expiry, aadhar_number, address, alt_phone } = req.body;

    // Check if customer with same phone exists (Enforce Unique Mobile)
    const existing = db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone);

    if (existing) {
        // Update existing record with latest details
        // Note: This overwrites vehicle_registration to the latest one, which matches the "Unique Mobile" requirement for the profile.
        // Sales history is preserved in the 'sales' table.
        db.prepare(`UPDATE customers SET 
            name = ?, vehicle_registration = ?, purchase_date = ?, uptime_pass_status = ?, uptime_pass_expiry = ?, 
            aadhar_number = ?, address = ?, alt_phone = ? 
            WHERE id = ?`).run(
            name, vehicle_registration, purchase_date, uptime_pass_status, uptime_pass_expiry || existing.uptime_pass_expiry,
            aadhar_number, address, alt_phone, existing.id
        );
        return res.json({ id: existing.id, ...req.body });
    }

    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const referral_code = `VU-${random}`;

    const info = db.prepare('INSERT INTO customers (name, phone, vehicle_registration, purchase_date, uptime_pass_status, uptime_pass_expiry, aadhar_number, address, alt_phone, referral_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(name, phone, vehicle_registration, purchase_date, uptime_pass_status, uptime_pass_expiry, aadhar_number, address, alt_phone, referral_code);

    // Auto-sync to referrals table
    try {
        const existingRef = db.prepare('SELECT id FROM referrals WHERE phone = ?').get(phone);
        if (existingRef) {
            db.prepare('UPDATE referrals SET referral_code = ?, name = ?, address = ?, aadhar_no = ? WHERE id = ?').run(
                referral_code, name, address, aadhar_number, existingRef.id
            );
        } else {
            db.prepare('INSERT INTO referrals (name, phone, address, aadhar_no, referral_code) VALUES (?, ?, ?, ?, ?)').run(
                name, phone, address, aadhar_number, referral_code
            );
        }
    } catch (e) {
        console.error('Failed to sync referral code:', e.message);
    }

    res.json({ id: info.lastInsertRowid, ...req.body, referral_code });
});

// Sales
app.get('/api/sales', (req, res) => {
    const rows = db.prepare('SELECT * FROM sales ORDER BY sale_date DESC').all();
    res.json(rows);
});

app.post('/api/sales', (req, res) => {
    const {
        customer_name, vehicle_reg, selling_price, payment_mode, uptime_pass,
        cash_upi_amount, cash_cash_amount, cash_collected_by,
        finance_down_payment, finance_dp_cash, finance_dp_cash_by, finance_dp_upi,
        finance_loan_number, finance_emi, finance_tenure, finance_schedule, finance_start_date, finance_bank,
        battery_type, battery_id, battery_driver_id,
        vehicle_inventory_sku, battery_inventory_sku, sale_date,
        salesperson, referral, vehicle_sku, vehicle_model, battery_sku,
        aadhar_number, address, alt_phone, phone // Added phone
    } = req.body;

    console.log('[API] New Sale Request:', { customer_name, phone, vehicle_reg, payment_mode, selling_price });

    // Run transaction
    const makeSale = db.transaction(() => {
        // Generate unique sale_no
        const lastSale = db.prepare('SELECT sale_no FROM sales ORDER BY id DESC LIMIT 1').get();
        let nextNum = 1;
        if (lastSale && lastSale.sale_no) {
            const parts = lastSale.sale_no.split('-');
            if (parts.length > 1) {
                const num = parseInt(parts[1], 10);
                if (!isNaN(num)) nextNum = num + 1;
            }
        }
        const saleNo = `SALE-${String(nextNum).padStart(4, '0')}`;
        console.log('[API] Generated Sale No:', saleNo);

        const insert = db.prepare(`
            INSERT INTO sales (
                sale_no, customer_name, vehicle_reg, selling_price, payment_mode, uptime_pass,
                cash_upi_amount, cash_cash_amount, cash_collected_by,
                finance_down_payment, finance_dp_cash, finance_dp_cash_by, finance_dp_upi,
                finance_loan_number, finance_emi, finance_tenure, finance_schedule, finance_start_date, finance_bank,
                battery_type, battery_id, battery_driver_id, sale_date, showroom,
                salesperson, referral, vehicle_sku, vehicle_model, battery_sku,
                aadhar_number, address, alt_phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Prepare values to ensure no undefineds slip through as silent errors in some sqlite versions
        const values = [
            saleNo, customer_name, vehicle_reg, selling_price, payment_mode, uptime_pass ? 1 : 0,
            cash_upi_amount || 0, cash_cash_amount || 0, cash_collected_by,
            finance_down_payment || 0, finance_dp_cash || 0, finance_dp_cash_by, finance_dp_upi || 0,
            finance_loan_number, finance_emi, finance_tenure, finance_schedule, finance_start_date, finance_bank,
            battery_type, battery_id, battery_driver_id, sale_date || new Date().toISOString().split('T')[0],
            req.body.showroom || 'Main Showroom',
            salesperson, referral,
            vehicle_sku || vehicle_inventory_sku,
            vehicle_model || vehicle_reg,
            battery_sku || battery_inventory_sku,
            aadhar_number, address, alt_phone
        ];

        const info = insert.run(...values);
        console.log('[API] Sale Inserted:', info.lastInsertRowid);

        // Update Vehicle Inventory (Mark as Sold with Customer Details)
        if (vehicle_inventory_sku) {
            const statusLabel = `${customer_name} (${phone})`;
            const result = db.prepare("UPDATE inventory SET status = ?, customer_id = (SELECT id FROM customers WHERE phone = ? AND vehicle_registration = ? LIMIT 1) WHERE sku = ?")
                .run(statusLabel, phone, vehicle_reg, vehicle_inventory_sku);
            console.log('[API] Inventory Updated:', result.changes);
        }

        // Update Battery Inventory (Remove/Deduct if fixed)
        if (battery_type === 'Fixed battery' && battery_inventory_sku) {
            const statusLabel = `${customer_name} (${phone})`;
            const result = db.prepare("UPDATE inventory SET status = ?, customer_id = (SELECT id FROM customers WHERE phone = ? AND vehicle_registration = ? LIMIT 1) WHERE sku = ?")
                .run(statusLabel, phone, vehicle_reg, battery_inventory_sku);
        }

        // --- NEW: Record Payments in payments table ---
        const paymentDate = sale_date || new Date().toISOString().split('T')[0];

        if (payment_mode === 'cash') {
            if (cash_upi_amount > 0) {
                db.prepare('INSERT INTO payments (sale_no, amount, payment_mode, collected_by, upi_account, payment_date) VALUES (?, ?, ?, ?, ?, ?)').run(
                    saleNo, cash_upi_amount, 'UPI', cash_collected_by || salesperson, req.body.cash_upi_account || 'Main', paymentDate
                );
            }
            if (cash_cash_amount > 0) {
                db.prepare('INSERT INTO payments (sale_no, amount, payment_mode, collected_by, cash_by_whom, payment_date) VALUES (?, ?, ?, ?, ?, ?)').run(
                    saleNo, cash_cash_amount, 'Cash', cash_collected_by || salesperson, cash_collected_by || salesperson, paymentDate
                );
            }
        } else if (payment_mode === 'finance') {
            if (finance_dp_upi > 0) {
                db.prepare('INSERT INTO payments (sale_no, amount, payment_mode, collected_by, upi_account, payment_date) VALUES (?, ?, ?, ?, ?, ?)').run(
                    saleNo, finance_dp_upi, 'UPI', finance_dp_cash_by || salesperson, req.body.finance_dp_upi_account || 'Main', paymentDate
                );
            }
            if (finance_dp_cash > 0) {
                db.prepare('INSERT INTO payments (sale_no, amount, payment_mode, collected_by, cash_by_whom, payment_date) VALUES (?, ?, ?, ?, ?, ?)').run(
                    saleNo, finance_dp_cash, 'Cash', finance_dp_cash_by || salesperson, finance_dp_cash_by || salesperson, paymentDate
                );
            }
        }

        return info;
    });

    try {
        const info = makeSale();
        res.json({ id: info.lastInsertRowid, ...req.body });
    } catch (err) {
        console.error('[API Error] Sale Creation Failed:', err);
        // Clean error message for frontend
        const message = err.message.includes('UNIQUE constraint') ? 'Sale No or Vehicle Reg already exists.' : err.message;
        res.status(500).json({ error: message, details: err.message });
    }
});

// Referrals
app.get('/api/referrals', (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT r.*, 
            (SELECT COUNT(*) FROM sales WHERE referral = r.referral_code) as conversion_count,
            (SELECT COUNT(*) FROM sales WHERE referral = r.referral_code) * r.referral_amount as total_earned
            FROM referrals r 
            ORDER BY r.id DESC
        `).all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/referrals', (req, res) => {
    try {
        const { name, phone, address, pan_no, aadhar_no, referral_code, referral_amount } = req.body;
        const amount = referral_amount || 500;
        const info = db.prepare('INSERT INTO referrals (name, phone, address, pan_no, aadhar_no, referral_code, referral_amount) VALUES (?, ?, ?, ?, ?, ?, ?)').run(name, phone, address, pan_no, aadhar_no, referral_code, amount);
        res.json({ id: info.lastInsertRowid, ...req.body, referral_amount: amount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/referrals/:id', (req, res) => {
    try {
        const { referral_amount } = req.body;
        db.prepare('UPDATE referrals SET referral_amount = ? WHERE id = ?').run(referral_amount, req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/referrals/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM referrals WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Service Records
app.get('/api/service-records', (req, res) => {
    const rows = db.prepare('SELECT * FROM service_records ORDER BY service_date DESC').all();
    res.json(rows.map(r => ({ ...r, parts_used: JSON.parse(r.parts_used || '[]') })));
});

app.post('/api/service-records', (req, res) => {
    try {
        const { phone, customer_name, vehicle_registration, problem, raised_by, rsa_required, rsa_location, showroom, assigned_serviceman_id, assigned_serviceman_name } = req.body;

        let assignedId = assigned_serviceman_id;
        let assignedName = assigned_serviceman_name;

        // Auto-allocation logic (only if not manually assigned)
        if (!assignedId) {
            const servicemen = db.prepare("SELECT id, name FROM employees WHERE status = 'active' AND designation = 'Serviceman' AND availability_status = 'online'").all();

            if (servicemen.length > 0) {
                const lastTicket = db.prepare('SELECT assigned_serviceman_id FROM service_records WHERE assigned_serviceman_id IS NOT NULL ORDER BY id DESC LIMIT 1').get();
                let nextIndex = 0;
                if (lastTicket) {
                    const lastIdx = servicemen.findIndex(s => s.id === lastTicket.assigned_serviceman_id);
                    nextIndex = (lastIdx + 1) % servicemen.length;
                }
                assignedId = servicemen[nextIndex].id;
                assignedName = servicemen[nextIndex].name;
            }
        }

        const ticketNo = `SR-${Date.now().toString().slice(-6)}`;
        console.log('Raising Ticket:', { ticketNo, customer_name, assignedName, showroom });

        const info = db.prepare(`
            INSERT INTO service_records (
                ticket_no, phone, customer_name, vehicle_registration, 
                issue_description, raised_by, rsa_required, rsa_location,
                assigned_serviceman_id, assigned_serviceman_name, status, showroom
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            ticketNo,
            phone || '',
            customer_name || 'Generic Rider',
            vehicle_registration || 'N/A',
            problem || 'General Checkup',
            raised_by || 'Employee',
            rsa_required ? 1 : 0,
            rsa_location || '',
            assignedId,
            assignedName,
            'OPEN',
            showroom || 'Main Showroom'
        );

        res.json({ id: info.lastInsertRowid, ticket_no: ticketNo, assigned_serviceman_name: assignedName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/service-records/:id', (req, res) => {
    try {
        const {
            status, exact_issue, parts_used, estimated_tat, estimated_cost,
            customer_consent, checklist_solved, checklist_test_drive,
            checklist_no_parts_left, checklist_replaced_returned,
            customer_feedback, payment_mode, total_charge, parts_charge, labor_charge
        } = req.body;

        const current = db.prepare('SELECT * FROM service_records WHERE id = ?').get(req.params.id);
        if (!current) return res.status(404).json({ error: 'Ticket not found' });

        let diagnosisStart = current.diagnosis_start_time;
        if (status === 'DIAGNOSIS' && !diagnosisStart) {
            diagnosisStart = new Date().toISOString();
        }

        let closingTime = current.closing_time;
        if (status === 'CLOSED' && !closingTime) {
            closingTime = new Date().toISOString();
        }

        db.prepare(`
            UPDATE service_records SET 
                status = ?, exact_issue = ?, parts_used = ?, estimated_tat = ?, 
                estimated_cost = ?, customer_consent = ?, checklist_solved = ?, 
                checklist_test_drive = ?, checklist_no_parts_left = ?, 
                checklist_replaced_returned = ?, customer_feedback = ?, 
                payment_mode = ?, diagnosis_start_time = ?, closing_time = ?,
                total_charge = ?, parts_charge = ?, labor_charge = ?
            WHERE id = ?
        `).run(
            status || current.status,
            exact_issue !== undefined ? exact_issue : current.exact_issue,
            parts_used ? JSON.stringify(parts_used) : current.parts_used,
            estimated_tat !== undefined ? estimated_tat : current.estimated_tat,
            estimated_cost !== undefined ? estimated_cost : current.estimated_cost,
            customer_consent !== undefined ? customer_consent : current.customer_consent,
            checklist_solved !== undefined ? checklist_solved : current.checklist_solved,
            checklist_test_drive !== undefined ? checklist_test_drive : current.checklist_test_drive,
            checklist_no_parts_left !== undefined ? checklist_no_parts_left : current.checklist_no_parts_left,
            checklist_replaced_returned !== undefined ? checklist_replaced_returned : current.checklist_replaced_returned,
            customer_feedback !== undefined ? customer_feedback : current.customer_feedback,
            payment_mode !== undefined ? payment_mode : current.payment_mode,
            diagnosisStart,
            closingTime,
            total_charge !== undefined ? total_charge : current.total_charge,
            parts_charge !== undefined ? parts_charge : current.parts_charge,
            labor_charge !== undefined ? labor_charge : current.labor_charge,
            req.params.id
        );

        // If ticket is CLOSED, sync to sales, payments, and customers
        if (status === 'CLOSED') {
            const sr = db.prepare('SELECT * FROM service_records WHERE id = ?').get(req.params.id);

            // 1. Update/Create Rider Profile (Sync Logic)
            const existingCust = db.prepare('SELECT id FROM customers WHERE phone = ?').get(sr.phone);
            let custId;
            if (existingCust) {
                custId = existingCust.id;
                // Only update Name and Reg if they are provided in service record, keeping profile fresh
                db.prepare('UPDATE customers SET name = ?, vehicle_registration = ? WHERE id = ?').run(sr.customer_name, sr.vehicle_registration, custId);
            } else {
                const random = Math.random().toString(36).substring(2, 7).toUpperCase();
                // Create new basic profile
                const info = db.prepare('INSERT INTO customers (name, phone, vehicle_registration, referral_code, purchase_date) VALUES (?, ?, ?, ?, ?)').run(
                    sr.customer_name, sr.phone, sr.vehicle_registration, `VU-${random}`, new Date().toISOString().split('T')[0]
                );
                custId = info.lastInsertRowid;
            }

            // 2. Add to Sales
            const saleNo = `SRV-${Date.now().toString().slice(-6)}`;
            db.prepare(`
                INSERT INTO sales (
                    sale_no, customer_name, vehicle_reg, selling_price, payment_mode, 
                    business_type, showroom, sale_date, alt_phone
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                saleNo, sr.customer_name, sr.vehicle_registration, sr.total_charge, sr.payment_mode,
                'service', sr.showroom, new Date().toISOString(), sr.phone
            );

            // 3. Update Payments (Detailed)
            const paymentDate = new Date().toISOString();
            const { cash_upi_amount, cash_upi_account, cash_cash_amount, cash_collected_by } = req.body;

            // If it's a split payment (detailed)
            if (cash_upi_amount > 0 || cash_cash_amount > 0) {
                if (cash_upi_amount > 0) {
                    db.prepare('INSERT INTO payments (sale_no, amount, payment_mode, collected_by, upi_account, payment_date) VALUES (?, ?, ?, ?, ?, ?)').run(
                        saleNo, cash_upi_amount, 'UPI', cash_collected_by || 'Service Manager', cash_upi_account || 'Main', paymentDate
                    );
                }
                if (cash_cash_amount > 0) {
                    db.prepare('INSERT INTO payments (sale_no, amount, payment_mode, collected_by, cash_by_whom, payment_date) VALUES (?, ?, ?, ?, ?, ?)').run(
                        saleNo, cash_cash_amount, 'Cash', cash_collected_by || 'Service Manager', cash_collected_by || 'Service Manager', paymentDate
                    );
                }
            } else {
                // Fallback for simple payment
                db.prepare('INSERT INTO payments (sale_no, amount, payment_mode, collected_by, payment_date) VALUES (?, ?, ?, ?, ?)').run(
                    saleNo, sr.total_charge, sr.payment_mode, 'Service Manager', paymentDate
                );
            }

            // 4. Update Inventory
            const used = JSON.parse(sr.parts_used || '[]');
            used.forEach(part => {
                db.prepare('UPDATE inventory SET quantity = quantity - ? WHERE sku = ?').run(part.qty || 1, part.sku);
            });
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Payments
app.get('/api/payments', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM payments ORDER BY payment_date DESC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/payments', (req, res) => {
    try {
        const { sale_no, amount, payment_mode, collected_by, payment_date } = req.body;
        const info = db.prepare('INSERT INTO payments (sale_no, amount, payment_mode, collected_by, payment_date) VALUES (?, ?, ?, ?, ?)').run(
            sale_no, amount, payment_mode, collected_by, payment_date || new Date().toISOString()
        );
        res.json({ id: info.lastInsertRowid, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Expenses
app.get('/api/expenses', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM expenses ORDER BY expense_date DESC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/expenses', (req, res) => {
    try {
        const { voucher_no, associated_no, expense_type, expense_date, given_to, amount, paid_by, paid_via, cash_by_whom, upi_account } = req.body;
        const info = db.prepare('INSERT INTO expenses (voucher_no, associated_no, expense_type, expense_date, given_to, amount, paid_by, paid_via, cash_by_whom, upi_account) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
            voucher_no, associated_no, expense_type, expense_date || new Date().toISOString().split('T')[0], given_to, amount, paid_by, paid_via, cash_by_whom, upi_account
        );
        res.json({ id: info.lastInsertRowid, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RSA
app.get('/api/rsa', (req, res) => {
    const rows = db.prepare('SELECT * FROM rsa_tracking ORDER BY id DESC').all();
    res.json(rows);
});

app.post('/api/rsa', (req, res) => {
    const { service_record_id, customer_location, dispatch_time, serviceman_name, status } = req.body;
    const info = db.prepare('INSERT INTO rsa_tracking (service_record_id, customer_location, dispatch_time, serviceman_name, status) VALUES (?, ?, ?, ?, ?)').run(service_record_id, customer_location, dispatch_time, serviceman_name, status);
    res.json({ id: info.lastInsertRowid, ...req.body });
});

// Backup
app.get('/api/backup', (req, res) => {
    const backup = {
        leads: db.prepare('SELECT * FROM leads').all(),
        inventory: db.prepare('SELECT * FROM inventory').all(),
        customers: db.prepare('SELECT * FROM customers').all(),
        sales: db.prepare('SELECT * FROM sales').all(),
        service_records: db.prepare('SELECT * FROM service_records').all().map(r => ({ ...r, parts_used: JSON.parse(r.parts_used || '[]') })),
        rsa_tracking: db.prepare('SELECT * FROM rsa_tracking').all(),
        payments: db.prepare('SELECT * FROM payments').all(),
        expenses: db.prepare('SELECT * FROM expenses').all(),
        exported_at: new Date().toISOString(),
        partner: 'Abnish - VAYU'
    };
    res.json(backup);
});

// Employees
app.get('/api/employees', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM employees ORDER BY id DESC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/employees', (req, res) => {
    try {
        const { name, mobile, email, dob, aadhar_no, department, designation, manager_name, date_of_joining } = req.body;

        // Generate unique employee ID
        const count = db.prepare('SELECT COUNT(*) as total FROM employees').get().total;
        const employee_id = `VU-EMP-${String(count + 1).padStart(3, '0')}`;

        const info = db.prepare(`
            INSERT INTO employees (employee_id, name, mobile, email, dob, aadhar_no, department, designation, manager_name, date_of_joining)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(employee_id, name, mobile, email, dob, aadhar_no, department, designation, manager_name, date_of_joining);

        res.json({ id: info.lastInsertRowid, employee_id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/employees/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update employee status (Active/Inactive + Online/Offline)
app.put('/api/employees/status', (req, res) => {
    try {
        const { id, status, availability_status } = req.body;
        db.prepare(`UPDATE employees SET status = ?, availability_status = ? WHERE id = ?`)
            .run(status || 'active', availability_status || 'offline', id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Attendance Management
app.get('/api/attendance', (req, res) => {
    try {
        const { date } = req.query;
        let query = 'SELECT a.*, e.name as employee_name, e.designation FROM attendance a LEFT JOIN employees e ON a.employee_id = e.id';
        const params = [];

        if (date) {
            query += ' WHERE a.date = ?';
            params.push(date);
        }

        const records = db.prepare(query).all(...params);
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/attendance/clock-in', (req, res) => {
    try {
        const { employee_id } = req.body; // Using ID from employees table
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        // Check if already clocked in (has an open session)
        const openSession = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ? AND clock_out IS NULL').get(employee_id, today);

        if (openSession) {
            return res.status(400).json({ error: 'You are already clocked in. Please clock out first.' });
        }

        const info = db.prepare(`
            INSERT INTO attendance (employee_id, date, clock_in, status, clock_in_photo, clock_in_location)
            VALUES (?, ?, ?, 'Present', ?, ?)
        `).run(employee_id, today, now, req.body.photo || null, req.body.location || null);

        // Also update availability status to online
        db.prepare("UPDATE employees SET availability_status = 'online', status = 'active' WHERE id = ?").run(employee_id);

        res.json({ success: true, id: info.lastInsertRowid, clock_in: now });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/attendance/clock-out', (req, res) => {
    try {
        const { employee_id } = req.body;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        // Find the active open session to close
        const record = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ? AND clock_out IS NULL').get(employee_id, today);

        if (!record) {
            return res.status(404).json({ error: 'No active attendance session found to clock out.' });
        }

        // Calculate total hours
        const startTime = new Date(record.clock_in);
        const endTime = new Date(now);
        const hours = (endTime - startTime) / (1000 * 60 * 60);

        db.prepare('UPDATE attendance SET clock_out = ?, total_hours = ?, clock_out_photo = ?, clock_out_location = ? WHERE id = ?')
            .run(now, hours.toFixed(2), req.body.photo || null, req.body.location || null, record.id);

        // Update availability to offline
        db.prepare("UPDATE employees SET availability_status = 'offline' WHERE id = ?").run(employee_id);

        res.json({ success: true, clock_out: now, total_hours: hours.toFixed(2) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Roles Management
app.get('/api/roles', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM roles ORDER BY created_at DESC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/roles', (req, res) => {
    try {
        const { role_name, description } = req.body;
        const info = db.prepare('INSERT INTO roles (role_name, description) VALUES (?, ?)').run(role_name, description);
        res.json({ id: info.lastInsertRowid, role_name, description });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/roles/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM roles WHERE id = ?').run(req.params.id);
        db.prepare('DELETE FROM permission_matrix WHERE role_id = ?').run(req.params.id);
        db.prepare('DELETE FROM user_roles WHERE role_id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Permission Matrix Management
app.get('/api/permission-matrix', (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT pm.*, r.role_name 
            FROM permission_matrix pm
            LEFT JOIN roles r ON pm.role_id = r.id
        `).all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/permission-matrix', (req, res) => {
    try {
        const { role_id, module, can_view, can_edit, can_delete } = req.body;
        db.prepare(`
            INSERT OR REPLACE INTO permission_matrix (role_id, module, can_view, can_edit, can_delete) 
            VALUES (?, ?, ?, ?, ?)
        `).run(role_id, module, can_view || 0, can_edit || 0, can_delete || 0);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/permission-matrix/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM permission_matrix WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Role Assignments
app.get('/api/user-roles', (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT ur.*, r.role_name, a.name as user_name
            FROM user_roles ur
            LEFT JOIN roles r ON ur.role_id = r.id
            LEFT JOIN accounts a ON ur.user_email = a.email
            ORDER BY ur.assigned_at DESC
        `).all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/user-roles', (req, res) => {
    try {
        const { user_email, role_id } = req.body;
        const info = db.prepare('INSERT OR IGNORE INTO user_roles (user_email, role_id) VALUES (?, ?)').run(user_email, role_id);
        res.json({ id: info.lastInsertRowid, user_email, role_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/user-roles/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM user_roles WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Update profile/login to include permissions
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`[Auth] Login Attempt: ${email}`);

    try {
        const user = db.prepare('SELECT * FROM accounts WHERE email = ? AND password = ?').get(email, password);

        if (user) {
            if (user.status !== 'approved' && user.status !== 'active') {
                console.log(`[Auth] Login Blocked (Pending): ${email}`);
                return res.status(403).json({ error: 'Account pending approval' });
            }

            // Get permissions based on assigned roles
            let permissions = {};

            if (user.role === 'super_admin' || user.role === 'admin') {
                // Full access for admins
                const allModules = ['dashboard', 'leads', 'raw_leads', 'sales', 'payments', 'expenses', 'inventory', 'customers', 'service', 'rsa', 'reports', 'referrals', 'employees', 'access'];
                allModules.forEach(module => {
                    permissions[module] = { view: true, edit: true, delete: true };
                });
            } else {
                // Get user's assigned roles
                const userRoles = db.prepare('SELECT role_id FROM user_roles WHERE user_email = ?').all(email);

                if (userRoles.length > 0) {
                    const roleIds = userRoles.map(r => r.role_id);

                    // Aggregate permissions from all roles (OR logic - if any role grants access, user has it)
                    roleIds.forEach(roleId => {
                        const rolePerms = db.prepare('SELECT module, can_view, can_edit, can_delete FROM permission_matrix WHERE role_id = ?').all(roleId);

                        rolePerms.forEach(perm => {
                            if (!permissions[perm.module]) {
                                permissions[perm.module] = { view: false, edit: false, delete: false };
                            }
                            permissions[perm.module].view = permissions[perm.module].view || perm.can_view === 1;
                            permissions[perm.module].edit = permissions[perm.module].edit || perm.can_edit === 1;
                            permissions[perm.module].delete = permissions[perm.module].delete || perm.can_delete === 1;
                        });
                    });
                }
            }

            console.log(`[Auth] Login Success: ${email} (Role: ${user.role}, Modules: ${Object.keys(permissions).length})`);
            // Sanitize user object
            const { password: _, ...safeUser } = user;

            // Check for linked employee record
            const employee = db.prepare('SELECT id FROM employees WHERE email = ?').get(email);
            if (employee) {
                safeUser.employee_table_id = employee.id;
            }

            res.json({ user: safeUser, permissions });
        } else {
            console.log(`[Auth] Login Failed (Invalid Credentials): ${email}`);
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(`[Auth] Login Error:`, err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/profile', (req, res) => {
    const email = req.query.email;
    console.log(`[Auth] Profile Fetch: ${email}`);

    try {
        const user = db.prepare('SELECT * FROM accounts WHERE email = ?').get(email);
        if (!user) return res.status(404).json({ error: 'User not found' });

        let permissions = {};

        if (user.role === 'super_admin' || user.role === 'admin') {
            const allModules = ['dashboard', 'leads', 'raw_leads', 'sales', 'payments', 'expenses', 'inventory', 'customers', 'service', 'rsa', 'reports', 'referrals', 'employees', 'access'];
            allModules.forEach(module => {
                permissions[module] = { view: true, edit: true, delete: true };
            });
        } else {
            const userRoles = db.prepare('SELECT role_id FROM user_roles WHERE user_email = ?').all(email);

            if (userRoles.length > 0) {
                const roleIds = userRoles.map(r => r.role_id);

                roleIds.forEach(roleId => {
                    const rolePerms = db.prepare('SELECT module, can_view, can_edit, can_delete FROM permission_matrix WHERE role_id = ?').all(roleId);

                    rolePerms.forEach(perm => {
                        if (!permissions[perm.module]) {
                            permissions[perm.module] = { view: false, edit: false, delete: false };
                        }
                        permissions[perm.module].view = permissions[perm.module].view || perm.can_view === 1;
                        permissions[perm.module].edit = permissions[perm.module].edit || perm.can_edit === 1;
                        permissions[perm.module].delete = permissions[perm.module].delete || perm.can_delete === 1;
                    });
                });
            }
        }

        const { password: _, ...safeUser } = user;

        // Check for linked employee record
        const employee = db.prepare('SELECT id FROM employees WHERE email = ?').get(email);
        if (employee) {
            safeUser.employee_table_id = employee.id;
        }

        res.json({ user: safeUser, permissions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/employees/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const inactiveDate = status === 'inactive' ? new Date().toISOString() : null;
        db.prepare('UPDATE employees SET status = ?, inactive_date = ? WHERE id = ?').run(status, inactiveDate, req.params.id);
        res.json({ success: true, status, inactive_date: inactiveDate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`VAYU Backend running at http://localhost:${port}`);
});
