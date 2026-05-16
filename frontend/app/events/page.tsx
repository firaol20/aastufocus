"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import EventRegistrationForm, {
  RegistrationFormData,
} from "@/components/event-registration-form";
import { Banner } from "@/components/banner";

const heroSlides = [
  {
    image: "https://res.cloudinary.com/dllg3vnae/image/upload/AASTU_Hero/hero-4.jpg",
    title: "WORSHIP \n NIGHTS",
    description:
      "Join us for an unforgettable night of worship, praise, and spiritual reflection. Let's come together to lift our voices and experience the presence of God.",
  },
  {
    image: "https://res.cloudinary.com/dllg3vnae/image/upload/AASTU_Hero/hero-2.jpg",
    title: "BIBLE STUDY \n FELLOWSHIP",
    description:
      "Dive deep into the Word of God together. Grow in understanding, ask questions, and build lasting friendships in our weekly Bible study groups.",
  },
  {
    image: "https://res.cloudinary.com/dllg3vnae/image/upload/AASTU_Hero/hero-3.jpg",
    title: "COMMUNITY \n OUTREACH",
    description:
      "Be the hands and feet of Jesus. Join our latest mission trips and community service events to spread love and hope in our city.",
  },
];

export default function EventsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[650px] w-full flex items-center justify-center overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
          >
            <Image
              src={slide.image}
              alt="Hero Background"
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

        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <h1
            key={`title-${currentSlide}`}
            className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-[0.2em] mb-4 uppercase leading-tight scale-y-110 whitespace-pre-line animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            {heroSlides[currentSlide].title}
          </h1>
          <p
            key={`desc-${currentSlide}`}
            className="text-sm md:text-base lg:text-lg mb-10 text-white/90 font-light max-w-3xl mx-auto tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150"
          >
            {heroSlides[currentSlide].description}
          </p>
          <Button className="bg-white text-black hover:bg-gray-100 font-bold px-10 py-6 rounded-none uppercase tracking-[0.1em] text-[13px]">
            READ MORE
          </Button>

          {/* Slide Indicators */}
          <div className="absolute bottom-[-60px] md:bottom-[-80px] left-1/2 -translate-x-1/2 flex gap-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                    ? "bg-white w-8"
                    : "bg-white/40 hover:bg-white/80"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Events Tabs */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="bg-muted/50 backdrop-blur-md p-1.5 rounded-full border border-border/50">
                <TabsTrigger
                  value="upcoming"
                  className="rounded-full px-8 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                >
                  Upcoming Events
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="rounded-full px-8 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                >
                  Past Events
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="rounded-full px-8 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                >
                  Calendar View
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upcoming" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Event Cards */}
                {upcomingEvents.map((event, index) => (
                  <EventCard key={index} event={event} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="past" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Past Event Cards */}
                {pastEvents.map((event, index) => (
                  <EventCard key={index} event={event} isPast />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-8">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-center">
                  March 2024
                </h3>
                <div className="grid grid-cols-7 gap-1">
                  {/* Calendar header */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div key={day} className="text-center font-medium p-2">
                        {day}
                      </div>
                    ),
                  )}

                  {/* Calendar days */}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <div
                      key={day}
                      className={`text-center p-2 rounded-md ${[3, 10, 17, 24, 25].includes(day)
                          ? "bg-primary/10 font-medium cursor-pointer hover:bg-primary/20"
                          : ""
                        }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <h4 className="font-medium">Events this month:</h4>
                  <ul className="space-y-1">
                    <li className="text-sm">• Mar 3: Weekly Bible Study</li>
                    <li className="text-sm">• Mar 10: Weekly Bible Study</li>
                    <li className="text-sm">• Mar 17: Weekly Bible Study</li>
                    <li className="text-sm">• Mar 24: Weekly Bible Study</li>
                    <li className="text-sm">• Mar 25: Worship Night</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>


      {/* Event Registration */}
      <section className="py-16 px-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want to Register for an Event?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Click on any event to register or contact us for more information
            about upcoming activities.
          </p>
          <Button asChild size="lg">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

// Event Card Component
function EventCard({
  event,
  isPast = false,
}: {
  event: any;
  isPast?: boolean;
}) {
  const [showRegistration, setShowRegistration] = useState(false);

  const handleRegistrationSubmit = (data: RegistrationFormData) => {
    // Handle form submission here
    console.log("Registration data:", data);
    setShowRegistration(false);
  };

  return (
    <Card className="overflow-hidden h-full">
      <div className="relative h-48 w-full">
        <Image
          src={event.imageSrc || "/placeholder.svg"}
          alt={event.title}
          fill
          className="object-cover"
        />
        {isPast && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-medium px-3 py-1 bg-primary/80 rounded-md">
              Past Event
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
        <div className="flex items-center text-muted-foreground mb-1">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm">{event.date}</span>
        </div>
        <div className="flex items-center text-muted-foreground mb-1">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-sm">{event.time}</span>
        </div>
        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-sm">{event.location}</span>
        </div>
        <p className="text-muted-foreground">{event.description}</p>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={isPast ? "outline" : "default"} className="w-full">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>
            </DialogHeader>
            <div className="relative h-[300px] w-full overflow-hidden rounded-lg mb-4">
              <Image
                src={event.imageSrc || "/placeholder.svg"}
                alt={event.title}
                fill
                className="object-cover"
              />
              {isPast && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-medium px-3 py-1 bg-primary/80 rounded-md">
                    Past Event
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-5 w-5 mr-2" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{event.location}</span>
              </div>
              <div className="pt-2">
                <h4 className="font-semibold mb-2">About this event</h4>
                <p className="text-muted-foreground">{event.description}</p>
              </div>
              {!isPast && (
                <div className="pt-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setShowRegistration(true)}
                  >
                    Register for Event
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <EventRegistrationForm
          eventTitle={event.title}
          isOpen={showRegistration}
          onClose={() => setShowRegistration(false)}
          onSubmit={handleRegistrationSubmit}
        />
      </CardFooter>
    </Card>
  );
}

// Category Card Component
function CategoryCard({
  title,
  description,
  imageSrc,
}: {
  title: string;
  description: string;
  imageSrc: string;
}) {
  return (
    <div className="bg-card rounded-lg overflow-hidden border">
      <div className="relative h-40 w-full">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Sample data
const upcomingEvents = [
  {
    id: 1,
    title: "Weekly Bible Study",
    date: "March 20, 2024",
    time: "6:00 PM - 7:30 PM",
    location: "Main Campus, Room 201",
    description:
      "Join us as we study the Book of John and discover what it means to follow Jesus.",
    imageSrc: "/worship.jpg",
  },
  {
    id: 2,
    title: "Worship Night",
    date: "March 25, 2024",
    time: "7:00 PM - 9:00 PM",
    location: "University Auditorium",
    description:
      "A night of praise and worship to connect with God and each other.",
    imageSrc: "/worship.jpg",
  },
  {
    id: 3,
    title: "Community Outreach",
    date: "April 2, 2024",
    time: "9:00 AM - 1:00 PM",
    location: "Local Community Center",
    description:
      "Serving our community through various activities and sharing God's love.",
    imageSrc: "/worship.jpg",
  },
  {
    id: 4,
    title: "Prayer Breakfast",
    date: "April 8, 2024",
    time: "8:00 AM - 9:30 AM",
    location: "Campus Cafeteria",
    description:
      "Start your day with fellowship, prayer, and a delicious breakfast.",
    imageSrc: "/worship.jpg",
  },
  {
    id: 5,
    title: "Leadership Workshop",
    date: "April 15, 2024",
    time: "5:00 PM - 7:00 PM",
    location: "Student Center, Room 105",
    description: "Develop your leadership skills from a Christian perspective.",
    imageSrc: "/worship.jpg",
  },
  {
    id: 6,
    title: "Spring Retreat",
    date: "April 22-24, 2024",
    time: "All Day",
    location: "Mountain View Retreat Center",
    description:
      "A weekend of spiritual renewal, fellowship, and fun activities.",
    imageSrc: "/worship.jpg",
  },
];

const pastEvents = [
  {
    id: 101,
    title: "Welcome Week",
    date: "February 5, 2024",
    time: "11:00 AM - 2:00 PM",
    location: "Campus Quad",
    description: "Welcoming new and returning students to our fellowship.",
    imageSrc: "/worship.jpg",
  },
  {
    id: 102,
    title: "Movie Night",
    date: "February 12, 2024",
    time: "7:00 PM - 10:00 PM",
    location: "Student Center",
    description: "Watching and discussing a faith-based film together.",
    imageSrc: "/worship.jpg",
  },
  {
    id: 103,
    title: "Guest Speaker Series",
    date: "February 19, 2024",
    time: "6:30 PM - 8:00 PM",
    location: "Lecture Hall A",
    description: "Special talk on faith and academic excellence.",
    imageSrc: "/worship.jpg",
  },
];
