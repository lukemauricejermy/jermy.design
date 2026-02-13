import Hero from "@/components/Hero";
import { Header } from "@/components/Header";
import SocialProof from "@/components/SocialProof";
import FeaturedCases from "@/components/FeaturedCases";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <SocialProof />
      <FeaturedCases />
    </main>
  );
}