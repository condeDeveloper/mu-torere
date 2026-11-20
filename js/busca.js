// Quem ganha, por analise retrograda sobre TODAS as posicoes do jogo.
//
// Os dois jogos tem ciclo (as pecas vao e voltam), entao nao serve busca que
// desce. A analise comeca nas posicoes sem lance (perdidas para quem esta na
// vez), sobe pelos pais, e o que nunca for marcado e empate: ninguem consegue
// forcar nada. A fila vai por ordem de distancia, entao a distancia que sai e
// a do melhor jogo (quem ganha ganha o mais cedo, quem perde demora o mais).

import { lances, aplica, todas } from './nucleo.js'

export const VITORIA = 1
export const DERROTA = -1
export const EMPATE = 0

export class Retrograda {
  constructor (j) {
    this.j = j
    this.posicoes = todas(j)
    this.indice = new Map(this.posicoes.map((s, i) => [s, i]))
    const n = this.posicoes.length
    this.filhos = this.posicoes.map((s) => lances(j, s).map((l) => this.indice.get(aplica(s, l))))
    const pais = Array.from({ length: n }, () => [])
    this.filhos.forEach((fs, i) => { for (const f of fs) pais[f].push(i) })
    this.valor = new Int8Array(n)
    this.dist = new Int32Array(n).fill(-1)
    const faltam = Int32Array.from(this.filhos, (fs) => fs.length)
    const fila = []
    for (let i = 0; i < n; i++) {
      if (this.filhos[i].length === 0) { this.valor[i] = DERROTA; this.dist[i] = 0; fila.push(i) }
    }
    for (let q = 0; q < fila.length; q++) {
      const f = fila[q]
      for (const p of pais[f]) {
        if (this.dist[p] >= 0) continue
        if (this.valor[f] === DERROTA) {
          this.valor[p] = VITORIA
          this.dist[p] = this.dist[f] + 1
          fila.push(p)
        } else if (--faltam[p] === 0) {
          this.valor[p] = DERROTA
          this.dist[p] = this.dist[f] + 1
          fila.push(p)
        }
      }
    }
  }

  consulta (s) {
    const i = this.indice.get(s)
    return this.dist[i] < 0 ? { valor: EMPATE, dist: -1 } : { valor: this.valor[i], dist: this.dist[i] }
  }

  // Cada lance com o resultado para quem joga. Empate devolve 0 de verdade,
  // nunca o -0 de negar um zero.
  avaliaLances (s) {
    return lances(this.j, s).map((l) => {
      const r = this.consulta(aplica(s, l))
      if (r.dist < 0) return { lance: l, valor: EMPATE, dist: -1 }
      return { lance: l, valor: -r.valor, dist: r.dist + 1 }
    })
  }

  // As posicoes alcancaveis a partir do inicio.
  alcancaveis () {
    const vistos = new Set([this.indice.get(this.j.inicio)])
    const pilha = [...vistos]
    while (pilha.length) {
      const i = pilha.pop()
      for (const f of this.filhos[i]) if (!vistos.has(f)) { vistos.add(f); pilha.push(f) }
    }
    return vistos
  }

  contagem (indices = this.posicoes.map((_, i) => i)) {
    const c = { vitoria: 0, derrota: 0, empate: 0, total: 0 }
    let maisLonga = -1
    for (const i of indices) {
      c.total++
      if (this.dist[i] < 0) c.empate++
      else if (this.valor[i] === VITORIA) c.vitoria++
      else c.derrota++
      if (this.dist[i] > maisLonga) maisLonga = this.dist[i]
    }
    return { ...c, maisLonga }
  }
}
