import Hero from "@/components/Hero";
import VideoShowcase from "@/components/VideoShowcase";
import SocialProof from "@/components/SocialProof";
import About from "@/components/About";
import Reviews from "@/components/Reviews";
import FinalCTA from "@/components/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <VideoShowcase />
      <SocialProof />
      <About />
      <Reviews />
      <FinalCTA />
    </>
  );
}
