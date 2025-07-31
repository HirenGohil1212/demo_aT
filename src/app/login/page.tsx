
"use client";

import { useEffect, useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

// We can't use the server-side getSettings here, so we fetch it on the client
async function fetchSignupSetting() {
    try {
        const res = await fetch('/api/settings');
        if (!res.ok) return true; // Default to true on error
        const data = await res.json();
        return data.allowSignups;
    } catch {
        return true; // Default to true on error
    }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowSignups, setAllowSignups] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function checkSettings() {
        const setting = await fetchSignupSetting();
        setAllowSignups(setting);
    }
    checkSettings();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      // The UserProvider will see the auth state change and handle
      // checking for admin status and redirection. We can just go home.
      router.push('/');
    } catch (error: any) {
      console.error("Login failed:", error);
      let description = "Please check your email and password.";
      if (error.code === 'auth/invalid-credential') {
        description = "Only admin can login."
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            {allowSignups && (
                <div className="text-sm text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="underline hover:text-primary">
                    Sign Up
                </Link>
                </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
