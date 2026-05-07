import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import WhyAuron from "@/components/landing/WhyAuron";
import Verwaltung from "@/components/landing/Verwaltung";
import EarlyAccess from "@/components/landing/EarlyAccess";
import Comparison from "@/components/landing/Comparison";
import CalculationExample from "@/components/landing/CalculationExample";
import Team from "@/components/landing/Team";
import BookConsultation from "@/components/landing/BookConsultation";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="min-h-[100svh] bg-background">
    <Header />
    <Hero />
    <WhyAuron />
    <HowItWorks />
    <Comparison />
    <TrustBar />
    <Features />
    <Verwaltung />
    <EarlyAccess />
    <CalculationExample />
    <Team />
    <BookConsultation />
    <FAQ />
    <Footer />
  </div>
);

export default Index;
