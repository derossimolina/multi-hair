# Multi-Hair

Guia interativo "da pergunta à técnica", baseado no diagrama do Hair e no guia de estudo JASP/jamovi (`Guia_Tecnicas_Hair.docx`). Serve para colegas de doutorado escolherem a técnica estatística certa e copiarem o exemplo em **Python, R, jamovi e JASP**.

## Como abrir

Sem build e sem dependências. Duas opções:

- Abra `index.html` direto no navegador; ou
- sirva a pasta (recomendado, para o download da base funcionar em qualquer navegador):

```bash
python -m http.server 8000
```

e acesse <http://localhost:8000>. Para publicar, basta enviar a pasta inteira para qualquer hospedagem estática (GitHub Pages, Netlify etc.).

## O que tem

| Página | Conteúdo |
| --- | --- |
| Passo 0 | Quem é VD e VI. Analisador que destaca as palavras-gatilho de um enunciado |
| Assistente | Árvore de perguntas (tipo de relação, quantas VDs, escala) que leva à técnica. O caminho vai na URL e pode ser compartilhado |
| Técnicas | 36 técnicas: bivariadas, não paramétricas, categóricas, multivariadas e testes de pressuposto. Busca e filtros |
| Técnica | Gatilho, VD/VI, H₀/H₁, pressupostos, o que fazer se falhar, tamanho de efeito, leitura e abas Python / R / jamovi / JASP com botão de copiar |
| H₀ | Tabela 7 do guia: o que a H₀ afirma e o que significa rejeitar ou não |
| Exercícios | 14 enunciados com conferência de VD e técnica; progresso salvo no navegador |
| Roteiro | 6 estágios do Hair, diagrama em tabela e pares paramétrico ↔ não paramétrico |
| Preparação | Como carregar a base em cada ambiente e dicionário das variáveis |

## Estrutura

```
index.html
css/style.css
js/app.js                   interface, roteador, assistente, exercícios
js/data/bivariadas.js       Tabelas 2, 3, 4, 5 e 7 do guia
js/data/multivariadas.js    Tabelas 1 e 6
js/data/pressupostos.js     Shapiro, Levene, Mauchly, Durbin-Watson, Box's M, Bartlett/KMO
js/data/conteudo.js         Passo 0, árvore do assistente, roteiro e exercícios
data/ifood_sintetico.csv    base sintética (2.000 linhas, colunas da base iFood)
scripts/gerar_dados_sinteticos.py
```

## Como acrescentar uma técnica

Copie um objeto de `js/data/*.js` para `HAIR.tecnicas.push(...)` e preencha: `id`, `nome`, `grupo`, `gatilho`, `paraQue`, `vd`, `vi`, `pergunta`, `h0`, `h1`, `h0Texto`, `seRejeitar`, `seNaoRejeitar`, `pressupostos`, `seFalhar`, `efeito`, `ler`, `py`, `r`, `jamovi` e `jasp`. Se ela entrar no fluxo de decisão, aponte para o `id` em `HAIR.arvore` (`js/data/conteudo.js`) e, se for o caso, em `HAIR.exercicios`.

## Sobre os dados

`data/ifood_sintetico.csv` é **sintético**: tem os mesmos nomes de coluna da base *iFood Marketing Campaign* (Kaggle), mas os valores são inventados. Os exemplos rodam com ele, porém os resultados não dizem nada sobre clientes reais. Para trabalhar de verdade, baixe a base original e troque o caminho em `pd.read_csv(...)` / `fread(...)`.

## O que foi conferido e o que não foi

- **Python:** os 36 trechos foram executados contra a base sintética (Python 3.14, pandas, scipy, statsmodels, pingouin, scikit-learn, scikit-posthocs, factor_analyzer, semopy, prince) e rodam sem erro. A AFE usa o `statsmodels` para o ajuste porque o `factor_analyzer` quebra com o scikit-learn mais recente; ele fica só com KMO e Bartlett.
- **R:** os códigos **não foram executados** (não havia R na máquina). Foram escritos com funções e pacotes padrão, mas rode-os antes de distribuir e corrija o que a sua versão de pacote pedir.
- **jamovi:** os menus seguem o guia. Onde o guia diz que a técnica não está nos menus básicos (discriminante, correlação canônica, SEM, cluster), isso está sinalizado.
- **JASP:** o guia cobre o jamovi, então os menus do JASP vêm de outra fonte e podem variar com a versão. Cada aba do JASP traz esse aviso. Itens sem equivalente confirmado (McNemar, regressão ordinal) estão marcados.
