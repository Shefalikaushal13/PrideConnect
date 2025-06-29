import { createClient } from '@supabase/supabase-js';

export const initializeSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found. Database features will be limited.');
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase initialized successfully');
    return supabase;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    return null;
  }
};

// Database schema setup
export const setupDatabase = async (supabase) => {
  if (!supabase) return;

  try {
    // Create tables if they don't exist
    const { error: usersError } = await supabase.rpc('create_users_table');
    const { error: jobsError } = await supabase.rpc('create_jobs_table');
    const { error: eventsError } = await supabase.rpc('create_events_table');
    const { error: chatsError } = await supabase.rpc('create_chats_table');

    if (usersError) console.log('Users table setup:', usersError.message);
    if (jobsError) console.log('Jobs table setup:', jobsError.message);
    if (eventsError) console.log('Events table setup:', eventsError.message);
    if (chatsError) console.log('Chats table setup:', chatsError.message);

    console.log('✅ Database schema setup completed');
  } catch (error) {
    console.error('❌ Database setup error:', error);
  }
};