
"use client";

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/actions/user-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, undefined);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      // Redirect to admin dashboard on successful login
      router.push('/admin');
    }
  }, [state, router, toast]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Login</CardTitle>
          <CardDescription>Enter your email and password to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {state?.message && <p className="text-destructive text-sm">{state.message}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin mr-2" />}
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
            <div className="text-center text-sm">
                Don't have an account?{' '}
                <Link href="/signup" className="underline text-primary">
                Sign up
                </Link>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
