"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadZone } from "@/components/upload-zone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Combinar Vídeos de Hooks e Bodies</CardTitle>
            <CardDescription>
              Faça upload de vídeos de hooks e bodies. O sistema irá gerar todas as
              combinações possíveis automaticamente.
            </CardDescription>
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

            <div className="mt-6 flex justify-end">
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

        <div className="text-center text-sm text-foreground/60">
          <p>
            Faça upload de seus vídeos e aguarde o processamento. Você será redirecionado
            para acompanhar o progresso.
          </p>
        </div>
      </main>
    </div>
  );
}
