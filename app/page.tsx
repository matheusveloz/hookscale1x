"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadZone } from "@/components/upload-zone";
import { AspectRatioSelector, type AspectRatio } from "@/components/aspect-ratio-selector";
import { RecentJobs } from "@/components/recent-jobs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import type { UploadedVideo } from "@/types/uploaded-video";

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [hookVideos, setHookVideos] = useState<UploadedVideo[]>([]);
  const [bodyVideos, setBodyVideos] = useState<UploadedVideo[]>([]);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCombinations = hookVideos.length * bodyVideos.length;
  const allUploaded = 
    hookVideos.length > 0 && 
    bodyVideos.length > 0 &&
    hookVideos.every(v => v.blob_url) &&
    bodyVideos.every(v => v.blob_url);
  const canSubmit = allUploaded && !isCreatingJob;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsCreatingJob(true);
    setError(null);

    try {
      // Videos já estão no Blob, só precisa criar o job
      const response = await fetch("/api/create-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aspectRatio,
          hooks: hookVideos.map(v => ({
            filename: v.file.name,
            blob_url: v.blob_url,
            duration: v.duration || 0,
            file_size: v.file.size,
          })),
          bodies: bodyVideos.map(v => ({
            filename: v.file.name,
            blob_url: v.blob_url,
            duration: v.duration || 0,
            file_size: v.file.size,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job");
      }

      const data = await response.json();
      
      // Redirect to job page
      router.push(`/job/${data.jobId}`);
    } catch (err) {
      console.error("Create job error:", err);
      setError(err instanceof Error ? err.message : "Failed to create job");
      setIsCreatingJob(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-foreground/10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">
            <span className="text-foreground">Hook</span>
            <span className="text-green-500">Scale</span>
            <span className="text-foreground/50">.ai</span>
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Main Content - Left Side */}
          <div>
            {/* Progress Steps - Minimal */}
            <div className="flex items-center justify-center mb-8 gap-3">
              <button
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                  step === 1
                    ? "bg-green-500 text-white"
                    : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                }`}
              >
                {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs">1</span>}
                Format
              </button>

              <div className="w-8 h-px bg-foreground/20" />

              <button
                onClick={() => step >= 1 && setStep(2)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                  step === 2
                    ? "bg-green-500 text-white"
                    : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs">2</span>
                Upload
              </button>
            </div>

            {/* Step 1: Aspect Ratio Selection */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold mb-1">Choose Video Format</h2>
                  <p className="text-sm text-foreground/50">Select the aspect ratio for your videos</p>
                </div>

                <AspectRatioSelector
                  selected={aspectRatio}
                  onSelect={setAspectRatio}
                />

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => setStep(2)}
                    className="bg-green-500 hover:bg-green-600 text-white px-8"
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Upload */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h2 className="text-xl font-semibold">Upload Videos</h2>
                    <Badge variant="outline" className="text-xs border-green-500/30 text-green-500">{aspectRatio}</Badge>
                  </div>
                  <p className="text-sm text-foreground/50">Add your hook and body videos</p>
                </div>

                 <div className="grid gap-6 md:grid-cols-2">
                   <UploadZone
                     type="hook"
                     videos={hookVideos}
                     onVideosChange={setHookVideos}
                   />
                   <UploadZone
                     type="body"
                     videos={bodyVideos}
                     onVideosChange={setBodyVideos}
                   />
                 </div>

                 {totalCombinations > 0 && (
                   <div className="text-center py-3">
                     <span className="text-sm text-foreground/50">
                       <span className="text-green-500 font-semibold">{totalCombinations}</span> combinations
                       <span className="text-foreground/30 mx-2">·</span>
                       {hookVideos.length} hooks × {bodyVideos.length} bodies
                     </span>
                   </div>
                 )}

                {error && (
                  <div className="rounded-lg bg-red-500/10 p-3 border border-red-500/20">
                    <p className="text-sm text-red-500 text-center">{error}</p>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <Button
                    onClick={() => setStep(1)}
                    variant="ghost"
                    className="text-foreground/50 hover:text-foreground"
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>

                   <Button
                     onClick={handleSubmit}
                     disabled={!canSubmit}
                     className="bg-green-500 hover:bg-green-600 text-white px-8"
                   >
                     {isCreatingJob && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {isCreatingJob ? "Creating..." : allUploaded ? "Generate" : "Uploading..."}
                   </Button>
                </div>
              </div>
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
