"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { CheckCircle2 } from "lucide-react"
import { Banner } from "@/components/banner"

const WORSHIP_IMG = "https://res.cloudinary.com/dllg3vnae/image/upload/AASTU_Misc/worship.jpg";

export default function JoinUsPage() {
  const [formStep, setFormStep] = useState(0)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    yearOfStudy: "",
    major: "",
    howHeard: "",
    interests: [] as string[],
    teams: [] as string[],
    message: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, [field]: [...(prev[field as keyof typeof prev] as string[]), value] }
      } else {
        return {
          ...prev,
          [field]: (prev[field as keyof typeof prev] as string[]).filter((item) => item !== value),
        }
      }
    })
  }

  const nextStep = () => {
    setFormStep((prev) => prev + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setFormStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log(formData)

    // Show success message
    toast({
      title: "Form submitted successfully!",
      description: "We'll be in touch with you soon.",
    })

    // Move to thank you step
    nextStep()
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Banner title="Join Us" subTitle="Become part of our fellowship community and grow in faith, friendship, and purpose."/>

      {/* Why Join */}
      {formStep === 0 && (
        <section className="py-16 px-4 md:px-10">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Why Join AASTU FOCUS?</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Spiritual Growth</h3>
                      <p className="text-muted-foreground">
                        Deepen your relationship with God through Bible studies, prayer, and worship.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Meaningful Community</h3>
                      <p className="text-muted-foreground">
                        Build lasting friendships with like-minded students who share your values and faith.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Leadership Development</h3>
                      <p className="text-muted-foreground">
                        Discover and develop your gifts and leadership skills through serving on ministry teams.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Service Opportunities</h3>
                      <p className="text-muted-foreground">
                        Make a positive impact on campus and in the community through outreach and service projects.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Button size="lg" onClick={nextStep}>
                    Join Now
                  </Button>
                </div>
              </div>
              <div className="relative h-[500px] rounded-lg overflow-hidden">
                <Image
                  src={WORSHIP_IMG}
                  alt="Fellowship gathering"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Membership Form */}
      {formStep === 1 && (
        <section className="py-16 px-4 md:px-10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Membership Form</h2>
                <p className="text-muted-foreground">
                  Please fill out the form below to join our fellowship. We look forward to welcoming you!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Personal Information</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearOfStudy">Year of Study *</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange("yearOfStudy", value)}
                        value={formData.yearOfStudy}
                        required
                      >
                        <SelectTrigger id="yearOfStudy">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                          <SelectItem value="5">5th Year</SelectItem>
                          <SelectItem value="graduate">Graduate Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">Major/Field of Study *</Label>
                      <Input id="major" name="major" value={formData.major} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="howHeard">How did you hear about us? *</Label>
                    <Select
                      onValueChange={(value) => handleSelectChange("howHeard", value)}
                      value={formData.howHeard}
                      required
                    >
                      <SelectTrigger id="howHeard">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friend">Friend/Classmate</SelectItem>
                        <SelectItem value="event">Campus Event</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="flyer">Flyer/Poster</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Interests & Involvement</h3>

                  <div className="space-y-2">
                    <Label>What are you interested in? (Select all that apply)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="bible-study"
                          checked={formData.interests.includes("bible-study")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("interests", "bible-study", checked as boolean)
                          }
                        />
                        <label
                          htmlFor="bible-study"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Bible Study
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="worship"
                          checked={formData.interests.includes("worship")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("interests", "worship", checked as boolean)
                          }
                        />
                        <label
                          htmlFor="worship"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Worship
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="prayer"
                          checked={formData.interests.includes("prayer")}
                          onCheckedChange={(checked) => handleCheckboxChange("interests", "prayer", checked as boolean)}
                        />
                        <label
                          htmlFor="prayer"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Prayer
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="outreach"
                          checked={formData.interests.includes("outreach")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("interests", "outreach", checked as boolean)
                          }
                        />
                        <label
                          htmlFor="outreach"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Community Service/Outreach
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="fellowship"
                          checked={formData.interests.includes("fellowship")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("interests", "fellowship", checked as boolean)
                          }
                        />
                        <label
                          htmlFor="fellowship"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Fellowship Events
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="leadership"
                          checked={formData.interests.includes("leadership")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("interests", "leadership", checked as boolean)
                          }
                        />
                        <label
                          htmlFor="leadership"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Leadership Development
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2" id="team-form">
                    <Label>Which teams are you interested in joining? (Select all that apply)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="worship-team"
                          checked={formData.teams.includes("worship-team")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("teams", "worship-team", checked as boolean)
                          }
                        />
                        <label
                          htmlFor="worship-team"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Worship Team
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="outreach-team"
                          checked={formData.teams.includes("outreach-team")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("teams", "outreach-team", checked as boolean)
                          }
                        />
                        <label
                          htmlFor="outreach-team"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Outreach Team
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="bible-study-team"
                          checked={formData.teams.includes("bible-study-team")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("teams", "bible-study-team", checked as boolean)
                          }
                        />
                        <label
                          htmlFor="bible-study-team"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Bible Study Team
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="prayer-team"
                          checked={formData.teams.includes("prayer-team")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("teams", "prayer-team", checked as boolean)
                          }
                        />
                        <label
                          htmlFor="prayer-team"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Prayer Team
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="welcome-team"
                          checked={formData.teams.includes("welcome-team")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("teams", "welcome-team", checked as boolean)
                          }
                        />
                        <label
                          htmlFor="welcome-team"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Welcome Team
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="media-team"
                          checked={formData.teams.includes("media-team")}
                          onCheckedChange={(checked) => handleCheckboxChange("teams", "media-team", checked as boolean)}
                        />
                        <label
                          htmlFor="media-team"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Media Team
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Anything else you'd like us to know?</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Thank You */}
      {formStep === 2 && (
        <section className="py-16 px-4 md:px-10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
              <p className="text-muted-foreground mb-8">
                Your membership form has been submitted successfully. We're excited to have you join our fellowship!
                Someone from our team will be in touch with you soon.
              </p>
              <div className="space-y-4">
                <Button asChild size="lg" className="w-full">
                  <Link href="/events">Explore Upcoming Events</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Steps to Join */}
      {formStep === 0 && (
        <section className="py-16 px-4 md:px-10 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How to Join</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Becoming a member of AASTU FOCUS Fellowship is easy! Here's how:
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block"></div>

                <div className="space-y-12">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-2xl font-bold text-primary">1</span>
                    </div>
                    <div className="bg-card rounded-lg p-6 shadow-sm flex-1 md:mt-6">
                      <h3 className="text-xl font-bold mb-2">Fill Out the Membership Form</h3>
                      <p className="text-muted-foreground mb-4">
                        Complete our online membership form with your basic information and areas of interest.
                      </p>
                      <Button onClick={nextStep}>Join Now</Button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-2xl font-bold text-primary">2</span>
                    </div>
                    <div className="bg-card rounded-lg p-6 shadow-sm flex-1 md:mt-6">
                      <h3 className="text-xl font-bold mb-2">Attend a Welcome Meeting</h3>
                      <p className="text-muted-foreground">
                        Join us for a new member welcome meeting where you'll learn more about our fellowship and meet
                        other members.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-2xl font-bold text-primary">3</span>
                    </div>
                    <div className="bg-card rounded-lg p-6 shadow-sm flex-1 md:mt-6">
                      <h3 className="text-xl font-bold mb-2">Get Connected</h3>
                      <p className="text-muted-foreground">
                        We'll help you get connected to a small group and/or ministry team based on your interests.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-2xl font-bold text-primary">4</span>
                    </div>
                    <div className="bg-card rounded-lg p-6 shadow-sm flex-1 md:mt-6">
                      <h3 className="text-xl font-bold mb-2">Grow and Serve</h3>
                      <p className="text-muted-foreground">
                        Participate regularly in fellowship activities and find opportunities to serve and grow in your
                        faith.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {formStep === 0 && (
        <section className="py-16 px-4 md:px-10 ">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Have questions about joining AASTU FOCUS? Find answers to common questions below.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Do I need to be a Christian to join?</AccordionTrigger>
                  <AccordionContent>
                    No, you don't need to be a Christian to join AASTU FOCUS. We welcome students of all backgrounds who
                    are interested in learning more about Christianity and being part of our community. Our fellowship
                    is a place where you can explore faith, ask questions, and grow spiritually in a supportive
                    environment.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How much time commitment is expected?</AccordionTrigger>
                  <AccordionContent>
                    The time commitment is flexible and depends on your level of involvement. Our main weekly gathering
                    is about 2 hours, and small groups typically meet for 1-1.5 hours weekly. If you join a ministry
                    team, that may require an additional 1-3 hours per week. However, we understand that students have
                    busy schedules, and we encourage you to participate at a level that works for you.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Are there membership fees?</AccordionTrigger>
                  <AccordionContent>
                    No, there are no membership fees to join AASTU FOCUS Fellowship. All of our regular activities and
                    events are free to attend. For special events like retreats or conferences, there may be costs
                    involved, but we work to keep these affordable and offer scholarships when needed.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I join in the middle of the semester?</AccordionTrigger>
                  <AccordionContent>
                    You're welcome to join AASTU FOCUS at any time during the academic year. While we have some programs
                    that follow a curriculum (like Bible studies), our community is always open to new members, and
                    we'll help you get connected whenever you join.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>What denomination is AASTU FOCUS affiliated with?</AccordionTrigger>
                  <AccordionContent>
                    AASTU FOCUS is an interdenominational Christian fellowship. We welcome students from all Christian
                    denominations and traditions. We focus on the core aspects of Christian faith that unite us, while
                    respecting the diversity of traditions represented in our community.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>How can I get more involved beyond just attending?</AccordionTrigger>
                  <AccordionContent>
                    There are many ways to get more involved! You can join a ministry team based on your interests and
                    gifts, become a small group leader, help plan events, or take on leadership roles within the
                    fellowship. We believe in equipping students to serve and lead, and we provide mentoring and
                    training opportunities for those who want to grow in these areas.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Don't see your question answered here? Feel free to reach out to us.
                </p>
                <Button asChild variant="outline">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
