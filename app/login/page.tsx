"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginFormSchema } from "@/lib/schemas";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";
import { Msg } from "@/components/toastify";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    try {
      setIsLoading(true);

      const response = await axiosInstance.post("/api/auth/login", {
        email: values.email,
        password: values.password,
      });

      if (response.status !== 200) {
        toast.warning(Msg, {
          data: {
            title: "Login gagal",
            description: response.data?.error || "Silakan coba lagi.",
          },
        });
      }

      toast.success(Msg, {
        data: {
          title: "Login berhasil",
          description: "Anda akan diarahkan ke dashboard.",
        },
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(Msg, {
        data: {
          title: "Login gagal",
          description:
            error?.response?.data?.error ||
            "Email atau password salah. Silakan coba lagi.",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Masuk ke akun program magang PT Mada Wikri Tunggal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="nama@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="******"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Belum memiliki akun?{" "}
              <Link href="/register" className="text-primary underline">
                Daftar
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
