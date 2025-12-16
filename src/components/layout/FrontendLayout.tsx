import { FrontendHeader } from "./FrontendHeader";
import { FrontendFooter } from "./FrontendFooter";
import { Chatbot } from "@/components/Chatbot";
import { GiftPackButton } from "@/components/GiftPackButton";

interface FrontendLayoutProps {
  children: React.ReactNode;
  topBanner?: React.ReactNode;
}

export function FrontendLayout({ children, topBanner }: FrontendLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {topBanner}
      <FrontendHeader />
      <main className="flex-1">
        {children}
      </main>
      <FrontendFooter />
      <Chatbot />
      <GiftPackButton />
    </div>
  );
}

