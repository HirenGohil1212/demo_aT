
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background p-4">
      <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Login Disabled</CardTitle>
            <CardDescription>
              User authentication is currently disabled while we upgrade our systems.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
                We are migrating our user system to a new platform. Please check back later.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </CardFooter>
      </Card>
    </div>
  );
}
