// As tabelas do README. Cada jogo e resolvido uma vez so e guardado.

import { MU_TORERE, PONG_HAU_KI, jogo, simetrias, permuta } from './nucleo.js'
import { Retrograda } from './busca.js'
import { julga, doRelativo } from './juiz.js'

const cache = new Map()
function guardado (nome, f) {
  if (!cache.has(nome)) cache.set(nome, f())
  return cache.get(nome)
}

export const JOGOS = [
  { rotulo: "Pong Hau K'i", base: PONG_HAU_KI, regra: false },
  { rotulo: 'Mu Torere com a regra', base: MU_TORERE, regra: true },
  { rotulo: 'Mu Torere sem a regra', base: MU_TORERE, regra: false }
]

export function resolvido (base, regra) {
  return guardado(`${base.nome}/${regra}`, () => new Retrograda(jogo(base, { regra })))
}

const nomeValor = (r) => r.dist < 0 ? 'empate' : r.valor === 1 ? 'vitoria' : 'derrota'

// Tabela 1: o resumo de cada jogo.
export function resumo () {
  return JOGOS.map(({ rotulo, base, regra }) => {
    const r = resolvido(base, regra)
    const ini = r.consulta(base.inicio)
    const todas = r.contagem()
    const alc = r.contagem([...r.alcancaveis()])
    const primeiros = r.avaliaLances(base.inicio).map((a) => ({ de: a.lance.de, resultado: nomeValor(a), dist: a.dist }))
    return { rotulo, inicio: nomeValor(ini), distInicio: ini.dist, primeiros, todas, alcancaveis: alc }
  })
}

// Tabela 2: as posicoes a menos de simetria do grafo.
export function classes () {
  return JOGOS.filter((x) => x.regra || x.base === PONG_HAU_KI).map(({ rotulo, base, regra }) => {
    const r = resolvido(base, regra)
    const perms = simetrias(r.j)
    const vistas = new Set()
    const c = { vitoria: 0, derrota: 0, empate: 0 }
    for (const s of r.posicoes) {
      const canon = perms.map((p) => permuta(p, s)).sort()[0]
      if (vistas.has(canon)) continue
      vistas.add(canon)
      c[nomeValor(r.consulta(s))]++
    }
    return { rotulo, simetrias: perms.length, classes: vistas.size, ...c }
  })
}

// Tabela 3: onde a regra do Mu Torere muda a resposta.
export function efeitoDaRegra () {
  const com = resolvido(MU_TORERE, true)
  const sem = resolvido(MU_TORERE, false)
  let muda = 0
  let empateViraDecidido = 0
  let decididoViraEmpate = 0
  let trocaDeDono = 0
  let lancesProibidos = 0
  for (const s of com.posicoes) {
    const a = com.consulta(s)
    const b = sem.consulta(s)
    if (a.valor !== b.valor || a.dist !== b.dist) muda++
    if (a.dist < 0 && b.dist >= 0) empateViraDecidido++
    if (a.dist >= 0 && b.dist < 0) decididoViraEmpate++
    if (a.dist >= 0 && b.dist >= 0 && a.valor !== b.valor) trocaDeDono++
    lancesProibidos += sem.avaliaLances(s).length - com.avaliaLances(s).length
  }
  return { posicoes: com.posicoes.length, muda, empateViraDecidido, decididoViraEmpate, trocaDeDono, lancesProibidos }
}

// Tabela 4: o juiz contra a busca, em TODAS as posicoes, valor e distancia.
// O controle: o juiz sem a regra contra a busca com a regra.
export function conferencia () {
  return guardado('conf', () => {
    const linhas = JOGOS.map(({ rotulo, base, regra }) => {
      const r = resolvido(base, regra)
      const { res, rodadas, estados } = julga(base.nome, regra)
      let divergencias = 0
      for (const s of r.posicoes) {
        const a = r.consulta(s)
        const b = res.get(doRelativo(s))
        if (a.valor !== b.valor || a.dist !== b.dist) divergencias++
      }
      return { rotulo, posicoes: r.posicoes.length, estadosDoJuiz: estados, divergencias, rodadas }
    })
    const r = resolvido(MU_TORERE, true)
    const { res } = julga('mu-torere', false)
    let controle = 0
    for (const s of r.posicoes) {
      const a = r.consulta(s)
      const b = res.get(doRelativo(s))
      if (a.valor !== b.valor || a.dist !== b.dist) controle++
    }
    return { linhas, controle }
  })
}
