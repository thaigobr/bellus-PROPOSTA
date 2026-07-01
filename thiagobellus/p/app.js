(function () {
  "use strict";

  var FN = "https://nngvxucybligmanbedrs.supabase.co/functions/v1/get-proposta";
  var FN_COBRANCA = "https://nngvxucybligmanbedrs.supabase.co/functions/v1/asaas-cobranca-pro";
  var FN_STATUS = "https://nngvxucybligmanbedrs.supabase.co/functions/v1/asaas-status";
  var ANON = "sb_publishable_UhC5LHa4Ob5vSY4K5xrM5Q_LG3pllu-";
  var WHATS = "5521981636666";
  var INSPECT = location.search.indexOf("inspect") !== -1;
  var compPeeked = false, compResize = null;
  var MAXP = 3; // parcelas máximas no cartão

  // Valores SEMPRE definidos por proposta (price_overrides no painel). preco 0 = formato oculto.
  var PACOTES = [
    { id:"pro-foto", nome:"Foto", preco:0, pos:"O registro em fotografia.", best:"Para quem precisa da cobertura fotográfica, com olhar profissional e edição cuidadosa.",
      entregas:[["Cobertura fotográfica",1],["Fotos selecionadas e editadas"],["Entrega digital organizada"]] },
    { id:"pro-video", nome:"Vídeo", preco:0, pos:"O audiovisual em essência.", best:"O principal do trabalho: filme com narrativa, captação e edição cinematográficas.",
      entregas:[["Filme editado do projeto",1],["Captação profissional"],["Cor e som tratados"],["Narrativa sob medida"],["Entrega digital"]] },
    { id:"pro-video-foto", nome:"Vídeo e Foto", preco:0, pos:"A cobertura completa.", best:"Imagem em movimento e fotografia no mesmo projeto, com unidade de linguagem.",
      entregas:[["Filme editado do projeto",1],["Cobertura fotográfica",1],["Captação profissional"],["Cor e som tratados"],["Fotos selecionadas e editadas"],["Entrega digital organizada"]] },
  ];
  var ADDONS = [];
  var PAGAMENTOS = [
    { id:"avista", kind:"full", label:"Pagamento via PIX", desc:"Valor integral no Pix, sem taxa.", discountRate:0 },
    { id:"cartao", kind:"installments", label:"Cartão de crédito em até 3x", desc:"No cartão via checkout seguro, com a taxa da operadora embutida.", maxInstallments:MAXP },
  ];
  var CTA_LABEL = { full:"Confirmar e contratar", installments:"Continuar para contratar" };
  var PROCESS = [
    ["Escolha do formato","Você escolhe o formato que faz sentido para o seu projeto."],
    ["Confirmação","O serviço é confirmado com a assinatura e o pagamento: Pix à vista ou cartão em até 3x."],
    ["Alinhamento","Conversamos sobre o objetivo, o roteiro e as referências do projeto."],
    ["Captação","Presença profissional e discreta, com equipamento de cinema."],
    ["Edição","Seleção, montagem, cor e som: o material vira entrega final."],
    ["Entrega","Arquivos finais por link, organizados e prontos para usar."],
  ];
  var PORTFOLIO = [ ["ePwx8bsoztI",1.35], ["We-jTlYiLC4",1.35], ["_O0Kialgkzo",0] ];
  var FEATURES = [
    ["Filme editado",{"pro-foto":false,"pro-video":true,"pro-video-foto":true}],
    ["Cobertura fotográfica",{"pro-foto":true,"pro-video":false,"pro-video-foto":true}],
    ["Captação profissional",{"pro-foto":true,"pro-video":true,"pro-video-foto":true}],
    ["Cor e som de cinema",{"pro-foto":false,"pro-video":true,"pro-video-foto":true}],
    ["Fotos editadas",{"pro-foto":true,"pro-video":false,"pro-video-foto":true}],
    ["Entrega digital",{"pro-foto":true,"pro-video":true,"pro-video-foto":true}],
  ];
  var MESES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  var DIAS=["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];

  var esc=function(s){return (s==null?"":String(s)).replace(/[&<>"']/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];});};
  function brl(n){return "R$ "+Number(n).toLocaleString("pt-BR");}
  function brlC(n){return "R$ "+Number(n).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});}
  function dataLonga(d){if(!d)return "";var p=d.split("-");return parseInt(p[2],10)+" de "+MESES[parseInt(p[1],10)-1]+" de "+p[0];}
  function dataSemana(d){if(!d)return "Data a definir";var dt=new Date(d+"T12:00:00");return DIAS[dt.getDay()]+", "+dataLonga(d);}
  function dataCurta(d){if(!d)return "";var p=d.split("-");return p[2]+"/"+p[1]+"/"+p[0];}
  function nomes(p){return p.cliente_parceiro?(p.cliente_nome+" & "+p.cliente_parceiro):p.cliente_nome;}
  function getSlug(){var u=new URL(location.href);var q=u.searchParams.get("s");if(q)return q;var m=u.pathname.match(/\/p\/([^\/?#]+)/);return m?decodeURIComponent(m[1]):"";}
  function preco(pk){var ov=P.proposta.price_overrides&&P.proposta.price_overrides[pk.id];return (ov!=null&&ov>0)?ov:pk.preco;}
  function pacotesVis(){var v=PACOTES.filter(function(pk){return preco(pk)>0;});return v.length?v:PACOTES;}
  var CK='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var WA='<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.748-.985zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z"/></svg>';
  var PLAY='<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l11-7-11-7z"/></svg>';
  var IG='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>';

  var P = { proposta:null, pkgId:null, qty:{}, downsell:false, payId:"avista", terms:false };

  function selPkg(){return PACOTES.find(function(p){return p.id===P.pkgId;});}
  function visibleAddons(){return ADDONS;}
  function effAddon(a){return a;}
  function lines(){return [];}
  function incluiPrevia(){return false;}
  function selPay(){return PAGAMENTOS.find(function(o){return o.id===P.payId;});}
  function addonTotal(a,q){return 0;}
  function breakdown(){
    var pk=selPkg();
    var desloc=Math.max(0,parseInt((P.proposta&&P.proposta.deslocamento)||0,10)||0);
    var subtotal=preco(pk)+desloc; var pay=selPay();
    var disc=Math.round(subtotal*((pay&&pay.discountRate)||0)); var total=subtotal-disc;
    var ic=null,iv=null,icTotal=null; if(pay&&pay.kind==="installments"&&pay.maxInstallments){ic=pay.maxInstallments;icTotal=totalCart(total,ic);iv=Math.round((icTotal/ic)*100)/100;}
    return {subtotal:subtotal,disc:disc,total:total,sig:null,sal:null,ic:ic,iv:iv,icTotal:icTotal,desloc:desloc};
  }
  function waBase(extra){var p=P.proposta;var num=(p.whatsapp||WHATS).replace(/\D/g,"");return "https://wa.me/"+num+"?text="+encodeURIComponent(extra);}
  function dataTxt(){var d=P.proposta.evento_data;return d?dataCurta(d):"a definir";}
  function dataOcupada(){var p=P.proposta;return (p.data_ocupada===true)||(p.disponibilidade==="unavailable");}
  function waFalar(){var pk=selPkg();var b=breakdown();return waBase("Olá, Thiago! Sobre a proposta de "+nomes(P.proposta)+" (serviço em "+dataTxt()+"). Estou vendo o formato "+pk.nome+" ("+brl(b.total)+") e gostaria de conversar.");}
  function waCorrigir(){return waBase("Olá, Thiago! Sobre a proposta de "+nomes(P.proposta)+" (data "+dataTxt()+"), uma informação do projeto mudou:");}
  function waReservar(){var b=breakdown();var pk=selPkg();var pay=selPay();return waBase("Olá, Thiago! Quero confirmar o serviço ("+nomes(P.proposta)+", "+dataTxt()+").\nFormato: "+pk.nome+" ("+brl(b.total)+")\nCondição: "+(pay?pay.label:"-")+"\nComo seguimos?");}
  function waDataAlternativa(){return waBase("Olá, Thiago! Estou com a proposta de "+nomes(P.proposta)+" em mãos. Vi que a data "+dataTxt()+" já está comprometida. Tenho interesse no trabalho e gostaria de verificar outra data ou horário. Conseguem me ajudar?");}

  // ── Pagamento via Pix/cartão (Asaas): QR dentro da própria proposta + acompanhamento ──
  function fmtCpf(v){ v=(v||"").replace(/\D/g,"").slice(0,11);
    if(v.length>9)return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/,"$1.$2.$3-$4");
    if(v.length>6)return v.replace(/(\d{3})(\d{3})(\d{1,3})/,"$1.$2.$3");
    if(v.length>3)return v.replace(/(\d{3})(\d{1,3})/,"$1.$2"); return v; }
  var pixPoll=null;
  function fecharPix(){ if(pixPoll){clearInterval(pixPoll);pixPoll=null;} var o=document.getElementById("pixov"); if(o)o.remove(); document.body.style.overflow=""; }
  var pgCond="avista", pgMet="", pgValor=0;
  function taxaCart(n){ return n<=1?0.0299:(n<=6?0.0349:0.0399); }
  function totalCart(v,n){ return (v+0.49)/(1-taxaCart(n)); }
  function abrirPix(cond, met){
    pgCond=["avista","cartao"].indexOf(cond)>=0?cond:"avista"; pgMet=met||"";
    var ehCartao=pgCond==="cartao";
    var b=breakdown();
    if(window.fbq) fbq("track","InitiateCheckout",{value:b.total||0,currency:"BRL"});
    var topo, titu, subq;
    if(ehCartao){ topo="Pagar no cartão"; titu="Cartão de crédito"; subq="Escolha em quantas vezes quer parcelar (até "+MAXP+"x). A taxa do cartão já vem embutida em cada parcela."; }
    else { topo="Pagamento à vista"; titu="Pix"; subq="Você paga <b>"+brl(b.total)+"</b> no Pix, sem taxa. Confirma o serviço na hora."; }
    var parcHtml="";
    if(ehCartao){
      var os="";
      for(var n=1;n<=MAXP;n++){ var t=totalCart(b.total,n); os+='<option value="'+n+'">'+n+'x de '+brlC(t/n)+(n>1?' (total '+brlC(t)+')':' à vista')+'</option>'; }
      parcHtml='<label class="pixlab" for="pixparc">Em quantas vezes?</label><select id="pixparc" class="pixinp">'+os+'</select>';
    }
    var ov=document.createElement("div"); ov.id="pixov"; ov.className="pixov";
    ov.innerHTML='<div class="pixbox" role="dialog" aria-modal="true">'+
      '<button class="pixx" aria-label="Fechar">&times;</button>'+
      '<div class="pixstep" data-step="1">'+
        '<p class="eyebrow">'+topo+'</p><h3 class="serif">'+titu+'</h3>'+
        '<p class="pixsub">'+subq+'</p>'+
        parcHtml+
        '<label class="pixlab" for="pixcpf">CPF do pagador</label>'+
        '<input id="pixcpf" class="pixinp" inputmode="numeric" autocomplete="off" placeholder="000.000.000-00" maxlength="14"/>'+
        '<p class="pixmsg" id="pixmsg"></p>'+
        '<button class="btn btn-gold pixfull" id="pixgerar">'+(ehCartao?"Ir para o cartão":"Gerar Pix")+'</button>'+
        '<p class="pixfoot">Pagamento processado com segurança pelo Asaas.</p>'+
      '</div>'+
      '<div class="pixstep" data-step="2" hidden>'+
        '<h3 class="serif">Escaneie e pague</h3>'+
        '<p class="pixsub">Valor: <b id="pixval"></b></p>'+
        '<div class="pixqr" id="pixqr"></div>'+
        '<button class="btn btn-ghost pixfull" id="pixcopy">Copiar código Pix</button>'+
        '<p class="pixwait"><span class="pixdot"></span> Aguardando o pagamento. Esta tela atualiza sozinha.</p>'+
        '<p class="pixfoot">No app do banco: Pix › Ler QR Code, ou use o Pix Copia e Cola.</p>'+
      '</div>'+
      '<div class="pixstep" data-step="3" hidden>'+
        '<div class="pixok">'+CK+'</div><h3 class="serif">Pagamento confirmado!</h3>'+
        '<p class="pixsub">Seu serviço está confirmado. O Thiago já foi avisado e entra em contato.</p>'+
        '<button class="btn btn-gold pixfull" id="pixdone">Ver minha contratação</button>'+
      '</div>'+
    '</div>';
    document.body.appendChild(ov); document.body.style.overflow="hidden";
    ov.querySelector(".pixx").addEventListener("click",fecharPix);
    ov.addEventListener("click",function(e){ if(e.target===ov)fecharPix(); });
    var cpf=document.getElementById("pixcpf");
    cpf.addEventListener("input",function(){ cpf.value=fmtCpf(cpf.value); });
    try{cpf.focus();}catch(_e){}
    document.getElementById("pixgerar").addEventListener("click",gerarPix);
  }
  function gerarPix(){
    var btn=document.getElementById("pixgerar"), msg=document.getElementById("pixmsg");
    var cpf=(document.getElementById("pixcpf").value||"").replace(/\D/g,"");
    if(cpf.length!==11){ msg.textContent="Digite um CPF válido (11 números)."; msg.classList.add("warn"); return; }
    if(btn.getAttribute("data-l"))return; btn.setAttribute("data-l","1");
    var ehCartaoG=pgCond==="cartao";
    var orig=btn.innerHTML; btn.innerHTML=ehCartaoG?"Abrindo…":"Gerando…"; msg.textContent=""; msg.classList.remove("warn");
    function falha(e){ btn.removeAttribute("data-l"); btn.innerHTML=orig; msg.textContent=e||"Não foi possível agora. Tente de novo."; msg.classList.add("warn"); }
    fetch(FN_COBRANCA,{method:"POST",headers:{"Content-Type":"application/json",apikey:ANON,Authorization:"Bearer "+ANON},body:JSON.stringify({slug:getSlug(),pkgId:P.pkgId,cond:pgCond,metodo:pgMet,cpf:cpf,qty:{},parcelas:(ehCartaoG&&document.getElementById("pixparc"))?parseInt(document.getElementById("pixparc").value,10)||1:1})})
      .then(function(r){return r.json().then(function(b){return{ok:r.ok,b:b};});})
      .then(function(r){
        if(!r.ok||!r.b){ falha(r.b&&r.b.error); return; }
        if(ehCartaoG){ if(!r.b.invoiceUrl){ falha(r.b.error); return; } window.location.href=r.b.invoiceUrl; return; }
        if(!r.b.qrPayload){ falha(r.b.error); return; }
        var box=document.getElementById("pixov"); if(!box)return;
        box.querySelector('[data-step="1"]').hidden=true;
        box.querySelector('[data-step="2"]').hidden=false;
        pgValor=r.b.valor||0;
        document.getElementById("pixval").textContent=brl(r.b.valor||0);
        document.getElementById("pixqr").innerHTML=r.b.qrImage?'<img alt="QR Code Pix" src="data:image/png;base64,'+r.b.qrImage+'"/>':'<p class="pixsub">Use o Copia e Cola abaixo.</p>';
        document.getElementById("pixcopy").addEventListener("click",function(){
          var t=r.b.qrPayload, c=this;
          function done(){ c.textContent="Código copiado!"; setTimeout(function(){c.textContent="Copiar código Pix";},2000); }
          if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(done).catch(function(){prompt("Copie o código Pix:",t);}); }
          else prompt("Copie o código Pix:",t);
        });
        pollPix(r.b.paymentId);
      })
      .catch(function(){ falha("Falha de conexão. Tente de novo."); });
  }
  function pollPix(paymentId){
    if(!paymentId)return; var n=0;
    pixPoll=setInterval(function(){
      n++; if(n>150){clearInterval(pixPoll);pixPoll=null;return;}
      fetch(FN_STATUS+"?paymentId="+encodeURIComponent(paymentId),{headers:{apikey:ANON,Authorization:"Bearer "+ANON}})
        .then(function(r){return r.json();})
        .then(function(b){ if(b&&(b.pago||b.reservado)){ clearInterval(pixPoll);pixPoll=null; pixOk(paymentId); } }).catch(function(){});
    },5000);
  }
  function pixOk(pid){
    if(window.fbq) fbq("track","Purchase",{value:pgValor||0,currency:"BRL"},pid?{eventID:String(pid)}:undefined);
    var box=document.getElementById("pixov"); if(!box)return;
    box.querySelector('[data-step="2"]').hidden=true;
    box.querySelector('[data-step="3"]').hidden=false;
    var d=document.getElementById("pixdone"); if(d)d.addEventListener("click",function(){ fecharPix(); location.reload(); });
  }
  function mostrarRetornoPagamento(){
    var pago=new URL(location.href).searchParams.get("pago");
    if(pago!=="1"&&pago!=="0") return;
    var d=document.createElement("div"); d.className="pay-return "+(pago==="1"?"ok":"no");
    d.innerHTML=pago==="1" ? "<b>Pagamento recebido!</b> Seu serviço está confirmado. O Thiago entra em contato em instantes." : "<b>Pagamento não concluído.</b> Sua proposta continua aqui, é só tentar quando quiser.";
    document.body.appendChild(d);
    requestAnimationFrame(function(){ d.classList.add("show"); });
    setTimeout(function(){ d.classList.remove("show"); setTimeout(function(){ d.remove(); }, 400); }, 9000);
  }

  // ── partículas (porta de ParticlesCanvas: reage ao scroll) ──
  function initParticles(canvas){
    if(INSPECT)return; var ctx=canvas.getContext("2d"); if(!ctx)return;
    var reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dpr=Math.min(devicePixelRatio||1,2); var W=0,H=0,vis=true,tick=false,ps=[];
    var fade=parseFloat(canvas.getAttribute("data-fade"));
    function seed(){
      var r=canvas.getBoundingClientRect(); W=r.width; H=r.height;
      canvas.width=Math.max(1,Math.floor(W*dpr)); canvas.height=Math.max(1,Math.floor(H*dpr));
      ctx.setTransform(dpr,0,0,dpr,0,0);
      var n=Math.round(Math.min(160,Math.max(70,(W*H)/7000))); ps=[];
      for(var i=0;i<n;i++){var em=Math.random()<0.12;ps.push({bx:Math.random(),by:Math.random(),r:em?1.6+Math.random()*1.4:0.4+Math.random()*1.4,depth:0.12+Math.random()*0.9,alpha:em?0.55+Math.random()*0.3:0.22+Math.random()*0.45,hue:38+Math.random()*8,sat:45+Math.random()*18,light:58+Math.random()*22,seed:Math.random()*Math.PI*2,drift:6+Math.random()*18,em:em});}
    }
    function prog(){var r=canvas.getBoundingClientRect();return innerHeight-r.top;}
    function draw(){
      var pr=reduced?0:prog(); ctx.clearRect(0,0,W,H);
      for(var i=0;i<ps.length;i++){var p=ps[i];var tr=pr*p.depth*0.35;var y=(p.by*H-tr)%H;if(y<0)y+=H;var x=p.bx*W+Math.sin(p.seed+pr*0.0016)*p.drift;
        ctx.beginPath();if(p.em){ctx.shadowColor="hsla("+p.hue+","+p.sat+"%,"+p.light+"%,0.9)";ctx.shadowBlur=6;}else{ctx.shadowBlur=0;}
        ctx.fillStyle="hsla("+p.hue+","+p.sat+"%,"+p.light+"%,"+p.alpha+")";ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();}
      ctx.shadowBlur=0;
    }
    function onScroll(){if(reduced||!vis)return;if(!tick){tick=true;requestAnimationFrame(function(){draw();tick=false;});}}
    seed();draw();
    addEventListener("resize",function(){seed();draw();},{passive:true});
    if(!reduced)addEventListener("scroll",onScroll,{passive:true});
    new IntersectionObserver(function(e){vis=e[0].isIntersecting;if(vis)draw();},{threshold:0}).observe(canvas);
    if(!isNaN(fade)){var g="linear-gradient(to bottom,#000 "+Math.round(fade*100)+"%,transparent 100%)";canvas.style.webkitMaskImage=g;canvas.style.maskImage=g;}
  }
  function part(fade){return '<canvas class="particles" data-particles data-fade="'+fade+'" aria-hidden="true"></canvas>';}

  // ── regiões dinâmicas ──
  function paintExp(){
    if(!document.getElementById("r-exp"))return;
    var rec=P.proposta.pacote_recomendado;
    var html=pacotesVis().map(function(pk){var sel=pk.id===P.pkgId;var is3=totalCart(preco(pk),MAXP)/MAXP;
      return '<div class="pcard'+(sel?" sel":"")+'">'+(pk.id===rec?'<span class="pcard__rec">★ Recomendado</span>':'')+
        '<div class="pcard__name">'+esc(pk.nome)+'</div><div class="pcard__pos">'+esc(pk.pos)+'</div>'+
        '<div class="pcard__price"><div class="pcard__parc"><span class="x">'+MAXP+'x de</span><span class="v serif tnum">'+brlC(is3)+'</span></div><div class="pcard__full">ou '+brl(preco(pk))+' à vista no Pix</div></div>'+
        '<div class="pcard__best"><b>Indicado para:</b> '+esc(pk.best)+'</div>'+
        '<ul class="pcard__list">'+pk.entregas.map(function(e){return '<li class="'+(e[1]?"h":"")+'">'+CK+'<span>'+esc(e[0])+'</span></li>';}).join("")+'</ul>'+
        '<button class="pcard__btn" data-pick="'+pk.id+'">'+(sel?CK+" Selecionado":"Selecionar")+'</button></div>';
    }).join("");
    var el=document.getElementById("r-exp"); el.innerHTML='<div class="exp-grid">'+html+'</div>';
    el.querySelectorAll("[data-pick]").forEach(function(b){b.addEventListener("click",function(){pick(b.getAttribute("data-pick"));});});
  }

  function paintComp(){
    if(!document.getElementById("r-comp"))return;
    var rec=P.proposta.pacote_recomendado;
    var vis=pacotesVis();
    function cell(v){if(v===true)return '<span class="ccheck">'+CK+'</span>';if(v===false||v==null)return '<span class="cno">Não</span>';return '<span class="cv">'+esc(v)+'</span>';}
    var head='<th class="ccrit">Critério</th>'+vis.map(function(p){var sel=p.id===P.pkgId;return '<th><button class="chead'+(sel?" sel":"")+'" data-pick="'+p.id+'"><span class="cn">'+esc(p.nome)+'</span>'+(p.id===rec?'<span class="crec">Recomendado</span>':'')+'</button></th>';}).join("");
    var rows=FEATURES.map(function(f,i){return '<tr'+(i%2?' class="alt"':'')+'><th class="crit">'+esc(f[0])+'</th>'+vis.map(function(p){return '<td class="'+(p.id===P.pkgId?"selcol":"")+'">'+cell(f[1][p.id])+'</td>';}).join("")+'</tr>';}).join("");
    var el=document.getElementById("r-comp");
    el.innerHTML='<div class="comp-scroll"><div class="ctable-wrap"><table class="ctable"><thead><tr>'+head+'</tr></thead><tbody>'+rows+'</tbody></table></div></div><span class="comp-cue" aria-hidden="true"><span class="ca">&#8594;</span> Arraste para o lado para comparar</span>';
    el.querySelectorAll("[data-pick]").forEach(function(b){b.addEventListener("click",function(){pick(b.getAttribute("data-pick"));});});
    setupCompScroll(el);
  }
  function setupCompScroll(el){
    var scroll=el.querySelector(".comp-scroll"), wrap=el.querySelector(".ctable-wrap");
    if(!scroll||!wrap)return;
    function upd(){
      var canScroll=wrap.scrollWidth-wrap.clientWidth>4;
      scroll.classList.toggle("scrollable",canScroll);
      var atEnd=wrap.scrollLeft+wrap.clientWidth>=wrap.scrollWidth-4;
      scroll.classList.toggle("at-end",canScroll&&atEnd);
    }
    wrap.addEventListener("scroll",upd,{passive:true});
    if(compResize)window.removeEventListener("resize",compResize);
    compResize=upd; window.addEventListener("resize",upd);
    upd();
    if(!compPeeked&&"IntersectionObserver" in window){
      var io=new IntersectionObserver(function(es){
        es.forEach(function(e){
          if(e.isIntersecting&&!compPeeked&&wrap.scrollWidth-wrap.clientWidth>4){
            compPeeked=true; io.disconnect();
            var max=wrap.scrollWidth-wrap.clientWidth;
            wrap.scrollTo({left:Math.min(64,max),behavior:"smooth"});
            setTimeout(function(){wrap.scrollTo({left:0,behavior:"smooth"});},750);
          }
        });
      },{threshold:0.35});
      io.observe(scroll);
    }
  }

  function alemHtml(){ return ""; }
  function summaryHtml(){
    var pk=selPkg(); var b=breakdown(); var pay=selPay(); var p=P.proposta;
    var h='<div class="summary"><div style="display:flex;justify-content:space-between;align-items:baseline"><h3>Sua contratação</h3><span class="ev">'+esc(p.evento_tipo||"Serviço audiovisual")+(p.evento_data?" · "+dataCurta(p.evento_data):"")+'</span></div>';
    h+='<div style="margin-top:1rem"><div class="sline strong"><span class="l">Formato '+esc(pk.nome)+'</span><span class="v tnum">'+brl(preco(pk))+'</span></div></div>';
    if(b.desloc>0)h+='<div class="ssum-step"><div class="top"><span>Deslocamento e logística</span><span class="tnum">+ '+brl(b.desloc)+'</span></div></div>';
    h+='<hr class="shr"><div class="sline"><span class="l">Subtotal</span><span class="v tnum">'+brl(b.subtotal)+'</span></div>';
    if(b.disc>0)h+='<div class="sline accent"><span class="l">Desconto à vista</span><span class="v tnum">menos '+brl(b.disc)+'</span></div>';
    h+='<div class="stotal"><span class="l">Total</span><span class="v tnum">'+brl(b.total)+'</span></div>';
    if(pay&&pay.kind==="installments"&&b.iv!=null)h+='<div class="sbox"><div class="sline strong"><span class="l">Em até '+b.ic+'x no cartão</span><span class="v tnum">'+brlC(b.iv)+'</span></div><div class="sline"><span class="l">Total no cartão (com a taxa)</span><span class="v tnum">'+brlC(b.icTotal)+'</span></div></div>';
    var dval=p.expira_em?diasPara(String(p.expira_em).slice(0,10)):null;
    var validadeTxt=dval==null?"":(dval>1?'<span class="sval-urge">Esta condição vale por mais '+dval+' dias.</span> ':dval===1?'<span class="sval-urge">Esta condição vale só até amanhã.</span> ':dval===0?'<span class="sval-urge">Esta condição vale só até hoje.</span> ':"");
    h+='<div class="svalidade">'+validadeTxt+'O serviço é confirmado após a assinatura do contrato e o pagamento.</div></div>';
    // checkout
    var lab=(pay&&CTA_LABEL[pay.kind])||"Confirmar e contratar";
    h+='<div class="checkout"><label class="terms"><input type="checkbox" id="terms"'+(P.terms?" checked":"")+'/><span>Li e concordo com os <a href="termos.html" target="_blank" rel="noopener">termos de contratação</a> e a <a href="privacidade.html" target="_blank" rel="noopener">política de privacidade</a>.</span></label>'+
      (dataOcupada()
        ? '<a class="btn btn-bloq ckbtn" id="reservar" href="'+waDataAlternativa()+'" target="_blank" rel="noopener">Essa data já está comprometida</a>'
        : '<a class="btn btn-gold ckbtn'+(P.terms?"":" off")+'" id="reservar" href="'+waReservar()+'" target="_blank" rel="noopener">'+esc(lab)+' →</a>')+
      '<p class="ck-msg" id="ck-msg">'+(dataOcupada()?"Essa data já está comprometida na agenda. Fale com o Thiago para ver alternativas.":(!P.terms?"Marque o aceite acima para contratar.":(selPay()&&selPay().kind==="installments")?"Pagamento no cartão em até "+MAXP+"x, em ambiente seguro.":"Pagamento à vista no Pix, sem taxa."))+'</p></div>';
    return h;
  }
  function paymentHtml(){
    var b=breakdown();
    var opts=PAGAMENTOS.map(function(o){var sel=o.id===P.payId;var pv="";
      if(o.kind==="full"){pv=brl(b.subtotal)+" à vista no Pix";}
      else if(o.kind==="installments"&&o.maxInstallments){pv="Em até "+o.maxInstallments+"x de "+brlC(totalCart(b.subtotal,o.maxInstallments)/o.maxInstallments)+" (com taxa)";}
      return '<button class="payopt'+(sel?" sel":"")+'" data-pay="'+o.id+'"><span class="rd">'+(sel?CK:"")+'</span><span><span class="lab">'+esc(o.label)+'</span><span class="ds">'+esc(o.desc)+'</span>'+(pv?'<span class="pv">'+esc(pv)+'</span>':'')+'</span></button>';
    }).join("");
    return '<div><h3 style="font-size:1.2rem">Como você prefere pagar</h3><p style="margin:.4rem 0 1rem;color:var(--ink-soft);font-size:.95rem">Escolha a condição que faz mais sentido para você.</p><div class="pay">'+opts+'</div></div>';
  }
  function reservado(){ var pg=P.proposta&&P.proposta.pagamento; return !!(pg&&pg.reservado); }
  function waReservada(){
    var pg=(P.proposta&&P.proposta.pagamento)||{};
    if((pg.saldo_centavos||0)>0) return waBase("Olá, Thiago! Sou da proposta de "+nomes(P.proposta)+". Já fiz um pagamento e quero combinar o restante. Como seguimos?");
    return waBase("Olá, Thiago! Sou da proposta de "+nomes(P.proposta)+". Está tudo pago e estou ansioso pelo serviço ("+dataTxt()+")!");
  }
  function pacoteContratado(){
    var pid=P.proposta&&P.proposta.pagamento&&P.proposta.pagamento.pacote_id;
    return PACOTES.find(function(x){return x.id===pid;})||selPkg();
  }
  function diasPara(d){ if(!d)return null; var h=new Date(); h.setHours(0,0,0,0); var e=new Date(d+"T00:00:00"); return Math.round((e-h)/86400000); }
  function reservaPainelHtml(){
    var p=P.proposta, pg=p.pagamento||{};
    var sinal=brl((pg.sinal_centavos||0)/100), saldo=brl((pg.saldo_centavos||0)/100);
    var temSaldo=(pg.saldo_centavos||0)>0;
    var quando=pg.ultimo_pago_em?dataCurta(String(pg.ultimo_pago_em).slice(0,10)):"";
    var totalPago=brl((pg.total_pago_centavos||0)/100);
    var pk=pacoteContratado();
    var dd=diasPara(p.evento_data);
    var countTxt=dd==null?"":(dd>1?'Faltam <b>'+dd+' dias</b> para o dia do serviço':dd===1?'É <b>amanhã</b>! Falta só 1 dia':dd===0?'<b>É hoje!</b> Bom trabalho pra nós':'Serviço realizado · obrigado pela confiança');
    var diaNum=p.evento_data?p.evento_data.split("-")[2]:"";
    var mesAbrev=p.evento_data?MESES[parseInt(p.evento_data.split("-")[1],10)-1].slice(0,3):"";
    return '<section class="section" id="contratacao"><div class="container">'+
      '<div class="shead"><p class="eyebrow">Sua contratação</p><h2 class="serif">Serviço confirmado!</h2></div>'+
      '<div class="reserva">'+
        '<div class="rsv-hero">'+
          '<span class="rsv-seal">'+CK+'</span>'+
          '<p class="rsv-congrats serif">Que alegria, '+esc(nomes(p))+'!</p>'+
          '<p class="rsv-msg">Seu serviço está <b>confirmado</b>. A partir de agora, cada detalhe importa: vamos cuidar de tudo para entregar um material à altura do seu projeto.</p>'+
        '</div>'+
        (p.evento_data?'<div class="rsv-date">'+
          '<div class="rsv-date-box"><span class="d serif">'+diaNum+'</span><span class="m">'+mesAbrev+'</span></div>'+
          '<div class="rsv-date-info"><div class="dw">'+dataSemana(p.evento_data)+'</div>'+((p.evento_local||p.evento_cidade)?'<div class="lo">'+esc([p.evento_local,p.evento_cidade].filter(Boolean).join(" · "))+'</div>':'')+(countTxt?'<div class="ct">'+countTxt+'</div>':'')+'</div>'+
        '</div>':'')+
        '<div class="rsv-pkg">'+
          '<p class="rsv-pkg-eyebrow"><span class="rsv-pkg-ck">'+CK+'</span> Formato contratado</p>'+
          '<div class="rsv-pkg-head"><span class="rsv-pkg-name serif">'+esc(pk.nome)+'</span><span class="rsv-pkg-price tnum">'+brl(preco(pk))+'</span></div>'+
          '<p class="rsv-pkg-pos">'+esc(pk.pos)+'</p>'+
          '<ul class="rsv-pkg-list">'+pk.entregas.slice(0,5).map(function(e){return '<li>'+CK+'<span>'+esc(e[0])+'</span></li>';}).join("")+'</ul>'+
        '</div>'+
        (temSaldo
          ? '<div class="rsv-rows">'+
              '<div class="rsv-row"><span class="l">Pago'+(quando?' <small>em '+quando+'</small>':'')+'</span><b class="tnum">'+sinal+'</b></div>'+
              '<div class="rsv-row total"><span class="l">Restante</span><b class="tnum">'+saldo+'</b></div>'+
            '</div>'+
            '<p class="rsv-info">Pague o restante como preferir: no Pix (sem taxa) ou no cartão (com a taxa).</p>'+
            '<a class="btn btn-gold rsv-btn" id="saldo-pix">Pagar restante no Pix · '+saldo+'</a>'
          : '<div class="rsv-paid"><span class="rsv-paid-ck">'+CK+'</span><div><div class="t">Pagamento concluído</div><div class="d">Tudo quitado'+(totalPago?' · '+totalPago:'')+'. Estamos ansiosos pelo dia!</div></div></div>'
        )+
        '<a class="btn btn-wa rsv-btn" href="'+waReservada()+'" target="_blank" rel="noopener">'+WA+' Falar com o Thiago</a>'+
      '</div></div></section>';
  }
  function paintConfig(){
    var el=document.getElementById("r-config");
    if(reservado()){ el.innerHTML=reservaPainelHtml(); setupTitleType(); var sp=document.getElementById("saldo-pix"); if(sp)sp.addEventListener("click",function(){abrirPix("avista","pix");}); return; }
    el.innerHTML=alemHtml()+'<section class="section" id="contratacao"><div class="container"><div class="shead"><p class="eyebrow">Resumo da contratação</p><h2 class="serif">Tudo claro, antes do próximo passo</h2></div><div class="cw"><div>'+paymentHtml()+'</div><div>'+summaryHtml()+'</div></div></div></section>';
    el.querySelectorAll("[data-pay]").forEach(function(b){b.addEventListener("click",function(){P.payId=b.getAttribute("data-pay");paintConfig();paintMbar();});});
    el.querySelectorAll("[data-scroll]").forEach(function(b){b.addEventListener("click",function(){var t=document.getElementById(b.getAttribute("data-scroll"));if(t)t.scrollIntoView({behavior:"smooth"});});});
    setupTitleType();
    var tc=document.getElementById("terms"), rb=document.getElementById("reservar"), msg=document.getElementById("ck-msg");
    if(tc)tc.addEventListener("change",function(){if(dataOcupada())return;P.terms=tc.checked;if(rb)rb.classList.toggle("off",!P.terms);if(msg)msg.textContent=P.terms?((selPay()&&selPay().kind==="installments")?"Pagamento no cartão em até "+MAXP+"x, em ambiente seguro.":"Pagamento à vista no Pix, sem taxa."):"Marque o aceite acima para contratar.";});
    if(rb)rb.addEventListener("click",function(e){
      if(dataOcupada())return;
      if(!P.terms){e.preventDefault();if(msg){msg.textContent="Marque o aceite acima para contratar.";msg.classList.add("warn");setTimeout(function(){msg.classList.remove("warn");},1800);}return;}
      var pay=selPay();
      if(pay&&pay.kind==="full"){ e.preventDefault(); abrirPix("avista"); }
      else if(pay&&pay.kind==="installments"){ e.preventDefault(); abrirPix("cartao"); }
    });
  }
  function paintMbar(){
    var el=document.getElementById("r-mbar");
    if(reservado()){ var saldoC=(P.proposta.pagamento.saldo_centavos||0); el.innerHTML='<div class="info"><div class="pk">Serviço confirmado</div><div class="tt serif tnum">'+(saldoC>0?'Restante '+brl(saldoC/100):'Tudo pago')+'</div></div><a class="btn btn-wa" href="'+waReservada()+'" target="_blank" rel="noopener">'+(saldoC>0?'Combinar':'Falar')+'</a>'; var cf0=document.getElementById("cta-final"); if(cf0)cf0.setAttribute("href",waReservada()); return; }
    var pk=selPkg(); var b=breakdown();
    el.innerHTML='<div class="info"><div class="pk">Formato '+esc(pk.nome)+'</div><div class="tt serif tnum">'+brl(b.total)+'</div><div class="mbar-sub">à vista no Pix · ou '+MAXP+'x no cartão</div></div>'+(dataOcupada()?'<a class="btn btn-bloq" href="'+waDataAlternativa()+'" target="_blank" rel="noopener">Data comprometida · ver outra</a>':'<a class="btn btn-wa" href="'+waReservar()+'" target="_blank" rel="noopener">Contratar</a>');
    var cf=document.getElementById("cta-final"); if(cf)cf.setAttribute("href",waFalar());
  }
  function pick(id){P.pkgId=id;paintExp();paintComp();paintConfig();paintMbar();}

  // ── Títulos: efeito de máquina de escrever (1x por título, mesmo em seções que re-renderizam) ──
  var titleReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var titleIO = null, titleTyped = {};
  function typeTitleEl(el){
    var key=(el.textContent||"").trim();
    if(titleTyped[key]) return;
    titleTyped[key]=true;
    var tokens=el.innerHTML.split(/(<br\s*\/?>)/i), units=[];
    tokens.forEach(function(t){ if(!t) return; if(/^<br/i.test(t)) units.push(t); else for(var k=0;k<t.length;k++) units.push(t.charAt(k)); });
    if(!units.length) return;
    el.style.minHeight=el.offsetHeight+"px";
    var i=0, buf="";
    function step(){
      if(i>=units.length){ el.innerHTML=buf; el.style.minHeight=""; return; }
      buf+=units[i]; i++;
      el.innerHTML=buf+'<span class="tw-caret" aria-hidden="true"></span>';
      setTimeout(step,35);
    }
    el.innerHTML='<span class="tw-caret" aria-hidden="true"></span>';
    step();
  }
  function setupTitleType(){
    if(titleReduced || !("IntersectionObserver" in window)) return;
    if(!titleIO){
      titleIO=new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting && !e.target.dataset.typed){ e.target.dataset.typed="1"; typeTitleEl(e.target); } });
      }, { threshold:0.25, rootMargin:"0px 0px -8% 0px" });
    }
    document.querySelectorAll("h2.serif, .hero__title").forEach(function(el){ if(el.dataset.tobs) return; el.dataset.tobs="1"; titleIO.observe(el); });
  }

  var revealIO=null;
  function setupReveal(){
    var els=document.querySelectorAll(".shead, .depo, .manif-fear, .rsv-hero");
    if(titleReduced || !("IntersectionObserver" in window)){ els.forEach(function(el){el.classList.add("is-visible");}); return; }
    els.forEach(function(el){ if(!el.dataset.rev){ el.dataset.rev="1"; el.classList.add("reveal"); } });
    if(!revealIO){ revealIO=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("is-visible"); revealIO.unobserve(e.target); } }); }, {threshold:0.18, rootMargin:"0px 0px -6% 0px"}); }
    els.forEach(function(el){ revealIO.observe(el); });
  }
  function build(){
    var p=P.proposta;
    var rsv=reservado();
    var rows=[["Serviço",p.evento_tipo||"Serviço audiovisual"],["Data",dataSemana(p.evento_data)],["Local",p.evento_local||"A definir"],["Cidade",p.evento_cidade||"A definir"]];
    if(p.evento_convidados)rows.push(["Convidados",p.evento_convidados]);
    var ocupada=dataOcupada();
    var av = ocupada ? ["unavailable","Essa data já está comprometida"] : (p.disponibilidade==="on_hold" ? ["on_hold","Data em pré-reserva"] : ["available","Data disponível no momento"]);
    var dataBanner = ocupada ? '<div class="datawarn"><p class="dw-t">Essa data já está comprometida</p><p class="dw-d">A data '+esc(dataCurta(p.evento_data))+' já consta com compromisso na agenda. Mas adoraríamos atender o seu projeto. Se tiver flexibilidade de data ou horário, fale com a gente que verificamos as opções na hora.</p><a class="btn btn-wa" href="'+waDataAlternativa()+'" target="_blank" rel="noopener">'+WA+' Falar sobre datas</a></div>' : '';
    var statusFechado = (p.status==="reservada"||p.status==="fechada");
    var ddEvt = diasPara(p.evento_data);
    var topInfo;
    if(statusFechado && ddEvt!=null){
      topInfo='<div class="hero__cd">'+(ddEvt>1?'<span class="cd-n serif">'+ddEvt+'</span><span class="cd-l">dias para o serviço</span>':ddEvt===1?'<span class="cd-l serif"><b>É amanhã!</b> Falta 1 dia</span>':ddEvt===0?'<span class="cd-l serif"><b>É hoje!</b> Bom trabalho pra nós</span>':'<span class="cd-l">Serviço realizado. Obrigado pela confiança.</span>')+'</div>';
    } else {
      topInfo='<span class="avail '+av[0]+'"><span class="dot '+av[0]+'"></span>'+av[1]+'</span>';
    }
    document.getElementById("app").innerHTML=
    '<header class="section--dark hero">'+part(0.6)+'<div class="hero__glow"></div><div class="container">'+
      '<img class="hero__logo" src="logo_bellus.png" alt="Thiago Bellus"/><p class="eyebrow eyebrow--light">Proposta para</p>'+
      '<h1 class="hero__title serif">'+esc(nomes(p))+'</h1>'+
      '<div class="hero__meta">'+[p.evento_tipo,dataLonga(p.evento_data),p.evento_local,p.evento_cidade].filter(Boolean).map(function(m,i){return i===0?'<span><b>'+esc(m)+'</b></span>':'<span>'+esc(m)+'</span>';}).join("")+'</div>'+
      topInfo+'<div class="hairline"></div></div></header>'+
    // O projeto
    '<section class="section" id="seu-evento"><div class="container"><div class="shead"><p class="eyebrow">O seu projeto</p><h2 class="serif">Os detalhes que já conhecemos</h2><p class="sub">Partimos do que você já nos contou, sem precisar repetir nada.</p></div>'+dataBanner+
      '<div class="evgrid"><div><dl class="evlist">'+rows.map(function(r){return '<div class="evrow"><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>';}).join("")+(p.evento_notas?'<div class="evrow notes"><dt>Observações</dt><dd>'+esc(p.evento_notas)+'</dd></div>':'')+'</dl>'+
      '<a class="evcorr" href="'+waCorrigir()+'" target="_blank" rel="noopener">Alguma informação mudou? Corrigir com a gente</a></div>'+
      (p.mensagem_pessoal?'<figure class="evmsg"><blockquote>“'+esc(p.mensagem_pessoal)+'”</blockquote><figcaption>'+esc(p.consultor||"Thiago Rodrigues")+', Thiago Bellus</figcaption></figure>':'')+'</div></div></section>'+
    // manifesto
    '<section class="section section--tint"><div class="container narrow"><p class="eyebrow">Por que registrar bem</p><p class="serif" style="font-size:clamp(1.9rem,5vw,2.8rem);line-height:1.08;margin-top:1rem">Imagem profissional muda como o seu projeto é percebido.</p>'+
      '<blockquote class="manifq serif">Vídeo e foto são a primeira impressão do que você faz. Qualidade de imagem é qualidade percebida.</blockquote>'+
      '<p class="manif-fear serif">Um registro amador custa caro depois. O profissional fica pronto para usar: hoje e sempre.</p></div></section>'+
    // portfolio (Para você sentir)
    '<section class="section section--dark" id="portfolio">'+part(0.6)+'<div class="container"><div class="shead"><p class="eyebrow eyebrow--light">Para você sentir</p><h2 class="serif light">O que a imagem certa revela</h2><p class="sub">Um olhar de cinema aplicado a projetos e eventos.</p></div>'+
      '<div class="pf-grid">'+PORTFOLIO.map(function(v){return '<button class="pf-tile" data-video="'+v[0]+'" data-zoom="'+v[1]+'" aria-label="Assistir vídeo"><span class="pf-cover" style="background-image:url(https://i.ytimg.com/vi/'+v[0]+'/hqdefault.jpg);transform:scale('+(v[1]||1)+')"></span><span class="pf-play">'+PLAY+'</span></button>';}).join("")+'</div>'+
      '<div class="pf-links"><a href="https://www.instagram.com/thiago.bellus/" target="_blank" rel="noopener" aria-label="Instagram">'+IG+'</a><a href="https://www.youtube.com/@belluseventos" target="_blank" rel="noopener" class="yt">Ver mais trabalhos no YouTube</a></div></div></section>'+
    // como funciona
    '<section class="section" id="como-funciona"><div class="container"><div class="shead"><p class="eyebrow">Como funciona</p><h2 class="serif">Do contrato à entrega</h2><p class="sub">Um caminho simples e sem surpresas, do primeiro passo à entrega.</p></div>'+
      '<ol class="steps">'+PROCESS.map(function(s,i){return '<li class="step"><span class="stepn serif">'+(i+1)+'</span><div><h3>'+esc(s[0])+'</h3><p>'+esc(s[1])+'</p></div></li>';}).join("")+'</ol></div></section>'+
    // formatos + lado a lado (ocultos depois da contratação)
    (rsv?'':'<section class="section" id="experiencias"><div class="container"><div class="shead"><p class="eyebrow">Os formatos</p><h2 class="serif">Escolha o formato do seu projeto</h2><p class="sub">Toque num formato para ver o valor e o que inclui. O resumo se atualiza na hora.</p></div><div id="r-exp"></div><p class="exp-note">O vídeo é o coração do trabalho: se puder escolher um, escolha ser lembrado em movimento.</p></div></section>'+
    '<section class="section section--tint" id="comparar"><div class="container"><div class="shead"><p class="eyebrow">Lado a lado</p><h2 class="serif">Qual formato combina com o seu projeto?</h2><p class="sub">O essencial para comparar, sem termos técnicos.</p></div><div id="r-comp"></div></div></section>')+
    '<div id="r-config"></div>'+
    '<section class="section--dark finalcta section">'+part(0.7)+'<div class="hero__glow"></div><div class="container"><h2 class="serif">'+(rsv?'Estamos ansiosos pelo dia':'Vamos tirar o projeto do papel?')+'</h2><p>'+(rsv?'Seu serviço está confirmado e cada detalhe já é importante para nós. Qualquer novidade, é só chamar.':'Qualquer dúvida sobre a proposta, é só chamar. Será uma alegria registrar o seu projeto.')+'</p><a class="btn btn-wa" id="cta-final" href="'+(rsv?waReservada():waFalar())+'" target="_blank" rel="noopener">'+WA+' Falar com o Thiago</a></div></section>'+
    '<footer class="footer section--dark">'+part(0)+'<div class="container"><img src="logo_bellus.png" alt="Thiago Bellus"/><div>Thiago Bellus · Bellus Eventos · CNPJ 30.922.038/0001-82 · Teresópolis, RJ</div><div style="margin-top:.4rem;opacity:.7">Proposta pessoal e confidencial.</div></div></footer>'+
    '<div class="mbar" id="r-mbar"></div>';
    document.title=nomes(p)+" · Proposta Thiago Bellus";
    // wire portfolio
    document.querySelectorAll(".pf-tile").forEach(function(t){t.addEventListener("click",function(){
      var id=t.getAttribute("data-video");
      var f=document.createElement("iframe");f.className="pf-frame";f.setAttribute("allow","autoplay; encrypted-media; picture-in-picture");f.setAttribute("allowfullscreen","");
      f.src="https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&rel=0&playsinline=1&modestbranding=1";
      t.innerHTML=""; t.appendChild(f); t.classList.add("playing");
    });});
    document.querySelectorAll("[data-particles]").forEach(initParticles);
    paintExp(); paintComp(); paintConfig(); paintMbar(); setupReveal();
    setupTitleType();
  }
  function erro(msg){document.getElementById("app").innerHTML='<div class="state"><div><p class="eyebrow eyebrow--light">Thiago Bellus</p><p class="serif">'+esc(msg)+'</p><p>Confira o link pelo WhatsApp.</p></div></div>';}

  var slug=getSlug();
  if(!slug){erro("Proposta não encontrada.");return;}
  fetch(FN+"?slug="+encodeURIComponent(slug),{headers:{apikey:ANON,Authorization:"Bearer "+ANON}})
    .then(function(r){return r.json().then(function(b){return {ok:r.ok,b:b};});})
    .then(function(r){if(r.ok&&r.b&&r.b.proposta){P.proposta=r.b.proposta;var rec=P.proposta.pacote_recomendado;var vis=pacotesVis();P.pkgId=(rec&&vis.some(function(p){return p.id===rec;}))?rec:(vis.some(function(p){return p.id==="pro-video";})?"pro-video":vis[0].id);build();mostrarRetornoPagamento();try{if(window.fbq){var _vb=breakdown();fbq("track","ViewContent",{value:_vb.total||0,currency:"BRL",content_name:(selPkg()||{}).nome||"Proposta"});}}catch(e){}}else erro(r.b&&r.b.error?r.b.error:"Proposta não encontrada.");})
    .catch(function(){erro("Não foi possível carregar a proposta agora.");});
})();
