// O juiz: os dois jogos refeitos sem importar nada do nucleo nem da busca.
//
// Diferencas de proposito:
//   - as cores sao absolutas ('P' pretas, 'B' brancas) e a vez e explicita;
//   - o grafo e uma lista de ARESTAS escrita a mao, e os vizinhos saem dela;
//   - o metodo e iteracao de valores sincrona: na rodada d decide-se tudo o
//     que tem distancia d; quando uma rodada nao decide nada, o resto e empate.

const ARESTAS = {
  'mu-torere': [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8]
  ],
  'pong-hau-ki': [[0, 2], [1, 2], [3, 2], [4, 2], [0, 3], [1, 4], [3, 4]]
}
const CENTRO = { 'mu-torere': 8, 'pong-hau-ki': 2 }
const PONTAS_VIZINHAS = (p) => [(p + 1) % 8, (p + 7) % 8]

function vizinhos (nome) {
  const n = nome === 'mu-torere' ? 9 : 5
  const v = Array.from({ length: n }, () => [])
  for (const [a, b] of ARESTAS[nome]) { v[a].push(b); v[b].push(a) }
  return v
}

// Estado: texto das cores + a letra de quem joga, ex. 'PPPPBBBB.P'.
function filhos (nome, regra, viz, estado) {
  const tab = estado.slice(0, -1)
  const vez = estado.slice(-1)
  const outro = vez === 'P' ? 'B' : 'P'
  const vazio = tab.indexOf('.')
  const saida = []
  for (const de of viz[vazio]) {
    if (tab[de] !== vez) continue
    if (regra && nome === 'mu-torere' && vazio === CENTRO[nome]) {
      if (!PONTAS_VIZINHAS(de).some((p) => tab[p] === outro)) continue
    }
    const arr = [...tab]
    arr[vazio] = vez
    arr[de] = '.'
    saida.push(arr.join('') + outro)
  }
  return saida
}

function todosOsEstados (nome) {
  const n = nome === 'mu-torere' ? 9 : 5
  const k = (n - 1) / 2
  const lista = []
  for (let mask = 0; mask < 3 ** n; mask++) {
    let x = mask
    let s = ''
    for (let i = 0; i < n; i++) { s += '.PB'[x % 3]; x = Math.floor(x / 3) }
    if (s.split('.').length - 1 !== 1) continue
    if (s.split('P').length - 1 !== k) continue
    lista.push(s + 'P', s + 'B')
  }
  return lista
}

// Devolve Map estado -> { valor, dist }, valor do ponto de vista de quem joga.
export function julga (nome, regra = false) {
  const viz = vizinhos(nome)
  const estados = todosOsEstados(nome)
  const fs = new Map(estados.map((e) => [e, filhos(nome, regra, viz, e)]))
  const res = new Map(estados.map((e) => [e, { valor: 0, dist: -1 }]))
  let abertos = estados
  for (let rodada = 0; ; rodada++) {
    const decididos = []
    for (const e of abertos) {
      let ganha = false
      let todosPerdem = true
      for (const f of fs.get(e)) {
        const r = res.get(f)
        if (r.dist < 0 || r.dist >= rodada) { todosPerdem = false; continue }
        if (r.valor === -1) ganha = true
        else todosPerdem = todosPerdem && r.valor === 1
      }
      if (ganha) decididos.push([e, 1])
      else if (todosPerdem) decididos.push([e, -1])
    }
    for (const [e, valor] of decididos) res.set(e, { valor, dist: rodada })
    if (decididos.length === 0 && rodada > 0) return { res, rodadas: rodada, estados: estados.length }
    const d = new Set(decididos.map(([e]) => e))
    abertos = abertos.filter((e) => !d.has(e))
  }
}

// Converte o texto relativo do nucleo ('a' = quem joga) para o estado do juiz,
// supondo que quem joga sao as pretas.
export function doRelativo (s) {
  return [...s].map((c) => c === 'a' ? 'P' : c === 'b' ? 'B' : '.').join('') + 'P'
}
