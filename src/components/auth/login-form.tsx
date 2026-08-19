"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormActions, FormSubmit } from "@/components/ui/form-actions";
import Link from "next/link";

export function LoginForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return signIn(formData);
    },
    null,
  );

  return (
    <Card className="w-full max-w-sm lg:max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Track your 2-year plan</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {state?.error && <p className="text-caption text-danger">{state.error}</p>}
          <FormActions>
            <FormSubmit loading={pending}>Sign in</FormSubmit>
          </FormActions>
        </form>
        <p className="mt-4 text-center text-caption text-text-secondary">
          No account?{" "}
          <Link href="/signup" className="underline-offset-2 hover:text-text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
