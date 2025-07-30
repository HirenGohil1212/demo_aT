
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function SignUpPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push('/admin');
    }
  }, [user, loading, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });

      toast({
        title: "Account Created!",
        description: "You have been successfully signed up.",
      });
      // Let the UserProvider and useEffect handle the redirect
    } catch (error: any) {
        console.error("Error during sign-up:", error);
        let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "An account with this email already exists.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Please enter a valid email address.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "The password is too weak.";
        }
        setError(errorMessage);
        toast({
            variant: "destructive",
            title: "Sign-up Failed",
            description: errorMessage,
        });
    }
  };

  if (loading || user) {
    return <div className='text-center p-12'>Loading...</div>;
  }
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl text-primary">Create Admin Account</CardTitle>
          <CardDescription>This is for administrator registration only.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <Input
                id="displayName"
                type="text"
                placeholder="Admin Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                />
            </div>
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit">
                    Sign Up
                </Button>
                 <p className="text-xs text-center text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="underline hover:text-primary">
                        Login
                    </Link>
                </p>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
