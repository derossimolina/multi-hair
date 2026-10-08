/* Conteúdo didático: Passo 0, árvore do assistente, roteiro e exercícios. */
window.HAIR = window.HAIR || { tecnicas: [] };

HAIR.grupos = {
  comparacao:       { nome: "Comparação de médias", cor: "g1" },
  naoparametrico:   { nome: "Não paramétricos", cor: "g2" },
  correlacao:       { nome: "Correlação", cor: "g3" },
  categoricas:      { nome: "Variáveis categóricas", cor: "g4" },
  dependencia:      { nome: "Multivariadas · dependência", cor: "g5" },
  interdependencia: { nome: "Multivariadas · interdependência", cor: "g6" },
  pressuposto:      { nome: "Testes de pressuposto", cor: "g7" }
};

/* Passo 0: pistas do enunciado (Tabela do Passo 0).
   mk() monta uma regex que respeita letras acentuadas ( do JS não respeita). */
const mk = (alt) => new RegExp("(?<![\\p{L}])(?:" + alt + ")(?![\\p{L}])", "giu");
HAIR.pistas = [
  { papel: "VD", rotulo: "O que se quer explicar ou prever",
    re: mk("explic\\p{L}*|prev\\p{L}*|o que influencia|efeito (?:sobre|no|na)|impacto|variaç\\p{L}+ d[aeo]|determin\\p{L}*"),
    dica: "Variável a explicar → vai em Dependent Variable." },
  { papel: "VD", rotulo: "Desfecho ou resultado",
    re: mk("probabilidade de|chance de|taxa de|risco de"),
    dica: "Desfecho → VD (logística, se for sim/não)." },
  { papel: "VI", rotulo: "Variável que forma os grupos",
    re: mk("entre os (?:níveis|grupos|estados|tipos)|segundo|de acordo com|conforme|por (?:grupo|categoria|nível|canal)|quem \\p{L}+ (?:×|x|e quem|versus)|quem respondeu|diferem? entre"),
    dica: "Forma grupos → VI (fator): Grouping Variable ou Fixed Factors." },
  { papel: "VIs", rotulo: "Preditores listados",
    re: mk("a renda|a idade|ajudam a explicar|contribuem para|preditor\\p{L}*|variáveis explicativas|dad[oa]s?(?= (?:a|as|os|o) )"),
    dica: "Preditores → VIs. Métricas em Covariates, categóricas em Factors." },
  { papel: "Tempo", rotulo: "Precedência temporal / atributo estável",
    re: mk("idade|escolaridade|estado civil|sexo|gênero|nascimento"),
    dica: "O que vem antes tende a ser VI." },
  { papel: "Sem VD", rotulo: "Relação simétrica",
    re: mk("associaç\\p{L}+ (?:entre|com)|relaç\\p{L}+ entre|está associado|correlacionad\\p{L}+|estrutura|dimensões|perfis?|segmentos?|agrup\\p{L}+"),
    dica: "Relação simétrica → sem VD (qui-quadrado, correlação, AFE, cluster)." }
];

HAIR.passo0 = [
  { pista: "O que se quer explicar, prever ou entender a variação: “explicar o gasto”, “o que influencia…”, “efeito sobre…”",
    indica: "VD", exemplo: "“explicar o gasto total” → MntTotal é VD", onde: "Caixa Dependent Variable" },
  { pista: "Desfecho ou resultado: “probabilidade de…”, “chance de…”, “taxa de…”",
    indica: "VD", exemplo: "“probabilidade de responder” → Response é VD", onde: "Dependent Variable (logística)" },
  { pista: "Variável que forma os grupos: “entre os níveis de…”, “segundo…”, “de acordo com…”, “quem respondeu × quem não respondeu”",
    indica: "VI (fator)", exemplo: "Education é VI; Response é VI", onde: "Grouping Variable (teste t) ou Fixed Factors (ANOVA)" },
  { pista: "Preditores listados: “a renda, a idade… ajudam a explicar…”",
    indica: "VIs", exemplo: "renda, idade, recência etc.", onde: "Métricas em Covariates; categóricas em Factors" },
  { pista: "Precedência temporal ou atributo estável: o que vem antes (idade, escolaridade, estado civil) tende a ser VI",
    indica: "VI", exemplo: "Idade vem antes do comportamento de compra", onde: "Idem acima" },
  { pista: "Relação simétrica: “associação entre”, “relação entre”, “estão correlacionados”, “estrutura”, “dimensões”",
    indica: "Sem VD", exemplo: "Qui-quadrado, correlações (bivariadas simétricas) e análise fatorial (interdependência)",
    onde: "Variables (todas na mesma caixa) ou Rows/Columns (tabela cruzada)" }
];

