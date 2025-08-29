import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { ThumbsUp, TrendingUp, Users, Filter, Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CommunityPost {
  id: string;
  text: string;
  category: string;
  sentiment: string;
  timestamp: string;
  upvotes: number;
  isVisible: boolean;
}

export function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());

  const categories = [
    'Academic',
    'Campus Safety', 
    'Dining',
    'Housing',
    'IT/Technology',
    'Mental Health',
    'Transportation',
    'Other'
  ];

  useEffect(() => {
    loadCommunityFeed();
  }, [selectedCategory]);

  const loadCommunityFeed = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const url = new URL(`https://${projectId}.supabase.co/functions/v1/make-server-2459992a/community`);
      if (selectedCategory && selectedCategory !== 'all') {
        url.searchParams.set('category', selectedCategory);
      }
      url.searchParams.set('limit', '50');

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load community feed');
      }

      const data = await response.json();
      setPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community feed');
    } finally {
      setIsLoading(false);
    }
  };

  const upvotePost = async (postId: string) => {
    if (upvotingIds.has(postId)) return;
    
    setUpvotingIds(prev => new Set(prev).add(postId));
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2459992a/community/${postId}/upvote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upvote');
      }

      const data = await response.json();
      
      // Update the post in the local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, upvotes: data.upvotes }
          : post
      ));
    } catch (err) {
      console.error('Error upvoting post:', err);
    } finally {
      setUpvotingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return 'Just now';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-100 text-green-800';
      case 'Negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Academic': 'bg-blue-100 text-blue-800',
      'Campus Safety': 'bg-red-100 text-red-800',
      'Dining': 'bg-orange-100 text-orange-800',
      'Housing': 'bg-purple-100 text-purple-800',
      'IT/Technology': 'bg-cyan-100 text-cyan-800',
      'Mental Health': 'bg-pink-100 text-pink-800',
      'Transportation': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Community Feedback</span>
            </CardTitle>
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
          <p className="text-gray-600">
            See what issues matter most to your community. Upvote posts you relate to.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-600">Loading community feed...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No community posts found.</p>
              {selectedCategory && selectedCategory !== 'all' && (
                <p className="text-sm mt-2">Try selecting a different category or clear the filter.</p>
              )}
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4 pr-4">
                {posts.map((post) => (
                  <Card key={post.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getCategoryColor(post.category)}>
                              {post.category}
                            </Badge>
                            <Badge className={getSentimentColor(post.sentiment)}>
                              {post.sentiment}
                            </Badge>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimestamp(post.timestamp)}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-800 mb-3 leading-relaxed">
                            {post.text}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => upvotePost(post.id)}
                              disabled={upvotingIds.has(post.id)}
                              className="flex items-center space-x-2"
                            >
                              {upvotingIds.has(post.id) ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              ) : (
                                <ThumbsUp className="h-3 w-3" />
                              )}
                              <span>{post.upvotes}</span>
                              <span className="hidden sm:inline">
                                {post.upvotes === 1 ? 'upvote' : 'upvotes'}
                              </span>
                            </Button>
                            
                            {post.upvotes > 10 && (
                              <div className="flex items-center space-x-1 text-sm text-orange-600">
                                <TrendingUp className="h-3 w-3" />
                                <span className="hidden sm:inline">Trending</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={loadCommunityFeed}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh Feed'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}