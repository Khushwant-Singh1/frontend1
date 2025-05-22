"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Upload, UserCircle } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";

interface CloudinaryUploadWidgetProps {
  onUpload: (url: string) => void;
  value?: string;
  disabled?: boolean;
}

export const CloudinaryUploadWidget = ({
  onUpload,
  value,
  disabled
}: CloudinaryUploadWidgetProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  // Hydration trick to avoid issues with SSR
  useState(() => {
    setIsMounted(true);
  });

  if (!isMounted) return null;

  return (
    <div className="relative mb-4 flex flex-col items-center justify-center">
      <div className="relative mb-2 h-32 w-32">
        {value ? (
          <Image
            src={value}
            alt="Profile Picture"
            fill
            className="rounded-full object-cover border-4 border-purple-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-800 border-4 border-gray-700">
            <UserCircle className="h-24 w-24 text-gray-500" />
          </div>
        )}
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          options={{
            maxFiles: 1,
            resourceType: "image",
            clientAllowedFormats: ["jpeg", "png", "jpg", "webp"],
            maxFileSize: 2000000, // 2MB
            sources: ["local", "camera", "url"],
            styles: {
              palette: {
                window: "#111827",
                windowBorder: "#39304A",
                tabIcon: "#8B5CF6",
                menuIcons: "#A78BFA",
                textDark: "#FFFFFF",
                textLight: "#8B5CF6",
                link: "#8B5CF6",
                action: "#8B5CF6",
                inactiveTabIcon: "#6B7280",
                error: "#EF4444",
                inProgress: "#A78BFA",
                complete: "#10B981",
                sourceBg: "#1F2937"
              }
            }
          }}
          onSuccess={(result: any) => {
            onUpload(result.info.secure_url);
            toast({
              title: "Success!",
              description: "Your profile picture has been updated.",
              variant: "default",
            });
          }}
          onError={() => {
            toast({
              title: "Something went wrong.",
              description: "There was a problem uploading your image.",
              variant: "destructive",
            });
          }}
        >
          {({ open }) => {
            return (
              <Button
                type="button"
                disabled={disabled}
                variant="secondary"
                size="icon"
                onClick={() => open()}
                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-purple-700 p-0 shadow-md transition-all hover:scale-110 hover:bg-purple-600"
              >
                <Pencil className="h-5 w-5 text-white" />
              </Button>
            );
          }}
        </CldUploadWidget>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Recommended: Square JPG, PNG. Max 2MB.
      </p>
    </div>
  );
};
