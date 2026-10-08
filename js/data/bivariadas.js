/* Técnicas bivariadas: Tabelas 2, 3, 4, 5 e 7 do guia.
   Convenção: os trechos assumem que `df` já foi carregado como na página "Preparação". */
window.HAIR = window.HAIR || { tecnicas: [] };

HAIR.tecnicas.push(

/* ───────────── Comparação de médias ───────────── */
{
  id: "t-independente",
  nome: "Teste t independente",
  grupo: "comparacao",
  tags: ["t de Student", "Welch", "duas médias", "2 grupos"],
  gatilho: "“os grupos diferem na média de…”, “quem respondeu × quem não respondeu”",
  paraQue: "Comparar as médias de dois grupos diferentes.",
  vd: "Métrica", vi: "Qualitativa com 2 grupos independentes",
  pergunta: "Quem respondeu à campanha (Response) gasta, em média, valor diferente de quem não respondeu? VD = MntTotal; VI = Response.",
  h0: "μ₁ = μ₂", h1: "μ₁ ≠ μ₂ (ou > / <)",
  h0Texto: "As médias dos dois grupos na população são iguais; a diferença na amostra é acaso.",
  seRejeitar: "As médias diferem. O d de Cohen mostra o tamanho da diferença.",
  seNaoRejeitar: "Não há evidência de diferença entre as médias.",
  pressupostos: ["VD métrica", "Grupos independentes", "Normalidade da VD em cada grupo", "Homogeneidade de variâncias"],
  seFalhar: "Levene com p < 0,05 → use Welch. Não normal com n pequeno → Mann-Whitney U.",
  efeito: "d de Cohen",
  par: "mann-whitney",
  ler: "Se p < 0,05, rejeite H₀. Reporte t, gl, p e o d de Cohen (≈ 0,2 pequeno, 0,5 médio, 0,8 grande). Com n grande, quase tudo fica significativo: olhe o tamanho de efeito.",
  py: String.raw`from scipy import stats
import pingouin as pg

sim = df.loc[df["Response"] == 1, "MntTotal"]
nao = df.loc[df["Response"] == 0, "MntTotal"]

# Pressupostos (aqui você quer NÃO rejeitar H0)
print("Shapiro (sim):", stats.shapiro(sim))
print("Shapiro (não):", stats.shapiro(nao))
lev = stats.levene(sim, nao, center="mean")
print("Levene:", lev)

# Teste: Welch se o Levene rejeitar a igualdade de variâncias
t, p = stats.ttest_ind(sim, nao, equal_var=lev.pvalue >= 0.05)
d = pg.compute_effsize(sim, nao, eftype="cohen")
print(f"t = {t:.3f}, p = {p:.4g}, d de Cohen = {d:.3f}")`,
  r: String.raw`library(car)        # leveneTest
library(effectsize) # cohens_d

# Pressupostos
tapply(df$MntTotal, df$Response_f, shapiro.test)
leveneTest(MntTotal ~ Response_f, data = df, center = mean)

# Welch (padrão do R) e Student
t.test(MntTotal ~ Response_f, data = df, var.equal = FALSE)
t.test(MntTotal ~ Response_f, data = df, var.equal = TRUE)

cohens_d(MntTotal ~ Response_f, data = df)`,
  jamovi: { menu: "T-Tests › Independent Samples T-Test", passos: [
    "MntTotal em Dependent Variables; Response em Grouping Variable (defina Response como Nominal em Data › Setup).",
    "Tests: Student's e Welch's.",
    "Assumption Checks: Homogeneity test (Levene), Normality test (Shapiro-Wilk), Q-Q plot.",
    "Additional Statistics: Effect size (d de Cohen).",
    "Levene com p < 0,05 → leia a linha do Welch."] },
  jasp: { menu: "T-Tests › Classical › Independent Samples T-Test", passos: [
    "MntTotal em Variables; Response em Grouping Variable.",
    "Tests: Student e Welch. Assumption Checks: Normality e Equality of variances.",
    "Additional Statistics: Effect size (Cohen's d) e Descriptives."] }
},

{
  id: "t-pareado",
  nome: "Teste t pareado",
  grupo: "comparacao",
  tags: ["medidas repetidas", "2 medidas", "antes e depois"],
  gatilho: "“antes e depois”, “as duas medidas diferem?”",
  paraQue: "Verificar se há diferença média entre duas medidas das mesmas pessoas.",
  vd: "Métrica", vi: "2 medidas no mesmo sujeito (pareado)",
  pergunta: "O mesmo cliente gasta, em média, mais com vinhos do que com carnes? Medidas: MntWines e MntMeatProducts.",
  h0: "μ(dif) = 0", h1: "μ(dif) ≠ 0",
  h0Texto: "A diferença média entre as duas medidas é zero.",
  seRejeitar: "As duas medidas diferem em média.",
  seNaoRejeitar: "Não há evidência de diferença.",
  pressupostos: ["Pares de medidas no mesmo sujeito", "Normalidade das diferenças"],
  seFalhar: "Diferenças não normais → Wilcoxon.",
  efeito: "d de Cohen (pareado)",
  par: "wilcoxon",
  ler: "O Shapiro-Wilk vale para a DIFERENÇA entre as medidas, não para cada medida isolada.",
  py: String.raw`from scipy import stats
import pingouin as pg

x, y = df["MntWines"], df["MntMeatProducts"]
dif = x - y

print("Shapiro (diferenças):", stats.shapiro(dif))
t, p = stats.ttest_rel(x, y)
d = pg.compute_effsize(x, y, paired=True, eftype="cohen")
print(f"t = {t:.3f}, p = {p:.4g}, d = {d:.3f}")`,
  r: String.raw`library(effectsize)

shapiro.test(df$MntWines - df$MntMeatProducts)   # normalidade das diferenças
t.test(df$MntWines, df$MntMeatProducts, paired = TRUE)
cohens_d(df$MntWines, df$MntMeatProducts, paired = TRUE)`,
  jamovi: { menu: "T-Tests › Paired Samples T-Test", passos: [
    "Selecione as duas medidas (MntWines e MntMeatProducts) em Paired Variables.",
    "Tests: Student's. Assumption Checks: Normality test, Q-Q plot.",
    "Additional Statistics: Effect size.",
    "Se não for normal, marque Wilcoxon rank."] },
  jasp: { menu: "T-Tests › Classical › Paired Samples T-Test", passos: [
    "Coloque as duas medidas em Variable Pairs.",
    "Tests: Student (e Wilcoxon signed-rank se necessário). Assumption Checks: Normality.",
    "Additional Statistics: Effect size."] }
},

{
  id: "t-uma-amostra",
  nome: "Teste t de uma amostra",
  grupo: "comparacao",
  tags: ["valor de referência", "média contra constante"],
  gatilho: "“a média é igual a X?”, “difere de um valor de referência”",
  paraQue: "Comparar a média de um grupo com um valor de referência conhecido.",
  vd: "Métrica", vi: "Nenhuma (uma amostra contra constante)",
  pergunta: "A renda média (Income) dos clientes é de R$ 50.000?",
  h0: "μ = μ₀", h1: "μ ≠ μ₀",
  h0Texto: "A média da população é igual ao valor de referência.",
  seRejeitar: "A média difere do valor de referência.",
  seNaoRejeitar: "A média é compatível com o valor de referência.",
  pressupostos: ["Observações independentes", "Normalidade da VD"],
  seFalhar: "Não normal e n pequeno → Wilcoxon de uma amostra.",
  efeito: "d de Cohen",
  par: "wilcoxon-uma",
  ler: "Veja o intervalo de confiança da média: se ele contém o valor de referência, não rejeitamos H₀.",
  py: String.raw`from scipy import stats

renda = df["Income"].dropna()
mu0 = 50000

print("Shapiro:", stats.shapiro(renda))
res = stats.ttest_1samp(renda, mu0)
d = (renda.mean() - mu0) / renda.std(ddof=1)
print(res, "| IC95%:", res.confidence_interval())
print(f"d de Cohen = {d:.3f}")`,
  r: String.raw`renda <- na.omit(df$Income)

shapiro.test(renda)
t.test(renda, mu = 50000)
(mean(renda) - 50000) / sd(renda)   # d de Cohen`,
  jamovi: { menu: "T-Tests › One Sample T-Test", passos: [
    "Income em Dependent Variables; Test value = 50000.",
    "Assumption Checks: Normality test. Additional Statistics: Effect size e Confidence interval.",
    "Alternativa: marque Wilcoxon rank."] },
  jasp: { menu: "T-Tests › Classical › One Sample T-Test", passos: [
    "Income em Variables; Test value = 50000.",
    "Tests: Student (ou Wilcoxon signed-rank). Assumption Checks: Normality."] }
},

{
  id: "anova-um-fator",
  nome: "ANOVA de um fator",
  grupo: "comparacao",
  tags: ["F", "post hoc", "Tukey", "Games-Howell", "3 grupos"],
  gatilho: "“as médias diferem entre os níveis de…”, 3 ou mais grupos",
  paraQue: "Comparar as médias de três ou mais grupos de uma só vez, sem inflar o erro tipo I.",
  vd: "Métrica", vi: "Qualitativa com 3+ grupos independentes",
  pergunta: "O gasto total (MntTotal) varia conforme a escolaridade (Education)?",
  h0: "μ₁ = μ₂ = … = μk", h1: "Ao menos uma média difere",
  h0Texto: "Todos os grupos têm a mesma média na população.",
  seRejeitar: "Pelo menos um grupo difere. A ANOVA não diz qual: rode o post hoc.",
  seNaoRejeitar: "Não há evidência de diferença entre os grupos.",
  pressupostos: ["Independência", "Normalidade dos resíduos (ou em cada grupo)", "Homogeneidade de variâncias"],
  seFalhar: "Variâncias diferentes → Welch + Games-Howell. Não normal → Kruskal-Wallis.",
  efeito: "η² (eta ao quadrado)",
  par: "kruskal",
  ler: "Reporte F(gl1, gl2), p e η². Só interprete o post hoc se o teste global for significativo. Tukey assume variâncias iguais; Games-Howell não.",
  py: String.raw`import pingouin as pg
from scipy import stats

grupos = [g["MntTotal"].values for _, g in df.groupby("Education", observed=True)]
print("Levene:", stats.levene(*grupos, center="mean"))

# ANOVA clássica (np2 = η² parcial; em um fator é igual ao η²)
print(pg.anova(data=df, dv="MntTotal", between="Education", detailed=True))
print(pg.pairwise_tukey(data=df, dv="MntTotal", between="Education"))

# Se o Levene rejeitar H0: Welch + Games-Howell
print(pg.welch_anova(data=df, dv="MntTotal", between="Education"))
print(pg.pairwise_gameshowell(data=df, dv="MntTotal", between="Education"))`,
  r: String.raw`library(car); library(effectsize); library(rstatix)

leveneTest(MntTotal ~ Education, data = df, center = mean)

m <- aov(MntTotal ~ Education, data = df)
summary(m)
eta_squared(m)
TukeyHSD(m)

# Se o Levene rejeitar H0: Welch + Games-Howell
oneway.test(MntTotal ~ Education, data = df, var.equal = FALSE)
games_howell_test(df, MntTotal ~ Education)

# Normalidade dos resíduos
shapiro.test(residuals(m))`,
  jamovi: { menu: "ANOVA › One-Way ANOVA", passos: [
    "MntTotal em Dependent Variables; Education em Grouping Variable.",
    "Variances: Don't assume equal (Welch's) se o Levene rejeitar.",
    "Assumption Checks: Homogeneity test, Normality test, Q-Q plot.",
    "Post-Hoc Tests: Tukey (variâncias iguais) ou Games-Howell.",
    "Para η²: ANOVA › ANOVA › Effect Size."] },
  jasp: { menu: "ANOVA › Classical › ANOVA", passos: [
    "MntTotal em Dependent Variable; Education em Fixed Factors.",
    "Assumption Checks: Homogeneity tests e Q-Q plot of residuals. Em Homogeneity Corrections, escolha Welch.",
    "Post Hoc Tests: mova Education e marque Tukey (ou Games-Howell).",
    "Display: Estimates of effect size (η²)."] }
},

{
  id: "anova-medidas-repetidas",
  nome: "ANOVA de medidas repetidas",
  grupo: "comparacao",
  tags: ["esfericidade", "Mauchly", "Greenhouse-Geisser", "3+ medidas"],
  gatilho: "3 ou mais medidas na mesma pessoa",
  paraQue: "Comparar as médias de três ou mais medidas feitas nos mesmos sujeitos.",
  vd: "Métrica", vi: "3+ medidas no mesmo sujeito",
  pergunta: "O número de compras difere entre os canais web, catálogo e loja? Medidas: NumWebPurchases, NumCatalogPurchases, NumStorePurchases.",
  h0: "μ₁ = μ₂ = … = μk", h1: "Ao menos uma medida difere",
  h0Texto: "As médias das k medidas são iguais na população.",
  seRejeitar: "Pelo menos uma medida difere; rode os post hoc pareados.",
  seNaoRejeitar: "Não há evidência de diferença.",
  pressupostos: ["Normalidade das medidas (ou das diferenças)", "Esfericidade (Mauchly)", "Sujeitos independentes entre si"],
  seFalhar: "Mauchly com p < 0,05 → use Greenhouse-Geisser. Não normal → Friedman.",
  efeito: "η² parcial (ou η² generalizado)",
  par: "friedman",
  ler: "Se o Mauchly rejeitar, leia a linha com correção de Greenhouse-Geisser. Post hoc com correção de Bonferroni.",
  py: String.raw`import pingouin as pg

canais = ["NumWebPurchases", "NumCatalogPurchases", "NumStorePurchases"]
long = df[["ID"] + canais].melt(id_vars="ID", var_name="canal", value_name="compras")

print(pg.sphericity(long, dv="compras", within="canal", subject="ID"))   # Mauchly
print(pg.rm_anova(data=long, dv="compras", within="canal", subject="ID",
                  detailed=True, correction=True))                        # inclui GG
print(pg.pairwise_tests(data=long, dv="compras", within="canal", subject="ID",
                        padjust="bonf"))`,
  r: String.raw`library(tidyr); library(rstatix)

canais <- c("NumWebPurchases", "NumCatalogPurchases", "NumStorePurchases")
long <- pivot_longer(df[, c("ID", canais)], cols = all_of(canais),
                     names_to = "canal", values_to = "compras")
long$ID <- factor(long$ID); long$canal <- factor(long$canal)

res <- anova_test(data = long, dv = compras, wid = ID, within = canal)
get_anova_table(res, correction = "auto")   # traz Mauchly e GG automaticamente
pairwise_t_test(long, compras ~ canal, paired = TRUE, p.adjust.method = "bonferroni")`,
  jamovi: { menu: "ANOVA › Repeated Measures ANOVA", passos: [
    "Em Repeated Measures Factors, renomeie “RM Factor 1” para canal e crie 3 níveis.",
    "Associe cada nível a uma variável em Repeated Measures Cells.",
    "Assumption Checks: Sphericity tests (Mauchly) e Sphericity corrections: Greenhouse-Geisser.",
    "Effect Size: partial η². Post Hoc Tests: canal, com correção de Bonferroni."] },
  jasp: { menu: "ANOVA › Classical › Repeated Measures ANOVA", passos: [
    "Defina o fator de medidas repetidas (3 níveis) e associe as variáveis.",
    "Assumption Checks: Sphericity tests; Sphericity corrections: Greenhouse-Geisser.",
    "Post Hoc Tests com Bonferroni; Display: effect size (η²)."] }
},

/* ───────────── Não paramétricos ───────────── */
{
  id: "mann-whitney",
  nome: "Mann-Whitney U",
  grupo: "naoparametrico",
  tags: ["postos", "ordinal", "2 grupos", "Wilcoxon rank-sum"],
  gatilho: "VD ordinal em 2 grupos; ou t com normalidade violada",
  paraQue: "Comparar dois grupos independentes quando a VD é ordinal ou não normal.",
  vd: "Ordinal ou métrica (sem normalidade)", vi: "Dicotômica (2 grupos independentes)",
  pergunta: "Quem respondeu à campanha tem menos filhos pequenos? Kidhome (0, 1, 2) por Response.",
  h0: "As distribuições dos 2 grupos são iguais", h1: "Um grupo tende a ter valores maiores",
  h0Texto: "Nenhum grupo tende a ter valores maiores que o outro (distribuições iguais).",
  seRejeitar: "Um grupo tende a ter valores maiores.",
  seNaoRejeitar: "Não há evidência de diferença entre os grupos.",
  pressupostos: ["Independência", "VD ao menos ordinal", "Distribuições de formato parecido, para ler como diferença de medianas"],
  seFalhar: "Sem formato parecido, interprete como “tendência a valores maiores”, não como diferença de medianas.",
  efeito: "Correlação rank-biserial",
  substitui: "t-independente", par: "t-independente",
  ler: "Rank-biserial vai de −1 a 1. O sinal depende de qual grupo é tratado como o primeiro: confira a direção nas medianas.",
  py: String.raw`from scipy import stats

a = df.loc[df["Response"] == 1, "Kidhome"]
b = df.loc[df["Response"] == 0, "Kidhome"]

u, p = stats.mannwhitneyu(a, b, alternative="two-sided")
rbc = 2 * u / (len(a) * len(b)) - 1        # correlação rank-biserial (a vs b)
print(f"U = {u:.0f}, p = {p:.4g}, rank-biserial = {rbc:.3f}")
print(df.groupby("Response")["Kidhome"].median())`,
  r: String.raw`library(effectsize)

wilcox.test(Kidhome ~ Response_f, data = df, conf.int = TRUE)
rank_biserial(Kidhome ~ Response_f, data = df)
tapply(df$Kidhome, df$Response_f, median)`,
  jamovi: { menu: "T-Tests › Independent Samples T-Test", passos: [
    "Kidhome em Dependent Variables; Response em Grouping Variable.",
    "Tests: marque Mann-Whitney U.",
    "Additional Statistics: Effect size (correlação rank-biserial)."] },
  jasp: { menu: "T-Tests › Classical › Independent Samples T-Test", passos: [
    "Tests: marque Mann-Whitney.",
    "Additional Statistics: Effect size (rank-biserial correlation) e Descriptives."] }
},

{
  id: "wilcoxon",
  nome: "Wilcoxon (postos sinalizados)",
  grupo: "naoparametrico",
  tags: ["pareado", "ordinal", "signed-rank"],
  gatilho: "2 medidas na mesma pessoa, dados ordinais ou não normais",
  paraQue: "O mesmo que o t pareado, com dados ordinais ou não normais.",
  vd: "Ordinal ou métrica (sem normalidade)", vi: "2 medidas no mesmo sujeito",
  pergunta: "O gasto com vinhos tende a ser maior que o gasto com carnes, sem exigir normalidade das diferenças?",
  h0: "Mediana das diferenças = 0", h1: "Mediana das diferenças ≠ 0",
  h0Texto: "As diferenças positivas e negativas se equilibram (mediana das diferenças = 0).",
  seRejeitar: "Uma medida tende a ser maior que a outra.",
  seNaoRejeitar: "Não há evidência de diferença.",
  pressupostos: ["Pares de medidas", "Diferenças ao menos ordinais e simétricas em torno da mediana"],
  seFalhar: "Diferenças muito assimétricas → teste do sinal.",
  efeito: "Correlação rank-biserial",
  substitui: "t-pareado", par: "t-pareado",
  ler: "Reporte W (ou V), p e a rank-biserial.",
  py: String.raw`import pingouin as pg
from scipy import stats

x, y = df["MntWines"], df["MntMeatProducts"]
print(stats.wilcoxon(x, y))
print(pg.wilcoxon(x, y))      # traz RBC (rank-biserial) e CLES`,
  r: String.raw`library(effectsize)

wilcox.test(df$MntWines, df$MntMeatProducts, paired = TRUE, conf.int = TRUE)
rank_biserial(df$MntWines, df$MntMeatProducts, paired = TRUE)`,
  jamovi: { menu: "T-Tests › Paired Samples T-Test", passos: [
    "Selecione o par de variáveis.",
    "Tests: marque Wilcoxon rank.",
    "Additional Statistics: Effect size (rank-biserial)."] },
  jasp: { menu: "T-Tests › Classical › Paired Samples T-Test", passos: [
    "Tests: marque Wilcoxon signed-rank. Additional Statistics: Effect size."] }
},

{
  id: "wilcoxon-uma",
  nome: "Wilcoxon de uma amostra",
  grupo: "naoparametrico",
  tags: ["mediana", "valor de referência"],
  gatilho: "mediana contra valor de referência",
  paraQue: "Comparar a mediana com um valor de referência quando a normalidade falha.",
  vd: "Ordinal ou métrica", vi: "Nenhuma",
  pergunta: "A renda mediana é de R$ 50.000?",
  h0: "Mediana = valor de referência", h1: "Mediana ≠ valor de referência",
  h0Texto: "A mediana da população é igual ao valor de referência.",
  seRejeitar: "A mediana difere do valor de referência.",
  seNaoRejeitar: "A mediana é compatível com o valor de referência.",
  pressupostos: ["Observações independentes", "Distribuição simétrica"],
  seFalhar: "Distribuição assimétrica → teste do sinal.",
  efeito: "Correlação rank-biserial",
  substitui: "t-uma-amostra", par: "t-uma-amostra",
  ler: "Compare também a mediana amostral com o valor de referência para dar a direção.",
  py: String.raw`from scipy import stats

renda = df["Income"].dropna()
print(stats.wilcoxon(renda - 50000))
print("Mediana amostral:", renda.median())`,
  r: String.raw`wilcox.test(df$Income, mu = 50000, conf.int = TRUE)
median(df$Income, na.rm = TRUE)`,
  jamovi: { menu: "T-Tests › One Sample T-Test", passos: [
    "Income em Dependent Variables; Test value = 50000.", "Tests: marque Wilcoxon rank."] },
  jasp: { menu: "T-Tests › Classical › One Sample T-Test", passos: [
    "Test value = 50000; Tests: Wilcoxon signed-rank."] }
},

{
  id: "kruskal",
  nome: "Kruskal-Wallis",
  grupo: "naoparametrico",
  tags: ["postos", "3+ grupos", "DSCF"],
  gatilho: "3+ grupos com VD ordinal ou sem normalidade",
  paraQue: "Comparar três ou mais grupos com dados ordinais ou não normais.",
  vd: "Ordinal ou métrica (sem normalidade)", vi: "Qualitativa com 3+ grupos independentes",
  pergunta: "O gasto total (MntTotal), com muitos outliers, varia conforme a escolaridade?",
  h0: "As distribuições dos k grupos são iguais", h1: "Pelo menos um grupo difere",
  h0Texto: "Todos os grupos vêm da mesma distribuição.",
  seRejeitar: "Pelo menos um grupo difere; rode o DSCF.",
  seNaoRejeitar: "Não há evidência de diferença.",
  pressupostos: ["Independência", "VD ao menos ordinal", "Formatos parecidos entre grupos"],
  seFalhar: "Interprete como “tendência a valores maiores” se os formatos diferirem.",
  efeito: "ε²",
  substitui: "anova-um-fator", par: "anova-um-fator",
  ler: "Post hoc: DSCF (Dwass-Steel-Critchlow-Fligner) no jamovi; Dunn é a alternativa comum em Python/R.",
  py: String.raw`from scipy import stats
import scikit_posthocs as sp

grupos = [g["MntTotal"].values for _, g in df.groupby("Education", observed=True)]
H, p = stats.kruskal(*grupos)
n = len(df)
eps2 = H * (n + 1) / (n**2 - 1)             # ε²
print(f"H = {H:.3f}, p = {p:.4g}, ε² = {eps2:.4f}")

print(sp.posthoc_dscf(df, val_col="MntTotal", group_col="Education"))`,
  r: String.raw`library(rstatix); library(PMCMRplus)

kruskal.test(MntTotal ~ Education, data = df)
kruskal_effsize(df, MntTotal ~ Education)      # ε²

# Post hoc: DSCF (como no jamovi) ou Dunn
dscfAllPairsTest(MntTotal ~ Education, data = df)
dunn_test(df, MntTotal ~ Education, p.adjust.method = "bonferroni")`,
  jamovi: { menu: "ANOVA › Non-Parametric › One-Way ANOVA (Kruskal-Wallis)", passos: [
    "MntTotal em Dependent Variables; Education em Grouping Variable.",
    "Pairwise comparisons (DSCF) para o post hoc. Effect size: ε²."] },
  jasp: { menu: "ANOVA › Classical › ANOVA (seção Nonparametric: Kruskal-Wallis)", passos: [
    "Em Nonparametric, mova Education e marque Dunn's post hoc test."] }
},

{
  id: "friedman",
  nome: "Friedman",
  grupo: "naoparametrico",
  tags: ["medidas repetidas", "W de Kendall", "Durbin-Conover"],
  gatilho: "3+ medidas na mesma pessoa, sem normalidade",
  paraQue: "Comparar três ou mais medidas das mesmas pessoas com dados ordinais ou não normais.",
  vd: "Ordinal ou métrica (sem normalidade)", vi: "3+ medidas no mesmo sujeito",
  pergunta: "O número de compras difere entre os canais, sem assumir normalidade?",
  h0: "As distribuições nas k medidas são iguais", h1: "Pelo menos uma medida difere",
  h0Texto: "As k medidas têm a mesma distribuição.",
  seRejeitar: "Pelo menos uma medida difere; rode o Durbin-Conover.",
  seNaoRejeitar: "Não há evidência de diferença.",
  pressupostos: ["Blocos (sujeitos) independentes entre si", "VD ao menos ordinal"],
  seFalhar: "—",
  efeito: "W de Kendall",
  substitui: "anova-medidas-repetidas", par: "anova-medidas-repetidas",
  ler: "W de Kendall vai de 0 a 1 (concordância entre as medidas).",
  py: String.raw`from scipy import stats
import scikit_posthocs as sp

canais = ["NumWebPurchases", "NumCatalogPurchases", "NumStorePurchases"]
chi2, p = stats.friedmanchisquare(*[df[c] for c in canais])
n, k = len(df), len(canais)
W = chi2 / (n * (k - 1))                     # W de Kendall
print(f"χ² = {chi2:.2f}, p = {p:.4g}, W = {W:.3f}")

print(sp.posthoc_conover_friedman(df[canais].to_numpy()))   # comparações par a par`,
  r: String.raw`library(rstatix); library(PMCMRplus)

canais <- c("NumWebPurchases", "NumCatalogPurchases", "NumStorePurchases")
long <- tidyr::pivot_longer(df[, c("ID", canais)], cols = all_of(canais),
                            names_to = "canal", values_to = "compras")
long$ID <- factor(long$ID); long$canal <- factor(long$canal)

friedman_test(long, compras ~ canal | ID)
friedman_effsize(long, compras ~ canal | ID)      # W de Kendall

# Post hoc (Durbin-Conover)
frdAllPairsConoverTest(y = as.matrix(df[, canais]))`,
  jamovi: { menu: "ANOVA › Non-Parametric › Repeated Measures ANOVA (Friedman)", passos: [
    "Mova as três medidas para Measures.",
    "Pairwise comparisons (Durbin-Conover). Effect size: W de Kendall."] },
  jasp: { menu: "ANOVA › Classical › Repeated Measures ANOVA (seção Nonparametric: Friedman)", passos: [
    "Defina o fator de medidas repetidas e marque Friedman; Conover como post hoc."] }
},

/* ───────────── Correlação ───────────── */
{
  id: "pearson",
  nome: "Correlação de Pearson",
  grupo: "correlacao",
  tags: ["r", "linear", "regressão simples"],
  gatilho: "“relação entre duas variáveis métricas”",
  paraQue: "Medir a força e a direção da relação linear entre duas variáveis métricas.",
  vd: "Métrica (ou nenhuma, se simétrica)", vi: "Métrica",
  pergunta: "Renda (Income) e gasto total (MntTotal) estão relacionados?",
  h0: "ρ = 0", h1: "ρ ≠ 0",
  h0Texto: "Não há relação linear na população (ρ = 0).",
  seRejeitar: "Há correlação. O valor de r mostra a força e o sinal mostra a direção.",
  seNaoRejeitar: "Não há evidência de relação linear.",
  pressupostos: ["Duas variáveis métricas", "Relação linear", "Normalidade bivariada (para o teste)", "Sem outliers influentes"],
  seFalhar: "Spearman ou Kendall's tau-b.",
  efeito: "O próprio r (r² = variância compartilhada)",
  par: "spearman",
  ler: "Olhe sempre o gráfico de dispersão antes. Um r pequeno com n enorme pode ser significativo e irrelevante.",
  py: String.raw`from scipy import stats
import matplotlib.pyplot as plt

d = df[["Income", "MntTotal"]].dropna()
res = stats.pearsonr(d["Income"], d["MntTotal"])
print(f"r = {res.statistic:.3f}, p = {res.pvalue:.4g}, IC95% = {res.confidence_interval()}")

d.plot.scatter("Income", "MntTotal", alpha=.3); plt.show()   # confira linearidade e outliers`,
  r: String.raw`cor.test(df$Income, df$MntTotal, method = "pearson")
plot(df$Income, df$MntTotal)   # confira linearidade e outliers`,
  jamovi: { menu: "Regression › Correlation Matrix", passos: [
    "Mova Income e MntTotal para a caixa de variáveis.",
    "Correlation Coefficients: Pearson. Additional Options: Report significance, Confidence intervals.",
    "Plot: Correlation matrix, Densities. Veja também Exploration › Scatterplot."] },
  jasp: { menu: "Regression › Classical › Correlation", passos: [
    "Variables: Income, MntTotal. Sample Correlation Coefficient: Pearson's r.",
    "Display: Report significance, Confidence intervals; Plots: Scatter plots."] }
},

{
  id: "spearman",
  nome: "Correlação de Spearman",
  grupo: "correlacao",
  tags: ["ρs", "monotônica", "postos"],
  gatilho: "ordinais ou métricas sem normalidade, com outliers",
  paraQue: "Medir a relação monotônica com dados ordinais, não normais ou com outliers.",
  vd: "Ordinal ou métrica", vi: "Ordinal ou métrica",
  pergunta: "Renda e gasto total se movem juntos, sem assumir linearidade nem normalidade?",
  h0: "ρs = 0", h1: "ρs ≠ 0",
  h0Texto: "Não há relação monotônica na população (ρs = 0).",
  seRejeitar: "Há relação: quando uma sobe, a outra tende a subir (ou descer).",
  seNaoRejeitar: "Não há evidência de relação.",
  pressupostos: ["Relação monotônica (não precisa ser linear)", "Pares independentes"],
  seFalhar: "Muitos empates → Kendall's tau-b.",
  efeito: "O próprio ρs",
  substitui: "pearson", par: "pearson",
  ler: "Mesma leitura do r de Pearson, mas sobre os postos.",
  py: String.raw`from scipy import stats

d = df[["Income", "MntTotal"]].dropna()
res = stats.spearmanr(d["Income"], d["MntTotal"])
print(f"ρs = {res.statistic:.3f}, p = {res.pvalue:.4g}")`,
  r: String.raw`cor.test(df$Income, df$MntTotal, method = "spearman", exact = FALSE)`,
  jamovi: { menu: "Regression › Correlation Matrix", passos: ["Correlation Coefficients: marque Spearman."] },
  jasp: { menu: "Regression › Classical › Correlation", passos: ["Sample Correlation Coefficient: Spearman's rho."] }
},

{
  id: "kendall",
  nome: "τb de Kendall",
  grupo: "correlacao",
  tags: ["tau-b", "empates", "escalas curtas"],
  gatilho: "amostra pequena ou muitos empates (escalas de 1 a 5)",
  paraQue: "Medir a relação monotônica quando há muitos empates ou amostra pequena.",
  vd: "Ordinal", vi: "Ordinal",
  pergunta: "A escolaridade (ordenada) se associa ao número de filhos pequenos (Kidhome)?",
  h0: "τb = 0", h1: "τb ≠ 0",
  h0Texto: "Não há relação monotônica na população (τb = 0).",
  seRejeitar: "Há relação monotônica.",
  seNaoRejeitar: "Não há evidência de relação.",
  pressupostos: ["Relação monotônica", "Pares independentes"],
  seFalhar: "—",
  efeito: "O próprio τb",
  substitui: "pearson", par: "pearson",
  ler: "O τb é em geral menor em módulo do que o ρs; não compare os dois diretamente.",
  py: String.raw`from scipy import stats

educ_cod = df["Education"].cat.codes          # Education já está ordenada
res = stats.kendalltau(educ_cod, df["Kidhome"], variant="b")
print(f"τb = {res.statistic:.3f}, p = {res.pvalue:.4g}")`,
  r: String.raw`cor.test(as.numeric(df$Education), df$Kidhome, method = "kendall", exact = FALSE)`,
  jamovi: { menu: "Regression › Correlation Matrix", passos: [
    "Education precisa ser Ordinal (ou numérica); marque Kendall's tau-b."] },
  jasp: { menu: "Regression › Classical › Correlation", passos: ["Sample Correlation Coefficient: Kendall's tau-b."] }
},

/* ───────────── Variáveis categóricas ───────────── */
{
  id: "qui-quadrado",
  nome: "Qui-quadrado de independência",
  grupo: "categoricas",
  tags: ["χ²", "V de Cramér", "tabela de contingência"],
  gatilho: "“associação entre” duas variáveis categóricas",
  paraQue: "Verificar se duas variáveis categóricas estão associadas.",
  vd: "Nominal (ou nenhuma)", vi: "Nominal",
  pergunta: "A taxa de resposta (Response) é a mesma em todos os estados civis (Marital_Status)?",
  h0: "As variáveis são independentes", h1: "Há associação",
  h0Texto: "Não há associação: a distribuição de uma variável é a mesma em todas as categorias da outra.",
  seRejeitar: "Há associação. Veja os percentuais e o V de Cramér para saber onde e quão forte.",
  seNaoRejeitar: "Não há evidência de associação.",
  pressupostos: ["Observações independentes (cada caso em uma só célula)", "Esperado ≥ 5 em pelo menos 80% das células e nenhuma < 1"],
  seFalhar: "Agrupar categorias raras; Fisher (2×2).",
  efeito: "V de Cramér",
  par: "fisher",
  ler: "Compare os percentuais por linha para ver ONDE está a diferença. Ordinal? Acrescente Gamma ou τb (a ordem importa).",
  py: String.raw`import pandas as pd
from scipy import stats

tab = pd.crosstab(df["Marital_Status"], df["Response"])
chi2, p, gl, esperado = stats.chi2_contingency(tab)
v = stats.contingency.association(tab, method="cramer")

print(tab)
print("\nEsperado:\n", pd.DataFrame(esperado, index=tab.index, columns=tab.columns).round(1))
print("\n% por linha:\n", (tab.div(tab.sum(axis=1), axis=0) * 100).round(1))
print(f"\nχ²({gl}) = {chi2:.2f}, p = {p:.4g}, V de Cramér = {v:.3f}")
print("Células com esperado < 5:", (esperado < 5).mean().round(2))`,
  r: String.raw`library(effectsize)

tab <- table(df$Marital_Status, df$Response)
teste <- chisq.test(tab)
teste
round(teste$expected, 1)                       # esperados
round(prop.table(tab, 1) * 100, 1)             # % por linha
cramers_v(tab)`,
  jamovi: { menu: "Frequencies › Contingency Tables › Independent Samples", passos: [
    "Rows: Marital_Status; Columns: Response.",
    "Statistics: χ²; Nominal: Cramér's V.",
    "Cells: Expected counts, Row %."] },
  jasp: { menu: "Frequencies › Classical › Contingency Tables", passos: [
    "Rows: Marital_Status; Columns: Response.",
    "Statistics: χ²; Nominal: Cramér's V. Cells: Expected, Row.",] }
},

{
  id: "fisher",
  nome: "Exato de Fisher (2×2) e χ² com correção",
  grupo: "categoricas",
  tags: ["odds ratio", "phi", "2×2", "esperado baixo"],
  gatilho: "duas dicotômicas, esperado < 5",
  paraQue: "O mesmo que o qui-quadrado em tabelas 2×2 com frequências esperadas baixas.",
  vd: "Dicotômica", vi: "Dicotômica",
  pergunta: "Quem reclamou (Complain) responde menos à campanha (Response)?",
  h0: "Independência (OR = 1)", h1: "OR ≠ 1",
  h0Texto: "Não há associação entre as duas variáveis dicotômicas.",
  seRejeitar: "Há associação. A razão de chances mostra a direção.",
  seNaoRejeitar: "Não há evidência de associação.",
  pressupostos: ["Observações independentes", "Totais das margens fixos (Fisher)"],
  seFalhar: "—",
  efeito: "Razão de chances (odds ratio) · φ",
  substitui: "qui-quadrado", par: "qui-quadrado",
  ler: "OR > 1: a categoria da linha aumenta a chance; OR < 1 reduz. Veja se o IC do OR contém 1.",
  py: String.raw`import pandas as pd
from scipy import stats

tab = pd.crosstab(df["Complain"], df["Response"])
print(tab)

chi2, p, gl, esp = stats.chi2_contingency(tab, correction=True)   # correção de continuidade
print(f"χ² com correção: {chi2:.3f}, p = {p:.4g}, mínimo esperado = {esp.min():.1f}")

oratio, p_f = stats.fisher_exact(tab)
phi = stats.contingency.association(tab, method="pearson")
print(f"Fisher: p = {p_f:.4g}, OR = {oratio:.2f}, φ = {phi:.3f}")`,
  r: String.raw`library(effectsize)

tab <- table(df$Complain, df$Response)
chisq.test(tab, correct = TRUE)
fisher.test(tab)            # inclui odds ratio e IC
phi(tab)`,
  jamovi: { menu: "Frequencies › Contingency Tables › Independent Samples", passos: [
    "Rows: Complain; Columns: Response.",
    "Statistics: χ², χ² continuity correction, Fisher's exact test.",
    "Comparative measures: Odds ratio; Nominal: Phi and Cramér's V."] },
  jasp: { menu: "Frequencies › Classical › Contingency Tables", passos: [
    "Statistics: χ², χ² continuity correction, Fisher's exact test; marque Odds ratio e Phi."] }
},

{
  id: "mcnemar",
  nome: "Teste de McNemar",
  grupo: "categoricas",
  tags: ["pareado", "proporções discordantes"],
  gatilho: "mesma pessoa, 2 medidas dicotômicas",
  paraQue: "Verificar se uma proporção mudou entre duas medidas nas mesmas pessoas.",
  vd: "Dicotômica", vi: "2 medidas no mesmo sujeito",
  pergunta: "A taxa de aceite da campanha 1 (AcceptedCmp1) difere da campanha 2 (AcceptedCmp2)?",
  h0: "A proporção de “sim” é igual nas duas medidas", h1: "As proporções diferem",
  h0Texto: "A proporção de “sim” é igual nas duas medidas; as mudanças nos dois sentidos se equilibram.",
  seRejeitar: "A proporção mudou entre as medidas.",
  seNaoRejeitar: "Não há evidência de mudança.",
  pressupostos: ["Pares de medidas", "Variáveis dicotômicas"],
  seFalhar: "Poucos discordantes → versão exata.",
  efeito: "Proporções discordantes",
  substitui: "qui-quadrado", par: "qui-quadrado",
  ler: "Só as células discordantes (sim→não e não→sim) entram no teste.",
  py: String.raw`import pandas as pd
from statsmodels.stats.contingency_tables import mcnemar

tab = pd.crosstab(df["AcceptedCmp1"], df["AcceptedCmp2"])
print(tab)
res = mcnemar(tab, exact=True)       # exact=False usa χ² com correção
print(f"estatística = {res.statistic}, p = {res.pvalue:.4g}")`,
  r: String.raw`tab <- table(df$AcceptedCmp1, df$AcceptedCmp2)
tab
mcnemar.test(tab)                       # χ² com correção
# Versão exata (poucos discordantes):
binom.test(tab[1, 2], tab[1, 2] + tab[2, 1], p = 0.5)`,
  jamovi: { menu: "Frequencies › Contingency Tables › Paired Samples", passos: [
    "Rows: AcceptedCmp1; Columns: AcceptedCmp2. Statistics: McNemar."] },
  jasp: { menu: "Frequencies › Classical › Contingency Tables", passos: [
    "Rows: AcceptedCmp1; Columns: AcceptedCmp2.",
    "Procure a opção McNemar em Statistics; se a sua versão não tiver, use Python ou R."],
    aviso: "A disponibilidade do McNemar no JASP varia com a versão." }
},

{
  id: "binomial",
  nome: "Binomial · qui-quadrado de aderência",
  grupo: "categoricas",
  tags: ["proporção esperada", "z de proporção", "aderência"],
  gatilho: "“a taxa é de X%?”",
  paraQue: "Verificar se a proporção observada bate com um valor esperado.",
  vd: "Categórica", vi: "Nenhuma (uma variável contra proporção esperada)",
  pergunta: "A taxa de resposta à campanha é de 15%?",
  h0: "p = p₀", h1: "p ≠ p₀",
  h0Texto: "A proporção na população é igual à esperada (p = p₀).",
  seRejeitar: "A proporção difere da esperada.",
  seNaoRejeitar: "A proporção é compatível com a esperada.",
  pressupostos: ["Observações independentes"],
  seFalhar: "—",
  efeito: "—",
  par: "qui-quadrado",
  ler: "2 categorias → binomial; 3 ou mais → qui-quadrado de aderência (informe as proporções esperadas).",
  py: String.raw`from scipy import stats

k, n = int(df["Response"].sum()), len(df)
res = stats.binomtest(k, n, p=0.15)
print(f"proporção = {k/n:.3f}, p = {res.pvalue:.4g}, IC95% = {res.proportion_ci()}")

# 3+ categorias: aderência a uma distribuição esperada (aqui, uniforme)
obs = df["Kidhome"].value_counts().sort_index()
print(stats.chisquare(obs))`,
  r: String.raw`binom.test(sum(df$Response), nrow(df), p = 0.15)

obs <- table(df$Kidhome)
chisq.test(obs, p = rep(1 / length(obs), length(obs)))   # aderência (uniforme)`,
  jamovi: { menu: "Frequencies › One Sample Proportion Tests › 2 Outcomes / N Outcomes", passos: [
    "2 Outcomes: Response, Test value = 0,15.",
    "N Outcomes: informe as proporções esperadas em Expected proportions."] },
  jasp: { menu: "Frequencies › Classical › Binomial Test / Multinomial Test", passos: [
    "Binomial: Test value = 0,15. Multinomial: χ² de aderência com proporções esperadas."] }
},

{
  id: "logistica-ordinal",
  nome: "Regressão logística ordinal",
  grupo: "categoricas",
  tags: ["odds proporcionais", "VD ordinal", "preditores"],
  gatilho: "VD ordinal explicada por preditores",
  paraQue: "Explicar uma VD ordinal (ex.: satisfação de 1 a 5) por uma ou mais variáveis.",
  vd: "Ordinal", vi: "Métricas e/ou categóricas",
  pergunta: "O número de filhos pequenos (Kidhome: 0, 1, 2) é explicado por renda e idade?",
  h0: "β = 0", h1: "β ≠ 0",
  h0Texto: "A VI não altera a chance de estar em uma categoria mais alta (β = 0; OR = 1).",
  seRejeitar: "A VI altera a chance. OR > 1 desloca para categorias mais altas.",
  seNaoRejeitar: "A VI não altera a chance.",
  pressupostos: ["Observações independentes", "Odds proporcionais (o efeito é o mesmo em todos os cortes)", "Ausência de multicolinearidade"],
  seFalhar: "Odds não proporcionais → modelo multinomial ou categorias agrupadas.",
  efeito: "Odds ratio",
  par: "logistica",
  ler: "Os “thresholds” (cortes) não são efeitos; leia os coeficientes das VIs e exponencie.",
  py: String.raw`import numpy as np
from statsmodels.miscmodels.ordinal_model import OrderedModel

d = df[["Kidhome", "Income", "Age"]].dropna().copy()
d["Income"] = d["Income"] / 1000                      # facilita a convergência
mod = OrderedModel(d["Kidhome"], d[["Income", "Age"]], distr="logit")
res = mod.fit(method="bfgs", disp=False)

print(res.summary())
print("Odds ratio:\n", np.exp(res.params[["Income", "Age"]]))`,
  r: String.raw`library(MASS)

df$Kidhome_o <- factor(df$Kidhome, ordered = TRUE)
m <- polr(Kidhome_o ~ I(Income / 1000) + Age, data = df, Hess = TRUE)
summary(m)
exp(coef(m))                       # odds ratios
exp(confint(m))`,
  jamovi: { menu: "Regression › Logistic Regression › Ordinal Outcomes", passos: [
    "Kidhome (Ordinal) em Dependent Variable; Income e Age em Covariates.",
    "Model Coefficients: Odds ratio e Confidence interval."] },
  jasp: { menu: "Regression › Classical (sem menu nativo estável)", passos: [
    "O JASP não traz regressão ordinal estável nos menus clássicos; use o jamovi, o R ou o Python."],
    aviso: "Sem equivalente confirmado no JASP." }
}

);
