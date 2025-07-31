
"use client";

import { useActionState } from "react";
import { updateSettings } from "@/actions/settings-actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppSettings } from "@/types";

type SettingsFormProps = {
  settings: AppSettings;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : "Save Changes"}
    </Button>
  );
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [error, action] = useActionState(updateSettings, undefined);

  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>User Settings</CardTitle>
            <CardDescription>Control user registration for your application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="allow-signups" className="flex flex-col space-y-1">
              <span>Allow New User Signups</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Enable this to allow new users to create accounts.
              </span>
            </Label>
            <Switch
              id="allow-signups"
              name="allowSignups"
              defaultChecked={settings.allowSignups}
            />
          </div>
        </CardContent>
      </Card>
      
      {error && <div className="text-destructive text-sm mt-2">{error.message}</div>}

      <div className="mt-6 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
