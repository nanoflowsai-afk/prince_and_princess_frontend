import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Crown, Gift, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { formatRupees } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  buttons?: string[];
  products?: any[];
}

type GiftBoxStep = 
  | "welcome"
  | "category"
  | "product_selection"
  | "add_more"
  | "recipient_name"
  | "wrapping_theme"
  | "gift_message"
  | "review"
  | "checkout";

interface GiftBoxData {
  items: Array<{ productId: number; product: any; quantity: number }>;
  recipientName: string;
  wrappingTheme: string;
  wrappingPrice: number;
  giftMessage: string;
}

const WRAPPING_THEMES = [
  { name: "Royal Purple & Gold", price: 200, emoji: "👑" },
  { name: "Pink Princess Sparkle", price: 150, emoji: "✨" },
  { name: "Magical Unicorn Mint", price: 150, emoji: "🦄" },
  { name: "Classic White Elegance", price: 0, emoji: "🤍" },
];

const STYLE_RESPONSES: Record<string, string> = {
  "Traditional Wear 👘": "Great choice! Traditional wear brings out the elegance in every little prince and princess. I can help you find beautiful traditional outfits like lehengas, sherwanis, and kurta sets. Would you like to see our traditional collection?",
  "Party Wear 🎉": "Party time! Let's find something special for the celebration. Our party wear collection includes stunning dresses, suits, and coordinated sets perfect for birthdays, weddings, and special occasions. Ready to explore?",
  "Western Wear 🌟": "Stylish and modern! Our western wear collection features trendy dresses, jeans, tops, and casual outfits that are both comfortable and fashionable. Perfect for everyday wear!",
  "Night Wear 🌙": "Comfort is key for a good night's sleep! Our night wear collection includes soft, cozy pajamas, nightdresses, and sleepwear sets. Let me show you our most comfortable options.",
  "Ethnic Wear 🪔": "Ethnic wear is perfect for festivals and cultural celebrations! We have beautiful ethnic outfits including kurtas, dhotis, and traditional sets. Which occasion are you shopping for?",
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"assistant" | "giftbox">("assistant");
  const [giftBoxStep, setGiftBoxStep] = useState<GiftBoxStep>("welcome");
  const [giftBoxData, setGiftBoxData] = useState<GiftBoxData>({
    items: [],
    recipientName: "",
    wrappingTheme: "",
    wrappingPrice: 0,
    giftMessage: "",
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { products, categories, addToCart, isCustomerAuthenticated } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Initialize messages based on mode
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (mode === "giftbox") {
        setMessages([{
          id: "1",
          text: "🎁✨ Welcome to the Prince & Princess Build-A-Gift Box!\n\nI'll help you create a magical, personalized gift for your little prince or princess.\n\nShall we begin?",
          isBot: true,
          timestamp: new Date(),
          buttons: ["Yes, let's start!", "Not now"],
        }]);
        setGiftBoxStep("welcome");
      } else {
        setMessages([{
          id: "1",
          text: "👑 Hello! I'm your Prince & Princess royal shopping assistant! I'm here to help you find the perfect outfit for your little prince or princess. What type of style are you looking for today?",
          isBot: true,
          timestamp: new Date(),
          buttons: [
            "Traditional Wear 👘",
            "Party Wear 🎉",
            "Western Wear 🌟",
            "Night Wear 🌙",
            "Ethnic Wear 🪔",
            "🎁 Create Gift Box",
            "✨ Virtual Runway",
          ],
        }]);
      }
    }
  }, [isOpen, mode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isBot: boolean, buttons?: string[], products?: any[]) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date(),
      buttons,
      products,
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleGiftBoxButton = (buttonText: string) => {
    if (giftBoxStep === "welcome") {
      if (buttonText === "Yes, let's start!") {
        addMessage(buttonText, false);
        setTimeout(() => {
          addMessage(
            "Wonderful! Let's start by choosing items for your gift box.\n\nWhich type of items would you like to explore first?",
            true,
            ["Dresses", "Toys", "Accessories", "Makeup Sets", "Surprise Me!"]
          );
          setGiftBoxStep("category");
        }, 500);
      } else if (buttonText === "Not now") {
        addMessage(buttonText, false);
        setTimeout(() => {
          addMessage("No problem! Feel free to come back anytime when you're ready to create a magical gift box! ✨", true);
        }, 500);
      }
    } else if (giftBoxStep === "category") {
      addMessage(buttonText, false);
      const category = buttonText.toLowerCase();
      let filteredProducts = products;

      if (category !== "surprise me!") {
        // Filter products by category (simplified - you can enhance this)
        filteredProducts = products.filter(p => 
          p.name.toLowerCase().includes(category) ||
          p.category?.toLowerCase().includes(category)
        );
      }

      // Show first 6 products
      const productsToShow = filteredProducts.slice(0, 6);

      setTimeout(() => {
        addMessage(
          `Great choice! Here are some lovely items from our ${buttonText} collection.\n\nTell me which ones you'd like to add to your gift box, and I'll keep track for you!`,
          true,
          undefined,
          productsToShow
        );
        setGiftBoxStep("product_selection");
      }, 500);
    } else if (giftBoxStep === "add_more") {
      if (buttonText === "Add more items") {
        addMessage(buttonText, false);
        setTimeout(() => {
          addMessage(
            "Which type of items would you like to add?",
            true,
            ["Dresses", "Toys", "Accessories", "Makeup Sets", "Surprise Me!"]
          );
          setGiftBoxStep("category");
        }, 500);
      } else if (buttonText === "Continue to personalization") {
        addMessage(buttonText, false);
        setTimeout(() => {
          addMessage(
            "Beautiful! Let's personalize your gift.\n\nWhom is this special gift for?",
            true
          );
          setGiftBoxStep("recipient_name");
        }, 500);
      }
    } else if (giftBoxStep === "review") {
      if (buttonText === "Add more items") {
        addMessage(buttonText, false);
        setTimeout(() => {
          addMessage(
            "Which type of items would you like to add?",
            true,
            ["Dresses", "Toys", "Accessories", "Makeup Sets", "Surprise Me!"]
          );
          setGiftBoxStep("category");
        }, 500);
      } else if (buttonText === "Edit") {
        addMessage(buttonText, false);
        setTimeout(() => {
          addMessage("What would you like to edit?", true, [
            "Change recipient name",
            "Change wrapping theme",
            "Change gift message",
          ]);
        }, 500);
      } else if (buttonText === "Checkout") {
        handleCheckout();
      }
    }
  };

  const handleProductSelect = (product: any) => {
    addMessage(`Add ${product.name}`, false);
    
    const newItem = {
      productId: product.id,
      product,
      quantity: 1,
    };

    setGiftBoxData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setTimeout(() => {
      addMessage(
        `✨ Added ${product.name} to your magical box!\n\nWould you like to add more items or continue to personalization?`,
        true,
        ["Add more items", "Continue to personalization"]
      );
      setGiftBoxStep("add_more");
    }, 500);
  };

  const handleRecipientName = (name: string) => {
    if (!name.trim()) return;

    addMessage(name, false);
    setGiftBoxData((prev) => ({ ...prev, recipientName: name }));

    setTimeout(() => {
      addMessage(
        `Aww, such a lovely name! 💖\n\nLet's make ${name}'s gift extra special.\n\nNow choose a wrapping theme for your gift box. Each theme adds its own magical touch ✨`,
        true,
        WRAPPING_THEMES.map(t => `${t.emoji} ${t.name}${t.price > 0 ? ` (+₹${t.price})` : " (Free)"}`)
      );
      setGiftBoxStep("wrapping_theme");
    }, 500);
  };

  const handleWrappingTheme = (themeText: string) => {
    addMessage(themeText, false);
    const theme = WRAPPING_THEMES.find(t => themeText.includes(t.name));
    
    if (theme) {
      setGiftBoxData((prev) => ({
        ...prev,
        wrappingTheme: theme.name,
        wrappingPrice: theme.price,
      }));

      setTimeout(() => {
        addMessage(
          `Perfect choice! Would you like to add a special message for ${giftBoxData.recipientName || "the recipient"}?`,
          true
        );
        setGiftBoxStep("gift_message");
      }, 500);
    }
  };

  const handleGiftMessage = (message: string) => {
    if (!message.trim()) return;

    addMessage(message, false);
    setGiftBoxData((prev) => ({ ...prev, giftMessage: message }));

    setTimeout(() => {
      addMessage(
        `How sweet! I'll place your message inside the gift box 💖\n\nYour magical gift box is almost ready!\n\nHere's your summary:`,
        true
      );

      // Show summary
      setTimeout(() => {
        const itemsList = giftBoxData.items.map((item, idx) => `${idx + 1}. ${item.product.name}`).join("\n");
        const summary = `Items selected: ${giftBoxData.items.length} item(s)\n${itemsList}\n\nRecipient: ${giftBoxData.recipientName}\nWrapping theme: ${giftBoxData.wrappingTheme}\nMessage: ${message}\n\nWould you like to:\n\n• Add more items\n• Edit something\n• Proceed to checkout?`;
        
        addMessage(summary, true, ["Add more items", "Edit", "Checkout"]);
        setGiftBoxStep("review");
      }, 1000);
    }, 500);
  };

  const handleCheckout = async () => {
    if (!isCustomerAuthenticated) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please login to proceed to checkout.",
      });
      return;
    }

    try {
      // Add all items to cart
      for (const item of giftBoxData.items) {
        await addToCart({
          productId: item.productId,
          quantity: item.quantity,
        });
      }

      addMessage("Proceed to Checkout", false);
      
      setTimeout(() => {
        addMessage(
          "🎀✨ Your gift box is ready to wrap and deliver!\n\nClick below to complete your order and make someone's day magical 💝",
          true,
          ["Proceed to Checkout"]
        );
        
        // Navigate to checkout
        setTimeout(() => {
          setLocation("/shop/checkout");
          setIsOpen(false);
        }, 1500);
      }, 500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add items to cart",
      });
    }
  };

  const handleVirtualRunwayButton = (buttonText: string) => {
    if (buttonText === "View Latest Collection") {
      addMessage(buttonText, false);
      setTimeout(() => {
        const latestProducts = products.slice(0, 6);
        addMessage(
          "Here's our latest collection on the runway! Click on any product to see it in action.",
          true,
          undefined,
          latestProducts
        );
      }, 500);
    } else if (buttonText === "Browse by Category") {
      addMessage(buttonText, false);
      setTimeout(() => {
        addMessage(
          "Which category would you like to see on the runway?",
          true,
          categories.slice(0, 5).map(cat => cat)
        );
      }, 500);
    } else if (buttonText === "See Featured Outfits") {
      addMessage(buttonText, false);
      setTimeout(() => {
        const featuredProducts = products.filter(p => p.quantity > 0).slice(0, 6);
        addMessage(
          "Here are our featured outfits from the runway! These are our most popular pieces.",
          true,
          undefined,
          featuredProducts
        );
      }, 500);
    } else if (categories.includes(buttonText)) {
      // Category selected from virtual runway
      addMessage(buttonText, false);
      setTimeout(() => {
        const categoryProducts = products.filter(p => p.category === buttonText).slice(0, 6);
        if (categoryProducts.length > 0) {
          addMessage(
            `Here are the ${buttonText} products from our virtual runway!`,
            true,
            undefined,
            categoryProducts
          );
        } else {
          addMessage(
            `I couldn't find any ${buttonText} products at the moment. Would you like to see another category?`,
            true,
            categories.slice(0, 5).map(cat => cat)
          );
        }
      }, 500);
    }
  };

  const handleButtonClick = (buttonText: string) => {
    if (buttonText === "🎁 Create Gift Box") {
      setMode("giftbox");
      setMessages([]);
      setGiftBoxStep("welcome");
      setGiftBoxData({
        items: [],
        recipientName: "",
        wrappingTheme: "",
        wrappingPrice: 0,
        giftMessage: "",
      });
      return;
    }

    if (buttonText === "✨ Virtual Runway") {
      // Navigate to virtual runway page or open virtual runway feature
      addMessage(buttonText, false);
      setTimeout(() => {
        addMessage(
          "🌟 Welcome to the Virtual Runway!\n\nExperience our products in a stunning virtual fashion show. Watch as our little models showcase the latest collections in an immersive runway experience.\n\nWould you like to:\n\n• View Latest Collection Runway\n• Browse by Category\n• See Featured Outfits",
          true,
          ["View Latest Collection", "Browse by Category", "See Featured Outfits"]
        );
      }, 500);
      return;
    }

    // Handle Virtual Runway sub-buttons
    if (buttonText === "View Latest Collection" || 
        buttonText === "Browse by Category" || 
        buttonText === "See Featured Outfits" ||
        categories.includes(buttonText)) {
      handleVirtualRunwayButton(buttonText);
      return;
    }

    if (mode === "giftbox") {
      handleGiftBoxButton(buttonText);
    } else {
      // Original style assistant flow
      handleStyleButtonClick(buttonText);
    }
  };

  const handleStyleButtonClick = (style: string) => {
    const response = STYLE_RESPONSES[style] || "That's a wonderful choice! Let me help you find the perfect outfit.";

    addMessage(style, false);
    setTimeout(() => {
      addMessage(
        response,
        true
      );
      setTimeout(() => {
        addMessage("Would you like to browse our collection?", true, ["Browse Products"]);
      }, 1000);
    }, 500);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    if (mode === "giftbox") {
      if (giftBoxStep === "recipient_name") {
        handleRecipientName(inputValue);
      } else if (giftBoxStep === "gift_message") {
        handleGiftMessage(inputValue);
      } else {
        addMessage(inputValue, false);
        setTimeout(() => {
          addMessage("I'm here to help you create the perfect gift box! Please use the buttons to continue.", true);
        }, 500);
      }
    } else {
      addMessage(inputValue, false);
      setTimeout(() => {
        const lowerInput = inputValue.toLowerCase();
        let botResponse = "";

        if (lowerInput.includes("price") || lowerInput.includes("cost")) {
          botResponse = "Our prices are very competitive! You can see the exact prices when you browse our products. Would you like me to show you our collection?";
        } else if (lowerInput.includes("size") || lowerInput.includes("fit")) {
          botResponse = "We have sizes for all ages! Our products come in various sizes. You can check the size chart on each product page. What size are you looking for?";
        } else if (lowerInput.includes("shipping") || lowerInput.includes("delivery")) {
          botResponse = "We offer worldwide shipping! Free shipping is available for orders over ₹500. Standard delivery takes 5-7 business days. Would you like to know more?";
        } else if (lowerInput.includes("return") || lowerInput.includes("exchange")) {
          botResponse = "We have a hassle-free return and exchange policy! You can return items within 7 days of delivery. Would you like to know more about our policies?";
        } else if (lowerInput.includes("product") || lowerInput.includes("show") || lowerInput.includes("browse")) {
          botResponse = "Great! Let me take you to our products page where you can see all our amazing collections!";
          setTimeout(() => {
            setLocation("/shop/products");
            setIsOpen(false);
          }, 1500);
        } else {
          botResponse = "I'm here to help you find the perfect outfit! You can ask me about our products, sizes, prices, shipping, or browse our collection. What would you like to know?";
        }

        addMessage(botResponse, true);
      }, 500);
    }

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => {
            setIsOpen(true);
            setMode("assistant");
            setMessages([]);
          }}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white z-50 flex items-center justify-center"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col border-2 border-pink-200">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              {mode === "giftbox" ? <Gift className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
              <CardTitle className="text-lg font-bold">
                {mode === "giftbox" ? "Gift Box Builder" : "Shopping Assistant"}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => {
                setIsOpen(false);
                setMessages([]);
                setMode("assistant");
                setGiftBoxStep("welcome");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-pink-50/50 to-purple-50/50">
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.isBot
                          ? "bg-white border border-pink-200 shadow-sm"
                          : "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.isBot ? "text-gray-500" : "text-white/80"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  {/* Product Cards */}
                  {message.products && message.products.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.products.map((product) => (
                        <Card
                          key={product.id}
                          className="cursor-pointer hover:shadow-md transition-shadow border-pink-200"
                          onClick={() => handleProductSelect(product)}
                        >
                          <CardContent className="p-3 flex gap-3">
                            <img
                              src={product.image?.replace("w=100&h=100", "w=60&h=60") || "/placeholder.png"}
                              alt={product.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{formatRupees(product.price)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Buttons */}
                  {message.buttons && message.buttons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.buttons.map((button, idx) => (
                        <Button
                          key={idx}
                          onClick={() => handleButtonClick(button)}
                          variant="outline"
                          size="sm"
                          className="text-xs border-pink-200 hover:bg-pink-50 hover:border-pink-300"
                        >
                          {button}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-pink-200 p-4 bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    giftBoxStep === "recipient_name"
                      ? "Enter recipient name..."
                      : giftBoxStep === "gift_message"
                      ? "Type your message..."
                      : "Type your message..."
                  }
                  className="flex-1 border-pink-200 focus:border-pink-400"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
