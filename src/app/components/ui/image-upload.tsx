import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import { X, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string | File | null;
  onChange: (value: string | File | null) => void;
  className?: string;
  error?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  className,
  error,
}: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === "string") {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange(null);
    setPreview(null);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={cn("relative", className)}>
      {preview ? (
        <div className="relative w-full h-full">
          <Image
            src={preview}
            alt="Upload preview"
            fill
            loading="lazy"
            className="object-cover rounded-md"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            "w-full h-full flex flex-col items-center justify-center cursor-pointer rounded-md border-2 border-slate-200 border-dashed hover:border-gray-400 transition-colors"
          )}
        >
          <Input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => onChange(e.target.files?.[0] || null)}
            className="hidden"
          />
          <ImagePlus className="h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Click to upload cover image
          </p>
          <p className="text-xs text-gray-400">
            SVG, PNG, JPG or GIF (Max 5MB)
          </p>
        </div>
      )}
    </div>
  );
}
