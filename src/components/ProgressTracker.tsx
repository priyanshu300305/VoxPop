import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  Clock, 
  Search, 
  AlertCircle, 
  TrendingUp,
  Filter,
  Calendar
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Issue {
  id: string;
  text: string;
  category: string;
  timestamp: string;
  adminNote?: string;
  lastUpdated?: string;
}

interface IssuesByStatus {
  'Received': Issue[];
  'Investigating': Issue[];
  'In Progress': Issue[];
  'Resolved': Issue[];
}

interface ProgressData {
  issuesByStatus: IssuesByStatus;
  categories: string[];
}

export function ProgressTracker() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadProgressData();
  }, [selectedCategory]);

  const loadProgressData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const url = new URL(`https://${projectId}.supabase.co/functions/v1/make-server-2459992a/progress`);
      if (selectedCategory && selectedCategory !== 'all') {
        url.searchParams.set('category', selectedCategory);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load progress data');
      }

      const data = await response.json();
      setProgressData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Received':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'Investigating':
        return <Search className="h-4 w-4 text-yellow-600" />;
      case 'In Progress':
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'Resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'Investigating':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'In Progress':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Resolved':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'Received':
        return 'Feedback has been logged and is awaiting review.';
      case 'Investigating':
        return 'The administration is actively looking into this issue.';
      case 'In Progress':
        return 'A solution is being implemented.';
      case 'Resolved':
        return 'The issue has been addressed.';
      default:
        return '';
    }
  };

  const calculateProgress = (issuesByStatus: IssuesByStatus) => {
    const total = Object.values(issuesByStatus).flat().length;
    if (total === 0) return 0;
    
    const resolved = issuesByStatus['Resolved'].length;
    const inProgress = issuesByStatus['In Progress'].length;
    
    return Math.round(((resolved + inProgress * 0.5) / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading progress data...</span>
      </div>
    );
  }

  if (!progressData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load progress data. Please refresh the page.</AlertDescription>
      </Alert>
    );
  }

  const { issuesByStatus, categories } = progressData;
  const overallProgress = calculateProgress(issuesByStatus);
  const totalIssues = Object.values(issuesByStatus).flat().length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Issue Progress Tracker</span>
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Track the status of community feedback and see what's being done to address issues.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Overall Progress */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Overall Progress</h3>
                <p className="text-gray-600">
                  {selectedCategory && selectedCategory !== 'all' ? `${selectedCategory} category` : 'All feedback'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{overallProgress}%</div>
                <div className="text-sm text-gray-600">{totalIssues} total issues</div>
              </div>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Status Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(issuesByStatus).map(([status, issues]) => (
              <Card key={status} className={`border-2 ${getStatusColor(status).split(' ').slice(2).join(' ')}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <CardTitle className="text-sm">{status}</CardTitle>
                    </div>
                    <Badge variant="outline" className={getStatusColor(status)}>
                      {issues.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {getStatusDescription(status)}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  {issues.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <div className="text-xs">No issues in this status</div>
                    </div>
                  ) : (
                    <ScrollArea className="h-64">
                      <div className="space-y-3 pr-2">
                        {issues.map((issue) => (
                          <div key={issue.id} className="bg-white p-3 rounded-lg border">
                            <p className="text-xs text-gray-800 mb-2 line-clamp-3">
                              {issue.text}
                            </p>
                            
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                {issue.category}
                              </Badge>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>{formatTimestamp(issue.timestamp)}</span>
                              </div>
                            </div>
                            
                            {issue.adminNote && (
                              <div className="bg-blue-50 p-2 rounded text-xs">
                                <p className="text-blue-800">
                                  <strong>Update:</strong> {issue.adminNote}
                                </p>
                                {issue.lastUpdated && (
                                  <p className="text-blue-600 mt-1">
                                    Updated: {formatTimestamp(issue.lastUpdated)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Status Definitions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Received</p>
                  <p className="text-gray-600">Initial review and categorization</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Search className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium">Investigating</p>
                  <p className="text-gray-600">Research and analysis in progress</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium">In Progress</p>
                  <p className="text-gray-600">Active implementation of solution</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Resolved</p>
                  <p className="text-gray-600">Issue has been successfully addressed</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}