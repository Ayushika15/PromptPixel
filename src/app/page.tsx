"use client";

import { useState, useEffect } from 'react';
import NextImage from 'next/image'; // Renamed to avoid conflict with local Image component if any
import { generateImage } from '@/ai/flows/generate-image';
import type { GenerateImageInput, GenerateImageOutput } from '@/ai/flows/generate-image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, DownloadCloud, AlertTriangle } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

const imageStyles: Array<GenerateImageInput['style']> = ['Realistic', 'Anime', 'Cyberpunk', 'Fantasy'];

export default function PromptPixelPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [style, setStyle] = useState<GenerateImageInput['style']>(imageStyles[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError("Please describe the image you want to create.");
      toast({
        title: "Missing Prompt",
        description: "Please describe the image you want to create.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrl(null); 

    try {
      const result: GenerateImageOutput = await generateImage({ prompt, style });
      setImageUrl(result.imageUrl);
      toast({
        title: "Image Generated!",
        description: "Your masterpiece is ready.",
      });
    } catch (err) {
      console.error("Image generation failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during image generation.";
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch image for download: ${response.status} ${response.statusText}. Server said: ${errorText}`);
      }
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      
      const fileExtension = blob.type.split('/')[1] || 'png';
      const safePrompt = prompt.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase() || "image";
      link.download = `promptpixel_${style.toLowerCase()}_${safePrompt}.${fileExtension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({
        title: "Download Started",
        description: "Your image is being downloaded.",
      });
    } catch (downloadError) {
      console.error('Error downloading image:', downloadError);
      const errorMessage = downloadError instanceof Error ? downloadError.message : "Could not download image.";
      setError(errorMessage); // Also show in main error display if needed
      toast({
        title: "Download Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!isMounted) {
    // Render a placeholder or null during server-side rendering/hydration phase
    // to avoid hydration mismatches if any client-only logic runs immediately.
    // For this app structure, it's mostly for robust handling.
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8 font-body">
      <Card className="w-full max-w-xl shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="text-center bg-card pt-8 pb-4">
          <CardTitle className="text-4xl md:text-5xl font-headline text-primary tracking-tight">PromptPixel</CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            Turn your imagination into pixels.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="prompt-input" className="sr-only">Image Prompt</label>
            <Input
              id="prompt-input"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              className="text-base h-12"
              disabled={isLoading}
              aria-label="Image Prompt"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="style-select" className="sr-only">Image Style</label>
            <Select value={style} onValueChange={(value) => setStyle(value as GenerateImageInput['style'])} disabled={isLoading}>
              <SelectTrigger id="style-select" className="w-full text-base h-12" aria-label="Select image style">
                <SelectValue placeholder="Select image style" />
              </SelectTrigger>
              <SelectContent>
                {imageStyles.map((s) => (
                  <SelectItem key={s} value={s} className="text-base">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleGenerateImage}
            disabled={isLoading || !prompt.trim()}
            className="w-full text-lg py-3 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            aria-live="polite"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Image'
            )}
          </Button>
          
          {error && !isLoading && (
            <div role="alert" className="flex items-center space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertTriangle className="h-5 w-5 shrink-0"/>
              <p>{error}</p>
            </div>
          )}
        </CardContent>

        {isLoading && (
          <div className="flex flex-col justify-center items-center p-6 md:p-8 space-y-3">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-muted-foreground text-center">Crafting your vision... this might take a moment.</p>
          </div>
        )}

        {imageUrl && !isLoading && (
          <CardFooter className="flex flex-col items-center space-y-6 p-6 md:p-8 pt-2 bg-secondary/30">
            <div className="w-full aspect-square relative animate-fadeIn rounded-lg overflow-hidden border-2 border-border shadow-lg bg-muted/20">
              <NextImage
                src={imageUrl}
                alt={prompt || "Generated image"}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 512px"
                className="object-contain"
                priority
                data-ai-hint="generated art"
              />
            </div>
            <Button
              onClick={handleDownloadImage}
              variant="outline"
              className="w-full text-base py-3 h-12 border-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground rounded-lg"
              aria-label="Download generated image"
            >
              <DownloadCloud className="mr-2 h-5 w-5" />
              Download Image
            </Button>
          </CardFooter>
        )}
      </Card>
      <Toaster />
      <footer className="text-center py-8 text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} PromptPixel. Powered by AI.</p>
      </footer>
    </div>
  );
}
