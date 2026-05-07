import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Benefits } from "@/components/landing/Benefits";
import { ForWhom } from "@/components/landing/ForWhom";
import { Trust } from "@/components/landing/Trust";
import { Process } from "@/components/landing/Process";
import { MidCTA } from "@/components/landing/MidCTA";
import { ContactForm } from "@/components/landing/ContactForm";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Benefits />
        <ForWhom />
        <Trust />
        <Process />
        <MidCTA />
        <ContactForm />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
