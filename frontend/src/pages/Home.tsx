import Hero from "@/components/hero";
import AboutSection from "@/components/about-section";
import ProductsSection from "@/components/products-section";
import YoutubeSection from "@/components/youtube-section";
import VisionMissionSection from "@/components/vision-mission-section";
import ClientsSection from "@/components/clients-section";
import CollaborationsSection from "@/components/collaborations-section";
import FundingSection from "@/components/funding-section";
import InsightsSection from "@/components/insights-section";
import Footer from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <AboutSection />
      <ProductsSection />
      <YoutubeSection />
      <VisionMissionSection />
      <ClientsSection />
      <CollaborationsSection />
      <FundingSection />
      <InsightsSection />
      <Footer />
    </div>
  );
}
