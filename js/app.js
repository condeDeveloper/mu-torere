// A pagina: Mu Torere (com ou sem a regra) e Pong Hau K'i contra a maquina.
// Regras e analise sao os mesmos arquivos dos testes.

import { MU_TORERE, PONG_HAU_KI, jogo, lances, aplica } from './nucleo.js'
import { Retrograda, VITORIA } from './busca.js'

const elTab = document.getElementById('tabuleiro')
const elEstado = document.getElementById('estado')
const elJogo = document.getElementById('jogo')
const elDicas = document.getElementById('dicas')

// Posicoes dos pontos em porcentagem.
const XY = {
  'mu-torere': [...Array.from({ length: 8 }, (_, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 4
    return [50 + 40 * Math.cos(a), 50 + 40 * Math.sin(a)]
  }), [50, 50]],
  'pong-hau-ki': [[15, 15], [85, 15], [50, 50], [15, 85], [85, 85]]
}

let j, r, s, minhaVez, acabou

function comeca () {
  const v = elJogo.value
  j = v === 'pong' ? jogo(PONG_HAU_KI) : jogo(MU_TORERE, { regra: v === 'regra' })
  r = new Retrograda(j)
  s = j.inicio
  minhaVez = true
  acabou = false
  desenha()
  diz()
}

const texto = (a) => a.dist < 0 ? 'E' : a.valor === VITORIA ? `V${a.dist}` : `D${a.dist}`

function desenha () {
  const xy = XY[j.nome]
  const linhas = []
  j.vizinhos.forEach((l, p) => l.forEach((q) => { if (q > p) linhas.push(`<line x1="${xy[p][0]}" y1="${xy[p][1]}" x2="${xy[q][0]}" y2="${xy[q][1]}"/>`) }))
  elTab.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${linhas.join('')}</svg>`
  const meus = minhaVez && !acabou ? lances(j, s) : []
  const dicas = new Map()
  if (elDicas.checked && minhaVez && !acabou) for (const a of r.avaliaLances(s)) dicas.set(a.lance.de, texto(a))
  for (let p = 0; p < j.pontos; p++) {
    const b = document.createElement('button')
    b.type = 'button'
    // Voce e sempre 'a' na sua vez; na vez da maquina as letras estao trocadas.
    const voce = minhaVez ? 'a' : 'b'
    b.className = 'ponto ' + (s[p] === '.' ? 'vazio' : s[p] === voce ? 'a' : 'b')
    b.style.left = xy[p][0] + '%'
    b.style.top = xy[p][1] + '%'
    if (meus.some((l) => l.de === p)) b.classList.add('pode')
    if (dicas.has(p)) b.dataset.dica = dicas.get(p)
    b.setAttribute('aria-label', `ponto ${p}`)
    b.addEventListener('click', () => clique(p))
    elTab.appendChild(b)
  }
}

function diz () {
  if (acabou) return
  if (!minhaVez) { elEstado.textContent = 'A maquina pensa...'; return }
  const q = r.consulta(s)
  const v = q.dist < 0 ? 'empata com o melhor jogo dos dois' : q.valor === VITORIA ? `voce ganha em ${q.dist}` : `voce perde em ${q.dist}`
  elEstado.textContent = `Sua vez: clique numa peca clara que possa andar para o ponto vazio. Daqui, ${v}.`
}

function confereFim () {
  if (lances(j, s).length) return false
  acabou = true
  elEstado.textContent = minhaVez ? 'Voce ficou sem lance. A maquina ganhou.' : 'A maquina ficou sem lance. Voce ganhou.'
  desenha()
  return true
}

function clique (p) {
  if (acabou || !minhaVez) return
  const l = lances(j, s).find((x) => x.de === p)
  if (!l) return
  s = aplica(s, l)
  minhaVez = false
  desenha()
  if (confereFim()) return
  diz()
  setTimeout(maquina, 350)
}

function maquina () {
  const op = r.avaliaLances(s)
  const nota = (a) => a.dist < 0 ? 0 : a.valor === VITORIA ? 1000 - a.dist : -1000 + a.dist
  op.sort((a, b) => nota(b) - nota(a))
  s = aplica(s, op[0].lance)
  minhaVez = true
  desenha()
  if (confereFim()) return
  diz()
}

document.getElementById('reiniciar').addEventListener('click', comeca)
elJogo.addEventListener('change', comeca)
elDicas.addEventListener('change', desenha)
comeca()
