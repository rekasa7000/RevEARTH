"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithEmail } from "@/lib/auth/auth-hooks";
import { GuestOnlyRoute } from "@/components/auth/guest-only-route";
import { ArrowRight, AlertCircle } from "lucide-react";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnUrl = searchParams.get("returnUrl") || "/dashboard";
  const expired = searchParams.get("expired");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show session expired message
  useEffect(() => {
    if (expired === "true") {
      setError("Your session has expired. Please sign in again.");
    }
  }, [expired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await signInWithEmail(email, password, {
      onRequest: () => {
        setIsLoading(true);
      },
      onSuccess: () => {
        // Success - redirect to return URL or dashboard
        router.push(returnUrl);
      },
      onError: (error) => {
        setError(error.message);
        setIsLoading(false);
      },
    });

    // Handle result errors that weren't caught by callbacks
    if (result.error) {
      setError(result.error.message || "Failed to sign in");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/rever.jpg"
          alt="Background"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-revearth-dark/80 via-revearth-dark/60 to-black/70" />
      </div>

      {/* Floating Elements for Visual Interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-revearth-green/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-revearth-green/10 rounded-full blur-3xl animate-pulse-soft animation-delay-2000" />
      </div>

      {/* Content */}
      <div className={`relative z-10 w-full max-w-md px-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo and Brand */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src="/assets/logo2.png"
              alt="RevEarth Logo"
              width={80}
              height={80}
              className="transition-transform duration-300 hover:scale-110"
            />
          </div>
          <h1 className="text-4xl font-gilroy-bold">
            <span className="text-revearth-green">Rev</span>
            <span className="text-white">EARTH</span>
          </h1>
          <p className="text-white/70 text-sm font-gotham">Unravel your Trace</p>
        </div>

        {/* Sign In Card */}
        <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-gilroy-bold text-revearth-dark">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start space-x-3 animate-scale-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-12 px-4 rounded-xl border-gray-300 focus:border-revearth-green focus:ring-revearth-green transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-12 px-4 rounded-xl border-gray-300 focus:border-revearth-green focus:ring-revearth-green transition-all duration-300"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-revearth-dark hover:bg-revearth-dark/90 text-white rounded-full text-base font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 group mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">
                  New to RevEarth?
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center text-revearth-dark hover:text-revearth-green font-medium transition-colors duration-300"
              >
                Create an account
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-300 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-soft {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-pulse-soft {
          animation: pulse-soft 4s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function SignIn() {
  return (
    <GuestOnlyRoute>
      <SignInPage />
    </GuestOnlyRoute>
  );
}
