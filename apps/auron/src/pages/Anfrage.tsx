import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Footer from "@/components/landing/Footer";
import { submitLead } from "@/lib/leadSubmit";

const questions = [
	{
		id: "employees",
		title: "Wie viel Mitarbeitende hat Ihr Unternehmen?",
		type: "choice",
		options: ["1-5", "6-15", "16-50", "über 50"],
	},
	{
		id: "time_tracking",
		title: "Wie erfassen Sie heute Arbeitszeiten?",
		type: "choice",
		options: [
			"Papier",
			"Excel",
			"WhatsApp",
			"bestehende App",
			"ERP direkt",
			"gemischt",
		],
	},
	{
		id: "erp",
		title: "Nutzen Sie bereits ein ERP-System?",
		type: "choice",
		options: [
			"Abacus",
			"Messerli",
			"Trivisio",
			"Schoch",
			"Bexio",
			"Xpandit",
			"Anderes",
		],
	},
	{
		id: "pain_points",
		title: "Wo entsteht aktuell am meisten Aufwand?",
		type: "choice",
		options: [
			"Fehlende oder vergessene Einträge",
			"Hoher Aufwand im Büro",
			"Baustellen nicht sauber zugeordnet",
			"Medienbruch zwischen Baustelle und Büro",
			"Fehlende Übersicht",
			"Anderes",
		],
		multiSelect: true,
	},
	{
		id: "timeline",
		title: "Wann wäre eine Einführung grundsätzlich denkbar?",
		type: "choice",
		options: ["Sofort", "in 1–3 Monaten", "in 3–6 Monaten", "später"],
	},
	{
		id: "company_name",
		title: "Wie heisst Ihr Unternehmen?",
		type: "text",
	},
];

