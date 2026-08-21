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
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { useAuth } from "@/lib/auth-store";
import { useCRM } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const registerLocal = useAuth((s) => s.registerLocal);
  const updateWorkspace = useCRM((s) => s.updateWorkspace);
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const [pending, setPending] = useState(false);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", workspaceName: "" },
  });

  useEffect(() => {
    if (hydrated && user) router.replace("/dashboard");
  }, [hydrated, user, router]);

  async function onSubmit(values: RegisterInput) {
    setPending(true);
    const result = registerLocal(values);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Unable to register");
      return;
    }
    updateWorkspace({ name: values.workspaceName, tagline: "Private client desk." });
    toast.success("Workspace ready.");
    router.push("/dashboard");
  }

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 ring-1 ring-foreground/8">
        <Link href="/" className="font-heading text-2xl">
          PropPilot AI
        </Link>
        <h1 className="mt-6 font-heading text-3xl">Open a desk</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Creates a local demo workspace. Connect Supabase later for production auth.
        </p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-4">
          <Field label="Your name" htmlFor="name" error={form.formState.errors.name?.message}>
            <Input id="name" {...form.register("name")} />
          </Field>
          <Field
            label="Agency name"
            htmlFor="workspaceName"
            error={form.formState.errors.workspaceName?.message}
          >
            <Input id="workspaceName" {...form.register("workspaceName")} />
          </Field>
          <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
            <Input id="email" type="email" {...form.register("email")} />
          </Field>
          <Field
            label="Password"
            htmlFor="password"
            error={form.formState.errors.password?.message}
          >
            <Input id="password" type="password" {...form.register("password")} />
          </Field>
          <Button type="submit" disabled={pending} className="h-10">
            {pending ? "Creating…" : "Create workspace"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          Already on the desk?{" "}
          <Link href="/login" className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
