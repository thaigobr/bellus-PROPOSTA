import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://nngvxucybligmanbedrs.supabase.co";
const SUPABASE_KEY = "sb_publishable_UhC5LHa4Ob5vSY4K5xrM5Q_LG3pllu-";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PACOTES = [
  { id: "cerimonia", nome: "Cerimônia" },
  { id: "rubi", nome: "Rubi" },
  { id: "diamante", nome: "Diamante" },
  { id: "alianca", nome: "Aliança" },
];
const STATUS = [["rascunho","Rascunho"],["enviada","Enviada"],["visualizada","Visualizada"],["negociando","Negociando"],["reservada","Reservada"],["fechada","Fechada"],["perdida","Perdida"]];
const DISP = [["available","Disponível"],["on_hold","Pré-reserva"],["unavailable","Indisponível"]];
const PAPEL = { owner: "Proprietário", admin: "Administrador", funcionario: "Funcionário" };
const LINK_BASE = "https://www.belluseventos.com.br/p/";

const root = document.getElementById("root");
const state = { user: null, membro: null, view: "dashboard", propostas: [], agenda: [], leads: [], editing: null, current: null, recovery: false, listaBusca: "" };

const esc = (s) => (s == null ? "" : String(s)).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
function slugify(s){ return (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40); }
function fmtData(d){ if(!d) return "Data a definir"; const [y,m,dd]=d.split("-"); return `${dd}/${m}/${y}`; }
function nomes(p){ return p.cliente_parceiro ? `${p.cliente_nome} & ${p.cliente_parceiro}` : p.cliente_nome; }
const statusTxt = (v) => (STATUS.find((s)=>s[0]===v)||[v,v])[1];
const dispTxt = (v) => (DISP.find((d)=>d[0]===v)||[v,""])[1];
const pacoteNome = (id) => (PACOTES.find((p)=>p.id===id)||{}).nome || "";
function setMsg(id,t,kind){ const el=document.getElementById(id); if(el){ el.textContent=t; el.className="msg "+(kind||""); } }
const isAdmin = () => ["owner","admin"].includes(state.membro?.papel);

// ---------- auth ----------
async function init(){
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) await loadMembro(data.session.user);
  render();
}
async function loadMembro(user){
  const { data } = await supabase.from("proposta_equipe").select("nome,papel,ativo").eq("id", user.id).maybeSingle();
  if (data && data.ativo){ state.user=user; state.membro=data; await loadPropostas(); }
  else { await supabase.auth.signOut(); state.user=null; state.membro=null; }
}
async function doLogin(email, password){
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return "E-mail ou senha inválidos.";
  await loadMembro(data.user);
  if (!state.user) return "Este usuário não faz parte da equipe.";
  state.view="dashboard"; render(); return null;
}
async function doLogout(){ await supabase.auth.signOut(); state.user=null; state.membro=null; render(); }

