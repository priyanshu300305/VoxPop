import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Utility functions
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function analyzeText(text: string, category?: string): { topic: string; sentiment: string } {
  // Simple AI analysis simulation - in a real app, this would call an LLM API
  const topics = ['Academic', 'Campus Safety', 'Dining', 'Housing', 'IT/Technology', 'Mental Health', 'Transportation', 'Other'];
  
  const lowercaseText = text.toLowerCase();
  let detectedTopic = category || 'Other';
  
  if (!category) {
    if (lowercaseText.includes('class') || lowercaseText.includes('professor') || lowercaseText.includes('study') || lowercaseText.includes('grade')) {
      detectedTopic = 'Academic';
    } else if (lowercaseText.includes('safety') || lowercaseText.includes('security') || lowercaseText.includes('emergency')) {
      detectedTopic = 'Campus Safety';
    } else if (lowercaseText.includes('food') || lowercaseText.includes('dining') || lowercaseText.includes('cafeteria') || lowercaseText.includes('meal')) {
      detectedTopic = 'Dining';
    } else if (lowercaseText.includes('dorm') || lowercaseText.includes('housing') || lowercaseText.includes('room') || lowercaseText.includes('residence')) {
      detectedTopic = 'Housing';
    } else if (lowercaseText.includes('wifi') || lowercaseText.includes('internet') || lowercaseText.includes('computer') || lowercaseText.includes('technology')) {
      detectedTopic = 'IT/Technology';
    } else if (lowercaseText.includes('stress') || lowercaseText.includes('anxiety') || lowercaseText.includes('mental') || lowercaseText.includes('counseling')) {
      detectedTopic = 'Mental Health';
    } else if (lowercaseText.includes('parking') || lowercaseText.includes('bus') || lowercaseText.includes('transport') || lowercaseText.includes('traffic')) {
      detectedTopic = 'Transportation';
    }
  }
  
  // Simple sentiment analysis
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'helpful', 'love', 'like', 'happy', 'satisfied', 'thank'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'frustrated', 'angry', 'disappointed', 'problem', 'issue', 'broken', 'slow'];
  
  const words = lowercaseText.split(/\s+/);
  let positiveScore = 0;
  let negativeScore = 0;
  
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveScore++;
    if (negativeWords.some(nw => word.includes(nw))) negativeScore++;
  });
  
  let sentiment = 'Neutral';
  if (positiveScore > negativeScore) sentiment = 'Positive';
  else if (negativeScore > positiveScore) sentiment = 'Negative';
  
  return { topic: detectedTopic, sentiment };
}

// Health check endpoint
app.get("/make-server-2459992a/health", (c) => {
  return c.json({ status: "ok" });
});

// Submit feedback
app.post("/make-server-2459992a/feedback", async (c) => {
  try {
    const body = await c.req.json();
    const { text, category, isAnonymous = true } = body;
    
    if (!text || text.trim().length === 0) {
      return c.json({ error: "Feedback text is required" }, 400);
    }
    
    const sessionId = generateSessionId();
    const analysis = analyzeText(text, category);
    const timestamp = new Date().toISOString();
    
    // Store feedback
    const feedbackData = {
      text: text.trim(),
      category: analysis.topic,
      sentiment: analysis.sentiment,
      timestamp,
      status: 'Received',
      isAnonymous,
      upvotes: 0,
      sessionId
    };
    
    await kv.set(`feedback:${sessionId}`, feedbackData);
    await kv.set(`messages:${sessionId}`, []);
    
    // Add to community feed (for upvoting)
    const communityPost = {
      id: sessionId,
      text: text.trim(),
      category: analysis.topic,
      sentiment: analysis.sentiment,
      timestamp,
      upvotes: 0,
      isVisible: true
    };
    
    await kv.set(`community:${sessionId}`, communityPost);
    
    // Update trends data
    const trendsKey = `trends:${analysis.topic}:${new Date().toISOString().split('T')[0]}`;
    const existingTrend = await kv.get(trendsKey) || { count: 0, sentiment: { Positive: 0, Neutral: 0, Negative: 0 } };
    existingTrend.count++;
    existingTrend.sentiment[analysis.sentiment]++;
    await kv.set(trendsKey, existingTrend);
    
    return c.json({
      sessionId,
      analysis
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return c.json({ error: "Failed to submit feedback" }, 500);
  }
});

// Get session data
app.get("/make-server-2459992a/session/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    
    const feedback = await kv.get(`feedback:${sessionId}`);
    if (!feedback) {
      return c.json({ error: "Session not found" }, 404);
    }
    
    const messages = await kv.get(`messages:${sessionId}`) || [];
    
    return c.json({
      feedback,
      messages
    });
  } catch (error) {
    console.error("Error getting session:", error);
    return c.json({ error: "Failed to get session" }, 500);
  }
});

