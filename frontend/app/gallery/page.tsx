"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, ImageIcon, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import GalleryLightbox from "@/components/gallery-lightbox";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/motion";

const gallerySlides = [
  { image: "/hero-section/hero-3.jpg" },
  { image: "/hero-section/hero-4.jpg" },
  { image: "/hero-section/hero-2.jpg" },
];

export default function GalleryPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % gallerySlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[650px] w-full flex items-center justify-center overflow-hidden">
        {gallerySlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={slide.image}
              alt="Gallery Background"
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-[#3f125a]/70 mix-blend-multiply"></div>
          </div>
        ))}
        
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-20"
        >
          <ChevronLeft className="w-12 h-12 md:w-16 md:h-16 font-light stroke-1" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-20"
        >
          <ChevronRight className="w-12 h-12 md:w-16 md:h-16 font-light stroke-1" />
        </button>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
          {gallerySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
        
        <div className="relative z-20 text-center text-white px-4 max-w-3xl mx-auto mt-10 md:mt-16">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-[0.2em] mb-6 uppercase leading-tight scale-y-110">
              GALLERY
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-white/90 font-light tracking-wide leading-relaxed">
              Browse photos and videos from our fellowship events and activities.
            </p>
          </div>
        </div>
      </section>
      

      {/* Gallery Tabs */}
      <section className="py-16 px-4 md:px-10 ">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="photos" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="photos">Photo Albums</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="photos" className="space-y-12">
              {/* Photo Albums */}
              {photoAlbums.map((album, index) => (
                <div key={index} className="space-y-6">
                  <FadeIn>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">{album.title}</h2>
                        <p className="text-muted-foreground flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          {album.date}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </div>
                  </FadeIn>

                  <StaggerContainer>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {album.photos.map((photo, photoIndex) => (
                        <StaggerItem key={photoIndex}>
                          <GalleryLightbox
                            images={album.photos}
                            initialIndex={photoIndex}
                          >
                            <div className="relative aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity">
                              <Image
                                src={photo || "/worship.jpg"}
                                alt={`Photo ${photoIndex + 1} from ${
                                  album.title
                                }`}
                                fill
                                className="object-cover transition-transform duration-500 hover:scale-110"
                              />
                            </div>
                          </GalleryLightbox>
                        </StaggerItem>
                      ))}
                    </div>
                  </StaggerContainer>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="videos" className="space-y-8">
              <StaggerContainer>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video, index) => (
                    <StaggerItem key={index}>
                      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                        <div className="relative aspect-video overflow-hidden group">
                          <Image
                            src={video.thumbnail || "/worship.jpg"}
                            alt={video.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-primary/90 p-3 text-primary-foreground transform transition-transform duration-300 group-hover:scale-110">
                              <Play className="h-8 w-8" />
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg">{video.title}</h3>
                          <p className="text-muted-foreground text-sm mt-1">
                            {video.date}
                          </p>
                        </CardContent>
                      </Card>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Featured Gallery */}
      <section className="py-16 px-4 md:px-10 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-4">Featured Moments</h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Special highlights from our fellowship journey
              </p>
            </FadeIn>
          </div>

          <StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StaggerItem>
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden group">
                  <Image
                    src="/worship.jpg"
                    alt="Worship night"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4 text-white transform transition-transform duration-300 group-hover:translate-y-[-8px]">
                      <h3 className="font-bold text-lg">Worship Night</h3>
                      <p className="text-sm opacity-90">
                        A night of praise and worship
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden group">
                  <Image
                    src="/worship.jpg"
                    alt="Community service"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4 text-white transform transition-transform duration-300 group-hover:translate-y-[-8px]">
                      <h3 className="font-bold text-lg">Community Service</h3>
                      <p className="text-sm opacity-90">
                        Serving our local community
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden group">
                  <Image
                    src="/worship.jpg"
                    alt="Bible study"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4 text-white transform transition-transform duration-300 group-hover:translate-y-[-8px]">
                      <h3 className="font-bold text-lg">Bible Study</h3>
                      <p className="text-sm opacity-90">
                        Growing together in God's word
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Submit Photos */}
      <section className="py-16 px-4 md:px-10">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-4">Have Photos to Share?</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              If you have photos or videos from our events that you'd like to
              share, we'd love to add them to our gallery!
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Button size="lg" className="flex items-center gap-2 animate-pulse">
              <ImageIcon className="h-5 w-5" />
              Submit Your Photos
            </Button>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

// Sample data
const photoAlbums = [
  {
    title: "Retreat 2025",
    date: "April 2024",
    photos: [
      "/worship.jpg",
      "/worship.jpg",
      "/worship.jpg",
      "/worship.jpg",
      "/worship.jpg",
      "/worship.jpg",
      "/worship.jpg",
      "/worship.jpg",
    ],
  },
  {
    title: "Worship Night",
    date: "March 2024",
    photos: ["/worship.jpg", "/worship.jpg", "/worship.jpg", "/worship.jpg"],
  },
  {
    title: "Community Service Day",
    date: "February 2024",
    photos: ["/worship.jpg", "/worship.jpg", "/worship.jpg", "/worship.jpg"],
  },
];

const videos = [
  {
    title: "Worship Night Highlights",
    date: "March 25, 2024",
    thumbnail: "/worship.jpg",
  },
  {
    title: "Testimony: Finding Faith in College",
    date: "March 10, 2024",
    thumbnail: "/worship.jpg",
  },
  {
    title: "Bible Study Series: Book of John",
    date: "February 15, 2024",
    thumbnail: "/worship.jpg",
  },
  {
    title: "Christmas Celebration 2023",
    date: "December 20, 2023",
    thumbnail: "/worship.jpg",
  },
  {
    title: "Welcome Week 2023",
    date: "September 5, 2023",
    thumbnail: "/worship.jpg",
  },
  {
    title: "Summer Mission Trip Recap",
    date: "August 15, 2023",
    thumbnail: "/worship.jpg",
  },
];
