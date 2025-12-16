import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface HeroSlide {
  id?: number;
  image?: string;
  title: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaAction?: () => void;
}

interface HeroSectionProps {
  slides?: HeroSlide[];
  title?: string;
  description?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaAction?: () => void;
  height?: "small" | "medium" | "large";
}

export function HeroSection({
  slides,
  title,
  description,
  backgroundImage,
  ctaText,
  ctaLink,
  ctaAction,
  height = "medium",
}: HeroSectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [, setLocation] = useLocation();

  // Auto-scroll for carousel
  useEffect(() => {
    if (!api || !slides || slides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api, slides]);

  // Track current slide
  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const heightClasses = {
    small: "h-[300px] md:h-[400px]",
    medium: "h-[400px] md:h-[500px] lg:h-[600px]",
    large: "h-[500px] md:h-[600px] lg:h-[700px]",
  };

  // If slides are provided, render carousel
  if (slides && slides.length > 0) {
    return (
      <section className="relative w-full overflow-hidden">
        <Carousel
          className="w-full"
          setApi={setApi}
          opts={{
            loop: slides.length > 1,
            align: "start",
            duration: 20,
          }}
        >
          <CarouselContent className="-ml-0">
            {slides.map((slide, index) => (
              <CarouselItem key={slide.id || index} className="pl-0">
                <div
                  className={`relative w-full ${heightClasses[height]} overflow-hidden bg-muted/30`}
                >
                  {slide.image && (
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center">
                    <div className="container mx-auto px-4 md:px-8">
                      <div className="max-w-2xl text-white space-y-4">
                        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
                          {slide.title}
                        </h2>
                        {slide.description && (
                          <p className="text-lg md:text-xl text-white/90">
                            {slide.description}
                          </p>
                        )}
                        {(slide.ctaText || ctaText) && (
                          <Button
                            size="lg"
                            className="rounded-full text-lg px-8 mt-4"
                            onClick={() => {
                              if (slide.ctaAction) {
                                slide.ctaAction();
                              } else if (slide.ctaLink) {
                                setLocation(slide.ctaLink);
                              } else if (ctaAction) {
                                ctaAction();
                              } else if (ctaLink) {
                                setLocation(ctaLink);
                              }
                            }}
                          >
                            {slide.ctaText || ctaText}
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {slides.length > 1 && (
            <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>
        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${
                  current === index
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/75"
                }`}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  // Single hero section (no carousel)
  return (
    <section
      className={`relative w-full ${heightClasses[height]} overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-background`}
    >
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt={title || "Hero"}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl text-center md:text-left space-y-6">
            {title && (
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
            {(ctaText || ctaLink) && (
              <Button
                size="lg"
                className="rounded-full text-lg px-8 mt-4"
                onClick={() => {
                  if (ctaAction) {
                    ctaAction();
                  } else if (ctaLink) {
                    setLocation(ctaLink);
                  }
                }}
              >
                {ctaText}
                {ctaLink && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