// Send message in session
app.post("/make-server-2459992a/session/:sessionId/message", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    const body = await c.req.json();
    const { message, isAdmin = false } = body;
    
    if (!message || message.trim().length === 0) {
      return c.json({ error: "Message is required" }, 400);
    }
    
    const feedback = await kv.get(`feedback:${sessionId}`);
    if (!feedback) {
      return c.json({ error: "Session not found" }, 404);
    }
    
    const messages = await kv.get(`messages:${sessionId}`) || [];
    const newMessage = {
      id: generateMessageId(),
      message: message.trim(),
      isAdmin,
      timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    await kv.set(`messages:${sessionId}`, messages);
    
    return c.json({ message: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// Get community feed
app.get("/make-server-2459992a/community", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "20");
    const category = c.req.query("category");
    
    // Get all community posts
    const allPosts = await kv.getByPrefix("community:");
    
    // Filter and sort
    let posts = allPosts
      .filter(post => post.isVisible)
      .filter(post => !category || post.category === category);
    
    // Sort by upvotes and timestamp
    posts.sort((a, b) => {
      if (b.upvotes !== a.upvotes) {
        return b.upvotes - a.upvotes;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    return c.json({
      posts: posts.slice(0, limit),
      total: posts.length
    });
  } catch (error) {
    console.error("Error getting community feed:", error);
    return c.json({ error: "Failed to get community feed" }, 500);
  }
});

// Upvote community post
app.post("/make-server-2459992a/community/:postId/upvote", async (c) => {
  try {
    const postId = c.req.param("postId");
    
    const post = await kv.get(`community:${postId}`);
    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }
    
    post.upvotes = (post.upvotes || 0) + 1;
    await kv.set(`community:${postId}`, post);
    
    return c.json({ upvotes: post.upvotes });
  } catch (error) {
    console.error("Error upvoting post:", error);
    return c.json({ error: "Failed to upvote post" }, 500);
  }
});

// Get admin dashboard data
app.get("/make-server-2459992a/admin/dashboard", async (c) => {
  try {
    // Get all feedback
    const allFeedback = await kv.getByPrefix("feedback:");
    
    // Get trends data
    const allTrends = await kv.getByPrefix("trends:");
    
    // Calculate statistics
    const totalFeedback = allFeedback.length;
    const sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0 };
    const categoryCounts = {};
    const statusCounts = { Received: 0, Investigating: 0, 'In Progress': 0, Resolved: 0 };
    
    allFeedback.forEach(feedback => {
      sentimentCounts[feedback.sentiment]++;
      categoryCounts[feedback.category] = (categoryCounts[feedback.category] || 0) + 1;
      statusCounts[feedback.status]++;
    });
    
    // Get recent feedback
    const recentFeedback = allFeedback
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
    
    // Process trends
    const trendsByCategory = {};
    allTrends.forEach(trend => {
      try {
        if (trend.key && typeof trend.key === 'string') {
          const keyParts = trend.key.split(':');
          if (keyParts.length >= 3) {
            const category = keyParts[1];
            const date = keyParts[2];
            
            if (!trendsByCategory[category]) {
              trendsByCategory[category] = [];
            }
            
            trendsByCategory[category].push({
              date,
              count: trend.count || 0,
              sentiment: trend.sentiment || { Positive: 0, Neutral: 0, Negative: 0 }
            });
          }
        }
      } catch (err) {
        console.error('Error processing trend:', err, trend);
      }
    });
    
    return c.json({
      statistics: {
        totalFeedback,
        sentimentCounts,
        categoryCounts,
        statusCounts
      },
      recentFeedback,
      trends: trendsByCategory
    });
  } catch (error) {
    console.error("Error getting admin dashboard:", error);
    return c.json({ error: "Failed to get admin dashboard data" }, 500);
  }
});

// Update feedback status
app.put("/make-server-2459992a/admin/feedback/:sessionId/status", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    const body = await c.req.json();
    const { status, note } = body;
    
    const feedback = await kv.get(`feedback:${sessionId}`);
    if (!feedback) {
      return c.json({ error: "Feedback not found" }, 404);
    }
    
    feedback.status = status;
    if (note) {
      feedback.adminNote = note;
      feedback.lastUpdated = new Date().toISOString();
    }
    
    await kv.set(`feedback:${sessionId}`, feedback);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating feedback status:", error);
    return c.json({ error: "Failed to update feedback status" }, 500);
  }
});

// Get progress tracker data
app.get("/make-server-2459992a/progress", async (c) => {
  try {
    const category = c.req.query("category");
    
    // Get all feedback
    const allFeedback = await kv.getByPrefix("feedback:");
    
    // Filter by category if specified
    let filteredFeedback = allFeedback;
    if (category) {
      filteredFeedback = allFeedback.filter(f => f.category === category);
    }
    
    // Group by status
    const issuesByStatus = {
      'Received': [],
      'Investigating': [],
      'In Progress': [],
      'Resolved': []
    };
    
    filteredFeedback.forEach(feedback => {
      if (issuesByStatus[feedback.status]) {
        issuesByStatus[feedback.status].push({
          id: feedback.sessionId,
          text: feedback.text.substring(0, 100) + (feedback.text.length > 100 ? '...' : ''),
          category: feedback.category,
          timestamp: feedback.timestamp,
          adminNote: feedback.adminNote,
          lastUpdated: feedback.lastUpdated
        });
      }
    });
    
    // Sort each status group by timestamp
    Object.keys(issuesByStatus).forEach(status => {
      issuesByStatus[status].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });
    
    return c.json({
      issuesByStatus,
      categories: [...new Set(allFeedback.map(f => f.category))]
    });
  } catch (error) {
    console.error("Error getting progress data:", error);
    return c.json({ error: "Failed to get progress data" }, 500);
  }
});

Deno.serve(app.fetch);