export default function Anfrage() {
	const [currentStep, setCurrentStep] = useState(0);
	const [answers, setAnswers] = useState<Record<string, any>>({});
	const [leadId, setLeadId] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const goNext = async () => {
		if (currentStep < questions.length - 1) {
			setCurrentStep(currentStep + 1);
			return;
		}
		if (currentStep === questions.length - 1) {
			// Last question answered: persist to Supabase, then reveal Cal.com.
			setIsSubmitting(true);
			try {
				const id = await submitLead({
					company_name: String(answers.company_name ?? "").trim(),
					employees: String(answers.employees ?? ""),
					time_tracking: String(answers.time_tracking ?? ""),
					erp: String(answers.erp ?? ""),
					pain_points: Array.isArray(answers.pain_points)
						? answers.pain_points
						: answers.pain_points
						? [String(answers.pain_points)]
						: [],
					timeline: String(answers.timeline ?? ""),
				});
				setLeadId(id);
			} catch (err) {
				console.error("submitLead failed", err);
				// Continue anyway — the Cal.com webhook still captures the booking
				// (without the answers attached) so the user isn't blocked.
			} finally {
				setIsSubmitting(false);
				setCurrentStep(questions.length);
			}
		}
	};

	const goBack = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleChoice = (option: string) => {
		const question = questions[currentStep];
		if (question.multiSelect) {
			const currentSelection = answers[question.id] || [];
			const newSelection = currentSelection.includes(option)
				? currentSelection.filter((item: string) => item !== option)
				: [...currentSelection, option];
			setAnswers({ ...answers, [question.id]: newSelection });
		} else {
			setAnswers({ ...answers, [question.id]: option });
		}
	};

	const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const question = questions[currentStep];
		setAnswers({ ...answers, [question.id]: e.target.value });
	};

	const isLastStep = currentStep === questions.length;
	const progress = isLastStep
		? 100
		: ((currentStep + 1) / questions.length) * 100;

	const currentQuestion = !isLastStep ? questions[currentStep] : null;
	const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

	useEffect(() => {
		if (isLastStep) {
			(function (C: any, A: any, L: any) {
				let p = function (a: any, ar: any) { a.q.push(ar); };
				let d = C.document;
				C.Cal = C.Cal || function () {
					let cal = C.Cal; let ar = arguments;
					if (!cal.loaded) {
						cal.ns = {}; cal.q = cal.q || [];
						d.head.appendChild(d.createElement("script")).src = A;
						cal.loaded = true;
					}
					if (ar[0] === L) {
						const api: any = function () { p(api, arguments); };
						const namespace = ar[1];
						api.q = api.q || [];
						if (typeof namespace === "string") {
							cal.ns[namespace] = cal.ns[namespace] || api;
							p(cal.ns[namespace], ar);
							p(cal, ["initNamespace", namespace]);
						} else p(cal, ar);
						return;
					}
					p(cal, ar);
				};
			})(window, "https://app.cal.com/embed/embed.js", "init");

			const Cal = (window as any).Cal;
			Cal("init", "auron-beratungstermin", { origin: "https://app.cal.com" });

			Cal.ns["auron-beratungstermin"]("inline", {
				elementOrSelector: "#my-cal-inline-auron-beratungstermin",
				config: {
					"layout": "month_view",
					"useSlotsViewOnSmallScreen": "true",
					"theme": "light",
					// Cal.com requires flat string metadata entries; nested objects
					// get coerced to "[object Object]" on the server side.
					...(leadId ? { "metadata[lead_id]": leadId } : {}),
				},
				calLink: "nicolasieber/auron-beratungstermin",
			});

			Cal.ns["auron-beratungstermin"]("ui", { "theme": "light", "hideEventTypeDetails": false, "layout": "month_view" });
		}
	}, [isLastStep, leadId]);

	const canGoNext = currentQuestion
		? currentQuestion.type === "choice"
			? currentQuestion.multiSelect
				? currentAnswer && currentAnswer.length > 0
				: !!currentAnswer
			: !!currentAnswer && currentAnswer.trim() !== ""
		: false;

	return (
		<div className="min-h-screen flex flex-col pt-8 font-sans bg-slate-50">
			<div className="flex justify-center w-full mb-8">
				<Link to="/" className="inline-block">
					<img
						src="/auron-logo.png"
						alt="Auron Logo"
						className="h-12 w-auto"
					/>
				</Link>
			</div>

			<main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6">
				<div className="w-full max-w-2xl text-center mb-6">
					<p className="text-slate-600">
						{!isLastStep 
							? "Beantworten Sie kurz ein paar Fragen zu Ihrem Betrieb. So können wir uns gezielt auf das Gespräch vorbereiten."
							: "Wählen Sie einen passenden Termin aus. Wir freuen uns auf das Gespräch."}
					</p>
				</div>

				<div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-5 sm:p-8 mb-8 border border-slate-100">
					{!isLastStep ? (
						<>
							{/* Progress bar */}
							<div className="w-full bg-slate-100 rounded-full h-2 mb-8 content-center overflow-hidden">
								<div
									className="bg-primary h-2 rounded-full transition-all duration-300"
									style={{ width: `${progress}%` }}
								></div>
							</div>

							<div className="mb-6 sm:mb-8 text-center text-slate-600">
								<h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-slate-800">
									{currentQuestion?.title}
								</h2>
							</div>

							<div className="mb-8">
								{currentQuestion?.type === "choice" && (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{currentQuestion.options?.map((option) => {
											const isSelected = currentQuestion.multiSelect
												? (answers[currentQuestion.id] || []).includes(option)
												: answers[currentQuestion.id] === option;

											return (
												<button
													key={option}
													onClick={() => handleChoice(option)}
													className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${
														isSelected
															? "border-primary bg-primary/5 text-primary"
															: "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
													}`}
												>
													{option}
												</button>
											);
										})}
									</div>
								)}

								{currentQuestion?.type === "text" && (
									<Input
										type="text"
										placeholder="Unternehmensname"
										value={answers[currentQuestion.id] || ""}
										onChange={handleTextChange}
										className="w-full p-4 h-auto text-lg"
										autoFocus
									/>
								)}
							</div>

							<div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-8 sm:mt-12">
								<div className="flex gap-2 justify-center sm:justify-start">
									{questions.map((_, idx) => (
										<div
											key={idx}
											className={`h-2 rounded-full ${
												idx === currentStep
													? "w-6 bg-primary"
													: idx < currentStep
													? "w-2 bg-primary/40"
													: "w-2 bg-slate-200"
											}`}
										/>
									))}
								</div>

								<div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
									{currentStep > 0 && (
										<Button variant="outline" onClick={goBack} className="flex-1 sm:flex-none">
											Zurück
										</Button>
									)}
									<Button
										onClick={goNext}
										disabled={!canGoNext || isSubmitting}
										className="flex-1 sm:flex-none sm:min-w-32"
									>
										{isSubmitting ? "Senden…" : "Weiter"}
									</Button>
								</div>
							</div>
						</>
					) : (
						<div className="w-full h-[560px] sm:h-[600px] overflow-hidden">
							<div style={{width:"100%",height:"100%",overflow:"scroll"}} id="my-cal-inline-auron-beratungstermin"></div>
						</div>
					)}
				</div>
			</main>

			<Footer />
		</div>
	);
}
