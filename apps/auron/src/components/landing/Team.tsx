import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";

const members = [
	{
		name: "Nicola Sieber",
		role: "Co-Founder",
		description:
			"Nicola ist der lösungsorientierte Kopf hinter Auron. Mit seinem Fokus auf Effizienz und Digitalisierung hilft er Schweizer Handwerksbetrieben, ihre Prozesse zu optimieren.",
		image: "/nicola.png",
	},
	{
		name: "Timo Sieber",
		role: "Co-Founder",
		description:
			"Timo ist der Entwickler von Auron. Mit seinen fundierten Fähigkeiten in modernen Webtechnologien und Softwarearchitektur entwickelt er Auron für höchste Leistungsansprüche.",
		image: "/timo.png",
	},
	{
		name: "Mika Sieber",
		role: "Co-Founder",
		description:
			"Mika ist die erste Ansprechperson für unsere Kunden. Mit seiner herzlichen Art und seinem technischen Verständnis sorgt er für eine reibungslose Implementierung und optimale Kundenbetreuung.",
		image: "/mika.png",
	},
];

const Team = () => {
	const { reveal } = useReveal();
	return (
	<section id="team" className="pt-16 sm:pt-24 md:pt-32 pb-10 sm:pb-12 md:pb-16 px-4 sm:px-6 bg-muted/50 scroll-mt-24">
		<div className="max-w-5xl mx-auto text-center">
			<motion.p
				{...reveal(0, 20)}
				className="text-sm font-bold uppercase tracking-widest text-primary mb-4"
			>
				Über uns
			</motion.p>
			<motion.h2
				{...reveal(0, 30)}
				className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 tracking-tight text-foreground"
			>
				Die Gesichter hinter Auron
			</motion.h2>

			<div className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-8 sm:mt-12">
				{members.map((m, i) => (
					<motion.div
						key={m.name}
						{...reveal(i * 0.15, 30)}
						className="text-center max-w-xs"
					>
						<div className="w-24 h-24 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-6 overflow-hidden">
							{m.image ? (
								<img
									src={m.image}
									alt={m.name}
									className="w-full h-full object-cover"
								/>
							) : (
								<User className="w-10 h-10 text-muted-foreground" />
							)}
						</div>
						<h3 className="text-xl font-semibold text-foreground">
							{m.name}
						</h3>
						<p className="text-primary font-medium text-sm mb-3">
							{m.role}
						</p>
						<p className="text-muted-foreground leading-relaxed text-sm">
							{m.description}
						</p>
					</motion.div>
				))}
			</div>
		</div>
	</section>
	);
};

export default Team;
