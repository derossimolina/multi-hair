/* Testes de pressupostos: Tabela 7, bloco C.
   Aqui você quer NÃO rejeitar H₀ (exceto no Bartlett). */
window.HAIR = window.HAIR || { tecnicas: [] };

HAIR.tecnicas.push(

{
  id: "shapiro-wilk",
  nome: "Shapiro-Wilk (normalidade)",
  grupo: "pressuposto",
  tags: ["normalidade", "Q-Q plot"],
  gatilho: "“os dados são normais?”",
  paraQue: "Verificar a normalidade dos dados, dos resíduos ou das diferenças.",
  vd: "Métrica", vi: "—",
  pergunta: "O gasto total (MntTotal) tem distribuição normal?",
  h0: "Os dados vêm de uma distribuição normal", h1: "Não vêm",
  h0Texto: "Os dados vêm de uma distribuição normal.",
  seRejeitar: "Não são normais: avalie a alternativa não paramétrica. Com n grande, rejeita por desvios mínimos; olhe o Q-Q plot.",
  seNaoRejeitar: "Pressuposto atendido.",
  pressupostos: ["Amostra de até ~5.000 casos"],
  seFalhar: "Alternativa não paramétrica, transformação da VD ou Q-Q plot para julgar a gravidade.",
  efeito: "—",
  ler: "Sempre acompanhe com o Q-Q plot e a assimetria/curtose: com n grande o teste rejeita por desvios irrelevantes.",
  py: String.raw`from scipy import stats
import matplotlib.pyplot as plt

x = df["MntTotal"]
print(stats.shapiro(x))
print("Assimetria:", round(stats.skew(x), 2), "| Curtose:", round(stats.kurtosis(x), 2))

stats.probplot(x, dist="norm", plot=plt); plt.show()      # Q-Q plot`,
  r: String.raw`shapiro.test(df$MntTotal)
library(moments); skewness(df$MntTotal); kurtosis(df$MntTotal) - 3
qqnorm(df$MntTotal); qqline(df$MntTotal)`,
  jamovi: { menu: "Analyses com Assumption Checks  ·  Exploration › Descriptives", passos: [
    "Dentro de cada teste: Assumption Checks › Normality test (Shapiro-Wilk) e Q-Q plot.",
    "Em Exploration › Descriptives: Statistics › Skewness, Kurtosis, Shapiro-Wilk; Plots › Box plot."] },
  jasp: { menu: "Dentro de cada análise  ·  Descriptives", passos: [
    "Assumption Checks › Normality (Shapiro-Wilk) e Q-Q plot.",
    "Descriptives › Statistics: Skewness, Kurtosis, Shapiro-Wilk."] }
},

{
  id: "levene",
  nome: "Levene (homogeneidade de variâncias)",
  grupo: "pressuposto",
  tags: ["variâncias iguais", "homocedasticidade"],
  gatilho: "“as variâncias dos grupos são iguais?”",
  paraQue: "Verificar se os grupos têm variâncias iguais.",
  vd: "Métrica", vi: "Grupos",
  pergunta: "A variância do gasto total é igual entre os níveis de escolaridade?",
  h0: "σ²₁ = σ²₂ = … = σ²k", h1: "Ao menos uma variância difere",
  h0Texto: "As variâncias dos grupos são iguais (homogeneidade).",
  seRejeitar: "Variâncias diferentes: use Welch e Games-Howell.",
  seNaoRejeitar: "Pressuposto atendido.",
  pressupostos: ["VD métrica"],
  seFalhar: "Welch (t ou ANOVA) e Games-Howell.",
  efeito: "—",
  ler: "Variante de Brown-Forsythe (center=\"median\") é mais robusta à não normalidade.",
  py: String.raw`from scipy import stats

grupos = [g["MntTotal"].values for _, g in df.groupby("Education", observed=True)]
print(stats.levene(*grupos, center="mean"))      # Levene clássico
print(stats.levene(*grupos, center="median"))    # Brown-Forsythe`,
  r: String.raw`library(car)
leveneTest(MntTotal ~ Education, data = df, center = mean)
leveneTest(MntTotal ~ Education, data = df, center = median)   # Brown-Forsythe`,
  jamovi: { menu: "Assumption Checks › Homogeneity test", passos: ["Marque em T-Tests ou ANOVA › Assumption Checks › Homogeneity test."] },
  jasp: { menu: "Assumption Checks › Equality of variances / Homogeneity tests", passos: ["Disponível nos menus de T-Test e ANOVA."] }
},

{
  id: "mauchly",
  nome: "Mauchly (esfericidade)",
  grupo: "pressuposto",
  tags: ["esfericidade", "Greenhouse-Geisser"],
  gatilho: "ANOVA de medidas repetidas",
  paraQue: "Verificar a esfericidade entre medidas repetidas.",
  vd: "Métrica", vi: "3+ medidas repetidas",
  pergunta: "As variâncias das diferenças entre os canais de compra são iguais?",
  h0: "As variâncias das diferenças entre pares de medidas são iguais", h1: "Não são",
  h0Texto: "As variâncias das diferenças entre todos os pares de medidas são iguais.",
  seRejeitar: "Esfericidade violada: use a correção de Greenhouse-Geisser.",
  seNaoRejeitar: "Pressuposto atendido.",
  pressupostos: ["3 ou mais medidas"],
  seFalhar: "Greenhouse-Geisser (ou Huynh-Feldt).",
  efeito: "—",
  ler: "Com apenas 2 medidas não há esfericidade a testar.",
  py: String.raw`import pingouin as pg

canais = ["NumWebPurchases", "NumCatalogPurchases", "NumStorePurchases"]
long = df[["ID"] + canais].melt(id_vars="ID", var_name="canal", value_name="compras")
print(pg.sphericity(long, dv="compras", within="canal", subject="ID", method="mauchly"))`,
  r: String.raw`library(rstatix)
canais <- c("NumWebPurchases", "NumCatalogPurchases", "NumStorePurchases")
long <- tidyr::pivot_longer(df[, c("ID", canais)], cols = all_of(canais), names_to = "canal", values_to = "compras")
long$ID <- factor(long$ID); long$canal <- factor(long$canal)
anova_test(long, dv = compras, wid = ID, within = canal)$"Mauchly's Test for Sphericity"`,
  jamovi: { menu: "ANOVA › Repeated Measures ANOVA › Assumption Checks", passos: ["Sphericity tests e Sphericity corrections (Greenhouse-Geisser)."] },
  jasp: { menu: "ANOVA › Classical › Repeated Measures ANOVA › Assumption Checks", passos: ["Sphericity tests e Sphericity corrections."] }
},

{
  id: "durbin-watson",
  nome: "Durbin-Watson (independência dos resíduos)",
  grupo: "pressuposto",
  tags: ["autocorrelação", "resíduos"],
  gatilho: "regressão: resíduos independentes?",
  paraQue: "Verificar se os resíduos da regressão são independentes.",
  vd: "Métrica", vi: "—",
  pergunta: "Os resíduos da regressão do gasto total são independentes?",
  h0: "Os resíduos não são autocorrelacionados", h1: "Há autocorrelação",
  h0Texto: "Os resíduos não são autocorrelacionados.",
  seRejeitar: "Há autocorrelação, comum em séries temporais.",
  seNaoRejeitar: "Pressuposto atendido (estatística perto de 2).",
  pressupostos: ["Casos em ordem relevante (tempo)"],
  seFalhar: "Modelos para séries temporais ou erros robustos.",
  efeito: "Estatística d (perto de 2)",
  ler: "Perto de 2 = sem autocorrelação; perto de 0 = positiva; perto de 4 = negativa.",
  py: String.raw`import statsmodels.formula.api as smf
from statsmodels.stats.stattools import durbin_watson

m = smf.ols("MntTotal ~ Income + Age + Recency", data=df.dropna(subset=["Income"])).fit()
print("Durbin-Watson:", round(durbin_watson(m.resid), 3))`,
  r: String.raw`library(lmtest)
m <- lm(MntTotal ~ Income + Age + Recency, data = df)
dwtest(m)`,
  jamovi: { menu: "Regression › Linear Regression › Assumption Checks", passos: ["Autocorrelation test (Durbin-Watson)."] },
  jasp: { menu: "Regression › Classical › Linear Regression › Statistics", passos: ["Residuals: Statistics › Durbin-Watson."] }
},

{
  id: "box-m",
  nome: "Box's M (matrizes de covariância)",
  grupo: "pressuposto",
  tags: ["MANOVA", "covariâncias"],
  gatilho: "MANOVA: covariâncias iguais?",
  paraQue: "Verificar se as matrizes de covariância são iguais entre os grupos (MANOVA).",
  vd: "Várias métricas", vi: "Grupos",
  pergunta: "As matrizes de covariância dos gastos são iguais entre os níveis de escolaridade?",
  h0: "As matrizes de covariância são iguais", h1: "Diferem",
  h0Texto: "As matrizes de covariância são iguais.",
  seRejeitar: "Matrizes diferentes (use p < 0,001 como critério): reporte o traço de Pillai.",
  seNaoRejeitar: "Pressuposto atendido.",
  pressupostos: ["Normalidade multivariada (o teste é sensível a ela)"],
  seFalhar: "Pillai.",
  efeito: "—",
  ler: "O Box's M é muito sensível: por isso o critério é p < 0,001.",
  py: String.raw`import pingouin as pg
print(pg.box_m(df, dvs=["MntWines", "MntMeatProducts", "MntFruits"], group="Education"))`,
  r: String.raw`library(biotools)
boxM(df[, c("MntWines", "MntMeatProducts", "MntFruits")], df$Education)`,
  jamovi: { menu: "ANOVA › MANCOVA › Assumption Checks", passos: ["Box's M test."] },
  jasp: { menu: "ANOVA › Classical › MANOVA › Assumption checks", passos: ["Box's M test."] }
},

{
  id: "bartlett-kmo",
  nome: "Bartlett (esfericidade) e KMO",
  grupo: "pressuposto",
  tags: ["AFE", "adequação", "MSA"],
  gatilho: "a AFE é adequada?",
  paraQue: "Verificar se as variáveis são correlacionadas o suficiente para uma AFE.",
  vd: "Nenhuma", vi: "Variáveis métricas",
  pergunta: "Os gastos por categoria se correlacionam o suficiente para fatorar?",
  h0: "A matriz de correlação é identidade", h1: "Há correlação",
  h0Texto: "A matriz de correlação é identidade: as variáveis não se correlacionam.",
  seRejeitar: "É o resultado desejado: há correlação suficiente para fatorar.",
  seNaoRejeitar: "A AFE não é adequada.",
  pressupostos: ["Variáveis métricas"],
  seFalhar: "Remova itens com MSA < 0,50.",
  efeito: "KMO ≥ 0,50 (≥ 0,70 bom)",
  ler: "Bartlett é o único teste de pressuposto em que você quer REJEITAR H₀.",
  py: String.raw`from factor_analyzer.factor_analyzer import calculate_bartlett_sphericity, calculate_kmo

itens = ["MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts", "MntGoldProds"]
X = df[itens].dropna()
print(calculate_bartlett_sphericity(X))          # (χ², p)
msa, kmo = calculate_kmo(X); print("KMO:", round(kmo, 3), "| MSA:", msa.round(2))`,
  r: String.raw`library(psych)
itens <- c("MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts", "MntGoldProds")
X <- na.omit(df[, itens])
cortest.bartlett(cor(X), n = nrow(X)); KMO(X)`,
  jamovi: { menu: "Factor › Exploratory Factor Analysis › Assumption Checks", passos: ["Bartlett's test of sphericity e KMO."] },
  jasp: { menu: "Factor › Classical › Exploratory Factor Analysis › Assumption checks", passos: ["Bartlett's test e KMO."] }
}

);
