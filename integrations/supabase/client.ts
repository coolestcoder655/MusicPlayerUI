
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.PROJECT_URL
const supabaseKey = process.env.SUPABASE_KEY
if (!supabaseUrl) {
  throw new Error('PROJECT_URL environment variable is not set');
}

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY environment variable is not set');
}
const supabase = createClient(supabaseUrl, supabaseKey)