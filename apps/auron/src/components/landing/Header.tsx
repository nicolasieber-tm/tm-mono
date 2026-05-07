import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";

const navLinks = [
	{ label: "Vorteile", href: "#vorteile" },
	{ label: "Prozess", href: "#prozess" },
	{ label: "Funktionen", href: "#funktionen" },
	{ label: "Über uns", href: "#team" },
];

const Header = () => {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const lenis = useLenis();

	const scrollToEarlyAccess = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		const target =
			document.getElementById("early-access-content") ??
			document.getElementById("early-access");
		if (!target) return;
		const header = document.querySelector("header") as HTMLElement | null;
		const headerHeight = header?.offsetHeight ?? 80;
		const viewportHeight = window.innerHeight;
		const elementHeight = target.offsetHeight;
		const centerYTop = (viewportHeight - elementHeight) / 2;
		const yTop = Math.max(headerHeight + 24, centerYTop);
		if (lenis) {
			lenis.scrollTo(target, { offset: -yTop, duration: 1.4 });
		} else {
			const rect = target.getBoundingClientRect();
			window.scrollTo({ top: window.scrollY + rect.top - yTop, behavior: "smooth" });
		}
	};

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 40);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<>
			<div className="bg-primary/10 text-primary border-b border-primary/20 relative z-50 py-1.5 sm:py-2">
				<div className="max-w-7xl mx-auto px-3 sm:px-6 h-auto min-h-9 sm:min-h-16 flex items-center justify-center text-center">
					<p className="text-[11px] sm:text-sm md:text-base font-medium flex flex-row sm:flex-row items-center gap-2 leading-snug">
						<span className="hidden sm:inline">
							Auron befindet sich aktuell in der Pilotphase für ausgewählte
							Handwerks- und Bauunternehmen.
						</span>
						<span className="sm:hidden">
							In der Pilotphase
						</span>
						<a
							href="#early-access"
							onClick={scrollToEarlyAccess}
							className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/20 hover:bg-primary/30 rounded-full transition-colors font-bold group text-[11px] sm:text-sm"
						>
							Pilotbetrieb werden{" "}
							<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
						</a>
					</p>
				</div>
			</div>
			<header className="header-sticky sticky top-0 w-full z-40 border-b border-border/40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
				<div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14 sm:h-20">
					<div className="flex items-center gap-4">
						<button
							onClick={() => {
								// Update URL without hash and tell browser to scroll to top, 
								// then force a window reload.
								window.history.pushState('', document.title, window.location.pathname);
								window.scrollTo(0, 0);
								// Force real reload bypassing cache so scroll restoration is less likely
								window.location.href = window.location.pathname;
							}}
							className="text-xl font-black tracking-tight text-foreground flex items-center gap-2 hover:opacity-80 transition-opacity"
						>
							<img
								src="/auron-logo.png"
								alt="Auron Logo"
								className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain"
							/>
							<span className="hidden sm:inline">AURON</span>
						</button>

						<AnimatePresence>
							{scrolled && (
								<motion.div
									initial={{ opacity: 0, width: 0, x: -20 }}
									animate={{ opacity: 1, width: "auto", x: 0 }}
									exit={{ opacity: 0, width: 0, x: -20 }}
									className="hidden lg:flex items-center overflow-hidden whitespace-nowrap"
								>
									<a
										href="#early-access"
										onClick={scrollToEarlyAccess}
										className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-full transition-colors group"
									>
										<Sparkles className="w-3.5 h-3.5" />
										<span className="hidden xl:inline">Aktuell in der Pilotphase:</span>
										Pilotbetrieb werden
										<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
									</a>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<nav className="hidden md:flex items-center gap-6 lg:gap-10">
						{navLinks.map((l) => (
							<a
								key={l.href}
								href={l.href}
								className="text-sm font-semibold text-foreground/90 hover:text-foreground transition-colors"
							>
								{l.label}
							</a>
						))}
					</nav>

					<div className="hidden md:flex items-center gap-4">
						<Button
							asChild
							className="h-11 px-6 rounded-full font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
						>
							<a href="/anfrage">Beratung buchen</a>
						</Button>
					</div>

					<button
						className="md:hidden text-foreground p-2 -mr-2"
						onClick={() => setMobileOpen(!mobileOpen)}
					>
						{mobileOpen ? (
							<X className="w-6 h-6" />
						) : (
							<Menu className="w-6 h-6" />
						)}
					</button>
				</div>

				<AnimatePresence>
					{mobileOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="md:hidden border-t border-border/50 glass"
						>
							<div className="flex flex-col gap-4 px-6 py-6">
								{navLinks.map((l) => (
									<a
										key={l.href}
										href={l.href}
										onClick={() => setMobileOpen(false)}
										className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
									>
										{l.label}
									</a>
								))}
								<div className="flex gap-3 pt-4 border-t border-border/50">
									<Button
										asChild
										className="w-full text-base h-12 rounded-full font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
									>
										<a href="/anfrage">Beratung buchen</a>
									</Button>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</header>
		</>
	);
};

export default Header;
