
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_UIDS } from '@/lib/admins';

export default function LoginPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // If user is loaded and is an admin, redirect to the dashboard.
    if (!loading && user && ADMIN_UIDS.includes(user.uid)) {
      router.push('/admin');
    }
  }, [user, loading, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Check if the logged-in user is an admin
      if (ADMIN_UIDS.includes(userCredential.user.uid)) {
        toast({
            title: "Login Successful",
            description: "Redirecting to the admin panel...",
        });
        // The useEffect above will handle the redirect.
        // Or we can push directly:
        router.push('/admin');
      } else {
        // Not an admin, sign them out and show an error
        await auth.signOut();
        toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You do not have permission to access the admin panel.",
        });
        setIsLoggingIn(false);
      }
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
        setIsLoggingIn(false);
    }
  };
  
  // While checking user auth state, show a loading message.
  if (loading) {
    return <div className='text-center p-12'>Loading...</div>;
  }
  
  // If the user is already logged in and an admin, they will be redirected by the useEffect.
  // We can show a message here as well.
  if (user && ADMIN_UIDS.includes(user.uid)) {
      return <div className='text-center p-12'>Redirecting to admin panel...</div>;
  }

  // Otherwise, show the login form.
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

