import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, Users, ImageIcon, Heart } from "lucide-react";
import TestimonialCard from "@/components/testimonial-card";
import EventCard from "@/components/event-card";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  Parallax,
} from "@/components/animations/motion";
import HeroSection from "@/components/hero-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Welcome Message */}
      <section className="py-16  ">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
              Welcome
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Welcome to AASTU FOCUS Fellowship
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              AASTU FOCUS is a Christ-centered community dedicated to fostering
              spiritual growth, building meaningful relationships, and serving
              our campus and community. We believe in creating a welcoming
              environment where students can explore their faith, develop
              leadership skills, and make a positive impact.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <Button
              asChild
              variant="outline"
              className="group bg-primary-gradient text-white"
            >
              <Link href="/about">
                About Us{" "}
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-16 bg-muted/30 px-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join us for these upcoming fellowship activities and grow
                together in faith and community
              </p>
            </FadeIn>
          </div>

          <StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StaggerItem>
                <EventCard
                  title="Weekly Bible Study"
                  date="Every Wednesday, 6:00 PM"
                  location="Main Campus, Room 201"
                  description="Join us as we study the Book of John and discover what it means to follow Jesus."
                  imageSrc="https://res.cloudinary.com/dllg3vnae/image/upload/AASTU_Misc/bible-study.png"
                />
              </StaggerItem>
              <StaggerItem>
                <EventCard
                  title="Worship Night"
                  date="March 25, 7:00 PM"
                  location="Kilinto Church"
                  description="A night of praise and worship to connect with God and each other."
                  imageSrc="https://res.cloudinary.com/dllg3vnae/image/upload/AASTU_Misc/worship-night.jpg"
                />
              </StaggerItem>
              <StaggerItem>
                <EventCard
                  title="Break Mission"
                  date="April 2, 9:00 AM"
                  location="Local Community Center"
                  description="Serving our community through various activities and sharing God's love."
                  imageSrc="https://res.cloudinary.com/dllg3vnae/image/upload/AASTU_Misc/break-mission.jpg"
                />
              </StaggerItem>
            </div>
          </StaggerContainer>

          <div className="text-center mt-10">
            <FadeIn delay={0.4}>
              <Button
                asChild
                className="bg-primary-gradient text-white hover:opacity-90"
              >
                <Link href="/events">View All Events</Link>
              </Button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-10 ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-4">Testimonials</h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hear from our fellowship members about how AASTU FOCUS has
                impacted their lives
              </p>
            </FadeIn>
          </div>

          <StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StaggerItem>
                <TestimonialCard
                  quote="FOCUS Fellowship has been my spiritual home away from home. I've grown so much in my faith and made lifelong friends."
                  name="Sarah T."
                  role="Computer Science, 3rd Year"
                  avatarSrc="/placeholder.svg?height=100&width=100"
                />
              </StaggerItem>
              <StaggerItem>
                <TestimonialCard
                  quote="The leadership opportunities and mentorship I've received through FOCUS have shaped me not just spiritually but professionally."
                  name="Michael K."
                  role="Electrical Engineering, 4th Year"
                  avatarSrc="/placeholder.svg?height=100&width=100"
                />
              </StaggerItem>
              <StaggerItem>
                <TestimonialCard
                  quote="As an international student, FOCUS welcomed me with open arms and helped me find community when I needed it most."
                  name="Grace L."
                  role="Architecture, 2nd Year"
                  avatarSrc="/placeholder.svg?height=100&width=100"
                />
              </StaggerItem>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-4">Get Involved</h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="max-w-2xl mx-auto opacity-90">
                There are many ways to be part of our fellowship community
              </p>
            </FadeIn>
          </div>

          <StaggerContainer>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <StaggerItem>
                <Link
                  href="/events"
                  className="flex flex-col items-center p-6 bg-primary-foreground/10 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                >
                  <Calendar className="h-10 w-10 mb-3" />
                  <span className="text-lg font-medium">Events</span>
                </Link>
              </StaggerItem>
              <StaggerItem>
                <Link
                  href="/teams"
                  className="flex flex-col items-center p-6 bg-primary-foreground/10 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                >
                  <Users className="h-10 w-10 mb-3" />
                  <span className="text-lg font-medium">Teams</span>
                </Link>
              </StaggerItem>
              <StaggerItem>
                <Link
                  href="/gallery"
                  className="flex flex-col items-center p-6 bg-primary-foreground/10 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                >
                  <ImageIcon className="h-10 w-10 mb-3" />
                  <span className="text-lg font-medium">Gallery</span>
                </Link>
              </StaggerItem>
              <StaggerItem>
                <Link
                  href="/donate"
                  className="flex flex-col items-center p-6 bg-primary-foreground/10 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                >
                  <Heart className="h-10 w-10 mb-3" />
                  <span className="text-lg font-medium">Donate</span>
                </Link>
              </StaggerItem>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-6">
              Ready to Join Our Fellowship?
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Become part of a community that grows together in faith, serves
              with love, and builds lasting friendships.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Button
              asChild
              size="lg"
              className="bg-primary-gradient text-white hover:opacity-90"
            >
              <Link href="/join-us">Join AASTU FOCUS Today</Link>
            </Button>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
