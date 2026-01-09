"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Video, Zap, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-foreground/10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold">
            <span className="text-foreground">Hook</span>
            <span className="text-green-500">Scale</span>
            <span className="text-foreground/40 text-sm font-normal">.ai</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground/60 hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="text-sm text-green-500 font-medium">
              Scale Your Creative Production
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Generate Thousands of
            <br />
            <span className="text-green-500">Video Variations</span> Instantly
          </h1>
          
          <p className="text-xl text-foreground/60 mb-8 max-w-2xl mx-auto">
            Create custom video matrices that automatically combine your hooks, bodies, and CTAs 
            into unlimited variations. Find winning creatives faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="px-8 py-6 text-lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-6 border-foreground/10">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Custom Video Matrix</h3>
            <p className="text-foreground/60">
              Choose your modules (hook, body, CTA), add your assets, and let the matrix 
              generate all possible combinations automatically.
            </p>
          </Card>

          <Card className="p-6 border-foreground/10">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
            <p className="text-foreground/60">
              Generate hundreds or thousands of unique video creatives in minutes. 
              No more manual editing or rendering.
            </p>
          </Card>

          <Card className="p-6 border-foreground/10">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Find Winners</h3>
            <p className="text-foreground/60">
              Test more variations to discover which hooks, bodies, and CTAs perform best. 
              Data-driven creative optimization.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold mb-1">Upload Your Video Assets</h3>
                <p className="text-foreground/60">
                  Upload your hooks, bodies, CTAs, and any other video modules you want to test.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold mb-1">Define Your Matrix Structure</h3>
                <p className="text-foreground/60">
                  Choose how many assets go in each module and set the display order.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-bold mb-1">Generate All Combinations</h3>
                <p className="text-foreground/60">
                  Our system automatically combines all assets into unique video variations.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-bold mb-1">Download & Test</h3>
                <p className="text-foreground/60">
                  Download individual videos or bulk ZIP. Upload to your ad platforms and test.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Scale Your Creatives?
          </h2>
          <p className="text-lg text-foreground/60 mb-8">
            Join hundreds of marketers generating thousands of video variations
          </p>
          <Link href="/login">
            <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg">
              Start Creating Videos
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/10 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-foreground/50">
          <p>© 2026 HookScale. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
