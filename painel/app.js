import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://nngvxucybligmanbedrs.supabase.co";
const SUPABASE_KEY = "sb_publishable_UhC5LHa4Ob5vSY4K5xrM5Q_LG3pllu-";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: true } });
let idleTimer = null;
const IDLE_MS = 15 * 60 * 1000; // 15 min sem atividade exige a senha de novo

const PACOTES = [
  { id: "cerimonia", nome: "Cerimônia" },
  { id: "rubi", nome: "Rubi" },
  { id: "diamante", nome: "Diamante" },
  { id: "alianca", nome: "Aliança" },
];
const STATUS = [["rascunho","Rascunho"],["enviada","Enviada"],["visualizada","Visualizada"],["negociando","Negociando"],["reservada","Reservada"],["fechada","Fechada"],["perdida","Perdida"]];
const MOTIVOS_PERDA = [["","Selecione o motivo"],["contato-invalido","Contato inválido (e-mail/telefone errado)"],["sem-retorno","Sem retorno"],["recusou","Recusou a proposta"],["fechou-outro","Fechou com outro"],["fora-orcamento","Fora do orçamento"],["mudou-data","Mudou a data ou desistiu do evento"],["outro","Outro"]];
function motivoPerdaTxt(v){ if(!v) return ""; const m=MOTIVOS_PERDA.find((x)=>x[0]===v); return m?m[1]:v; }
const MOTIVOS_BLOQUEIO = [["viagem","Viagem"],["ferias","Férias"],["compromisso","Compromisso"],["outro","Outro"]];
function motivoBloqueioTxt(v){ const m=MOTIVOS_BLOQUEIO.find((x)=>x[0]===v); return m?m[1]:(v||"Ocupado"); }
function bloqueioLabel(b){ return (b && b.titulo && b.titulo.trim()) ? b.titulo.trim() : motivoBloqueioTxt(b&&b.motivo); }
const DISP = [["available","Disponível"],["on_hold","Pré-reserva"],["unavailable","Indisponível"]];
const PAPEL = { owner: "Proprietário", admin: "Administrador", funcionario: "Funcionário" };
const LINK_BASE = "https://www.belluseventos.com.br/p/";
const NIVER_BASE = "https://www.belluseventos.com.br/niver/p/";
const BELLUS_EMAIL = "contato@belluseventos.com.br"; // remetente do botao de e-mail (abre o Gmail nessa conta)
const NIVER_PACOTES = [{id:"niver-esmeralda",nome:"Niver Esmeralda"},{id:"niver-rubi",nome:"Niver Rubi"},{id:"niver-diamante",nome:"Niver Diamante"}];
const isNiver = (pk)=> typeof pk==="string" && pk.indexOf("niver-")===0;
const propLink = (p)=> (p && isNiver(p.pacote_recomendado) ? NIVER_BASE : LINK_BASE) + (p ? p.slug : "");

const root = document.getElementById("root");
const state = { user: null, membro: null, view: "dashboard", propostas: [], agenda: [], leads: [], leadsUsados: new Set(), propByLead: {}, leadsOrigem: "tudo", leadsBusca: "", leadsPeriodo: "tudo", propPeriodo: "tudo", agendaPeriodo: "tudo", leadsMes: curYM(), propMes: curYM(), agendaMes: curYM(), leadsAno: curY(), propAno: curY(), agendaAno: curY(), calMes: curYM(), datasOcupadas: {}, bloqueios: [], datasBloqueadas: {}, syncMsg: "", prefillLead: null, editing: null, current: null, recovery: false, listaBusca: "" };

const esc = (s) => (s == null ? "" : String(s)).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
function slugify(s){ return (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40); }
function fmtData(d){ if(!d) return "Data a definir"; const [y,m,dd]=d.split("-"); return `${dd}/${m}/${y}`; }
function nomes(p){ return p.cliente_parceiro ? `${p.cliente_nome} & ${p.cliente_parceiro}` : p.cliente_nome; }
const statusTxt = (v) => (STATUS.find((s)=>s[0]===v)||[v,v])[1];
const dispTxt = (v) => (DISP.find((d)=>d[0]===v)||[v,""])[1];
const pacoteNome = (id) => (PACOTES.find((p)=>p.id===id)||{}).nome || "";
function setMsg(id,t,kind){ const el=document.getElementById(id); if(el){ el.textContent=t; el.className="msg "+(kind||""); } }
const isAdmin = () => ["owner","admin"].includes(state.membro?.papel);
function curYM(){ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"); }
function curY(){ return String(new Date().getFullYear()); }
function refDe(per, mes, ano){ return per==="mes"?mes:(per==="ano"?ano:null); }
function inPeriodo(dateStr, per, ref){
  if(!per || per==="tudo") return true;
  if(!dateStr) return false;
  const ymd=String(dateStr).slice(0,10);
  if(per==="mes") return ymd.slice(0,7)===ref;
  if(per==="ano") return ymd.slice(0,4)===ref;
  if(per==="semana"){
    const d=new Date(ymd+"T12:00:00"); if(isNaN(d.getTime())) return false;
    const now=new Date();
    const s=new Date(now); s.setDate(now.getDate()-now.getDay()); s.setHours(0,0,0,0);
    const e=new Date(s); e.setDate(s.getDate()+7);
    return d>=s && d<e;
  }
  return true;
}
function periodoBar(scope, tipo, mesRef, anoRef){
  tipo=tipo||"tudo";
  const opts=[["tudo","Tudo"],["semana","Semana"],["mes","Mês"],["ano","Ano"]];
  let extra="";
  if(tipo==="mes") extra=`<input type="month" class="per-pick per-mes" value="${esc(mesRef||curYM())}"/>`;
  else if(tipo==="ano"){ const y=new Date().getFullYear(); let o=""; for(let i=y+3;i>=y-3;i--){ o+=`<option value="${i}" ${String(i)===String(anoRef)?"selected":""}>${i}</option>`; } extra=`<select class="per-pick per-ano">${o}</select>`; }
  return `<div class="periodo" data-scope="${scope}">${opts.map((o)=>`<button type="button" class="per-btn${tipo===o[0]?" sel":""}" data-per="${o[0]}">${o[1]}</button>`).join("")}${extra}</div>`;
}
function mensagemAbertura(nome, parc, ocupada){
  nome=(nome||"").trim(); parc=(parc||"").trim();
  if(ocupada){
    if(nome && parc) return `${nome} e ${parc}, que alegria receber vocês por aqui! Preparei esta proposta com muito carinho, pensando em como podemos eternizar cada emoção do casamento de vocês, caso consigam ajustar a data para vivermos essa história juntos. Qualquer dúvida, estou à disposição.`;
    if(nome) return `${nome}, que alegria receber você por aqui! Preparei esta proposta com muito carinho, pensando em como podemos eternizar cada emoção do seu casamento, caso consiga ajustar a data para vivermos essa história juntos. Qualquer dúvida, estou à disposição.`;
    return `Que alegria receber vocês por aqui! Preparei esta proposta com muito carinho, pensando em como podemos eternizar cada emoção do casamento de vocês, caso consigam ajustar a data para vivermos essa história juntos. Qualquer dúvida, estou à disposição.`;
  }
  if(nome && parc) return `${nome} e ${parc}, que alegria receber vocês por aqui! Preparei esta proposta com todo o carinho para mostrar como a gente pode registrar cada emoção do casamento de vocês. Vejam com calma e, qualquer dúvida, é só me chamar.`;
  if(nome) return `${nome}, que alegria receber você por aqui! Preparei esta proposta com todo o carinho para mostrar como a gente pode registrar cada emoção do seu casamento. Veja com calma e, qualquer dúvida, é só me chamar.`;
  return `Que alegria receber vocês por aqui! Preparei esta proposta com todo o carinho para mostrar como a gente pode registrar cada emoção do casamento de vocês. Vejam com calma e, qualquer dúvida, é só me chamar.`;
}
function leadDataOcupada(d){ return !!(d && (state.datasOcupadas||{})[d]); }

// ---------- auth ----------
async function init(){
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) await loadMembro(data.session.user);
  render();
}
async function loadMembro(user){
  const { data } = await supabase.from("proposta_equipe").select("nome,papel,ativo").eq("id", user.id).maybeSingle();
  if (data && data.ativo){ state.user=user; state.membro=data; await loadPropostas(); await loadLeads(); await loadLeadsUsados(); await loadDatasOcupadas(); await loadBloqueios(); }
  else { await supabase.auth.signOut(); state.user=null; state.membro=null; }
}
async function doLogin(email, password){
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return "E-mail ou senha inválidos.";
  await loadMembro(data.user);
  if (!state.user) return "Este usuário não faz parte da equipe.";
  state.view="dashboard"; render(); armIdle(); return null;
}
async function doLogout(){ clearTimeout(idleTimer); idleTimer=null; await supabase.auth.signOut(); state.user=null; state.membro=null; render(); }
// auto-bloqueio: sem atividade por IDLE_MS, desloga e volta pra senha (evita painel aberto exposto)
function armIdle(){ clearTimeout(idleTimer); if(!state.user) return; idleTimer=setTimeout(function(){ idleTimer=null; if(state.user) doLogout(); }, IDLE_MS); }
["mousemove","keydown","mousedown","scroll","touchstart"].forEach(function(ev){ document.addEventListener(ev, armIdle, {passive:true}); });

// ---------- data ----------
async function loadPropostas(){
  const { data } = await supabase.from("propostas")
    .select("id,slug,status,cliente_nome,cliente_parceiro,cliente_email,cliente_telefone,evento_data,criado_em,enviada_em,visualizada_em,visualizacoes,pacote_recomendado,consultor,motivo_perda")
    .order("criado_em", { ascending: false });
  state.propostas = data || [];
}
async function loadLeads(){
  const { data } = await supabase.from("leads")
    .select("id,nome,nome_parceiro,email,whatsapp,data_casamento,local,cidade,convidados,mensagem,origem,created_at")
    .order("created_at", { ascending: false }).limit(100);
  state.leads = data || [];
}
async function loadLeadsUsados(){
  const { data } = await supabase.from("propostas").select("id,slug,status,lead_id").not("lead_id","is",null);
  state.leadsUsados = new Set((data||[]).map((r)=>r.lead_id).filter(Boolean));
  const m={}; (data||[]).forEach((r)=>{ if(r.lead_id && !m[r.lead_id]) m[r.lead_id]=r; });
  state.propByLead = m;
}
async function loadAgenda(){
  const { data } = await supabase.from("propostas")
    .select("id,slug,status,cliente_nome,cliente_parceiro,evento_data")
    .in("status", ["reservada","fechada"]).not("evento_data","is",null)
    .order("evento_data", { ascending: true });
  state.agenda = data || [];
}
async function loadDatasOcupadas(){
  const { data } = await supabase.from("propostas")
    .select("id,slug,status,cliente_nome,cliente_parceiro,evento_data")
    .in("status", ["reservada","fechada"]).not("evento_data","is",null);
  const map={};
  (data||[]).forEach((p)=>{ if(p.evento_data && !map[p.evento_data]) map[p.evento_data]={ id:p.id, slug:p.slug, status:p.status, nome:p.cliente_parceiro?(p.cliente_nome+" & "+p.cliente_parceiro):p.cliente_nome }; });
  state.datasOcupadas = map;
}
async function loadBloqueios(){
  const { data } = await supabase.from("agenda_bloqueios").select("*").order("data_inicio",{ascending:true});
  state.bloqueios = data || [];
  const map={};
  state.bloqueios.forEach((b)=>{
    const ini=b.data_inicio, fim=b.data_fim||b.data_inicio;
    if(!ini) return;
    let d=new Date(ini+"T00:00:00"); const e=new Date(fim+"T00:00:00");
    let g=0;
    while(d<=e && g<400){ const ymd=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; if(!map[ymd]) map[ymd]={id:b.id,motivo:b.motivo,titulo:b.titulo,label:bloqueioLabel(b)}; d.setDate(d.getDate()+1); g++; }
  });
  state.datasBloqueadas = map;
}
function dataBloqueada(d){ return (d && (state.datasBloqueadas||{})[d]) || null; }
async function getProposta(id){
  const { data } = await supabase.from("propostas").select("*").eq("id", id).maybeSingle();
  if (data){
    const { data: pgs } = await supabase.from("proposta_pagamentos").select("tipo,valor_centavos,metodo,status,criado_em,pago_em,pkg_id,parcelas").eq("proposta_id", id).order("criado_em",{ascending:true});
    data.pagamentos = pgs || [];
  }
  return data;
}
async function saveProposta(o, id){
  if (id){
    const { error } = await supabase.from("propostas").update({ ...o, atualizado_em: new Date().toISOString() }).eq("id", id);
    return error ? error.message : null;
  }
  const base = slugify(o.cliente_nome + (o.cliente_parceiro ? ("-e-"+o.cliente_parceiro) : "")) || "proposta";
  const slug = base + "-" + Math.random().toString(36).slice(2,6);
  const { error } = await supabase.from("propostas").insert({ ...o, slug, criado_por: state.user.id });
  return error ? error.message : null;
}
async function deleteProposta(id){
  const { error } = await supabase.from("propostas").delete().eq("id", id);
  return error ? error.message : null;
}
async function trocarSenha(novaSenha){
  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  return error ? error.message : null;
}

