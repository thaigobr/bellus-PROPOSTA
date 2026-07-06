/* ============================================================
   THIAGO BELLUS · SALA DE CORTE · motor de motion + form
   GSAP + ScrollTrigger + Lenis via CDN (com fallback estático)
   ============================================================ */
(function () {
  "use strict";

  // ── Integração Supabase (chave publishable: segura no navegador) ──
  var SUPABASE_FN_URL = "https://nngvxucybligmanbedrs.supabase.co/functions/v1/create-lead-bellus";
  var SUPABASE_ANON_KEY = "sb_publishable_UhC5LHa4Ob5vSY4K5xrM5Q_LG3pllu-";
  var WHATSAPP = "5521981636666";

  // ── ÍNDICE · feed real do Instagram (ig/feed.json, sincronizado do @thiago.bellus) ──
  (function igLive() {
    var grid = document.getElementById("ig-grid"); if (!grid) return;
    fetch("ig/feed.json?t=" + Date.now())
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.posts || j.posts.length < 6) return;
        var IG = "https://www.instagram.com/";
        grid.innerHTML = j.posts.slice(0, 9).map(function (p) {
          var href = IG + (p.tipo === "reel" ? "reel/" : "p/") + p.code + "/";
          var alt = String(p.alt || "Publicação de @thiago.bellus").replace(/"/g, "&quot;");
          return '<a class="ig__tile" href="' + href + '" target="_blank" rel="noopener" aria-label="Abrir publicação no Instagram">' +
            '<img src="ig/' + p.code + '.jpg" loading="lazy" alt="' + alt + '"/>' +
            (p.tipo === "reel" ? '<span class="ig__reel" aria-hidden="true"></span>' : '') + '</a>';
        }).join("");
        if (window.gsap) { window.gsap.set("#ig-grid .ig__tile", { autoAlpha: 1, scale: 1, clearProps: "transform" }); }
        deckReveal(grid);
      })
      .catch(function () {});

    // revela o grid em linhas: cada fileira desliza de trás da anterior, no ritmo do scroll
    function deckReveal(g) {
      var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!window.gsap || !window.ScrollTrigger || rm) return;
      var tiles = g.querySelectorAll(".ig__tile");
      if (tiles.length < 9) return;
      var r1 = [].slice.call(tiles, 0, 3), r2 = [].slice.call(tiles, 3, 6), r3 = [].slice.call(tiles, 6, 9);
      window.gsap.set(r1, { zIndex: 3 });
      window.gsap.set(r2, { zIndex: 2, yPercent: -100, y: -3 });
      window.gsap.set(r3, { zIndex: 1, yPercent: -200, y: -6 });
      window.gsap.timeline({ scrollTrigger: { trigger: g, start: "top 72%", end: "bottom 60%", scrub: 0.5 } })
        .to(r2, { yPercent: 0, y: 0, ease: "none", duration: 1 }, 0)
        .to(r3, { yPercent: 0, y: 0, ease: "none", duration: 1 }, 0);
      window.ScrollTrigger.refresh();
    }
  })();

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var isDesktop = window.matchMedia && window.matchMedia("(min-width: 1024px)").matches;

  /* ════════════════ FORM · ORDEM DE PRODUÇÃO (máquina preservada) ════════════════ */
  var form = document.getElementById("lead-form");
  var submitBtn = document.getElementById("lead-submit");
  var feedback = document.getElementById("lead-feedback");
  var HOJE_ISO = (function () { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); })();

  function setFeedback(msg, kind) {
    if (!feedback) return;
    feedback.textContent = msg || "";
    form.classList.remove("is-ok", "is-error");
    if (kind === "ok") form.classList.add("is-ok");
    if (kind === "error") form.classList.add("is-error");
  }
  function waFallbackLink(data) {
    var parts = [
      "Olá, Thiago! Tentei enviar pela sua página mas tive um problema no envio. Seguem meus dados para o orçamento:",
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
  function failToWhatsapp(data, msg) {
    form.classList.remove("is-ok");
    form.classList.add("is-error");
    setFeedback((msg || "Não foi possível enviar agora.") + " Sem problema: vamos abrir o WhatsApp já com os seus dados para você concluir por lá.", "error");
    setTimeout(function () { window.location.href = waFallbackLink(data); }, 1800);
  }
  function shakeForm() {
    if (window.gsap && !reduceMotion) gsap.fromTo(form, { x: -4 }, { x: 4, duration: 0.08, repeat: 5, yoyo: true, clearProps: "x" });
  }
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var fd = new FormData(form);
      var servico = (fd.get("servico") || "").toString().trim();
      var data = {
        nome: (fd.get("nome") || "").toString().trim(),
        nomeParceiro: "",
        servico: servico,
        whatsapp: (fd.get("whatsapp") || "").toString().trim(),
        email: (fd.get("email") || "").toString().trim(),
        dataCasamento: (fd.get("dataCasamento") || "").toString().trim(),
        cidade: (fd.get("cidade") || "").toString().trim(),
        local: (fd.get("local") || "").toString().trim(),
        convidados: (fd.get("convidados") || "").toString().trim(),
        mensagem: "[Thiago Bellus]" + (servico ? " [" + servico + "]" : "") + " " + (fd.get("mensagem") || "").toString().trim(),
      };
      if (data.nome.length < 2) { shakeForm(); return setFeedback("Faltou um detalhe na ordem de produção. Confere o seu nome.", "error"); }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) { shakeForm(); return setFeedback("E-mail inválido. Confira o endereço, ex.: nome@email.com.", "error"); }
      var waDig = data.whatsapp.replace(/\D/g, "");
      if (waDig.length < 10 || waDig.length > 11) { shakeForm(); return setFeedback("Informe um WhatsApp válido com DDD, ex.: (21) 90000-0000.", "error"); }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dataCasamento)) { shakeForm(); return setFeedback("Informe a data do evento.", "error"); }
      if (data.dataCasamento < HOJE_ISO) { shakeForm(); return setFeedback("A data do evento precisa ser hoje ou no futuro.", "error"); }

      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Enviando...";
      setFeedback("", null);
      form.classList.remove("is-ok", "is-error");

      fetch(SUPABASE_FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY },
        body: JSON.stringify(data),
      })
        .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
        .then(function (r) {
          if (r.ok && r.body && r.body.success) {
            form.reset();
            form.classList.remove("is-error");
            form.classList.add("is-ok");
            if (window.fbq) fbq("track", "Lead");
            submitBtn.textContent = "Orçamento recebido!";
            setFeedback("Recebemos o seu pedido. Em breve o Thiago fala com você pelo WhatsApp.", "ok");
            var slate = document.querySelector(".callsheet__slate");
            if (slate && window.gsap && !reduceMotion) gsap.fromTo(slate, { scaleY: 1 }, { scaleY: 1.6, duration: 0.15, yoyo: true, repeat: 1, transformOrigin: "top" });
          } else {
            var msg = (r.body && r.body.error) || "Não foi possível enviar agora.";
            submitBtn.textContent = originalLabel;
            failToWhatsapp(data, msg);
          }
        })
        .catch(function () { submitBtn.textContent = originalLabel; failToWhatsapp(data, "Tivemos um problema de conexão."); })
        .finally(function () { submitBtn.disabled = false; });
    });
  }

  /* ════════════════ CLIPS · facade de vídeo (funciona mesmo sem GSAP) ════════════════ */
  var liveClip = null; // { clip, facade, frame }
  function destroyLive() {
    if (!liveClip) return;
    if (liveClip.frame && liveClip.frame.parentNode) liveClip.frame.parentNode.removeChild(liveClip.frame);
    if (liveClip.facade) liveClip.facade.style.display = "";
    liveClip.clip.classList.remove("is-playing");
    liveClip = null;
  }
  function posterFallback(img) {
    img.addEventListener("error", function () {
      var n = parseInt(img.dataset.fb || "0", 10);
      var id = img.closest(".clip") ? img.closest(".clip").getAttribute("data-yt") : null;
      if (!id) return;
      var next = ["sddefault", "hqdefault"][n];
      if (!next) return;
      img.dataset.fb = String(n + 1);
      img.src = "https://i.ytimg.com/vi/" + id + "/" + next + ".jpg";
    });
    img.addEventListener("load", function () {
      if (img.naturalWidth && img.naturalWidth < 640 && (img.dataset.fb || "0") === "0") {
        img.dataset.fb = "1";
        var id = img.closest(".clip") ? img.closest(".clip").getAttribute("data-yt") : null;
        if (id) img.src = "https://i.ytimg.com/vi/" + id + "/sddefault.jpg";
      }
    });
  }
  document.querySelectorAll(".clip").forEach(function (clip) {
    var id = clip.getAttribute("data-yt");
    if (!id) return;
    var facade = clip.querySelector(".clip__facade");
    var poster = clip.querySelector(".clip__poster");
    if (poster) posterFallback(poster);
    // scrub falso de thumbs no hover (so desktop)
    if (finePointer && poster && !reduceMotion) {
      var scrubTimer = null, scrubIdx = 0, preloaded = false, baseSrc = null;
      clip.addEventListener("mouseenter", function () {
        if (clip.classList.contains("is-playing")) return;
        if (!preloaded) { preloaded = true; [1, 2, 3].forEach(function (n) { var im = new Image(); im.src = "https://i.ytimg.com/vi/" + id + "/" + n + ".jpg"; }); }
        baseSrc = poster.src;
        scrubTimer = setInterval(function () { scrubIdx = (scrubIdx % 3) + 1; poster.src = "https://i.ytimg.com/vi/" + id + "/" + scrubIdx + ".jpg"; }, 350);
      });
      clip.addEventListener("mouseleave", function () { if (scrubTimer) { clearInterval(scrubTimer); scrubTimer = null; } if (baseSrc) poster.src = baseSrc; });
      clip.addEventListener("click", function () { if (scrubTimer) { clearInterval(scrubTimer); scrubTimer = null; } }, true);
    }
    if (facade) facade.addEventListener("click", function () {
      destroyLive();
      var frame = document.createElement("div");
      frame.className = "clip__frame";
      var ifr = document.createElement("iframe");
      ifr.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      ifr.title = facade.getAttribute("aria-label") || "Filme";
      ifr.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
      ifr.setAttribute("allowfullscreen", "");
      frame.appendChild(ifr);
      facade.style.display = "none";
      facade.parentNode.insertBefore(frame, facade.nextSibling);
      clip.classList.add("is-playing");
      liveClip = { clip: clip, facade: facade, frame: frame };
      if (window.gsap && !reduceMotion) {
        gsap.to(".letterbox--top,.letterbox--bottom", { scaleY: 1, duration: 0.6, ease: "power3.inOut" });
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  // slot de render vira clip quando ganhar data-yt (futuro)
  document.querySelectorAll(".render-slot__screen[data-player]").forEach(function (sc) {
    var id = sc.getAttribute("data-yt");
    if (!id) return;
    sc.innerHTML = "";
    var b = document.createElement("button");
    b.className = "clip__facade"; b.type = "button"; b.setAttribute("aria-label", "Assistir");
    b.innerHTML = '<img class="clip__poster" src="https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg" loading="lazy" alt=""/><span class="clip__play" aria-hidden="true"></span>';
    sc.appendChild(b);
  });

  /* ════════════════ MOTION (GSAP + Lenis, com guarda) ════════════════ */
  function boot() {
    if (!window.gsap || !window.ScrollTrigger) { document.documentElement.classList.add("gsap-failed"); return; }
    gsap.registerPlugin(ScrollTrigger);

    var lenis = null;
    var isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (window.Lenis && !isTouch && !reduceMotion) {
      lenis = new Lenis({ smoothWheel: true, syncTouch: false });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    function scrollToEl(target) {
      var el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { duration: 1.2, easing: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }, offset: -20 });
      else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }

    // ── split por palavra (preserva <em> e <br>) ──
    function splitWords(el) {
      function process(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var words = child.textContent.split(/(\s+)/);
            var frag = document.createDocumentFragment();
            words.forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(" ")); return; }
              var outer = document.createElement("span"); outer.className = "w";
              var inner = document.createElement("span"); inner.className = "w__inner";
              inner.textContent = w; outer.appendChild(inner); frag.appendChild(outer);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1 && child.tagName !== "BR") {
            process(child);
          }
        });
      }
      el.setAttribute("aria-label", el.textContent.trim());
      process(el);
      return el.querySelectorAll(".w__inner");
    }

    // ── HUD: timecode + playhead + clip ativo (um ticker so) ──
    var tcEl = document.getElementById("hud-timecode");
    var playhead = document.getElementById("timeline-playhead");
    var track = document.getElementById("timeline-track");
    var clipsNav = Array.prototype.slice.call(document.querySelectorAll(".timeline__clip"));
    var secEls = clipsNav.map(function (b) { return document.querySelector(b.getAttribute("data-target")); });
    var tcFrozen = false;
    function fmtTC(sec) {
      var fr = Math.floor((sec % 1) * 24);
      var s = Math.floor(sec) % 60, m = Math.floor(sec / 60) % 60, h = Math.floor(sec / 3600);
      function p(n) { return String(n).padStart(2, "0"); }
      return p(h) + ":" + p(m) + ":" + p(s) + ":" + p(fr);
    }
    function sizeTimeline() {
      var totalH = 0, hs = secEls.map(function (s) { var h = s ? s.offsetHeight : 1; totalH += h; return h; });
      clipsNav.forEach(function (b, i) { b.style.flexGrow = String(Math.max(hs[i] / totalH * 100, 3)); });
    }
    sizeTimeline();
    var rsT = null;
    window.addEventListener("resize", function () { clearTimeout(rsT); rsT = setTimeout(function () { sizeTimeline(); ScrollTrigger.refresh(); }, 200); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });

    gsap.ticker.add(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var prog = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      if (tcEl && !tcFrozen) tcEl.textContent = fmtTC(prog * 180);
      if (playhead && track) {
        var w = track.clientWidth - 22;
        playhead.style.transform = "translateX(" + (prog * w) + "px)";
      }
      var mid = window.scrollY + window.innerHeight * 0.5, active = 0;
      for (var i = 0; i < secEls.length; i++) { if (secEls[i] && secEls[i].offsetTop <= mid) active = i; }
      clipsNav.forEach(function (b, i) { b.classList.toggle("is-active", i === active); });
    });
    clipsNav.forEach(function (b) { b.addEventListener("click", function () { scrollToEl(b.getAttribute("data-target")); }); });

    // ── grão de filme (desktop, 8fps, tiles pre-gerados) ──
    (function grain() {
      if (reduceMotion || window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)) return;
      var cv = document.querySelector(".grain"); if (!cv) return;
      var ctx = cv.getContext("2d"); if (!ctx) return;
      var tiles = [];
      for (var t = 0; t < 6; t++) {
        var tc = document.createElement("canvas"); tc.width = 128; tc.height = 128;
        var tctx = tc.getContext("2d"), idata = tctx.createImageData(128, 128);
        for (var i = 0; i < idata.data.length; i += 4) { var v = Math.random() * 255; idata.data[i] = v; idata.data[i + 1] = v; idata.data[i + 2] = v; idata.data[i + 3] = 255; }
        tctx.putImageData(idata, 0, 0); tiles.push(tc);
      }
      function size() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
      size(); window.addEventListener("resize", size, { passive: true });
      var fi = 0, timer = setInterval(function () {
        if (document.hidden) return;
        fi = (fi + 1) % 6;
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.fillStyle = ctx.createPattern(tiles[fi], "repeat");
        ctx.fillRect(0, 0, cv.width, cv.height);
      }, 125);
      void timer;
    })();

    // ── cursor custom (pointer fine) ──
    (function cursor() {
      if (!finePointer || reduceMotion) return;
      var cur = document.getElementById("cursor"); if (!cur) return;
      document.body.classList.add("has-cursor");
      var label = cur.querySelector(".cursor__label");
      // 1:1 com o mouse: sem suavização, o ponteiro acompanha o movimento exato
      document.addEventListener("mousemove", function (e) {
        cur.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
      }, { passive: true });
      document.addEventListener("mouseover", function (e) {
        var clip = e.target.closest ? e.target.closest(".clip__facade") : null;
        if (clip) { cur.classList.add("is-play"); if (label) label.textContent = "PLAY"; return; }
        cur.classList.remove("is-play");
      }, true);
    })();

    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", function () {

      // estados iniciais (via GSAP: sem JS a pagina fica visivel)
      gsap.set("[data-anim]", { autoAlpha: 0, y: 32 });
      gsap.set('[data-anim="sheet"]', { y: 80 });
      gsap.set(".line__inner", { yPercent: 110 });
      // ficha: a máscara de revelação só roda em telas largas; no mobile o texto
      // fica sempre visível (a máscara cortava conteúdo que quebra em várias linhas)
      var fichaAnim = window.innerWidth > 700;
      gsap.set(".ficha__fill", { scaleX: 0 });
      if (fichaAnim) gsap.set(".ficha__row dt,.ficha__row dd", { yPercent: 120, autoAlpha: 0 });
      gsap.set(".ig__tile", { autoAlpha: 0, scale: 0.96 });
      gsap.set(".indice__row", { autoAlpha: 0 });
      gsap.set(".still__corners", { autoAlpha: 0 });
      gsap.set(".hud__corner", { autoAlpha: 0, scale: 0.4 });
      gsap.set(".hero__overline", { clipPath: "inset(0 100% 0 0)" });
      gsap.set(".hero__sub", { autoAlpha: 0, y: 24 });

      // headings com split + contador RENDER
      document.querySelectorAll("[data-split]").forEach(function (h) {
        var inners = splitWords(h);
        gsap.set(inners, { yPercent: 110 });
        var counter = document.createElement("span");
        counter.className = "render-counter"; counter.setAttribute("aria-hidden", "true"); counter.textContent = "RENDER 0%";
        h.appendChild(counter);
        var isHero = h.classList.contains("hero__title");
        var obj = { v: 0 };
        var tl = gsap.timeline({
          paused: isHero,
          scrollTrigger: isHero ? undefined : { trigger: h, start: "top 82%", once: true },
          onComplete: function () { gsap.to(counter, { autoAlpha: 0, duration: 0.5, delay: 0.5 }); }
        });
        tl.to(inners, { yPercent: 0, duration: 0.9, ease: "power3.out", stagger: 0.04 }, 0)
          .to(obj, {
            v: 100, duration: 0.9, ease: "power2.out", snap: { v: 1 },
            onUpdate: function () { counter.textContent = "RENDER " + Math.round(obj.v) + "%"; }
          }, 0);
        if (isHero) h._heroTl = tl;
      });

      // fades genericos
      document.querySelectorAll('[data-anim="fade"],[data-anim="card"],[data-anim="ig"],[data-anim="sheet"]').forEach(function (el) {
        gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
      });

      // S01 HERO: timeline de load
      var heroTitle = document.querySelector(".hero__title");
      var heroLoad = gsap.timeline({ delay: 0.15 });
      heroLoad.to(".hud__corner", { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power3.out", stagger: 0.06 }, 0)
        .to(".hero__overline", { clipPath: "inset(0 0% 0 0)", autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.6)
        .add(function () { if (heroTitle && heroTitle._heroTl) heroTitle._heroTl.play(); }, 0.8)
        .to(".hero__sub", { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, 1.4);
      gsap.to(".hero__inner", {
        y: "-8%", autoAlpha: 0.35, ease: "none",
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
      });
      // FILMMAKER (manifesto)
      gsap.to(".manifesto__quote .line__inner", {
        yPercent: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
        scrollTrigger: { trigger: ".manifesto__quote", start: "top 76%", once: true }
      });
      gsap.to(".still__corners", { autoAlpha: 1, duration: 0.6, scrollTrigger: { trigger: ".still--main", start: "top 60%", once: true } });
      gsap.fromTo(".still--main", { y: 26 }, { y: -26, ease: "none", scrollTrigger: { trigger: "#filmmaker", start: "top bottom", end: "bottom top", scrub: 1 } });
      gsap.fromTo(".scene-number", { x: 0 }, { x: -40, ease: "none", scrollTrigger: { trigger: "#filmmaker", start: "top bottom", end: "bottom top", scrub: 1 } });

      // S03 indice
      gsap.to(".indice__row", {
        autoAlpha: 1, duration: 0.8, ease: "power3.inOut", stagger: 0.1,
        scrollTrigger: { trigger: "#indice-list", start: "top 78%", once: true }
      });

      // Bins: vídeos sempre visíveis, sem reveal de scroll (pedido do Thiago)

      // S06 barras de render
      document.querySelectorAll(".render-slot__bar i").forEach(function (bar) {
        gsap.fromTo(bar, { width: "62%" }, {
          width: "84%", duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1,
          scrollTrigger: { trigger: bar, start: "top 95%", toggleActions: "play pause resume pause" }
        });
      });

      // S07 instagram
      gsap.to(".ig__tile", {
        autoAlpha: 1, scale: 1, duration: 0.5, ease: "power2.out",
        stagger: { each: 0.05, grid: [3, 3], from: "center" },
        scrollTrigger: { trigger: ".ig__grid", start: "top 80%", once: true }
      });
      ScrollTrigger.create({
        trigger: "#instagram", start: "top 45%", once: true,
        onEnter: function () {
          var f = document.getElementById("ig-follow");
          if (f) gsap.fromTo(f, { scale: 1 }, { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.inOut" });
          var ring = document.querySelector(".ig__avatar-ring");
          if (ring) gsap.fromTo(ring, { rotate: -180 }, { rotate: 0, duration: 0.8, ease: "power2.out" });
        }
      });

      // S08 ficha tecnica (só quando a máscara está ativa; ver fichaAnim acima)
      if (fichaAnim) document.querySelectorAll(".ficha__row").forEach(function (row, i) {
        var fill = row.querySelector(".ficha__fill");
        var parts = row.querySelectorAll("dt,dd");
        var tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 84%", once: true }, delay: (i % 3) * 0.05 });
        tl.to(parts, { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" }, 0);
        if (fill) tl.to(fill, { scaleX: 1, duration: 0.5, ease: "power2.out" }, 0.15);
      });

      // S10 creditos: REC apaga + timecode congela + FIM
      var fim = document.getElementById("fim");
      if (fim) gsap.set(fim, { autoAlpha: 0, filter: "blur(6px)" });
      ScrollTrigger.create({
        trigger: "#creditos", start: "top 70%", once: true,
        onEnter: function () {
          var dot = document.querySelector(".hud__rec-dot");
          var rec = document.querySelector(".hud__rec");
          if (dot) { dot.style.animation = "none"; gsap.timeline().to(dot, { opacity: 0.15, duration: 0.18, yoyo: true, repeat: 3 }).to(rec, { autoAlpha: 0, duration: 0.4 }); }
          tcFrozen = true;
          if (fim) gsap.to(fim, { autoAlpha: 1, filter: "blur(0px)", duration: 1, ease: "expo.out", delay: 0.4 });
        }
      });

      return function () { };
    });

    gsap.matchMedia().add("(prefers-reduced-motion: reduce)", function () {
      gsap.set("[data-anim],.line__inner,.ficha__fill,.ficha__row dt,.ficha__row dd,.ig__tile,.indice__row,.still__corners,.hud__corner,.hero__overline,.hero__sub,#fim", { clearProps: "all", autoAlpha: 1, y: 0, x: 0, scale: 1, yPercent: 0, clipPath: "none" });
      return function () { };
    });

    // ── indice: thumb flutuante + foco de linha (desktop) ──
    (function indiceFloat() {
      var list = document.getElementById("indice-list");
      var float = document.getElementById("indice-float");
      if (!list) return;
      var img = float ? float.querySelector("img") : null;
      var links = list.querySelectorAll(".indice__link");
      links.forEach(function (a) {
        a.addEventListener("click", function (e) {
          var href = a.getAttribute("href");
          if (href && href.charAt(0) === "#") { e.preventDefault(); scrollToEl(href); }
        });
        if (!finePointer || !float || reduceMotion) return;
        a.addEventListener("mouseenter", function () {
          list.classList.add("is-hovering");
          var th = a.getAttribute("data-thumb");
          if (th && img) {
            img.src = th;
            gsap.to(float, { clipPath: "circle(75% at 50% 50%)", duration: 0.35, ease: "power3.out" });
          }
        });
        a.addEventListener("mousemove", function (e) {
          if (!float) return;
          var r = list.getBoundingClientRect();
          gsap.to(float, { y: e.clientY - r.top - 60, duration: 0.35, ease: "power3.out" });
        });
        a.addEventListener("mouseleave", function () {
          list.classList.remove("is-hovering");
          if (float) gsap.to(float, { clipPath: "circle(0% at 50% 50%)", duration: 0.3, ease: "power3.in" });
        });
      });
    })();

  }

  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
})();
