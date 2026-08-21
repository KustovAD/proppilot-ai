"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui-kit";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { useAuth } from "@/lib/auth-store";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const loginDemo = useAuth((s) => s.loginDemo);
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const [pending, setPending] = useState(false);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  });

  useEffect(() => {
    if (hydrated && user) router.replace("/dashboard");
  }, [hydrated, user, router]);

  async function onSubmit(values: LoginInput) {
    setPending(true);
    const result = loginDemo(values.email, values.password);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Unable to sign in");
      return;
    }
    toast.success("Welcome back to the desk.");
    router.push("/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-forest lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80)",
          }}
        />
        <div className="relative flex h-full flex-col justify-end p-10 text-sidebar-foreground">
          <p className="font-heading text-4xl">Quiet rooms. Clear pipeline.</p>
          <p className="mt-3 max-w-md text-sm text-sidebar-foreground/75">
            Sign in to Meridian Private Estates, the PropPilot AI demonstration workspace.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="font-heading text-2xl">
            PropPilot AI
          </Link>
          <h1 className="mt-8 font-heading text-3xl">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-4">
            <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            </Field>
            <Field
              label="Password"
              htmlFor="password"
              error={form.formState.errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register("password")}
              />
            </Field>
            <Button type="submit" disabled={pending} className="h-10">
              {pending ? "Signing in…" : "Enter the desk"}
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            New house?{" "}
            <Link href="/register" className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}>
              Create a workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
