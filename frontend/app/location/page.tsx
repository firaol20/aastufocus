import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FadeIn,
} from "@/components/animations/motion";
import LocationPageMap from "@/components/location-page-map";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Navigation,
  ArrowRight,
} from "lucide-react";

export default function LocationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-background border-b border-border">
        {/* Background Glow */}
        <div className="absolute top-[-120px] left-[-100px] w-[350px] h-[350px] bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-120px] w-[350px] h-[350px] bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-foreground">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-md px-4 py-2 text-sm mb-6 text-primary">
              AASTU FOCUS Fellowship
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              Find Our
              <span className="block text-primary-gradient">
                Fellowship Location
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mb-8">
              Join our worship gatherings, fellowship programs, and spiritual
              community at AASTU campus.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <a href="#map-section">
                  Explore Map
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full h-12 px-8 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Floating Card */}
          <FadeIn delay={0.2}>
            <Card className="backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border-border/50 bg-card">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-primary uppercase tracking-widest">
                      Main Address
                    </p>
                    <h2 className="text-3xl font-bold mt-2">
                      AASTU FOCUS
                    </h2>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>

                      <div>
                        <p className="font-semibold">Akaki Quality 1/3</p>
                        <p className="text-muted-foreground text-sm">
                          Addis Ababa, Ethiopia
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>

                      <div>
                        <p className="font-semibold">Worship Hours</p>
                        <p className="text-muted-foreground text-sm">
                          Friday • 06:00 PM - 09:00 PM
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>

                      <div>
                        <p className="font-semibold">Phone</p>
                        <a
                          href="tel:0929414973"
                          className="text-muted-foreground text-sm hover:text-primary transition"
                        >
                          0929414973
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>

                      <div>
                        <p className="font-semibold">Email</p>
                        <a
                          href="mailto:aastufocus2010@gmail.com"
                          className="text-muted-foreground text-sm hover:text-primary transition"
                        >
                          aastufocus2010@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full rounded-2xl h-12 bg-primary-gradient text-white hover:opacity-90"
                  >
                    <a
                      href="https://www.google.com/maps/dir/?api=1&origin=8.887550587108628,38.809970887108214&destination=8.891263711200805,38.799113629416546"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Get Directions
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* Map Section */}
      <section
        id="map-section"
        className="relative py-24 px-4 md:px-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-[0.3em] text-primary uppercase mb-3">
              Visit Us
            </p>

            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Navigate Easily
            </h2>

            <p className="text-muted-foreground max-w-2xl mx-auto">
              Locate our fellowship center quickly and join us for worship,
              prayer, and community events.
            </p>
          </div>

          <FadeIn>
            <div className="rounded-[32px] overflow-hidden border border-border shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
              <LocationPageMap
                latitude={8.891263711200805}
                longitude={38.799113629416546}
                markerTitle="AASTU FOCUS Fellowship - Christian Student Fellowship Location"
                height="600px"
              />
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}