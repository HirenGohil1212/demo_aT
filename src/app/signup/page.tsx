
"use server";

import { getSettings } from "@/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function SignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background p-4">
            <Card className="w-full max-w-sm text-center">
                <CardHeader>
                      <CardTitle className="flex items-center justify-center gap-2 text-xl text-primary">
                        <ShieldAlert className="h-6 w-6" />
                        Signups Disabled
                    </CardTitle>
                    <CardDescription>
                        We are not accepting new user registrations at this time.
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
    )
}
