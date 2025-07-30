
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect will handle redirection for an admin who is already logged in
    // and visits the login page by mistake.
    if (!loading && user && ADMIN_UIDS.includes(user.uid)) {
      router.push('/admin');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Check if the logged-in user is an admin
      if (ADMIN_UIDS.includes(userCredential.user.uid)) {
        toast({
            title: "Login Successful",
            description: "Redirecting to the admin panel...",
        });
        // Redirect immediately to the admin panel
        router.push('/admin');
      } else {
        // If the user is not an admin, sign them out and show an error
        await auth.signOut();
        setError("You are not authorized to access the admin panel.");
        toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You do not have permission to access this page.",
        });
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
        setError(errorMessage);
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: errorMessage,
        });
    }
  };

  // While loading or if an already logged-in admin is being redirected, show loading.
  if (loading || (user && ADMIN_UIDS.includes(user.uid))) {
    return <div className='text-center p-12'>Loading...</div>;
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
                <Button className="w-full" type="submit">
                    Sign In
                </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
