"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Download, Eye, Loader2 } from "lucide-react";
import type { Job } from "@/types";

export function RecentJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      const response = await fetch("/api/jobs/recent");
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching recent jobs:", error);
    } finally {
      setLoading(false);
    }
  };

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
          <CardTitle>Últimas Criações</CardTitle>
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
          <CardTitle>Últimas Criações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-foreground/60 py-8">
            Nenhum job criado ainda. Comece criando suas primeiras combinações!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas Criações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewJob(job.id)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{job.name || `Job ${job.id.slice(0, 8)}`}</h4>
                    <Badge variant="secondary" className="text-xs">
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
                        ? "Completo"
                        : job.status === "failed"
                        ? "Falhou"
                        : job.status === "processing"
                        ? "Processando"
                        : "Pendente"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-foreground/60">
                    <span>{job.total_combinations} vídeos</span>
                    {job.status === "completed" && (
                      <span className="text-green-600 dark:text-green-400">
                        ✓ {job.processed_count}/{job.total_combinations} processados
                      </span>
                    )}
                    {job.status === "processing" && (
                      <span>
                        {job.processed_count}/{job.total_combinations} processados
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(job.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewJob(job.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Abrir
                  </Button>

                  {job.status === "completed" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDownloadZip(job.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      ZIP
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {jobs.length > 0 && (
          <p className="text-xs text-center text-foreground/40 mt-4">
            Mostrando os {jobs.length} jobs mais recentes
          </p>
        )}
      </CardContent>
    </Card>
  );
}
