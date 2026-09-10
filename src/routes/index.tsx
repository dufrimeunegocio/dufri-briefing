import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  FileImage,
  Globe2,
  MessageCircle,
  RotateCcw,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";
import logoAsset from "../assets/dufri-logo.jpeg.asset.json";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Briefing de Site | Dufri Meu Negócio" },
      { name: "description", content: "Preencha seu briefing para iniciarmos a criação do seu site com a Dufri Meu Negócio." },
      { property: "og:title", content: "Briefing de Site | Dufri Meu Negócio" },
      { property: "og:description", content: "Conte-nos sobre o seu negócio e dê o primeiro passo para criar seu novo site." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BriefingPage,
});

type AnswerKey =
  | "fullName" | "businessName" | "profession" | "mainWhatsapp" | "otherPhone" | "email" | "location" | "workAddress"
  | "siteGoal" | "services" | "hasSite" | "siteUrl" | "hasDomain" | "domain" | "hosting"
  | "hasLogo" | "logoFile" | "colors" | "hasReference" | "referenceUrl" | "about"
  | "publicWhatsapp" | "publicPhone" | "instagram" | "facebook" | "linkedin";

type BriefingData = Record<AnswerKey, string>;

type Step = {
  key: AnswerKey;
  group: string;
  title: string;
  description: string;
  placeholder?: string;
  type: "text" | "tel" | "email" | "url" | "textarea" | "choice" | "upload";
  options?: { label: string; detail: string }[];
  optional?: boolean;
  conditional?: { answerKey: AnswerKey; title: string; placeholder: string; type: "text" | "url" };
};

const initialData: BriefingData = {
  fullName: "", businessName: "", profession: "", mainWhatsapp: "", otherPhone: "", email: "", location: "", workAddress: "",
  siteGoal: "", services: "", hasSite: "", siteUrl: "", hasDomain: "", domain: "", hosting: "",
  hasLogo: "", logoFile: "", colors: "", hasReference: "", referenceUrl: "", about: "",
  publicWhatsapp: "", publicPhone: "", instagram: "", facebook: "", linkedin: "",
};

const yesNo = [
  { label: "Sim", detail: "Já possuo" },
  { label: "Não", detail: "Ainda não possuo" },
];

