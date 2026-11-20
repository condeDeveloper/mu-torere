// As regras, a busca e o juiz em casos pequenos.

import test from 'node:test'
import assert from 'node:assert/strict'

import { MU_TORERE, PONG_HAU_KI, jogo, lances, aplica, todas, simetrias, permuta, comCores } from '../js/nucleo.js'
import { Retrograda, EMPATE } from '../js/busca.js'
import { julga, doRelativo } from '../js/juiz.js'

test('o grafo do Mu Torere: pontas com 3 vizinhos, centro com 8, 16 arestas', () => {
  const v = MU_TORERE.vizinhos
  for (let p = 0; p < 8; p++) assert.equal(v[p].length, 3)
  assert.equal(v[8].length, 8)
  assert.equal(v.reduce((s, l) => s + l.length, 0), 2 * 16)
})

test("o grafo do Pong Hau K'i: 7 arestas, e 0-1 nao existe", () => {
  const v = PONG_HAU_KI.vizinhos
  assert.equal(v.reduce((s, l) => s + l.length, 0), 2 * 7)
  assert.ok(!v[0].includes(1))
})

test('os vizinhos sao simetricos nos dois grafos', () => {
  for (const g of [MU_TORERE, PONG_HAU_KI]) {
    g.vizinhos.forEach((l, p) => { for (const q of l) assert.ok(g.vizinhos[q].includes(p), `${g.nome} ${p}-${q}`) })
  }
})

test('todas as posicoes: 630 no Mu Torere, 30 no Pong Hau Ki', () => {
  // 9!/(4!4!1!) e 5!/(2!2!1!).
  assert.equal(todas(jogo(MU_TORERE)).length, 630)
  assert.equal(todas(jogo(PONG_HAU_KI)).length, 30)
})

test('sem a regra, a abertura do Mu Torere tem 4 lances; com ela, 2', () => {
  assert.equal(lances(jogo(MU_TORERE, { regra: false }), MU_TORERE.inicio).length, 4)
  const com = lances(jogo(MU_TORERE, { regra: true }), MU_TORERE.inicio)
  // So as pecas das pontas 0 e 3 tem vizinho do outro lado.
  assert.deepEqual(com.map((l) => l.de), [0, 3])
})

test('aplicar move a peca e troca os papeis', () => {
  assert.equal(aplica('aaaabbbb.', { de: 1, para: 8 }), 'b.bbaaaab')
})

test('sem a regra, levar a peca 1 ao centro deixa o outro sem lance', () => {
  const j = jogo(MU_TORERE, { regra: false })
  const depois = aplica(MU_TORERE.inicio, { de: 1, para: 8 })
  assert.equal(lances(j, depois).length, 0)
})

test('do centro a peca vai para qualquer ponta vazia, com ou sem a regra', () => {
  const s = 'aaa.bbbba'
  assert.deepEqual(lances(jogo(MU_TORERE, { regra: true }), s), [{ de: 2, para: 3 }, { de: 8, para: 3 }])
})

test('as simetrias: 16 no Mu Torere, 2 no Pong Hau Ki, e todas preservam o grafo', () => {
  for (const g of [MU_TORERE, PONG_HAU_KI]) {
    const perms = simetrias(g)
    assert.equal(perms.length, g === MU_TORERE ? 16 : 2)
    for (const p of perms) {
      g.vizinhos.forEach((l, a) => { for (const b of l) assert.ok(g.vizinhos[p[a]].includes(p[b])) })
    }
  }
})

test('permutar pela identidade nao muda nada', () => {
  assert.equal(permuta([0, 1, 2, 3, 4], 'ab.ab'), 'ab.ab')
})

test('as cores fixas', () => {
  assert.equal(comCores('ab.', true), 'PB.')
  assert.equal(comCores('ab.', false), 'BP.')
})

test('a busca: sem lance e derrota em 0', () => {
  const j = jogo(MU_TORERE, { regra: false })
  const r = new Retrograda(j)
  assert.deepEqual(r.consulta(aplica(MU_TORERE.inicio, { de: 1, para: 8 })), { valor: -1, dist: 0 })
})

test('empate sai como 0, nunca -0', () => {
  const r = new Retrograda(jogo(MU_TORERE, { regra: true }))
  for (const a of r.avaliaLances(MU_TORERE.inicio)) assert.ok(Object.is(a.valor, EMPATE))
})

test('o juiz conhece o dobro de estados: cor absoluta e vez explicita', () => {
  assert.equal(julga('pong-hau-ki').estados, 60)
  assert.equal(doRelativo('ab.'), 'PB.P')
})
