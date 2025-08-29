import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { FeedbackSubmission } from './components/FeedbackSubmission';
import { AnonymousChat } from './components/AnonymousChat';
import { CommunityFeed } from './components/CommunityFeed';
import { AdminDashboard } from './components/AdminDashboard';
import { ProgressTracker } from './components/ProgressTracker';
import { DemoDataInitializer } from './components/DemoDataInitializer';
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Send,
  Shield,
  Eye,
  Zap
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('submit');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  VoxPop
                </h1>
                <p className="text-sm text-gray-600">Anonymous Feedback Platform</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              🟢 Live
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Voice Matters. Speak Anonymously.
          </h2>
          <p className="text-xl mb-6 text-blue-100">
            Share feedback, engage in two-way dialogue, and see real progress on community issues.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Shield className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold">100% Anonymous</h3>
              <p className="text-sm text-blue-100">Complete privacy protection</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Zap className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold">Two-Way Chat</h3>
              <p className="text-sm text-blue-100">Continue conversations with admins</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Eye className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold">Full Transparency</h3>
              <p className="text-sm text-blue-100">Track progress on all issues</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 p-1 rounded-lg">
            <TabsTrigger 
              value="submit" 
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Submit</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">My Sessions</span>
            </TabsTrigger>
            <TabsTrigger 
              value="community" 
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Submit Anonymous Feedback</h3>
              <p className="text-gray-600">
                Share your thoughts, concerns, or suggestions completely anonymously. 
                You'll receive a session ID to track responses.
              </p>
            </div>
            <FeedbackSubmission />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">My Feedback Sessions</h3>
              <p className="text-gray-600">
                Use your session ID to view your feedback and continue conversations with administrators.
              </p>
            </div>
            <AnonymousChat />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Community Voice</h3>
              <p className="text-gray-600">
                See what issues matter most to your community. Upvote posts you relate to and discover trending topics.
              </p>
            </div>
            <CommunityFeed />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Issue Progress</h3>
              <p className="text-gray-600">
                Track the status of community issues and see how they're being addressed by the administration.
              </p>
            </div>
            <ProgressTracker />
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Administrative Dashboard</h3>
              <p className="text-gray-600">
                Monitor feedback trends, analyze sentiment, and manage responses to community issues.
              </p>
            </div>
            
            <div className="mb-8">
              <DemoDataInitializer />
            </div>
            
            <AdminDashboard />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">VoxPop</span>
              </div>
              <p className="text-gray-600 text-sm">
                Empowering communities through anonymous feedback and transparent progress tracking.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Key Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Anonymous two-way conversations</li>
                <li>• AI-powered sentiment analysis</li>
                <li>• Community upvoting system</li>
                <li>• Real-time progress tracking</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Privacy Promise</h4>
              <p className="text-sm text-gray-600">
                Your identity is completely protected. Session IDs enable dialogue while maintaining 
                full anonymity. No personal data is stored or tracked.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
            <p>© 2024 VoxPop. Built for transparent, anonymous community engagement.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}