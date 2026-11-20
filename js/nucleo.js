// Dois jogos de bloqueio num grafo pequeno: o Mu Torere, dos maori, e o
// Pong Hau K'i, chines. Nos dois so existe um ponto vazio, cada lance leva uma
// peca para ele, e quem nao tem lance perde.
//
// MU TORERE: oito pontas (kewai) numa estrela e o centro (putahi).
//
//        0
//     7     1
//   6    C    2        C = 8, o centro
//     5     3
//        4
//
//   As pontas ligam nas duas vizinhas da estrela e no centro. Quatro pecas de
//   cada lado, as pretas em 0..3, as brancas em 4..7, o centro vazio. Um lance
//   leva uma peca para o ponto vazio, se ele for vizinho. A regra que da graca
//   ao jogo: de uma ponta para o centro, so se a peca tiver uma peca do outro
//   lado numa das duas pontas vizinhas. O projeto mede o jogo com e sem ela.
//
// PONG HAU K'I: cinco pontos, as quatro quinas de um quadrado e o centro.
//
//   0       1
//     \   /
//       2
//     /   \
//   3 ----- 4
//   |       |      (0-3 e 1-4 sao os lados; 0-1 nao existe)
//
//   Duas pecas de cada lado: as pretas em 0 e 1, as brancas em 3 e 4.
//
// A posicao e um texto do ponto de vista de quem esta na vez: 'a' sao as
// pecas dele, 'b' as do outro, '.' o ponto vazio.

export const MU_TORERE = {
  nome: 'mu-torere',
  pontos: 9,
  centro: 8,
  vizinhos: [
    [1, 7, 8], [0, 2, 8], [1, 3, 8], [2, 4, 8], [3, 5, 8], [4, 6, 8], [5, 7, 8], [6, 0, 8],
    [0, 1, 2, 3, 4, 5, 6, 7]
  ],
  inicio: 'aaaabbbb.'
}

export const PONG_HAU_KI = {
  nome: 'pong-hau-ki',
  pontos: 5,
  centro: 2,
  vizinhos: [[2, 3], [2, 4], [0, 1, 3, 4], [0, 2, 4], [1, 2, 3]],
  inicio: 'aa.bb'
}

// `regra`: true liga a restricao do Mu Torere (ponta -> centro so com vizinho
// do outro lado). No Pong Hau K'i nao ha regra extra.
export function jogo (base, { regra = false } = {}) {
  return { ...base, regra: base.nome === 'mu-torere' && regra }
}

// Os lances: { de, para }.
export function lances (j, s) {
  const vazio = s.indexOf('.')
  const lista = []
  for (const de of j.vizinhos[vazio]) {
    if (s[de] !== 'a') continue
    if (j.regra && vazio === j.centro) {
      // De uma ponta para o centro: precisa de uma peca do outro ao lado.
      const [v1, v2] = j.vizinhos[de]
      if (s[v1] !== 'b' && s[v2] !== 'b') continue
    }
    lista.push({ de, para: vazio })
  }
  return lista
}

// Aplica e devolve do ponto de vista de quem joga a seguir.
export function aplica (s, l) {
  const arr = [...s]
  arr[l.para] = 'a'
  arr[l.de] = '.'
  return arr.map((c) => c === 'a' ? 'b' : c === 'b' ? 'a' : '.').join('')
}

// Todas as posicoes: cada jeito de pôr as pecas, com o vazio em qualquer
// ponto, do ponto de vista de quem esta na vez.
export function todas (j) {
  const n = j.pontos
  const metade = (n - 1) / 2
  const saida = []
  const rec = (s, a, b) => {
    if (s.length === n) { saida.push(s); return }
    if (a < metade) rec(s + 'a', a + 1, b)
    if (b < metade) rec(s + 'b', a, b + 1)
    if (!s.includes('.')) rec(s + '.', a, b)
  }
  rec('', 0, 0)
  return saida
}

// As simetrias do grafo, como permutacoes de pontos. Servem para contar
// posicoes a menos de simetria, nunca para a busca.
export function simetrias (j) {
  if (j.nome === 'pong-hau-ki') return [[0, 1, 2, 3, 4], [1, 0, 2, 4, 3]]
  const lista = []
  for (let r = 0; r < 8; r++) {
    lista.push([...Array.from({ length: 8 }, (_, i) => (i + r) % 8), 8])
    lista.push([...Array.from({ length: 8 }, (_, i) => (8 - i + r) % 8), 8])
  }
  return lista
}

export function permuta (perm, s) {
  const arr = Array(s.length)
  for (let i = 0; i < s.length; i++) arr[perm[i]] = s[i]
  return arr.join('')
}

// Desenho com cores fixas: P = quem comecou, B = o outro.
export function comCores (s, vezDeQuemComecou) {
  return [...s].map((c) => c === '.' ? '.' : (c === 'a') === vezDeQuemComecou ? 'P' : 'B').join('')
}
