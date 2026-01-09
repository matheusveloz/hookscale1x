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
      {/* Header with gradient */}
      <header className="border-b border-foreground/10 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              H
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HookScale
              </h1>
              <p className="text-xs text-foreground/60">Video Combination Tool</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12 gap-6">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    step >= 1
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
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

              <ArrowRight className={`w-5 h-5 ${step >= 2 ? "text-blue-500" : "text-foreground/20"}`} />

              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    step >= 2
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
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
              <Card className="animate-fade-in border-2 shadow-xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <CardTitle className="text-2xl">Choose Video Format</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Select the aspect ratio for your final videos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AspectRatioSelector
                    selected={aspectRatio}
                    onSelect={setAspectRatio}
                  />

                  <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 border border-blue-200/50 dark:border-blue-800/30">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Selected: {aspectRatio}</p>
                        <p className="text-sm text-foreground/70">
                          {aspectRatio === "9:16" && "Perfect for Stories & Reels - Vertical format optimized for mobile viewing"}
                          {aspectRatio === "1:1" && "Perfect for Instagram Feed - Square format for maximum engagement"}
                          {aspectRatio === "3:4" && "Perfect for Portrait - Balanced vertical format"}
                          {aspectRatio === "16:9" && "Perfect for YouTube & Landscape - Standard widescreen format"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={() => setStep(2)} 
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
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
              <Card className="animate-fade-in border-2 shadow-xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Upload Videos</CardTitle>
                        <CardDescription className="text-base mt-1">
                          Upload your hook and body videos
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1 text-sm">{aspectRatio}</Badge>
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
                    <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 border border-green-200/50 dark:border-green-800/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl font-bold text-white">{totalCombinations}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-100">
                            {totalCombinations} video combinations will be generated
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {hookFiles.length} hook{hookFiles.length !== 1 ? 's' : ''} × {bodyFiles.length} bod{bodyFiles.length !== 1 ? 'ies' : 'y'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-6 border border-red-200 dark:border-red-800/30">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
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
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <RecentJobs />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
