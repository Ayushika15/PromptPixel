import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster for notifications

export const metadata: Metadata = {
  title: 'PromptPixel - AI Image Generator',
  description: 'Generate stunning images from text prompts with PromptPixel, powered by AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
