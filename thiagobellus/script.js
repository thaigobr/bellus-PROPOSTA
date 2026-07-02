/* ============================================================
   Bellus Eventos — comportamento do site institucional
   ============================================================ */
(function () {
  "use strict";

  // ── Integração Supabase (chave publishable: segura para o navegador) ──
  var SUPABASE_FN_URL =
    "https://nngvxucybligmanbedrs.supabase.co/functions/v1/create-lead-bellus";
  var SUPABASE_ANON_KEY = "sb_publishable_UhC5LHa4Ob5vSY4K5xrM5Q_LG3pllu-";
  var WHATSAPP = "5521981636666";
  // Mensagem do botão de WhatsApp: identifica que veio do site e conduz ao formulário.
  var WA_MSG = "Olá, Thiago! Vim pela sua página e gostaria de um orçamento para um serviço audiovisual. Vou preencher o formulário para receber a proposta.";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Nav: estado ao rolar ───────────────────────────────
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ── Botão de WhatsApp da nav: aplica a mensagem que conduz ao formulário ──
  var navCta = document.querySelector(".nav__cta");
  if (navCta) navCta.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(WA_MSG);

  // ── Meta Pixel: clique em qualquer WhatsApp = conversão "Contact" ──
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]') : null;
    if (a && window.fbq) fbq("track", "Contact");
  }, true);

  // ── Vídeo de fundo do hero: pausa se o usuário pediu menos movimento ──
  var heroVid = document.querySelector(".hero__video");
  if (heroVid && reduceMotion) { heroVid.removeAttribute("autoplay"); heroVid.pause(); }

  // ── Revelar seções ao entrar na viewport ───────────────
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // ── Títulos: digitação (máquina de escrever, 1x por seção) + linha que cresce nos dois sentidos do scroll ──
  function typeTitle(el) {
    var tokens = el.innerHTML.split(/(<br\s*\/?>)/i);
    var units = [];
    tokens.forEach(function (t) {
      if (!t) return;
      if (/^<br/i.test(t)) units.push(t);
      else for (var k = 0; k < t.length; k++) units.push(t.charAt(k));
    });
    if (!units.length) return;
    el.style.minHeight = el.offsetHeight + "px";
    var i = 0, buf = "";
    function step() {
      if (i >= units.length) { el.innerHTML = buf; el.style.minHeight = ""; return; }
      buf += units[i]; i++;
      el.innerHTML = buf + '<span class="tw-caret" aria-hidden="true"></span>';
      setTimeout(step, 35);
    }
    el.innerHTML = '<span class="tw-caret" aria-hidden="true"></span>';
    step();
  }
  var titleEls = document.querySelectorAll(".section__title, .hero__title, .manifesto__lead");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    titleEls.forEach(function (el) { el.classList.add("is-inview"); });
  } else {
    var titleIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        if (e.isIntersecting) {
          el.classList.add("is-inview");
          if (!el.dataset.typed) { el.dataset.typed = "1"; typeTitle(el); }
        } else {
          el.classList.remove("is-inview");
        }
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -8% 0px" });
    titleEls.forEach(function (el) { titleIO.observe(el); });
  }

  // ── FAQ: abre um e fecha os outros (acordeão) ───────────
  var faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // ── Pó dourado em canvas (seções escuras), sincronizado ao SCROLL ──
  // Porta do ParticlesCanvas do app de proposta: parallax por profundidade,
  // embers, SEM loop ocioso (só desenha ao rolar/redimensionar), pausa fora da tela.
  // Opcional via atributos: data-density (default 160), data-fade-bottom (0..1).
  function initParticles(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var reduced = reduceMotion;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0, height = 0, visible = true, ticking = false;
    var particles = [];
    var density = parseFloat(canvas.getAttribute("data-density")) || 160;

    function seed() {
      var rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(density, Math.max(70, (width * height) / 7000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        var ember = Math.random() < 0.12;
        particles.push({
          bx: Math.random(),
          by: Math.random(),
          r: ember ? 1.6 + Math.random() * 1.4 : 0.4 + Math.random() * 1.4,
          depth: 0.12 + Math.random() * 0.9,
          alpha: ember ? 0.55 + Math.random() * 0.3 : 0.22 + Math.random() * 0.45,
          hue: 38 + Math.random() * 8,
          sat: 45 + Math.random() * 18,
          light: 58 + Math.random() * 22,
          seed: Math.random() * Math.PI * 2,
          drift: 6 + Math.random() * 18,
          ember: ember,
        });
      }
    }

    function sectionProgress() {
      var rect = canvas.getBoundingClientRect();
      return window.innerHeight - rect.top;
    }

    function draw() {
      var progress = reduced ? 0 : sectionProgress();
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var travel = progress * p.depth * 0.35;
        var y = (p.by * height - travel) % height;
        if (y < 0) y += height;
        var x = p.bx * width + Math.sin(p.seed + progress * 0.0016) * p.drift;
        ctx.beginPath();
        if (p.ember) { ctx.shadowColor = "hsla(" + p.hue + ", " + p.sat + "%, " + p.light + "%, 0.9)"; ctx.shadowBlur = 6; }
        else { ctx.shadowBlur = 0; }
        ctx.fillStyle = "hsla(" + p.hue + ", " + p.sat + "%, " + p.light + "%, " + p.alpha + ")";
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    function onScroll() {
      if (reduced || !visible) return;
      if (!ticking) { ticking = true; requestAnimationFrame(function () { draw(); ticking = false; }); }
    }

    seed(); draw();
    var to;
    window.addEventListener("resize", function () { clearTimeout(to); to = setTimeout(function () { seed(); draw(); }, 200); }, { passive: true });
    if (!reduced) window.addEventListener("scroll", onScroll, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) draw();
      }, { threshold: 0 }).observe(canvas);
    }

    var fb = parseFloat(canvas.getAttribute("data-fade-bottom"));
    if (!isNaN(fb)) {
      var g = "linear-gradient(to bottom, #000 " + Math.round(fb * 100) + "%, transparent 100%)";
      canvas.style.webkitMaskImage = g;
      canvas.style.maskImage = g;
    }
  }
  document.querySelectorAll("[data-particles]").forEach(initParticles);

  // ── Portfólio: clique para tocar (pôster limpo, sem chrome do YouTube no repouso) ──
  document.querySelectorAll(".pf-play[data-yt]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-yt");
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      f.title = "Prévia Bellus Eventos";
      f.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      f.setAttribute("allowfullscreen", "");
      btn.appendChild(f);
      btn.classList.add("is-playing");
    });
  });

  // ── Formulário de disponibilidade → Supabase ────────────
  var form = document.getElementById("lead-form");
  var feedback = document.getElementById("lead-feedback");
  var submitBtn = document.getElementById("lead-submit");

  // Data mínima = hoje (impede marcar data passada) + máscara de WhatsApp p/ preenchimento correto.
  var hojeD = new Date();
  var HOJE_ISO = hojeD.getFullYear() + "-" + String(hojeD.getMonth() + 1).padStart(2, "0") + "-" + String(hojeD.getDate()).padStart(2, "0");
  var dataInput = form ? form.querySelector('[name="dataCasamento"]') : null;
  if (dataInput) dataInput.min = HOJE_ISO;
  var waInput = form ? form.querySelector('[name="whatsapp"]') : null;
  function maskPhone(v) {
    var d = (v || "").replace(/\D/g, "").slice(0, 11);
    if (!d) return "";
    if (d.length <= 2) return "(" + d;
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }
  if (waInput) waInput.addEventListener("input", function () { waInput.value = maskPhone(waInput.value); });

  function setFeedback(msg, kind) {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.className = "form__feedback" + (kind ? " is-" + kind : "");
  }

  function waFallbackLink(data) {
    var parts = [
      "Olá! Tentei enviar pela página do Thiago Bellus mas tive um problema no envio. Seguem meus dados para consultar a disponibilidade:",
      "Nome: " + (data.nome || ""),
      data.servico ? "Serviço: " + data.servico : "",
      "WhatsApp: " + (data.whatsapp || ""),
      "E-mail: " + (data.email || ""),
      "Data: " + (data.dataCasamento || ""),
      data.cidade ? "Cidade: " + data.cidade : "",
      data.local ? "Local: " + data.local : "",
      data.convidados ? "Convidados: " + data.convidados : "",
      data.mensagem ? "Mensagem: " + data.mensagem : "",
    ].filter(Boolean);
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(parts.join("\n"));
  }

  // Erro no envio: avisa, deixa o form avermelhado e abre o WhatsApp já com os dados.
  function failToWhatsapp(data, msg) {
    form.classList.remove("is-ok");
    form.classList.add("is-error");
    setFeedback((msg || "Não foi possível enviar agora.") + " Sem problema: vamos abrir o WhatsApp já com os seus dados para você concluir por lá.", "error");
    setTimeout(function () { window.location.href = waFallbackLink(data); }, 1800);
  }

  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var fd = new FormData(form);
      var data = {
        nome: (fd.get("nome") || "").toString().trim(),
        nomeParceiro: "", servico: (fd.get("servico") || "").toString().trim(),
        whatsapp: (fd.get("whatsapp") || "").toString().trim(),
        email: (fd.get("email") || "").toString().trim(),
        dataCasamento: (fd.get("dataCasamento") || "").toString().trim(),
        cidade: (fd.get("cidade") || "").toString().trim(),
        local: (fd.get("local") || "").toString().trim(),
        convidados: (fd.get("convidados") || "").toString().trim(),
        mensagem: "[Thiago Bellus]" + (((fd.get("servico") || "").toString().trim()) ? " [" + (fd.get("servico") || "").toString().trim() + "]" : "") + " " + (fd.get("mensagem") || "").toString().trim(),
      };

      if (data.nome.length < 2) return setFeedback("Por favor, informe o seu nome.", "error");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return setFeedback("E-mail inválido. Confira o endereço, ex.: nome@email.com.", "error");
      var waDig = data.whatsapp.replace(/\D/g, "");
      if (waDig.length < 10 || waDig.length > 11) return setFeedback("Informe um WhatsApp válido com DDD, ex.: (21) 90000-0000.", "error");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dataCasamento)) return setFeedback("Informe a data do serviço.", "error");
      if (data.dataCasamento < HOJE_ISO) return setFeedback("A data do serviço precisa ser hoje ou no futuro.", "error");

      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Enviando...";
      setFeedback("", null);
      form.classList.remove("is-ok", "is-error");

      fetch(SUPABASE_FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { ok: res.ok, body: body };
          });
        })
        .then(function (r) {
          if (r.ok && r.body && r.body.success) {
            form.reset();
            form.classList.remove("is-error");
            form.classList.add("is-ok");
            if (window.fbq) fbq("track", "Lead");
            setFeedback("Recebemos os seus dados! Deu tudo certo. Em breve falamos com você pelo WhatsApp.", "ok");
          } else {
            var msg = (r.body && r.body.error) || "Não foi possível enviar agora.";
            failToWhatsapp(data, msg);
          }
        })
        .catch(function () {
          failToWhatsapp(data, "Tivemos um problema de conexão.");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });
  }

  // ── Avaliações do Google (via edge function com cache) ──────
  var REVIEWS_URL =
    "https://nngvxucybligmanbedrs.supabase.co/functions/v1/google-reviews";
  var reviewsList = document.getElementById("reviews-list");
  var reviewsSummary = document.getElementById("reviews-summary");
  var reviewsSection = document.getElementById("avaliacoes");

  function escHtml(str) {
    return (str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function starRow(n) {
    var full = Math.round(n || 5), s = "";
    for (var i = 0; i < 5; i++) s += '<span class="star">' + (i < full ? "★" : "☆") + "</span>";
    return s;
  }
  function renderReviews(data) {
    if (!data || !data.reviews || !data.reviews.length || !reviewsList) return;
    if (reviewsSummary) {
      var score = Number(data.rating != null ? data.rating : 5).toFixed(1).replace(".", ",");
      var link = data.url || "https://www.google.com/maps";
      reviewsSummary.innerHTML =
        '<a class="reviews__badge" href="' + escHtml(link) + '" target="_blank" rel="noopener">' +
        '<span class="reviews__stars">' + starRow(data.rating) + "</span>" +
        '<span class="reviews__score">' + score + "</span>" +
        '<span class="reviews__count">' +
        (data.total ? "· " + data.total + " avaliações no Google" : "· no Google") +
        "</span></a>";
    }
    reviewsList.innerHTML = data.reviews.slice(0, 3).map(function (rv) {
      var letter = ((rv.author || "?").trim().charAt(0) || "?").toUpperCase();
      return '<figure class="review reveal is-visible">' +
        '<div class="review__head"><span class="review__avatar" aria-hidden="true">' +
        escHtml(letter) + "</span>" +
        '<div><figcaption class="review__name">' + escHtml(rv.author) + "</figcaption>" +
        '<span class="review__stars">' + starRow(rv.rating) + "</span></div></div>" +
        '<blockquote class="review__text">' + escHtml(rv.text) + "</blockquote></figure>";
    }).join("");
    if (reviewsSection) reviewsSection.hidden = false;
  }
  if (reviewsList) {
    fetch(REVIEWS_URL, { headers: { apikey: SUPABASE_ANON_KEY } })
      .then(function (r) { return r.json(); })
      .then(renderReviews)
      .catch(function () { /* falhou: secao continua escondida */ });
  }

  // ── Reels: modal + arrastar com mouse + tocar o próximo ──
  var reelModal = document.getElementById("reel-modal");
  var reelVideo = document.getElementById("reel-video");
  var reelStrip = document.querySelector(".reels-strip");
  if (reelModal && reelVideo && reelStrip) {
    var reelClose = reelModal.querySelector(".reel-modal__close");
    var reelCards = Array.prototype.slice.call(reelStrip.querySelectorAll(".reel-card[data-src]"));
    var reelSrcs = reelCards.map(function (c) { return c.getAttribute("data-src"); });
    var reelIdx = -1;

    function openReel(i) {
      if (i < 0 || i >= reelSrcs.length) return;
      reelIdx = i;
      reelVideo.src = reelSrcs[i];
      reelModal.classList.add("is-open");
      reelModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      var p = reelVideo.play();
      if (p && p.catch) p.catch(function () {});
    }
    function closeReel() {
      reelVideo.pause();
      reelVideo.removeAttribute("src");
      reelVideo.load();
      reelModal.classList.remove("is-open");
      reelModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      reelIdx = -1;
    }
    reelCards.forEach(function (card, i) {
      card.addEventListener("click", function () { openReel(i); });
    });
    // ao terminar, já toca o próximo da sequência
    reelVideo.addEventListener("ended", function () {
      if (reelIdx + 1 < reelSrcs.length) openReel(reelIdx + 1);
    });
    if (reelClose) reelClose.addEventListener("click", closeReel);
    reelModal.addEventListener("click", function (e) { if (e.target === reelModal) closeReel(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && reelModal.classList.contains("is-open")) closeReel();
    });

    // arrastar com o mouse para rolar a faixa (touch usa scroll nativo)
    var down = false, startX = 0, startScroll = 0, moved = false;
    reelStrip.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; startX = e.clientX; startScroll = reelStrip.scrollLeft;
      reelStrip.classList.add("is-grabbing");
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      reelStrip.scrollLeft = startScroll - dx;
    });
    window.addEventListener("pointerup", function () {
      if (down) { down = false; reelStrip.classList.remove("is-grabbing"); }
    });
    // se arrastou, não abre o vídeo no soltar
    reelStrip.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    // setas (desktop)
    function cardStep() {
      var c = reelStrip.querySelector(".reel-card");
      return c ? c.getBoundingClientRect().width + 16 : 260;
    }
    var navPrev = document.querySelector(".reels-nav--prev");
    var navNext = document.querySelector(".reels-nav--next");
    if (navPrev) navPrev.addEventListener("click", function () { reelStrip.scrollBy({ left: -cardStep(), behavior: "smooth" }); });
    if (navNext) navNext.addEventListener("click", function () { reelStrip.scrollBy({ left: cardStep(), behavior: "smooth" }); });
  }

  // ── Botões "Seguir" no Instagram (indicador visual após o clique) ──
  // O Instagram não permite seguir nem verificar follow a partir de outro site;
  // isto apenas abre o perfil em nova aba e marca um check visual após o clique.
  document.querySelectorAll("[data-follow]").forEach(function (btn) {
    var key = "bellus_follow_" + btn.getAttribute("data-follow");
    var label = btn.querySelector(".follow-btn__label");
    function markFollowing() {
      btn.classList.add("is-following");
      if (label) label.textContent = "✓ Seguindo";
    }
    try { if (localStorage.getItem(key) === "1") markFollowing(); } catch (e) {}
    btn.addEventListener("click", function () {
      try { localStorage.setItem(key, "1"); } catch (e) {}
      setTimeout(markFollowing, 500);
    });
  });
})();