// ---------- navegação ----------
async function go(view){
  if (view === "lista" || view === "dashboard") await loadPropostas();
  if (view === "agenda") await loadAgenda();
  await Promise.all([loadLeads(), loadLeadsUsados(), loadDatasOcupadas(), loadBloqueios()]);
  state.view = view; render();
}
async function novaProposta(){ state.editing = null; await Promise.all([loadLeads(), loadDatasOcupadas(), loadBloqueios()]); state.view = "form"; render(); }
async function criarPropostaDeLead(id){ const lead=state.leads.find((x)=>x.id===id); state.editing=null; state.prefillLead=lead||null; await loadDatasOcupadas(); await loadBloqueios(); state.view="form"; render(); }
async function openProposta(id){ const p = await getProposta(id); if (p){ state.current = p; state.view = "detalhe"; render(); } }
async function editProposta(id){ const p = await getProposta(id); if (p){ state.editing = p; await loadDatasOcupadas(); await loadBloqueios(); state.view = "form"; render(); } }

// ---------- render ----------
function render(){
  if (state.recovery){ root.innerHTML = viewRecovery(); wire(); return; }
  if (!state.user){ renderLogin(); return; }
  let body;
  if (state.view==="form") body=viewForm();
  else if (state.view==="detalhe") body=viewDetalhe();
  else if (state.view==="conta") body=viewConta();
  else if (state.view==="agenda") body=viewAgenda();
  else if (state.view==="dashboard") body=viewDashboard();
  else if (state.view==="leads") body=viewLeads();
  else body=viewLista();
  const leadsNovos = state.leads.filter((l)=> !(state.leadsUsados||new Set()).has(l.id)).length;
  root.innerHTML = `
    <header class="topbar">
      <div class="left"><img src="logo_bellus.png" alt="Bellus"/><span class="who">Olá, <b>${esc(state.membro.nome)}</b> · ${PAPEL[state.membro.papel]||esc(state.membro.papel)}</span></div>
      <nav>
        <button class="btn btn-light" data-go="dashboard">Visão geral</button>
        <button class="btn btn-light" data-go="leads">Leads${leadsNovos>0?`<span class="nav-badge">${leadsNovos}</span>`:""}</button>
        <button class="btn btn-light" data-go="lista">Propostas</button>
        <button class="btn btn-light" data-go="agenda">Agenda</button>
        <button class="btn btn-light" data-go="conta">Trocar senha</button>
        <button class="btn btn-light" id="logout">Sair</button>
      </nav>
    </header>
    <div class="container">${body}</div>`;
  wire();
}
// ---------- helpers de tempo e contato ----------
function diasDesde(ts){ if(!ts) return null; return Math.floor((Date.now()-new Date(ts).getTime())/86400000); }
function desdeTxt(ts){ const d=diasDesde(ts); if(d==null) return ""; if(d<=0) return "hoje"; if(d===1) return "ontem"; return `há ${d} dias`; }
function fmtTs(ts){ if(!ts) return "—"; const dt=new Date(ts); const p=(n)=>String(n).padStart(2,"0"); return `${p(dt.getDate())}/${p(dt.getMonth()+1)}/${dt.getFullYear()}`; }
function tsRel(ts){ if(!ts) return "—"; return `${fmtTs(ts)} (${desdeTxt(ts)})`; }
function waDigits(tel){ const d=(tel||"").replace(/\D/g,""); if(!d) return ""; return d.length<=11 ? "55"+d : d; }
function primeiroNome(p){ const n=(p.cliente_nome||"").trim(); return n.split(/\s+/)[0]||n; }
function dataLongaP(d){ if(!d) return ""; const M=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"]; const x=String(d).slice(0,10).split("-"); if(x.length!==3) return fmtData(d); return parseInt(x[2],10)+" de "+M[parseInt(x[1],10)-1]+" de "+x[0]; }
// Parágrafo de prova personalizada (some inteiro se não houver data/local/convidados)
function propMeio(p){
  const imaginar=isNiver(p.pacote_recomendado)?"você imaginou":"vocês imaginaram";
  const partes=[];
  if(p.evento_data) partes.push("pro dia "+dataLongaP(p.evento_data));
  if(p.evento_local) partes.push("no "+p.evento_local);
  if(p.evento_convidados) partes.push("pra receber "+p.evento_convidados+" convidados");
  if(!partes.length) return "";
  return "Pensei cada detalhe "+partes.join(", ")+(partes.length>1?", ":" ")+"do jeito que "+imaginar+".";
}
// Blocos de texto que mudam entre casamento e aniversario
function propPartes(p){
  const aniv=isNiver(p.pacote_recomendado);
  return {
    pediram: aniv ? "Você pediu a disponibilidade pelo nosso site, e eu separei um tempo pra montar essa proposta pensando só em você." : "Vocês pediram a disponibilidade pelo nosso site, e eu separei um tempo pra montar essa proposta pensando só em vocês.",
    pronta: aniv ? "A proposta do filme da sua festa já está pronta." : "A proposta do filme de casamento de vocês já está pronta.",
    hook: "No dia, com tanta coisa acontecendo ao mesmo tempo, é impossível estar em todos os cantos. As reações dos convidados, os detalhes, os momentos que escapam no meio da emoção. A Bellus registra cada um deles pra "+(aniv?"você reviver":"vocês reviverem")+" exatamente como aconteceu.",
    posse: aniv ? "A sua proposta" : "A proposta de vocês",
    fecho: aniv ? "Sem pressa. Depois que olhar, me conta o que sentiu. Fico por aqui." : "Sem pressa. Depois que olharem, me contem o que sentiram. Fico por aqui."
  };
}
// Pede com carinho as infos faltantes (data/cidade/local/convidados) p/ fechar valores e logística
function propPedido(p){
  const f=[];
  if(!p.evento_data) f.push("a data");
  if(!p.evento_cidade) f.push("a cidade");
  if(!p.evento_local) f.push("o local");
  if(!p.evento_convidados) f.push("a quantidade de convidados");
  if(!f.length) return "";
  const lista = f.length===1 ? f[0] : f.slice(0,-1).join(", ")+" e "+f[f.length-1];
  const aniv=isNiver(p.pacote_recomendado);
  const base = !p.evento_cidade
    ? "Pra eu te passar os valores exatos e calcular a logística de deslocamento até o evento, você consegue me confirmar "
    : "Pra eu deixar a proposta com tudo exato, você consegue me confirmar ";
  return base + lista + "? Com isso eu atualizo a proposta certinho pra " + (aniv?"você":"vocês") + ".";
}
function waMsg(p){
  const primeiro=primeiroNome(p); const link=propLink(p); const quem=p.consultor||"Thiago Rodrigues";
  const meio=propMeio(p); const pp=propPartes(p);
  if(p.status==="visualizada") return `Oi ${primeiro}! Aqui é o ${quem}, da Bellus Eventos. Vi que você deu uma olhada na proposta. Posso tirar alguma dúvida ou ajustar algum ponto?\n\n${link}`;
  if(p.status==="negociando") return `Oi ${primeiro}! Aqui é o ${quem}, da Bellus Eventos. Dando sequência à nossa conversa, qualquer dúvida estou por aqui.\n\n${link}`;
  if(p.status==="reservada"||p.status==="fechada") return `Oi ${primeiro}! Aqui é o ${quem}, da Bellus Eventos. Que alegria ter você com a gente! Vamos alinhar os próximos passos?`;
  const L=[`${primeiro}, aqui é o ${quem}, da Bellus Eventos.`, ``];
  if(meio) L.push(meio);
  L.push(pp.pediram);
  L.push(pp.pronta);
  L.push(``); L.push(pp.hook);
  L.push(``); L.push(pp.posse+" está aqui, pronta pra ver com calma");
  L.push(``); L.push(link);
  const ped=propPedido(p); if(ped){ L.push(``); L.push(ped); }
  L.push(``); L.push(pp.fecho);
  return L.join("\n");
}
function waLink(p){ const d=waDigits(p.cliente_telefone); return d ? `https://wa.me/${d}?text=${encodeURIComponent(waMsg(p))}` : ""; }
function emailData(p){
  if(!p.cliente_email) return null;
  const primeiro=primeiroNome(p); const link=propLink(p); const quem=p.consultor||"Thiago Rodrigues";
  const aniv=isNiver(p.pacote_recomendado); const meio=propMeio(p); const pp=propPartes(p);
  const su = aniv ? `${primeiro}, a proposta do filme da sua festa está pronta` : `${primeiro}, a proposta do filme de casamento de vocês está pronta`;
  const L=[`Oi, ${primeiro}.`, ``, `Aqui é o ${quem}, da Bellus Eventos.`, ``];
  if(meio) L.push(meio);
  L.push(pp.pediram);
  L.push(pp.pronta);
  L.push(``); L.push(pp.hook);
  L.push(``); L.push(pp.posse+" está aqui, pronta pra ver com calma");
  L.push(``); L.push(link);
  const ped=propPedido(p); if(ped){ L.push(``); L.push(ped); }
  L.push(``); L.push(pp.fecho);
  L.push(``); L.push(quem); L.push(`Bellus Eventos`);
  return { to:p.cliente_email, nome:(p.cliente_nome||""), su:su, corpo:L.join("\n") };
}
function emailBtnHtml(ed){
  if(!ed) return "";
  return `<a class="cbtn em" href="#" data-emailbtn data-to="${esc(ed.to)}" data-nome="${esc(ed.nome)}" data-su="${esc(ed.su)}" data-body="${esc(ed.corpo)}">E-mail</a>`;
}
function contatoBtns(p){
  const wl=waLink(p);
  return (wl?`<a class="cbtn wa" href="${esc(wl)}" target="_blank" rel="noopener">WhatsApp</a>`:"")
       + emailBtnHtml(emailData(p));
}
function detContato(p){
  const wl=waLink(p);
  const emailCell = esc(p.cliente_email||"—");
  const telCell = wl ? `<a href="${esc(wl)}" target="_blank" rel="noopener">${esc(p.cliente_telefone)}</a>` : esc(p.cliente_telefone||"—");
  return `<div class="section-label">Cliente</div>
  <div class="detbox">
    <div class="drow"><span>E-mail</span><b>${emailCell}</b></div>
    <div class="drow"><span>WhatsApp</span><b>${telCell}</b></div>
  </div>
  <div class="contato-acoes">${contatoBtns(p)}</div>`;
}
// ---------- modal de e-mail (copiar e colar no Gmail) ----------
function emailCopiar(txt,btn){
  const orig=btn.textContent;
  const ok=()=>{ btn.textContent="Copiado!"; setTimeout(()=>{ btn.textContent=orig; },1500); };
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(ok).catch(()=>window.prompt("Copie:",txt)); }
  else window.prompt("Copie:",txt);
}
function fecharEmailModal(){ const o=document.getElementById("emailov"); if(o)o.remove(); document.body.style.overflow=""; }
function abrirEmailModal(d){
  fecharEmailModal();
  const campo=(id,label,val,multi)=>{
    const ctrl = multi
      ? `<textarea id="${id}" readonly rows="11" style="width:100%;font:inherit;padding:.6rem;border:1px solid #d8cfc2;border-radius:8px;resize:vertical;background:#fbf9f6">${esc(val)}</textarea>`
      : `<input id="${id}" readonly value="${esc(val)}" style="width:100%;font:inherit;padding:.5rem;border:1px solid #d8cfc2;border-radius:8px;background:#fbf9f6"/>`;
    return `<div style="margin-bottom:.9rem"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem"><span style="font-size:.74rem;color:#7e7367;text-transform:uppercase;letter-spacing:.04em">${esc(label)}</span><button type="button" class="btn btn-ghost btn-mini" data-cp="${id}">Copiar</button></div>${ctrl}</div>`;
  };
  const ov=document.createElement("div"); ov.id="emailov";
  ov.setAttribute("style","position:fixed;inset:0;background:rgba(20,16,12,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem");
  ov.innerHTML=`<div role="dialog" aria-modal="true" style="background:#fff;max-width:580px;width:100%;max-height:92vh;overflow:auto;border-radius:14px;padding:1.4rem;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.3)">`
    +`<button type="button" id="emailx" aria-label="Fechar" style="position:absolute;top:.5rem;right:.8rem;background:none;border:none;font-size:1.7rem;line-height:1;cursor:pointer;color:#7e7367">&times;</button>`
    +`<h3 style="margin:0 0 .2rem;font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:500">Enviar por e-mail</h3>`
    +`<p style="margin:0 0 1.1rem;font-size:.85rem;color:#7e7367;line-height:1.5">Abra o seu Gmail, comece um e-mail novo e cole cada parte. É só tocar em Copiar.</p>`
    +campo("ef-to","E-mail do cliente (Para)",d.to||"")
    +campo("ef-nome","Nome",d.nome||"")
    +campo("ef-su","Assunto",d.su||"")
    +campo("ef-body","Mensagem",d.body||"",true)
    +`</div>`;
  document.body.appendChild(ov); document.body.style.overflow="hidden";
  document.getElementById("emailx").addEventListener("click",fecharEmailModal);
  ov.addEventListener("click",(e)=>{ if(e.target===ov) fecharEmailModal(); });
  ov.querySelectorAll("[data-cp]").forEach((b)=>b.addEventListener("click",()=>{ const el=document.getElementById(b.getAttribute("data-cp")); if(el) emailCopiar(el.value,b); }));
}
document.addEventListener("click",(e)=>{
  const b=e.target&&e.target.closest?e.target.closest("[data-emailbtn]"):null;
  if(!b) return; e.preventDefault();
  abrirEmailModal({ to:b.getAttribute("data-to"), nome:b.getAttribute("data-nome"), su:b.getAttribute("data-su"), body:b.getAttribute("data-body") });
});
// ---------- salvar + modal de motivo da perda (abre ao salvar como Perdida) ----------
async function finalizarProposta(o){
  const btn=document.getElementById("salvar"); if(btn){ btn.disabled=true; btn.textContent="Salvando..."; }
  const err = await saveProposta(o, state.editing?.id || null);
  if (err){ if(btn){ btn.disabled=false; btn.textContent="Salvar"; } return setMsg("form-msg","Erro ao salvar: "+err,"err"); }
  state.editing=null; go("lista");
}
function fecharMotivoModal(){ const o=document.getElementById("motivoov"); if(o)o.remove(); document.body.style.overflow=""; }
function abrirMotivoModal(onPick){
  fecharMotivoModal();
  const opts = MOTIVOS_PERDA.filter((m)=>m[0]).map((m)=>`<button type="button" class="btn btn-ghost" data-mp="${esc(m[0])}" style="display:block;width:100%;text-align:left;margin-bottom:.5rem;padding:.7rem .9rem;cursor:pointer">${esc(m[1])}</button>`).join("");
  const ov=document.createElement("div"); ov.id="motivoov";
  ov.setAttribute("style","position:fixed;inset:0;background:rgba(20,16,12,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem");
  ov.innerHTML=`<div role="dialog" aria-modal="true" style="background:#fff;max-width:460px;width:100%;max-height:90vh;overflow:auto;border-radius:14px;padding:1.4rem;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.3)">`
    +`<h3 style="margin:0 0 .3rem;font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:500">Por que essa proposta foi perdida?</h3>`
    +`<p style="margin:0 0 1rem;font-size:.85rem;color:#7e7367">Toque no motivo para registrar e salvar.</p>`
    +opts
    +`</div>`;
  document.body.appendChild(ov); document.body.style.overflow="hidden";
  ov.addEventListener("click",(e)=>{ if(e.target===ov) fecharMotivoModal(); });
  ov.querySelectorAll("[data-mp]").forEach((b)=>b.addEventListener("click",()=>{ const v=b.getAttribute("data-mp"); fecharMotivoModal(); onPick(v); }));
}
// ---------- dashboard ----------
let dashCharts = [];
async function renderCharts(){
  const host = document.getElementById("dash-charts");
  if(!host) return;
  dashCharts.forEach((c)=>{ try{ c.destroy(); }catch(e){} });
  dashCharts = [];
  const ps = state.propostas;
  if(!ps.length && !state.leads.length){ host.style.display="none"; return; }
  host.style.display="";
  let Chart;
  try { Chart = (await import("https://esm.sh/chart.js@4/auto")).default; }
  catch(e){ host.innerHTML = '<p class="muted">Não foi possível carregar os gráficos agora.</p>'; return; }
  const GREEN="#1d7a4f", GOLD="#b49764", REDISH="#c79a9a", LINE="rgba(126,115,103,.14)";
  Chart.defaults.font.family = "Montserrat, system-ui, sans-serif";
  Chart.defaults.color = "#7e7367";
  const won=(s)=> s==="reservada"||s==="fechada";
  const lost=(s)=> s==="perdida";
  const mk=[...new Set(ps.map((p)=>(p.criado_em||"").slice(0,7)).filter((x)=>/^\d{4}-\d{2}$/.test(x)))].sort();
  const lab=mk.map((k)=>{ const p=k.split("-"); return (MESES[+p[1]-1]||"").slice(0,3)+"/"+p[0].slice(2); });
  const inM=(k)=>ps.filter((p)=>(p.criado_em||"").slice(0,7)===k);
  dashCharts.push(new Chart(document.getElementById("ch-mes"), {
    type:"bar",
    data:{ labels:lab, datasets:[
      {label:"Fechadas/Reservadas",data:mk.map((k)=>inM(k).filter((p)=>won(p.status)).length),backgroundColor:GREEN},
      {label:"Em andamento",data:mk.map((k)=>inM(k).filter((p)=>!won(p.status)&&!lost(p.status)).length),backgroundColor:GOLD},
      {label:"Perdidas",data:mk.map((k)=>inM(k).filter((p)=>lost(p.status)).length),backgroundColor:REDISH},
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{boxWidth:12,font:{size:11}}}},scales:{x:{grid:{display:false}},y:{beginAtZero:true,ticks:{precision:0},grid:{color:LINE}}}}
  }));
  const so=["rascunho","enviada","visualizada","negociando","reservada","fechada","perdida"];
  const sc={rascunho:"#cfc8bd",enviada:"#86c79a",visualizada:"#e3c34a",negociando:"#9a7b32",reservada:"#e0883a",fechada:"#145e3c",perdida:"#a85454"};
  const sUsed=so.filter((s)=>ps.some((p)=>p.status===s));
  dashCharts.push(new Chart(document.getElementById("ch-status"), {
    type:"doughnut",
    data:{ labels:sUsed.map((s)=>statusTxt(s)), datasets:[{data:sUsed.map((s)=>ps.filter((p)=>p.status===s).length),backgroundColor:sUsed.map((s)=>sc[s]),borderWidth:2,borderColor:"#fff"}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:"58%",plugins:{legend:{position:"right",labels:{boxWidth:12,font:{size:11}}}}}
  }));
  const env=ps.filter((p)=>p.enviada_em).length, vis=ps.filter((p)=>p.visualizada_em).length, gan=ps.filter((p)=>won(p.status)).length;
  dashCharts.push(new Chart(document.getElementById("ch-funil"), {
    type:"bar",
    data:{ labels:["Enviadas","Visualizadas","Reservadas/Fechadas"], datasets:[{data:[env,vis,gan],backgroundColor:["#86c79a","#e3c34a","#145e3c"],borderRadius:4}]},
    options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{precision:0},grid:{color:LINE}},y:{grid:{display:false}}}}
  }));
  const elLeads=document.getElementById("ch-leads");
  if(elLeads && state.leads.length){
    const usados=state.leadsUsados||new Set();
    const lmk=[...new Set(state.leads.map((l)=>(l.created_at||"").slice(0,7)).filter((x)=>/^\d{4}-\d{2}$/.test(x)))].sort();
    const llab=lmk.map((k)=>{ const p=k.split("-"); return (MESES[+p[1]-1]||"").slice(0,3)+"/"+p[0].slice(2); });
    const inL=(k,used)=>state.leads.filter((l)=>(l.created_at||"").slice(0,7)===k && usados.has(l.id)===used).length;
    dashCharts.push(new Chart(elLeads, {
      type:"bar",
      data:{ labels:llab, datasets:[
        {label:"Viraram proposta",data:lmk.map((k)=>inL(k,true)),backgroundColor:GREEN},
        {label:"Ainda sem proposta",data:lmk.map((k)=>inL(k,false)),backgroundColor:GOLD},
      ]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{boxWidth:12,font:{size:11}}}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,beginAtZero:true,ticks:{precision:0},grid:{color:LINE}}}}
    }));
  }
  // perdemos por que (motivo da perda)
  const perdidas = ps.filter((p)=>lost(p.status));
  const elPerda = document.getElementById("ch-perda");
  if(elPerda){
    if(perdidas.length){
      const counts = {};
      perdidas.forEach((p)=>{ const k=p.motivo_perda||"sem-motivo"; counts[k]=(counts[k]||0)+1; });
      const keys = Object.keys(counts).sort((a,b)=>counts[b]-counts[a]);
      const labels = keys.map((k)=> k==="sem-motivo" ? "Sem motivo informado" : motivoPerdaTxt(k));
      dashCharts.push(new Chart(elPerda, {
        type:"bar",
        data:{ labels:labels, datasets:[{data:keys.map((k)=>counts[k]),backgroundColor:REDISH,borderRadius:4}]},
        options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{precision:0},grid:{color:LINE}},y:{grid:{display:false}}}}
      }));
    } else {
      const box=elPerda.closest(".chart-box"); if(box) box.innerHTML='<p class="muted" style="padding:1rem;text-align:center">Nenhuma proposta perdida ainda. Quando houver, o motivo aparece aqui.</p>';
    }
  }
}
async function renderMovimentacoes(){
  const host = document.getElementById("mov-list");
  if(!host) return;
  let data;
  try {
    const r = await supabase.from("proposta_eventos")
      .select("status_anterior,status_novo,criado_em,propostas(cliente_nome,cliente_parceiro)")
      .order("criado_em",{ascending:false}).limit(5);
    data = r.data;
  } catch(e){ host.innerHTML='<p class="muted">Não foi possível carregar as movimentações.</p>'; return; }
  if(!data || !data.length){ host.innerHTML='<p class="muted">Sem movimentações registradas ainda. A partir de agora, cada mudança de status fica registrada aqui.</p>'; return; }
  host.innerHTML = data.map((e)=>{
    const pr = e.propostas || {};
    const nome = pr.cliente_parceiro ? (pr.cliente_nome+" & "+pr.cliente_parceiro) : (pr.cliente_nome||"—");
    const trans = e.status_anterior ? (statusTxt(e.status_anterior)+" → "+statusTxt(e.status_novo)) : ("Nova · "+statusTxt(e.status_novo));
    return `<div class="mov-row"><span class="mov-nome">${esc(nome)}</span><span class="mov-trans">${esc(trans)}</span><span class="mov-data">${esc(desdeTxt(e.criado_em))}</span></div>`;
  }).join("");
}
function viewDashboard(){
  const ps=state.propostas;
  const by=(s)=>ps.filter((p)=>p.status===s).length;
  const cards=[["Total",ps.length,"tot"],["Enviadas",by("enviada"),"enviada"],["Visualizadas",by("visualizada"),"visualizada"],["Negociando",by("negociando"),"negociando"],["Reservadas",by("reservada"),"reservada"],["Fechadas",by("fechada"),"fechada"]];
  const cardsHTML=cards.map((c)=>`<div class="dcard ${c[2]}"><div class="dnum">${c[1]}</div><div class="dlab">${esc(c[0])}</div></div>`).join("");
  const ordem={visualizada:0,negociando:1,enviada:2};
  const followup=ps.filter((p)=>p.status in ordem).sort((a,b)=> (ordem[a.status]-ordem[b.status]) || ((diasDesde(b.enviada_em)||0)-(diasDesde(a.enviada_em)||0)));
  const fuRows=followup.map((p)=>{
    const visto = p.visualizada_em ? `<span class="ok">Visualizou ${desdeTxt(p.visualizada_em)}</span>` : `<span class="wait">Ainda não abriu</span>`;
    return `<div class="furow">
      <div class="fu-main" data-open="${p.id}">
        <div class="fu-nome">${esc(nomes(p))}</div>
        <div class="fu-meta"><span class="badge ${esc(p.status)}">${esc(statusTxt(p.status))}</span> Enviada ${desdeTxt(p.enviada_em)} · ${visto}</div>
      </div>
      <div class="fu-acoes">${contatoBtns(p)}</div>
    </div>`;
  }).join("");
  const env=ps.filter((p)=>p.enviada_em).length, vis=ps.filter((p)=>p.visualizada_em).length, gan=ps.filter((p)=>["reservada","fechada"].includes(p.status)).length;
  const txAb=env?Math.round(vis/env*100):0, txFe=env?Math.round(gan/env*100):0;
  const fuBlock = followup.length ? `<div class="furows">${fuRows}</div>` : `<div class="empty"><p>Nenhuma proposta aguardando follow-up agora.</p></div>`;
  const usadosSet=state.leadsUsados||new Set();
  const leadsNovos = state.leads.filter((l)=> !usadosSet.has(l.id)).length;
  const leadsBanner = leadsNovos>0 ? `<button class="leads-banner" data-go="leads"><span class="lb-dot"></span><span class="lb-txt"><b>${leadsNovos}</b> ${leadsNovos===1?"lead novo aguardando proposta":"leads novos aguardando proposta"}</span><span class="lb-go">Ver leads</span></button>` : "";
  const totLeads=state.leads.length, leadsConv=state.leads.filter((l)=>usadosSet.has(l.id)).length;
  const _now=new Date(), _ym=_now.getFullYear()+"-"+String(_now.getMonth()+1).padStart(2,"0");
  const leadsMes=state.leads.filter((l)=>(l.created_at||"").slice(0,7)===_ym).length;
  const txLeadConv=totLeads?Math.round(leadsConv/totLeads*100):0;
  const leadsStat = totLeads ? `<p class="muted" style="margin:.1rem 0 1.2rem">Entrada de leads: <b>${totLeads}</b> no total · <b>${leadsMes}</b> este mês · <b>${leadsConv}</b> viraram proposta (${txLeadConv}%).</p>` : "";
  return `
  <div class="page-head"><h2 class="serif">Visão geral</h2><button class="btn btn-primary" data-nova>Nova proposta</button></div>
  ${avisoCasamentoHtml()}
  ${leadsBanner}
  ${leadsStat}
  <div class="dcards">${cardsHTML}</div>
  <div class="section-label" style="margin-top:1.8rem">Gráficos</div>
  <div class="dcharts" id="dash-charts">
    <div class="chart-card chart-wide"><div class="chart-title">Propostas por mês</div><div class="chart-box"><canvas id="ch-mes"></canvas></div></div>
    <div class="chart-card"><div class="chart-title">Distribuição por status</div><div class="chart-box"><canvas id="ch-status"></canvas></div></div>
    <div class="chart-card"><div class="chart-title">Funil de conversão</div><div class="chart-box"><canvas id="ch-funil"></canvas></div></div>
    <div class="chart-card chart-wide"><div class="chart-title">Entrada de leads (por mês)</div><div class="chart-box"><canvas id="ch-leads"></canvas></div></div>
    <div class="chart-card chart-wide"><div class="chart-title">Por que perdemos</div><div class="chart-box"><canvas id="ch-perda"></canvas></div></div>
  </div>
  <div class="section-label" style="margin-top:1.8rem">Conversão e movimentação</div>
  <div class="conv-metrics">
    <div class="conv-card"><div class="conv-num">${txAb}%</div><div class="conv-lab">Taxa de abertura</div><div class="conv-sub">visualizadas ÷ enviadas</div></div>
    <div class="conv-card"><div class="conv-num">${txFe}%</div><div class="conv-lab">Taxa de fechamento</div><div class="conv-sub">reservadas/fechadas ÷ enviadas</div></div>
  </div>
  <p class="muted" style="margin:1rem 0 .6rem">Últimas mudanças de status</p>
  <div class="mov-list" id="mov-list"><p class="muted">Carregando...</p></div>
  <div class="section-label" style="margin-top:1.8rem">Follow-up · ${followup.length} ${followup.length===1?"precisa":"precisam"} de atenção</div>
  <p class="muted" style="margin:-.4rem 0 1rem">Aqui aparecem só as que precisam de ação agora (de ${ps.length} no total; veja todas em Propostas). Por prioridade: visualizou e não reservou, depois ainda não abriu.</p>
  ${fuBlock}
  <div class="section-label" style="margin-top:1.8rem">Agenda do mês</div>
  ${renderCalendario(state.calMes)}`;
}
// ---------- recuperação de senha ----------
async function enviarRecuperacao(email){
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: "https://www.belluseventos.com.br/painel/" });
  return error ? error.message : null;
}
function viewRecovery(){
  return `
  <div class="login"><main class="card">
    <div class="brand"><img src="logo_bellus.png" alt="Bellus Eventos"/><p class="eyebrow">Bellus Eventos</p><h1>Nova senha</h1></div>
    <form id="recovery-form">
      <label><span>Defina a nova senha</span><input id="rec-pass" type="password" required autocomplete="new-password" placeholder="Escolha a sua senha"/></label>
      <button class="btn btn-primary" type="submit" id="rec-btn" style="width:100%;margin-top:1.2rem;min-height:3.1rem">Salvar nova senha</button>
      <p class="msg" id="rec-msg" style="text-align:center"></p>
    </form>
  </main></div>`;
}
const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
function mesAno(k){ if(!/^\d{4}-\d{2}$/.test(k)) return "Sem data"; const p=k.split("-"); const m=MESES[parseInt(p[1],10)-1]||""; return m.charAt(0).toUpperCase()+m.slice(1)+" de "+p[0]; }
function propRow(p){
  return `<div class="pitem" data-open="${p.id}" style="cursor:pointer"><div><div class="nome">${esc(nomes(p))}</div><div class="meta">${fmtData(p.evento_data)} · ${esc(p.slug)}</div></div><span class="badge ${esc(p.status)}">${esc(statusTxt(p.status))}</span></div>`;
}
// ---------- calendario e proximos casamentos ----------
function diasAte(d){ if(!d) return null; const h=new Date(); h.setHours(0,0,0,0); const e=new Date(d+"T00:00:00"); if(isNaN(e.getTime())) return null; return Math.round((e-h)/86400000); }
function quandoTxt(n){ return n==null?"":n<0?"realizado":n===0?"é hoje":n===1?"é amanhã":`faltam ${n} dias`; }
function eventosAgenda(){
  const m=state.datasOcupadas||{};
  return Object.keys(m).map((d)=>({ data:d, id:m[d].id, slug:m[d].slug, status:m[d].status, nome:m[d].nome })).sort((a,b)=>a.data<b.data?-1:1);
}
function proximosCasamentos(){ return eventosAgenda().filter((e)=>{ const n=diasAte(e.data); return n!=null && n>=0; }); }
function avisoCasamentoHtml(){
  const prox=proximosCasamentos(); if(!prox.length) return "";
  const e=prox[0]; const n=diasAte(e.data); const urg=n<=30;
  return `<button class="cas-alert${urg?" urg":""}" data-open="${esc(e.id)}">
    <span class="ca-dot"></span>
    <span class="ca-txt"><b>Próximo casamento:</b> ${esc(e.nome)} — ${esc(fmtData(e.data))} (${quandoTxt(n)}).${urg?" Programe-se com antecedência.":""}</span>
    <span class="ca-go">Ver proposta</span>
  </button>`;
}
function calNavYM(ym, delta){ const [y,m]=ym.split("-").map(Number); const d=new Date(y, m-1+delta, 1); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"); }
function renderCalendario(ym){
  if(!/^\d{4}-\d{2}$/.test(ym)) ym=curYM();
  const [y,m]=ym.split("-").map(Number);
  const startDow=new Date(y,m-1,1).getDay();
  const daysInMonth=new Date(y,m,0).getDate();
  const td=new Date(); const hojeYmd=`${td.getFullYear()}-${String(td.getMonth()+1).padStart(2,"0")}-${String(td.getDate()).padStart(2,"0")}`;
  const dows=["dom","seg","ter","qua","qui","sex","sáb"];
  let cells="";
  for(let i=0;i<startDow;i++) cells+=`<div class="cal-cell empty"></div>`;
  for(let d=1; d<=daysInMonth; d++){
    const ymd=`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const ev=(state.datasOcupadas||{})[ymd];
    const bl=!ev?(state.datasBloqueadas||{})[ymd]:null;
    const cls=["cal-cell"]; if(ev) cls.push("has-ev", ev.status); else if(bl) cls.push("has-ev","bloqueio"); if(ymd===hojeYmd) cls.push("hoje");
    const primeiro=ev?(ev.nome||"").split(" & ")[0].split(" ")[0]:(bl?(bl.label||"Ocupado"):"");
    const attr=ev?`data-open="${esc(ev.id)}" title="${esc(ev.nome)} · ${esc(statusTxt(ev.status))}"`:(bl?`title="Ocupado · ${esc(bl.label||motivoBloqueioTxt(bl.motivo))}"`:"");
    cells+=`<div class="${cls.join(" ")}" ${attr}><span class="cal-d">${d}</span>${(ev||bl)?`<span class="cal-ev">${esc(primeiro)}</span>`:""}</div>`;
  }
  return `<div class="cal">
    <div class="cal-head"><button class="cal-nav" data-cal-delta="-1" type="button" aria-label="Mês anterior">‹</button><div class="cal-title">${esc(mesAno(ym))}</div><button class="cal-nav" data-cal-delta="1" type="button" aria-label="Próximo mês">›</button></div>
    <div class="cal-grid cal-dows">${dows.map((x)=>`<div class="cal-dow">${x}</div>`).join("")}</div>
    <div class="cal-grid cal-days">${cells}</div>
    <div class="cal-legend"><span class="cl-item"><span class="cl-dot reservada"></span>Reservada</span><span class="cl-item"><span class="cl-dot fechada"></span>Fechada</span><span class="cl-item"><span class="cl-dot bloqueio"></span>Ocupado</span><span class="cl-item"><span class="cl-dot hoje-mk"></span>Hoje</span></div>
  </div>`;
}
function proximosBlockHtml(max){
  const prox=proximosCasamentos(); if(!prox.length) return "";
  const lista=prox.slice(0, max||5).map((e)=>{ const n=diasAte(e.data); const urg=n<=30;
    return `<div class="prox-item${urg?" urg":""}" data-open="${esc(e.id)}">
      <div class="px-data"><b>${esc(fmtData(e.data))}</b><small>${quandoTxt(n)}</small></div>
      <div class="px-nome">${esc(e.nome)} <span class="badge ${esc(e.status)}">${esc(statusTxt(e.status))}</span></div>
      <span class="px-go">Ver proposta</span>
    </div>`; }).join("");
  return `<div class="prox-list">${lista}</div>`;
}
function listaContHTML(q){
  q=(q||"").trim().toLowerCase();
  const per=state.propPeriodo, ref=refDe(per, state.propMes, state.propAno);
  const ps=state.propostas.filter((p)=> inPeriodo(p.criado_em, per, ref) && (!q || [p.cliente_nome,p.cliente_parceiro,p.cliente_email,p.slug].some((x)=>(x||"").toLowerCase().includes(q))));
  if(!ps.length) return `<div class="empty"><p>${(q||per!=="tudo")?"Nada encontrado para este filtro.":"Nenhuma proposta ainda."}</p></div>`;
  const groups={};
  ps.forEach((p)=>{ const k=(p.criado_em||"").slice(0,7); (groups[k]=groups[k]||[]).push(p); });
  return Object.keys(groups).sort().reverse().map((k)=>{
    const it=groups[k];
    return `<div class="month-group"><div class="month-head">${esc(mesAno(k))} · ${it.length} ${it.length===1?"proposta":"propostas"}</div><div class="plist">${it.map(propRow).join("")}</div></div>`;
  }).join("");
}
function viewLista(){
  const head=`<div class="page-head"><h2 class="serif">Propostas</h2><button class="btn btn-primary" data-nova>Nova proposta</button></div>`;
  if(!state.propostas.length) return head+`<div class="empty"><p>Nenhuma proposta ainda.</p><button class="btn btn-primary" data-nova>Criar a primeira</button></div>`;
  return head+periodoBar("prop",state.propPeriodo,state.propMes,state.propAno)+`<input class="lista-busca" id="lista-busca" type="search" placeholder="Buscar por nome, e-mail ou link..." value="${esc(state.listaBusca||"")}" autocomplete="off"/><div id="lista-cont">${listaContHTML(state.listaBusca||"")}</div>`;
}
function field(label, name, opts={}){
  const { type="text", req=false, ph="", val="", textarea=false, select=null } = opts;
  const lab = `<span>${label}${req?' <i>*</i>':''}</span>`;
  if (select) return `<label class="field">${lab}<select name="${name}">${select.map((o)=>`<option value="${esc(o[0])}" ${o[0]===val?"selected":""}>${esc(o[1])}</option>`).join("")}</select></label>`;
  if (textarea) return `<label class="field">${lab}<textarea name="${name}" rows="3" placeholder="${esc(ph)}">${esc(val)}</textarea></label>`;
  return `<label class="field">${lab}<input name="${name}" type="${type}" ${req?"required":""} placeholder="${esc(ph)}" value="${esc(val)}"/></label>`;
}
function origemTxt(o){ return o==="site-bellus" ? "Site Bellus" : o==="noiva-dos-sonhos" ? "Noiva dos Sonhos" : (o||"Lead"); }
function leadPickerHTML(){
  if (!state.leads.length) return `<div class="lead-pick"><div class="section-label">Puxar de um lead</div><p class="lead-empty">Nenhum lead ainda. Os contatos do site institucional e da Noiva dos Sonhos aparecem aqui automaticamente.</p></div>`;
  return `<div class="lead-pick"><div class="section-label">Puxar de um lead</div>`+
    `<input class="lead-search" id="lead-search" type="search" placeholder="Buscar por nome, e-mail ou cidade..." autocomplete="off"/>`+
    `<div class="lead-list" id="lead-list"></div>`+
    `<p class="lead-hint">Toque num lead para preencher os campos. Você pode editar tudo depois.</p></div>`;
}
function leadRowsHTML(filter){
  const q=(filter||"").trim().toLowerCase();
  const list=state.leads.filter((l)=>{ if(!q) return true; return [l.nome,l.nome_parceiro,l.email,l.cidade].some((x)=>(x||"").toLowerCase().includes(q)); });
  if(!list.length) return `<div class="lead-none">Nenhum lead encontrado.</div>`;
  return list.map((l)=>{
    const par=l.nome_parceiro ? ` & ${esc(l.nome_parceiro)}` : "";
    const meta=[fmtData(l.data_casamento), l.cidade, origemTxt(l.origem)].filter(Boolean).map(esc).join(" · ");
    return `<button type="button" class="lead-row" data-lead="${esc(l.id)}"><span class="lr-nome">${esc(l.nome)}${par}</span><span class="lr-meta">${meta}</span></button>`;
  }).join("");
}
function fillFromLead(lead){
  const f=document.getElementById("form-proposta"); if(!f) return;
  const set=(name,val)=>{ const el=f.querySelector(`[name="${name}"]`); if(el && val!=null && String(val)!=="") el.value=val; };
  set("cliente_nome", lead.nome); set("cliente_parceiro", lead.nome_parceiro);
  set("cliente_email", lead.email); set("cliente_telefone", lead.whatsapp);
  set("evento_data", lead.data_casamento); set("evento_local", lead.local);
  set("evento_cidade", lead.cidade); set("evento_convidados", lead.convidados);
  set("evento_notas", lead.mensagem);
  const mp=f.querySelector('[name="mensagem_pessoal"]'); if(mp && !mp.value.trim()) mp.value=mensagemAbertura(lead.nome, lead.nome_parceiro, leadDataOcupada(lead.data_casamento));
  const h=f.querySelector('[name="lead_id"]'); if(h) h.value=lead.id;
  checkDataConflito();
}
function checkDataConflito(){
  const el=document.getElementById("data-aviso"); const f=document.getElementById("form-proposta");
  if(!el||!f) return;
  const di=f.querySelector('[name="evento_data"]'); const dval=di?di.value:"";
  const oc=(state.datasOcupadas||{})[dval];
  const bl=dval?(state.datasBloqueadas||{})[dval]:null;
  const selfId=state.editing&&state.editing.id;
  if(dval && oc && oc.id!==selfId){
    el.className="data-aviso show";
    el.innerHTML=`<b>Atenção:</b> ${esc(fmtData(dval))} já está <b>${esc(statusTxt(oc.status))}</b> com ${esc(oc.nome)}. Evite enviar proposta com a mesma data.`;
  } else if(dval && bl){
    el.className="data-aviso show";
    el.innerHTML=`<b>Atenção:</b> ${esc(fmtData(dval))} está marcada como <b>ocupada</b> na sua agenda (${esc(bl.label||motivoBloqueioTxt(bl.motivo))}). Essa data está fechada para reserva.`;
  } else { el.className="data-aviso"; el.innerHTML=""; }
}
// ---------- leads (entrada de contatos) ----------
function leadWaLink(l){
  const d=waDigits(l.whatsapp); if(!d) return "";
  const msg=`Oi ${l.nome||""}! Aqui é o Thiago, da Bellus Eventos. Recebi o contato de vocês pelo nosso site e queria conversar sobre o filme do casamento.`;
  return `https://wa.me/${d}?text=${encodeURIComponent(msg)}`;
}
function leadEmailData(l){
  if(!l.email) return null;
  const primeiro=((l.nome||"").trim().split(/\s+/)[0])||(l.nome||"");
  const corpo=[`Oi, ${primeiro}.`,``,`Aqui é o Thiago Rodrigues, da Bellus Eventos. Recebi o seu contato pelo nosso site e fico muito feliz com o seu interesse.`,``,`Já vou preparar uma proposta personalizada e te envio em seguida. Qualquer coisa, é só responder por aqui.`,``,`Abraço,`,`Thiago Rodrigues`,`Bellus Eventos`].join("\n");
  return { to:l.email, nome:(l.nome||""), su:"Recebemos o seu contato - Bellus Eventos", corpo:corpo };
}
function leadContatoBtns(l){
  const wl=leadWaLink(l);
  return (wl?`<a class="cbtn wa" href="${esc(wl)}" target="_blank" rel="noopener">WhatsApp</a>`:"")
       + emailBtnHtml(leadEmailData(l));
}
function leadCard(l){
  const par=l.nome_parceiro ? ` & ${esc(l.nome_parceiro)}` : "";
  const tem=(state.leadsUsados||new Set()).has(l.id);
  const meta=[fmtData(l.data_casamento), l.cidade, l.convidados?`${esc(l.convidados)} convidados`:""].filter(Boolean).map(esc).join(" · ");
  const ocup = l.data_casamento && (state.datasOcupadas||{})[l.data_casamento];
  const flag = ocup ? `<div class="lead-flag">A data ${esc(fmtData(l.data_casamento))} já está ${esc(statusTxt(ocup.status))} na agenda</div>` : "";
  const quando = l.created_at ? `<span class="lead-when">${esc(desdeTxt(l.created_at))}</span>` : "";
  const msg = l.mensagem ? `<p class="lead-msg">${esc(l.mensagem)}</p>` : "";
  const prop=(state.propByLead||{})[l.id];
  const acao = (tem && prop)
    ? `<button class="btn btn-primary lead-cta" data-open="${esc(prop.id)}">Ver proposta</button>`
    : tem
      ? `<span class="lead-tag">Proposta criada</span>`
      : `<button class="btn btn-primary lead-cta" data-nova-lead="${esc(l.id)}">Criar proposta</button>`;
  return `<div class="lead-card${tem?" is-done":""}">
    <div class="lead-card-top">
      <div><span class="lead-card-nome">${esc(l.nome)}${par}</span><span class="lead-card-origem">${esc(origemTxt(l.origem))}</span></div>
      ${quando}
    </div>
    ${meta?`<div class="lead-card-meta">${meta}</div>`:""}
    ${flag}
    ${msg}
    <div class="lead-card-foot"><div class="lead-contato">${leadContatoBtns(l)}</div>${acao}</div>
  </div>`;
}
function leadsCardsHTML(q){
  q=(q||"").trim().toLowerCase();
  const per=state.leadsPeriodo, ref=refDe(per, state.leadsMes, state.leadsAno);
  const og=state.leadsOrigem||"tudo";
  const list=state.leads.filter((l)=> (og==="tudo"||l.origem===og) && inPeriodo(l.created_at, per, ref) && (!q || [l.nome,l.nome_parceiro,l.email,l.cidade,l.whatsapp].some((x)=>(x||"").toLowerCase().includes(q))));
  if(!list.length) return `<div class="empty"><p>${(q||per!=="tudo")?"Nada encontrado para este filtro.":"Nenhum lead ainda."}</p></div>`;
  return `<div class="lead-cards">${list.map(leadCard).join("")}</div>`;
}
function exportLeadsCSV(){
  const cols=["nome","parceiro","email","whatsapp","data_casamento","cidade","convidados","origem","criado_em"];
  const rows=[cols];
  (state.leads||[]).forEach((l)=>rows.push([l.nome,l.nome_parceiro,l.email,l.whatsapp,l.data_casamento,l.cidade,l.convidados,origemTxt(l.origem),(l.created_at||"").slice(0,10)]));
  const csv=rows.map((r)=>r.map((c)=>`"${String(c==null?"":c).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob=new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a");
  a.href=url; a.download="clientes-bellus.csv"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
function viewLeads(){
  const head=`<div class="page-head"><h2 class="serif">Leads</h2><div class="page-head-acts"><button class="btn btn-ghost" id="export-leads">Exportar clientes</button><button class="btn btn-primary" data-nova>Nova proposta</button></div></div>`;
  if(!state.leads.length) return head+`<div class="empty"><p>Nenhum lead ainda.</p><p class="muted">Os contatos enviados pelo site institucional e pela Noiva dos Sonhos aparecem aqui automaticamente.</p></div>`;
  const usados=state.leadsUsados||new Set();
  const novos=state.leads.filter((l)=> !usados.has(l.id)).length;
  const cNoiva=state.leads.filter((l)=>l.origem==="noiva-dos-sonhos").length;
  const cBellus=state.leads.filter((l)=>l.origem==="site-bellus").length;
  const og=state.leadsOrigem||"tudo";
  const chip=(v,t)=>`<button class="lead-filtro${og===v?" on":""}" data-leadorigem="${v}">${t}</button>`;
  const filtros=`<div class="lead-filtros">${chip("tudo","Todos ("+state.leads.length+")")}${chip("noiva-dos-sonhos","Noiva dos Sonhos ("+cNoiva+")")}${chip("site-bellus","Site Bellus ("+cBellus+")")}</div>`;
  const resumo=`<p class="muted" style="margin:-.2rem 0 1rem">${state.leads.length} no total · <b>${novos}</b> sem proposta. <b>Criar proposta</b> abre o formulário preenchido; <b>Ver proposta</b> abre a já criada.</p>`;
  return head+resumo+filtros+periodoBar("leads",state.leadsPeriodo,state.leadsMes,state.leadsAno)+`<input class="lista-busca" id="leads-busca" type="search" placeholder="Buscar por nome, e-mail, cidade ou WhatsApp..." value="${esc(state.leadsBusca||"")}" autocomplete="off"/><div id="leads-cont">${leadsCardsHTML(state.leadsBusca||"")}</div>`;
}
function viewForm(){
  const ed = state.editing;
  const v = (n, def="") => (ed ? (ed[n] ?? "") : def);
  const serv = isNiver(v("pacote_recomendado")) ? "aniversario" : "casamento";
  return `
  <div class="page-head"><h2 class="serif">${ed?"Editar proposta":"Nova proposta"}</h2><button class="btn btn-ghost" data-go="lista">Voltar</button></div>
  <form class="card-form" id="form-proposta">
    <input type="hidden" name="lead_id" id="f-lead-id" value="${esc(v("lead_id"))}"/>
    ${ed ? "" : leadPickerHTML()}
    <div class="section-label">Cliente</div>
    <div class="grid cols-2">
      ${field("Nome","cliente_nome",{req:true,ph:"Nome da noiva",val:v("cliente_nome")})}
      ${field("Par","cliente_parceiro",{ph:"Nome do par",val:v("cliente_parceiro")})}
      ${field("E-mail","cliente_email",{type:"email",ph:"email@exemplo.com",val:v("cliente_email")})}
      ${field("WhatsApp / telefone","cliente_telefone",{ph:"(21) 90000-0000",val:v("cliente_telefone")})}
    </div>
    <div class="section-label">Evento</div>
    <label class="field"><span>Tipo de serviço</span><select id="f-servico"><option value="casamento" ${serv==="casamento"?"selected":""}>Casamento</option><option value="aniversario" ${serv==="aniversario"?"selected":""}>Aniversário</option></select></label>
    <div class="grid cols-2">
      ${field("Tipo","evento_tipo",{val:v("evento_tipo", serv==="aniversario"?"Aniversário":"Casamento")})}
      ${field("Data","evento_data",{type:"date",val:v("evento_data")})}
      ${field("Local","evento_local",{ph:"Espaço / igreja",val:v("evento_local")})}
      ${field("Cidade","evento_cidade",{ph:"Teresópolis",val:v("evento_cidade")})}
      ${field("Convidados","evento_convidados",{ph:"Ex.: 120",val:v("evento_convidados")})}
      ${field("Disponibilidade","disponibilidade",{select:DISP,val:v("disponibilidade","available")})}
    </div>
    <div id="data-aviso" class="data-aviso"></div>
    ${field("Observações","evento_notas",{textarea:true,ph:"O que o casal contou",val:v("evento_notas")})}
    <div class="section-label">Proposta</div>
    <div class="grid cols-2">
      ${field("Experiência recomendada","pacote_recomendado",{select:[["","Nenhuma"]].concat((serv==="aniversario"?NIVER_PACOTES:PACOTES).map((p)=>[p.id,p.nome])),val:v("pacote_recomendado")})}
      ${field("Status","status",{select:STATUS,val:v("status","rascunho")})}
      ${field("Validade da proposta","expira_em",{type:"date",val:v("expira_em")})}
      ${field("Consultor","consultor",{val:v("consultor","Thiago Rodrigues")})}
    </div>
    <div id="motivo-perda-wrap" style="${v("status")==="perdida"?"":"display:none"}">${field("Motivo da perda","motivo_perda",{select:MOTIVOS_PERDA,val:v("motivo_perda")})}</div>
    ${field("Deslocamento e logística (R$)","deslocamento",{type:"number",ph:"0",val:v("deslocamento",0)})}
    <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-top:.4rem">
      <button type="button" id="calc-desloc" class="btn btn-ghost btn-mini">Calcular pela cidade</button>
      <span id="desloc-info" style="font-size:.8rem;color:#7e7367"></span>
    </div>
    <p style="margin:.4rem 0 .2rem;color:#7e7367;font-size:.8rem;line-height:1.5">Sugestão automática: Teresópolis até a cidade do evento, ida e volta, a R$ 1,00/km (Teresópolis = incluso). Vem preenchido para conferência e pode ser editado; fora do estado, some o transporte aéreo.</p>
    ${field("Motivo da recomendação","recomendacao_motivo",{textarea:true,ph:"Por que essa experiência combina com eles",val:v("recomendacao_motivo")})}
    ${field("Mensagem pessoal de abertura","mensagem_pessoal",{textarea:true,ph:"Já vem preenchida ao puxar um lead. Edite à vontade.",val:v("mensagem_pessoal")})}
    <button class="btn btn-ghost btn-mini" type="button" id="btn-sug-msg">Sugerir mensagem a partir do nome</button>
    <div class="form-actions">
      <button class="btn btn-primary" type="submit" id="salvar">${ed?"Salvar alterações":"Salvar proposta"}</button>
      <button class="btn btn-ghost" type="button" data-go="lista">Cancelar</button>
    </div>
    <p class="msg" id="form-msg"></p>
  </form>`;
}
function detSection(title, rows){
  const body = rows.map(([l,val])=>`<div class="drow"><span>${esc(l)}</span><b>${esc(val||"—")}</b></div>`).join("");
  return `<div class="section-label">${esc(title)}</div><div class="detbox">${body}</div>`;
}
function brlC(c){ return ((c||0)/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
function pgStatus(s){ return ({pendente:"pendente",pago:"pago",reembolsado_conflito:"reembolsado",falhou:"falhou"})[s]||s; }
function metodoTxt(m){ return ({card:"cartão",pix:"Pix",boleto:"boleto"})[m]||(m||""); }
function tipoPagTxt(t){ return ({sinal:"Sinal (20%)",avista:"À vista (Pix)",cartao:"Cartão parcelado",saldo:"Saldo"})[t]||(t||""); }
function detPagamento(p){
  const pgs = p.pagamentos || [];
  if (!pgs.length) return `<div class="section-label">Pagamento</div><div class="detbox"><div class="drow"><span>Situação</span><b>Nenhuma cobrança gerada ainda</b></div></div>`;
  const pagos = pgs.filter((x)=>x.status==="pago");
  const pend = pgs.filter((x)=>x.status==="pendente");
  const pkgId = (pgs.find((x)=>x.pkg_id)||{}).pkg_id;
  const sinal = pagos.find((x)=>x.tipo==="sinal");
  const avista = pagos.find((x)=>x.tipo==="avista");
  const cartaoTot = pagos.find((x)=>x.tipo==="cartao");
  const saldoPg = pagos.find((x)=>x.tipo==="saldo");
  const totalPago = pagos.reduce((s,x)=>s+(x.valor_centavos||0),0);
  let totalC=0, saldo=0, cond="";
  if (sinal){ totalC=(sinal.valor_centavos||0)*5; saldo=Math.max(totalC-totalPago,0);
    cond = saldoPg ? (saldoPg.metodo==="card" ? `Sinal no Pix + saldo no cartão ${saldoPg.parcelas||1}x` : "Sinal no Pix + saldo no Pix") : "Sinal 20% no Pix"; }
  else if (avista){ totalC=avista.valor_centavos||0; cond="À vista no Pix (5% off)"; }
  else if (cartaoTot){ totalC=cartaoTot.valor_centavos||0; cond=`Cartão parcelado ${cartaoTot.parcelas||1}x`; }
  else if (pend.length){ const pe=pend[pend.length-1]; cond=tipoPagTxt(pe.tipo)+(pe.parcelas?` ${pe.parcelas}x`:""); }
  let momento, mcls;
  if (!pagos.length){ momento = pend.length?"Cobrança gerada · aguardando pagamento":"Nenhum pagamento ainda"; mcls = pend.length?"parcial":"pendente"; }
  else if (saldo>0){ momento="Reservada · saldo em aberto"; mcls="parcial"; }
  else { momento="Pagamento concluído"; mcls="pago"; }
  const pct = totalC ? Math.min(100,Math.round(totalPago/totalC*100)) : (pagos.length?100:0);
  const rows = [];
  if (pkgId) rows.push(["Experiência contratada", pacoteNome(pkgId)]);
  rows.push(["Condição", cond||"—"]);
  if (sinal) rows.push(["Sinal (20%)", `${brlC(sinal.valor_centavos)}${sinal.pago_em?" · pago "+fmtData(sinal.pago_em.slice(0,10)):""}`]);
  rows.push(["Total contratado", totalC?brlC(totalC):"—"]);
  rows.push(["Total pago", brlC(totalPago)]);
  if (totalC) rows.push(["Saldo restante", brlC(saldo)]);
  const body = rows.map(([l,val])=>`<div class="drow"><span>${esc(l)}</span><b>${esc(val)}</b></div>`).join("");
  const bar = totalC?`<div class="pgbar"><div class="pgbar-fill" style="width:${pct}%"></div></div><div class="pgbar-lab">${pct}% pago${saldo>0?" · saldo "+brlC(saldo):""}</div>`:"";
  const hist = pgs.length ? `<div class="pghist-h">Histórico</div><ul class="pghist">${pgs.slice().reverse().map((x)=>`<li><span class="pgh-t">${esc(tipoPagTxt(x.tipo))}${x.parcelas?" "+x.parcelas+"x":""}</span><span class="pgh-v">${esc(brlC(x.valor_centavos))}</span><span class="pgtag ${esc(x.status)}">${esc(pgStatus(x.status))}</span>${x.metodo?`<span class="pgh-m">${esc(metodoTxt(x.metodo))}</span>`:""}<span class="pgh-d">${esc(fmtData((x.pago_em||x.criado_em||"").slice(0,10)))}</span></li>`).join("")}</ul>` : "";
  return `<div class="section-label">Pagamento</div>
  <div class="pg-momento ${mcls}"><span class="pg-dot"></span>${esc(momento)}</div>
  <div class="detbox">${body}${bar}${hist}</div>`;
}
function viewDetalhe(){
  const p = state.current;
  return `
  <div class="page-head"><h2 class="serif">Proposta</h2><button class="btn btn-ghost" data-go="lista">Voltar</button></div>
  <div class="detalhe">
    <div class="detalhe-head"><h3>${esc(nomes(p))}</h3><span class="badge ${esc(p.status)}">${esc(statusTxt(p.status))}</span></div>
    ${detContato(p)}
    ${detSection("Evento", [["Tipo",p.evento_tipo],["Data",fmtData(p.evento_data)],["Local",p.evento_local],["Cidade",p.evento_cidade],["Convidados",p.evento_convidados],["Disponibilidade",dispTxt(p.disponibilidade)],["Observações",p.evento_notas]])}
    ${detSection("Proposta", [...(p.status==="perdida"?[["Motivo da perda",motivoPerdaTxt(p.motivo_perda)]]:[]),["Experiência recomendada",pacoteNome(p.pacote_recomendado)],["Validade",fmtData(p.expira_em)],["Consultor",p.consultor],["Motivo da recomendação",p.recomendacao_motivo],["Mensagem pessoal",p.mensagem_pessoal]])}
    ${detSection("Acompanhamento", [["Enviada", tsRel(p.enviada_em)],["Visualizada", p.visualizada_em?tsRel(p.visualizada_em):"Ainda não abriu"],["Visualizações", String(p.visualizacoes||0)]])}
    ${detPagamento(p)}
    <div class="linkbox">
      <span>Link para enviar à noiva</span>
      <code id="prop-link">${esc(propLink(p))}</code>
      <div class="linkactions">
        <button class="btn btn-ghost" id="btn-copiar">Copiar link</button>
        <a class="btn btn-ghost" href="${esc(propLink(p))}" target="_blank" rel="noopener">Abrir</a>
      </div>
    </div>
    <div class="form-actions" id="det-actions">
      <button class="btn btn-primary" data-edit="${p.id}">Editar</button>
      ${isAdmin() ? `<button class="btn btn-danger" id="btn-del">Excluir</button>` : ``}
    </div>
  </div>`;
}
function viewAgenda(){
  const ag = state.agenda.filter((p)=>inPeriodo(p.evento_data, state.agendaPeriodo, refDe(state.agendaPeriodo, state.agendaMes, state.agendaAno)));
  const items = ag.map((p)=>{
    const n=diasAte(p.evento_data); const urg=(n!=null&&n>=0&&n<=30); const link=propLink(p);
    return `<div class="agenda-item">
      <div class="data">${esc(fmtData(p.evento_data))}<small>${esc(statusTxt(p.status))}</small></div>
      <div class="ag-main">
        <div class="nome">${esc(nomes(p))}${n!=null?` <span class="ag-quando${urg?" urg":""}">${quandoTxt(n)}</span>`:""}</div>
        <a class="ag-link" href="${esc(link)}" target="_blank" rel="noopener">${esc(link)}</a>
      </div>
      <button class="cbtn det" data-open="${esc(p.id)}">Ver proposta</button>
    </div>`;
  }).join("");
  const bar = state.agenda.length ? periodoBar("agenda",state.agendaPeriodo,state.agendaMes,state.agendaAno) : "";
  const list = ag.length
    ? `<div class="plist">${items}</div>`
    : (state.agenda.length
        ? `<div class="empty"><p>Nenhuma data reservada neste período.</p></div>`
        : `<div class="empty"><p>Nenhuma data reservada ainda.</p><p class="muted">As datas aparecem aqui quando uma proposta vira <b>Reservada</b> ou <b>Fechada</b>.</p></div>`);
  const proxBlock = proximosCasamentos().length ? `<div class="section-label">Próximos casamentos</div>${proximosBlockHtml(6)}` : "";
  return `<div class="page-head"><h2 class="serif">Agenda</h2><button class="btn btn-ghost" data-go="lista">Propostas</button></div>
  ${avisoCasamentoHtml()}
  <div class="section-label">Calendário</div>${renderCalendario(state.calMes)}
  ${bloqueiosSecaoHtml()}
  ${proxBlock}
  <div class="section-label">Todas as datas</div>
  ${bar}${list}`;
}
// ---------- bloqueios de agenda (datas em que o Thiago nao atende) ----------
function bloqueiosSecaoHtml(){
  const bs=(state.bloqueios||[]);
  const lista = bs.length
    ? bs.map((b)=>{
        const multi = b.data_fim && b.data_fim!==b.data_inicio;
        const per = multi ? `${fmtData(b.data_inicio)} a ${fmtData(b.data_fim)}` : fmtData(b.data_inicio);
        const isG = b.origem==="google";
        const desc = [motivoBloqueioTxt(b.motivo), (b.titulo||"").trim()].filter(Boolean).join(" · ");
        const tag = isG ? `<span style="font-size:.62rem;background:#eee7da;color:#6b6258;border-radius:4px;padding:.05rem .4rem;margin-left:.45rem;vertical-align:middle">Google Agenda</span>` : "";
        const det = (b.snapshot && b.snapshot.descricao) ? `<small style="display:block;color:#9a9088;margin-top:.2rem;line-height:1.35">${esc(b.snapshot.descricao)}</small>` : "";
        const al = b.alerta ? `<small style="display:block;color:#a85454;font-weight:600;margin-top:.2rem">⚠ ${esc(b.alerta)}</small>` : "";
        return `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.6rem;padding:.6rem .2rem;border-bottom:1px solid var(--line)"><div style="flex:1;min-width:0"><div><b>${esc(per)}</b>${tag}</div><small style="color:#7e7367">${esc(desc)}</small>${det}${al}</div><button type="button" class="cbtn" data-del-bloq="${esc(b.id)}">Remover</button></div>`;
      }).join("")
    : `<p class="muted">Nenhuma data bloqueada. Marque aqui quando estiver viajando, de férias ou com um compromisso que impeça atender um evento. A data fica fechada para reserva.</p>`;
  return `<div class="section-label">Datas que você não atende</div>
  <div style="display:flex;align-items:center;gap:.7rem;margin-bottom:.7rem;flex-wrap:wrap"><button type="button" class="btn btn-ghost" id="btn-sync-google">↻ Sincronizar com Google agora</button>${state.syncMsg?`<span style="font-size:.8rem;color:#1d7a4f">${esc(state.syncMsg)}</span>`:""}</div>
  <form id="form-bloqueio" style="display:flex;flex-wrap:wrap;gap:.6rem;align-items:flex-end;margin-bottom:.7rem">
    <label style="display:flex;flex-direction:column;font-size:.78rem;gap:.2rem">De<input type="date" name="data_inicio" required style="padding:.45rem"></label>
    <label style="display:flex;flex-direction:column;font-size:.78rem;gap:.2rem">Até (opcional)<input type="date" name="data_fim" style="padding:.45rem"></label>
    <label style="display:flex;flex-direction:column;font-size:.78rem;gap:.2rem">Motivo<select name="motivo" style="padding:.45rem">${MOTIVOS_BLOQUEIO.map((m)=>`<option value="${esc(m[0])}">${esc(m[1])}</option>`).join("")}</select></label>
    <label style="display:flex;flex-direction:column;font-size:.78rem;gap:.2rem;flex:1;min-width:150px">Descrição (opcional)<input type="text" name="titulo" placeholder="ex.: Viagem em família" style="padding:.45rem"></label>
    <button class="btn btn-primary" type="submit">Bloquear data</button>
  </form>
  <p class="msg" id="bloq-msg" style="margin:.2rem 0"></p>
  <div>${lista}</div>`;
}
async function addBloqueio(o){
  const ini=o.data_inicio; let fim=o.data_fim||ini;
  if(!ini) return "Informe a data inicial.";
  if(fim<ini) fim=ini;
  const { error } = await supabase.from("agenda_bloqueios").insert({ data_inicio:ini, data_fim:fim, motivo:o.motivo||"outro", titulo:(o.titulo||"").trim()||null, origem:"manual" });
  return error ? error.message : null;
}
async function removeBloqueio(id){
  const { error } = await supabase.from("agenda_bloqueios").delete().eq("id", id);
  return error ? error.message : null;
}
function wireBloqueios(){
  const f=document.getElementById("form-bloqueio");
  if(f){
    f.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const o={}; new FormData(f).forEach((v,k)=>{ o[k]=String(v).trim(); });
      setMsg("bloq-msg","Salvando...");
      const err=await addBloqueio(o);
      if(err) return setMsg("bloq-msg","Erro: "+err,"err");
      await loadBloqueios(); render();
    });
  }
  const sb=document.getElementById("btn-sync-google");
  if(sb){ sb.addEventListener("click", async ()=>{
    sb.disabled=true; sb.textContent="Sincronizando..."; state.syncMsg="";
    try{
      const { data, error } = await supabase.functions.invoke("sync-google-agenda");
      if(error) throw error;
      state.syncMsg = `Atualizado: ${data.novos||0} novo(s), ${data.atualizados||0} alterado(s), ${data.removidos||0} removido(s).`;
      await loadBloqueios(); render();
    }catch(e){ sb.disabled=false; sb.textContent="↻ Sincronizar com Google agora"; alert("Erro ao sincronizar: "+(e&&e.message?e.message:e)); }
  }); }
  document.querySelectorAll("[data-del-bloq]").forEach((b)=> b.addEventListener("click", async ()=>{
    if(!confirm("Remover este bloqueio? A data volta a ficar livre para reserva.")) return;
    const err=await removeBloqueio(b.getAttribute("data-del-bloq"));
    if(err){ alert("Erro ao remover: "+err); return; }
    await loadBloqueios(); render();
  }));
}
function viewConta(){
  return `
  <div class="page-head"><h2 class="serif">Trocar senha</h2><button class="btn btn-ghost" data-go="lista">Voltar</button></div>
  <form class="card-form max-sm" id="form-senha">
    <p class="muted" style="margin-top:0">Conta: <b>${esc(state.user.email)}</b></p>
    ${field("Nova senha","novaSenha",{type:"password",req:true,ph:"Escolha a sua senha"})}
    ${field("Repetir nova senha","novaSenha2",{type:"password",req:true})}
    <div class="form-actions"><button class="btn btn-primary" type="submit" id="salvar-senha">Salvar nova senha</button></div>
    <p class="msg" id="senha-msg"></p>
  </form>`;
}

