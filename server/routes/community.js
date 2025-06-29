import express from 'express';

const router = express.Router();

// Get community members
router.get('/members', async (req, res) => {
  try {
    const { page = 1, limit = 20, location, interests } = req.query;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    let query = supabase
      .from('user_profiles')
      .select('id, name, pronouns, location, interests, avatar_url, is_online', { count: 'exact' })
      .eq('is_public', true);
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (interests) {
      query = query.contains('interests', [interests]);
    }
    
    const offset = (page - 1) * limit;
    query = query
      .order('is_online', { ascending: false })
      .order('name')
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      members: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('Community members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send connection request
router.post('/connect', async (req, res) => {
  try {
    const { fromUserId, toUserId, message } = req.body;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { data, error } = await supabase
      .from('connection_requests')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        message: message,
        status: 'pending',
        created_at: new Date()
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Notify target user
    const { io } = await import('../index.js');
    io.to(`user:${toUserId}`).emit('connection:request', data);
    
    res.json(data);
    
  } catch (error) {
    console.error('Connection request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user connections
router.get('/connections/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        user1:user_profiles!connections_user1_id_fkey(id, name, pronouns, avatar_url, is_online),
        user2:user_profiles!connections_user2_id_fkey(id, name, pronouns, avatar_url, is_online)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'accepted');
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Format connections to show the other user
    const connections = data.map(conn => ({
      ...conn,
      connectedUser: conn.user1_id === userId ? conn.user2 : conn.user1
    }));
    
    res.json(connections);
    
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as communityRoutes };