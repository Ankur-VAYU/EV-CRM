const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase_url_here')) {
    console.warn('⚠️  Supabase environment variables are not set or using placeholders.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