function renderLogin(){
  root.innerHTML = `
  <div class="login"><main class="card">
    <div class="brand"><img src="logo_bellus.png" alt="Bellus Eventos"/><p class="eyebrow">Bellus Eventos</p><h1>Área de Propostas</h1></div>
    <form id="login-form">
      <label><span>E-mail</span><input id="email" type="email" required autocomplete="username" placeholder="voce@email.com" value="rodrigues.tc@gmail.com"/></label>
      <label><span>Senha</span><input id="password" type="password" required autocomplete="current-password" placeholder="Sua senha" autofocus/></label>
      <button class="btn btn-primary" type="submit" id="entrar" style="width:100%;margin-top:1.5rem;min-height:3.1rem">Entrar</button>
      <p class="msg" id="login-msg" style="text-align:center"></p>
    </form>
    <p class="forgot-row"><a href="#" id="forgot">Esqueci minha senha</a></p>
    <p class="foot">Acesso restrito à equipe Bellus.</p>
  </main></div>`;
  document.getElementById("login-form").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const btn=document.getElementById("entrar");
    btn.disabled=true; btn.textContent="Entrando..."; setMsg("login-msg","");
    const err = await doLogin(document.getElementById("email").value.trim(), document.getElementById("password").value);
    if (err){ btn.disabled=false; btn.textContent="Entrar"; setMsg("login-msg",err,"err"); }
  });
  document.getElementById("forgot").addEventListener("click", async (e)=>{
    e.preventDefault();
    const email=document.getElementById("email").value.trim();
    if(!email) return setMsg("login-msg","Digite o seu e-mail acima para receber o link de recuperação.","err");
    setMsg("login-msg","Enviando o link...");
    const err=await enviarRecuperacao(email);
    if(err) return setMsg("login-msg","Erro: "+err,"err");
    setMsg("login-msg","Link enviado para "+email+". Confira o seu e-mail (inclusive o spam).","ok");
  });
}

