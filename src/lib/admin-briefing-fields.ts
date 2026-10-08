import type { Tables } from '@/integrations/supabase/types';
export type Briefing = Tables<'briefings'>;
export const statuses = ['Novo', 'Em análise', 'Em produção', 'Concluído'] as const;
type Field = { key: keyof Briefing; question: string; group: string; parent?: keyof Briefing };
export const briefingFields: Field[] = [
 { key:'full_name', question:'Qual é o seu nome completo?', group:'Dados principais' },
 { key:'business_name', question:'Qual é o nome profissional ou da sua empresa?', group:'Dados principais' },
 { key:'profession', question:'Qual é sua profissão ou área de atuação?', group:'Dados principais' },
 { key:'main_whatsapp', question:'Qual é o seu WhatsApp principal?', group:'Dados principais' },
 { key:'other_phone', question:'Possui outro número de telefone para contato?', group:'Dados principais' },
 { key:'email', question:'Qual é o seu e-mail?', group:'Dados principais' },
 { key:'location', question:'Qual é sua cidade e estado?', group:'Dados principais' },
 { key:'work_address', question:'Qual é o endereço do seu local de trabalho?', group:'Dados principais' },
 { key:'site_goal', question:'Qual é o principal objetivo do seu site?', group:'Sobre o site' },
 { key:'services', question:'Quais serviços você oferece?', group:'Sobre o site' },
 { key:'has_site', question:'Você já possui um site?', group:'Sobre o site' },
 { key:'site_url', question:'Qual é o link do seu site atual?', group:'Sobre o site', parent:'has_site' },
 { key:'has_domain', question:'Você já possui um domínio?', group:'Domínio e hospedagem' },
 { key:'domain', question:'Qual é o seu domínio?', group:'Domínio e hospedagem', parent:'has_domain' },
 { key:'hosting', question:'Você possui hospedagem?', group:'Domínio e hospedagem' },
 { key:'has_logo', question:'Você já possui uma logo?', group:'Identidade visual' },
 { key:'logo_file', question:'Envie sua logo', group:'Identidade visual', parent:'has_logo' },
 { key:'colors', question:'Quais cores você gostaria que seu site tivesse?', group:'Identidade visual' },
 { key:'has_reference', question:'Possui algum site como referência?', group:'Identidade visual' },
 { key:'reference_url', question:'Cole o link do site de referência', group:'Identidade visual', parent:'has_reference' },
 { key:'about', question:'Conte um pouco sobre você ou sua empresa.', group:'Identidade visual' },
 { key:'public_whatsapp', question:'Qual WhatsApp deve aparecer no seu site?', group:'Contatos para o site' },
 { key:'public_phone', question:'Possui outro telefone que gostaria de divulgar?', group:'Contatos para o site' },
 { key:'instagram', question:'Qual é o seu Instagram?', group:'Contatos para o site' },
 { key:'facebook', question:'Qual é o seu Facebook?', group:'Contatos para o site' },
 { key:'linkedin', question:'Possui LinkedIn ou outra rede profissional?', group:'Contatos para o site' },
];
export function visibleFields(briefing: Briefing) { return briefingFields.filter(f => !f.parent || briefing[f.parent] === 'Sim' || briefing[f.key]); }
export function briefingText(briefing: Briefing) { return visibleFields(briefing).map(f => `PERGUNTA: ${f.question}\n\nRESPOSTA:\n${briefing[f.key] || 'Não informado'}`).join('\n\n────────────────────\n\n'); }
export function submittedDate(value: string) { return new Intl.DateTimeFormat('pt-BR', { dateStyle:'short', timeStyle:'medium', timeZone:'America/Sao_Paulo' }).format(new Date(value)).replace(', ', ' às '); }
export function adminHead(title: string, description: string) { return { meta:[{title:`${title} | Dufri Meu Negócio`},{name:'description',content:description},{property:'og:title',content:`${title} | Dufri Meu Negócio`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex, nofollow'}] }; }
