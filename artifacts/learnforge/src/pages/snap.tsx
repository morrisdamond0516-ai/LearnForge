import { useRef, useState } from "react";
import { Camera, Upload, RotateCcw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api-error";

type Solution = {
  title: string;
  readable: boolean;
  problem: string;
  steps: string[];
  finalAnswer: string;
};

/** Downscale + re-encode an image to keep the upload small. */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read the file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't load the image"));
      img.onload = () => {
        const maxDim = 1400;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function Snap() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [solution, setSolution] = useState<Solution | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      setPreview(dataUrl);
      setSolution(null);
    } catch (err) {
      toast({
        title: "Couldn't load image",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  }

  async function solve() {
    if (!preview || busy) return;
    setBusy(true);
    setSolution(null);
    try {
      const res = await fetch("/api/snap/solve", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview, note: note.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => undefined);
        throw new Error(
          errorMessage({ status: res.status, data }, "Couldn't solve that."),
        );
      }
      setSolution((await res.json()) as Solution);
    } catch (err) {
      toast({
        title: "Couldn't solve that",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setPreview(null);
    setNote("");
    setSolution(null);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <Camera className="h-7 w-7 text-primary" />
          Snap a Problem
        </h1>
        <p className="mt-1 text-muted-foreground">
          Take or upload a photo of a problem and get a step-by-step solution.
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPick}
      />

      {!preview ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Camera className="h-8 w-8" />
            </span>
            <p className="text-muted-foreground">
              Snap a clear photo of one problem. Handwriting works too.
            </p>
            <Button onClick={() => fileRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Choose or take a photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-5">
            <img
              src={preview}
              alt="Problem preview"
              className="mx-auto max-h-80 rounded-lg border border-border"
            />
            <Input
              placeholder="Add a note (optional), e.g. 'solve for x'"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={solve} disabled={busy}>
                <Lightbulb className="mr-2 h-4 w-4" />
                {busy ? "Reading..." : "Solve it"}
              </Button>
              <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
                <Upload className="mr-2 h-4 w-4" />
                New photo
              </Button>
              <Button variant="ghost" onClick={reset} disabled={busy}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {solution && (
        <Card className="animate-in fade-in duration-300">
          <CardHeader>
            <CardTitle className="text-lg">{solution.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!solution.readable ? (
              <p className="text-muted-foreground">
                I couldn't read a clear problem in that image. Try a sharper,
                closer photo with good lighting.
              </p>
            ) : (
              <>
                {solution.problem && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Problem
                    </p>
                    <p className="mt-1 text-foreground">{solution.problem}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Steps
                  </p>
                  <ol className="mt-2 space-y-2">
                    {solution.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {i + 1}
                        </span>
                        <span className="text-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                {solution.finalAnswer && (
                  <div className="rounded-lg bg-emerald-500/10 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                      Answer
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {solution.finalAnswer}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
