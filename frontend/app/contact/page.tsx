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
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  CheckCircle2,
} from "lucide-react";
import { Banner } from "@/components/banner";
import Image from "next/image";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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

    // Here you would typically send the data to your backend
    console.log(formData);

    // Show success message
    toast({
      title: "Message sent successfully!",
      description: "We'll get back to you as soon as possible.",
    });

    // Reset form and show thank you message
    setIsSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-section/hero-6.jpg"
            alt="Contact Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#3f125a]/70 mix-blend-multiply"></div>
        </div>

        <div className="relative z-20 text-center text-white px-4 max-w-3xl mx-auto mt-10 md:mt-16">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-[0.2em] mb-6 uppercase leading-tight scale-y-110">
              CONTACT US
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-white/90 font-light tracking-wide leading-relaxed">
              Have questions or want to get in touch? We'd love to hear from
              you!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16 px-4 md:px-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {!isSubmitted ? (
              <div>
                <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

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
                    <Label htmlFor="subject">Subject *</Label>
                    <Select onValueChange={handleSelectChange} required>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="events">
                          Events Information
                        </SelectItem>
                        <SelectItem value="membership">
                          Membership Questions
                        </SelectItem>
                        <SelectItem value="volunteer">
                          Volunteer Opportunities
                        </SelectItem>
                        <SelectItem value="prayer">Prayer Request</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg">
                    Send Message
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-center">
                  Thank You!
                </h2>
                <p className="text-muted-foreground mb-8 text-center max-w-md">
                  Your message has been sent successfully. We'll get back to you
                  as soon as possible.
                </p>
                <Button onClick={() => setIsSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            )}

            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
                <p className="text-muted-foreground mb-8">
                  Here's how you can reach us directly or find us on campus.
                </p>

                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6 flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Email</h3>
                        <p className="text-muted-foreground">
                          <a
                            href="mailto:contact@aastufocus.org"
                            className="hover:text-primary"
                          >
                            contact@aastufocus.org
                          </a>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Phone</h3>
                        <p className="text-muted-foreground">
                          <a
                            href="tel:+251911234567"
                            className="hover:text-primary"
                          >
                            +251 911 234 567
                          </a>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Location</h3>
                        <p className="text-muted-foreground">
                          Student Center, Room 105
                          <br />
                          Addis Ababa Science and Technology University
                          <br />
                          Addis Ababa, Ethiopia
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Office Hours</h3>
                        <p className="text-muted-foreground">
                          Monday - Friday: 10:00 AM - 4:00 PM
                          <br />
                          Saturday: Closed
                          <br />
                          Sunday: 2:00 PM - 5:00 PM
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <Link
                    href="#"
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                    <span className="sr-only">Facebook</span>
                  </Link>
                  <Link
                    href="#"
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                    <span className="sr-only">Instagram</span>
                  </Link>
                  <Link
                    href="#"
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Twitter</span>
                  </Link>
                  <Link
                    href="#"
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <Youtube className="h-5 w-5" />
                    <span className="sr-only">YouTube</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-16 px-4 md:px-10 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Find Us on Campus</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're located in the Student Center, Room 105
            </p>
          </div>

          <div className="relative h-[400px] rounded-lg overflow-hidden">
            {/* This would be replaced with an actual Google Map integration */}
            <div className="absolute inset-0 bg-muted-foreground/10 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="font-medium">Map would be displayed here</p>
                <p className="text-sm text-muted-foreground">
                  Addis Ababa Science and Technology University
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Can't find the answer you're looking for? Feel free to contact us
            directly.
          </p>
          <Button asChild>
            <Link href="/join-us#faq">View All FAQs</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
