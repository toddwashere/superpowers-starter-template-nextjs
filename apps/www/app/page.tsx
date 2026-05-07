import type { Metadata } from "next";
import { HomePageContent } from "@/features/marketing/ui/home-page-content";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return <HomePageContent />;
}
