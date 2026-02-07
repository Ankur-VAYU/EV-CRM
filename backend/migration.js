const supabase = require('./supabaseClient');
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'vayu.db'));

async function migrate() {
    console.log('🏁 Starting migration to Supabase...');

    const tables = [
        'showrooms', 'roles', 'permission_matrix', 'accounts', 'employees',
        'leads', 'raw_leads', 'inventory', 'sales', 'payments', 
        'service_records', 'attendance', 'audit_logs', 'referrals', 'lead_notes'
    ];

    for (const table of tables) {
        try {
            console.log(`📦 Migrating table: ${table}...`);
            const rows = db.prepare(`SELECT * FROM ${table}`).all();
            
            if (rows.length === 0) {
                console.log(`⚠️ Table ${table} is empty, skipping.`);
                continue;
            }

            // Remove 'id' if you want Supabase to handle it, 
            // but for migration keep it to preserve foreign relationships
            const { data, error } = await supabase.from(table).upsert(rows);

            if (error) {
                console.error(`❌ Error migrating ${table}: `, error.message);
            } else {
                console.log(`✅ Successfully migrated ${rows.length} rows to ${table}.`);
            }
        } catch (e) {
            console.error(`❌ Table ${table} does not exist in local DB or error occurred: `, e.message);
        }
    }

    console.log('🎉 Migration finished!');
}

migrate();
