import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram } from "lucide-react";
import { FaTiktok } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-[#e3dad1] dark:bg-background py-12 w-full">
      <div className=" px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="font-bold text-xl flex items-center">
              <span className="text-primary mr-1">AASTU</span>
              <span>FOCUS</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A Christ-centered community dedicated to fostering spiritual
              growth, building meaningful relationships, and serving our campus.
            </p>
            <div className="flex space-x-4">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.instagram.com/aastufocus?igsh=MWw0MTlyMW13OWNobg=="
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.tiktok.com/@aastu_focus?_r=1&_t=ZS-96NJnRWw6tQ"
                className="text-muted-foreground hover:text-primary"
              >
                <FaTiktok className="h-5 w-5" />
                <span className="sr-only">TikTok</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/teams"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Teams
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">Get Involved</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/join-us"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Join Us
                </Link>
              </li>
              <li>
                <Link
                  href="/donate"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Donate
                </Link>
              </li>
              <li>
                <Link
                  href="/teams"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Volunteer
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Upcoming Events
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to our newsletter for updates on events and activities.
            </p>
            <form className="space-y-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-background"
              />
              <Button type="submit" className="w-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AASTU FOCUS Fellowship. All rights
            reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="/privacy-policy"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
