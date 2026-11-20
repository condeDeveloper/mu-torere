# Mu Torere

O Mu Torere, dos maori, e o Pong Hau K'i, chinês, resolvidos em todas as posições por análise retrógrada, e a regra do centro do Mu Torere medida lance por lance. JavaScript puro, sem dependência nenhuma.

Os dois são jogos de bloqueio num grafo pequeno: só existe um ponto vazio, cada lance leva uma peça vizinha para ele, e quem fica sem lance perde.

**Página jogável:** <https://condedeveloper.github.io/mu-torere/>

---

## Os quatro achados

**1. Sem a regra do centro, o Mu Torere acaba no primeiro lance.** Do início, quem começa leva ao centro uma das duas peças do meio do seu grupo (as pontas 1 ou 2), e o outro fica sem lance: nenhuma peça dele é vizinha do ponto que ficou vazio. Levar uma das peças das pontas do grupo (0 ou 3), ao contrário, perde em 4.

**2. Com a regra, o jogo empata, e a regra quase não aparece.** As duas aberturas permitidas empatam. Somando as 630 posições do jogo, a regra proíbe só **40 lances**, e muda o valor de **72 posições**. Todas as 72 mudam no mesmo sentido: eram decididas sem a regra e viram empate com ela. Nenhuma troca de dono, e nenhum empate vira decisão.

**3. No Pong Hau K'i ninguém é levado à derrota de longe.** Das 30 posições, 24 são empate, e nenhuma vitória passa de **1 lance**: só perde quem deixa as próprias peças presas no lance seguinte. Do início, as duas aberturas empatam.

**4. O juiz confere valor e distância de todas as posições, e o controle cai exatamente nas 72.** Um segundo programa, com cores absolutas, o grafo escrito como lista de arestas e iteração de valores, concorda nas 30 + 630 + 630 posições, com a distância de cada uma. O mesmo juiz sem a regra, comparado com a busca com a regra, discorda em 72 posições: as mesmas 72 que a regra muda.

---

## Os jogos

```
Mu Torere                     Pong Hau K'i

        0                     0       1
     7     1                    \   /
   6    C    2                    2
     5     3                    /   \
        4                     3 ----- 4
```

**Mu Torere.** Oito pontas numa estrela e o centro (C, o ponto 8). Cada ponta liga nas duas vizinhas e no centro. Quatro peças de cada lado: as de quem começa em 0 a 3, as do outro em 4 a 7, o centro vazio. A regra: de uma ponta para o centro, só pode ir a peça que tem uma peça do outro lado numa das duas pontas vizinhas.

**Pong Hau K'i.** As quatro quinas de um quadrado e o centro. As quinas ligam no centro; os lados de baixo, da esquerda e da direita existem, o de cima não. Duas peças de cada lado: as de quem começa em cima (0 e 1), as do outro embaixo (3 e 4).

---

## As tabelas

Todos os números saem de `node ferramentas/medidor.js` e estão presos em `testes/medidas.test.js`. Vitória e derrota são do ponto de vista de quem está na vez.

### Todas as posições

| jogo | posições | vitória | derrota | empate | vitória mais longa | do início |
| --- | --- | --- | --- | --- | --- | --- |
| Pong Hau K'i | 30 | 4 | 2 | 24 | 1 lance | empate |
| Mu Torere com a regra | 630 | 120 | 64 | 446 | 5 lances | empate |
| Mu Torere sem a regra | 630 | 176 | 80 | 374 | 5 lances | **vitória em 1** |

Alcançáveis a partir do início: 28 das 30 no Pong Hau K'i, 590 das 630 no Mu Torere.

### A menos de simetria

| jogo | simetrias do grafo | classes | vitória | derrota | empate |
| --- | --- | --- | --- | --- | --- |
| Pong Hau K'i | 2 | 16 | 2 | 1 | 13 |
| Mu Torere com a regra | 16 | 46 | 8 | 5 | 33 |

### O efeito da regra

| medida | valor |
| --- | --- |
| lances proibidos, somando as 630 posições | 40 |
| posições cujo valor muda | 72 |
| decididas sem a regra, empate com ela | 72 |
| empate sem a regra, decididas com ela | 0 |
| decididas nos dois casos, com dono trocado | 0 |

### O juiz

| jogo | posições | divergências | rodadas do juiz |
| --- | --- | --- | --- |
| Pong Hau K'i | 30 | 0 | 2 |
| Mu Torere com a regra | 630 | 0 | 6 |
| Mu Torere sem a regra | 630 | 0 | 6 |

O juiz guarda o dobro de estados (60 e 1.260), porque trabalha com cores absolutas e a vez explícita. As rodadas são a vitória mais longa mais uma.

---

## Como funciona

**A busca** (`js/busca.js`) é análise retrógrada. Os dois jogos têm ciclo: as peças vão e voltam, e a mesma posição pode reaparecer para sempre. A análise começa nas posições sem lance, marca como ganha toda posição que chega numa perdida e como perdida toda posição cujos filhos são todos ganhos, e o que nunca é marcado é empate. A fila vai por ordem de distância, então a distância é a do melhor jogo.

**O juiz** (`js/juiz.js`) não importa nada do núcleo nem da busca: cores absolutas, a vez explícita, o grafo como lista de arestas, e iteração de valores síncrona, em que a rodada `d` decide exatamente as posições de distância `d`.

---

## O que as medidas me corrigiram

Nada quebrou neste projeto. A busca, o juiz e os testes concordaram na primeira rodada, e o controle negativo confirmou que o juiz mede: ele discorda exatamente nas 72 posições que a regra muda.

---

## Como rodar

Node 20 ou mais novo. Sem dependência.

```bash
npm test                              # a suite inteira
npm run medir                         # todas as tabelas
node ferramentas/medidor.js regra     # o efeito da regra do centro
```

## Os arquivos

- `js/nucleo.js`: os dois grafos, as regras e as simetrias.
- `js/busca.js`: a análise retrógrada.
- `js/juiz.js`: a iteração de valores, sem compartilhar código com a busca.
- `js/medidas.js`: as tabelas do README.
- `js/app.js`: a página jogável.
- `ferramentas/medidor.js`: imprime as tabelas.
- `testes/`: 22 testes, com os números do README presos.

## Licença

MIT.