/* Matriz 2×2 */
HAIR.matriz2x2 = {
  colunas: ["VD quali", "VD quanti"],
  linhas: [
    { vi: "VI quali", celulas: [{ txt: "Qui-quadrado", id: "qui-quadrado" }, { txt: "t (2 grupos) · ANOVA (3+)", id: "t-independente" }] },
    { vi: "VI quanti", celulas: [{ txt: "Logística", id: "logistica" }, { txt: "Correlação / regressão", id: "pearson" }] }
  ]
};

/* Pares paramétrico ↔ não paramétrico (Tabela 5) */
HAIR.pares = [
  ["t-independente", "mann-whitney"],
  ["t-pareado", "wilcoxon"],
  ["t-uma-amostra", "wilcoxon-uma"],
  ["anova-um-fator", "kruskal"],
  ["anova-medidas-repetidas", "friedman"],
  ["pearson", "spearman"],
  ["pearson", "kendall"],
  ["qui-quadrado", "fisher"],
  ["qui-quadrado", "mcnemar"]
];

/* Roteiro de 6 estágios do Hair */
HAIR.estagios = [
  { n: 1, titulo: "Objetivo e escolha da técnica", txt: "Passo 0 e Tabela 1. Defina a pergunta, a VD (se houver) e a técnica.", link: "#/assistente" },
  { n: 2, titulo: "Desenho da análise", txt: "Data › Setup (tipo de medida, ordem dos níveis) · Data › Compute (ex.: MntTotal = SUM(MntWines, …, MntGoldProds)) · Data › Transform (recodificar categorias raras)." },
  { n: 3, titulo: "Exame dos dados e pressupostos", txt: "Exploration › Descriptives: N, Missing, Skewness, Kurtosis, Shapiro-Wilk, Box plot · Exploration › Scatterplot · Regression › Correlation Matrix.", link: "#/tecnicas?g=pressuposto" },
  { n: 4, titulo: "Estimação e ajuste", txt: "O menu da técnica: teste F, teste do modelo, R², AUC, KMO/Bartlett, número de fatores." },
  { n: 5, titulo: "Interpretação", txt: "Betas padronizados, odds ratios, cargas fatoriais e nome dos fatores. Responda à pergunta de pesquisa em linguagem de negócio." },
  { n: 6, titulo: "Validação", txt: "Divida a amostra (Data › Filters no jamovi) e reestime; compare com a versão não paramétrica ou robusta; confira se o resultado se mantém." }
];

/* Lógica do teste de hipótese (Tabela 7, texto introdutório) */
HAIR.logicaH0 = [
  "A H₀ é a hipótese do “nada”: sem diferença, sem associação, sem efeito ou, nos testes de pressuposto, pressuposto atendido. O teste parte do princípio de que a H₀ é verdadeira e calcula o valor-p: a probabilidade de obter um resultado tão extremo quanto o observado se a H₀ fosse verdadeira.",
  "p < 0,05: o resultado seria improvável sob a H₀, então você rejeita a H₀ e há evidência a favor da H₁. p ≥ 0,05: você não rejeita a H₀. Isso não prova a H₀; só indica que faltou evidência contra ela.",
  "Erro tipo I: rejeitar uma H₀ verdadeira (probabilidade α = 0,05). Erro tipo II: não rejeitar uma H₀ falsa (probabilidade β; o poder do teste é 1 − β). Com amostras grandes, como n acima de 1.000, efeitos minúsculos ficam significativos; por isso reporte sempre o tamanho de efeito."
];

