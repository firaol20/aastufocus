import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { ScaleOnHover } from "@/components/animations/motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  description: string;
  imageSrc: string;
}

export default function EventCard({
  title,
  date,
  location,
  description,
  imageSrc,
}: EventCardProps) {
  return (
    <ScaleOnHover scale={1.03}>
      <Card className="border-gray-300 dark:border-gray-500 bg-background overflow-hidden h-full transition-shadow duration-300 hover:shadow-lg dark-mode-transition">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <div className="flex items-center text-muted-foreground mb-1">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">{date}</span>
          </div>
          <div className="flex items-center text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{location}</span>
          </div>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full hover:border-primary/60"
              >
                Learn More
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">{title}</DialogTitle>
              </DialogHeader>
              <div className="relative h-[300px] w-full overflow-hidden rounded-lg mb-4">
                <Image
                  src={imageSrc || "/placeholder.svg"}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{location}</span>
                </div>
                <div className="pt-2">
                  <h4 className="font-semibold mb-2">About this event</h4>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </ScaleOnHover>
  );
}
