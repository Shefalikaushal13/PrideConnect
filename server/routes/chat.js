import express from 'express';

const router = express.Router();

// Get chat history
router.get('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const offset = (page - 1) * limit;
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        user:user_profiles(id, name, avatar_url)
      `)
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data.reverse()); // Reverse to show oldest first
    
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save AI chat conversation
router.post('/ai/save', async (req, res) => {
  try {
    const { userId, messages, sessionId, context } = req.body;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .insert({
        user_id: userId,
        session_id: sessionId,
        messages: messages,
        context: context,
        created_at: new Date()
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
    
  } catch (error) {
    console.error('Save AI chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get AI chat history for user
router.get('/ai/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .select('session_id, context, created_at, messages')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data);
    
  } catch (error) {
    console.error('AI chat history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as chatRoutes };