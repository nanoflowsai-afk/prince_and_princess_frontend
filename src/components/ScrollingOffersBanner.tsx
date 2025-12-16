import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface OfferBanner {
  id: number;
  text: string;
  link?: string;
}

interface ScrollingOffersBannerProps {
  offers: OfferBanner[];
}

export function ScrollingOffersBanner({ offers }: ScrollingOffersBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || offers.length === 0) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground py-2 overflow-hidden">
      <div className="flex animate-scroll-banner whitespace-nowrap">
        {/* Duplicate content for seamless loop */}
        {[...offers, ...offers].map((offer, index) => (
          <div
            key={`${offer.id}-${index}`}
            className="flex items-center gap-4 px-8 flex-shrink-0"
          >
            <span className="text-sm font-medium">{offer.text}</span>
            {offer.link && (
              <a
                href={offer.link}
                className="text-sm font-semibold underline hover:no-underline"
              >
                Shop Now
              </a>
            )}
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20 rounded-full z-10"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
