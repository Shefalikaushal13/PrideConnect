import express from 'express';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      pronouns,
      location,
      interests,
      seekingTherapist,
      preferredLanguage,
      phone,
      dateOfBirth,
      emergencyContact
    } = req.body;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          pronouns,
          location
        }
      }
    });
    
    if (authError) {
      return res.status(400).json({ error: authError.message });
    }
    
    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        pronouns,
        location,
        interests,
        seeking_therapist: seekingTherapist,
        preferred_language: preferredLanguage,
        phone,
        date_of_birth: dateOfBirth,
        emergency_contact: emergencyContact,
        created_at: new Date()
      });
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue anyway, profile can be updated later
    }
    
    res.json({
      user: authData.user,
      message: 'Registration successful'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    res.json({
      user: data.user,
      profile,
      session: data.session
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({ message: 'Logout successful' });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    res.json({
      user,
      profile
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as authRoutes };