/* ───────────── Assistente: árvore de decisão ───────────── */
HAIR.arvore = {
  inicio: "q_vd",
  nos: {
    q_vd: { texto: "Existe uma variável a ser explicada (VD)?",
      ajuda: "Use o teste da frase: “[Y] depende de / varia conforme [X]”. Se a pergunta só quer saber se há relação, sem direção, não há VD.",
      opcoes: [
        { rotulo: "Sim, há uma ou mais VDs", prox: "q_nvd" },
        { rotulo: "Não, a relação é simétrica (associação, estrutura, dimensões, perfis)", prox: "q_inter" }] },

    /* Interdependência */
    q_inter: { texto: "A estrutura é de quê?",
      opcoes: [
        { rotulo: "Entre variáveis (dimensões, fatores)", prox: "q_inter_var" },
        { rotulo: "Entre casos/respondentes (segmentos, perfis de clientes)", res: ["cluster"] },
        { rotulo: "Entre objetos (mapa perceptual, posicionamento)", res: ["mds", "correspondencia"] },
        { rotulo: "Associação simples entre duas variáveis", prox: "q_assoc2" }] },
    q_inter_var: { texto: "Qual o objetivo?",
      opcoes: [
        { rotulo: "Achar dimensões latentes (fatores)", res: ["afe", "bartlett-kmo", "confiabilidade"] },
        { rotulo: "Só reduzir dados (variância total)", res: ["pca", "bartlett-kmo"] }] },
    q_assoc2: { texto: "Qual a escala das duas variáveis?",
      opcoes: [
        { rotulo: "Ambas categóricas", prox: "q_cat2" },
        { rotulo: "Ambas métricas", prox: "q_corr" },
        { rotulo: "Ordinais, ou métricas sem normalidade", res: ["spearman", "kendall"] }] },
    q_corr: { texto: "A relação é linear e os dados são aproximadamente normais, sem outliers fortes?",
      opcoes: [
        { rotulo: "Sim", res: ["pearson"] },
        { rotulo: "Não", res: ["spearman", "kendall"] }] },
    q_cat2: { texto: "Como são as duas categóricas?",
      opcoes: [
        { rotulo: "Independentes (casos diferentes em cada célula)", prox: "q_cat2_ind" },
        { rotulo: "Pareadas (mesmas pessoas, duas medidas dicotômicas)", res: ["mcnemar"] }] },
    q_cat2_ind: { texto: "Tamanho da tabela e frequências esperadas?",
      opcoes: [
        { rotulo: "Tabela maior que 2×2, ou 2×2 com esperado ≥ 5", res: ["qui-quadrado"] },
        { rotulo: "2×2 com esperado < 5 (n pequeno)", res: ["fisher"] }] },

    /* Dependência */
    q_nvd: { texto: "Quantas variáveis dependentes?",
      opcoes: [
        { rotulo: "Uma só", prox: "q_encadeado" },
        { rotulo: "Várias ao mesmo tempo", prox: "q_multi_vd" }] },
    q_multi_vd: { texto: "Qual a escala das VIs?",
      opcoes: [
        { rotulo: "VIs não métricas (grupos), VDs métricas", res: ["manova", "box-m"] },
        { rotulo: "VIs métricas, VDs métricas (dois conjuntos)", res: ["correlacao-canonica"] }] },
    q_encadeado: { texto: "O modelo teórico tem relações encadeadas (mediação, construtos latentes)?",
      opcoes: [
        { rotulo: "Sim: mediação, construtos", res: ["sem"] },
        { rotulo: "Não, uma única relação", prox: "q_escala_vd" }] },
    q_escala_vd: { texto: "Qual a escala da VD?",
      opcoes: [
        { rotulo: "Métrica (quantitativa)", prox: "q_vi_metrica_vd" },
        { rotulo: "Binária (sim/não)", prox: "q_vd_bin" },
        { rotulo: "Nominal com 3+ categorias", prox: "q_vd_nom" },
        { rotulo: "Ordinal", prox: "q_vd_ord" }] },

    /* VD métrica */
    q_vi_metrica_vd: { texto: "Quais são as VIs?",
      opcoes: [
        { rotulo: "Uma VI categórica que forma grupos", prox: "q_grupos" },
        { rotulo: "Uma VI métrica", prox: "q_corr_dep" },
        { rotulo: "Várias VIs (métricas e/ou categóricas)", res: ["regressao-multipla"] },
        { rotulo: "Nenhuma VI: comparar a média com um valor de referência", prox: "q_um_amostra" }] },
    q_um_amostra: { texto: "A VD é aproximadamente normal?",
      opcoes: [
        { rotulo: "Sim", res: ["t-uma-amostra"] },
        { rotulo: "Não", res: ["wilcoxon-uma"] }] },
    q_corr_dep: { texto: "Relação linear, sem outliers fortes?",
      opcoes: [
        { rotulo: "Sim: correlação ou regressão simples", res: ["pearson"] },
        { rotulo: "Não / ordinal", res: ["spearman", "kendall"] }] },
    q_grupos: { texto: "Quantos grupos/medidas e como são os dados?",
      opcoes: [
        { rotulo: "2 grupos independentes", prox: "q_norm_t" },
        { rotulo: "2 medidas no mesmo sujeito (pareado)", prox: "q_norm_tp" },
        { rotulo: "3 ou mais grupos independentes", prox: "q_norm_a" },
        { rotulo: "3 ou mais medidas no mesmo sujeito", prox: "q_norm_rm" }] },
    q_norm_t: { texto: "Normalidade em cada grupo?",
      opcoes: [
        { rotulo: "Sim (ou n grande)", res: ["t-independente", "levene"] },
        { rotulo: "Não, e n pequeno", res: ["mann-whitney"] }] },
    q_norm_tp: { texto: "Normalidade das diferenças?",
      opcoes: [
        { rotulo: "Sim", res: ["t-pareado"] },
        { rotulo: "Não", res: ["wilcoxon"] }] },
    q_norm_a: { texto: "Normalidade e variâncias iguais?",
      opcoes: [
        { rotulo: "Sim", res: ["anova-um-fator", "levene"] },
        { rotulo: "Variâncias diferentes (Welch + Games-Howell)", res: ["anova-um-fator", "levene"] },
        { rotulo: "Não normal", res: ["kruskal"] }] },
    q_norm_rm: { texto: "Normalidade das medidas?",
      opcoes: [
        { rotulo: "Sim", res: ["anova-medidas-repetidas", "mauchly"] },
        { rotulo: "Não", res: ["friedman"] }] },

    /* VD binária */
    q_vd_bin: { texto: "Qual a pergunta?",
      opcoes: [
        { rotulo: "Há associação com uma variável categórica?", prox: "q_cat2" },
        { rotulo: "Explicar a probabilidade por preditores (métricos ou mistos)", res: ["logistica"] },
        { rotulo: "A taxa é igual a um valor esperado?", res: ["binomial"] },
        { rotulo: "Comparar a mesma proporção em duas medidas do mesmo grupo", res: ["mcnemar"] }] },
    /* VD nominal 3+ */
    q_vd_nom: { texto: "Quais são as VIs?",
      opcoes: [
        { rotulo: "Uma VI categórica", res: ["qui-quadrado"] },
        { rotulo: "VIs métricas (classificar casos em grupos)", res: ["discriminante"] },
        { rotulo: "Comparar com proporções esperadas", res: ["binomial"] }] },
    /* VD ordinal */
    q_vd_ord: { texto: "Qual a situação?",
      opcoes: [
        { rotulo: "2 grupos independentes", res: ["mann-whitney"] },
        { rotulo: "2 medidas no mesmo sujeito", res: ["wilcoxon"] },
        { rotulo: "3+ grupos independentes", res: ["kruskal"] },
        { rotulo: "3+ medidas no mesmo sujeito", res: ["friedman"] },
        { rotulo: "Associação com outra variável ordinal/métrica", res: ["spearman", "kendall"] },
        { rotulo: "Explicar por preditores", res: ["logistica-ordinal"] }] }
  }
};

