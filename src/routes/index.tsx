import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Globe2,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import logoAsset from "../assets/dufri-logo.jpeg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Briefing de Site | Dufri Meu Negócio" },
      {
        name: "description",
        content: "Preencha seu briefing para iniciarmos a criação do seu site com a Dufri Meu Negócio.",
      },
      { property: "og:title", content: "Briefing de Site | Dufri Meu Negócio" },
      {
        property: "og:description",
        content: "Conte-nos sobre o seu negócio e dê o primeiro passo para criar seu novo site.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BriefingPage,
});

type BriefingData = {
  contact: string;
  business: string;
  segment: string;
  goal: string;
  audience: string;
  services: string;
  references: string;
  materials: string;
  notes: string;
};

type Step = {
  key: keyof BriefingData;
  eyebrow: string;
  title: string;
  description: string;
  placeholder?: string;
  type: "text" | "textarea" | "options";
  options?: { label: string; detail: string }[];
  optional?: boolean;
};

const initialData: BriefingData = {
  contact: "",
  business: "",
  segment: "",
  goal: "",
  audience: "",
  services: "",
  references: "",
  materials: "",
  notes: "",
};

const steps: [Step, ...Step[]] = [
  {
    key: "contact",
    eyebrow: "Vamos começar",
    title: "Como podemos chamar você?",
    description: "Informe seu nome para personalizarmos esta conversa.",
    placeholder: "Seu nome",
    type: "text",
  },
  {
    key: "business",
    eyebrow: "Sobre o negócio",
    title: "Qual é o nome da sua empresa?",
    description: "Escreva como o nome deve aparecer no site.",
    placeholder: "Nome da empresa ou marca",
    type: "text",
  },
  {
    key: "segment",
    eyebrow: "Área de atuação",
    title: "O que sua empresa faz?",
    description: "Conte brevemente seu segmento e a atividade principal.",
    placeholder: "Ex.: clínica de estética especializada em cuidados faciais",
    type: "textarea",
  },
  {
    key: "goal",
    eyebrow: "Objetivo do projeto",
    title: "Qual é o principal objetivo do site?",
    description: "Escolha a opção que mais se aproxima do que você precisa.",
    type: "options",
    options: [
      { label: "Apresentar minha empresa", detail: "Fortalecer a presença e a credibilidade online" },
      { label: "Gerar contatos e vendas", detail: "Atrair pessoas interessadas em contratar" },
      { label: "Mostrar produtos ou serviços", detail: "Criar um catálogo claro e profissional" },
      { label: "Outro objetivo", detail: "Tenho uma necessidade diferente" },
    ],
  },
  {
    key: "audience",
    eyebrow: "Público",
    title: "Quem você deseja alcançar?",
    description: "Descreva o perfil do seu cliente ideal.",
    placeholder: "Ex.: mulheres de 25 a 50 anos que buscam bem-estar...",
    type: "textarea",
  },
  {
    key: "services",
    eyebrow: "O que será apresentado",
    title: "Quais serviços ou produtos devem aparecer?",
    description: "Liste os principais itens em ordem de importância.",
    placeholder: "Digite os serviços ou produtos principais",
    type: "textarea",
  },
  {
    key: "references",
    eyebrow: "Referências",
    title: "Existe algum site que você admira?",
    description: "Pode ser de um concorrente ou apenas uma referência visual.",
    placeholder: "Cole links ou descreva o que você gosta",
    type: "textarea",
    optional: true,
  },
  {
    key: "materials",
    eyebrow: "Conteúdo disponível",
    title: "Você já possui materiais para o site?",
    description: "Isso nos ajuda a entender o ponto de partida do projeto.",
    type: "options",
    options: [
      { label: "Sim, tenho tudo", detail: "Logo, textos e fotos estão prontos" },
      { label: "Tenho uma parte", detail: "Alguns materiais ainda serão preparados" },
      { label: "Ainda não tenho", detail: "Preciso de orientação para começar" },
    ],
  },
  {
    key: "notes",
    eyebrow: "Último detalhe",
    title: "Há algo mais que precisamos saber?",
    description: "Compartilhe preferências, prazos ou qualquer informação importante.",
    placeholder: "Escreva aqui, se desejar",
    type: "textarea",
    optional: true,
  },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={logoAsset.url}
        alt="Dufri Meu Negócio"
        className={compact ? "h-11 w-11 rounded-sm object-cover" : "h-20 w-20 rounded-sm object-cover shadow-brand"}
      />
      <div className="leading-none">
        <span className="block font-display text-lg font-bold text-primary">DUFRI</span>
        <span className="mt-1 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Meu Negócio</span>
      </div>
    </div>
  );
}

function ActionButton({ children, onClick, type = "button", secondary = false }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; secondary?: boolean }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={secondary ? "action-button action-button-secondary" : "action-button action-button-primary"}
    >
      {children}
    </button>
  );
}

