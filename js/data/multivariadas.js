/* Técnicas multivariadas: Tabelas 1 e 6 do guia (diagrama do Hair). */
window.HAIR = window.HAIR || { tecnicas: [] };

HAIR.tecnicas.push(

/* ───────────── Dependência: uma VD ───────────── */
{
  id: "regressao-multipla",
  nome: "Regressão linear múltipla",
  grupo: "dependencia",
  tags: ["MQO", "R²", "beta padronizado", "VIF"],
  gatilho: "“em que medida… contribuem para explicar”",
  paraQue: "Verificar se um conjunto de VIs explica uma VD métrica e quanto cada uma contribui.",
  vd: "Métrica", vi: "Métricas (categóricas viram dummies)",
  pergunta: "Em que medida renda, idade, recência, filhos pequenos e escolaridade explicam o gasto total (MntTotal)?",
  h0: "β₁ = … = βk = 0 (R² = 0)", h1: "Ao menos um βj ≠ 0",
  h0Texto: "Nenhuma VI explica a VD; o R² na população é zero. Em cada VI (teste t): βj = 0 quando as demais são mantidas constantes.",
  seRejeitar: "O modelo explica parte da variação da VD (R² ajustado mostra quanto). A VI contribui; o beta padronizado permite comparar com as outras.",
  seNaoRejeitar: "O modelo não explica a VD melhor que a média / a VI não contribui além das demais.",
  pressupostos: ["Linearidade", "Normalidade dos resíduos", "Homocedasticidade", "Independência dos resíduos", "Ausência de multicolinearidade", "Sem outliers influentes", "Amostra: mínimo 5, ideal 15 a 20 casos por VI"],
  seFalhar: "Transformar a VD (ex.: log do gasto) ou usar intervalos por bootstrap; não há equivalente não paramétrico direto nos menus do jamovi.",
  efeito: "R² ajustado · beta padronizado",
  criterios: ["F com p < 0,05: o modelo explica", "VIF < 10 (ideal < 5); tolerância > 0,10", "Durbin-Watson perto de 2", "Resíduos sem formato de funil", "Cook > 1: caso influente", "Compare as VIs pelo beta padronizado"],
  ler: "Reporte R² ajustado, F(gl1, gl2), p, e para cada VI o coeficiente, o IC e o beta padronizado. Compare as VIs pelo beta padronizado, não pelo coeficiente bruto.",
  py: String.raw`import numpy as np
import statsmodels.formula.api as smf
from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.stats.stattools import durbin_watson
from scipy import stats

d = df.dropna(subset=["Income"]).copy()
m = smf.ols("MntTotal ~ Income + Age + Recency + Kidhome + C(Education)", data=d).fit()
print(m.summary())                                   # R², R² ajustado, F, coeficientes, ICs

# Beta padronizado: reestime com VD e VIs métricas em escore z
z = d[["MntTotal", "Income", "Age", "Recency", "Kidhome"]].apply(stats.zscore)
z["Education"] = d["Education"].astype(str)
print(smf.ols("MntTotal ~ Income + Age + Recency + Kidhome + C(Education)", data=z).fit().params.round(3))

# Pressupostos
X = m.model.exog
vif = {n: variance_inflation_factor(X, i) for i, n in enumerate(m.model.exog_names) if n != "Intercept"}
print("VIF:", {k: round(v, 2) for k, v in vif.items()})
print("Durbin-Watson:", round(durbin_watson(m.resid), 3))
print("Shapiro dos resíduos:", stats.shapiro(m.resid))
cook = m.get_influence().cooks_distance[0]
print("Casos com Cook > 1:", int((cook > 1).sum()))`,
  r: String.raw`library(car); library(lm.beta); library(lmtest)

m <- lm(MntTotal ~ Income + Age + Recency + Kidhome + Education, data = df)
summary(m)                    # R², R² ajustado, F, coeficientes
confint(m)
lm.beta(m)                    # betas padronizados

# Pressupostos
vif(m)                        # multicolinearidade
dwtest(m)                     # Durbin-Watson
shapiro.test(residuals(m))
bptest(m)                     # Breusch-Pagan (homocedasticidade)
sum(cooks.distance(m) > 1, na.rm = TRUE)
par(mfrow = c(2, 2)); plot(m)   # resíduos × ajustados, Q-Q, Cook`,
  jamovi: { menu: "Regression › Linear Regression", passos: [
    "MntTotal em Dependent Variable; Income, Age, Recency, Kidhome em Covariates; Education em Factors.",
    "Model Fit: R², Adjusted R², F test.",
    "Model Coefficients: Standardized estimate, Confidence interval.",
    "Assumption Checks: Autocorrelation test, Collinearity statistics, Normality test, Q-Q plot of residuals, Residual plots, Cook's distance."] },
  jasp: { menu: "Regression › Classical › Linear Regression", passos: [
    "MntTotal em Dependent Variable; métricas em Covariates; Education em Factors.",
    "Statistics: Estimates, Model fit, Collinearity diagnostics, Durbin-Watson.",
    "Plots: Residuals vs. fitted, Q-Q plot standardized residuals; Casewise diagnostics: Cook's distance."] }
},

{
  id: "logistica",
  nome: "Regressão logística binária",
  grupo: "dependencia",
  tags: ["odds ratio", "AUC", "ROC", "probabilidade de"],
  gatilho: "“probabilidade de…”, VD sim/não",
  paraQue: "Verificar se as VIs, juntas, preveem uma VD dicotômica e quanto cada uma altera a chance.",
  vd: "Binária (não métrica)", vi: "Métricas e/ou categóricas",
  pergunta: "Qual a probabilidade de o cliente responder à campanha (Response), dados renda, recência e escolaridade?",
  h0: "Todos os β = 0 (OR = 1)", h1: "Ao menos um β ≠ 0",
  h0Texto: "O modelo com as VIs não prevê melhor que um modelo sem nenhuma VI (só o intercepto). Em cada VI (Wald): β = 0, ou seja, a VI não altera a chance.",
  seRejeitar: "As VIs ajudam a prever a chance do evento. Para cada VI: OR > 1 aumenta, OR < 1 reduz a chance.",
  seNaoRejeitar: "O modelo não melhora a previsão / a VI não altera a chance.",
  pressupostos: ["VD dicotômica", "Observações independentes", "Ausência de multicolinearidade", "Linearidade entre VIs métricas e o logit", "Amostra: 10 casos do grupo menor por VI", "Não exige normalidade nem homocedasticidade"],
  seFalhar: "Colapsar categorias raras, remover VIs colineares; logística já dispensa normalidade.",
  efeito: "Odds ratio · AUC",
  criterios: ["Teste do modelo com p < 0,05", "OR > 1 aumenta a chance; OR < 1 reduz", "AUC ≥ 0,70 aceitável", "Compare a acurácia com a proporção da classe maior (o “acerto por acaso”)"],
  ler: "Defina o nível de referência da VD (qual categoria é “sucesso”). Compare a acurácia com a proporção da classe maior: acurácia de 85% não impressiona se 85% já são “não”.",
  py: String.raw`import numpy as np
import statsmodels.formula.api as smf
from sklearn.metrics import roc_auc_score, confusion_matrix

d = df.dropna(subset=["Income"]).copy()
d["Income_k"] = d["Income"] / 1000
m = smf.logit("Response ~ Income_k + Recency + C(Education)", data=d).fit(disp=False)
print(m.summary())

# Teste do modelo (razão de verossimilhança) e pseudo-R²
print("LR χ² =", round(m.llr, 2), "p =", round(m.llr_pvalue, 4))
n, ll1, ll0 = m.nobs, m.llf, m.llnull
nagelkerke = (1 - np.exp((2 / n) * (ll0 - ll1))) / (1 - np.exp((2 / n) * ll0))
print("McFadden:", round(m.prsquared, 3), "| Nagelkerke:", round(nagelkerke, 3))

# Odds ratio e IC
ic = np.exp(m.conf_int()); ic["OR"] = np.exp(m.params)
print(ic.round(3))

# Desempenho
p = m.predict(d)
print("AUC:", round(roc_auc_score(d["Response"], p), 3))
pred = (p >= 0.5).astype(int)
print(confusion_matrix(d["Response"], pred))
print("Acurácia:", round((pred == d["Response"]).mean(), 3),
      "| Acerto por acaso (classe maior):", round(d["Response"].value_counts(normalize=True).max(), 3))`,
  r: String.raw`library(pROC); library(DescTools); library(car)

d <- na.omit(df[, c("Response", "Income", "Recency", "Education")])
d$Income_k <- d$Income / 1000
m <- glm(Response ~ Income_k + Recency + Education, data = d, family = binomial)
summary(m)

# Teste do modelo (razão de verossimilhança) e pseudo-R²
anova(update(m, . ~ 1), m, test = "Chisq")
PseudoR2(m, which = c("McFadden", "Nagelkerke"))

# Odds ratio e IC
exp(cbind(OR = coef(m), confint(m)))
vif(m)

# Desempenho
p <- predict(m, type = "response")
auc(roc(d$Response, p))
tab <- table(Observado = d$Response, Previsto = p >= 0.5); tab
sum(diag(tab)) / sum(tab)                     # acurácia
max(prop.table(table(d$Response)))            # acerto por acaso`,
  jamovi: { menu: "Regression › Logistic Regression › 2 Outcomes", passos: [
    "Response (Nominal) em Dependent Variable; Income e Recency em Covariates; Education em Factors. Defina o nível de referência.",
    "Model Fit: Overall model test, Deviance, AIC, Nagelkerke's R², McFadden's R².",
    "Model Coefficients: Odds ratio, Confidence interval.",
    "Prediction: Classification table, Accuracy, Sensitivity, Specificity, AUC, ROC curve.",
    "Assumption Checks: Collinearity statistics."] },
  jasp: { menu: "Regression › Classical › Logistic Regression", passos: [
    "Response em Dependent Variable; Income e Recency em Covariates; Education em Factors.",
    "Statistics: Estimates com Odds ratios, Model summary (Nagelkerke, McFadden), Performance diagnostics (confusion matrix, AUC).",
    "Plots: ROC curve; Assumption checks: Multicollinearity."] }
},

{
  id: "discriminante",
  nome: "Análise discriminante múltipla",
  grupo: "dependencia",
  tags: ["LDA", "classificar em grupos", "função discriminante"],
  gatilho: "“classificar em grupos”, “o que discrimina”",
  paraQue: "Classificar casos em grupos e identificar quais variáveis métricas discriminam os grupos.",
  vd: "Não métrica (2+ grupos)", vi: "Métricas, com normalidade multivariada",
  pergunta: "Quais variáveis métricas discriminam os grupos de escolaridade (Education)?",
  h0: "As médias dos grupos nas funções discriminantes são iguais", h1: "Os grupos diferem",
  h0Texto: "Os grupos não se separam pelas VIs métricas.",
  seRejeitar: "As VIs discriminam os grupos; veja as cargas da função e a taxa de acerto.",
  seNaoRejeitar: "Os grupos não se distinguem pelas VIs.",
  pressupostos: ["Normalidade multivariada", "Matrizes de covariância iguais entre grupos (Box's M)", "Ausência de multicolinearidade", "Amostra: ≥ 20 casos por grupo e 5 por variável"],
  seFalhar: "Violando a normalidade → regressão logística (multinomial).",
  efeito: "Taxa de acerto vs. acerto por acaso",
  ler: "Compare a taxa de acerto (de preferência com validação cruzada) com o acerto por acaso (proporção da maior classe). O guia do jamovi não traz esse menu nos módulos básicos.",
  py: String.raw`from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
import pandas as pd

vis = ["MntTotal", "Income", "Age", "Recency", "NumWebVisitsMonth"]
d = df.dropna(subset=vis + ["Education"])
X, y = d[vis], d["Education"].astype(str)

modelo = make_pipeline(StandardScaler(), LDA())
acc = cross_val_score(modelo, X, y, cv=5)
print("Acurácia (validação cruzada 5x):", acc.mean().round(3),
      "| acerto por acaso:", y.value_counts(normalize=True).max().round(3))

modelo.fit(X, y)
lda = modelo[-1]
print("Variância explicada pelas funções:", lda.explained_variance_ratio_.round(3))
print(pd.DataFrame(lda.scalings_[:, :2], index=vis, columns=["F1", "F2"]).round(3))`,
  r: String.raw`library(MASS); library(biotools)

vis <- c("MntTotal", "Income", "Age", "Recency", "NumWebVisitsMonth")
d <- na.omit(df[, c("Education", vis)])
d$Education <- factor(d$Education, ordered = FALSE)

boxM(d[, vis], d$Education)                     # homogeneidade das covariâncias
m <- lda(Education ~ ., data = d, CV = FALSE)
m                                                # funções discriminantes
mcv <- lda(Education ~ ., data = d, CV = TRUE)   # validação cruzada (leave-one-out)
mean(mcv$class == d$Education)                   # acurácia
max(prop.table(table(d$Education)))              # acerto por acaso`,
  jamovi: { menu: "Sem menu nos módulos básicos", passos: [
    "O guia indica que discriminante não está nos menus básicos do jamovi.",
    "Use o Rj Editor (R dentro do jamovi) ou Python/R fora dele."],
    aviso: "Conforme o guia (Tabela 6)." },
  jasp: { menu: "Machine Learning › Classification › Linear Discriminant", passos: [
    "Target: Education; Features: as variáveis métricas.",
    "Ative Confusion matrix e a validação (k-fold)."],
    aviso: "O módulo Machine Learning precisa estar ativado em “+” no JASP." }
},

/* ───────────── Dependência: várias VDs ───────────── */
{
  id: "manova",
  nome: "MANOVA",
  grupo: "dependencia",
  tags: ["Pillai", "Wilks", "Box's M", "várias VDs"],
  gatilho: "“grupos diferem em várias médias ao mesmo tempo”",
  paraQue: "Comparar grupos em várias VDs métricas ao mesmo tempo.",
  vd: "Várias métricas", vi: "Não métrica (grupos)",
  pergunta: "Os grupos de escolaridade diferem, em conjunto, nos gastos com vinhos, carnes e frutas?",
  h0: "Os vetores de médias das VDs são iguais entre os grupos", h1: "Ao menos um grupo difere em alguma VD",
  h0Texto: "Os grupos não diferem no conjunto das VDs (vetores de médias iguais).",
  seRejeitar: "Os grupos diferem em pelo menos uma combinação de VDs; siga para as ANOVAs.",
  seNaoRejeitar: "Não há evidência de diferença.",
  pressupostos: ["Normalidade multivariada", "Homogeneidade das matrizes de covariância (Box's M)", "Independência", "VDs moderadamente correlacionadas", "Cada grupo com mais casos do que o número de VDs"],
  seFalhar: "Box's M com p < 0,001 → reporte o traço de Pillai (mais robusto).",
  efeito: "η² parcial multivariado",
  criterios: ["Box's M com p > 0,001; se falhar, reporte o traço de Pillai"],
  ler: "Reporte Pillai (ou Wilks), F aproximado, gl e p. Se significativa, rode as ANOVAs univariadas e o post hoc.",
  py: String.raw`import pingouin as pg
from statsmodels.multivariate.manova import MANOVA

vds = ["MntWines", "MntMeatProducts", "MntFruits"]
print(pg.box_m(df, dvs=vds, group="Education"))          # Box's M (use p < 0,001 como critério)

m = MANOVA.from_formula("MntWines + MntMeatProducts + MntFruits ~ C(Education)", data=df)
print(m.mv_test())                                       # Wilks, Pillai, Hotelling, Roy`,
  r: String.raw`library(biotools); library(rstatix)

vds <- c("MntWines", "MntMeatProducts", "MntFruits")
boxM(df[, vds], df$Education)

m <- manova(cbind(MntWines, MntMeatProducts, MntFruits) ~ Education, data = df)
summary(m, test = "Pillai")
summary(m, test = "Wilks")
summary.aov(m)                    # ANOVAs univariadas`,
  jamovi: { menu: "ANOVA › MANCOVA", passos: [
    "Dependent Variables: MntWines, MntMeatProducts, MntFruits; Fixed Factors: Education.",
    "Multivariate Statistics: Pillai's trace, Wilks' lambda.",
    "Assumption Checks: Box's M test, Shapiro-Wilk multivariate normality, Q-Q plot."] },
  jasp: { menu: "ANOVA › Classical › MANOVA", passos: [
    "Dependent Variables: as três VDs; Fixed Factors: Education.",
    "Model: Pillai e Wilks. Assumption checks: Box's M e Shapiro-Wilk."] }
},

{
  id: "correlacao-canonica",
  nome: "Correlação canônica",
  grupo: "dependencia",
  tags: ["dois conjuntos", "variados canônicas"],
  gatilho: "“relação entre dois conjuntos de variáveis”",
  paraQue: "Medir a relação entre dois conjuntos de variáveis métricas.",
  vd: "Várias métricas", vi: "Várias métricas",
  pergunta: "O conjunto (renda, idade, recência) se relaciona com o conjunto de gastos (vinhos, carnes, frutas)?",
  h0: "Todas as correlações canônicas = 0", h1: "Ao menos uma correlação canônica ≠ 0",
  h0Texto: "Os dois conjuntos não estão relacionados.",
  seRejeitar: "Há relação entre os conjuntos; veja as cargas canônicas.",
  seNaoRejeitar: "Não há evidência de relação.",
  pressupostos: ["Linearidade", "Normalidade multivariada", "Ausência de multicolinearidade dentro de cada conjunto"],
  seFalhar: "—",
  efeito: "Correlações canônicas (e redundância)",
  ler: "Teste cada função em sequência (Wilks): a primeira inclui todas; as seguintes removem as já testadas.",
  py: String.raw`import numpy as np
from scipy import stats
from sklearn.cross_decomposition import CCA
from sklearn.preprocessing import StandardScaler

X_cols = ["Income", "Age", "Recency"]
Y_cols = ["MntWines", "MntMeatProducts", "MntFruits"]
d = df.dropna(subset=X_cols + Y_cols)
X = StandardScaler().fit_transform(d[X_cols]); Y = StandardScaler().fit_transform(d[Y_cols])

k = min(len(X_cols), len(Y_cols))
cca = CCA(n_components=k).fit(X, Y)
U, V = cca.transform(X, Y)
r = np.array([np.corrcoef(U[:, i], V[:, i])[0, 1] for i in range(k)])
print("Correlações canônicas:", r.round(3))

# Teste de Wilks por função (aproximação qui-quadrado de Bartlett)
n, p, q = len(d), len(X_cols), len(Y_cols)
for i in range(k):
    lam = np.prod(1 - r[i:] ** 2)
    chi2 = -(n - 1 - (p + q + 1) / 2) * np.log(lam)
    gl = (p - i) * (q - i)
    print(f"Função {i+1}: Wilks = {lam:.3f}, χ²({gl}) = {chi2:.2f}, p = {stats.chi2.sf(chi2, gl):.4g}")`,
  r: String.raw`library(CCA); library(CCP)

X <- scale(df[, c("Income", "Age", "Recency")])
Y <- scale(df[, c("MntWines", "MntMeatProducts", "MntFruits")])
ok <- complete.cases(X, Y); X <- X[ok, ]; Y <- Y[ok, ]

cc_res <- cc(X, Y)
cc_res$cor                                            # correlações canônicas
rho <- cc_res$cor; N <- nrow(X); p <- ncol(X); q <- ncol(Y)
p.asym(rho, N, p, q, tstat = "Wilks")                 # testes por função`,
  jamovi: { menu: "Sem menu nos módulos básicos", passos: [
    "Segundo o guia, correlação canônica não está nos menus básicos. Use o Rj Editor ou Python/R."],
    aviso: "Conforme o guia (Tabela 6)." },
  jasp: { menu: "Sem menu nativo", passos: ["Use Python ou R (veja as abas anteriores)."],
    aviso: "Sem equivalente nos menus padrão." }
},

{
  id: "sem",
  nome: "Modelagem de equações estruturais (SEM)",
  grupo: "dependencia",
  tags: ["mediação", "construtos latentes", "CFA", "lavaan"],
  gatilho: "“modelo teórico”, “mediação”, “construtos”",
  paraQue: "Testar um modelo teórico com múltiplas relações encadeadas, incluindo construtos latentes e mediação.",
  vd: "Várias, encadeadas", vi: "Métricas (construtos latentes)",
  pergunta: "A renda influencia o gasto total diretamente e por meio das compras na web (mediação)?",
  h0: "O modelo reproduz a matriz de covariâncias; efeito indireto = 0", h1: "O efeito indireto ≠ 0",
  h0Texto: "O efeito indireto (a·b) é zero; no ajuste global, o modelo se ajusta perfeitamente à população.",
  seRejeitar: "Existe mediação; veja se o efeito direto também permanece (mediação parcial).",
  seNaoRejeitar: "Não há evidência do efeito indireto.",
  pressupostos: ["Amostra grande (≥ 200 em geral)", "Normalidade multivariada (para ML)", "Modelo identificado", "Ausência de multicolinearidade"],
  seFalhar: "Estimador robusto (MLR) ou bootstrap para o efeito indireto.",
  efeito: "Efeito indireto · CFI, TLI, RMSEA, SRMR",
  criterios: ["CFI e TLI ≥ 0,90 (ideal ≥ 0,95)", "RMSEA ≤ 0,08 (ideal ≤ 0,06)", "SRMR ≤ 0,08"],
  ler: "Dois momentos: (1) ajuste global do modelo; (2) coeficientes das trajetórias. Efeito indireto por bootstrap, não pelo teste de Sobel.",
  py: String.raw`import numpy as np
import semopy

d = df.dropna(subset=["Income"]).copy()
d["Income_k"] = d["Income"] / 1000
modelo = """
NumWebPurchases ~ Income_k
MntTotal ~ NumWebPurchases + Income_k
"""
m = semopy.Model(modelo)
m.fit(d[["Income_k", "NumWebPurchases", "MntTotal"]])
est = m.inspect()
print(est)

a = est.query("lval=='NumWebPurchases' and rval=='Income_k'")["Estimate"].iloc[0]
b = est.query("lval=='MntTotal' and rval=='NumWebPurchases'")["Estimate"].iloc[0]
print("Efeito indireto (a·b) =", round(a * b, 3))
print(semopy.calc_stats(m).T)        # CFI, TLI, RMSEA etc. (modelo saturado: ajuste trivial)`,
  r: String.raw`library(lavaan)

df$Income_k <- df$Income / 1000
modelo <- '
  NumWebPurchases ~ a * Income_k
  MntTotal        ~ b * NumWebPurchases + c * Income_k
  indireto := a * b
  total    := c + a * b
'
fit <- sem(modelo, data = df, se = "bootstrap", bootstrap = 1000)
summary(fit, fit.measures = TRUE, standardized = TRUE)
parameterEstimates(fit, boot.ci.type = "perc", standardized = TRUE)

# Construtos latentes (CFA): exemplo com itens de compra
# cfa('canal =~ NumWebPurchases + NumCatalogPurchases + NumStorePurchases', data = df)`,
  jamovi: { menu: "SEMLj (módulo)  ·  Modules › jamovi library", passos: [
    "Instale o módulo SEMLj pelo botão Modules › jamovi library.",
    "Em SEM › Path Analysis (ou Latent variables) defina as relações.",
    "Mediação: o módulo MedMod faz o caso simples."],
    aviso: "Conforme o guia (Tabela 6): SEM exige módulo." },
  jasp: { menu: "SEM › Structural Equation Modeling", passos: [
    "Ative o módulo SEM em “+”. Escreva o modelo na sintaxe lavaan (a mesma da aba R).",
    "Options: Bootstrap para o efeito indireto; Output: Fit measures."] }
},

/* ───────────── Interdependência ───────────── */
{
  id: "afe",
  nome: "Análise fatorial exploratória (AFE)",
  grupo: "interdependencia",
  tags: ["fatores", "KMO", "Bartlett", "cargas", "dimensões"],
  gatilho: "“conjunto menor de dimensões”, “fatores”",
  paraQue: "Identificar dimensões latentes que resumem um conjunto de variáveis métricas.",
  vd: "Nenhuma", vi: "Variáveis métricas (estrutura entre variáveis)",
  pergunta: "Os gastos por categoria e as compras por canal se resumem a poucas dimensões?",
  h0: "(Bartlett) A matriz de correlação é identidade", h1: "Há correlação suficiente para fatorar",
  h0Texto: "A AFE em si não testa uma hipótese sobre as dimensões. Bartlett: a matriz de correlação é identidade, as variáveis não se correlacionam (aqui você quer rejeitar).",
  seRejeitar: "Bartlett significativo é o resultado desejado: há correlação suficiente para fatorar.",
  seNaoRejeitar: "A AFE não é adequada.",
  pressupostos: ["Variáveis métricas", "Correlações suficientes (várias acima de 0,30)", "Amostra ≥ 100 e de 5 a 10 casos por variável", "Sem outliers extremos", "Normalidade só importa na extração por máxima verossimilhança"],
  seFalhar: "Remover itens com MSA < 0,50; itens ordinais → matriz policórica.",
  efeito: "Variância explicada · cargas · comunalidades",
  criterios: ["KMO ≥ 0,50 (≥ 0,70 bom); MSA de cada item ≥ 0,50", "Bartlett com p < 0,05", "Carga ≥ 0,50 significativa na prática (0,30 é o mínimo)", "Comunalidade ≥ 0,50 (comunalidade = 1 − uniqueness)", "Sem cargas cruzadas fortes; nomeie cada fator"],
  ler: "Ordem: (1) adequação (KMO, Bartlett); (2) número de fatores (análise paralela ou autovalor); (3) rotação (varimax se ortogonal; oblimin/promax se os fatores se correlacionam); (4) cargas, comunalidades e nome de cada fator. Depois, confiabilidade.",
  py: String.raw`import numpy as np
import pandas as pd
from statsmodels.multivariate.factor import Factor
from factor_analyzer.factor_analyzer import calculate_bartlett_sphericity, calculate_kmo

itens = ["MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts",
         "MntGoldProds", "NumWebPurchases", "NumCatalogPurchases", "NumStorePurchases"]
X = df[itens].dropna()

# 1) Adequação
chi2, p = calculate_bartlett_sphericity(X)
msa, kmo = calculate_kmo(X)
print(f"Bartlett: χ² = {chi2:.1f}, p = {p:.4g} | KMO = {kmo:.3f}")
print("MSA por item:", dict(zip(itens, np.round(msa, 2))))

# 2) Número de fatores: autovalores e análise paralela simples
R = np.corrcoef(X, rowvar=False)
autoval = np.sort(np.linalg.eigvalsh(R))[::-1]
rng = np.random.default_rng(1)
sim = np.mean([np.sort(np.linalg.eigvalsh(np.corrcoef(rng.normal(size=X.shape), rowvar=False)))[::-1]
               for _ in range(100)], axis=0)
print("Autovalores observados:", autoval.round(2))
print("Fatores a reter (análise paralela):", int((autoval > sim).sum()))

# 3) Extração (eixos principais) e rotação (use "varimax" se quiser ortogonal)
res = Factor(X, n_factor=2, method="pa").fit()
res.rotate("oblimin")
cargas = pd.DataFrame(res.loadings, index=itens, columns=["F1", "F2"]).round(2)
cargas["comunalidade"] = (1 - res.uniqueness).round(2)        # comunalidade = 1 − uniqueness
print(cargas)
# Dica: pip install factor_analyzer só para KMO/Bartlett; o ajuste do FactorAnalyzer
# pode falhar com versões muito novas do scikit-learn.`,
  r: String.raw`library(psych)

itens <- c("MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts",
           "MntGoldProds", "NumWebPurchases", "NumCatalogPurchases", "NumStorePurchases")
X <- na.omit(df[, itens])

# 1) Adequação
cortest.bartlett(cor(X), n = nrow(X))
KMO(X)                                   # KMO geral e MSA por item

# 2) Número de fatores
fa.parallel(X, fa = "fa", fm = "minres")
scree(X)

# 3) Extração e rotação (use "varimax" para ortogonal)
fa <- fa(X, nfactors = 2, fm = "minres", rotate = "oblimin")
print(fa$loadings, cutoff = 0.3, sort = TRUE)
fa$communality
fa$Phi                                   # correlação entre fatores`,
  jamovi: { menu: "Factor › Exploratory Factor Analysis", passos: [
    "Mova as nove variáveis para a caixa de variáveis.",
    "Method: Extraction (Minimum residual ou Principal axis); Rotation (Varimax = ortogonal; Oblimin/Promax = oblíqua).",
    "Number of Factors: Based on parallel analysis (ou eigenvalue).",
    "Assumption Checks: Bartlett's test of sphericity, KMO.",
    "Factor Loadings: Hide loadings below 0.3, Sort loadings.",
    "Additional Output: Factor summary, Factor correlations, Initial eigenvalues, Scree plot."] },
  jasp: { menu: "Factor › Classical › Exploratory Factor Analysis", passos: [
    "Variables: as nove variáveis. Number of Factors: Parallel analysis.",
    "Rotation: oblimin ou varimax; Assumption checks: Bartlett's test e KMO.",
    "Output options: Factor loadings (corte 0,3), Path diagram, Scree plot."] }
},

{
  id: "pca",
  nome: "Análise de componentes principais (PCA)",
  grupo: "interdependencia",
  tags: ["redução de dados", "variância total", "componentes"],
  gatilho: "reduzir dados (e não buscar fatores latentes)",
  paraQue: "Reduzir um conjunto de variáveis a poucos componentes, preservando a variância total.",
  vd: "Nenhuma", vi: "Variáveis métricas",
  pergunta: "É possível resumir os gastos por categoria em poucos componentes?",
  h0: "(Bartlett) A matriz de correlação é identidade", h1: "Há correlação suficiente",
  h0Texto: "Bartlett, como na AFE: as variáveis não se correlacionam.",
  seRejeitar: "Resultado desejado: há correlação para reduzir.",
  seNaoRejeitar: "A redução não é adequada.",
  pressupostos: ["Os mesmos da AFE"],
  seFalhar: "—",
  efeito: "Variância explicada",
  ler: "Use PCA quando o objetivo é só reduzir dados (variância total). A AFE busca fatores latentes (variância comum).",
  py: String.raw`import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

itens = ["MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts", "MntGoldProds"]
X = StandardScaler().fit_transform(df[itens].dropna())

pca = PCA().fit(X)
print("Variância explicada:", pca.explained_variance_ratio_.round(3))
print("Autovalores:", pca.explained_variance_.round(2))        # critério de Kaiser: > 1
cargas = pd.DataFrame(pca.components_[:2].T * (pca.explained_variance_[:2] ** 0.5),
                      index=itens, columns=["PC1", "PC2"]).round(2)
print(cargas)`,
  r: String.raw`library(psych)

itens <- c("MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts", "MntGoldProds")
X <- na.omit(df[, itens])
cortest.bartlett(cor(X), n = nrow(X)); KMO(X)

p <- principal(X, nfactors = 2, rotate = "varimax")
print(p$loadings, cutoff = 0.3)
p$values                         # autovalores`,
  jamovi: { menu: "Factor › Principal Component Analysis", passos: [
    "Mesmas opções da AFE (rotação, número de componentes, Bartlett e KMO)."] },
  jasp: { menu: "Factor › Classical › Principal Component Analysis", passos: [
    "Variables: os itens. Number of components: parallel analysis ou eigenvalue.", "Assumption checks: Bartlett e KMO."] }
},

{
  id: "confiabilidade",
  nome: "Confiabilidade (alfa de Cronbach e ômega)",
  grupo: "interdependencia",
  tags: ["alfa", "ômega", "escala", "consistência interna"],
  gatilho: "depois da AFE: os itens do fator formam uma escala consistente?",
  paraQue: "Avaliar a consistência interna dos itens de um mesmo fator.",
  vd: "Nenhuma", vi: "Itens do mesmo fator, na mesma direção",
  pergunta: "Os gastos por categoria formam uma escala consistente de “propensão a gastar”?",
  h0: "Não há teste de hipótese", h1: "—",
  h0Texto: "Não há teste de hipótese: é uma medida de consistência.",
  seRejeitar: "—", seNaoRejeitar: "—",
  pressupostos: ["Itens do mesmo fator, na mesma direção (inverta os itens negativos)"],
  seFalhar: "Veja “if item dropped” para identificar itens que derrubam o alfa.",
  efeito: "α e ω",
  criterios: ["α ≥ 0,70 (0,60 aceitável em estudo exploratório)"],
  ler: "α alto não prova unidimensionalidade; faça a AFE primeiro. Prefira ω quando as cargas forem desiguais.",
  py: String.raw`import pingouin as pg

itens = ["MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts", "MntGoldProds"]
alfa, ic = pg.cronbach_alpha(data=df[itens].dropna())
print(f"α = {alfa:.3f}, IC95% = {ic}")

# α se o item for excluído
for item in itens:
    a, _ = pg.cronbach_alpha(data=df[[i for i in itens if i != item]].dropna())
    print(f"sem {item}: α = {a:.3f}")
# McDonald's ω: use psych::omega no R ou o jamovi.`,
  r: String.raw`library(psych)

itens <- c("MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts", "MntGoldProds")
alpha(df[, itens])              # α, α se o item for excluído, correlação item-total
omega(df[, itens], nfactors = 1)`,
  jamovi: { menu: "Factor › Reliability Analysis", passos: [
    "Mova os itens do fator. Scale Statistics: Cronbach's α, McDonald's ω.",
    "Item Statistics: Reliability statistics (if item dropped).",
    "Inverta antes os itens negativos (Data › Compute)."] },
  jasp: { menu: "Reliability › Unidimensional Reliability Analysis", passos: [
    "Variables: os itens. Coefficients: McDonald's ω, Cronbach's α. Individual item statistics: If item dropped."] }
},

{
  id: "cluster",
  nome: "Análise de agrupamentos (cluster)",
  grupo: "interdependencia",
  tags: ["segmentação", "k-means", "hierárquico", "perfis"],
  gatilho: "“segmentos”, “perfis de clientes”",
  paraQue: "Agrupar casos (clientes) em segmentos internamente homogêneos e diferentes entre si.",
  vd: "Nenhuma", vi: "Estrutura entre casos; variáveis métricas (ou mistas)",
  pergunta: "Existem perfis de clientes segundo renda, gasto total e recência?",
  h0: "Não há teste de hipótese", h1: "—",
  h0Texto: "Não há teste de hipótese clássico: a solução é avaliada por critérios (silhueta, dendrograma, interpretabilidade).",
  seRejeitar: "—", seNaoRejeitar: "—",
  pressupostos: ["Variáveis padronizadas quando em escalas diferentes", "Sem outliers extremos", "Baixa multicolinearidade entre as variáveis"],
  seFalhar: "Padronize as variáveis; trate outliers; compare métodos.",
  efeito: "Silhueta · tamanho e perfil dos grupos",
  ler: "Escolha k por silhueta e por interpretabilidade; depois descreva os grupos (médias por cluster) e valide em outra amostra.",
  py: String.raw`import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

vars_ = ["Income", "MntTotal", "Recency"]
d = df.dropna(subset=vars_).copy()
Z = StandardScaler().fit_transform(d[vars_])

for k in range(2, 7):
    km = KMeans(n_clusters=k, n_init=10, random_state=1).fit(Z)
    print(k, "silhueta =", round(silhouette_score(Z, km.labels_), 3))

d["cluster"] = KMeans(n_clusters=3, n_init=10, random_state=1).fit_predict(Z)
print(d.groupby("cluster")[vars_].mean().round(1))
print(d["cluster"].value_counts())`,
  r: String.raw`library(cluster); library(factoextra)

vars_ <- c("Income", "MntTotal", "Recency")
d <- na.omit(df[, vars_])
Z <- scale(d)

fviz_nbclust(Z, kmeans, method = "silhouette")       # k ótimo
set.seed(1)
km <- kmeans(Z, centers = 3, nstart = 25)
aggregate(d, by = list(cluster = km$cluster), FUN = mean)
table(km$cluster)

# Hierárquico (Ward)
hc <- hclust(dist(Z), method = "ward.D2"); plot(hc, labels = FALSE)`,
  jamovi: { menu: "snowCluster (módulo)  ·  Modules › jamovi library", passos: [
    "Instale o módulo snowCluster e escolha K-means ou hierárquico.", "Padronize as variáveis antes (Data › Transform)."],
    aviso: "Conforme o guia (Tabela 6): cluster exige módulo." },
  jasp: { menu: "Machine Learning › Clustering", passos: [
    "Escolha K-Means Clustering ou Hierarchical Clustering; marque a padronização (Scale variables).",
    "Output: Within sum of squares, Silhouette, Cluster means."],
    aviso: "O módulo Machine Learning precisa estar ativado em “+” no JASP." }
},

{
  id: "mds",
  nome: "Escalonamento multidimensional (MDS)",
  grupo: "interdependencia",
  tags: ["mapa perceptual", "posicionamento", "distâncias"],
  gatilho: "“mapa perceptual”, “posicionamento”",
  paraQue: "Representar objetos em um mapa de poucas dimensões a partir de suas similaridades.",
  vd: "Nenhuma", vi: "Estrutura entre objetos; métricas ou não métricas",
  pergunta: "Como as categorias de produto se posicionam, segundo o padrão de compra dos clientes?",
  h0: "Não há teste de hipótese", h1: "—",
  h0Texto: "Não há teste de hipótese: o ajuste é medido pelo stress.",
  seRejeitar: "—", seNaoRejeitar: "—",
  pressupostos: ["Matriz de distâncias ou similaridades entre objetos"],
  seFalhar: "Stress alto → mais dimensões.",
  efeito: "Stress (< 0,10 bom)",
  ler: "As dimensões precisam ser nomeadas pelo pesquisador. Rotacione o mapa se ajudar a leitura.",
  py: String.raw`import numpy as np
import pandas as pd
from sklearn.manifold import MDS

prods = ["MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts", "MntGoldProds"]
dissim = 1 - df[prods].corr()                      # dissimilaridade = 1 − correlação
mds = MDS(n_components=2, dissimilarity="precomputed", random_state=1, n_init=4)
coord = mds.fit_transform(dissim)
print(pd.DataFrame(coord, index=prods, columns=["Dim1", "Dim2"]).round(3))

# Stress-1 de Kruskal (< 0,10 bom; > 0,20 ruim)
d_obs = dissim.to_numpy()
d_map = np.linalg.norm(coord[:, None] - coord[None, :], axis=2)
stress1 = np.sqrt(((d_obs - d_map) ** 2).sum() / (d_obs ** 2).sum())
print("Stress-1:", round(stress1, 4))`,
  r: String.raw`prods <- c("MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts", "MntSweetProducts", "MntGoldProds")
dissim <- as.dist(1 - cor(df[, prods]))
mds <- cmdscale(dissim, k = 2)
plot(mds, type = "n"); text(mds, labels = prods)

# MDS não métrico:
# library(MASS); isoMDS(dissim, k = 2)$stress`,
  jamovi: { menu: "Sem menu nos módulos básicos", passos: ["Use o Rj Editor ou Python/R."],
    aviso: "Não consta nos menus do guia." },
  jasp: { menu: "Sem menu nativo", passos: ["Use Python ou R."], aviso: "Sem equivalente nos menus padrão." }
},

{
  id: "correspondencia",
  nome: "Análise de correspondência",
  grupo: "interdependencia",
  tags: ["tabela de contingência", "mapa", "categorias"],
  gatilho: "mapa de categorias de duas variáveis",
  paraQue: "Representar em um mapa a associação entre categorias de duas variáveis nominais.",
  vd: "Nenhuma", vi: "Estrutura entre objetos; não métricas",
  pergunta: "Como as categorias de escolaridade e de estado civil se associam em um mapa?",
  h0: "Independência (χ² da tabela)", h1: "Há associação",
  h0Texto: "Linhas e colunas da tabela são independentes.",
  seRejeitar: "Há associação a ser mapeada.",
  seNaoRejeitar: "Mapa pouco informativo.",
  pressupostos: ["Tabela de contingência com frequências", "Categorias com contagem razoável"],
  seFalhar: "Agrupe categorias raras.",
  efeito: "Inércia explicada pelas dimensões",
  ler: "Categorias próximas no mapa tendem a coocorrer. Interprete a distância entre linhas e a distância entre colunas, mas com cautela a distância entre linha e coluna.",
  py: String.raw`import pandas as pd
import prince

tab = pd.crosstab(df["Education"], df["Marital_Status"])
ca = prince.CA(n_components=2, random_state=1).fit(tab)
print(ca.eigenvalues_summary)
print("Linhas:\n", ca.row_coordinates(tab).round(3))
print("Colunas:\n", ca.column_coordinates(tab).round(3))`,
  r: String.raw`library(FactoMineR); library(factoextra)

tab <- table(df$Education, df$Marital_Status)
ca <- CA(tab, graph = FALSE)
ca$eig
fviz_ca_biplot(ca, repel = TRUE)`,
  jamovi: { menu: "Sem menu nos módulos básicos", passos: ["Use o Rj Editor ou Python/R."], aviso: "Não consta nos menus do guia." },
  jasp: { menu: "Sem menu nativo estável", passos: ["Use Python ou R."], aviso: "Sem equivalente confirmado." }
}

);