/* ───────────── Exercícios ───────────── */
HAIR.exercicios = [
  { id: 1, nivel: "Fácil",
    enunciado: "Uma analista quer saber se os clientes que responderam à última campanha gastaram, em média, valores diferentes dos que não responderam. Os dados do gasto total estão aproximadamente normais, com variâncias parecidas.",
    vds: ["MntTotal", "Response"], vd: "MntTotal", tecnica: "t-independente",
    porque: "MntTotal é o que varia; Response forma os dois grupos independentes. VD métrica + VI com 2 grupos + normalidade e variâncias iguais → t independente." },
  { id: 2, nivel: "Fácil",
    enunciado: "O gasto total varia de acordo com o nível de escolaridade dos clientes (cinco níveis)? As variâncias entre os grupos são muito diferentes.",
    vds: ["MntTotal", "Education"], vd: "MntTotal", tecnica: "anova-um-fator",
    porque: "VD métrica + VI com 3+ grupos → ANOVA. Como o Levene rejeita, use Welch e Games-Howell (veja a seção “Se o pressuposto falhar”)." },
  { id: 3, nivel: "Fácil",
    enunciado: "Verifique se o estado civil está associado ao fato de o cliente ter respondido à campanha.",
    vds: ["Response", "Marital_Status"], vd: "", tecnica: "qui-quadrado",
    porque: "“Associação entre” duas categóricas → relação simétrica, sem VD. Qui-quadrado + V de Cramér." },
  { id: 4, nivel: "Médio",
    enunciado: "Qual a probabilidade de um cliente responder à campanha, dadas a sua renda, a recência da última compra e a escolaridade?",
    vds: ["Response", "Income", "Recency", "Education"], vd: "Response", tecnica: "logistica",
    porque: "“Probabilidade de” é pista de desfecho → VD. VD binária + preditores → regressão logística binária." },
  { id: 5, nivel: "Médio",
    enunciado: "Quem respondeu à campanha tem menos filhos pequenos em casa? (Kidhome vale 0, 1 ou 2.)",
    vds: ["Kidhome", "Response"], vd: "Kidhome", tecnica: "mann-whitney",
    porque: "Kidhome é ordinal (com 3 valores) e Response forma 2 grupos independentes: Mann-Whitney, não t. Efeito: rank-biserial." },
  { id: 6, nivel: "Médio",
    enunciado: "O mesmo grupo de clientes comprou quantidades diferentes pelos canais web, catálogo e loja física? A distribuição das compras é muito assimétrica.",
    vds: ["Compras por canal", "Canal"], vd: "Compras por canal", tecnica: "friedman",
    porque: "3 medidas no mesmo sujeito + falta de normalidade → Friedman (paramétrico equivalente: ANOVA de medidas repetidas). Post hoc: Durbin-Conover." },
  { id: 7, nivel: "Médio",
    enunciado: "Os gastos com vinhos, carnes e frutas diferem, ao mesmo tempo, entre os níveis de escolaridade?",
    vds: ["MntWines + MntMeatProducts + MntFruits", "Education"], vd: "MntWines + MntMeatProducts + MntFruits", tecnica: "manova",
    porque: "Várias VDs métricas + VI de grupos → MANOVA. Confira o Box's M (p > 0,001) ou reporte Pillai." },
  { id: 8, nivel: "Médio",
    enunciado: "Em que medida a renda, a idade, a recência e a presença de filhos contribuem para explicar o gasto total?",
    vds: ["MntTotal", "Income", "Age"], vd: "MntTotal", tecnica: "regressao-multipla",
    porque: "“Em que medida… contribuem para explicar” → VD métrica + várias VIs → regressão linear múltipla. Cheque VIF, Durbin-Watson, resíduos e Cook." },
  { id: 9, nivel: "Médio",
    enunciado: "A empresa tem nove variáveis de gasto e compras e quer saber se elas podem ser resumidas em poucas dimensões.",
    vds: ["As nove variáveis", "Nenhuma"], vd: "", tecnica: "afe",
    porque: "“Conjunto menor de dimensões” → interdependência, sem VD. AFE: cheque KMO e Bartlett, número de fatores, rotação e cargas. Depois, confiabilidade." },
  { id: 10, nivel: "Médio",
    enunciado: "A marca quer descobrir perfis de clientes segundo renda, gasto total e recência, sem nenhum grupo definido antes.",
    vds: ["Renda, gasto, recência", "Nenhuma"], vd: "", tecnica: "cluster",
    porque: "“Perfis de clientes” → estrutura entre casos → análise de agrupamentos. Padronize as variáveis e escolha k por silhueta." },
  { id: 11, nivel: "Difícil",
    enunciado: "Os mesmos clientes responderam à campanha 1 e à campanha 2 (sim/não). A taxa de aceite mudou?",
    vds: ["AcceptedCmp1", "AcceptedCmp2"], vd: "", tecnica: "mcnemar",
    porque: "Duas medidas dicotômicas nos mesmos clientes (pareado) → McNemar. O qui-quadrado supõe grupos independentes." },
  { id: 12, nivel: "Difícil",
    enunciado: "Um pesquisador propõe que a renda influencia o gasto total por meio do número de compras na web (mediação) e quer testar o modelo completo.",
    vds: ["MntTotal", "NumWebPurchases", "Income"], vd: "MntTotal", tecnica: "sem",
    porque: "“Mediação” e “modelo teórico” são palavras-gatilho de SEM: relações encadeadas, com efeito indireto." },
  { id: 13, nivel: "Difícil",
    enunciado: "Dois conjuntos de variáveis (renda, idade, recência) e (gasto com vinhos, carnes, frutas): há relação entre os conjuntos?",
    vds: ["Dois conjuntos de métricas", "Nenhuma"], vd: "", tecnica: "correlacao-canonica",
    porque: "“Relação entre dois conjuntos de variáveis” → correlação canônica." },
  { id: 14, nivel: "Difícil",
    enunciado: "A taxa histórica de resposta é de 15%. A taxa desta campanha é diferente?",
    vds: ["Response", "Nenhuma"], vd: "", tecnica: "binomial",
    porque: "Uma variável dicotômica contra proporção esperada → teste binomial (p = p₀)." }
];