function BriefingPage() {
  const [screen, setScreen] = useState<"welcome" | "form" | "done">("welcome");
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<BriefingData>(initialData);
  const [showError, setShowError] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep] ?? steps[0];
  const value = data[step.key];
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    contentRef.current?.focus();
  }, [currentStep, screen]);

  const setValue = (next: string) => {
    setData((previous) => ({ ...previous, [step.key]: next }));
    if (next.trim()) setShowError(false);
  };

  const continueFlow = () => {
    if (!step.optional && !value.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    if (currentStep === steps.length - 1) {
      setScreen("done");
      return;
    }
    setCurrentStep((index) => index + 1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") continueFlow();
  };

  const restart = () => {
    setData(initialData);
    setCurrentStep(0);
    setShowError(false);
    setScreen("welcome");
  };

  if (screen === "welcome") {
    return (
      <main className="welcome-shell">
        <section className="welcome-brand" aria-label="Dufri Meu Negócio">
          <div className="brand-pattern" aria-hidden="true" />
          <div className="relative z-10">
            <img src={logoAsset.url} alt="Logo Dufri" className="h-24 w-24 rounded-sm object-cover shadow-brand lg:h-28 lg:w-28" />
            <p className="mt-8 max-w-xs text-sm leading-6 text-brand-panel-muted">Estratégia, presença digital e sites que aproximam negócios de seus clientes.</p>
          </div>
          <span className="relative z-10 hidden text-xs font-semibold uppercase tracking-[0.14em] text-brand-panel-muted lg:block">Dufri Meu Negócio</span>
        </section>

        <section className="welcome-content">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-10 lg:hidden"><BrandMark compact /></div>
            <span className="section-kicker">Briefing de novo site</span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] text-primary sm:text-5xl lg:text-6xl">Vamos transformar sua ideia em um site.</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">Responda algumas perguntas rápidas para entendermos seu negócio e iniciarmos seu projeto com a direção certa.</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-foreground">
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-accent" />Leva cerca de 5 minutos</span>
              <span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4 text-accent" />Simples e direto</span>
            </div>
            <div className="mt-10 max-w-xs">
              <ActionButton onClick={() => setScreen("form")}>Começar briefing <ArrowRight className="h-5 w-5" /></ActionButton>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "done") {
    return (
      <main className="min-h-dvh bg-surface px-5 py-6 sm:px-8">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between"><BrandMark compact /><span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Briefing concluído</span></header>
        <section className="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-2xl flex-col items-center justify-center py-14 text-center" ref={contentRef} tabIndex={-1}>
          <div className="success-mark"><Check className="h-9 w-9" strokeWidth={2.5} /></div>
          <span className="section-kicker mt-8">Tudo preenchido</span>
          <h1 className="mt-4 font-display text-4xl font-bold text-primary sm:text-5xl">Obrigado, {data.contact}.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">Seu briefing está pronto. Nesta primeira etapa ele ainda não será enviado, mas toda a experiência visual já está concluída.</p>
          <div className="mt-8 flex items-center gap-2 rounded-md bg-success-soft px-4 py-3 text-sm font-semibold text-success"><CheckCircle2 className="h-5 w-5" />Respostas revisadas com sucesso</div>
          <button type="button" onClick={restart} className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-accent"><RotateCcw className="h-4 w-4" />Preencher novamente</button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border bg-background px-5 pb-5 pt-5 sm:px-8 lg:px-12">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0"><BrandMark compact /></div>
          <div className="shrink-0 text-right"><span className="block text-xs font-bold uppercase tracking-[0.12em] text-primary">Etapa {currentStep + 1} de {steps.length}</span><span className="mt-1 block text-xs text-muted-foreground">{Math.round(progress)}% concluído</span></div>
        </div>
        <div className="mx-auto mt-5 h-1.5 w-full max-w-6xl overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso: ${Math.round(progress)}%`}>
          <div className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="form-layout">
        <aside className="form-aside">
          <div className="sticky top-10">
            <div className="aside-icon"><Globe2 className="h-6 w-6" /></div>
            <p className="mt-5 font-display text-2xl font-bold leading-tight text-primary">Um bom site começa com uma boa conversa.</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Suas respostas vão orientar cada decisão do projeto.</p>
          </div>
        </aside>

        <section className="form-content">
          <div key={currentStep} className="step-enter w-full max-w-2xl" ref={contentRef} tabIndex={-1}>
            <span className="section-kicker">{step.eyebrow}</span>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-primary sm:text-4xl">{step.title}</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">{step.description}</p>
            <div className="mt-8">
              {step.type === "text" && (
                <input autoFocus value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={handleKeyDown} placeholder={step.placeholder} aria-label={step.title} aria-invalid={showError} className="briefing-field" />
              )}
              {step.type === "textarea" && (
                <textarea autoFocus value={value} onChange={(event) => setValue(event.target.value)} placeholder={step.placeholder} aria-label={step.title} aria-invalid={showError} rows={5} className="briefing-field resize-none" />
              )}
              {step.type === "options" && (
                <div className="grid gap-3">
                  {step.options?.map((option) => {
                    const selected = value === option.label;
                    return (
                      <button type="button" key={option.label} onClick={() => setValue(option.label)} className={`option-button ${selected ? "option-button-selected" : ""}`} aria-pressed={selected}>
                        <span className="min-w-0 text-left"><span className="block font-bold text-foreground">{option.label}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{option.detail}</span></span>
                        <span className="option-check">{selected && <Check className="h-4 w-4" strokeWidth={3} />}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mt-3 min-h-6" aria-live="polite">
                {showError ? <p className="text-sm font-semibold text-destructive">Preencha esta resposta para continuar.</p> : step.optional ? <p className="text-sm text-muted-foreground">Esta pergunta é opcional.</p> : null}
              </div>
            </div>

            <div className="mt-7 grid grid-cols-[auto_minmax(0,1fr)] gap-3 sm:flex sm:justify-between">
              <div>{currentStep > 0 && <ActionButton secondary onClick={() => { setShowError(false); setCurrentStep((index) => index - 1); }}><ArrowLeft className="h-5 w-5" /><span className="hidden sm:inline">Voltar</span></ActionButton>}</div>
              <div className="sm:w-44"><ActionButton onClick={continueFlow}>{currentStep === steps.length - 1 ? "Concluir" : "Continuar"}<ArrowRight className="h-5 w-5" /></ActionButton></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}