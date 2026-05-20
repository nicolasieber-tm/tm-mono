import { Hero } from "@/components/sections/Hero";
import { ProblemMirror } from "@/components/sections/ProblemMirror";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { WhyUs } from "@/components/sections/WhyUs";
import { Products } from "@/components/sections/Products";
import { Contact } from "@/components/sections/Contact";
import { Team } from "@/components/sections/Team";
import { FAQ } from "@/components/sections/FAQ";
import { Footer } from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/reveal";

const Index = () => {
  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <Reveal><ProblemMirror /></Reveal>
        <Reveal><Services /></Reveal>
        <Reveal><Process /></Reveal>
        <Reveal><WhyUs /></Reveal>
        <Reveal><Products /></Reveal>
        <Reveal><Contact /></Reveal>
        <Reveal><Team /></Reveal>
        <Reveal><FAQ /></Reveal>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
