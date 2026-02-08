import Hero from "@/components/Hero";
import { Header } from "@/components/Header";
import SocialProof from "@/components/SocialProof";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <SocialProof />
      {/* Temporary test section for scroll testing */}
      <section className="h-[150vh] flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-medium text-foreground">Scroll Test Section</h2>
          <p className="text-muted-foreground">Scroll up and down to test header animations</p>
        </div>
      </section>
    </main>
  );
}