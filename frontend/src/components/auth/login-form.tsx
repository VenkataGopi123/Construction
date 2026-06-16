"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      addToast({ title: "Welcome back!", variant: "success" });
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch {
      addToast({ title: "Login failed", description: "Invalid email or password.", variant: "error" });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Building2 className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to your BuildMaster ERP account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="admin@buildmaster.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</> : "Sign In"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">Register</Link>
        </p>
      </CardContent>
    </Card>
  );
}
