"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Download, Eye, Loader2 } from "lucide-react";
import type { Job } from "@/types";

const ITEMS_PER_PAGE = 5;

export function RecentJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecentJobs(0);
  }, []);

  const fetchRecentJobs = async (pageNum: number) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(`/api/jobs/recent?page=${pageNum}&limit=${ITEMS_PER_PAGE}`);
      if (response.ok) {
        const data = await response.json();
        const newJobs = data.jobs || [];
        
        if (pageNum === 0) {
          setJobs(newJobs);
        } else {
          setJobs(prev => [...prev, ...newJobs]);
        }
        
        setHasMore(newJobs.length === ITEMS_PER_PAGE);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching recent jobs:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      fetchRecentJobs(page + 1);
    }
  }, [loadingMore, hasMore, page]);

  const handleDownloadZip = (jobId: string) => {
    window.open(`/api/download-zip?jobId=${jobId}`, "_blank");
  };

  const handleViewJob = (jobId: string) => {
    router.push(`/job/${jobId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Creations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-foreground/40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Creations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-foreground/60 py-8">
            No jobs created yet. Start by creating your first combinations!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-500" />
          Recent Creations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="max-h-[600px] overflow-y-auto px-6 space-y-3"
          style={{ paddingTop: '1rem', paddingBottom: '1rem' }}
        >
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="p-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-green-500"
              onClick={() => handleViewJob(job.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm">{job.name || `Job ${job.id.slice(0, 8)}`}</h4>
                    <Badge variant="outline" className="text-xs">
                      {job.aspect_ratio || "16:9"}
                    </Badge>
                    <Badge
                      variant={
                        job.status === "completed"
                          ? "success"
                          : job.status === "failed"
                          ? "destructive"
                          : job.status === "processing"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {job.status === "completed"
                        ? "Complete"
                        : job.status === "failed"
                        ? "Failed"
                        : job.status === "processing"
                        ? "Processing"
                        : "Pending"}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-foreground/60">
                    <div className="flex items-center gap-2">
                      <span>{job.total_combinations} videos</span>
                      {job.status === "completed" && (
                        <span className="text-green-600 dark:text-green-400">
                          • {job.processed_count}/{job.total_combinations} processed
                        </span>
                      )}
                      {job.status === "processing" && (
                        <span>
                          • {job.processed_count}/{job.total_combinations} processed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(job.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[90px]" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewJob(job.id)}
                    className="w-full text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Open
                  </Button>

                  {job.status === "completed" && (
                    <Button
                      size="sm"
                      onClick={() => handleDownloadZip(job.id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      ZIP
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {loadingMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-foreground/40" />
            </div>
          )}

          {!hasMore && jobs.length > 0 && (
            <p className="text-xs text-center text-foreground/40 py-4">
              No more jobs to load
            </p>
          )}
        </div>

        {jobs.length > 0 && (
          <div className="px-6 pt-4 border-t border-foreground/10">
            <p className="text-xs text-center text-foreground/40">
              Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''} · Scroll for more
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
