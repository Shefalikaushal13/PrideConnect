import express from 'express';

const router = express.Router();

// Get all events with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      location,
      category,
      startDate,
      endDate,
      isVirtual
    } = req.query;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    if (isVirtual !== undefined) {
      query = query.eq('is_virtual', isVirtual === 'true');
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    query = query
      .order('date', { ascending: true })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      events: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('Events API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new event
router.post('/', async (req, res) => {
  try {
    const eventData = req.body;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        created_at: new Date()
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Broadcast new event to subscribers
    const { io } = await import('../index.js');
    io.emit('events:new', data);
    
    res.status(201).json(data);
    
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// RSVP to event
router.post('/:id/rsvp', async (req, res) => {
  try {
    const { userId, status } = req.body;
    const eventId = req.params.id;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { data, error } = await supabase
      .from('event_rsvps')
      .upsert({
        user_id: userId,
        event_id: eventId,
        status: status,
        rsvp_date: new Date()
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Update attendee count
    const { data: rsvpCount } = await supabase
      .from('event_rsvps')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'attending');
    
    await supabase
      .from('events')
      .update({ attendees: rsvpCount.count })
      .eq('id', eventId);
    
    // Broadcast RSVP update
    const { io } = await import('../index.js');
    io.emit('events:rsvp:update', {
      eventId,
      userId,
      status,
      newCount: rsvpCount.count
    });
    
    res.json(data);
    
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as eventRoutes };