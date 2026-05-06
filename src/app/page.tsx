import Hero from "@/components/Hero";
import { Header } from "@/components/Header";
import SocialProof from "@/components/SocialProof";
import FeaturedCases from "@/components/FeaturedCases";
import Values from "@/components/Values";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <div className="relative z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Header />
          <Hero />
          <SocialProof />
          <FeaturedCases />
          <Values />
        </div>
        {/* Spacer: matches footer height so fixed footer is revealed as content scrolls away */}
        <div
          className="pointer-events-none"
          style={{ minHeight: "var(--footer-height, 500px)" }}
          aria-hidden
        />
      </div>
      <Footer />
    </main>
  );
}