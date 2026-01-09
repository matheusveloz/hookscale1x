"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/progress-bar";
import { VideoList } from "@/components/video-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import type { Job, Combination, JobStatus } from "@/types";

export default function JobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>();
  const [processingStatus, setProcessingStatus] = useState<JobStatus>("pending");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const hasStartedProcessing = useRef(false);

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/job?id=${jobId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch job");
        }
        const data = await response.json();
        setJob(data.job);
        setCombinations(data.combinations);
        setProcessingStatus(data.job.status);
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job details");
      }
    };

    fetchJob();
  }, [jobId]);

  // Auto-start processing when job is loaded
  useEffect(() => {
    if (job && processingStatus === "pending" && !hasStartedProcessing.current) {
      hasStartedProcessing.current = true;
      handleStartProcessing();
    }
  }, [job, processingStatus]);

  const handleStartProcessing = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create EventSource to listen to SSE (usa GET, não precisa do POST)
      const eventSource = new EventSource(`/api/process?jobId=${jobId}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.status === "processing") {
            setCurrentProgress(data.progress || 0);
            setCurrentFile(data.currentFile);
            setProcessingStatus("processing");
          } else if (data.status === "completed") {
            setProcessingStatus("completed");
            setCurrentProgress(data.total || 0);
            setIsProcessing(false);
            eventSource.close();
            // Refresh combinations
            fetchCombinations();
          } else if (data.status === "failed" || data.status === "error") {
            setProcessingStatus("failed");
            setError(data.error || "Processing failed");
            setIsProcessing(false);
            eventSource.close();
          }
        } catch (err) {
          console.error("Error parsing SSE data:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE error:", err);
        setError("Connection lost. Please refresh the page.");
        setIsProcessing(false);
        eventSource.close();
      };
    } catch (err) {
      console.error("Error starting processing:", err);
      setError(err instanceof Error ? err.message : "Failed to start processing");
      setIsProcessing(false);
    }
  };

  const fetchCombinations = async () => {
    try {
      const response = await fetch(`/api/job?id=${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setCombinations(data.combinations);
      }
    } catch (err) {
      console.error("Error fetching combinations:", err);
    }
  };

  const handleDownload = (id: string, filename: string) => {
    window.open(`/api/download?id=${id}`, "_blank");
  };

  const handleDownloadAll = () => {
    window.open(`/api/download-zip?jobId=${jobId}`, "_blank");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-foreground/10 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="hover:bg-white/50 dark:hover:bg-black/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                H
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HookScale
                </h1>
                <p className="text-xs text-foreground/60">Job Progress</p>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <Card className="mb-8 border-2 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{job.name || `Job ${job.id}`}</CardTitle>
                <CardDescription className="text-base flex items-center gap-2">
                  <span className="font-semibold text-foreground/80">{job.total_combinations}</span>
                  total combinations
                </CardDescription>
              </div>
              <Badge
                variant={
                  processingStatus === "completed"
                    ? "success"
                    : processingStatus === "failed"
                    ? "destructive"
                    : processingStatus === "processing"
                    ? "default"
                    : "secondary"
                }

                  className="text-sm px-4 py-1"
                >
                  {processingStatus === "completed"
                    ? "Complete"
                    : processingStatus === "failed"
                    ? "Failed"
                    : processingStatus === "processing"
                    ? "Processing"
                    : "Pending"}
                </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {processingStatus === "processing" && (
              <ProgressBar
                current={currentProgress}
                total={job.total_combinations}
                currentFile={currentFile}
                className="mb-4"
              />
            )}

            {processingStatus === "completed" && (
              <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 border-2 border-green-200 dark:border-green-800/30 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-green-900 dark:text-green-100 mb-1">
                      Processing Complete!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      All videos are ready for download.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-6 border-2 border-red-200 dark:border-red-800/30 mb-6">
                <p className="font-bold text-red-600 dark:text-red-400 mb-1">Processing Error</p>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {processingStatus === "pending" && !isProcessing && (
              <Button 
                onClick={handleStartProcessing} 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                size="lg"
              >
                Start Processing
              </Button>
            )}
          </CardContent>
        </Card>

        {combinations.length > 0 && (
          <VideoList
            combinations={combinations}
            onDownload={handleDownload}
            onDownloadAll={
              processingStatus === "completed" ? handleDownloadAll : undefined
            }
          />
        )}
      </main>
    </div>
  );
}
