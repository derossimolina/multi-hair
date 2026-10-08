"""Gera uma base SINTÉTICA com os mesmos nomes de colunas da base iFood / marketing-data (Kaggle).

Serve só para que os exemplos do site rodem sem baixar nada. Os números são inventados:
não tire conclusões de negócio daqui. Para trabalhar de verdade, baixe a base original no Kaggle.

Uso: python scripts/gerar_dados_sinteticos.py
"""
from pathlib import Path

import numpy as np
import pandas as pd

rng = np.random.default_rng(2026)
N = 2000

educ_niveis = ["Basic", "2n Cycle", "Graduation", "Master", "PhD"]
educ = rng.choice(educ_niveis, N, p=[0.03, 0.09, 0.50, 0.17, 0.21])
educ_idx = pd.Series(educ).map({k: i for i, k in enumerate(educ_niveis)}).to_numpy()

estado = rng.choice(["Married", "Together", "Single", "Divorced", "Widow"], N,
                    p=[0.39, 0.26, 0.22, 0.10, 0.03])
ano_nasc = rng.integers(1945, 2000, N)
idade = 2026 - ano_nasc

renda = np.clip(rng.normal(52000, 21000, N) + 4000 * educ_idx, 4000, 160000).round(0)
kid = rng.choice([0, 1, 2], N, p=[0.58, 0.40, 0.02])
teen = rng.choice([0, 1, 2], N, p=[0.52, 0.46, 0.02])
dt = pd.to_datetime("2012-07-01") + pd.to_timedelta(rng.integers(0, 730, N), unit="D")
recencia = rng.integers(0, 100, N)

# "propensão a gastar" comum a todos os produtos e canais: gera correlação entre eles (útil para AFE)
propensao = rng.lognormal(0, 0.45, N)
base = np.clip((renda / 52000) ** 1.4 * (1 - 0.18 * kid - 0.1 * teen) * propensao, 0.02, None)


def gasto(escala):
    return (rng.gamma(1.1, escala * base)).round(0)


vinho = gasto(300)
fruta = gasto(25)
carne = gasto(160)
peixe = gasto(35)
doce = gasto(25)
ouro = gasto(40)

ofertas = rng.poisson(2.2 + 0.6 * kid)
web = rng.poisson(1 + 3.5 * base)
catalogo = rng.poisson(0.5 + 3 * base)
loja = rng.poisson(2 + 4 * base)
visitas = np.clip(rng.poisson(np.clip(6 - 1.2 * base + 1.5 * (kid > 0), 0.5, None)), 0, 20)

logit = -2.9 - 0.35 * kid + 0.00002 * renda + 0.25 * educ_idx - 0.012 * recencia + 0.15 * (estado == "Single")
p_resp = 1 / (1 + np.exp(-logit))
resp = (rng.random(N) < p_resp).astype(int)
cmps = {f"AcceptedCmp{i}": (rng.random(N) < np.clip(0.03 + 0.5 * p_resp * (0.3 + 0.1 * i) / 2, 0, 0.5)).astype(int)
        for i in range(1, 6)}
reclam = (rng.random(N) < 0.01).astype(int)

df = pd.DataFrame({
    "ID": np.arange(1, N + 1),
    "Year_Birth": ano_nasc,
    "Education": educ,
    "Marital_Status": estado,
    "Income": renda,
    "Kidhome": kid,
    "Teenhome": teen,
    "Dt_Customer": dt.strftime("%Y-%m-%d"),
    "Recency": recencia,
    "MntWines": vinho,
    "MntFruits": fruta,
    "MntMeatProducts": carne,
    "MntFishProducts": peixe,
    "MntSweetProducts": doce,
    "MntGoldProds": ouro,
    "NumDealsPurchases": ofertas,
    "NumWebPurchases": web,
    "NumCatalogPurchases": catalogo,
    "NumStorePurchases": loja,
    "NumWebVisitsMonth": visitas,
    **cmps,
    "Complain": reclam,
    "Response": resp,
})
df["Age"] = idade
df["MntTotal"] = df[["MntWines", "MntFruits", "MntMeatProducts", "MntFishProducts",
                     "MntSweetProducts", "MntGoldProds"]].sum(axis=1)

# alguns valores ausentes em Income, como na base real
df.loc[rng.choice(N, 24, replace=False), "Income"] = np.nan

saida = Path(__file__).resolve().parent.parent / "data" / "ifood_sintetico.csv"
saida.parent.mkdir(exist_ok=True)
df.to_csv(saida, index=False)
print(f"{len(df)} linhas gravadas em {saida}")
