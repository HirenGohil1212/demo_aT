
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
import { Input } from "@/components/ui/input";

type SettingsFormProps = {
  settings: AppSettings;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm">
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
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
                <Label htmlFor="allow-signups" className="font-bold">Allow New User Signups</Label>
                <p className="text-sm text-muted-foreground">
                    Enable this to allow new users to create accounts.
                </p>
            </div>
            <Switch
              id="allow-signups"
              name="allowSignups"
              defaultChecked={settings.allowSignups}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
            <CardTitle>Order Settings</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="font-bold">WhatsApp Order Number</Label>
                <p className="text-sm text-muted-foreground">
                    The number to which WhatsApp orders will be sent. Include country code without "+".
                </p>
                <Input 
                    id="whatsappNumber" 
                    name="whatsappNumber"
                    defaultValue={settings.whatsappNumber}
                    placeholder="e.g. 917990305570"
                    required
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

