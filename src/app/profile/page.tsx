"use client";

import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading || !user) {
    return <div className='text-center p-12'>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-center text-3xl">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
            <AvatarFallback className="text-4xl">
              {user.displayName ? user.displayName[0] : user.email ? user.email[0] : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-2xl font-semibold">{user.displayName}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="destructive" onClick={handleSignOut}>Log Out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
