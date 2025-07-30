"use client";

import { useActionState } from "react";
import { updateSettings } from "@/services/product-service";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Card, CardContent } from "@/components/ui/card";
import type { AppSettings } from "@/types";

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
    <form action={action}>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
                <Label htmlFor="allow-signups" className="font-bold text-base">Allow New User Signups</Label>
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
          {error && <div className="text-destructive text-sm mt-2">{error.message}</div>}
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
