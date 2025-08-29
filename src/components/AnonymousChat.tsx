import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, Send, User, UserCheck, Search, Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Message {
  id: string;
  message: string;
  isAdmin: boolean;
  timestamp: string;
}

interface FeedbackSession {
  text: string;
  category: string;
  sentiment: string;
  timestamp: string;
  status: string;
}

interface SessionData {
  feedback: FeedbackSession;
  messages: Message[];
}

export function AnonymousChat() {
  const [sessionId, setSessionId] = useState('');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [savedSessions, setSavedSessions] = useState<string[]>([]);

  useEffect(() => {
    // Load saved session IDs from localStorage
    const saved = localStorage.getItem('voxpop-sessions');
    if (saved) {
      try {
        setSavedSessions(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved sessions:', e);
      }
    }
  }, []);

  const saveSessionId = (id: string) => {
    const updated = [...new Set([id, ...savedSessions])].slice(0, 10); // Keep last 10 sessions
    setSavedSessions(updated);
    localStorage.setItem('voxpop-sessions', JSON.stringify(updated));
  };

  const loadSession = async (id: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2459992a/session/${id}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Session not found. Please check your session ID.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load session');
      }

      const data = await response.json();
      setSessionData(data);
      setSessionId(id);
      saveSessionId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
      setSessionData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionId) return;

    setIsSending(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2459992a/session/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          message: newMessage,
          isAdmin: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      
      // Add the new message to the session data
      if (sessionData) {
        setSessionData({
          ...sessionData,
          messages: [...sessionData.messages, data.message]
        });
      }
      
      setNewMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received': return 'secondary';
      case 'Investigating': return 'default';
      case 'In Progress': return 'default';
      case 'Resolved': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Lookup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Access Your Feedback Session</span>
          </CardTitle>
          <p className="text-gray-600">
            Enter your session ID to view your feedback and continue the conversation with administrators.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Input
              placeholder="Enter your session ID (e.g., session_abc123...)"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => loadSession(sessionId)}
              disabled={!sessionId.trim() || isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Saved Sessions */}
          {savedSessions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Recent Sessions:</p>
              <div className="flex flex-wrap gap-2">
                {savedSessions.map((id) => (
                  <Button
                    key={id}
                    variant="outline"
                    size="sm"
                    onClick={() => loadSession(id)}
                    className="text-xs"
                  >
                    {id.slice(-8)}...
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Content */}
      {sessionData && (
        <div className="space-y-6">
          {/* Original Feedback */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your Original Feedback</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(sessionData.feedback.status)}>
                    {sessionData.feedback.status}
                  </Badge>
                  <Badge variant="outline">{sessionData.feedback.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800">{sessionData.feedback.text}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(sessionData.feedback.timestamp)}</span>
                    </div>
                    <Badge 
                      variant={
                        sessionData.feedback.sentiment === 'Positive' ? 'default' :
                        sessionData.feedback.sentiment === 'Negative' ? 'destructive' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {sessionData.feedback.sentiment}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Anonymous Conversation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 mb-4">
                <div className="space-y-4 pr-4">
                  {sessionData.messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No messages yet. An administrator may respond to your feedback here.</p>
                    </div>
                  ) : (
                    sessionData.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isAdmin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-sm px-4 py-2 rounded-lg ${
                            message.isAdmin
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.isAdmin ? (
                              <UserCheck className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                            <span className="text-xs font-medium">
                              {message.isAdmin ? 'Administrator' : 'You'}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {formatTimestamp(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="flex space-x-2">
                <Textarea
                  placeholder="Type your message to the administrator..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 resize-none"
                  rows={2}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || isSending}
                  className="self-end"
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}