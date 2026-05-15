"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CountUp,
} from "@/components/animations/motion";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-section/hero-2.jpg"
            alt="About Us Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#3f125a]/70 mix-blend-multiply"></div>
        </div>

        <div className="relative z-20 text-center text-white px-4 max-w-3xl mx-auto mt-10 md:mt-16">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-[0.2em] mb-6 uppercase leading-tight scale-y-110">
              ABOUT US
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-white/90 font-light tracking-wide leading-relaxed">
              Learn more about AASTU FOCUS Fellowship, our mission, vision, and the people who make it happen.
            </p>
          </div>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-16 px-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn direction="right">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Our Mission & Vision
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Mission</h3>
                    <p className="text-muted-foreground">
                      Our mission is to build a Christ-centered community that
                      fosters spiritual growth, meaningful relationships, and
                      service to our campus and beyond.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Vision</h3>
                    <p className="text-muted-foreground">
                      We envision a campus where students are transformed by the
                      love of Christ, equipped to live out their faith, and
                      empowered to make a positive impact in their communities.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Purpose</h3>
                    <p className="text-muted-foreground">
                      AASTU FOCUS exists to provide a supportive community where
                      students can explore and deepen their faith, develop
                      leadership skills, and find purpose through serving
                      others.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="left">
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="/events.jpg"
                  alt="Fellowship gathering"
                  fill
                  className="object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-10 bg-primary-gradient text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <CountUp end={100} suffix="+" />
              </div>
              <p className="text-primary-foreground/80">Active Members</p>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <CountUp end={6} />
              </div>
              <p className="text-primary-foreground/80">Ministry Teams</p>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <CountUp end={52} suffix="+" />
              </div>
              <p className="text-primary-foreground/80">Events Per Year</p>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <CountUp end={14} />
              </div>
              <p className="text-primary-foreground/80">Years of Impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-10 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do as a fellowship
              </p>
            </FadeIn>
          </div>

          <StaggerContainer>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StaggerItem>
                <Card className="text-center h-full">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">1</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Faith</h3>
                    <p className="text-muted-foreground">
                      Grounding everything we do in Christ and His teachings,
                      seeking to grow in our relationship with God.
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="text-center h-full">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">2</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Community</h3>
                    <p className="text-muted-foreground">
                      Creating a welcoming environment where authentic
                      relationships can flourish.
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="text-center h-full">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">3</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Service</h3>
                    <p className="text-muted-foreground">
                      Following Christ's example by serving others with humility
                      and compassion.
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="text-center h-full">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">4</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Growth</h3>
                    <p className="text-muted-foreground">
                      Encouraging continuous spiritual, personal, and leadership
                      development.
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* History */}
      <section className="py-16 px-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-4">Our History</h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The journey of AASTU FOCUS Fellowship from its beginnings to
                today
              </p>
            </FadeIn>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            <StaggerContainer>
              <StaggerItem>
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xl font-bold">2015</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">The Beginning</h3>
                    <p className="text-muted-foreground">
                      AASTU FOCUS Fellowship was founded by a small group of
                      five students who wanted to create a space for Christian
                      fellowship on campus. They began meeting weekly for prayer
                      and Bible study.
                    </p>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xl font-bold">2017</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Growing Community
                    </h3>
                    <p className="text-muted-foreground">
                      The fellowship grew to over 30 regular members and began
                      organizing larger events, including worship nights and
                      community service projects.
                    </p>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xl font-bold">2020</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Virtual Adaptation
                    </h3>
                    <p className="text-muted-foreground">
                      During the global pandemic, FOCUS adapted by moving
                      meetings online, which unexpectedly allowed us to reach
                      more students and maintain our community despite physical
                      distance.
                    </p>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xl font-bold">Today</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Thriving Fellowship
                    </h3>
                    <p className="text-muted-foreground">
                      Today, AASTU FOCUS has grown into a vibrant community with
                      over 100 members, multiple weekly gatherings, and a strong
                      presence on campus. We continue to focus on spiritual
                      growth, community building, and service.
                    </p>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-4">Our Leadership Team</h2>
            </FadeIn>
            <FadeIn>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Meet the dedicated individuals who guide our fellowship
              </p>
            </FadeIn>
          </div>

          <Tabs defaultValue="executive" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="executive">Main Leader</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="executive" className="space-y-8 px-10">
              <StaggerContainer>
                <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                  <StaggerItem>
                    <LeaderCard
                      name="Abdi Takele"
                      role="Ex Leader"
                      bio="God made Him who had no sin to be sin for us, so that in Him we might become the righteousness of God.— 2 Corinthians 5:21."
                      imageSrc="/Teams/Hopa.jpg"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <LeaderCard
                      name="Hayu Rabira"
                      role="Ex Leader"
                      bio="“Trust in the Lord with all your heart,and lean not on your own understanding;in all your ways acknowledge Him,and He shall direct your paths.” — Proverbs 3:5–6"
                      imageSrc="/Teams/hayu.jpg"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <LeaderCard
                      name="Naol Wandimu"
                      role="Ex Leader"
                      bio="For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.”— John 3:16"
                      imageSrc="/Teams/naol.png"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <LeaderCard
                      name="Moti Tesfaye"
                      role="Main Leader"
                      bio="“Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.”— Joshua 1:9"
                      imageSrc="/Teams/kingo.png"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <LeaderCard
                      name="Firaol Bashada"
                      role="Main Leader"
                      bio="“Who among the gods is like You, Lord? Who is like You—majestic in holiness, awesome in glory, working wonders?” — Exodus 15:11"
                      imageSrc="/Teams/fira.png"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <LeaderCard
                      name="Amanuel legese"
                      role="Main Leader"
                      bio="“For in the gospel the righteousness of God is revealed — a righteousness that is by faith from first to last.”— Romans 1:17"
                      imageSrc="/Teams/Amo.jpg"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <LeaderCard
                      name="Gifti Tesfaye"
                      role="Main Leader"
                      bio="“Holy, holy, holy is the Lord Almighty;the whole earth is full of His glory.”— Isaiah 6:3"
                      imageSrc="/Teams/gifti.jpg"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <LeaderCard
                      name="Elsabet Birhanu"
                      role="Main Leader"
                      bio="God made Him who had no sin to be sin for us, so that in Him we might become the righteousness of God.”— 2 Corinthians 5:21"
                      imageSrc="/Teams/Elsabet.jpg"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <LeaderCard
                      name="Yosef Shibiru"
                      role="Main Leader"
                      bio="“Blessed is the one who trusts in the Lord, whose confidence is in Him.”— Jeremiah 17:7"
                      imageSrc="/Teams/yosef.jpg"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <LeaderCard
                      name="Hunduma Alamayo"
                      role="Main Leader"
                      bio="“There is no one holy like the Lord; there is no one besides You.”— 1 Samuel 2:2"
                      imageSrc="/Teams/Hunduma.jpg"
                    />
                  </StaggerItem>
                </div>
              </StaggerContainer>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-6">Want to Learn More?</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              We'd love to tell you more about our fellowship and answer any
              questions you might have.
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

// Leader Card Component
function LeaderCard({
  name,
  role,
  bio,
  imageSrc,
}: {
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
}) {
  return (
    <Card className="overflow-hidden h-auto min-w-[320px] max-w-[360px] max-h-[420px] transition-shadow duration-300 hover:shadow-lg">
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-primary font-medium mb-2">{role}</p>
        <p className="text-sm text-muted-foreground">{bio}</p>
      </CardContent>
    </Card>
  );
}