const steps: [Step, ...Step[]] = [
  { key: "fullName", group: "Dados principais", title: "Qual é o seu nome completo?", description: "Vamos usar seu nome para identificar este briefing.", placeholder: "Digite seu nome completo", type: "text" },
  { key: "businessName", group: "Dados principais", title: "Qual é o nome profissional ou da sua empresa?", description: "Informe o nome que representa seu negócio.", placeholder: "Nome profissional ou da empresa", type: "text" },
  { key: "profession", group: "Dados principais", title: "Qual é sua profissão ou área de atuação?", description: "Conte em que segmento você trabalha.", placeholder: "Ex.: Advogada, Clínica de estética, Consultoria", type: "text" },
  { key: "mainWhatsapp", group: "Dados principais", title: "Qual é o seu WhatsApp principal?", description: "Informe um número com DDD para contato sobre o projeto.", placeholder: "(00) 00000-0000", type: "tel" },
  { key: "otherPhone", group: "Dados principais", title: "Possui outro número de telefone para contato?", description: "Se tiver, informe um telefone alternativo.", placeholder: "(00) 00000-0000", type: "tel", optional: true },
  { key: "email", group: "Dados principais", title: "Qual é o seu e-mail?", description: "Use um endereço de e-mail que você acessa com frequência.", placeholder: "voce@empresa.com.br", type: "email" },
  { key: "location", group: "Dados principais", title: "Qual é sua cidade e estado?", description: "Essa informação ajuda a contextualizar a atuação do seu negócio.", placeholder: "Ex.: São Paulo, SP", type: "text" },
  { key: "workAddress", group: "Dados principais", title: "Qual é o endereço do seu local de trabalho?", description: "Informe somente se quiser divulgar ou considerar um endereço físico.", placeholder: "Rua, número, bairro e cidade", type: "text", optional: true },
  { key: "siteGoal", group: "Sobre o site", title: "Qual é o principal objetivo do seu site?", description: "Explique o que você espera alcançar com o novo site.", placeholder: "Ex.: apresentar serviços e gerar novos contatos", type: "textarea" },
  { key: "services", group: "Sobre o site", title: "Quais serviços você oferece?", description: "Liste os principais serviços que precisam aparecer no site.", placeholder: "Descreva seus serviços em ordem de importância", type: "textarea" },
  { key: "hasSite", group: "Sobre o site", title: "Você já possui um site?", description: "Selecione uma opção.", type: "choice", options: yesNo, conditional: { answerKey: "siteUrl", title: "Qual é o link do seu site atual?", placeholder: "https://seusite.com.br", type: "url" } },
  { key: "hasDomain", group: "Domínio e hospedagem", title: "Você já possui um domínio?", description: "Domínio é o endereço usado para acessar seu site.", type: "choice", options: yesNo, conditional: { answerKey: "domain", title: "Qual é o seu domínio?", placeholder: "seusite.com.br", type: "text" } },
  { key: "hosting", group: "Domínio e hospedagem", title: "Você possui hospedagem?", description: "Selecione a opção que representa sua situação atual.", type: "choice", options: [
    { label: "Sim", detail: "Já tenho um serviço de hospedagem" },
    { label: "Não", detail: "Ainda não contratei hospedagem" },
    { label: "Não sei", detail: "Preciso de ajuda para verificar" },
  ] },
  { key: "hasLogo", group: "Identidade visual", title: "Você já possui uma logo?", description: "Selecione uma opção.", type: "choice", options: yesNo, conditional: { answerKey: "logoFile", title: "Envie sua logo", placeholder: "Selecionar imagem", type: "text" } },
  { key: "colors", group: "Identidade visual", title: "Quais cores você gostaria que seu site tivesse?", description: "Você pode citar cores, combinações ou sensações desejadas.", placeholder: "Ex.: azul escuro, branco e detalhes em dourado", type: "textarea" },
  { key: "hasReference", group: "Identidade visual", title: "Possui algum site como referência?", description: "Pode ser uma referência de visual, conteúdo ou organização.", type: "choice", options: yesNo, conditional: { answerKey: "referenceUrl", title: "Cole o link do site de referência", placeholder: "https://sitedereferencia.com.br", type: "url" } },
  { key: "about", group: "Identidade visual", title: "Conte um pouco sobre você ou sua empresa.", description: "Compartilhe sua história, diferenciais e o que considera mais importante.", placeholder: "Escreva uma breve apresentação do seu negócio", type: "textarea" },
  { key: "publicWhatsapp", group: "Contatos para o site", title: "Qual WhatsApp deve aparecer no seu site?", description: "Esse número poderá ser usado pelos visitantes para falar com você.", placeholder: "(00) 00000-0000", type: "tel" },
  { key: "publicPhone", group: "Contatos para o site", title: "Possui outro telefone que gostaria de divulgar?", description: "Informe apenas se quiser exibir outro contato no site.", placeholder: "(00) 0000-0000", type: "tel", optional: true },
  { key: "instagram", group: "Contatos para o site", title: "Qual é o seu Instagram?", description: "Informe seu usuário, link do perfil ou escreva “Não possuo”.", placeholder: "@seuperfil ou Não possuo", type: "text" },
  { key: "facebook", group: "Contatos para o site", title: "Qual é o seu Facebook?", description: "Informe seu usuário, link da página ou escreva “Não possuo”.", placeholder: "Link do perfil ou Não possuo", type: "text" },
  { key: "linkedin", group: "Contatos para o site", title: "Possui LinkedIn ou outra rede profissional?", description: "Informe o perfil ou escreva “Não possuo”.", placeholder: "Link do perfil ou Não possuo", type: "text" },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img src={logoAsset.url} alt="Dufri Meu Negócio" className={compact ? "h-11 w-11 rounded-sm object-cover" : "h-20 w-20 rounded-sm object-cover shadow-brand"} />
      <div className="leading-none">
        <span className="block font-display text-lg font-bold text-primary">DUFRI</span>
        <span className="mt-1 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Meu Negócio</span>
      </div>
    </div>
  );
}

function ActionButton({ children, onClick, type = "button", secondary = false, disabled = false }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; secondary?: boolean; disabled?: boolean }) {
  return <button type={type} onClick={onClick} disabled={disabled} className={secondary ? "action-button action-button-secondary" : "action-button action-button-primary"}>{children}</button>;
}

