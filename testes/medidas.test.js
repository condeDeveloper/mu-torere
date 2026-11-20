// Os numeros do README, presos.

import test from 'node:test'
import assert from 'node:assert/strict'

import { resumo, classes, efeitoDaRegra, conferencia } from '../js/medidas.js'

const por = (lista) => Object.fromEntries(lista.map((l) => [l.rotulo, l]))

test('sem a regra, o Mu Torere acaba no primeiro lance', () => {
  const s = por(resumo())['Mu Torere sem a regra']
  assert.equal(s.inicio, 'vitoria')
  assert.equal(s.distInicio, 1)
  // Levar ao centro a peca 1 ou a 2 ganha na hora; a 0 ou a 3 perde em 4.
  assert.deepEqual(s.primeiros.map((p) => [p.de, p.resultado, p.dist]), [[0, 'derrota', 4], [1, 'vitoria', 1], [2, 'vitoria', 1], [3, 'derrota', 4]])
})

test('com a regra, o Mu Torere empata, pelas duas aberturas', () => {
  const c = por(resumo())['Mu Torere com a regra']
  assert.equal(c.inicio, 'empate')
  assert.deepEqual(c.primeiros.map((p) => [p.de, p.resultado]), [[0, 'empate'], [3, 'empate']])
})

test('as 630 posicoes do Mu Torere, com e sem a regra', () => {
  const r = por(resumo())
  assert.deepEqual(r['Mu Torere com a regra'].todas, { vitoria: 120, derrota: 64, empate: 446, total: 630, maisLonga: 5 })
  assert.deepEqual(r['Mu Torere sem a regra'].todas, { vitoria: 176, derrota: 80, empate: 374, total: 630, maisLonga: 5 })
  assert.deepEqual(r['Mu Torere com a regra'].alcancaveis, { vitoria: 104, derrota: 64, empate: 422, total: 590, maisLonga: 5 })
})

test("o Pong Hau K'i empata, e nenhuma vitoria passa de 1 lance", () => {
  const p = por(resumo())["Pong Hau K'i"]
  assert.equal(p.inicio, 'empate')
  assert.deepEqual(p.todas, { vitoria: 4, derrota: 2, empate: 24, total: 30, maisLonga: 1 })
  assert.deepEqual(p.alcancaveis, { vitoria: 4, derrota: 2, empate: 22, total: 28, maisLonga: 1 })
})

test('a menos de simetria: 46 classes no Mu Torere, 16 no Pong Hau Ki', () => {
  const c = por(classes())
  assert.deepEqual(c['Mu Torere com a regra'], { rotulo: 'Mu Torere com a regra', simetrias: 16, classes: 46, vitoria: 8, derrota: 5, empate: 33 })
  assert.deepEqual(c["Pong Hau K'i"], { rotulo: "Pong Hau K'i", simetrias: 2, classes: 16, vitoria: 2, derrota: 1, empate: 13 })
})

test('a regra proibe 40 lances e muda 72 posicoes, sempre para empate', () => {
  assert.deepEqual(efeitoDaRegra(), { posicoes: 630, muda: 72, empateViraDecidido: 72, decididoViraEmpate: 0, trocaDeDono: 0, lancesProibidos: 40 })
})

test('o juiz concorda em todas as posicoes, valor e distancia', () => {
  const c = conferencia()
  for (const l of c.linhas) assert.equal(l.divergencias, 0, l.rotulo)
  assert.deepEqual(c.linhas.map((l) => l.rodadas), [2, 6, 6])
})

test('o controle: o juiz sem a regra discorda da busca com a regra em 72', () => {
  assert.equal(conferencia().controle, 72)
  // E sao exatamente as 72 que a regra muda.
  assert.equal(conferencia().controle, efeitoDaRegra().muda)
})
