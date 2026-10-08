import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { statuses } from './admin-briefing-fields';

export const listBriefings = createServerFn({method:'GET'})
 .middleware([requireSupabaseAuth])
 .inputValidator((input: unknown) => z.object({ search:z.string().max(200), status:z.string(), sort:z.enum(['newest','oldest']), page:z.number().int().min(0) }).parse(input))
 .handler(async ({ data, context }) => {
  const {data:allowed,error:roleError} = await context.supabase.rpc('is_briefing_admin');
  if(roleError || !allowed) throw new Error('Acesso administrativo não autorizado.');
  let query = context.supabase.from('briefings').select('id,full_name,business_name,profession,submitted_at,status',{count:'exact'});
  if(data.search.trim()) { const term=data.search.trim().replace(/[%,().*\\]/g,' '); query=query.or(`full_name.ilike.%${term}%,business_name.ilike.%${term}%`); }
  if(data.status) query=query.eq('status',data.status);
  const {data:rows,error,count} = await query.order('submitted_at',{ascending:data.sort==='oldest'}).order('id').range(data.page*20,data.page*20+19);
  if(error) throw new Error(error.message);
  return {rows:rows ?? [],count:count ?? 0};
 });
export const getBriefing = createServerFn({method:'GET'})
 .middleware([requireSupabaseAuth])
 .inputValidator((input:unknown) => z.object({id:z.string().uuid()}).parse(input))
 .handler(async ({data,context}) => {
  const {data:allowed,error:roleError} = await context.supabase.rpc('is_briefing_admin');
  if(roleError || !allowed) throw new Error('Acesso administrativo não autorizado.');
  const {data:briefing,error} = await context.supabase.from('briefings').select('*').eq('id',data.id).single();
  if(error) throw new Error('Briefing não encontrado ou indisponível.');
  let logoUrl: string | null = null;
  let logoError: string | null = null;
  if(briefing.logo_file) {
   let path=briefing.logo_file;
   if(path.startsWith('https://')) {
    try { const url=new URL(path); const marker='/storage/v1/object/public/logos/'; const offset=url.pathname.indexOf(marker); path=offset>=0 ? decodeURIComponent(url.pathname.slice(offset+marker.length)) : ''; } catch { path=''; }
   }
   if(path.startsWith('briefings/')) {
    const {data:signed,error:storageError}=await context.supabase.storage.from('logos').createSignedUrl(path,3600);
    logoUrl=signed?.signedUrl ?? null;
    if(storageError) logoError='Não foi possível recuperar esta logo.';
   } else logoError='Este briefing contém apenas o nome da imagem antiga; o arquivo precisa ser reenviado.';
  }
  return {briefing,logoUrl,logoError};
 });
export const updateBriefingStatus = createServerFn({method:'POST'})
 .middleware([requireSupabaseAuth])
 .inputValidator((input:unknown)=>z.object({id:z.string().uuid(),status:z.enum(statuses)}).parse(input))
 .handler(async ({data,context}) => {
  const {data:allowed,error:roleError} = await context.supabase.rpc('is_briefing_admin');
  if(roleError || !allowed) throw new Error('Acesso administrativo não autorizado.');
  const {data:updated,error}=await context.supabase.from('briefings').update({status:data.status}).eq('id',data.id).select('id,status').single();
  if(error) throw new Error(error.message);
  return updated;
 });
