"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2, ArrowLeft, CreditCard, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        router.push("/login");
        return;
      }

      const userData = JSON.parse(userStr);
      setUser(userData);

      // Get subscription
      const response = await fetch(`/api/check-subscription?customer_id=${userData.id}`);
      const data = await response.json();

      if (data.hasSubscription) {
        setSubscription(data.subscription);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    }
  };

  const getPlanColor = (planId: string) => {
    if (planId === 'starter') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (planId === 'premium') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (planId === 'scale') return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    return 'bg-foreground/10 text-foreground/60';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-foreground/10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/dashboard">
            <h1 className="text-xl font-semibold cursor-pointer hover:opacity-80 transition-opacity">
              <span className="text-foreground">Hook</span>
              <span className="text-green-500">Scale</span>
              <span className="text-foreground/40 text-sm font-normal">.ai</span>
            </h1>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-foreground/60 hover:text-foreground">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Account Info */}
        <Card className="p-6 mb-6 border-foreground/10">
          <h2 className="text-xl font-bold mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-foreground/60">Email</label>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Subscription Info */}
        {subscription ? (
          <Card className="p-6 mb-6 border-foreground/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Subscription</h2>
              <Badge className={getPlanColor(subscription.planId)}>
                {subscription.planName}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Credits</p>
                    <p className="text-2xl font-bold">
                      {subscription.videosRemaining}
                      <span className="text-sm text-foreground/40 font-normal">
                        {" "}/ {subscription.videoLimit}
                      </span>
                    </p>
                    <p className="text-xs text-foreground/50 mt-1">
                      {subscription.videosUsed} used this period
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground/60">Billing Cycle</p>
                    <p className="font-medium">
                      {formatDate(subscription.currentPeriodEnd)}
                    </p>
                    <p className="text-xs text-foreground/50 mt-1">
                      Credits reset on this date
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade/Downgrade */}
            <div className="pt-6 border-t border-foreground/10">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="font-bold">Change Plan</h3>
              </div>
              <p className="text-sm text-foreground/60 mb-4">
                Upgrade to get more credits or downgrade to save money. 
                {subscription.planId !== 'scale' && ' Upgrades take effect immediately and add credits.'}
                {subscription.planId !== 'starter' && ' Downgrades take effect next billing cycle.'}
              </p>
              <Link href="/pricing">
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                  View All Plans
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="p-6 mb-6 border-foreground/10">
            <div className="text-center py-8">
              <h2 className="text-xl font-bold mb-2">No Active Subscription</h2>
              <p className="text-foreground/60 mb-6">
                Subscribe to a plan to start creating video variations
              </p>
              <Link href="/pricing">
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                  View Plans
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
