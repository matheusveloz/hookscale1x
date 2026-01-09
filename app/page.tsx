"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadZone } from "@/components/upload-zone";
import { AspectRatioSelector, type AspectRatio } from "@/components/aspect-ratio-selector";
import { RecentJobs } from "@/components/recent-jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // Wizard steps
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [hookFiles, setHookFiles] = useState<File[]>([]);
  const [bodyFiles, setBodyFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCombinations = hookFiles.length * bodyFiles.length;
  const canSubmit = hookFiles.length > 0 && bodyFiles.length > 0 && !isUploading;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();

      // Add aspect ratio
      formData.append("aspectRatio", aspectRatio);

      // Add hook files
      hookFiles.forEach((file) => {
        formData.append("hooks", file);
      });

      // Add body files
      bodyFiles.forEach((file) => {
        formData.append("bodies", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      
      // Redirect to job page
      router.push(`/job/${data.jobId}`);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload files");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-foreground/10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">
              H
            </div>
            <h1 className="text-2xl font-bold">
              <span className="text-foreground">Hook</span>
              <span className="text-green-500">Scale</span>
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Main Content - Left Side */}
          <div>
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12 gap-6">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    step >= 1
                      ? "bg-foreground text-background"
                      : "bg-foreground/10 text-foreground/40"
                  }`}
                >
                  {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : "1"}
                </div>
                <div className="text-left">
                  <p className={`font-semibold text-sm ${step >= 1 ? "" : "text-foreground/60"}`}>
                    Choose Format
                  </p>
                  <p className="text-xs text-foreground/40">Select aspect ratio</p>
                </div>
              </div>

              <ArrowRight className={`w-5 h-5 ${step >= 2 ? "" : "text-foreground/20"}`} />

              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    step >= 2
                      ? "bg-foreground text-background"
                      : "bg-foreground/10 text-foreground/40"
                  }`}
                >
                  2
                </div>
                <div className="text-left">
                  <p className={`font-semibold text-sm ${step >= 2 ? "" : "text-foreground/60"}`}>
                    Upload Videos
                  </p>
                  <p className="text-xs text-foreground/40">Add hooks & bodies</p>
                </div>
              </div>
            </div>

            {/* Step 1: Aspect Ratio Selection */}
            {step === 1 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Step 1: Choose Video Format</CardTitle>
                  <CardDescription>
                    Select the aspect ratio for your final videos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AspectRatioSelector
                    selected={aspectRatio}
                    onSelect={setAspectRatio}
                  />

                  <div className="rounded-lg bg-foreground/5 p-4 border border-foreground/10">
                    <p className="text-sm text-center">
                      <span className="font-semibold">Selected:</span> {aspectRatio}
                      {aspectRatio === "9:16" && " - Perfect for Stories & Reels"}
                      {aspectRatio === "1:1" && " - Perfect for Instagram Feed"}
                      {aspectRatio === "3:4" && " - Perfect for Portrait"}
                      {aspectRatio === "16:9" && " - Perfect for YouTube & Landscape"}
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={() => setStep(2)} 
                      size="lg"
                    >
                      Next: Upload Videos
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Upload */}
            {step === 2 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Step 2: Upload Videos</CardTitle>
                      <CardDescription>
                        Upload your hook and body videos
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{aspectRatio}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <UploadZone
                      type="hook"
                      files={hookFiles}
                      onFilesChange={setHookFiles}
                    />
                    <UploadZone
                      type="body"
                      files={bodyFiles}
                      onFilesChange={setBodyFiles}
                    />
                  </div>

                  {totalCombinations > 0 && (
                    <div className="rounded-lg bg-foreground/5 p-4 border border-foreground/10">
                      <p className="text-center text-sm">
                        <span className="font-semibold">{totalCombinations}</span> combinations
                        will be generated ({hookFiles.length} hooks × {bodyFiles.length} bodies)
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-lg bg-foreground/5 p-4 border border-foreground/20">
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      size="lg"
                    >
                      <ArrowLeft className="mr-2 w-5 h-5" />
                      Back
                    </Button>

                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      size="lg"
                    >
                      {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isUploading ? "Uploading..." : "Generate Combinations"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Recent Jobs */}
          <div>
            <div className="sticky top-8">
              <RecentJobs />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
