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
import GalleryLightbox from "@/components/gallery-lightbox";

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
                  Eleos Choir
                </TabsTrigger>
                <TabsTrigger
                  value="outreach"
                  className="flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Action and Prayer
                </TabsTrigger>
                <TabsTrigger
                  value="bible-study-coordinator"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Bible Study Cordinator
                </TabsTrigger>
                <TabsTrigger value="Advisory" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Tumbi Team
                </TabsTrigger>
                <TabsTrigger
                  value="Helpers"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Ebenims Team
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4" />
                  Salem Media
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="worship" className="space-y-8 pt-16 lg:pt-2">
              <TeamSection
                name="Eleos Choir"
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
                imageSrc="/teams/eleos_team_leaders.jpg"
                members={EleosTeamLeaders}
              />
            </TabsContent>

            <TabsContent value="outreach" className="space-y-8 pt-16 lg:pt-2">
              <TeamSection
                name="Action and Prayer"
                description="The Action and Prayer team coordinates our community service projects and evangelistic efforts, helping us share God's love with our campus and community."
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
                imageSrc="/teams/actionandprayer_team_leaders.jpg"
                members={ActionandPrayerTeamLeaders}
              />
            </TabsContent>

            <TabsContent
              value="bible-study-coordinator"
              className="space-y-8 pt-16 lg:pt-2"
            >
              <TeamSection
                name="Bible Study Coordinator"
                description="The Bible study coordinator team develops and leads our Bible studies, helping members grow in their understanding of Scripture and application to daily life."
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
                imageSrc="/teams/bsc_team_leaders.jpg"
                members={BibleStudyCoordinator}
              />
            </TabsContent>

            <TabsContent value="Advisory" className="space-y-8 pt-16 lg:pt-2">
              <TeamSection
                name="Tumbi Team"
                description="The Tumbi team is a pillar of our fellowship, it helps student with their academical life, spiritual life and also give them advice on living a Godly life."
                responsibilities={[
                  "Meet with students and listen to their concerns",
                  "Give them advice on how to live a Godly life",
                  "Pray for students and their needs",
                  "Support students Academically and Spiritaully",
                ]}
                requirements={[
                  "Must be a mature undergraduate student",
                  "Must be a member of the fellowship",
                  "Must have a teachable spirit",
                  "Must be willing to learn and grow spiritually",
                ]}
                imageSrc="/teams/tumbi_team_leaders.jpg"
                members={TumbiTeamLeaders}
              />
            </TabsContent>

            <TabsContent value="Helpers" className="space-y-8 pt-16 lg:pt-2">
              <TeamSection
                name="Ebenims Team"
                description="The Ebenims team ensures that everyone who attends our events feels welcomed, connected, and included in our fellowship community."
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
                imageSrc="/teams/ebenims_team_leaders.jpg"
                members={EbenimsTeamLeader}
              />
            </TabsContent>

            <TabsContent value="media" className="space-y-8 pt-16 lg:pt-2">
              <TeamSection
                name="Salem Media"
                description="The Salem Media team handles our online presence, photography, videography, and technical needs for events and gatherings."
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
                imageSrc="/teams/salem_meadia_leaders.png"
                members={SalemMediaLeaders}
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
                src="/teams/join_our_teams.jpg"
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

        <GalleryLightbox images={[imageSrc]} initialIndex={0}>
          <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden cursor-pointer group">
            <Image
              src={imageSrc || "/worship.jpg"}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </GalleryLightbox>
      </div>

      <div>
        <h4 className="text-xl font-bold mb-4">Team Members</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {members.map((member, index) => (
            <div key={index} className="text-center">
              <GalleryLightbox images={members.map(m => m.avatar || "/worship.jpg")} initialIndex={index}>
                <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden mb-2 cursor-pointer group ring-2 ring-transparent hover:ring-primary transition-all">
                  <Image
                    src={member.avatar || "/worship.jpg"}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </GalleryLightbox>
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
const EleosTeamLeaders = [
  { name: "Mootii", role: "Current Leader", avatar: "/worship.jpg" },
  { name: "Ayantu", role: "Ex Leader", avatar: "/worship.jpg" },
  { name: "Abdi", role: "Ex Leader", avatar: "/worship.jpg" },
  { name: "Kena", role: "Current Leader", avatar: "/worship.jpg" },
  { name: "Sanyi", role: "Current Leader", avatar: "/worship.jpg" },
];

const ActionandPrayerTeamLeaders = [
  { name: "Solomon", role: "Current Leader", avatar: "/worship.jpg" },
  { name: "Idae", role: "Ex Leader", avatar: "/worship.jpg" },
  { name: "Olman", role: "Ex Leader", avatar: "/worship.jpg" },
  { name: "Ebise", role: "Current Leader", avatar: "/worship.jpg" },
  { name: "Tilahun", role: "Current Leader", avatar: "/worship.jpg" },
  { name: "Sarah", role: "Current Leader", avatar: "/worship.jpg" },
];

const BibleStudyCoordinator = [
  { name: "Eyosias", role: "Ex Leader", avatar: "/worship.jpg" },
  { name: "Bayisa", role: "Ex Leader", avatar: "/worship.jpg" },
  { name: "Hundee", role: "Current Leader", avatar: "/worship.jpg" },
  { name: "Elias", role: "Current Leader", avatar: "/worship.jpg" },
  { name: "Ifaa", role: "Current Leader", avatar: "/worship.jpg" },
];

const TumbiTeamLeaders = [
  { name: "Naol", role: "Leader", avatar: "/worship.jpg" },
  { name: "Eyosias", role: "Leader", avatar: "/worship.jpg" },
  { name: "Ayantu", role: "Leader", avatar: "/worship.jpg" },
  { name: "Elsabet", role: "Leader", avatar: "/worship.jpg" },
  { name: "Ebise", role: "Leader", avatar: "/worship.jpg" },
];

const EbenimsTeamLeader = [
  { name: "Gabisaa", role: "Ex Leader", avatar: "/worship.jpg" },
  { name: "Sisiyo", role: "Ex Leader", avatar: "/worship.jpg" },
  { name: "Sanyi", role: "Ex Leader", avatar: "/worship.jpg" },
  { name: "Tamasgen", role: "Current Leader", avatar: "/worship.jpg" },
  { name: "Beka", role: "Current Leader", avatar: "/worship.jpg" },
  {
    name: "Eba",
    role: "Current Leader",
    avatar: "/worship.jpg",
  },
];

const SalemMediaLeaders = [
  { name: "Kaleb", role: "Current Leader", avatar: "/worship.jpg" },
  { name: "Roba", role: "Current Leader", avatar: "/worship.jpg" },
  { name: "Elias", role: "Current Leader", avatar: "/worship.jpg" },
  { name: "Bornabek", role: "Current Leader", avatar: "/worship.jpg" },
];
