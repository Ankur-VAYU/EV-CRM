const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'vayu.db'));

db.exec(`
  -- Initial Inventory
  INSERT OR IGNORE INTO inventory (item_type, item_name, sku, quantity, unit_cost, reorder_level) VALUES 
  ('scooter', 'EV Scooter - Model A', 'SC-001', 12, 21000, 5),
  ('battery', 'Li-ion Battery 48V', 'BAT-001', 8, 8000, 3),
  ('charger', 'Fast Charger', 'CHG-001', 15, 2000, 5),
  ('spare-part', 'Brake Pads', 'SP-001', 25, 150, 10),
  ('spare-part', 'Cables Set', 'SP-002', 18, 200, 8);

  -- Initial Leads
  INSERT OR IGNORE INTO leads (name, phone, source, status, notes) VALUES 
  ('Rajesh Kumar', '9876543210', 'delivery-hub', 'test-ride', 'Interested in yellow model'),
  ('Priya Sharma', '9876543211', 'walk-in', 'contacted', 'Considering finance options');

  -- Initial Customers
  INSERT OR IGNORE INTO customers (name, phone, vehicle_registration, purchase_date, uptime_pass_status, uptime_pass_expiry) VALUES 
  ('Amit Singh', '9876543212', 'DL-01-AB-1234', '2026-01-15', 'active', '2026-02-15'),
  ('Rahul Kumar', '9876543213', 'DL-01-CD-5678', '2026-01-20', 'active', '2026-02-20');

  -- Initial Sales
  INSERT OR IGNORE INTO sales (customer_name, vehicle_reg, selling_price, payment_mode, uptime_pass) VALUES 
  ('Amit Singh', 'DL-01-AB-1234', 38000, 'upi', 1);
`);

console.log('Database seeded successfully!');
