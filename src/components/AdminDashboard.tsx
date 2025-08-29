import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Edit,
  Send
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DashboardStats {
  totalFeedback: number;
  sentimentCounts: { Positive: number; Neutral: number; Negative: number };
  categoryCounts: Record<string, number>;
  statusCounts: { Received: number; Investigating: number; 'In Progress': number; Resolved: number };
}

interface Feedback {
  sessionId: string;
  text: string;
  category: string;
  sentiment: string;
  timestamp: string;
  status: string;
  adminNote?: string;
  lastUpdated?: string;
}

interface DashboardData {
  statistics: DashboardStats;
  recentFeedback: Feedback[];
  trends: Record<string, any[]>;
}

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2459992a/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFeedbackStatus = async () => {
    if (!selectedFeedback || !newStatus) return;
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2459992a/admin/feedback/${selectedFeedback.sessionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          status: newStatus,
          note: adminNote.trim() || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      // Refresh dashboard data
      await loadDashboardData();
      
      // Reset form
      setSelectedFeedback(null);
      setNewStatus('');
      setAdminNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feedback status');
    } finally {
      setIsUpdating(false);
    }
  };

  const sendAdminResponse = async () => {
    if (!selectedFeedback || !adminNote.trim()) return;
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2459992a/session/${selectedFeedback.sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          message: adminNote.trim(),
          isAdmin: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send response');
      }

      setAdminNote('');
      alert('Response sent successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send admin response');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'text-green-600 bg-green-100';
      case 'Negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received': return 'text-blue-600 bg-blue-100';
      case 'Investigating': return 'text-yellow-600 bg-yellow-100';
      case 'In Progress': return 'text-orange-600 bg-orange-100';
      case 'Resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading admin dashboard...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load dashboard data. Please refresh the page.</AlertDescription>
      </Alert>
    );
  }

  const { statistics, recentFeedback } = dashboardData;

  // Prepare chart data
  const sentimentData = Object.entries(statistics.sentimentCounts).map(([sentiment, count]) => ({
    sentiment,
    count
  }));

  const categoryData = Object.entries(statistics.categoryCounts).map(([category, count]) => ({
    category,
    count
  }));

  const statusData = Object.entries(statistics.statusCounts).map(([status, count]) => ({
    status,
    count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor feedback trends and manage responses</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-3xl font-bold">{statistics.totalFeedback}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold">{statistics.statusCounts.Received}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold">{statistics.statusCounts['In Progress']}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold">{statistics.statusCounts.Resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feedback by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ sentiment, count }) => `${sentiment}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <p className="text-gray-600">Latest submissions requiring attention</p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4 pr-4">
              {recentFeedback.map((feedback) => (
                <Card key={feedback.sessionId} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getSentimentColor(feedback.sentiment)}>
                            {feedback.sentiment}
                          </Badge>
                          <Badge className={getStatusColor(feedback.status)}>
                            {feedback.status}
                          </Badge>
                          <Badge variant="outline">{feedback.category}</Badge>
                          <span className="text-sm text-gray-500">
                            {formatTimestamp(feedback.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-gray-800 mb-3">
                          {feedback.text.length > 200 
                            ? `${feedback.text.substring(0, 200)}...` 
                            : feedback.text}
                        </p>
                        
                        {feedback.adminNote && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-blue-800">
                              <strong>Admin Note:</strong> {feedback.adminNote}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedFeedback(feedback);
                                  setNewStatus(feedback.status);
                                  setAdminNote('');
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Feedback Details</DialogTitle>
                              </DialogHeader>
                              {selectedFeedback && (
                                <div className="space-y-4">
                                  <div>
                                    <p className="font-medium mb-2">Original Feedback:</p>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <p>{selectedFeedback.text}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-gray-600">Category</p>
                                      <p>{selectedFeedback.category}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-600">Sentiment</p>
                                      <p>{selectedFeedback.sentiment}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Update Status</label>
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                      <SelectTrigger className="mt-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Received">Received</SelectItem>
                                        <SelectItem value="Investigating">Investigating</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Admin Response/Note</label>
                                    <Textarea
                                      value={adminNote}
                                      onChange={(e) => setAdminNote(e.target.value)}
                                      placeholder="Enter response to send to the user or internal note..."
                                      rows={4}
                                      className="mt-1"
                                    />
                                  </div>
                                  
                                  <div className="flex space-x-3">
                                    <Button
                                      onClick={updateFeedbackStatus}
                                      disabled={isUpdating || !newStatus}
                                      className="flex-1"
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      {isUpdating ? 'Updating...' : 'Update Status'}
                                    </Button>
                                    
                                    {adminNote.trim() && (
                                      <Button
                                        onClick={sendAdminResponse}
                                        disabled={isUpdating}
                                        variant="outline"
                                        className="flex-1"
                                      >
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Response
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}