import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Music,
  Heart,
  BookOpen,
  MessageCircle,
  Megaphone,
} from "lucide-react";
import { FadeIn } from "@/components/animations/motion";
import { Banner } from "@/components/banner";

export default function TeamsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-section/hero-4.jpg"
            alt="Teams Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#3f125a]/70 mix-blend-multiply"></div>
        </div>

        <div className="relative z-20 text-center text-white px-4 max-w-3xl mx-auto mt-10 md:mt-16">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-[0.2em] mb-6 uppercase leading-tight scale-y-110">
              OUR TEAMS
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-white/90 font-light tracking-wide leading-relaxed">
              Discover the different ministry teams that make our fellowship
              thrive and find where you can serve.
            </p>
          </div>
        </div>
      </section>

      {/* Teams Overview */}
      <section className="py-16 px-4 md:px-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ministry Teams</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our fellowship is organized into several teams, each with a
              specific focus and purpose
            </p>
          </div>

          <Tabs defaultValue="worship" className="w-full pb-10">
            <div className="flex justify-center mb-8  pb-2">
              <TabsList className="flex-wrap justify-center">
                <TabsTrigger
                  value="worship"
                  className="flex items-center gap-2"
                >
                  <Music className="h-4 w-4" />
                  Worship
                </TabsTrigger>
                <TabsTrigger
                  value="outreach"
                  className="flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Outreach
                </TabsTrigger>
                <TabsTrigger
                  value="bible-study"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Bible Study
                </TabsTrigger>
                <TabsTrigger value="prayer" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Prayer
                </TabsTrigger>
                <TabsTrigger
                  value="welcome"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Welcome
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4" />
                  Media
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="worship" className="space-y-8 pt-16 lg:pt-2">
              <TeamSection
                name="Worship Team"
                description="Our worship team leads the fellowship in praise and worship during our gatherings, creating an atmosphere for encountering God."
                responsibilities={[
                  "Lead worship during weekly gatherings and special events",
                  "Practice and prepare worship sets",
                  "Develop musical skills and spiritual leadership",
                  "Create an atmosphere conducive to worship",
                ]}
                requirements={[
                  "A heart for worship and leading others in worship",
                  "Musical ability (vocal or instrumental)",
                  "Commitment to regular practice and spiritual growth",
                  "Ability to work well in a team setting",
                ]}
                imageSrc="/worship.jpg"
                members={worshipTeamMembers}
              />
            </TabsContent>

            <TabsContent value="outreach" className="space-y-8 pt-16 lg:pt-2">
              <TeamSection
                name="Outreach Team"
                description="The outreach team coordinates our community service projects and evangelistic efforts, helping us share God's love with our campus and community."
                responsibilities={[
                  "Plan and organize community service projects",
                  "Coordinate campus outreach initiatives",
                  "Build relationships with community organizations",
                  "Create opportunities for fellowship members to serve",
                ]}
                requirements={[
                  "Passion for serving others and sharing the gospel",
                  "Organizational and planning skills",
                  "Heart for the community and campus",
                  "Ability to mobilize and inspire others to serve",
                ]}
                imageSrc="/worship.jpg"
                members={outreachTeamMembers}
              />
            </TabsContent>

            <TabsContent
              value="bible-study"
              className="space-y-8 pt-16 lg:pt-2"
            >
              <TeamSection
                name="Bible Study Team"
                description="The Bible study team develops and leads our Bible studies, helping members grow in their understanding of Scripture and application to daily life."
                responsibilities={[
                  "Develop Bible study curriculum",
                  "Lead small group discussions",
                  "Train and mentor new Bible study leaders",
                  "Create resources for personal Bible study",
                ]}
                requirements={[
                  "Strong knowledge of Scripture and sound theology",
                  "Teaching and facilitation skills",
                  "Commitment to personal Bible study",
                  "Heart for helping others grow spiritually",
                ]}
                imageSrc="/worship.jpg"
                members={bibleStudyTeamMembers}
              />
            </TabsContent>

            <TabsContent value="prayer" className="space-y-8 pt-16 lg:pt-2">
              <TeamSection
                name="Prayer Team"
                description="The prayer team leads our prayer initiatives, interceding for our campus, community, and fellowship members."
                responsibilities={[
                  "Lead weekly prayer gatherings",
                  "Coordinate prayer chains and prayer requests",
                  "Pray for fellowship members and campus needs",
                  "Teach on prayer and its importance",
                ]}
                requirements={[
                  "Commitment to regular prayer",
                  "Heart for intercession",
                  "Ability to lead others in prayer",
                  "Sensitivity to the Holy Spirit",
                ]}
                imageSrc="/worship.jpg"
                members={prayerTeamMembers}
              />
            </TabsContent>

            <TabsContent value="welcome" className="space-y-8 pt-16 lg:pt-2">
              <TeamSection
                name="Welcome Team"
                description="The welcome team ensures that everyone who attends our events feels welcomed, connected, and included in our fellowship community."
                responsibilities={[
                  "Greet newcomers at events and gatherings",
                  "Follow up with first-time visitors",
                  "Help connect people to small groups and teams",
                  "Create a welcoming atmosphere at all events",
                ]}
                requirements={[
                  "Friendly and outgoing personality",
                  "Heart for helping people feel welcome",
                  "Good communication skills",
                  "Reliability and commitment to serving",
                ]}
                imageSrc="/worship.jpg"
                members={welcomeTeamMembers}
              />
            </TabsContent>

            <TabsContent value="media" className="space-y-8 pt-16 lg:pt-2">
              <TeamSection
                name="Media Team"
                description="The media team handles our online presence, photography, videography, and technical needs for events and gatherings."
                responsibilities={[
                  "Manage social media accounts and website",
                  "Capture photos and videos at events",
                  "Create promotional materials for events",
                  "Handle audio/visual needs during gatherings",
                ]}
                requirements={[
                  "Skills in photography, videography, graphic design, or tech",
                  "Creativity and attention to detail",
                  "Reliability and commitment",
                  "Understanding of effective communication",
                ]}
                imageSrc="/worship.jpg"
                members={mediaTeamMembers}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Join a Team */}
      <section className="py-16 px-4 md:px-10 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Join a Team</h2>
              <p className="text-muted-foreground mb-6">
                Serving on a team is a great way to use your gifts, develop new
                skills, build relationships, and make a meaningful contribution
                to our fellowship and campus.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Explore the Teams</h3>
                    <p className="text-muted-foreground">
                      Learn about each team's purpose, responsibilities, and
                      requirements to find where you might fit best.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Fill Out the Form</h3>
                    <p className="text-muted-foreground">
                      Complete our team interest form to let us know which
                      team(s) you're interested in joining.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      Meet with Team Leaders
                    </h3>
                    <p className="text-muted-foreground">
                      Connect with the team leader to discuss your interests,
                      gifts, and how you can contribute.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-bold text-primary">4</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Get Started!</h3>
                    <p className="text-muted-foreground">
                      Begin serving with your team and making a difference in
                      our fellowship and campus.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/join-us#team-form">Join a Team Today</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[500px] rounded-lg overflow-hidden">
              <Image
                src="/worship.jpg"
                alt="Team members serving together"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 md:px-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Team Member Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from current team members about their experiences serving in
              our fellowship
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <p className="italic text-muted-foreground mb-6">
                  "Serving on the worship team has been one of the most
                  rewarding experiences of my college years. I've grown so much
                  as a musician and as a worship leader, and I've made some of
                  my closest friends through this team."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src="/worship.jpg"
                      alt="Daniel H."
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Daniel H.</p>
                    <p className="text-sm text-muted-foreground">
                      Worship Team Leader
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <p className="italic text-muted-foreground mb-6">
                  "Being part of the outreach team has opened my eyes to the
                  needs in our community and given me practical ways to share
                  God's love. It's amazing to see how our small acts of service
                  can make a big difference."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src="/worship.jpg"
                      alt="Bethel T."
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Bethel T.</p>
                    <p className="text-sm text-muted-foreground">
                      Outreach Coordinator
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <p className="italic text-muted-foreground mb-6">
                  "The welcome team might seem simple, but it's so important. I
                  love being one of the first faces people see when they come to
                  our events, and helping newcomers find their place in our
                  fellowship family."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src="/worship.jpg"
                      alt="Meron A."
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Meron A.</p>
                    <p className="text-sm text-muted-foreground">
                      Welcome Team Member
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-gradient text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Join one of our teams today and use your gifts to serve our
            fellowship, campus, and community.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/join-us#team-form">Apply to Join a Team</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