function BriefingPage() {
  const [screen, setScreen] = useState<"welcome" | "form" | "done" | "finished">("welcome");
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<BriefingData>(initialData);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const step = steps[currentStep] ?? steps[0];
  const value = data[step.key];
  const conditionalKey = step.conditional?.answerKey;
  const conditionalValue = conditionalKey ? data[conditionalKey] : "";
  const requiresConditional = Boolean(step.conditional && value === "Sim");
  const canContinue = Boolean(step.optional || (value.trim() && (!requiresConditional || conditionalValue.trim())));
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => { contentRef.current?.focus(); }, [currentStep, screen]);

  const setValue = (key: AnswerKey, next: string) => {
    setData((previous) => {
      const updated = { ...previous, [key]: next };
      if (key === step.key && next !== "Sim" && step.conditional) updated[step.conditional.answerKey] = "";
      return updated;
    });
  };

  const continueFlow = () => {
    if (!canContinue) return;
    if (currentStep === steps.length - 1) setScreen("done");
    else setCurrentStep((index) => index + 1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && canContinue) continueFlow();
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setValue("logoFile", file.name);
  };

  const restart = () => {
    setData(initialData);
    setCurrentStep(0);
    setSaveError("");
    setScreen("welcome");
  };

  const missingRequired = () => {
    for (const item of steps) {
      if (!item.optional && !data[item.key].trim()) return item;
      if (item.conditional && data[item.key] === "Sim" && !data[item.conditional.answerKey].trim()) return item;
    }
    return null;
  };

  const submitBriefing = async () => {
    if (saving) return;
    const missing = missingRequired();
    if (missing) {
      setSaveError("Algumas respostas obrigatórias estão em branco. Revise o briefing antes de enviar.");
      setCurrentStep(steps.indexOf(missing));
      setScreen("form");
      return;
    }
    setSaving(true);
    setSaveError("");
    const { error } = await supabase.from("briefings").insert({
      full_name: data.fullName,
      business_name: data.businessName,
      profession: data.profession,
      main_whatsapp: data.mainWhatsapp,
      other_phone: data.otherPhone || null,
      email: data.email,
      location: data.location,
      work_address: data.workAddress || null,
      site_goal: data.siteGoal,
      services: data.services,
      has_site: data.hasSite,
      site_url: data.siteUrl || null,
      has_domain: data.hasDomain,
      domain: data.domain || null,
      hosting: data.hosting,
      has_logo: data.hasLogo,
      logo_file: data.logoFile || null,
      colors: data.colors,
      has_reference: data.hasReference,
      reference_url: data.referenceUrl || null,
      about: data.about,
      public_whatsapp: data.publicWhatsapp,
      public_phone: data.publicPhone || null,
      instagram: data.instagram,
      facebook: data.facebook,
      linkedin: data.linkedin,
      status: "Novo",
      submitted_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      setSaveError("Não foi possível enviar seu briefing agora. Tente novamente em instantes.");
      return;
    }
    setScreen("finished");
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
            <div className="mt-10 max-w-xs"><ActionButton onClick={() => setScreen("form")}>Começar briefing <ArrowRight className="h-5 w-5" /></ActionButton></div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "done" || screen === "finished") {
    return (
      <main className="min-h-dvh bg-surface px-5 py-6 sm:px-8">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between"><BrandMark compact /><span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Briefing concluído</span></header>
        <section className="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-2xl flex-col items-center justify-center py-14 text-center" ref={contentRef} tabIndex={-1}>
          <div className="success-mark"><Check className="h-9 w-9" strokeWidth={2.5} /></div>
          <span className="section-kicker mt-8">Tudo preenchido</span>
          <h1 className="mt-4 font-display text-4xl font-bold text-primary sm:text-5xl">Briefing concluído! <span aria-hidden="true">🎉</span></h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">Recebemos suas informações. Em breve vamos analisar seu briefing e dar continuidade ao seu projeto.</p>
          {screen === "done" ? (
            <>
              <div className="mt-9 w-full max-w-xs"><ActionButton onClick={submitBriefing} disabled={saving}><CheckCircle2 className="h-5 w-5" />{saving ? "Enviando..." : "Finalizar briefing"}</ActionButton></div>
              {saveError && <p className="mt-4 max-w-md text-sm font-semibold text-destructive">{saveError}</p>}
            </>
          ) : (
            <>
              <div className="mt-8 flex items-center gap-2 rounded-md bg-success-soft px-4 py-3 text-sm font-semibold text-success"><CheckCircle2 className="h-5 w-5" />Briefing finalizado com sucesso</div>
              <button type="button" onClick={restart} className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-accent"><RotateCcw className="h-4 w-4" />Preencher novamente</button>
            </>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border bg-background px-5 pb-5 pt-5 sm:px-8 lg:px-12">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0"><BrandMark compact /></div>
          <div className="shrink-0 text-right"><span className="block text-xs font-bold uppercase tracking-[0.12em] text-primary">Pergunta {currentStep + 1} de {steps.length}</span><span className="mt-1 block text-xs text-muted-foreground">{Math.round(progress)}% concluído</span></div>
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
            <span className="section-kicker">{step.group}</span>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-primary sm:text-4xl">{step.title}</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">{step.description}</p>
            <div className="mt-8">
              {["text", "tel", "email", "url"].includes(step.type) && (
                <input autoFocus type={step.type} inputMode={step.type === "tel" ? "tel" : step.type === "email" ? "email" : step.type === "url" ? "url" : "text"} value={value} onChange={(event) => setValue(step.key, event.target.value)} onKeyDown={handleKeyDown} placeholder={step.placeholder} aria-label={step.title} className="briefing-field" />
              )}
              {step.type === "textarea" && <textarea autoFocus value={value} onChange={(event) => setValue(step.key, event.target.value)} placeholder={step.placeholder} aria-label={step.title} rows={5} className="briefing-field resize-none" />}
              {step.type === "choice" && (
                <div className={`grid gap-3 ${step.options?.length === 2 ? "sm:grid-cols-2" : ""}`}>
                  {step.options?.map((option) => {
                    const selected = value === option.label;
                    return (
                      <button type="button" key={option.label} onClick={() => setValue(step.key, option.label)} className={`option-button ${selected ? "option-button-selected" : ""}`} aria-pressed={selected}>
                        <span className="min-w-0 text-left"><span className="block font-bold text-foreground">{option.label}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{option.detail}</span></span>
                        <span className="option-check">{selected && <Check className="h-4 w-4" strokeWidth={3} />}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {requiresConditional && step.conditional && (
                <div className="conditional-field mt-6">
                  <label htmlFor="conditional-answer" className="mb-2 block text-sm font-bold text-primary">{step.conditional.title}</label>
                  {step.conditional.answerKey === "logoFile" ? (
                    <>
                      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleFile} className="sr-only" id="logo-upload" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="upload-area">
                        {conditionalValue ? <FileImage className="h-7 w-7 text-success" /> : <UploadCloud className="h-7 w-7 text-accent" />}
                        <span className="font-bold text-primary">{conditionalValue || "Selecionar imagem da logo"}</span>
                        <span className="text-xs text-muted-foreground">PNG, JPG, WEBP ou SVG</span>
                      </button>
                    </>
                  ) : (
                    <input id="conditional-answer" autoFocus type={step.conditional.type} inputMode={step.conditional.type === "url" ? "url" : "text"} value={conditionalValue} onChange={(event) => setValue(step.conditional?.answerKey ?? step.key, event.target.value)} onKeyDown={handleKeyDown} placeholder={step.conditional.placeholder} className="briefing-field" />
                  )}
                </div>
              )}

              <div className="mt-3 min-h-6">{step.optional && !value ? <p className="text-sm text-muted-foreground">Esta pergunta é opcional.</p> : !canContinue ? <p className="text-sm text-muted-foreground">Preencha esta resposta para continuar.</p> : null}</div>
            </div>

            <div className="mt-7 grid grid-cols-[auto_minmax(0,1fr)] gap-3 sm:flex sm:justify-between">
              <div>{currentStep > 0 && <ActionButton secondary onClick={() => setCurrentStep((index) => index - 1)}><ArrowLeft className="h-5 w-5" /><span className="hidden sm:inline">Voltar</span></ActionButton>}</div>
              <div className="sm:w-44"><ActionButton onClick={continueFlow} disabled={!canContinue}>{currentStep === steps.length - 1 ? "Concluir" : "Continuar"}<ArrowRight className="h-5 w-5" /></ActionButton></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}