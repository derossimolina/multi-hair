/* Multi-Hair: guia interativo. Sem build, sem dependências: abra index.html ou sirva a pasta. */
(() => {
  "use strict";

  const TEC = HAIR.tecnicas;
  const POR_ID = Object.fromEntries(TEC.map((t) => [t.id, t]));
  const app = document.getElementById("app");

  /* ───────────── utilidades ───────────── */
  const guardar = {
    ler(k, padrao) { try { const v = localStorage.getItem(k); return v === null ? padrao : JSON.parse(v); } catch (e) { return padrao; } },
    gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } }
  };

  function h(tag, attrs, ...filhos) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, "");
      else el.setAttribute(k, v);
    }
    const anexar = (f) => {
      if (f === null || f === undefined || f === false) return;
      if (Array.isArray(f)) f.forEach(anexar);
      else el.append(f.nodeType ? f : document.createTextNode(String(f)));
    };
    filhos.forEach(anexar);
    return el;
  }

  const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const link = (id, texto) => h("a", { href: `#/tecnica/${id}` }, texto || (POR_ID[id] ? POR_ID[id].nome : id));
  const seloGrupo = (g) => h("span", { class: `selo ${HAIR.grupos[g].cor}` }, HAIR.grupos[g].nome);

  /* realce de sintaxe mínimo (Python e R) */
  function realce(codigo, lang) {
    const palavras = lang === "py"
      ? /^(import|from|as|for|in|if|else|elif|print|def|return|with|and|or|not|True|False|None|lambda)$/
      : /^(library|function|if|else|for|in|TRUE|FALSE|NULL|NA|return)$/;
    const re = /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_.]*)/g;
    let saida = "", ultimo = 0, m;
    while ((m = re.exec(codigo))) {
      saida += esc(codigo.slice(ultimo, m.index));
      const [tudo, com, str, num, id] = m;
      if (com) saida += `<span class="tk-c">${esc(com)}</span>`;
      else if (str) saida += `<span class="tk-s">${esc(str)}</span>`;
      else if (num) saida += `<span class="tk-n">${num}</span>`;
      else if (id && palavras.test(id)) saida += `<span class="tk-k">${id}</span>`;
      else saida += esc(tudo);
      ultimo = m.index + tudo.length;
    }
    return saida + esc(codigo.slice(ultimo));
  }

  function blocoCodigo(codigo, lang) {
    const pre = h("pre");
    const code = h("code");
    code.innerHTML = realce(codigo, lang);
    pre.append(code);
    const btn = h("button", { class: "copiar", type: "button", "aria-label": "Copiar código" }, "Copiar");
    btn.addEventListener("click", async () => {
      let ok = false;
      try { await navigator.clipboard.writeText(codigo); ok = true; } catch (e) {
        const ta = h("textarea", { style: "position:fixed;opacity:0" }, codigo);
        document.body.append(ta); ta.select();
        try { ok = document.execCommand("copy"); } catch (e2) { /* sem suporte */ }
        ta.remove();
      }
      btn.textContent = ok ? "Copiado ✓" : "Selecione e copie";
      setTimeout(() => (btn.textContent = "Copiar"), 1800);
    });
    return h("div", { class: "codigo" }, pre, btn);
  }

  /* ───────────── roteador ───────────── */
  const rotas = {};
  function lerHash() {
    const bruto = location.hash.replace(/^#/, "") || "/";
    const [caminho, qs] = bruto.split("?");
    const partes = caminho.split("/").filter(Boolean);
    return { nome: partes[0] || "inicio", arg: partes[1] ? decodeURIComponent(partes[1]) : null, q: new URLSearchParams(qs || "") };
  }
  let rotaAnterior = "";
  function renderizar() {
    const r = lerHash();
    const fn = rotas[r.nome] || rotas.inicio;
    app.replaceChildren();
    fn(r);
    document.querySelectorAll("#menu a").forEach((a) => {
      const ativo = a.dataset.r === r.nome || (r.nome === "tecnica" && a.dataset.r === "tecnicas");
      a.classList.toggle("ativo", ativo);
      if (ativo) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (r.nome !== rotaAnterior) { window.scrollTo(0, 0); app.focus({ preventScroll: true }); }
    rotaAnterior = r.nome;
  }
  const irPara = (hash) => { location.hash = hash; };
  const trocarQuery = (hashBase, params) => { history.replaceState(null, "", `${hashBase}${params ? "?" + params : ""}`); renderizar(); };

  /* ───────────── início ───────────── */
  rotas.inicio = () => {
    document.title = "Multi-Hair · da pergunta à técnica";
    const entradas = [
      ["01", "Passo 0", "Quem é VD e quem é VI? Cole um enunciado e veja as pistas.", "#/passo0"],
      ["02", "Assistente", "Responda 3 ou 4 perguntas e receba a técnica indicada.", "#/assistente"],
      ["03", "Catálogo de técnicas", `${TEC.length} técnicas com código em Python, R, jamovi e JASP.`, "#/tecnicas"],
      ["04", "Exercícios", "Enunciados curtos: escolha a VD e a técnica e confira.", "#/exercicios"]
    ];
    const porGrupo = Object.keys(HAIR.grupos).map((g) => [g, TEC.filter((t) => t.grupo === g).length]);
    app.append(
      h("section", { class: "hero" },
        h("p", { class: "muted pequeno" }, "Análise multivariada · α = 0,05"),
        h("h1", null, "Da pergunta à técnica"),
        h("p", { class: "sub" }, "O diagrama do Hair em forma de site: ache a técnica certa para o seu enunciado, confira hipóteses e pressupostos, e copie o exemplo em Python, R, jamovi ou JASP.")),
      h("div", { class: "grade" }, entradas.map(([n, t, d, href]) =>
        h("a", { class: "cartao entrada", href }, h("span", { class: "num" }, n), h("h3", null, t), h("p", { class: "muted", style: "margin:0" }, d)))),
      h("div", { class: "numeros" },
        h("div", null, h("strong", null, String(TEC.length)), h("span", null, "técnicas")),
        h("div", null, h("strong", null, "4"), h("span", null, "ambientes de código")),
        h("div", null, h("strong", null, String(HAIR.exercicios.length)), h("span", null, "exercícios"))),
      h("h2", null, "Matriz 2×2 para memorizar"),
      matriz2x2(),
      h("h2", null, "Por grupo"),
      h("div", { class: "filtros" }, porGrupo.map(([g, n]) =>
        h("a", { class: `chip ${HAIR.grupos[g].cor}`, href: `#/tecnicas?g=${g}`, style: "text-decoration:none" }, `${HAIR.grupos[g].nome} · ${n}`))),
      h("div", { class: "nota" }, h("strong", null, "Antes de rodar os códigos: "), "leia a página ", h("a", { href: "#/preparacao" }, "Preparação"), ". Ela explica como carregar a base e tem um arquivo de dados sintético para os exemplos funcionarem de imediato.")
    );
  };

  function matriz2x2() {
    const m = HAIR.matriz2x2;
    return h("div", { class: "tabela-wrap matriz" }, h("table", null,
      h("thead", null, h("tr", null, h("th", null, "VI ↓ · VD →"), m.colunas.map((c) => h("th", null, c)))),
      h("tbody", null, m.linhas.map((l) => h("tr", null, h("th", null, l.vi), l.celulas.map((c) => h("td", null, h("a", { href: `#/tecnica/${c.id}` }, c.txt))))))),
    );
  }

  /* ───────────── passo 0 ───────────── */
  rotas.passo0 = () => {
    document.title = "Passo 0 · quem é VD e VI";
    const amostra = HAIR.exercicios.map((e) => e.enunciado);
    const area = h("textarea", { id: "enun", placeholder: "Cole aqui o enunciado do exercício ou a sua pergunta de pesquisa…", "aria-label": "Enunciado" });
    const marcado = h("div", { class: "marcado", "aria-live": "polite" });
    const achados = h("div");

    function analisar() {
      const texto = area.value;
      const hits = [];
      HAIR.pistas.forEach((p) => { for (const m of texto.matchAll(p.re)) hits.push({ ini: m.index, fim: m.index + m[0].length, p }); });
      hits.sort((a, b) => a.ini - b.ini || b.fim - a.fim);
      const uteis = []; let corte = 0;
      for (const x of hits) if (x.ini >= corte) { uteis.push(x); corte = x.fim; }
      marcado.replaceChildren();
      if (!texto.trim()) { marcado.append(h("span", { class: "muted" }, "As pistas encontradas aparecem destacadas aqui.")); achados.replaceChildren(); return; }
      let pos = 0;
      for (const x of uteis) {
        marcado.append(texto.slice(pos, x.ini));
        marcado.append(h("mark", { "data-p": x.p.papel, title: x.p.rotulo }, texto.slice(x.ini, x.fim)));
        pos = x.fim;
      }
      marcado.append(texto.slice(pos));
      achados.replaceChildren();
      if (!uteis.length) { achados.append(h("p", { class: "muted" }, "Nenhuma pista reconhecida. Tente o teste da frase abaixo.")); return; }
      const vistos = new Set();
      uteis.forEach((x) => {
        const chave = x.p.rotulo; if (vistos.has(chave)) return; vistos.add(chave);
        const trechos = uteis.filter((y) => y.p === x.p).map((y) => `“${texto.slice(y.ini, y.fim)}”`).join(", ");
        achados.append(h("div", { class: "achado" }, h("span", { class: "papel" }, x.p.papel), h("span", null, h("strong", null, x.p.rotulo), ` · ${trechos}. `, h("span", { class: "muted" }, x.p.dica))));
      });
      const papeis = new Set(uteis.map((x) => x.p.papel));
      if (papeis.has("Sem VD") && !papeis.has("VD")) achados.append(h("div", { class: "nota" }, "Parece uma relação simétrica: provavelmente não há VD. Veja qui-quadrado, correlação, AFE ou cluster."));
      if (papeis.has("VD")) achados.append(h("div", { class: "nota" }, "Há pistas de VD. Confirme com o teste da frase e siga para o ", h("a", { href: "#/assistente" }, "Assistente"), "."));
    }
    area.addEventListener("input", analisar);

    app.append(
      h("h1", null, "Passo 0 · quem é a VD e quem é a VI"),
      h("p", { class: "sub" }, "O papel da variável é definido pela pergunta, não pela variável. ", h("code", null, "Response"), " é VD em uma pergunta e VI em outra."),
      h("div", { class: "cartao analisador" },
        h("h2", { style: "margin-top:0" }, "Analisador de enunciado"),
        area,
        h("div", { class: "filtros" },
          h("span", { class: "muted pequeno" }, "Experimente:"),
          [0, 3, 4, 8].map((i) => h("button", { class: "chip", type: "button", onclick: () => { area.value = amostra[i]; analisar(); } }, `Exemplo ${i + 1}`))),
        marcado, h("div", { style: "margin-top:.8rem" }, achados),
        h("p", { class: "muted pequeno", style: "margin:.8rem 0 0" }, "O analisador só procura palavras-gatilho do guia. Ele ajuda a enxergar a pista, mas a decisão final é sua.")),
      h("h2", null, "Pistas e onde vão no jamovi"),
      h("div", { class: "tabela-wrap" }, h("table", null,
        h("thead", null, h("tr", null, ["Pista no enunciado", "Indica", "Exemplo na base iFood", "Onde vai no jamovi"].map((x) => h("th", null, x)))),
        h("tbody", null, HAIR.passo0.map((l) => h("tr", null, h("td", null, l.pista), h("td", null, h("strong", null, l.indica)), h("td", null, l.exemplo), h("td", null, l.onde)))))),
      h("div", { class: "nota" }, h("strong", null, "Teste da frase: "), "monte “[Y] depende de / varia conforme [X]”. Se a frase faz sentido e a pergunta vai nessa direção, Y é VD e X é VI. Se as duas direções servem e a pergunta não escolhe, a relação é simétrica e não há VD."),
      h("div", { class: "aviso" }, h("strong", null, "Antes de tudo, no jamovi: "), "em ", h("code", null, "Data › Setup"), ", defina o tipo de medida de cada variável (Nominal, Ordinal ou Continuous). O jamovi só deixa colocar em cada caixa os tipos compatíveis. Para ordinais, ordene os níveis na mesma tela (ex.: Basic < 2n Cycle < Graduation < Master < PhD)."),
      h("h2", null, "Matriz 2×2"),
      matriz2x2()
    );
    analisar();
  };

  /* ───────────── assistente ───────────── */
  rotas.assistente = (r) => {
    document.title = "Assistente · qual técnica usar";
    const arv = HAIR.arvore;
    const caminho = (r.q.get("p") || "").split(".").filter((x) => x !== "").map(Number);
    let no = arv.nos[arv.inicio]; const trilha = []; let resultado = null; let valido = true;
    for (const idx of caminho) {
      const op = no.opcoes[idx];
      if (!op) { valido = false; break; }
      trilha.push({ pergunta: no.texto, resposta: op.rotulo });
      if (op.res) { resultado = op.res; break; }
      no = arv.nos[op.prox];
    }
    if (!valido) { trocarQuery("#/assistente", ""); return; }

    const base = "#/assistente";
    const comCaminho = (arr) => (arr.length ? `${base}?p=${arr.join(".")}` : base);

    const cabeca = h("div", null,
      h("h1", null, "Assistente de decisão"),
      h("p", { class: "sub" }, "Segue as três perguntas do diagrama do Hair: tipo de relação, quantas VDs (ou estrutura de quê) e escala de medida."));
    const trilhaEl = trilha.length
      ? h("div", { class: "trilha", "aria-label": "Suas respostas" }, trilha.map((t) => h("span", { title: t.pergunta }, t.resposta)))
      : null;

    let corpo;
    if (resultado) {
      const [principal, ...extras] = resultado.map((id) => POR_ID[id]);
      const alt = principal.par && POR_ID[principal.par];
      corpo = h("div", { class: "cartao resultado" },
        h("p", { class: "muted pequeno", style: "margin:0" }, "Técnica indicada"),
        h("h2", { style: "margin-top:.2rem" }, h("a", { href: `#/tecnica/${principal.id}` }, principal.nome)),
        h("p", null, principal.paraQue),
        h("dl", { class: "fatos" },
          fato("VD", principal.vd), fato("VI", principal.vi), fato("H₀", principal.h0), fato("Tamanho de efeito", principal.efeito)),
        principal.seFalhar && principal.seFalhar !== "—" ? h("div", { class: "aviso" }, h("strong", null, "Se um pressuposto falhar: "), principal.seFalhar) : null,
        alt ? h("p", null, "Par ", principal.grupo === "naoparametrico" ? "paramétrico" : "não paramétrico", ": ", link(alt.id)) : null,
        extras.length ? h("div", null, h("h3", null, "Complementos"), h("div", { class: "grade" }, extras.map(cartaoTec))) : null,
        h("div", { style: "margin-top:1rem;display:flex;gap:.5rem;flex-wrap:wrap" },
          h("a", { class: "btn btn-prim", href: `#/tecnica/${principal.id}` }, "Ver código e interpretação"),
          h("a", { class: "btn", href: comCaminho(caminho.slice(0, -1)) }, "← Voltar"),
          h("a", { class: "btn", href: base }, "Recomeçar")));
    } else {
      corpo = h("div", { class: "cartao pergunta" },
        h("p", { class: "muted pequeno", style: "margin:0" }, `Pergunta ${caminho.length + 1}`),
        h("h2", null, no.texto),
        no.ajuda ? h("p", { class: "muted" }, no.ajuda) : null,
        h("div", { class: "opcoes" }, no.opcoes.map((op, i) =>
          h("a", { class: "opcao", href: comCaminho([...caminho, i]), style: "text-decoration:none" }, op.rotulo, h("span", { class: "seta", "aria-hidden": "true" }, "→")))),
        caminho.length ? h("p", { style: "margin:1rem 0 0" }, h("a", { href: comCaminho(caminho.slice(0, -1)) }, "← Voltar"), " · ", h("a", { href: base }, "Recomeçar")) : null);
    }
    app.append(cabeca, trilhaEl, corpo);
  };

  function fato(titulo, valor) { return h("div", { class: "fato" }, h("dt", null, titulo), h("dd", null, valor || "—")); }

  /* ───────────── catálogo ───────────── */
  function cartaoTec(t) {
    return h("a", { class: "cartao tec", href: `#/tecnica/${t.id}` },
      h("div", null, seloGrupo(t.grupo)),
      h("h3", null, t.nome),
      h("div", { class: "gat" }, t.paraQue),
      h("div", { class: "meta" }, "Gatilho: ", t.gatilho));
  }

  rotas.tecnicas = (r) => {
    document.title = "Técnicas · catálogo";
    let grupo = r.q.get("g") || "todos";
    if (grupo !== "todos" && !HAIR.grupos[grupo]) grupo = "todos";
    let busca = "";
    const lista = h("div", { class: "grade", "aria-live": "polite" });
    const contagem = h("p", { class: "muted pequeno" });
    const campo = h("input", { class: "busca", type: "search", placeholder: "Buscar: “mediação”, “t pareado”, “odds ratio”, “segmentos”…", "aria-label": "Buscar técnica" });
    const chips = h("div", { class: "filtros", style: "margin:0" });

    const indice = TEC.map((t) => ({ t, txt: semAcento([t.nome, t.gatilho, t.paraQue, t.pergunta, t.tags.join(" "), t.efeito].join(" ")) }));
    function desenhar() {
      const termos = semAcento(busca).split(/\s+/).filter(Boolean);
      const achadas = indice.filter(({ t, txt }) => (grupo === "todos" || t.grupo === grupo) && termos.every((q) => txt.includes(q))).map((x) => x.t);
      lista.replaceChildren(...achadas.map(cartaoTec));
      contagem.textContent = `${achadas.length} de ${TEC.length} técnicas`;
      if (!achadas.length) lista.append(h("p", { class: "muted" }, "Nada encontrado. Tente uma palavra mais curta."));
      chips.replaceChildren(...[["todos", "Todas"], ...Object.entries(HAIR.grupos).map(([k, v]) => [k, v.nome])].map(([k, nome]) =>
        h("button", { class: "chip", type: "button", "aria-pressed": String(grupo === k), onclick: () => { grupo = k; history.replaceState(null, "", k === "todos" ? "#/tecnicas" : `#/tecnicas?g=${k}`); desenhar(); } }, nome)));
    }
    campo.addEventListener("input", () => { busca = campo.value; desenhar(); });

    app.append(
      h("h1", null, "Catálogo de técnicas"),
      h("p", { class: "sub" }, "Cada técnica tem quando usar, hipóteses, pressupostos e o código nos quatro ambientes."),
      h("div", { class: "filtros" }, campo), chips, contagem, lista);
    desenhar();
  };

  /* ───────────── técnica ───────────── */
  const ABAS = [["py", "Python"], ["r", "R"], ["jamovi", "jamovi"], ["jasp", "JASP"]];

  rotas.tecnica = (r) => {
    const t = POR_ID[r.arg];
    if (!t) { app.append(h("h1", null, "Técnica não encontrada"), h("p", null, h("a", { href: "#/tecnicas" }, "Voltar ao catálogo"))); return; }
    document.title = `${t.nome} · Multi-Hair`;
    let aba = guardar.ler("hair-aba", "py");
    if (!ABAS.some((a) => a[0] === aba)) aba = "py";

    const painel = h("div", { class: "painel", role: "tabpanel" });
    const barra = h("div", { class: "abas", role: "tablist", "aria-label": "Ambiente" });
    function mostrar() {
      barra.replaceChildren(...ABAS.map(([k, nome]) =>
        h("button", { class: "aba", role: "tab", id: `aba-${k}`, "aria-selected": String(aba === k), "aria-controls": "painel-ativo", tabindex: aba === k ? "0" : "-1",
          onclick: () => { aba = k; guardar.gravar("hair-aba", k); mostrar(); },
          onkeydown: (e) => {
            const i = ABAS.findIndex((a) => a[0] === aba);
            const j = e.key === "ArrowRight" ? (i + 1) % ABAS.length : e.key === "ArrowLeft" ? (i + ABAS.length - 1) % ABAS.length : null;
            if (j !== null) { e.preventDefault(); aba = ABAS[j][0]; guardar.gravar("hair-aba", aba); mostrar(); document.getElementById(`aba-${aba}`).focus(); }
          } }, nome)));
      painel.id = "painel-ativo"; painel.setAttribute("aria-labelledby", `aba-${aba}`);
      painel.replaceChildren(conteudoAba(t, aba));
    }

    const par = t.par && POR_ID[t.par];
    const relacionadas = TEC.filter((x) => x.grupo === t.grupo && x.id !== t.id).slice(0, 6);

    app.append(
      h("div", { class: "cabeca" },
        h("p", { class: "migalha" }, h("a", { href: "#/tecnicas" }, "Técnicas"), " › ", h("a", { href: `#/tecnicas?g=${t.grupo}` }, HAIR.grupos[t.grupo].nome)),
        h("h1", null, t.nome),
        h("p", { class: "sub" }, t.paraQue),
        h("div", null, seloGrupo(t.grupo), " ", t.tags.map((x) => h("span", { class: "tag" }, x))),
        h("p", { class: "muted pequeno", style: "margin-top:.6rem" }, "Palavras-gatilho: ", t.gatilho)),
      h("dl", { class: "fatos" }, fato("VD", t.vd), fato("VI", t.vi), fato("H₀", t.h0), fato("H₁", t.h1), fato("Tamanho de efeito", t.efeito)),
      h("div", { class: "cartao exemplo" }, h("strong", null, "Exemplo na base iFood. "), t.pergunta),
      barra, painel,
      h("div", { class: "duas" },
        h("div", null,
          h("h2", null, "Pressupostos"),
          h("ul", { class: "lista-plana" }, t.pressupostos.map((p) => h("li", null, p))),
          t.seFalhar && t.seFalhar !== "—" ? h("div", { class: "aviso" }, h("strong", null, "Se falhar: "), t.seFalhar) : null,
          t.criterios ? h("div", null, h("h3", null, "Critérios de leitura"), h("ul", { class: "lista-plana" }, t.criterios.map((c) => h("li", null, c)))) : null),
        h("div", null,
          h("h2", null, "A H₀ em palavras"),
          h("div", { class: "tabela-wrap" }, h("table", { class: "h0-tabela" }, h("tbody", null,
            h("tr", null, h("td", null, "O que a H₀ afirma"), h("td", null, t.h0Texto)),
            h("tr", null, h("td", null, "Se rejeitar (p < 0,05)"), h("td", null, t.seRejeitar)),
            h("tr", null, h("td", null, "Se não rejeitar"), h("td", null, t.seNaoRejeitar))))),
          h("p", { class: "muted pequeno", style: "margin-top:.6rem" }, "Não rejeitar a H₀ não a prova: só indica que faltou evidência contra ela."))),
      h("h2", null, "Como ler"),
      h("p", null, t.ler),
      par ? h("div", { class: "nota" }, h("strong", null, t.grupo === "naoparametrico" || t.substitui ? "Substitui: " : "Alternativa não paramétrica: "), link(par.id), ".") : null,
      relacionadas.length ? h("div", null, h("h2", null, "Mesmo grupo"), h("div", { class: "filtros" }, relacionadas.map((x) => h("a", { class: "chip", href: `#/tecnica/${x.id}`, style: "text-decoration:none" }, x.nome)))) : null
    );
    mostrar();
  };

  function conteudoAba(t, aba) {
    if (aba === "py" || aba === "r") {
      return h("div", null,
        h("p", { class: "muted pequeno" }, "Assume que df foi carregado como em ", h("a", { href: "#/preparacao" }, "Preparação"), "."),
        blocoCodigo(aba === "py" ? t.py : t.r, aba));
    }
    const m = t[aba];
    return h("div", null,
      h("div", { class: "menu-caminho" }, m.menu),
      m.passos.length ? h("ol", { class: "passos" }, m.passos.map((p) => h("li", null, p))) : null,
      m.aviso ? h("div", { class: "aviso" }, m.aviso) : null,
      aba === "jasp" ? h("div", { class: "aviso" }, "Os menus do JASP não vêm do guia (que cobre o jamovi). Os nomes variam entre versões: se algo não estiver onde indicado, procure pela opção pelo nome.") : null);
  }

  /* ───────────── H₀ (Tabela 7) ───────────── */
  rotas.h0 = () => {
    document.title = "H₀ · o que cada teste afirma";
    let busca = "";
    const corpo = h("div");
    const campo = h("input", { class: "busca", type: "search", placeholder: "Filtrar testes…", "aria-label": "Filtrar testes" });
    const blocos = [
      ["A · Comparação e associação", ["comparacao", "naoparametrico", "correlacao", "categoricas"]],
      ["B · Modelos multivariados", ["dependencia", "interdependencia"]],
      ["C · Pressupostos (aqui você quer não rejeitar H₀, exceto no Bartlett)", ["pressuposto"]]
    ];
    function desenhar() {
      const q = semAcento(busca);
      corpo.replaceChildren(...blocos.map(([titulo, grupos]) => {
        const itens = TEC.filter((t) => grupos.includes(t.grupo) && semAcento(`${t.nome} ${t.paraQue} ${t.h0Texto}`).includes(q));
        if (!itens.length) return null;
        return h("div", null, h("h2", null, titulo),
          h("div", { class: "tabela-wrap" }, h("table", null,
            h("thead", null, h("tr", null, ["Teste", "Para que serve", "O que a H₀ afirma", "Se rejeitar (p < 0,05)", "Se não rejeitar"].map((x) => h("th", null, x)))),
            h("tbody", null, itens.map((t) => h("tr", null, h("td", null, h("a", { href: `#/tecnica/${t.id}` }, t.nome)), h("td", null, t.paraQue), h("td", null, t.h0Texto), h("td", null, t.seRejeitar), h("td", null, t.seNaoRejeitar)))))));
      }));
    }
    campo.addEventListener("input", () => { busca = campo.value; desenhar(); });
    app.append(
      h("h1", null, "O que a H₀ afirma e para que serve cada teste"),
      h("p", { class: "sub" }, "A H₀ sempre descreve o cenário em que “nada acontece”. O teste mede se os dados contradizem esse cenário."),
      h("div", { class: "cartao" }, HAIR.logicaH0.map((p) => h("p", null, p))),
      h("div", { class: "filtros" }, campo), corpo);
    desenhar();
  };

  /* ───────────── roteiro ───────────── */
  const DIAGRAMA = [
    ["Dependência", "Múltiplas relações encadeadas", "Métricas (construtos latentes)", ["sem"]],
    ["", "Uma VD, uma relação", "VD métrica · VIs métricas", ["regressao-multipla"]],
    ["", "", "VD binária · VIs métricas", ["logistica"]],
    ["", "", "VD não métrica (2+ grupos) · VIs métricas", ["discriminante"]],
    ["", "Várias VDs, uma relação", "VDs métricas · VIs não métricas", ["manova"]],
    ["", "", "VDs métricas · VIs métricas", ["correlacao-canonica"]],
    ["Interdependência", "Estrutura entre variáveis", "Métricas", ["afe"]],
    ["", "Estrutura entre casos", "Métricas (ou mistas)", ["cluster"]],
    ["", "Estrutura entre objetos", "Métricas / não métricas", ["mds", "correspondencia"]]
  ];

  rotas.roteiro = () => {
    document.title = "Roteiro · 6 estágios e diagrama";
    app.append(
      h("h1", null, "Roteiro de análise"),
      h("p", { class: "sub" }, "A sequência do modelo de construção de análise do Hair. Serve para qualquer técnica multivariada e para organizar a resposta na prova."),
      h("div", { class: "estagios" }, HAIR.estagios.map((e) =>
        h("div", { class: "cartao estagio" }, h("div", { class: "n" }, String(e.n)),
          h("div", null, h("h3", { style: "margin:0 0 .2rem" }, e.titulo), h("p", { style: "margin:0" }, e.txt, e.link ? [" ", h("a", { href: e.link }, "Abrir →")] : null))))),
      h("h2", null, "O diagrama do Hair em tabela"),
      h("p", { class: "muted" }, "Três perguntas em sequência: (1) tipo de relação, (2) quantas VDs, ou estrutura de quê, (3) escala de medida."),
      h("div", { class: "tabela-wrap" }, h("table", null,
        h("thead", null, h("tr", null, ["1 · Tipo de relação", "2 · Quantas VDs / estrutura de quê", "3 · Escala de medida", "Técnica"].map((x) => h("th", null, x)))),
        h("tbody", null, DIAGRAMA.map(([a, b, c, ids]) => h("tr", null, h("td", null, h("strong", null, a)), h("td", null, b), h("td", null, c),
          h("td", null, ids.map((id, i) => [i ? " · " : "", link(id)]))))))),
      h("h2", null, "Cada teste paramétrico tem um par não paramétrico"),
      h("div", { class: "tabela-wrap" }, h("table", null,
        h("thead", null, h("tr", null, ["Paramétrico", "Não paramétrico", "Use o não paramétrico quando…"].map((x) => h("th", null, x)))),
        h("tbody", null, HAIR.pares.map(([a, b]) => h("tr", null, h("td", null, link(a)), h("td", null, link(b)), h("td", null, POR_ID[b].gatilho)))))),
      h("div", { class: "nota" }, h("strong", null, "E no multivariado? "), "Não há equivalentes não paramétricos diretos nos menus do jamovi. A logística já dispensa normalidade e homocedasticidade. Na regressão linear, as saídas usuais são transformar a VD (ex.: logaritmo do gasto) ou usar intervalos por bootstrap. Na AFE com itens ordinais, o recomendado é a matriz de correlações policóricas, que exige um módulo adicional."),
      h("p", null, h("strong", null, "Para a prova: "), "t independente → Mann-Whitney; t pareado → Wilcoxon; ANOVA → Kruskal-Wallis; medidas repetidas → Friedman; Pearson → Spearman.")
    );
  };

  /* ───────────── preparação ───────────── */
  const PREP = {
    py: String.raw`# 1) Instalar (uma vez). Em Windows, se o terminal reclamar de χ² ou α, use: set PYTHONUTF8=1
# pip install pandas numpy scipy statsmodels pingouin scikit-learn scikit-posthocs
# pip install factor_analyzer semopy prince matplotlib      # só para AFE/KMO, SEM e correspondência

import pandas as pd

# 2) Carregar. sep=None detecta vírgula, ponto e vírgula ou tabulação (a base do Kaggle usa tab)
df = pd.read_csv("data/ifood_sintetico.csv", sep=None, engine="python")

# 3) Preparar (equivale a Data › Setup e Data › Compute no jamovi)
niveis = ["Basic", "2n Cycle", "Graduation", "Master", "PhD"]
df["Education"] = pd.Categorical(df["Education"], categories=niveis, ordered=True)

gastos = ["MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts", "MntGoldProds"]
if "MntTotal" not in df:
    df["MntTotal"] = df[gastos].sum(axis=1)
if "Age" not in df:
    df["Age"] = 2014 - df["Year_Birth"]          # ano de referência da base original

df.info()`,
    r: String.raw`# 1) Instalar (uma vez)
install.packages(c("data.table", "tidyr", "car", "effectsize", "rstatix", "PMCMRplus", "psych", "lavaan",
                   "MASS", "pROC", "DescTools", "lmtest", "lm.beta", "biotools", "CCA", "CCP",
                   "cluster", "factoextra", "FactoMineR", "moments"))

# 2) Carregar. fread detecta o separador (a base do Kaggle usa tab)
library(data.table)
df <- as.data.frame(fread("data/ifood_sintetico.csv"))

# 3) Preparar (equivale a Data › Setup e Data › Compute no jamovi)
niveis <- c("Basic", "2n Cycle", "Graduation", "Master", "PhD")
df$Education   <- factor(df$Education, levels = niveis)       # dummies (tratamento)
df$Education_o <- factor(df$Education, levels = niveis, ordered = TRUE)   # versão ordinal
df$Response_f  <- factor(df$Response, levels = c(0, 1), labels = c("Não", "Sim"))

gastos <- c("MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts", "MntGoldProds")
if (!"MntTotal" %in% names(df)) df$MntTotal <- rowSums(df[, gastos])
if (!"Age" %in% names(df)) df$Age <- 2014 - df$Year_Birth    # ano de referência da base original

str(df)`
  };

  rotas.preparacao = () => {
    document.title = "Preparação · carregar a base";
    let aba = guardar.ler("hair-aba-prep", "py");
    if (!ABAS.some((a) => a[0] === aba)) aba = "py";
    const painel = h("div", { class: "painel" });
    const barra = h("div", { class: "abas", role: "tablist" });
    function mostrar() {
      barra.replaceChildren(...ABAS.map(([k, nome]) => h("button", { class: "aba", role: "tab", "aria-selected": String(aba === k), onclick: () => { aba = k; guardar.gravar("hair-aba-prep", k); mostrar(); } }, nome)));
      if (aba === "py" || aba === "r") painel.replaceChildren(blocoCodigo(PREP[aba], aba));
      else if (aba === "jamovi") painel.replaceChildren(h("ol", { class: "passos" },
        h("li", null, "File › Open › escolha ", h("code", null, "data/ifood_sintetico.csv"), "."),
        h("li", null, "Data › Setup: ", h("code", null, "Education"), " = Ordinal, com a ordem Basic < 2n Cycle < Graduation < Master < PhD."),
        h("li", null, h("code", null, "Response"), ", ", h("code", null, "Complain"), ", ", h("code", null, "AcceptedCmp1–5"), " e ", h("code", null, "Marital_Status"), " = Nominal. ", h("code", null, "Kidhome"), " e ", h("code", null, "Teenhome"), " = Ordinal."),
        h("li", null, "Se a base não trouxer ", h("code", null, "MntTotal"), ": Data › Compute, com a fórmula ", h("code", null, "SUM(MntWines, MntFruits, MntMeatProducts, MntFishProducts, MntSweetProducts, MntGoldProds)"), "."),
        h("li", null, "Para módulos extras (SEMLj, snowCluster): botão Modules › jamovi library.")));
      else painel.replaceChildren(h("ol", { class: "passos" },
        h("li", null, "File › Open › Computer › ", h("code", null, "data/ifood_sintetico.csv"), "."),
        h("li", null, "Clique no ícone ao lado do nome de cada coluna para definir Nominal, Ordinal ou Scale."),
        h("li", null, "Crie ", h("code", null, "MntTotal"), " com o botão “+” no cabeçalho (coluna calculada) se ela não existir."),
        h("li", null, "Módulos extras (Machine Learning, SEM): ícone “+” no canto superior direito.")),
        h("div", { class: "aviso" }, "Os menus do JASP não vêm do guia; confira na sua versão."));
    }
    const vars = [
      ["Education", "Ordinal", "Basic < 2n Cycle < Graduation < Master < PhD"], ["Marital_Status", "Nominal", "Married, Together, Single, Divorced, Widow"],
      ["Income, Age, Recency", "Métrica", "Income tem valores ausentes (como na base real)"], ["Kidhome, Teenhome", "Ordinal", "0, 1 ou 2"],
      ["MntWines … MntGoldProds", "Métrica", "Gastos por categoria"], ["MntTotal", "Métrica", "Soma dos gastos (VD de vários exemplos)"],
      ["NumWebPurchases, NumCatalogPurchases, NumStorePurchases", "Contagem", "Compras por canal (medidas repetidas)"],
      ["Response, Complain, AcceptedCmp1–5", "Binária", "0 = não, 1 = sim"]
    ];
    app.append(
      h("h1", null, "Preparação"),
      h("p", { class: "sub" }, "Todos os códigos do site assumem um data frame chamado ", h("code", null, "df"), ", com as colunas da base ", h("em", null, "iFood Marketing Campaign"), " (Kaggle)."),
      h("div", { class: "cartao" },
        h("h3", { style: "margin-top:0" }, "Base de exemplo"),
        h("p", null, "Incluímos uma base ", h("strong", null, "sintética"), " (2.000 linhas, mesmos nomes de colunas) para os códigos rodarem sem baixar nada. Os números são inventados: não tire conclusões de negócio deles. Para trabalhar de verdade, baixe a base original no Kaggle e troque o caminho do arquivo."),
        h("a", { class: "btn btn-prim", href: "data/ifood_sintetico.csv", download: "ifood_sintetico.csv" }, "Baixar ifood_sintetico.csv")),
      barra, painel,
      h("h2", null, "Dicionário das variáveis"),
      h("div", { class: "tabela-wrap" }, h("table", null,
        h("thead", null, h("tr", null, ["Variável", "Tipo", "Observação"].map((x) => h("th", null, x)))),
        h("tbody", null, vars.map((v) => h("tr", null, h("td", null, h("code", null, v[0])), h("td", null, v[1]), h("td", null, v[2]))))))
    );
    mostrar();
  };

  /* ───────────── exercícios ───────────── */
  rotas.exercicios = () => {
    document.title = "Exercícios · escolha a técnica";
    let nivel = "Todos";
    const estado = guardar.ler("hair-ex", {});
    const lista = h("div");
    const placar = h("div", { class: "cartao placar" });
    const SEM_VD = "Nenhuma (sem VD)";

    function atualizarPlacar() {
      const total = HAIR.exercicios.length;
      const feitos = Object.values(estado).filter((e) => e.ok).length;
      placar.replaceChildren(
        h("strong", null, `${feitos} de ${total} corretos`),
        h("div", { class: "barra", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(total), "aria-valuenow": String(feitos) }, h("i", { style: `width:${(feitos / total) * 100}%` })),
        h("button", { class: "btn btn-peq", type: "button", onclick: () => { if (confirm("Zerar o seu progresso?")) { for (const k in estado) delete estado[k]; guardar.gravar("hair-ex", estado); desenhar(); } } }, "Zerar"));
    }

    function opcoesTecnica(sel, atual) {
      Object.entries(HAIR.grupos).forEach(([g, info]) => {
        const og = h("optgroup", { label: info.nome });
        TEC.filter((t) => t.grupo === g).forEach((t) => og.append(h("option", { value: t.id, selected: atual === t.id }, t.nome)));
        sel.append(og);
      });
    }

    function cartao(ex) {
      const e = estado[ex.id] || {};
      const selVd = h("select", { id: `vd${ex.id}`, required: true }, h("option", { value: "" }, "Escolha…"),
        [...ex.vds.filter((v) => v !== "Nenhuma"), SEM_VD].map((v) => h("option", { value: v, selected: e.vd === v }, v)));
      const selTec = h("select", { id: `tec${ex.id}`, required: true }, h("option", { value: "" }, "Escolha…"));
      opcoesTecnica(selTec, e.tec);
      const retorno = h("div", { "aria-live": "polite" });

      function mostrarRetorno(est) {
        retorno.replaceChildren();
        if (!est || !est.tec) return;
        const vdCerto = (ex.vd || SEM_VD) === est.vd;
        const tecCerta = ex.tecnica === est.tec;
        retorno.append(h("div", { class: `retorno ${vdCerto && tecCerta ? "certo" : "errado"}` },
          h("p", null, h("strong", null, vdCerto && tecCerta ? "Correto." : "Ainda não."), " ",
            `VD: ${vdCerto ? "certo" : "errado"} · Técnica: ${tecCerta ? "certa" : "errada"}.`),
          vdCerto && tecCerta || est.revelado ? h("p", null, ex.porque) : h("p", null, "Releia as palavras-gatilho no enunciado e tente de novo."),
          vdCerto && tecCerta || est.revelado ? h("p", null, h("strong", null, "Resposta: "), `${ex.vd || SEM_VD} · `, link(ex.tecnica), " → ", h("a", { href: `#/tecnica/${ex.tecnica}` }, "ver código")) : null,
          !(vdCerto && tecCerta) && !est.revelado ? h("button", { class: "btn btn-peq", type: "button", onclick: () => { est.revelado = true; guardar.gravar("hair-ex", estado); mostrarRetorno(est); } }, "Mostrar a resposta") : null));
      }

      const form = h("form", { onsubmit: (ev) => {
        ev.preventDefault();
        const est = { vd: selVd.value, tec: selTec.value };
        est.ok = (ex.vd || SEM_VD) === est.vd && ex.tecnica === est.tec;
        estado[ex.id] = est; guardar.gravar("hair-ex", estado);
        mostrarRetorno(est); atualizarPlacar();
      } },
        h("div", null, h("label", { for: `vd${ex.id}` }, "Quem é a VD?"), selVd),
        h("div", null, h("label", { for: `tec${ex.id}` }, "Qual técnica?"), selTec),
        h("button", { class: "btn btn-prim", type: "submit" }, "Conferir"));
      const card = h("article", { class: "cartao ex" },
        h("header", null, h("strong", null, `Exercício ${ex.id}`), h("span", { class: "selo g7" }, ex.nivel)),
        h("p", { class: "enunciado" }, ex.enunciado), form, retorno);
      mostrarRetorno(e.tec ? e : null);
      return card;
    }

    function desenhar() {
      lista.replaceChildren(...HAIR.exercicios.filter((e) => nivel === "Todos" || e.nivel === nivel).map(cartao));
      atualizarPlacar();
      filtro.replaceChildren(...["Todos", "Fácil", "Médio", "Difícil"].map((n) =>
        h("button", { class: "chip", type: "button", "aria-pressed": String(nivel === n), onclick: () => { nivel = n; desenhar(); } }, n)));
    }
    const filtro = h("div", { class: "filtros" });

    app.append(
      h("h1", null, "Exercícios"),
      h("p", { class: "sub" }, "Para cada enunciado, aponte a VD e a técnica. As respostas seguem o diagrama do Hair e este guia. Seu progresso fica salvo neste navegador."),
      filtro, placar, h("div", { style: "height:14px" }), lista);
    desenhar();
  };

  /* ───────────── tema e inicialização ───────────── */
  document.getElementById("tema").addEventListener("click", () => {
    const atual = document.documentElement.getAttribute("data-theme")
      || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const novo = atual === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", novo);
    try { localStorage.setItem("hair-tema", novo); } catch (e) { /* modo privado */ }
  });

  window.addEventListener("hashchange", renderizar);
  renderizar();
})();
