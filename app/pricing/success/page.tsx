"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Give webhook time to process
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center border-red-500/20">
          <div className="text-red-500 mb-4">Error</div>
          <p className="text-foreground/60 mb-6">{error}</p>
          <Link href="/pricing">
            <Button>Back to Pricing</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-foreground/10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/">
            <h1 className="text-xl font-semibold cursor-pointer hover:opacity-80 transition-opacity">
              <span className="text-foreground">Hook</span>
              <span className="text-green-500">Scale</span>
              <span className="text-foreground/40 text-sm font-normal">.ai</span>
            </h1>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="p-8 md:p-12 text-center border-green-500/20">
          {loading ? (
            <>
              <Loader2 className="w-16 h-16 text-green-500 mx-auto mb-6 animate-spin" />
              <h1 className="text-3xl font-bold mb-4">Processing your subscription...</h1>
              <p className="text-foreground/60 mb-8">
                Please wait while we set up your account
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Welcome to HookScale! 🎉
              </h1>
              
              <p className="text-lg text-foreground/60 mb-8">
                Your subscription is now active. Start creating unlimited video combinations
                and scale your creative production today.
              </p>

              {sessionId && (
                <p className="text-sm text-foreground/40 mb-8 font-mono">
                  Session ID: {sessionId.substring(0, 20)}...
                </p>
              )}

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-foreground/5 rounded-lg text-left">
                  <h3 className="font-semibold mb-2">What's next?</h3>
                  <ul className="space-y-2 text-sm text-foreground/60">
                    <li>✓ Your subscription is active</li>
                    <li>✓ Credits are ready to use</li>
                    <li>✓ All features are unlocked</li>
                    <li>✓ Start creating video matrices now</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto">
                    Start Creating Videos
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full sm:w-auto">
                    View Plans
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-foreground/40 mt-8">
                You'll receive a confirmation email shortly with your receipt and subscription details.
              </p>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
