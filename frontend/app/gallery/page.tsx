"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

import GalleryLightbox from "@/components/gallery-lightbox";
import GalleryUpload from "@/components/gallery-upload";
import { TokenManager } from "@/lib/api";

import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/motion";

interface Album {
  title: string;
  folder: string;
  date: string;
  photos: string[];
}

const gallerySlides = [
  { image: "/hero-section/hero-3.jpg" },
  { image: "/hero-section/hero-4.jpg" },
  { image: "/hero-section/hero-2.jpg" },
];

export default function GalleryPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [albums, setAlbums] = useState<Album[]>(initialPhotoAlbums);
  const [loading, setLoading] = useState(true);
  const [expandedAlbums, setExpandedAlbums] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % gallerySlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const fetchAllAlbums = async () => {
    setLoading(true);
    try {
      // First, get the list of albums from Cloudinary subfolders
      const albumsResponse = await fetch(`${process.env.NEXT_PUBLIC_API}/gallery/albums`);
      const albumsData = await albumsResponse.json();

      let albumList = initialPhotoAlbums;

      if (albumsData.success) {
        // Create a list of albums that combines initial ones with any new ones found in Cloudinary
        const cloudinaryAlbums = albumsData.albums.map((name: string) => ({
          title: name,
          folder: name,
          date: "Recently Added", // Default date for new albums
          photos: []
        }));

        // Merge them, prioritizing initialPhotoAlbums for titles/dates if they match
        albumList = [...initialPhotoAlbums];
        cloudinaryAlbums.forEach((ca: any) => {
          if (!albumList.find(a => a.folder === ca.folder)) {
            albumList.push(ca);
          }
        });
      }

      const updatedAlbums = await Promise.all(
        albumList.map(async (album) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API}/gallery/${encodeURIComponent(album.folder)}`);
            const data = await response.json();
            if (data.success) {
              return { ...album, photos: data.images };
            }
            return album;
          } catch (error) {
            console.error(`Error fetching album ${album.title}:`, error);
            return album;
          }
        })
      );
      setAlbums(updatedAlbums);
    } catch (error) {
      console.error("Error fetching all albums:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAlbums();
  }, []);

  const toggleAlbumExpansion = (index: number) => {
    setExpandedAlbums((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % gallerySlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + gallerySlides.length) % gallerySlides.length
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative h-[450px] md:h-[680px] w-full flex items-center justify-center overflow-hidden">
        {gallerySlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${index === currentSlide
              ? "opacity-100 scale-100 z-10"
              : "opacity-0 scale-105 z-0"
              }`}
          >
            <Image
              src={slide.image}
              alt="Gallery Background"
              fill
              className="object-cover"
              priority={index === 0}
            />

            {/* THEME CONSISTENT OVERLAY */}
            <div className="absolute inset-0 bg-primary/70 mix-blend-multiply" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
        >
          <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
        >
          <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {gallerySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${index === currentSlide
                ? "bg-white w-10 h-2.5"
                : "bg-white/50 hover:bg-white/80 w-2.5 h-2.5"
                }`}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-6">
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm tracking-wide">
                Fellowship Memories
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[0.2em] uppercase leading-tight scale-y-110 mb-6">
              GALLERY
            </h1>

            <p className="text-sm md:text-base lg:text-lg text-white/90 font-light tracking-wide leading-relaxed max-w-2xl mx-auto">
              Browse photos and videos from our fellowship events and
              unforgettable moments together.
            </p>

            <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
              <Button
                size="lg"
                className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => document.getElementById('gallery-content')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Gallery
              </Button>

              <GalleryUpload onSuccess={fetchAllAlbums}>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
                >
                  Submit Photos
                </Button>
              </GalleryUpload>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="py-20 px-4 md:px-10">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="photos" className="w-full">
            {/* Tabs */}
            <div className="flex justify-center mb-14">
              <TabsList className="bg-muted/60 p-1 rounded-full border">
                <TabsTrigger
                  value="photos"
                  className="rounded-full px-8"
                >
                  Photo Albums
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent id="gallery-content" value="photos" className="space-y-20">
              {albums.map((album, index) => {
                const isExpanded = expandedAlbums[index] || false;
                const visiblePhotos = isExpanded ? album.photos : album.photos.slice(0, 8);
                const hasMore = album.photos.length > 8;

                return (
                  <div key={index} className="space-y-8">
                    {/* Album Header */}
                    <FadeIn>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-[2px] bg-primary" />

                            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                              Album Collection
                            </span>
                          </div>

                          <h2 className="text-3xl md:text-4xl font-bold">
                            {album.title}
                          </h2>

                          <p className="text-muted-foreground flex items-center mt-3">
                            <Calendar className="h-4 w-4 mr-2" />
                            {album.date}
                          </p>
                        </div>

                        {hasMore && (
                          <button
                            onClick={() => toggleAlbumExpansion(index)}
                            className="group relative overflow-hidden rounded-2xl border border-border bg-background/80 backdrop-blur-sm px-6 py-4 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 min-w-[220px]"
                          >
                            {/* Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative flex items-center justify-between gap-4">
                              {/* Text */}
                              <div className="text-left">
                                <p className="text-sm text-muted-foreground">
                                  {album.photos.length} Photos
                                </p>

                                <h4 className="font-semibold text-base">
                                  {isExpanded ? "Show Less Photos" : "View Full Album"}
                                </h4>
                              </div>

                              {/* Icon */}
                              <div
                                className={`flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground transition-all duration-300 ${isExpanded
                                    ? "rotate-90"
                                    : "group-hover:translate-x-1"
                                  }`}
                              >
                                <ArrowRight className="w-5 h-5" />
                              </div>
                            </div>
                          </button>
                        )}
                      </div>
                    </FadeIn>

                    {/* Photo Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 min-h-[200px]">
                      {loading ? (
                        // Skeleton Loaders
                        [...Array(4)].map((_, i) => (
                          <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
                        ))
                      ) : (
                        <StaggerContainer
                          key={`${index}-${isExpanded}`}
                          className="col-span-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
                        >
                          {album.photos.length > 0 ? (
                            visiblePhotos.map((photo, photoIndex) => (
                              <StaggerItem key={photoIndex}>
                                <GalleryLightbox
                                  images={album.photos}
                                  initialIndex={photoIndex}
                                >
                                  <div className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer bg-muted border hover:shadow-2xl transition-all duration-500">
                                    <Image
                                      src={photo || "/worship.jpg"}
                                      alt={`Photo ${photoIndex + 1}`}
                                      fill
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                                      unoptimized={photo.includes(".png") || photo.includes(".jpg")} // Optional: try unoptimized if Next.js processing fails
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

                                    {/* Hover Content */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-primary/20 flex items-end">
                                      <div className="p-4 w-full">
                                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
                                          <p className="text-white text-sm font-medium">
                                            Click to preview
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </GalleryLightbox>
                              </StaggerItem>
                            ))
                          ) : (
                            <div className="col-span-full py-10 text-center text-muted-foreground">
                              No photos found in this album.
                            </div>
                          )}
                        </StaggerContainer>
                      )}
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* SUBMIT SECTION */}
      <section className="py-20 px-4 md:px-10">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/10 mb-6">
              <ImageIcon className="w-4 h-4 text-primary" />

              <span className="text-sm text-primary">
                Share Fellowship Moments
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Have Photos to Share?
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              If you have photos or videos from our fellowship events that you'd
              like to share, we’d love to add them to our gallery.
            </p>

            <GalleryUpload onSuccess={fetchAllAlbums}>
              <Button
                size="lg"
                className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <ImageIcon className="h-5 w-5 mr-2" />
                Submit Your Photos
              </Button>
            </GalleryUpload>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

/* SAMPLE DATA */

const initialPhotoAlbums: Album[] = [
  {
    title: "2nd year Retreat 2026",
    folder: "2nd year Retreat 2026",
    date: "March 2026",
    photos: [],
  },
  {
    title: "Sandafa and Alaltu Break Mission 2026",
    folder: "Sandafa and Alaltu Break Mission 2026",
    date: "March 2026",
    photos: [],
  },
  {
    title: "14th Anniversary 2026",
    folder: "14th Anniversary 2026",
    date: "February 2026",
    photos: [],
  },
  {
    title: "Easter Program 2026",
    folder: "Easter Program 2026",
    date: "April 2026",
    photos: [],
  },
];
