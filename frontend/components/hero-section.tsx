"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface HeroSectionProps {
  headline?: string;
  subheading?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay },
  }),
};

// Different grid arrangements to cycle through
const gridArrangements = [
  // Arrangement 1: Original 2x2 + 1 layout
  {
    layout: "grid-cols-2",
    items: [
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "top-left",
        imageIndex: 0,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "top-right",
        imageIndex: 1,
      },
      {
        colSpan: "col-span-2",
        rowSpan: "row-span-1",
        position: "bottom",
        imageIndex: 5,
      },
    ],
  },
  // Arrangement 2: 3x1 layout (all images in a row)
  {
    layout: "grid-cols-3",
    items: [
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "left",
        imageIndex: 10,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "center",
        imageIndex: 4,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "right",
        imageIndex: 11,
      },
    ],
  },
  // Arrangement 3: 1x3 layout (all images in a column)
  {
    layout: "grid-cols-1",
    items: [
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "top",
        imageIndex: 6,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "middle",
        imageIndex: 7,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "bottom",
        imageIndex: 13,
      },
    ],
  },
  // Arrangement 4: 2x2 grid (square layout)
  {
    layout: "grid-cols-2",
    items: [
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "top-left",
        imageIndex: 9,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "top-right",
        imageIndex: 10,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "bottom-left",
        imageIndex: 11,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "bottom-right",
        imageIndex: 12,
      },
    ],
  },
  // Arrangement 5: 4x1 layout (4 images in a row)
  {
    layout: "grid-cols-4",
    items: [
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "first",
        imageIndex: 13,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "second",
        imageIndex: 14,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "third",
        imageIndex: 15,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "fourth",
        imageIndex: 0,
      },
    ],
  },
  {
    layout: "grid-cols-2",
    items: [
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "top-left",
        imageIndex: 1,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "top-right",
        imageIndex: 2,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "middle-left",
        imageIndex: 3,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "middle-right",
        imageIndex: 4,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "bottom-left",
        imageIndex: 5,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "bottom-right",
        imageIndex: 6,
      },
    ],
  },
  // Arrangement 7: 3x2 layout (3 columns, 2 rows)
  {
    layout: "grid-cols-3",
    items: [
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "top-left",
        imageIndex: 7,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "top-center",
        imageIndex: 8,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "top-right",
        imageIndex: 9,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "bottom-left",
        imageIndex: 10,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "bottom-center",
        imageIndex: 11,
      },
      {
        colSpan: "col-span-1",
        rowSpan: "row-span-1",
        position: "bottom-right",
        imageIndex: 12,
      },
    ],
  },
];

export default function HeroSection({
  headline = "Growing Together in Faith and Fellowship",
  subheading = "Join AASTU FOCUS Fellowship in our journey of spiritual growth and community service",
  primaryButtonText = "Join Us",
  secondaryButtonText = "Learn More",
  onPrimaryClick = () => {},
  onSecondaryClick = () => {},
}: HeroSectionProps) {
  const [currentArrangement, setCurrentArrangement] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentArrangement((prev) => (prev + 1) % gridArrangements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentGrid = gridArrangements[currentArrangement];
  const images = [
    {
      src: "/hero-section/hero-1.jpg",
      alt: "Community members celebrating together with raised hands",
    },
    {
      src: "/hero-section/hero-2.jpg",
      alt: "Large group photo of fellowship members",
    },
    {
      src: "/hero-section/hero-3.jpg",
      alt: "People in a unity circle showing fellowship",
    },
    { src: "/hero-section/hero-4.jpg", alt: "Fellowship members in worship" },
    { src: "/hero-section/hero-5.jpg", alt: "Group prayer and meditation" },
    { src: "/hero-section/hero-6.jpg", alt: "Community service activities" },
    { src: "/hero-section/hero-7.jpg", alt: "Bible study and learning" },
    { src: "/hero-section/hero-8.jpg", alt: "Youth fellowship gathering" },
    { src: "/hero-section/hero-9.jpg", alt: "Leadership team meeting" },
    { src: "/hero-section/hero-10.jpg", alt: "Outdoor fellowship event" },
    { src: "/hero-section/hero-11.jpg", alt: "Fellowship celebration" },
    { src: "/hero-section/hero-12.jpg", alt: "Community building" },
    { src: "/hero-section/hero-13.jpg", alt: "Spiritual growth" },
    { src: "/hero-section/hero-14.jpg", alt: "Fellowship activities" },
    { src: "/hero-section/hero-15.jpg", alt: "Community engagement" },
    { src: "/hero-section/hero-16.jpg", alt: "Fellowship events" },
  ];

  return (
    <section className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/7 to-primary/10"></div>

        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/40"></div>

        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary/50 to-primary/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-r from-primary/40 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-primary/30 to-primary/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="px-5 mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Text Section */}
          <motion.div
            className="space-y-8 lg:pr-8"
            variants={fadeUpVariant}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground"
              variants={fadeUpVariant}
              custom={0.2}
            >
              {headline}
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl leading-relaxed max-w-2xl text-muted-foreground"
              variants={fadeUpVariant}
              custom={0.4}
            >
              {subheading}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={fadeUpVariant}
              custom={0.6}
            >
              <Button
                onClick={onPrimaryClick}
                className="px-8 py-3 text-lg font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg transform active:scale-95 group relative overflow-hidden bg-primary hover:bg-primary/90 text-white shadow-xl hover:shadow-primary/25"
              >
                <span className="relative z-10">{primaryButtonText}</span>
              </Button>

              <Button
                onClick={onSecondaryClick}
                variant="outline"
                className="px-8 py-3 text-lg font-medium rounded-lg transition-all duration-300 bg-transparent hover:scale-105 hover:shadow-md transform active:scale-95 text-primary border-primary"
              >
                {secondaryButtonText}
              </Button>
            </motion.div>
          </motion.div>

          {/* Animated Image Grid */}
          <motion.div
            className="relative"
            variants={fadeUpVariant}
            initial="hidden"
            animate="visible"
            custom={0.3}
          >
            <motion.div
              className={`grid gap-4 h-[600px] ${currentGrid.layout}`}
              key={currentArrangement}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              {currentGrid.items.map((item, index) => (
                <motion.div
                  key={`${item.position}-${currentArrangement}`}
                  className={`relative rounded-2xl overflow-hidden shadow-2xl group hover:shadow-primary/25 transition-all duration-500 hover:scale-[1.02] transform border border-border/50 ${item.colSpan} ${item.rowSpan}`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                    delay: index * 0.1,
                  }}
                >
                  <img
                    src={images[item.imageIndex % images.length].src}
                    alt={images[item.imageIndex % images.length].alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-primary/60 to-primary/40 rounded-full opacity-80 blur-xl animate-pulse shadow-lg"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-r from-primary/50 to-primary/30 rounded-full opacity-70 blur-xl animate-float shadow-lg"></div>
            <div className="absolute top-1/2 -right-6 w-16 h-16 bg-gradient-to-r from-primary/70 to-primary/50 rounded-full opacity-70 blur-lg animate-bounce shadow-lg"></div>
          </motion.div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .bg-radial-gradient {
          background: radial-gradient(
            circle at center,
            var(--tw-gradient-stops)
          );
        }
      `}</style>
    </section>
  );
}
