import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";
import { ScaleOnHover } from "@/components/animations/motion";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatarSrc: string;
}

export default function TestimonialCard({
  quote,
  name,
  role,
  avatarSrc,
}: TestimonialCardProps) {
  return (
    <ScaleOnHover>
      <Card className="h-full transition-shadow duration-300 hover:shadow-lg dark-mode-transition">
        <CardContent className="p-6 flex flex-col h-full">
          <Quote className="h-8 w-8 text-primary/40 mb-4" />
          <p className="text-muted-foreground mb-6 flex-grow">{quote}</p>
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={avatarSrc} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ScaleOnHover>
  );
}