function wire(){
  document.querySelectorAll("[data-go]").forEach((b)=> b.addEventListener("click", ()=>go(b.getAttribute("data-go"))));
  document.querySelectorAll(".periodo").forEach((bar)=>{
    const scope=bar.getAttribute("data-scope");
    bar.querySelectorAll(".per-btn").forEach((b)=> b.addEventListener("click", ()=>{ const per=b.getAttribute("data-per"); if(scope==="leads")state.leadsPeriodo=per; else if(scope==="prop")state.propPeriodo=per; else if(scope==="agenda")state.agendaPeriodo=per; render(); }));
    const pm=bar.querySelector(".per-mes"); if(pm) pm.addEventListener("change", ()=>{ const v=pm.value||curYM(); if(scope==="leads")state.leadsMes=v; else if(scope==="prop")state.propMes=v; else if(scope==="agenda")state.agendaMes=v; render(); });
    const pa=bar.querySelector(".per-ano"); if(pa) pa.addEventListener("change", ()=>{ const v=pa.value; if(scope==="leads")state.leadsAno=v; else if(scope==="prop")state.propAno=v; else if(scope==="agenda")state.agendaAno=v; render(); });
  });
  if (document.getElementById("dash-charts")) renderCharts();
  if (document.getElementById("mov-list")) renderMovimentacoes();
  wireBloqueios();
  document.querySelectorAll("[data-nova]").forEach((b)=> b.addEventListener("click", novaProposta));
  document.querySelectorAll("[data-nova-lead]").forEach((b)=> b.addEventListener("click", ()=>criarPropostaDeLead(b.getAttribute("data-nova-lead"))));
  document.querySelectorAll("[data-open]").forEach((b)=> b.addEventListener("click", ()=>openProposta(b.getAttribute("data-open"))));
  document.querySelectorAll("[data-leadorigem]").forEach((b)=> b.addEventListener("click", ()=>{ state.leadsOrigem=b.getAttribute("data-leadorigem"); render(); }));
  { const ex=document.getElementById("export-leads"); if(ex) ex.addEventListener("click", exportLeadsCSV); }
  document.querySelectorAll("[data-edit]").forEach((b)=> b.addEventListener("click", ()=>editProposta(b.getAttribute("data-edit"))));
  document.querySelectorAll(".cal-nav").forEach((b)=> b.addEventListener("click", ()=>{ state.calMes=calNavYM(state.calMes, parseInt(b.getAttribute("data-cal-delta"),10)||0); render(); }));
  const lo=document.getElementById("logout"); if(lo) lo.addEventListener("click", doLogout);

  const lb=document.getElementById("lista-busca");
  if(lb) lb.addEventListener("input", ()=>{
    state.listaBusca=lb.value;
    const cont=document.getElementById("lista-cont");
    if(cont){ cont.innerHTML=listaContHTML(lb.value); cont.querySelectorAll("[data-open]").forEach((b)=> b.addEventListener("click", ()=>openProposta(b.getAttribute("data-open")))); }
  });

  const lbl=document.getElementById("leads-busca");
  if(lbl) lbl.addEventListener("input", ()=>{
    state.leadsBusca=lbl.value;
    const cont=document.getElementById("leads-cont");
    if(cont){ cont.innerHTML=leadsCardsHTML(lbl.value); cont.querySelectorAll("[data-nova-lead]").forEach((b)=> b.addEventListener("click", ()=>criarPropostaDeLead(b.getAttribute("data-nova-lead")))); cont.querySelectorAll("[data-open]").forEach((b)=> b.addEventListener("click", ()=>openProposta(b.getAttribute("data-open")))); }
  });

  const cop=document.getElementById("btn-copiar");
  if (cop) cop.addEventListener("click", async ()=>{
    try { await navigator.clipboard.writeText(propLink(state.current)); cop.textContent="Copiado!"; setTimeout(()=>{cop.textContent="Copiar link";},1600); }
    catch(e){ cop.textContent="Copie o link acima"; }
  });

  const fp=document.getElementById("form-proposta");
  if (fp) fp.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const o={}; new FormData(fp).forEach((v,k)=>{ const s=String(v).trim(); o[k]= s===""?null:s; });
    o.deslocamento = Math.max(0, Math.round(parseFloat(o.deslocamento) || 0));
    if (!o.cliente_nome) return setMsg("form-msg","Informe o nome do cliente.","err");
    if (o.status==="perdida" && !o.motivo_perda){ abrirMotivoModal((m)=>{ o.motivo_perda=m; finalizarProposta(o); }); return; }
    finalizarProposta(o);
  });

  const servSel=document.getElementById("f-servico");
  if (servSel && fp){
    servSel.addEventListener("change", ()=>{
      const aniv = servSel.value==="aniversario";
      const pk = fp.querySelector('[name="pacote_recomendado"]');
      if(pk){ const list=(aniv?NIVER_PACOTES:PACOTES); pk.innerHTML='<option value="">Nenhuma</option>'+list.map((p)=>`<option value="${p.id}">${esc(p.nome)}</option>`).join(""); }
      const et = fp.querySelector('[name="evento_tipo"]');
      if(et && (!et.value || et.value==="Casamento" || et.value==="Aniversário")){ et.value = aniv?"Aniversário":"Casamento"; }
    });
  }

  const stSel = fp.querySelector('[name="status"]');
  const mpWrap = document.getElementById("motivo-perda-wrap");
  if(stSel && mpWrap){ stSel.addEventListener("change", ()=>{ mpWrap.style.display = stSel.value==="perdida" ? "" : "none"; }); }

  const ll=document.getElementById("lead-list");
  if (ll){
    const ls=document.getElementById("lead-search");
    const wireRows=()=>{ ll.querySelectorAll("[data-lead]").forEach((b)=> b.addEventListener("click", ()=>{
      const lead=state.leads.find((x)=> x.id===b.getAttribute("data-lead"));
      if(lead) fillFromLead(lead);
      ll.querySelectorAll(".lead-row").forEach((r)=>r.classList.remove("sel")); b.classList.add("sel");
    })); };
    ll.innerHTML = leadRowsHTML(""); wireRows();
    if (ls) ls.addEventListener("input", ()=>{ ll.innerHTML = leadRowsHTML(ls.value); wireRows(); });
  }
  if (state.prefillLead && document.getElementById("form-proposta")){ const _pl=state.prefillLead; state.prefillLead=null; fillFromLead(_pl); }
  if (fp) {
    const desEl=fp.querySelector('[name="deslocamento"]');
    const cityEl=fp.querySelector('[name="evento_cidade"]');
    const localEl=fp.querySelector('[name="evento_local"]');
    const dInfo=document.getElementById("desloc-info");
    const dBtn=document.getElementById("calc-desloc");
    let dBusy=false;
    const dSet=(t)=>{ if(dInfo) dInfo.textContent=t||""; };
    const dVazio=()=> !desEl || !desEl.value || Number(desEl.value)===0;
    const ORIG_DES={lat:-22.4202092,lng:-42.9750062};
    function haversineKmDes(a,b){const R=6371,t=(d)=>d*Math.PI/180;const dLat=t(b.lat-a.lat),dLng=t(b.lng-a.lng);const x=Math.sin(dLat/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dLng/2)**2;return 2*R*Math.asin(Math.sqrt(x));}
    async function runCalcDesloc(force){
      if(dBusy||!desEl) return;
      const cidade=cityEl?cityEl.value.trim():""; const local=localEl?localEl.value.trim():"";
      const alvo=[local,cidade].filter(Boolean).join(", ").trim();
      if(!alvo){ dSet("Informe a cidade do evento para calcular."); return; }
      if(/teres[oó]polis/i.test(alvo)){ if(force||dVazio()) desEl.value=0; dSet("Teresópolis · deslocamento incluso (R$ 0)."); return; }
      dBusy=true; dSet("Calculando distância…");
      try{
        const gr=await fetch("https://photon.komoot.io/api/?limit=1&q="+encodeURIComponent(alvo+", Brasil"));
        const g=await gr.json();
        const f=g&&g.features&&g.features[0];
        if(!f||!f.geometry||!f.geometry.coordinates){ dSet("Não localizei a cidade. Preencha manualmente."); return; }
        const dest={lng:f.geometry.coordinates[0], lat:f.geometry.coordinates[1]};
        const pr=f.properties||{}; const nome=pr.city||pr.name||pr.county||pr.state||alvo;
        let kmIda=0, aprox=false;
        try{ const rr=await fetch("https://router.project-osrm.org/route/v1/driving/"+ORIG_DES.lng+","+ORIG_DES.lat+";"+dest.lng+","+dest.lat+"?overview=false"); const r=await rr.json(); if(r&&r.routes&&r.routes[0]&&r.routes[0].distance) kmIda=r.routes[0].distance/1000; }catch(_){}
        if(!kmIda){ kmIda=haversineKmDes(ORIG_DES,dest)*1.6; aprox=true; }
        const kmI=Math.round(kmIda), kmT=kmI*2, valor=kmT;
        if(force||dVazio()) desEl.value=valor;
        dSet("Teresópolis → "+nome+": "+kmI+" km (ida e volta "+kmT+" km) ≈ R$ "+valor+(aprox?" aprox.":""));
      }catch(_){ dSet("Falha ao calcular. Preencha manualmente."); }
      finally{ dBusy=false; }
    }
    if(dBtn) dBtn.addEventListener("click", ()=>runCalcDesloc(true));
    if(cityEl) cityEl.addEventListener("blur", ()=>{ if(dVazio()) runCalcDesloc(false); });
    if(localEl) localEl.addEventListener("blur", ()=>{ if(dVazio()) runCalcDesloc(false); });
    if(dVazio() && cityEl && cityEl.value.trim()) runCalcDesloc(false);
  }
  const sug=document.getElementById("btn-sug-msg");
  if(sug) sug.addEventListener("click", ()=>{ const f=document.getElementById("form-proposta"); if(!f) return; const mp=f.querySelector('[name="mensagem_pessoal"]'); const dv=(f.querySelector('[name="evento_data"]')||{}).value; if(mp) mp.value=mensagemAbertura(f.querySelector('[name="cliente_nome"]').value, f.querySelector('[name="cliente_parceiro"]').value, leadDataOcupada(dv)); });
  const dataInput=document.querySelector('#form-proposta [name="evento_data"]');
  if(dataInput){ checkDataConflito(); dataInput.addEventListener("input", checkDataConflito); dataInput.addEventListener("change", checkDataConflito); }

  const del=document.getElementById("btn-del");
  if (del) del.addEventListener("click", ()=>{
    const area=document.getElementById("det-actions");
    area.innerHTML = `<span class="muted">Excluir esta proposta?</span> <button class="btn btn-danger" id="del-sim">Sim, excluir</button> <button class="btn btn-ghost" id="del-nao">Cancelar</button>`;
    document.getElementById("del-sim").addEventListener("click", async ()=>{
      const err = await deleteProposta(state.current.id);
      if (err){ area.innerHTML = `<span class="msg err">Erro: ${esc(err)}</span>`; return; }
      go("lista");
    });
    document.getElementById("del-nao").addEventListener("click", render);
  });

  const fs=document.getElementById("form-senha");
  if (fs) fs.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const a=fs.novaSenha.value, b=fs.novaSenha2.value;
    if (!a) return setMsg("senha-msg","Digite a nova senha.","err");
    if (a!==b) return setMsg("senha-msg","As senhas não conferem.","err");
    const btn=document.getElementById("salvar-senha"); btn.disabled=true; btn.textContent="Salvando...";
    const err = await trocarSenha(a);
    btn.disabled=false; btn.textContent="Salvar nova senha";
    if (err) return setMsg("senha-msg","Erro: "+err,"err");
    setMsg("senha-msg","Senha alterada com sucesso.","ok"); fs.reset();
  });

  const rf=document.getElementById("recovery-form");
  if (rf) rf.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const pass=document.getElementById("rec-pass").value;
    if(!pass) return setMsg("rec-msg","Digite a nova senha.","err");
    const btn=document.getElementById("rec-btn"); btn.disabled=true; btn.textContent="Salvando...";
    const err=await trocarSenha(pass);
    if(err){ btn.disabled=false; btn.textContent="Salvar nova senha"; return setMsg("rec-msg","Erro: "+err,"err"); }
    setMsg("rec-msg","Senha alterada! Você já pode entrar.","ok");
    setTimeout(()=>{ state.recovery=false; supabase.auth.signOut().finally(()=>render()); }, 1600);
  });
}

supabase.auth.onAuthStateChange((event)=>{ if(event==="PASSWORD_RECOVERY"){ state.recovery=true; render(); } });
init();
