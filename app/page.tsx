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
      <header className="border-b border-foreground/10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">HookScale</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? "bg-foreground text-background" : "bg-foreground/10"
              }`}
            >
              {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : "1"}
            </div>
            <span className={step >= 1 ? "font-semibold" : "text-foreground/60"}>
              Escolher Formato
            </span>
          </div>

          <ArrowRight className="w-5 h-5 text-foreground/40" />

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? "bg-foreground text-background" : "bg-foreground/10"
              }`}
            >
              2
            </div>
            <span className={step >= 2 ? "font-semibold" : "text-foreground/60"}>
              Upload de Vídeos
            </span>
          </div>
        </div>

        {/* Step 1: Aspect Ratio Selection */}
        {step === 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Passo 1: Escolha o Formato do Vídeo</CardTitle>
              <CardDescription>
                Selecione o aspect ratio para seus vídeos finais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AspectRatioSelector
                selected={aspectRatio}
                onSelect={setAspectRatio}
              />

              <div className="mt-6 rounded-lg bg-foreground/5 p-4">
                <p className="text-sm text-center">
                  <span className="font-semibold">Selecionado:</span> {aspectRatio}
                  {aspectRatio === "9:16" && " - Ideal para Stories e Reels"}
                  {aspectRatio === "1:1" && " - Ideal para Instagram Feed"}
                  {aspectRatio === "3:4" && " - Ideal para Portrait"}
                  {aspectRatio === "16:9" && " - Ideal para YouTube e Landscape"}
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(2)} size="lg">
                  Próximo: Fazer Upload
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Upload */}
        {step === 2 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Passo 2: Upload de Vídeos</CardTitle>
                  <CardDescription>
                    Faça upload dos vídeos de hooks e bodies
                  </CardDescription>
                </div>
                <Badge variant="secondary">{aspectRatio}</Badge>
              </div>
            </CardHeader>
            <CardContent>
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
                <div className="mt-6 rounded-lg bg-foreground/5 p-4">
                  <p className="text-center text-sm">
                    <span className="font-semibold">{totalCombinations}</span> combinações
                    serão geradas ({hookFiles.length} hooks × {bodyFiles.length} bodies)
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-lg bg-red-500/10 p-4 text-red-500">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Voltar
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  size="lg"
                >
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isUploading ? "Enviando..." : "Gerar Combinações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Jobs */}
        <RecentJobs />
      </main>
    </div>
  );
}
