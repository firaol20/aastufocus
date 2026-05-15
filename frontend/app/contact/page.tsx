"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Instagram,
  CheckCircle2,
  Sparkles,
  Send,
} from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { FadeIn } from "@/components/animations/motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log(formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[55vh] md:min-h-[65vh] flex items-center justify-center overflow-hidden bg-background border-b border-border pt-20">
        {/* Background Glow */}
        <div className="absolute top-[-120px] left-[-100px] w-[350px] h-[350px] bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-140px] right-[-120px] w-[350px] h-[350px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(120,120,120,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(120,120,120,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <FadeIn className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-xl px-5 py-2 text-sm text-primary mx-auto shadow-sm">
              Get In Touch
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
                <span className="block text-primary-gradient">
                  Contact Us
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
                Have questions, need prayer, or want to learn more about
                AASTU FOCUS Fellowship? We're here for you.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                size="lg"
                className="h-12 px-8 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
              >
                Contact Now
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-full border-primary/20 bg-background/60 backdrop-blur-md hover:bg-primary/5 transition-all duration-300"
              >
                Learn More
              </Button>
            </div>
          </FadeIn>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* Contact Content */}
      <section className="py-20 px-4 md:px-10 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form Column */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <FadeIn delay={0.1}>
                <Card className="border-border/50 shadow-2xl bg-card backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8 md:p-10">
                    {!isSubmitted ? (
                      <div>
                        <h2 className="text-3xl font-bold mb-2">Send a Message</h2>
                        <p className="text-muted-foreground mb-8">
                          Fill out the form below and our team will get back to you shortly.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
                              <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="h-12 bg-background border-border focus-visible:ring-primary/50"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="h-12 bg-background border-border focus-visible:ring-primary/50"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                            <Select onValueChange={handleSelectChange} required>
                              <SelectTrigger id="subject" className="h-12 bg-background border-border focus:ring-primary/50">
                                <SelectValue placeholder="How can we help you?" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General Inquiry</SelectItem>
                                <SelectItem value="events">Events Information</SelectItem>
                                <SelectItem value="membership">Membership Questions</SelectItem>
                                <SelectItem value="volunteer">Volunteer Opportunities</SelectItem>
                                <SelectItem value="prayer">Prayer Request</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                            <Textarea
                              id="message"
                              name="message"
                              placeholder="Write your message here..."
                              rows={6}
                              value={formData.message}
                              onChange={handleInputChange}
                              required
                              className="resize-none bg-background border-border focus-visible:ring-primary/50"
                            />
                          </div>

                          <Button
                            type="submit"
                            size="lg"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto rounded-full px-8 h-12 bg-primary-gradient text-white hover:opacity-90 shadow-lg shadow-primary/20 transition-all duration-300"
                          >
                            {isSubmitting ? (
                              "Sending..."
                            ) : (
                              <>
                                Send Message <Send className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </form>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-8 relative">
                          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-50" />
                          <CheckCircle2 className="h-12 w-12 text-green-500 relative z-10" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">
                          Message Sent!
                        </h2>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                          Thank you for reaching out. We've received your message and will get back to you as soon as possible.
                        </p>
                        <Button
                          onClick={() => {
                            setIsSubmitted(false);
                            setFormData({ name: "", email: "", subject: "", message: "" });
                          }}
                          variant="outline"
                          className="rounded-full px-8 border-primary text-primary hover:bg-primary/5"
                        >
                          Send Another Message
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
            </div>

            {/* Info Column */}
            <div className="lg:col-span-2 order-1 lg:order-2 space-y-8">
              <FadeIn delay={0.2}>
                <div>
                  <p className="text-sm text-primary uppercase tracking-widest font-semibold mb-3">
                    Contact Info
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Reach Out Directly</h2>
                  <p className="text-muted-foreground mb-8">
                    We're available through multiple channels. Feel free to contact us or visit us on campus.
                  </p>

                  <div className="space-y-4">
                    <Card className="border border-border/50 bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
                      <CardContent className="p-5 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          <Mail className="h-6 w-6 text-primary group-hover:text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Email Us</p>
                          <a
                            href="mailto:aastufocus2010@gmail.com"
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            aastufocus2010@gmail.com
                          </a>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border/50 bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
                      <CardContent className="p-5 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          <Phone className="h-6 w-6 text-primary group-hover:text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Call Us</p>
                          <a
                            href="tel:0929414973"
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            0929414973
                          </a>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border/50 bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
                      <CardContent className="p-5 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          <MapPin className="h-6 w-6 text-primary group-hover:text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Visit Us</p>
                          <p className="font-semibold text-foreground">
                            Student Center, Room 105<br />
                            AASTU Campus
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border/50 bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
                      <CardContent className="p-5 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          <Clock className="h-6 w-6 text-primary group-hover:text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Office Hours</p>
                          <p className="font-semibold text-foreground">
                            Mon - Fri: 10 AM - 4 PM<br />
                            Sun: 2 PM - 5 PM
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="font-bold text-lg mb-4">Follow Our Journey</h3>
                  <div className="flex space-x-3">
                    {[
                      { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/aastufocus?igsh=MWw0MTlyMW13OWNobg==" },
                      { icon: FaTiktok, label: "TikTok", href: "https://www.tiktok.com/@aastu_focus?_r=1&_t=ZS-96NJnRWw6tQ" }
                    ].map((social, i) => (
                      <Link
                        key={i}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                      >
                        <social.icon className="h-5 w-5" />
                        <span className="sr-only">{social.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Banner */}
      <section className="py-24 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-20 pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <FadeIn>
            <div className="max-w-3xl mx-auto bg-card border border-border/50 rounded-3xl p-10 md:p-14 shadow-2xl backdrop-blur-sm">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Still have questions?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                Check out our Frequently Asked Questions section to find quick answers about our fellowship, events, and how to get involved.
              </p>
              <Button asChild size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <Link href="/join-us#faq">Browse FAQs</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
