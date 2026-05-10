import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/motion";
import LocationPageMap from "@/components/location-page-map";
import {
  MapPin,
  Bus,
  Car,
  Train,
  Clock,
  Phone,
  Mail,
  Navigation,
} from "lucide-react";
import { Banner } from "@/components/banner";

export default function LocationPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-section/university-location-hero.png"
            alt="Location Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#3f125a]/70 mix-blend-multiply"></div>
        </div>
        
        <div className="relative z-20 text-center text-white px-4 max-w-3xl mx-auto mt-10 md:mt-16">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-[0.2em] mb-6 uppercase leading-tight scale-y-110">
              OUR LOCATION
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-white/90 font-light tracking-wide leading-relaxed">
              Find us on campus and get directions to our fellowship meetings and events.
            </p>
          </div>
        </div>
      </section>
      {/* Main Map Section */}
      <section className="py-16 px-4 md:px-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <FadeIn>
                <LocationPageMap
                  latitude={8.891263711200805}
                  longitude={38.799113629416546}
                  markerTitle="AASTU FOCUS Fellowship - Christian Student Fellowship Location"
                  height="500px"
                />
              </FadeIn>
            </div>

            <div className="space-y-6">
              <FadeIn delay={0.1}>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Main Location</h2>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium">
                            AASTU FOCUS FELLOWSHIP
                          </p>
                          <p className="text-muted-foreground">
                            Akaki Quality 1/3
                          </p>
                          <p className="text-muted-foreground">
                            Addis Ababa, Ethiopia
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium">Worship Hours</p>
                          <p className="text-muted-foreground">
                            Friday: 06:00 PM - 09:00 PM
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-muted-foreground">
                            <a
                              href="tel:+251949434281"
                              className="hover:text-primary"
                            >
                              +251949434281
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-muted-foreground">
                            <a
                              href="mailto:contact@aastufocus.org"
                              className="hover:text-primary"
                            >
                              aastufocusofficail2012@gmail.com
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="flex flex-col gap-3">
                  <Button asChild className="flex items-center gap-2">
                    <a
                      href="https://www.google.com/maps/dir/?api=1&origin=8.887550587108628,38.809970887108214&destination=8.891263711200805,38.799113629416546"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="h-4 w-4" /> Get Directions
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Transportation Options */}
      <section className="py-16 px-4 md:px-10 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-4">Getting Here</h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Multiple transportation options are available to reach our
                location
              </p>
            </FadeIn>
          </div>

          <Tabs defaultValue="public" className="w-full max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="public" className="flex items-center gap-2">
                  <Bus className="h-4 w-4" /> Public Transport
                </TabsTrigger>
                <TabsTrigger value="car" className="flex items-center gap-2">
                  <Car className="h-4 w-4" /> By Car
                </TabsTrigger>
                <TabsTrigger value="campus" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> From Campus
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="public" className="space-y-6">
              <StaggerContainer>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StaggerItem>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bus className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-xl font-bold">Bus Routes</h3>
                        </div>
                        <ul className="space-y-2 text-muted-foreground">
                          <li>
                            • Route 35: Megenagna to AASTU (Stop: Main Gate)
                          </li>
                          <li>
                            • Route 42: Piazza to AASTU (Stop: Science Building)
                          </li>
                          <li>
                            • Route 18: Mexico Square to AASTU (Stop: Library)
                          </li>
                        </ul>
                        <p className="mt-4 text-sm">
                          Buses run every 15-20 minutes during weekdays.
                        </p>
                      </CardContent>
                    </Card>
                  </StaggerItem>

                  <StaggerItem>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Train className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-xl font-bold">Light Rail</h3>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          Take the East-West Line to Ayat Station, then transfer
                          to Bus Route 35 to AASTU.
                        </p>
                        <p className="text-muted-foreground">
                          The light rail runs from 6:00 AM to 10:00 PM daily.
                        </p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                </div>
              </StaggerContainer>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">Taxi Services</h3>
                <p className="text-muted-foreground mb-4">
                  Ride-sharing and taxi services are readily available
                  throughout Addis Ababa.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      alt="Ride"
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                    <div>
                      <p className="font-medium">Ride</p>
                      <p className="text-sm text-muted-foreground">
                        Local ride-sharing app
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      alt="ZayRide"
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                    <div>
                      <p className="font-medium">ZayRide</p>
                      <p className="text-sm text-muted-foreground">
                        Taxi booking service
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="car" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Driving Directions</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">From City Center:</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                        <li>
                          Head east on Churchill Avenue toward Ras Mekonnen
                          Avenue
                        </li>
                        <li>Continue onto Jomo Kenyatta Street</li>
                        <li>Turn right onto Africa Avenue (Bole Road)</li>
                        <li>
                          Continue for 5 km, then turn left onto Ring Road
                        </li>
                        <li>After 3 km, turn right at the AASTU sign</li>
                        <li>Follow campus signs to the Student Center</li>
                      </ol>
                    </div>

                    <div>
                      <p className="font-medium">
                        From Bole International Airport:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Exit the airport and head west on Airport Road</li>
                        <li>Continue onto Africa Avenue (Bole Road)</li>
                        <li>After 7 km, turn left onto Ring Road</li>
                        <li>
                          Continue for 3 km, then turn right at the AASTU sign
                        </li>
                        <li>Follow campus signs to the Student Center</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">Parking Information</h3>
                <p className="text-muted-foreground mb-4">
                  Free parking is available in the following areas:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • Student Center Parking Lot (closest to our location)
                  </li>
                  <li>• Main Campus Parking Area (5-minute walk)</li>
                  <li>
                    • Visitor Parking by the Administration Building (7-minute
                    walk)
                  </li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  Note: Parking can fill up quickly during weekdays. We
                  recommend arriving early.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="campus" className="space-y-6">
              <div className="relative h-[300px] rounded-lg overflow-hidden mb-6">
                <Image
                  src="/placeholder.svg?height=300&width=800"
                  alt="Campus map"
                  fill
                  className="object-cover"
                />
              </div>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Walking Directions from Campus Landmarks
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">From the Main Library:</p>
                      <ul className="list-disc list-inside text-muted-foreground ml-4">
                        <li>Exit the library and turn right</li>
                        <li>Walk past the Science Building</li>
                        <li>The Student Center will be on your left</li>
                        <li>
                          Enter through the main doors and go to Room 105 on the
                          first floor
                        </li>
                        <li>Approximate walking time: 5 minutes</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">
                        From the Engineering Building:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground ml-4">
                        <li>Exit the Engineering Building and head south</li>
                        <li>Cross the central plaza</li>
                        <li>
                          The Student Center is directly across from the plaza
                        </li>
                        <li>
                          Enter through the main doors and go to Room 105 on the
                          first floor
                        </li>
                        <li>Approximate walking time: 7 minutes</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium">From the Dormitories:</p>
                      <ul className="list-disc list-inside text-muted-foreground ml-4">
                        <li>
                          Exit the dormitory area and follow the main pathway
                        </li>
                        <li>Pass the cafeteria on your right</li>
                        <li>
                          Continue straight until you reach the Student Center
                        </li>
                        <li>
                          Enter through the main doors and go to Room 105 on the
                          first floor
                        </li>
                        <li>Approximate walking time: 10 minutes</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Nearby Landmarks */}
      <section className="py-16 px-4 md:px-10  ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-4">Nearby Landmarks</h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Helpful reference points around our location
              </p>
            </FadeIn>
          </div>

          <StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <StaggerItem>
                <Card className="h-full">
                  <div className="relative h-40 w-full">
                    <Image
                      src="/placeholder.svg?height=160&width=320"
                      alt="University Library"
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">
                      University Library
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      The large modern building with glass facade. We're a
                      5-minute walk southwest from here.
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="h-full">
                  <div className="relative h-40 w-full">
                    <Image
                      src="/placeholder.svg?height=160&width=320"
                      alt="Main Cafeteria"
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">Main Cafeteria</h3>
                    <p className="text-muted-foreground text-sm">
                      The busy dining hall with outdoor seating area. We're
                      directly across the plaza.
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="h-full">
                  <div className="relative h-40 w-full">
                    <Image
                      src="/placeholder.svg?height=160&width=320"
                      alt="Administration Building"
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">
                      Administration Building
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      The tall building with the university flag. We're a
                      7-minute walk northeast from here.
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Weekly Meeting Schedule */}
      <section className="py-16 px-4 md:px-10  ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-4">
                Weekly Meeting Schedule
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join us at these regular gatherings throughout the week
              </p>
            </FadeIn>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">Bible Study</h3>
                  <p className="text-primary font-medium mb-1">
                    Wednesdays, 6:00 PM
                  </p>
                  <p className="text-muted-foreground text-sm mb-2">
                    Student Center, Room 105
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Weekly study of Scripture with discussion and application.
                  </p>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">Prayer Meeting</h3>
                  <p className="text-primary font-medium mb-1">
                    Mondays, 7:30 AM
                  </p>
                  <p className="text-muted-foreground text-sm mb-2">
                    Student Center, Room 105
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start your week with prayer and fellowship.
                  </p>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">Worship Night</h3>
                  <p className="text-primary font-medium mb-1">
                    Fridays, 7:00 PM
                  </p>
                  <p className="text-muted-foreground text-sm mb-2">
                    University Auditorium
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Evening of praise, worship, and community.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button asChild>
                <Link href="/events">View All Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-6">Visit Us This Week</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              We'd love to welcome you to our fellowship. Join us at any of our
              weekly gatherings or contact us for more information.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/join-us">Join Our Fellowship</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
