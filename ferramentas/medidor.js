#!/usr/bin/env node
// O medidor. Roda as tabelas e cospe os numeros que vao para o README.
//
//   node ferramentas/medidor.js            todas
//   node ferramentas/medidor.js resumo     o inicio e todas as posicoes de cada jogo
//   node ferramentas/medidor.js classes    a menos de simetria do grafo
//   node ferramentas/medidor.js regra      onde a regra do Mu Torere muda a resposta
//   node ferramentas/medidor.js juiz       o juiz contra a busca, e o controle

import { resumo, classes, efeitoDaRegra, conferencia } from '../js/medidas.js'

const pad = (s, w) => String(s).padStart(w)
const c = (x) => `vitoria ${pad(x.vitoria, 3)}  derrota ${pad(x.derrota, 3)}  empate ${pad(x.empate, 3)}  (de ${x.total}, vitoria mais longa: ${x.maisLonga} lances)`

function tabelaResumo () {
  console.log('\n== cada jogo: o inicio e todas as posicoes ==')
  for (const l of resumo()) {
    console.log(`\n   ${l.rotulo}`)
    console.log(`     inicio: ${l.inicio}${l.distInicio >= 0 ? ` em ${l.distInicio}` : ''}`)
    console.log(`     primeiros lances: ${l.primeiros.map((p) => `peca ${p.de} -> ${p.resultado}${p.dist >= 0 ? ` em ${p.dist}` : ''}`).join(', ')}`)
    console.log(`     todas:        ${c(l.todas)}`)
    console.log(`     alcancaveis:  ${c(l.alcancaveis)}`)
  }
  console.log('\n   vitoria/derrota do ponto de vista de quem esta na vez')
}

function tabelaClasses () {
  console.log('\n== a menos de simetria do grafo ==')
  for (const l of classes()) {
    console.log(`   ${l.rotulo.padEnd(22)} ${pad(l.simetrias, 2)} simetrias   ${pad(l.classes, 3)} classes   vitoria ${l.vitoria}  derrota ${l.derrota}  empate ${l.empate}`)
  }
}

function tabelaRegra () {
  const r = efeitoDaRegra()
  console.log('\n== o que a regra do Mu Torere faz ==')
  console.log(`   lances proibidos, somando as ${r.posicoes} posicoes: ${r.lancesProibidos}`)
  console.log(`   posicoes cujo valor muda: ${r.muda}`)
  console.log(`     decidida sem a regra, empate com ela: ${r.empateViraDecidido}`)
  console.log(`     empate sem a regra, decidida com ela: ${r.decididoViraEmpate}`)
  console.log(`     decidida nos dois, com dono trocado:  ${r.trocaDeDono}`)
}

function tabelaJuiz () {
  const r = conferencia()
  console.log('\n== o juiz (cores absolutas, lista de arestas, iteracao de valores) contra a busca ==')
  for (const l of r.linhas) {
    console.log(`   ${l.rotulo.padEnd(22)} ${pad(l.posicoes, 3)} posicoes (${l.estadosDoJuiz} estados no juiz)   divergencias ${l.divergencias}   rodadas ${l.rodadas}`)
  }
  console.log(`   controle: juiz sem a regra x busca com a regra: ${r.controle} divergencias`)
}

const partes = { resumo: tabelaResumo, classes: tabelaClasses, regra: tabelaRegra, juiz: tabelaJuiz }
const pedido = process.argv[2]
if (!pedido) {
  for (const f of Object.values(partes)) f()
} else if (partes[pedido]) {
  partes[pedido]()
} else {
  console.error(`nao conheco "${pedido}". conheco: ${Object.keys(partes).join(', ')}`)
  process.exit(1)
}
