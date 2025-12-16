import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MOCK_REVIEWS = [
  {
    id: 1,
    user: "Sarah Johnson",
    avatar: "",
    product: "Rainbow Stacking Rings",
    rating: 5,
    date: "2 days ago",
    comment: "My daughter absolutely loves this! The colors are vibrant and the wood quality is excellent. Highly recommended for toddlers.",
    likes: 12,
    verified: true
  },
  {
    id: 2,
    user: "Mike Chen",
    avatar: "",
    product: "Dino Backpack",
    rating: 4,
    date: "1 week ago",
    comment: "Great backpack, sturdy material. The only issue is that the zipper is a bit stiff at first, but it gets better with use.",
    likes: 5,
    verified: true
  },
  {
    id: 3,
    user: "Emily Davis",
    avatar: "",
    product: "Space Explorer Pajamas",
    rating: 5,
    date: "2 weeks ago",
    comment: "Softest pajamas ever! The print glows in the dark which my son finds fascinating. Will buy more.",
    likes: 24,
    verified: true
  },
  {
    id: 4,
    user: "Alex Turner",
    avatar: "",
    product: "Wooden Building Blocks",
    rating: 3,
    date: "3 weeks ago",
    comment: "Good quality blocks but smaller than I expected. Check dimensions before buying.",
    likes: 2,
    verified: false
  }
];

export default function Reviews() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Reviews & Ratings</h1>
            <p className="text-muted-foreground mt-1">Customer feedback and product ratings</p>
          </div>
          
          <div className="flex gap-4">
            <Card className="px-4 py-2 bg-primary/5 border-none shadow-sm">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">4.8</span>
                <span className="text-xs text-muted-foreground font-medium">Avg Rating</span>
              </div>
            </Card>
            <Card className="px-4 py-2 bg-primary/5 border-none shadow-sm">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">1.2k</span>
                <span className="text-xs text-muted-foreground font-medium">Total Reviews</span>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid gap-6">
          {MOCK_REVIEWS.map((review) => (
            <Card key={review.id} className="border-none shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={review.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {review.user.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{review.user}</h3>
                          {review.verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] h-5">Verified Purchase</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">on <span className="font-medium text-foreground">{review.product}</span></p>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{review.date}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
                        />
                      ))}
                    </div>

                    <p className="text-foreground/80 leading-relaxed">{review.comment}</p>

                    <div className="flex items-center gap-4 pt-2">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-primary">
                        <ThumbsUp className="w-4 h-4 mr-1.5" />
                        Helpful ({review.likes})
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-primary">
                        <MessageSquare className="w-4 h-4 mr-1.5" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}