// Team Section Component
function TeamSection({
  name,
  description,
  responsibilities,
  requirements,
  imageSrc,
  members,
}: {
  name: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  imageSrc: string;
  members: any[];
}) {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-2xl font-bold mb-4">{name}</h3>
          <p className="text-muted-foreground mb-6">{description}</p>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">Responsibilities:</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {responsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-2">Requirements:</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {requirements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <Button asChild>
              <Link href="/join-us#team-form">Join This Team</Link>
            </Button>
          </div>
        </div>

        <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
          <Image
            src={imageSrc || "/worship.jpg"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div>
        <h4 className="text-xl font-bold mb-4">Team Members</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {members.map((member, index) => (
            <div key={index} className="text-center">
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden mb-2">
                <Image
                  src={member.avatar || "/worship.jpg"}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-medium text-sm">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sample data
const worshipTeamMembers = [
  { name: "Daniel Haile", role: "Team Leader", avatar: "/worship.jpg" },
  { name: "Abigail Teshome", role: "Vocalist", avatar: "/worship.jpg" },
  { name: "Nathan Girma", role: "Guitarist", avatar: "/worship.jpg" },
  { name: "Lydia Bekele", role: "Pianist", avatar: "/worship.jpg" },
  { name: "Joshua Tadesse", role: "Drummer", avatar: "/worship.jpg" },
];

const outreachTeamMembers = [
  { name: "Bethel Tadesse", role: "Coordinator", avatar: "/worship.jpg" },
  { name: "Caleb Alemu", role: "Project Manager", avatar: "/worship.jpg" },
  { name: "Rahel Hailu", role: "Community Liaison", avatar: "/worship.jpg" },
  { name: "Isaac Mengistu", role: "Member", avatar: "/worship.jpg" },
];

const bibleStudyTeamMembers = [
  { name: "Samuel Bekele", role: "Coordinator", avatar: "/worship.jpg" },
  {
    name: "Deborah Yohannes",
    role: "Small Group Leader",
    avatar: "/worship.jpg",
  },
  { name: "Ezra Tesfaye", role: "Small Group Leader", avatar: "/worship.jpg" },
  { name: "Naomi Gebre", role: "Resource Developer", avatar: "/worship.jpg" },
];

const prayerTeamMembers = [
  { name: "Hanna Mekonnen", role: "Team Leader", avatar: "/worship.jpg" },
  { name: "Elias Demeke", role: "Intercessor", avatar: "/worship.jpg" },
  { name: "Martha Assefa", role: "Intercessor", avatar: "/worship.jpg" },
];

const welcomeTeamMembers = [
  { name: "Meron Abebe", role: "Team Leader", avatar: "/worship.jpg" },
  { name: "Dawit Solomon", role: "Greeter", avatar: "/worship.jpg" },
  { name: "Tigist Negash", role: "Greeter", avatar: "/worship.jpg" },
  {
    name: "Abel Getachew",
    role: "Follow-up Coordinator",
    avatar: "/worship.jpg",
  },
];

const mediaTeamMembers = [
  { name: "Yonas Kebede", role: "Team Leader", avatar: "/worship.jpg" },
  { name: "Feven Tekle", role: "Photographer", avatar: "/worship.jpg" },
  { name: "Bereket Alemayehu", role: "Videographer", avatar: "/worship.jpg" },
  { name: "Selam Haile", role: "Social Media", avatar: "/worship.jpg" },
  { name: "Robel Tilahun", role: "Tech Support", avatar: "/worship.jpg" },
];
