"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAdmin, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if a logged-in admin lands on the login page
    if (!loading && user && isAdmin) {
      router.push('/admin');
    }
  }, [user, isAdmin, loading, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On successful login, the useEffect above will handle the redirect.
      // We can also push directly here for a faster redirect.
      router.push('/admin');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please check your email and password.",
      });
      setIsSubmitting(false);
    }
  };
  
  // Show a loading spinner while checking auth state
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  }
  
  // If user is already an admin, show a redirecting message
  if (user && isAdmin) {
     return <div className="flex justify-center items-center min-h-screen">
      <p>Redirecting to dashboard...</p>
    </div>
  }

  // Otherwise, show the login form
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
