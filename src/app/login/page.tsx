
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { user, isAdmin, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // This effect handles redirects based on the user's auth state.
    if (!loading) {
      if (user && isAdmin) {
        // If the user is an admin, send them to the dashboard.
        router.push('/admin');
      } else if (user && !isAdmin) {
        // If the user is logged in but not an admin, send them to the homepage.
        router.push('/');
      }
    }
    // It runs whenever the auth state changes.
  }, [user, isAdmin, loading, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The user provider will pick up the new auth state, and the useEffect above
      // will handle the redirect to the admin panel.
      toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
      });
      // No need to manually push router here, the effect will do it.
    } catch (error: any) {
        console.error("Error during email/password sign-in:", error);
        let errorMessage = "An unknown error occurred.";
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorMessage = "Invalid email or password. Please try again.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Please enter a valid email address.";
                break;
            default:
                errorMessage = "Failed to sign in. Please try again later.";
                break;
        }
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: errorMessage,
        });
    } finally {
        setIsLoggingIn(false);
    }
  };
  
  // While we wait for the initial auth state, show a loading indicator.
  // We also don't render the form if a redirect is imminent.
  if (loading || (user && (isAdmin || !isAdmin))) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
         <div className="text-xl font-semibold text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl text-primary">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
            </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit" disabled={isLoggingIn}>
                    {isLoggingIn ? 'Signing In...' : 'Sign In'}
                </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
