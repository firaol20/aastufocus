"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Plus, ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { TokenManager } from "@/lib/api";

interface GalleryUploadProps {
  onSuccess?: () => void;
  children: React.ReactNode;
}

export default function GalleryUpload({ onSuccess, children }: GalleryUploadProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingAlbums, setFetchingAlbums] = useState(false);
  const [albums, setAlbums] = useState<string[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string>("");
  const [newAlbumName, setNewAlbumName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success">("idle");

  useEffect(() => {
    if (open) {
      fetchAlbums();
    } else {
      resetForm();
    }
  }, [open]);

  const fetchAlbums = async () => {
    setFetchingAlbums(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/gallery/albums`);
      const data = await response.json();
      if (data.success) {
        setAlbums(data.albums);
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
      toast.error("Failed to load existing albums");
    } finally {
      setFetchingAlbums(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size too large. Maximum is 5MB.");
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const resetForm = () => {
    setSelectedAlbum("");
    setNewAlbumName("");
    setIsAddingNew(false);
    setFile(null);
    setPreview(null);
    setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const albumName = isAddingNew ? newAlbumName : selectedAlbum;

    if (!albumName) {
      toast.error("Please select or enter an album name");
      return;
    }

    if (!file) {
      toast.error("Please select a photo to upload");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("album", albumName);

    try {
      const token = TokenManager.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/gallery/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Photo uploaded successfully!");
        setStatus("success");
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setOpen(false);
        }, 2000);
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Submit Photo</DialogTitle>
          <DialogDescription>
            Share a moment with the fellowship. Upload a photo to an existing album or create a new one.
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500 animate-in zoom-in duration-500" />
            </div>
            <p className="text-xl font-bold">Upload Complete!</p>
            <p className="text-muted-foreground">Your photo has been added to Cloudinary.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Album Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Select Album</Label>
              {!isAddingNew ? (
                <div className="flex gap-2">
                  <Select
                    value={selectedAlbum}
                    onValueChange={setSelectedAlbum}
                    disabled={fetchingAlbums}
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-background/50">
                      <SelectValue placeholder={fetchingAlbums ? "Loading albums..." : "Choose an album"} />
                    </SelectTrigger>
                    <SelectContent>
                      {albums.map((album) => (
                        <SelectItem key={album} value={album}>
                          {album}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-12 rounded-2xl flex-shrink-0"
                    onClick={() => setIsAddingNew(true)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter new album name"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    className="h-12 rounded-2xl border-border/60 bg-background/50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 rounded-2xl"
                    onClick={() => setIsAddingNew(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Photo Upload Area */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Photo</Label>
              <div
                className={`relative group h-48 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden ${
                  preview ? "border-primary/50" : "border-border/60 hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-medium">Click to change</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Click or drag to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WebP (max 5MB)</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Submit Photo
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
