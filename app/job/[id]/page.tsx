"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/progress-bar";
import { VideoGrid } from "@/components/video-grid";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Loader2, CheckCircle2 } from "lucide-react";
import type { Job, Combination, JobStatus } from "@/types";
import { useCallback } from "react";

export default function JobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [displayedCombinations, setDisplayedCombinations] = useState<Combination[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>();
  const [processingStatus, setProcessingStatus] = useState<JobStatus>("pending");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const hasStartedProcessing = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 12;

  const fetchJob = async () => {
      try {
        const response = await fetch(`/api/job?id=${jobId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch job");
        }
        const data = await response.json();
        setJob(data.job);
        setCombinations(data.combinations);
        setDisplayedCombinations(data.combinations.slice(0, ITEMS_PER_PAGE));
        setProcessingStatus(data.job.status);
        
        // Don't set progress from DB - let SSE handle it
        // Only set if truly completed (and not actively processing)
        if (data.job.status === 'completed' && !hasStartedProcessing.current) {
          setCurrentProgress(data.job.total_combinations);
        } else {
          setCurrentProgress(0);
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job details");
      }
    };

  // Fetch job details on mount
  useEffect(() => {
    fetchJob();
  }, [jobId]);

  // Auto-start processing when job is loaded
  useEffect(() => {
    if (job && processingStatus === "pending" && !hasStartedProcessing.current) {
      hasStartedProcessing.current = true;
      handleStartProcessing();
    }
  }, [job, processingStatus]);

  // Auto-refresh while processing
  useEffect(() => {
    if (processingStatus === "processing") {
      const interval = setInterval(() => {
        fetchCombinations();
      }, 3000); // Refresh every 3 seconds

      return () => clearInterval(interval);
    }
  }, [processingStatus]);

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
          console.log('SSE event received:', data);

          if (data.status === "processing") {
            setCurrentProgress(data.progress || 0);
            setCurrentFile(data.currentFile);
            setProcessingStatus("processing");
            // Grid updates via interval, not here
          } else if (data.status === "completed") {
            setProcessingStatus("completed");
            setCurrentProgress(data.total || 0);
            setIsProcessing(false);
            eventSource.close();
            // Final refresh to get ZIP URL
            setTimeout(() => fetchJob(), 1000);
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
        // Update displayed with current page
        setDisplayedCombinations(data.combinations.slice(0, (page + 1) * ITEMS_PER_PAGE));
      }
    } catch (err) {
      console.error("Error fetching combinations:", err);
    }
  };

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && displayedCombinations.length < combinations.length) {
      const nextPage = page + 1;
      const newDisplayed = combinations.slice(0, (nextPage + 1) * ITEMS_PER_PAGE);
      setDisplayedCombinations(newDisplayed);
      setPage(nextPage);
    }
  }, [combinations, displayedCombinations.length, page]);

  const handleDownload = async (id: string, filename: string) => {
    try {
      // Fetch the video
      const response = await fetch(`/api/download?id=${id}`);
      if (!response.ok) throw new Error('Download failed');

      // Get the blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback to opening in new tab
      window.open(`/api/download?id=${id}`, '_blank');
    }
  };

  const handleDownloadAll = () => {
    // Use pre-generated ZIP if available
    if (job?.zip_url) {
      window.open(job.zip_url, "_blank");
    } else {
      // Fallback to on-demand generation
      window.open(`/api/download-zip?jobId=${jobId}`, "_blank");
    }
  };

  const handleCreateNew = () => {
    router.push("/");
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
      <header className="border-b border-foreground/10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">
              <span className="text-foreground">Hook</span>
              <span className="text-green-500">Scale</span>
              <span className="text-foreground/50">.ai</span>
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="container mx-auto px-4 py-8 max-w-6xl overflow-y-auto"
      >
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>{job.name || `Job ${job.id}`}</CardTitle>
                <CardDescription>
                  {job.total_combinations} total combinations
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCreateNew}
                >
                  Create New
                </Button>
                {processingStatus === "completed" && job.zip_url && (
                  <Button
                    onClick={handleDownloadAll}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download All (ZIP) ⚡
                  </Button>
                )}
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
              <div className="rounded-lg bg-foreground/5 p-4 mb-4 border border-foreground/10">
                <p className="font-medium">✓ Processing Complete!</p>
                <p className="text-sm mt-1 text-foreground/60">
                  All videos are ready for download.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-foreground/5 p-4 mb-4 border border-foreground/20">
                <p className="font-medium">Processing Error</p>
                <p className="text-sm mt-1 text-foreground/60">{error}</p>
              </div>
            )}

            {processingStatus === "pending" && !isProcessing && (
              <Button 
                onClick={handleStartProcessing} 
                className="w-full"
              >
                Start Processing
              </Button>
            )}
          </CardContent>
        </Card>

        {displayedCombinations.length > 0 && (
          <VideoGrid
            combinations={displayedCombinations}
            onDownload={handleDownload}
          />
        )}

        {displayedCombinations.length < combinations.length && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-foreground/40" />
          </div>
        )}
      </main>
    </div>
  );
}
