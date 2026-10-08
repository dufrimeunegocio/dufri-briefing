import { createFileRoute, Outlet, redirect, Link, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AdminBrand } from '@/components/admin/shared';
import { LogOut, Files } from 'lucide-react';
export const Route=createFileRoute('/_admin')({
 ssr:false,
 beforeLoad:async()=>{
  const {data:{user},error}=await supabase.auth.getUser();
  if(error || !user) throw redirect({to:'/admin/login'});
  const {data:allowed,error:roleError}=await supabase.rpc('is_briefing_admin');
  if(roleError || !allowed) throw redirect({to:'/admin/login',search:{denied:true}});
  return {adminEmail:user.email ?? ''};
 },
 component:AdminLayout,
});
function AdminLayout(){
 const navigate=useNavigate(); const cache=useQueryClient(); const {adminEmail}=Route.useRouteContext();
 useEffect(()=>{const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){cache.clear(); void navigate({to:'/admin/login',replace:true});}}); return ()=>subscription.unsubscribe();},[navigate,cache]);
 async function logout(){await cache.cancelQueries(); cache.clear(); await supabase.auth.signOut(); await navigate({to:'/admin/login',replace:true});}
 return <div className="min-h-dvh bg-background"><header className="hidden border-b border-border bg-background md:block"><div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-8 py-5"><AdminBrand/><nav className="flex items-center gap-6"><Button asChild variant="ghost"><Link to="/admin"><Files/>Briefings</Link></Button><span className="max-w-64 truncate text-sm text-muted-foreground">{adminEmail}</span><Button variant="outline" onClick={logout}><LogOut/>Sair</Button></nav></div></header><aside className="fixed inset-y-0 left-0 z-20 flex w-16 flex-col items-center gap-6 border-r border-border bg-background py-5 md:hidden"><img src="/logo-dufri.jpeg" alt="Dufri" className="size-10 rounded-sm"/><Button asChild variant="ghost" size="icon" title="Briefings"><Link to="/admin" aria-label="Briefings"><Files/></Link></Button><Button className="mt-auto" variant="ghost" size="icon" title="Sair" aria-label="Sair" onClick={logout}><LogOut/></Button></aside><main className="ml-16 min-w-0 px-4 py-8 md:mx-auto md:max-w-6xl md:px-8 md:py-10"><Outlet/></main></div>;
}