// ---------- data ----------
async function loadPropostas(){
  const { data } = await supabase.from("propostas")
    .select("id,slug,status,cliente_nome,cliente_parceiro,cliente_email,cliente_telefone,evento_data,criado_em,enviada_em,visualizada_em,visualizacoes,pacote_recomendado,consultor")
    .order("criado_em", { ascending: false });
  state.propostas = data || [];
}
async function loadLeads(){
  const { data } = await supabase.from("leads")
    .select("id,nome,nome_parceiro,email,whatsapp,data_casamento,local,cidade,convidados,mensagem,origem,created_at")
    .order("created_at", { ascending: false }).limit(100);
  state.leads = data || [];
}
async function loadAgenda(){
  const { data } = await supabase.from("propostas")
    .select("id,status,cliente_nome,cliente_parceiro,evento_data")
    .in("status", ["reservada","fechada"]).not("evento_data","is",null)
    .order("evento_data", { ascending: true });
  state.agenda = data || [];
}
async function getProposta(id){
  const { data } = await supabase.from("propostas").select("*").eq("id", id).maybeSingle();
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
  state.view = view; render();
}
async function novaProposta(){ state.editing = null; await loadLeads(); state.view = "form"; render(); }
async function openProposta(id){ const p = await getProposta(id); if (p){ state.current = p; state.view = "detalhe"; render(); } }
async function editProposta(id){ const p = await getProposta(id); if (p){ state.editing = p; state.view = "form"; render(); } }

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
  else body=viewLista();
  root.innerHTML = `
    <header class="topbar">
      <div class="left"><img src="logo_bellus.png" alt="Bellus"/><span class="who">Olá, <b>${esc(state.membro.nome)}</b> · ${PAPEL[state.membro.papel]||esc(state.membro.papel)}</span></div>
      <nav>
        <button class="btn btn-light" data-go="dashboard">Visão geral</button>
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
function waMsg(p){
  const nome=p.cliente_nome||""; const link=LINK_BASE+p.slug; const quem=p.consultor||"Thiago";
  const ola=`Oi ${nome}! Aqui é o ${quem}, da Bellus Eventos.`;
  let corpo;
  if(p.status==="enviada") corpo=`Enviei a proposta do casamento de vocês e queria saber se conseguiu dar uma olhada. Segue o link: ${link}`;
  else if(p.status==="visualizada") corpo=`Vi que vocês deram uma olhada na proposta. Posso tirar alguma dúvida ou ajustar algo pra vocês? ${link}`;
  else if(p.status==="negociando") corpo=`Dando sequência à nossa conversa sobre o casamento de vocês. Qualquer dúvida, estou por aqui: ${link}`;
  else if(p.status==="reservada"||p.status==="fechada") corpo=`Que alegria ter vocês com a gente! Vamos alinhar os próximos passos?`;
  else corpo=`Preparei a proposta do casamento de vocês, segue o link: ${link}`;
  return `${ola} ${corpo}`;
}
function waLink(p){ const d=waDigits(p.cliente_telefone); return d ? `https://wa.me/${d}?text=${encodeURIComponent(waMsg(p))}` : ""; }
function mailLink(p){
  if(!p.cliente_email) return "";
  const nome=p.cliente_nome||""; const link=LINK_BASE+p.slug; const quem=p.consultor||"Thiago Rodrigues";
  const corpo=`Oi ${nome},\n\nSegue a proposta do casamento de vocês:\n${link}\n\nQualquer dúvida, é só responder este e-mail.\n\nAbraço,\n${quem}\nBellus Eventos`;
  return `mailto:${p.cliente_email}?subject=${encodeURIComponent("Sua proposta - Bellus Eventos")}&body=${encodeURIComponent(corpo)}`;
}
function contatoBtns(p){
  const wl=waLink(p), ml=mailLink(p);
  return (wl?`<a class="cbtn wa" href="${esc(wl)}" target="_blank" rel="noopener">WhatsApp</a>`:"")
       + (ml?`<a class="cbtn em" href="${esc(ml)}">E-mail</a>`:"");
}
function detContato(p){
  const wl=waLink(p), ml=mailLink(p);
  const emailCell = ml ? `<a href="${esc(ml)}">${esc(p.cliente_email)}</a>` : esc(p.cliente_email||"—");
  const telCell = wl ? `<a href="${esc(wl)}" target="_blank" rel="noopener">${esc(p.cliente_telefone)}</a>` : esc(p.cliente_telefone||"—");
  return `<div class="section-label">Cliente</div>
  <div class="detbox">
    <div class="drow"><span>E-mail</span><b>${emailCell}</b></div>
    <div class="drow"><span>WhatsApp</span><b>${telCell}</b></div>
  </div>
  <div class="contato-acoes">${contatoBtns(p)}</div>`;
}
// ---------- dashboard ----------
let dashCharts = [];
async function renderCharts(){
  const host = document.getElementById("dash-charts");
  if(!host) return;
  dashCharts.forEach((c)=>{ try{ c.destroy(); }catch(e){} });
  dashCharts = [];
  const ps = state.propostas;
  if(!ps.length){ host.style.display="none"; return; }
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
}
async function renderMovimentacoes(){
  const host = document.getElementById("mov-list");
  if(!host) return;
  let data;
  try {
    const r = await supabase.from("proposta_eventos")
      .select("status_anterior,status_novo,criado_em,propostas(cliente_nome,cliente_parceiro)")
      .order("criado_em",{ascending:false}).limit(8);
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
  return `
  <div class="page-head"><h2 class="serif">Visão geral</h2><button class="btn btn-primary" data-nova>Nova proposta</button></div>
  <div class="dcards">${cardsHTML}</div>
  <div class="section-label" style="margin-top:1.8rem">Gráficos</div>
  <div class="dcharts" id="dash-charts">
    <div class="chart-card chart-wide"><div class="chart-title">Propostas por mês</div><div class="chart-box"><canvas id="ch-mes"></canvas></div></div>
    <div class="chart-card"><div class="chart-title">Distribuição por status</div><div class="chart-box"><canvas id="ch-status"></canvas></div></div>
    <div class="chart-card"><div class="chart-title">Funil de conversão</div><div class="chart-box"><canvas id="ch-funil"></canvas></div></div>
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
  ${fuBlock}`;
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
function listaContHTML(q){
  q=(q||"").trim().toLowerCase();
  const ps=state.propostas.filter((p)=> !q || [p.cliente_nome,p.cliente_parceiro,p.cliente_email,p.slug].some((x)=>(x||"").toLowerCase().includes(q)));
  if(!ps.length) return `<div class="empty"><p>${q?`Nada encontrado para "${esc(q)}".`:"Nenhuma proposta ainda."}</p></div>`;
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
  return head+`<input class="lista-busca" id="lista-busca" type="search" placeholder="Buscar por nome, e-mail ou link..." value="${esc(state.listaBusca||"")}" autocomplete="off"/><div id="lista-cont">${listaContHTML(state.listaBusca||"")}</div>`;
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
  const h=f.querySelector('[name="lead_id"]'); if(h) h.value=lead.id;
}
function viewForm(){
  const ed = state.editing;
  const v = (n, def="") => (ed ? (ed[n] ?? "") : def);
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
    <div class="grid cols-2">
      ${field("Tipo","evento_tipo",{val:v("evento_tipo","Casamento")})}
      ${field("Data","evento_data",{type:"date",val:v("evento_data")})}
      ${field("Local","evento_local",{ph:"Espaço / igreja",val:v("evento_local")})}
      ${field("Cidade","evento_cidade",{ph:"Teresópolis",val:v("evento_cidade")})}
      ${field("Convidados","evento_convidados",{ph:"Ex.: 120",val:v("evento_convidados")})}
      ${field("Disponibilidade","disponibilidade",{select:DISP,val:v("disponibilidade","available")})}
    </div>
    ${field("Observações","evento_notas",{textarea:true,ph:"O que o casal contou",val:v("evento_notas")})}
    <div class="section-label">Proposta</div>
    <div class="grid cols-2">
      ${field("Experiência recomendada","pacote_recomendado",{select:[["","Nenhuma"]].concat(PACOTES.map((p)=>[p.id,p.nome])),val:v("pacote_recomendado")})}
      ${field("Status","status",{select:STATUS,val:v("status","rascunho")})}
      ${field("Validade da proposta","expira_em",{type:"date",val:v("expira_em")})}
      ${field("Consultor","consultor",{val:v("consultor","Thiago Rodrigues")})}
    </div>
    ${field("Motivo da recomendação","recomendacao_motivo",{textarea:true,ph:"Por que essa experiência combina com eles",val:v("recomendacao_motivo")})}
    ${field("Mensagem pessoal de abertura","mensagem_pessoal",{textarea:true,ph:"Deixe em branco para gerar depois",val:v("mensagem_pessoal")})}
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
function viewDetalhe(){
  const p = state.current;
  return `
  <div class="page-head"><h2 class="serif">Proposta</h2><button class="btn btn-ghost" data-go="lista">Voltar</button></div>
  <div class="detalhe">
    <div class="detalhe-head"><h3>${esc(nomes(p))}</h3><span class="badge ${esc(p.status)}">${esc(statusTxt(p.status))}</span></div>
    ${detContato(p)}
    ${detSection("Evento", [["Tipo",p.evento_tipo],["Data",fmtData(p.evento_data)],["Local",p.evento_local],["Cidade",p.evento_cidade],["Convidados",p.evento_convidados],["Disponibilidade",dispTxt(p.disponibilidade)],["Observações",p.evento_notas]])}
    ${detSection("Proposta", [["Experiência recomendada",pacoteNome(p.pacote_recomendado)],["Validade",fmtData(p.expira_em)],["Consultor",p.consultor],["Motivo da recomendação",p.recomendacao_motivo],["Mensagem pessoal",p.mensagem_pessoal]])}
    ${detSection("Acompanhamento", [["Enviada", tsRel(p.enviada_em)],["Visualizada", p.visualizada_em?tsRel(p.visualizada_em):"Ainda não abriu"],["Visualizações", String(p.visualizacoes||0)]])}
    <div class="linkbox">
      <span>Link para enviar à noiva</span>
      <code id="prop-link">${esc(LINK_BASE + p.slug)}</code>
      <div class="linkactions">
        <button class="btn btn-ghost" id="btn-copiar">Copiar link</button>
        <a class="btn btn-ghost" href="${esc(LINK_BASE + p.slug)}" target="_blank" rel="noopener">Abrir</a>
      </div>
    </div>
    <div class="form-actions" id="det-actions">
      <button class="btn btn-primary" data-edit="${p.id}">Editar</button>
      ${isAdmin() ? `<button class="btn btn-danger" id="btn-del">Excluir</button>` : ``}
    </div>
  </div>`;
}
function viewAgenda(){
  const items = state.agenda.map((p)=>`
    <div class="agenda-item" data-open="${p.id}" style="cursor:pointer">
      <div class="data">${fmtData(p.evento_data)}<small>${esc(statusTxt(p.status))}</small></div>
      <div class="nome">${esc(nomes(p))}</div>
    </div>`).join("");
  const list = state.agenda.length
    ? `<div class="plist">${items}</div>`
    : `<div class="empty"><p>Nenhuma data reservada ainda.</p><p class="muted">As datas aparecem aqui quando uma proposta vira <b>Reservada</b> ou <b>Fechada</b>.</p></div>`;
  return `<div class="page-head"><h2 class="serif">Agenda</h2><button class="btn btn-ghost" data-go="lista">Propostas</button></div>${list}`;
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
      <label><span>E-mail</span><input id="email" type="email" required autocomplete="username" placeholder="voce@email.com"/></label>
      <label><span>Senha</span><input id="password" type="password" required autocomplete="current-password" placeholder="Sua senha"/></label>
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
  if (document.getElementById("dash-charts")) renderCharts();
  if (document.getElementById("mov-list")) renderMovimentacoes();
  document.querySelectorAll("[data-nova]").forEach((b)=> b.addEventListener("click", novaProposta));
  document.querySelectorAll("[data-open]").forEach((b)=> b.addEventListener("click", ()=>openProposta(b.getAttribute("data-open"))));
  document.querySelectorAll("[data-edit]").forEach((b)=> b.addEventListener("click", ()=>editProposta(b.getAttribute("data-edit"))));
  const lo=document.getElementById("logout"); if(lo) lo.addEventListener("click", doLogout);

  const lb=document.getElementById("lista-busca");
  if(lb) lb.addEventListener("input", ()=>{
    state.listaBusca=lb.value;
    const cont=document.getElementById("lista-cont");
    if(cont){ cont.innerHTML=listaContHTML(lb.value); cont.querySelectorAll("[data-open]").forEach((b)=> b.addEventListener("click", ()=>openProposta(b.getAttribute("data-open")))); }
  });

  const cop=document.getElementById("btn-copiar");
  if (cop) cop.addEventListener("click", async ()=>{
    try { await navigator.clipboard.writeText(LINK_BASE + state.current.slug); cop.textContent="Copiado!"; setTimeout(()=>{cop.textContent="Copiar link";},1600); }
    catch(e){ cop.textContent="Copie o link acima"; }
  });

  const fp=document.getElementById("form-proposta");
  if (fp) fp.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const o={}; new FormData(fp).forEach((v,k)=>{ const s=String(v).trim(); o[k]= s===""?null:s; });
    if (!o.cliente_nome) return setMsg("form-msg","Informe o nome do cliente.","err");
    const btn=document.getElementById("salvar"); btn.disabled=true; btn.textContent="Salvando...";
    const err = await saveProposta(o, state.editing?.id || null);
    if (err){ btn.disabled=false; btn.textContent="Salvar"; return setMsg("form-msg","Erro ao salvar: "+err,"err"); }
    state.editing=null; go("lista");
  });

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
