import { FrontendLayout } from "@/components/layout/FrontendLayout";
import { Card, CardContent } from "@/components/ui/card";
import { HeroSection } from "@/components/HeroSection";
import { useStore } from "@/lib/store";
import { Heart, Sparkles, Award, Users } from "lucide-react";

export default function About() {
  const { settings } = useStore();

  return (
    <FrontendLayout>
      {/* Hero Section */}
      <HeroSection
        title={`About ${settings.storeName}`}
        description="We're passionate about bringing joy and wonder to children's lives through carefully curated, high-quality products that inspire imagination and creativity."
        ctaText="Shop Now"
        ctaLink="/shop/products"
        height="medium"
        backgroundImage="/about_us.jpeg"
      />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* Mission */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold mb-3">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    At {settings.storeName}, we believe that every child deserves to experience 
                    the magic of childhood. Our mission is to provide parents and caregivers with 
                    access to premium, safe, and engaging products that not only entertain but 
                    also educate and inspire young minds. We carefully select each item in our 
                    collection to ensure it meets the highest standards of quality, safety, and 
                    play value.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Quality First</h3>
                <p className="text-sm text-muted-foreground">
                  We handpick every product to ensure exceptional quality and safety standards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Trusted Brand</h3>
                <p className="text-sm text-muted-foreground">
                  Trusted by thousands of families for premium kids' products and excellent service.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Customer Focus</h3>
                <p className="text-sm text-muted-foreground">
                  Your satisfaction and your child's happiness are our top priorities.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Story */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-bold mb-4">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded with a simple yet powerful vision, {settings.storeName} began when our 
                  founders, as parents themselves, struggled to find high-quality, safe, and 
                  engaging products for their own children. Frustrated by the lack of curated 
                  selections and the time-consuming process of researching product safety, they 
                  set out to create a better solution.
                </p>
                <p>
                  Today, {settings.storeName} is proud to serve families across the country, 
                  offering a carefully curated collection of toys, clothing, and accessories 
                  that meet our strict quality standards. We continue to grow and evolve, always 
                  staying true to our core values of quality, safety, and customer satisfaction.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FrontendLayout>
  );
}

