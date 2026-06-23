(function () {
  "use strict";

  var FN = "https://nngvxucybligmanbedrs.supabase.co/functions/v1/get-proposta";
  var FN_CHECKOUT = "https://nngvxucybligmanbedrs.supabase.co/functions/v1/create-checkout";
  var FN_COBRANCA = "https://nngvxucybligmanbedrs.supabase.co/functions/v1/asaas-cobranca";
  var FN_STATUS = "https://nngvxucybligmanbedrs.supabase.co/functions/v1/asaas-status";
  var ANON = "sb_publishable_UhC5LHa4Ob5vSY4K5xrM5Q_LG3pllu-";
  var WHATS = "5521981636666";
  var INSPECT = location.search.indexOf("inspect") !== -1;
  var compPeeked = false, compResize = null;

  var PACOTES = [
    { id:"cerimonia", nome:"Cerimônia", preco:2670, pos:"Momento na íntegra.", best:"Para casais que desejam reviver cada detalhe da cerimônia com autenticidade e emoção.",
      entregas:[["Cerimônia completa editada",1],["Entradas"],["Votos",1],["Troca de alianças"],["“Sim” completo"],["Edição profissional"],["Entrega digital"]], ceremonyOnly:true },
    { id:"rubi", nome:"Rubi", preco:4470, pos:"Leve, emocional e essencial.", best:"Para quem quer reviver os momentos mais importantes do dia, do jeito que aconteceram.",
      entregas:[["Filme de 8 minutos",1],["Trailer de até 2 minutos"],["Preparativos da noiva"],["Cerimônia (trechos)"],["Festa"],["Prévia em até 15 dias"],["Entrega digital"]] },
    { id:"diamante", nome:"Diamante", preco:5970, pos:"A experiência cinematográfica Bellus.", best:"Para reviver também os detalhes e as reações que passaram despercebidos.",
      entregas:[["Filme cinematográfico de até 15 minutos",1],["Trailer de até 2 minutos"],["Preparativos completos"],["Cerimônia (trechos)"],["Festa"],["Captação aprofundada de detalhes",1],["Drone quando possível"],["Prévia em até 15 dias"],["Pendrive + entrega digital"]] },
    { id:"alianca", nome:"Aliança", preco:6970, pos:"A experiência completa.", best:"Para guardar também as palavras, os votos e a cerimônia na íntegra.",
      entregas:[["Tudo da experiência Diamante",1],["Cerimônia completa editada"],["Entradas completas"],["Votos completos"],["Troca de alianças e “sim”"],["Preservação integral da cerimônia",1]],
      valueNote:"Separado, Diamante (R$ 5.970) mais Cerimônia (R$ 2.670) daria R$ 8.640. Na Aliança, vocês economizam R$ 1.670.", valueHighlight:"Economize R$ 1.670" },
  ];
  var ADDONS = [
    { id:"tempo-extra-filme", nome:"Tempo extra de filme", desc:"Mais minutos de edição no seu filme.", benef:"Seu filme com mais momentos e mais respiro narrativo.", kind:"quantity", unitPrice:990, downsellPrice:900, unitMinutes:5, maxUnits:6, hideForCeremonyOnly:true },
    { id:"previa", nome:"Prévia", desc:"Um primeiro recorte do filme, em até 2 semanas após o casamento.", benef:"A emoção mais recente, enquanto ainda está viva.", kind:"bonus", hideForCeremonyOnly:true },
  ];
  var PAGAMENTOS = [
    { id:"sinal", kind:"signal", label:"Reservar a data com Sinal PIX", desc:"20% no Pix para garantir a data. O saldo restante é parcelado (Pix sem taxa, ou cartão com a taxa da operadora).", signalRate:0.2 },
    { id:"avista", kind:"full", label:"Pagamento integral via PIX", desc:"Quitação à vista no Pix, com 5% de desconto sobre o total.", discountRate:0.05 },
    { id:"cartao", kind:"installments", label:"Parcelamento total no Cartão", desc:"No cartão de crédito via checkout seguro, em até 12x.", maxInstallments:12 },
  ];
  var CTA_LABEL = { signal:"Reservar minha data", full:"Confirmar e reservar", installments:"Continuar para reservar" };
  var PROCESS = [
    ["Escolha da experiência","Vocês selecionam a experiência que combina com o seu dia."],
    ["Reserva com sinal","A data é garantida após a assinatura e o pagamento do sinal. O saldo é parcelado até o casamento."],
    ["Alinhamento","Conversamos sobre a história de vocês, o roteiro do dia e o que é importante."],
    ["Cobertura do evento","Estamos presentes com discrição, atentos ao que acontece de verdade, sem conduzir."],
    ["Produção","Selecionamos, montamos e damos forma à narrativa do seu dia."],
    ["Entrega","Prévia em até 15 dias; filme e trailer entre 60 e 90 dias (máximo 150), por link ou pendrive."],
  ];
  var PORTFOLIO = [ ["ePwx8bsoztI",1.35], ["We-jTlYiLC4",1.35], ["_O0Kialgkzo",0] ];
  var FEATURES = [
    ["Filme do dia",{cerimonia:false,rubi:"8 min",diamante:"até 15 min",alianca:"até 15 min"}],
    ["Trailer",{cerimonia:false,rubi:true,diamante:true,alianca:true}],
    ["Preparativos (opcional)",{cerimonia:false,rubi:"Noiva",diamante:"Noivos",alianca:"Noivos"}],
    ["Festa",{cerimonia:false,rubi:true,diamante:true,alianca:true}],
    ["Captação aprofundada + drone",{cerimonia:false,rubi:false,diamante:true,alianca:true}],
    ["Cerimônia na íntegra (editada)",{cerimonia:true,rubi:false,diamante:false,alianca:true}],
    ["Prévia em 15 dias",{cerimonia:false,rubi:true,diamante:true,alianca:true}],
    ["Entrega",{cerimonia:"Digital",rubi:"Digital",diamante:"Pendrive + digital",alianca:"Pendrive + digital"}],
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
  var CK='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var WA='<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.748-.985zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z"/></svg>';
  var PLAY='<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l11-7-11-7z"/></svg>';
  var IG='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>';

  var P = { proposta:null, pkgId:null, qty:{}, downsell:false, payId:"sinal", terms:false };

  function selPkg(){return PACOTES.find(function(p){return p.id===P.pkgId;});}
  function ceremonyOnly(){var p=selPkg();return !!(p&&p.ceremonyOnly);}
  function visibleAddons(){return ADDONS.filter(function(a){return !(a.hideForCeremonyOnly&&ceremonyOnly());});}
  function effAddon(a){return (P.downsell&&a.kind==="quantity"&&a.downsellPrice)?Object.assign({},a,{unitPrice:a.downsellPrice}):a;}
  function lines(){return visibleAddons().map(function(a){return {addon:effAddon(a),qty:P.qty[a.id]||0};});}
  function incluiPrevia(){return !ceremonyOnly();}
  function selPay(){return PAGAMENTOS.find(function(o){return o.id===P.payId;});}
  function addonTotal(a,q){if(q<=0)return 0;if(a.kind==="quantity")return q*(a.unitPrice||0);if(a.kind==="bonus")return 0;return a.price||0;}
  function breakdown(){
    var pk=selPkg(); var add=lines().reduce(function(s,l){return s+addonTotal(l.addon,l.qty);},0);
    var subtotal=preco(pk)+add; var pay=selPay();
    var disc=Math.round(subtotal*((pay&&pay.discountRate)||0)); var total=subtotal-disc;
    var sig=null,sal=null; if(pay&&pay.kind==="signal"&&pay.signalRate){sig=Math.round(subtotal*pay.signalRate);sal=subtotal-sig;}
    var ic=null,iv=null,icTotal=null; if(pay&&pay.kind==="installments"&&pay.maxInstallments){ic=pay.maxInstallments;icTotal=totalCart(total,ic);iv=Math.round((icTotal/ic)*100)/100;}
    return {subtotal:subtotal,disc:disc,total:total,sig:sig,sal:sal,ic:ic,iv:iv,icTotal:icTotal};
  }
  function setQty(id,q){
    var a=ADDONS.find(function(x){return x.id===id;}); var max=a.maxUnits||6;
    q=Math.max(0,Math.min(max,q)); var prev=P.qty[id]||0;
    if(a.downsellPrice&&q<prev&&prev>0)P.downsell=true;
    P.qty[id]=q; paintConfig(); paintMbar();
  }
  function waBase(extra){var p=P.proposta;var num=(p.whatsapp||WHATS).replace(/\D/g,"");return "https://wa.me/"+num+"?text="+encodeURIComponent(extra);}
  function dataTxt(){var d=P.proposta.evento_data;return d?dataCurta(d):"a definir";}
  function dataOcupada(){var p=P.proposta;return (p.data_ocupada===true)||(p.disponibilidade==="unavailable");}
  function waFalar(){var pk=selPkg();var b=breakdown();return waBase("Olá, Bellus! Sobre a proposta de "+nomes(P.proposta)+" (casamento em "+dataTxt()+"). Estamos vendo a experiência "+pk.nome+" ("+brl(b.total)+") e gostaríamos de conversar.");}
  function waCorrigir(){return waBase("Olá, Bellus! Sobre a proposta de "+nomes(P.proposta)+" (data "+dataTxt()+"), uma informação do evento mudou:");}
  function waReservar(){var b=breakdown();var pk=selPkg();var pay=selPay();return waBase("Olá, Bellus! Queremos reservar a nossa data ("+nomes(P.proposta)+", "+dataTxt()+").\nExperiência: "+pk.nome+" ("+brl(b.total)+")\nCondição: "+(pay?pay.label:"-")+"\nComo seguimos?");}
  function waDataAlternativa(){return waBase("Olá, Bellus! Estou com a proposta de "+nomes(P.proposta)+" em mãos. Vi que a data "+dataTxt()+" já está reservada. Temos muito interesse no trabalho de vocês e gostaríamos de verificar a disponibilidade para a nossa data ou outras opções. Conseguem nos ajudar?");}
  function pagarSinal(rb, msg){
    if(rb.getAttribute("data-loading")) return;
    rb.setAttribute("data-loading","1");
    var orig=rb.innerHTML; rb.innerHTML="Abrindo pagamento seguro...";
    if(msg){ msg.classList.remove("warn"); msg.textContent="Você será levado ao ambiente seguro da Stripe."; }
    var q={}; Object.keys(P.qty||{}).forEach(function(k){ if(P.qty[k]>0) q[k]=P.qty[k]; });
    fetch(FN_CHECKOUT,{ method:"POST", headers:{ "Content-Type":"application/json", apikey:ANON, Authorization:"Bearer "+ANON }, body:JSON.stringify({ slug:getSlug(), pkgId:P.pkgId, qty:q }) })
      .then(function(r){ return r.json().then(function(b){ return {ok:r.ok,b:b}; }); })
      .then(function(r){ if(r.ok&&r.b&&r.b.url){ window.location.href=r.b.url; } else { rb.removeAttribute("data-loading"); rb.innerHTML=orig; if(msg){ msg.textContent=(r.b&&r.b.error)||"Não foi possível abrir o pagamento. Tente de novo."; msg.classList.add("warn"); } } })
      .catch(function(){ rb.removeAttribute("data-loading"); rb.innerHTML=orig; if(msg){ msg.textContent="Falha de conexão. Tente de novo."; msg.classList.add("warn"); } });
  }

  // ── Sinal via Pix (Asaas): QR dentro da própria proposta + acompanhamento ──
  function fmtCpf(v){ v=(v||"").replace(/\D/g,"").slice(0,11);
    if(v.length>9)return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/,"$1.$2.$3-$4");
    if(v.length>6)return v.replace(/(\d{3})(\d{3})(\d{1,3})/,"$1.$2.$3");
    if(v.length>3)return v.replace(/(\d{3})(\d{1,3})/,"$1.$2"); return v; }
  var pixPoll=null;
  function fecharPix(){ if(pixPoll){clearInterval(pixPoll);pixPoll=null;} var o=document.getElementById("pixov"); if(o)o.remove(); document.body.style.overflow=""; }
  var pgCond="sinal", pgMet="";
  function taxaCart(n){ return n<=1?0.0299:(n<=6?0.0349:0.0399); }
  function totalCart(v,n){ return (v+0.49)/(1-taxaCart(n)); }
  function abrirPix(cond, met){
    pgCond=["sinal","avista","cartao","saldo"].indexOf(cond)>=0?cond:"sinal"; pgMet=met||"";
    var ehSaldo=pgCond==="saldo";
    var ehCartao=pgCond==="cartao"||(ehSaldo&&pgMet==="card");
    var ehAvista=pgCond==="avista";
    var b=breakdown(); var sig=(b.sig!=null)?b.sig:Math.round(b.subtotal*0.2);
    var pg=(P.proposta&&P.proposta.pagamento)||{};
    var saldoBase=(pg.saldo_centavos||0)/100;
    var baseCartao=ehSaldo?saldoBase:b.total;
    var topo, titu, subq;
    if(ehSaldo&&!ehCartao){ topo="Pagar o saldo"; titu="Saldo no Pix"; subq="Você paga o saldo restante de <b>"+brl(saldoBase)+"</b> no Pix, sem acréscimo."; }
    else if(ehSaldo){ topo="Pagar o saldo"; titu="Saldo no cartão"; subq="Parcele o saldo de <b>"+brl(saldoBase)+"</b> no cartão, em até 12x. A taxa já vem embutida na parcela."; }
    else if(ehCartao){ topo="Pagar no cartão"; titu="Cartão de crédito"; subq="Escolha em quantas vezes quer parcelar. A taxa do cartão já vem embutida em cada parcela."; }
    else if(ehAvista){ topo="Pagamento à vista"; titu="Pix à vista"; subq="Você paga <b>"+brl(b.total)+"</b> no Pix, à vista com 5% de desconto. Quita tudo e garante a data."; }
    else { topo="Reservar a data"; titu="Sinal no Pix"; subq="Você paga <b>"+brl(sig)+"</b> de sinal no Pix pra garantir a data, sem acréscimo. O saldo é parcelado depois."; }
    var parcHtml="";
    if(ehCartao){
      var os="";
      for(var n=1;n<=12;n++){ var t=totalCart(baseCartao,n); os+='<option value="'+n+'">'+n+'x de '+brlC(t/n)+(n>1?' (total '+brlC(t)+')':' à vista')+'</option>'; }
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
        '<p class="pixsub">Valor do sinal: <b id="pixval"></b></p>'+
        '<div class="pixqr" id="pixqr"></div>'+
        '<button class="btn btn-ghost pixfull" id="pixcopy">Copiar código Pix</button>'+
        '<p class="pixwait"><span class="pixdot"></span> Aguardando o pagamento. Esta tela atualiza sozinha.</p>'+
        '<p class="pixfoot">No app do banco: Pix › Ler QR Code, ou use o Pix Copia e Cola.</p>'+
      '</div>'+
      '<div class="pixstep" data-step="3" hidden>'+
        '<div class="pixok">'+CK+'</div><h3 class="serif">Pagamento confirmado!</h3>'+
        '<p class="pixsub">Sua data está reservada. A Bellus já foi avisada e entra em contato.</p>'+
        '<button class="btn btn-gold pixfull" id="pixdone">Ver minha reserva</button>'+
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
    var ehCartaoG=pgCond==="cartao"||(pgCond==="saldo"&&pgMet==="card");
    var orig=btn.innerHTML; btn.innerHTML=ehCartaoG?"Abrindo…":"Gerando…"; msg.textContent=""; msg.classList.remove("warn");
    function falha(e){ btn.removeAttribute("data-l"); btn.innerHTML=orig; msg.textContent=e||"Não foi possível agora. Tente de novo."; msg.classList.add("warn"); }
    var q={}; Object.keys(P.qty||{}).forEach(function(k){ if(P.qty[k]>0)q[k]=P.qty[k]; });
    fetch(FN_COBRANCA,{method:"POST",headers:{"Content-Type":"application/json",apikey:ANON,Authorization:"Bearer "+ANON},body:JSON.stringify({slug:getSlug(),pkgId:P.pkgId,cond:pgCond,metodo:pgMet,cpf:cpf,qty:q,parcelas:(ehCartaoG&&document.getElementById("pixparc"))?parseInt(document.getElementById("pixparc").value,10)||1:1})})
      .then(function(r){return r.json().then(function(b){return{ok:r.ok,b:b};});})
      .then(function(r){
        if(!r.ok||!r.b){ falha(r.b&&r.b.error); return; }
        if(ehCartaoG){ if(!r.b.invoiceUrl){ falha(r.b.error); return; } window.location.href=r.b.invoiceUrl; return; }
        if(!r.b.qrPayload){ falha(r.b.error); return; }
        var box=document.getElementById("pixov"); if(!box)return;
        box.querySelector('[data-step="1"]').hidden=true;
        box.querySelector('[data-step="2"]').hidden=false;
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
        .then(function(b){ if(b&&(b.pago||b.reservado)){ clearInterval(pixPoll);pixPoll=null; pixOk(); } }).catch(function(){});
    },5000);
  }
  function pixOk(){
    var box=document.getElementById("pixov"); if(!box)return;
    box.querySelector('[data-step="2"]').hidden=true;
    box.querySelector('[data-step="3"]').hidden=false;
    var d=document.getElementById("pixdone"); if(d)d.addEventListener("click",function(){ fecharPix(); location.reload(); });
  }
  function mostrarRetornoPagamento(){
    var pago=new URL(location.href).searchParams.get("pago");
    if(pago!=="1"&&pago!=="0") return;
    var d=document.createElement("div"); d.className="pay-return "+(pago==="1"?"ok":"no");
    d.innerHTML=pago==="1" ? "<b>Pagamento do sinal recebido!</b> Já garantimos a sua data. A Bellus entra em contato em instantes." : "<b>Pagamento não concluído.</b> Sua proposta continua aqui, é só tentar quando quiser.";
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
    var html=PACOTES.map(function(pk){var sel=pk.id===P.pkgId;var is12=totalCart(preco(pk),12)/12;
      return '<div class="pcard'+(sel?" sel":"")+'">'+(pk.id===rec?'<span class="pcard__rec">★ Recomendada</span>':'')+
        '<div class="pcard__name">'+esc(pk.nome)+'</div><div class="pcard__pos">'+esc(pk.pos)+'</div>'+
        '<div class="pcard__price"><span class="v serif tnum">'+brl(preco(pk))+'</span><div class="pcard__hint">ou em até 12x de '+brlC(is12)+' no cartão</div></div>'+
        (pk.valueNote?'<div class="pcard__value">'+(pk.valueHighlight?'<span class="bdg">'+esc(pk.valueHighlight)+'</span>':'')+'<p>'+esc(pk.valueNote)+'</p></div>':'')+
        '<div class="pcard__best"><b>Indicado para:</b> '+esc(pk.best)+'</div>'+
        '<ul class="pcard__list">'+pk.entregas.map(function(e){return '<li class="'+(e[1]?"h":"")+'">'+CK+'<span>'+esc(e[0])+'</span></li>';}).join("")+'</ul>'+
        '<button class="pcard__btn" data-pick="'+pk.id+'">'+(sel?CK+" Selecionada":"Selecionar")+'</button></div>';
    }).join("");
    var el=document.getElementById("r-exp"); el.innerHTML='<div class="exp-grid">'+html+'</div>';
    el.querySelectorAll("[data-pick]").forEach(function(b){b.addEventListener("click",function(){pick(b.getAttribute("data-pick"));});});
  }

  function paintComp(){
    if(!document.getElementById("r-comp"))return;
    var rec=P.proposta.pacote_recomendado;
    function cell(v){if(v===true)return '<span class="ccheck">'+CK+'</span>';if(v===false||v==null)return '<span class="cno">Não</span>';return '<span class="cv">'+esc(v)+'</span>';}
    var head='<th class="ccrit">Critério</th>'+PACOTES.map(function(p){var sel=p.id===P.pkgId;return '<th><button class="chead'+(sel?" sel":"")+'" data-pick="'+p.id+'"><span class="cn">'+esc(p.nome)+'</span>'+(p.id===rec?'<span class="crec">Recomendado</span>':'')+'</button></th>';}).join("");
    var rows=FEATURES.map(function(f,i){return '<tr'+(i%2?' class="alt"':'')+'><th class="crit">'+esc(f[0])+'</th>'+PACOTES.map(function(p){return '<td class="'+(p.id===P.pkgId?"selcol":"")+'">'+cell(f[1][p.id])+'</td>';}).join("")+'</tr>';}).join("");
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

  function stepperHtml(a,q,small){
    var min=q*(a.unitMinutes||0); var max=a.maxUnits||6;
    return '<div class="stepper"><button class="sbtn" data-step="down" data-addon="'+a.id+'" '+(q<=0?"disabled":"")+' aria-label="Tirar">−</button><span class="stepval tnum">'+min+' min</span><button class="sbtn" data-step="up" data-addon="'+a.id+'" '+(q>=max?"disabled":"")+' aria-label="Adicionar">+</button></div>'+
      (small?'':'<span class="addon__total tnum">'+(q>0?"+ "+brl(addonTotal(a,q)):brl(0))+'</span>');
  }
  function downsellHtml(){return '<div class="downsell"><span class="ic">'+CK+'</span><p><b>Condição especial liberada:</b> agora cada 5 minutos de filme sai por <b>R$ 900</b>, em vez de R$ 990. É só adicionar.</p></div>';}
  function alemHtml(){
    if(ceremonyOnly()){var add=["O making of e os preparativos, antes de tudo começar","A chegada, a espera e o olhar de quem ama","As reações dos convidados durante a cerimônia","A festa, do primeiro brinde à última música"];
      return '<section class="section"><div class="container"><div class="shead"><p class="eyebrow">Para ir além</p><h2 class="serif">Quer guardar também o resto do dia?</h2><p class="sub">A Cerimônia preserva o momento mais importante na íntegra. Se quiser, as experiências completas guardam o dia inteiro.</p></div><div class="nudge"><p class="lead">A Cerimônia entrega a cerimônia inteira, sem cortes. O que ela não conta é o restante da história do dia:</p><ul>'+add.map(function(t){return '<li>'+CK+'<span>'+esc(t)+'</span></li>';}).join("")+'</ul><p>Tudo isso vira um filme nas experiências Rubi, Diamante e Aliança. A Aliança une as duas coisas: o dia inteiro em filme e a cerimônia na íntegra.</p><a class="btn" data-scroll="experiencias">Ver as experiências completas</a></div></div></section>';
    }
    var qa=visibleAddons().filter(function(a){return a.kind==="quantity";}); var bonus=visibleAddons().filter(function(a){return a.kind==="bonus";});
    return '<section class="section section--tint"><div class="container"><div class="shead"><p class="eyebrow">Para ir além</p><h2 class="serif">Serviços adicionais</h2><p class="sub">Opcionais para complementar a sua experiência. O valor se ajusta na hora.</p></div>'+
      (P.downsell?downsellHtml():'')+'<div style="display:grid;gap:1rem;margin-top:1rem">'+
      qa.map(function(a){var ea=effAddon(a);var q=P.qty[a.id]||0;return '<div class="addon'+(q>0?" act":"")+'"><div class="addon__info"><h4>'+esc(a.nome)+'</h4><p>'+esc(a.desc)+'</p><div class="b">'+esc(a.benef)+'</div><div class="u">'+brl(ea.unitPrice)+' a cada '+a.unitMinutes+' min</div></div><div class="addon__ctrl">'+stepperHtml(ea,q,false)+'</div></div>';}).join("")+
      bonus.map(function(a){return '<div class="bonus"><div><h4>'+esc(a.nome)+' <span class="bdg">Bônus</span></h4><p>'+esc(a.desc)+'</p></div><span class="cortesia">Cortesia</span></div>';}).join("")+
      '</div></div></section>';
  }
  function summaryHtml(){
    var pk=selPkg(); var b=breakdown(); var pay=selPay(); var p=P.proposta;
    var qa=visibleAddons().filter(function(a){return a.kind==="quantity";});
    var h='<div class="summary"><div style="display:flex;justify-content:space-between;align-items:baseline"><h3>Sua contratação</h3><span class="ev">'+esc(p.evento_tipo||"Casamento")+(p.evento_data?" · "+dataCurta(p.evento_data):"")+'</span></div>';
    h+='<div style="margin-top:1rem"><div class="sline strong"><span class="l">Experiência '+esc(pk.nome)+'</span><span class="v tnum">'+brl(preco(pk))+'</span></div>';
    if(incluiPrevia())h+='<div class="sbonus"><span><span class="bdg">Bônus</span>Prévia em até 15 dias</span><span class="cortesia">Cortesia</span></div>';
    h+='</div>';
    if(qa.length){h+=(P.downsell?'<div style="margin-top:.6rem">'+downsellHtml()+'</div>':'');qa.forEach(function(a){var ea=effAddon(a);var q=P.qty[a.id]||0;h+='<div class="ssum-step"><div class="top"><span>'+esc(a.nome)+'</span><span class="tnum">'+(q>0?"+ "+brl(addonTotal(ea,q)):brl(0))+'</span></div><div class="ctrl">'+stepperHtml(ea,q,true)+'</div></div>';});}
    h+='<hr class="shr"><div class="sline"><span class="l">Subtotal</span><span class="v tnum">'+brl(b.subtotal)+'</span></div>';
    if(b.disc>0)h+='<div class="sline accent"><span class="l">Desconto à vista</span><span class="v tnum">menos '+brl(b.disc)+'</span></div>';
    h+='<div class="stotal"><span class="l">Total</span><span class="v tnum">'+brl(b.total)+'</span></div>';
    if(pay&&pay.kind==="signal"&&b.sig!=null)h+='<div class="sbox"><div class="sline strong"><span class="l">Sinal para reservar</span><span class="v tnum">'+brl(b.sig)+'</span></div><div class="sline"><span class="l">Saldo até o casamento</span><span class="v tnum">'+brl(b.sal)+'</span></div></div>';
    if(pay&&pay.kind==="installments"&&b.iv!=null)h+='<div class="sbox"><div class="sline strong"><span class="l">Em até '+b.ic+'x no cartão</span><span class="v tnum">'+brlC(b.iv)+'</span></div><div class="sline"><span class="l">Total no cartão (com a taxa)</span><span class="v tnum">'+brlC(b.icTotal)+'</span></div></div>';
    h+='<div class="svalidade">'+(p.expira_em?"Proposta válida até "+dataCurta(p.expira_em)+". ":"")+'A data é confirmada após a assinatura do contrato e o pagamento do sinal.</div></div>';
    // checkout
    var lab=(pay&&CTA_LABEL[pay.kind])||"Reservar minha data";
    h+='<div class="checkout"><label class="terms"><input type="checkbox" id="terms"'+(P.terms?" checked":"")+'/><span>Li e concordo com os <a href="termos.html" target="_blank" rel="noopener">termos de contratação</a> e a <a href="privacidade.html" target="_blank" rel="noopener">política de privacidade</a>.</span></label>'+
      (dataOcupada()
        ? '<a class="btn btn-bloq ckbtn" id="reservar" href="'+waDataAlternativa()+'" target="_blank" rel="noopener">Essa data já está fechada</a>'
        : '<a class="btn btn-gold ckbtn'+(P.terms?"":" off")+'" id="reservar" href="'+waReservar()+'" target="_blank" rel="noopener">'+esc(lab)+' →</a>')+
      '<p class="ck-msg" id="ck-msg">'+(dataOcupada()?"Essa data já está fechada. Consulte outra data para viabilizar o pagamento.":(!P.terms?"Marque o aceite acima para reservar.":((pay&&pay.kind==="signal")?"Pagamento do sinal no Pix, na hora e sem acréscimo.":(selPay()&&selPay().kind==="installments")?"Pagamento no cartão, parcelável, em ambiente seguro.":"Pagamento à vista no Pix, com 5% de desconto.")))+'</p></div>';
    return h;
  }
  function paymentHtml(){
    var b=breakdown();
    var opts=PAGAMENTOS.map(function(o){var sel=o.id===P.payId;var pv="";
      if(o.kind==="signal"){var s=Math.round(b.subtotal*(o.signalRate||0));pv="Sinal Pix "+brl(s)+" · saldo "+brl(b.subtotal-s);}
      else if(o.kind==="full"){var d=Math.round(b.subtotal*(o.discountRate||0));pv=brl(b.subtotal-d)+" à vista no Pix"+(d>0?" · você economiza "+brl(d):"");}
      else if(o.kind==="installments"&&o.maxInstallments){pv="Em até "+o.maxInstallments+"x de "+brlC(totalCart(b.subtotal,o.maxInstallments)/o.maxInstallments)+" (com taxa)";}
      return '<button class="payopt'+(sel?" sel":"")+'" data-pay="'+o.id+'"><span class="rd">'+(sel?CK:"")+'</span><span><span class="lab">'+esc(o.label)+'</span><span class="ds">'+esc(o.desc)+'</span>'+(pv?'<span class="pv">'+esc(pv)+'</span>':'')+'</span></button>';
    }).join("");
    return '<div><h3 style="font-size:1.2rem">Como você prefere pagar</h3><p style="margin:.4rem 0 1rem;color:var(--ink-soft);font-size:.95rem">Escolha a condição que faz mais sentido para vocês.</p><div class="pay">'+opts+'</div></div>';
  }
  function reservado(){ var pg=P.proposta&&P.proposta.pagamento; return !!(pg&&pg.reservado); }
  function waSaldo(){ return waBase("Olá, Bellus! Sou da proposta de "+nomes(P.proposta)+". Já paguei o sinal e quero combinar as parcelas do saldo. Como seguimos?"); }
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
    var pk=pacoteContratado();
    var dd=diasPara(p.evento_data);
    var countTxt=dd==null?"":(dd>1?'Faltam <b>'+dd+' dias</b> para o grande dia':dd===1?'É <b>amanhã</b>! Falta só 1 dia':dd===0?'<b>É hoje!</b> Que o dia de vocês seja inesquecível':'Casamento realizado · obrigado por confiar na Bellus');
    var diaNum=p.evento_data?p.evento_data.split("-")[2]:"";
    var mesAbrev=p.evento_data?MESES[parseInt(p.evento_data.split("-")[1],10)-1].slice(0,3):"";
    return '<section class="section" id="contratacao"><div class="container">'+
      '<div class="shead"><p class="eyebrow">Sua reserva</p><h2 class="serif">Data garantida!</h2></div>'+
      '<div class="reserva">'+
        '<div class="rsv-hero">'+
          '<span class="rsv-seal">'+CK+'</span>'+
          '<p class="rsv-congrats serif">Que alegria, '+esc(nomes(p))+'!</p>'+
          '<p class="rsv-msg">A data de vocês está <b>garantida</b>. A partir de agora, cada detalhe importa para nós: vamos cuidar de tudo para transformar o seu dia em um filme para reviver pelo resto da vida.</p>'+
        '</div>'+
        (p.evento_data?'<div class="rsv-date">'+
          '<div class="rsv-date-box"><span class="d serif">'+diaNum+'</span><span class="m">'+mesAbrev+'</span></div>'+
          '<div class="rsv-date-info"><div class="dw">'+dataSemana(p.evento_data)+'</div>'+((p.evento_local||p.evento_cidade)?'<div class="lo">'+esc([p.evento_local,p.evento_cidade].filter(Boolean).join(" · "))+'</div>':'')+(countTxt?'<div class="ct">'+countTxt+'</div>':'')+'</div>'+
        '</div>':'')+
        '<div class="rsv-pkg">'+
          '<p class="rsv-pkg-eyebrow"><span class="rsv-pkg-ck">'+CK+'</span> Experiência contratada</p>'+
          '<div class="rsv-pkg-head"><span class="rsv-pkg-name serif">'+esc(pk.nome)+'</span><span class="rsv-pkg-price tnum">'+brl(preco(pk))+'</span></div>'+
          '<p class="rsv-pkg-pos">'+esc(pk.pos)+'</p>'+
          '<ul class="rsv-pkg-list">'+pk.entregas.slice(0,5).map(function(e){return '<li>'+CK+'<span>'+esc(e[0])+'</span></li>';}).join("")+'</ul>'+
        '</div>'+
        '<div class="rsv-rows">'+
          '<div class="rsv-row"><span class="l">Sinal pago'+(quando?' <small>em '+quando+'</small>':'')+'</span><b class="tnum">'+sinal+'</b></div>'+
          '<div class="rsv-row total"><span class="l">Saldo restante</span><b class="tnum">'+saldo+'</b></div>'+
        '</div>'+
        '<p class="rsv-info">'+(temSaldo?'Pague o saldo restante como preferir: no Pix (sem taxa) ou parcelado no cartão (com a taxa).':'Tudo quitado! Qualquer dúvida, é só chamar a Bellus.')+'</p>'+
        (temSaldo?'<a class="btn btn-gold rsv-btn" id="saldo-pix">Pagar saldo no Pix · '+saldo+'</a>':'')+
        (temSaldo?'<a class="btn btn-ghost rsv-btn" id="saldo-cartao">Parcelar no cartão · até 12x (com taxa)</a>':'')+
        '<a class="btn btn-wa rsv-btn" href="'+waSaldo()+'" target="_blank" rel="noopener">'+WA+' Falar com a Bellus</a>'+
      '</div></div></section>';
  }
  function paintConfig(){
    var el=document.getElementById("r-config");
    if(reservado()){ el.innerHTML=reservaPainelHtml(); setupTitleType(); var sp=document.getElementById("saldo-pix"); if(sp)sp.addEventListener("click",function(){abrirPix("saldo","pix");}); var sc=document.getElementById("saldo-cartao"); if(sc)sc.addEventListener("click",function(){abrirPix("saldo","card");}); return; }
    el.innerHTML=alemHtml()+'<section class="section" id="contratacao"><div class="container"><div class="shead"><p class="eyebrow">Resumo da contratação</p><h2 class="serif">Tudo claro, antes do próximo passo</h2></div><div class="cw"><div>'+paymentHtml()+'</div><div>'+summaryHtml()+'</div></div></div></section>';
    el.querySelectorAll("[data-step]").forEach(function(b){b.addEventListener("click",function(){var id=b.getAttribute("data-addon");var q=P.qty[id]||0;setQty(id,b.getAttribute("data-step")==="up"?q+1:q-1);});});
    el.querySelectorAll("[data-pay]").forEach(function(b){b.addEventListener("click",function(){P.payId=b.getAttribute("data-pay");paintConfig();paintMbar();});});
    el.querySelectorAll("[data-scroll]").forEach(function(b){b.addEventListener("click",function(){var t=document.getElementById(b.getAttribute("data-scroll"));if(t)t.scrollIntoView({behavior:"smooth"});});});
    setupTitleType();
    var tc=document.getElementById("terms"), rb=document.getElementById("reservar"), msg=document.getElementById("ck-msg");
    if(tc)tc.addEventListener("change",function(){if(dataOcupada())return;P.terms=tc.checked;if(rb)rb.classList.toggle("off",!P.terms);if(msg)msg.textContent=P.terms?((selPay()&&selPay().kind==="signal")?"Pagamento do sinal no Pix, na hora e sem acréscimo.":(selPay()&&selPay().kind==="installments")?"Pagamento no cartão, parcelável, em ambiente seguro.":"Pagamento à vista no Pix, com 5% de desconto."):"Marque o aceite acima para reservar.";});
    if(rb)rb.addEventListener("click",function(e){
      if(dataOcupada())return;
      if(!P.terms){e.preventDefault();if(msg){msg.textContent="Marque o aceite acima para reservar.";msg.classList.add("warn");setTimeout(function(){msg.classList.remove("warn");},1800);}return;}
      var pay=selPay();
      if(pay&&pay.kind==="signal"){ e.preventDefault(); abrirPix("sinal"); }
      else if(pay&&pay.kind==="full"){ e.preventDefault(); abrirPix("avista"); }
      else if(pay&&pay.kind==="installments"){ e.preventDefault(); abrirPix("cartao"); }
    });
  }
  function paintMbar(){
    var el=document.getElementById("r-mbar");
    if(reservado()){ el.innerHTML='<div class="info"><div class="pk">Sua data está reservada</div><div class="tt serif tnum">Saldo '+brl((P.proposta.pagamento.saldo_centavos||0)/100)+'</div></div><a class="btn btn-wa" href="'+waSaldo()+'" target="_blank" rel="noopener">Parcelas</a>'; var cf0=document.getElementById("cta-final"); if(cf0)cf0.setAttribute("href",waFalar()); return; }
    var pk=selPkg(); var b=breakdown();
    el.innerHTML='<div class="info"><div class="pk">Experiência '+esc(pk.nome)+'</div><div class="tt serif tnum">'+brl(b.total)+'</div></div>'+(dataOcupada()?'<a class="btn btn-bloq" href="'+waDataAlternativa()+'" target="_blank" rel="noopener">Data fechada · ver outra</a>':'<a class="btn btn-wa" href="'+waReservar()+'" target="_blank" rel="noopener">Reservar</a>');
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

  function build(){
    var p=P.proposta;
    var rsv=reservado();
    var rows=[["Evento",p.evento_tipo||"Casamento"],["Data",dataSemana(p.evento_data)],["Local",p.evento_local||"A definir"],["Cidade",p.evento_cidade||"A definir"]];
    if(p.evento_convidados)rows.push(["Convidados",p.evento_convidados]);
    var ocupada=dataOcupada();
    var av = ocupada ? ["unavailable","Essa data já está reservada"] : (p.disponibilidade==="on_hold" ? ["on_hold","Data em pré-reserva"] : ["","Data disponível no momento"]);
    var dataBanner = ocupada ? '<div class="datawarn"><p class="dw-t">Essa data já está reservada</p><p class="dw-d">A data '+esc(dataCurta(p.evento_data))+' já consta como reservada na nossa agenda. Mas adoraríamos registrar o casamento de vocês. Se tiverem um pouco de flexibilidade na data, fale com a gente que verificamos as opções na hora.</p><a class="btn btn-wa" href="'+waDataAlternativa()+'" target="_blank" rel="noopener">'+WA+' Falar sobre datas</a></div>' : '';
    document.getElementById("app").innerHTML=
    '<header class="section--dark hero">'+part(0.6)+'<div class="hero__glow"></div><div class="container">'+
      '<img class="hero__logo" src="logo_bellus.png" alt="Bellus Eventos"/><p class="eyebrow eyebrow--light">Proposta para</p>'+
      '<h1 class="hero__title serif">'+esc(nomes(p))+'</h1>'+
      '<div class="hero__meta">'+[p.evento_tipo,dataLonga(p.evento_data),p.evento_local,p.evento_cidade].filter(Boolean).map(function(m,i){return i===0?'<span><b>'+esc(m)+'</b></span>':'<span>'+esc(m)+'</span>';}).join("")+'</div>'+
      '<span class="avail"><span class="dot '+av[0]+'"></span>'+av[1]+'</span>'+'<div class="hairline"></div></div></header>'+
    // O dia de voces
    '<section class="section" id="seu-evento"><div class="container"><div class="shead"><p class="eyebrow">O dia de vocês</p><h2 class="serif">Os detalhes que já conhecemos</h2><p class="sub">Partimos do que vocês já nos contaram, sem precisar repetir nada.</p></div>'+dataBanner+
      '<div class="evgrid"><div><dl class="evlist">'+rows.map(function(r){return '<div class="evrow"><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>';}).join("")+(p.evento_notas?'<div class="evrow notes"><dt>Observações</dt><dd>'+esc(p.evento_notas)+'</dd></div>':'')+'</dl>'+
      '<a class="evcorr" href="'+waCorrigir()+'" target="_blank" rel="noopener">Alguma informação mudou? Corrigir com a gente</a></div>'+
      (p.mensagem_pessoal?'<figure class="evmsg"><blockquote>“'+esc(p.mensagem_pessoal)+'”</blockquote><figcaption>'+esc(p.consultor||"Equipe Bellus")+', Bellus Eventos</figcaption></figure>':'')+'</div></div></section>'+
    // manifesto
    '<section class="section section--tint"><div class="container narrow"><p class="eyebrow">Por que registrar</p><p class="serif" style="font-size:clamp(1.9rem,5vw,2.8rem);line-height:1.08;margin-top:1rem">O que vocês não viram só existe no filme.</p>'+
      '<div class="manif"><p>Enquanto vocês vivem o dia, outras coisas estão acontecendo. Um olhar distante. Uma reação inesperada. Um momento que não volta.</p><p>A maioria deles vocês nunca vão saber que existiu, a não ser que alguém tenha registrado.</p></div>'+
      '<blockquote class="manifq serif">O que vocês sentem assistindo não é o mesmo que viveram. Porque agora vocês conseguem ver tudo: os detalhes, as reações, as emoções que passaram despercebidas enquanto o dia acontecia.</blockquote>'+
      '<p class="manifc">A Bellus existe para transformar o casamento de vocês em uma memória viva, para reviver esse dia da maneira mais verdadeira possível.</p></div></section>'+
    // como funciona
    '<section class="section" id="como-funciona"><div class="container"><div class="shead"><p class="eyebrow">Como funciona</p><h2 class="serif">Do sim ao seu filme</h2><p class="sub">Um caminho simples e sem surpresas, do primeiro passo à entrega.</p></div>'+
      '<ol class="steps">'+PROCESS.map(function(s,i){return '<li class="step"><span class="stepn serif">'+(i+1)+'</span><div><h3>'+esc(s[0])+'</h3><p>'+esc(s[1])+'</p></div></li>';}).join("")+'</ol></div></section>'+
    // portfolio
    '<section class="section section--dark" id="portfolio">'+part(0.6)+'<div class="container"><div class="shead"><p class="eyebrow eyebrow--light">Para você sentir</p><h2 class="serif light">O que um filme da Bellus revela</h2><p class="sub">Naturalidade, emoção e os detalhes que passam despercebidos no dia.</p></div>'+
      '<div class="pf-grid">'+PORTFOLIO.map(function(v){return '<button class="pf-tile" data-video="'+v[0]+'" data-zoom="'+v[1]+'" aria-label="Assistir vídeo"><span class="pf-cover" style="background-image:url(https://i.ytimg.com/vi/'+v[0]+'/hqdefault.jpg);transform:scale('+(v[1]||1)+')"></span><span class="pf-play">'+PLAY+'</span></button>';}).join("")+'</div>'+
      '<div class="pf-links"><a href="https://www.instagram.com/belluscasamentos/" target="_blank" rel="noopener" aria-label="Instagram">'+IG+'</a><a href="https://www.youtube.com/@belluseventos" target="_blank" rel="noopener" class="yt">Ver mais filmes no YouTube</a></div></div></section>'+
    // experiencias + lado a lado (ocultos depois da reserva)
    (rsv?'':'<section class="section" id="experiencias"><div class="container"><div class="shead"><p class="eyebrow">As experiências</p><h2 class="serif">Escolham como guardar o seu dia</h2><p class="sub">Toque numa experiência para ver os valores e o que cada uma inclui. O resumo se atualiza na hora.</p></div><div id="r-exp"></div></div></section>'+
    '<section class="section section--tint" id="comparar"><div class="container"><div class="shead"><p class="eyebrow">Lado a lado</p><h2 class="serif">Qual experiência combina mais com vocês?</h2><p class="sub">O essencial para comparar, sem termos técnicos.</p></div><div id="r-comp"></div></div></section>')+
    '<div id="r-config"></div>'+
    '<section class="section--dark finalcta section">'+part(0.7)+'<div class="hero__glow"></div><div class="container"><h2 class="serif">Vamos guardar o dia de vocês?</h2><p>Qualquer dúvida sobre a proposta, é só chamar. Será uma alegria registrar o casamento de vocês.</p><a class="btn btn-wa" id="cta-final" href="'+waFalar()+'" target="_blank" rel="noopener">'+WA+' Falar com a Bellus</a></div></section>'+
    '<footer class="footer section--dark">'+part(0)+'<div class="container"><img src="logo_bellus.png" alt="Bellus Eventos"/><div>Bellus Eventos · CNPJ 30.922.038/0001-82 · Teresópolis, RJ</div><div style="margin-top:.4rem;opacity:.7">Proposta pessoal e confidencial.</div></div></footer>'+
    '<div class="mbar" id="r-mbar"></div>';
    document.title=nomes(p)+" · Proposta Bellus";
    // wire portfolio
    document.querySelectorAll(".pf-tile").forEach(function(t){t.addEventListener("click",function(){
      var id=t.getAttribute("data-video");
      var f=document.createElement("iframe");f.className="pf-frame";f.setAttribute("allow","autoplay; encrypted-media; picture-in-picture");f.setAttribute("allowfullscreen","");
      f.src="https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&rel=0&playsinline=1&modestbranding=1";
      t.innerHTML=""; t.appendChild(f); t.classList.add("playing");
    });});
    document.querySelectorAll("[data-particles]").forEach(initParticles);
    paintExp(); paintComp(); paintConfig(); paintMbar();
    setupTitleType();
  }
  function erro(msg){document.getElementById("app").innerHTML='<div class="state"><div><p class="eyebrow eyebrow--light">Bellus Eventos</p><p class="serif">'+esc(msg)+'</p><p>Confira o link com a Bellus pelo WhatsApp.</p></div></div>';}

  var slug=getSlug();
  if(!slug){erro("Proposta não encontrada.");return;}
  fetch(FN+"?slug="+encodeURIComponent(slug),{headers:{apikey:ANON,Authorization:"Bearer "+ANON}})
    .then(function(r){return r.json().then(function(b){return {ok:r.ok,b:b};});})
    .then(function(r){if(r.ok&&r.b&&r.b.proposta){P.proposta=r.b.proposta;var rec=P.proposta.pacote_recomendado;P.pkgId=(rec&&PACOTES.some(function(p){return p.id===rec;}))?rec:"diamante";build();mostrarRetornoPagamento();}else erro(r.b&&r.b.error?r.b.error:"Proposta não encontrada.");})
    .catch(function(){erro("Não foi possível carregar a proposta agora.");});
})();
