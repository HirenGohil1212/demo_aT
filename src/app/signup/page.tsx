"use server";

import { getSettings } from "@/services/product-service";
import SignUpForm from "./_components/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default async function SignUpPage() {
    const settings = await getSettings();

    if (!settings.allowSignups) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background">
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
                            Please check back later or contact support if you believe this is an error.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background">
      <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Create an Account</CardTitle>
            <CardDescription>
              Enter your email and password to sign up.
            </CardDescription>
          </CardHeader>
          <SignUpForm />
      </Card>
    </div>
  );
}
