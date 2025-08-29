import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Database, Zap, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const sampleFeedbackData = [
  {
    text: "The Wi-Fi in the library is extremely slow, especially on weekends. It's making it difficult to complete research assignments and access online resources.",
    category: "IT/Technology",
    sentiment: "Negative"
  },
  {
    text: "The new dining hall hours are perfect! Being open until midnight really helps with late-night study sessions. Thank you for listening to student feedback.",
    category: "Dining",
    sentiment: "Positive"
  },
  {
    text: "There are not enough parking spaces near the science building. Students are often late to class because they have to park so far away.",
    category: "Transportation",
    sentiment: "Negative"
  },
  {
    text: "The mental health counseling services have been incredibly helpful. The staff is compassionate and the appointment scheduling is convenient.",
    category: "Mental Health",
    sentiment: "Positive"
  },
  {
    text: "The campus lighting near the dormitories is insufficient. It feels unsafe walking back to the dorms at night, especially during winter months.",
    category: "Campus Safety",
    sentiment: "Negative"
  },
  {
    text: "Professor Johnson's office hours are really helpful for understanding complex topics. More professors should offer extended office hours like this.",
    category: "Academic",
    sentiment: "Positive"
  },
  {
    text: "The laundry machines in Building C are frequently broken. When they do work, they don't clean clothes properly. This needs immediate attention.",
    category: "Housing",
    sentiment: "Negative"
  },
  {
    text: "The new study spaces in the library are fantastic. The quiet zones really help with concentration and the furniture is comfortable.",
    category: "Academic",
    sentiment: "Positive"
  }
];

export function DemoDataInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState('');

  const initializeDemoData = async () => {
    setIsInitializing(true);
    setError('');
    
    try {
      const promises = sampleFeedbackData.map(async (feedback) => {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2459992a/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            text: feedback.text,
            category: feedback.category,
            isAnonymous: true
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit demo feedback');
        }

        return response.json();
      });

      await Promise.all(promises);
      setInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize demo data');
    } finally {
      setIsInitializing(false);
    }
  };

  if (initialized) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-green-800 mb-2">Demo Data Loaded!</h3>
            <p className="text-sm text-gray-600">
              Sample feedback has been added to the system. You can now explore the community feed, 
              progress tracker, and admin dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Demo Data Setup</span>
        </CardTitle>
        <p className="text-gray-600">
          Load sample feedback data to explore VoxPop's features.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">What this will do:</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Add 8 sample feedback submissions</li>
            <li>• Include various categories and sentiments</li>
            <li>• Populate community feed and admin dashboard</li>
            <li>• Demonstrate AI analysis features</li>
          </ul>
        </div>

        <Button 
          onClick={initializeDemoData}
          disabled={isInitializing}
          className="w-full"
        >
          {isInitializing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading Demo Data...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Load Demo Data
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          This is optional and only for demonstration purposes.
        </p>
      </CardContent>
    </Card>
  );
}