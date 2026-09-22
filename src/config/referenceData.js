// Dados de referência do plano financeiro (período out–dez/2026).
// Fonte: briefing "App Financeiro" (planejamento). Editáveis via UI onde marcado;
// os demais valores fixos vivem aqui porque mudam raramente (app monousuário).

// Média de semanas por mês usada para converter orçamento semanal <-> mensal.
export const SEMANAS_POR_MES = 4.33

// Fontes de renda (piso fixo — extras/freelas NÃO entram aqui, ver TIPO_EXTRA em transactions).
// Regra do briefing: planejar sempre no piso fixo (~R$10.500 out-dez/2026).
export const FONTES_RENDA = [
  { id: 'mdtrio', nome: 'Grupo MDTRIO', valor: 8000.0, inicio: '2026-10' },
  // Ferah tem faixa R$1.500–1.600; usamos o piso (R$1.500) por regra do briefing.
  { id: 'ferah', nome: 'Ferah', valor: 1500.0, valorMax: 1600.0, inicio: '2026-10' },
  { id: 'oftalmo', nome: 'Clínica Oftalmo', valor: 1000.0, inicio: '2026-10', fim: '2026-12' },
]

// Contas fixas — PF (pessoal) e PJ (empresa). Datas de vencimento PJ não vieram
// especificadas no briefing original (só o total R$1.083,38); os dias abaixo são
// estimativas plausíveis marcadas com diaEstimado — ajuste quando souber a data real.
export const CONTAS_FIXAS = [
  // --- PF ---
  { id: 'aluguel', nome: 'Aluguel', valor: 1772.0, diaVencimento: 10, tipo: 'PF' },
  { id: 'condominio', nome: 'Condomínio', valor: 695.83, diaVencimento: 5, tipo: 'PF' },
  {
    id: 'escola-seb',
    nome: 'Escola SEB (filho)',
    valor: 2663.17,
    diaVencimento: 2,
    tipo: 'PF',
    inicio: '2026-08',
    fim: '2026-12',
    nota: 'Temporária: ago–dez/2026',
  },
  { id: 'consorcio-veiculo', nome: 'Consórcio Veículo', valor: 509.57, diaVencimento: 20, tipo: 'PF' },
  { id: 'telefone', nome: 'Telefone', valor: 89.0, diaVencimento: 21, tipo: 'PF' },
  { id: 'internet', nome: 'Internet', valor: 99.0, diaVencimento: 21, tipo: 'PF' },
  { id: 'seguro-vida', nome: 'Seguro de Vida', valor: 219.07, diaVencimento: 21, tipo: 'PF' },
  { id: 'seguro-auto', nome: 'Seguro Auto', valor: 181.37, diaVencimento: 8, tipo: 'PF', nota: 'Renova em agosto' },
  { id: 'seguro-residencial', nome: 'Seguro Residencial', valor: 34.23, diaVencimento: 18, tipo: 'PF' },
  {
    id: 'cpfl',
    nome: 'CPFL (energia)',
    valor: 259.76,
    diaVencimento: 23,
    tipo: 'PF',
    nota: 'Valor variável mês a mês — ajuste se necessário',
  },
  // Sem dia fixo: vence toda sexta-feira. Instâncias geradas por mês em calculations.js.
  { id: 'faxineira', nome: 'Faxineira (Nina)', valor: 170.0, tipo: 'PF', cadencia: 'semanal-sexta' },
  { id: 'powerlifting', nome: 'Powerlifting', valor: 185.0, diaVencimento: 26, tipo: 'PF' },
  { id: 'cartao-alimentacao-filho', nome: 'Cartão alimentação (filho)', valor: 200.0, diaVencimento: 10, tipo: 'PF' },
  { id: 'xbox-gamepass', nome: 'Microsoft / Xbox Game Pass', valor: 43.9, diaVencimento: 7, tipo: 'PF' },

  // --- PJ (custos da empresa, saem antes da retirada) ---
  { id: 'pj-contador', nome: 'Contador', valor: 318.0, diaVencimento: 5, tipo: 'PJ', diaEstimado: true },
  { id: 'pj-nota-control', nome: 'Nota Control', valor: 44.9, diaVencimento: 10, tipo: 'PJ', diaEstimado: true },
  { id: 'pj-google-one', nome: 'Google One', valor: 49.99, diaVencimento: 15, tipo: 'PJ', diaEstimado: true },
  { id: 'pj-taxa-sicoob', nome: 'Taxa Sicoob', valor: 19.9, diaVencimento: 5, tipo: 'PJ', diaEstimado: true },
  { id: 'pj-darf', nome: 'DARF', valor: 178.31, diaVencimento: 20, tipo: 'PJ', diaEstimado: true },
  { id: 'pj-simples-nacional', nome: 'Simples Nacional', valor: 472.28, diaVencimento: 20, tipo: 'PJ', diaEstimado: true },
]

// Contas contábeis (envelopes de orçamento variável).
// Assunção de produto (não estava 100% explícita no briefing): "Comer fora" não
// tem orçado próprio — ele consome o que sobrar do envelope semanal de "Mercado"
// (compartilhaEnvelopeCom). Ajustar se o usuário quiser um pool separado.
export const CONTAS_CONTABEIS = [
  { id: 'cigarro', nome: 'Cigarro', orcadoMensal: 210.0, cadencia: 'mensal' },
  { id: 'investimento', nome: 'Investimento (pague-se primeiro)', orcadoMensal: 300.0, cadencia: 'mensal' },
  {
    id: 'mercado',
    nome: 'Mercado + Limpeza/Higiene/Pet + Proteína + Cerveja em casa',
    orcadoMensal: 1426.43,
    cadencia: 'semanal',
  },
  {
    id: 'comer-fora',
    nome: 'Comer fora',
    orcadoMensal: null,
    cadencia: 'semanal',
    semTeto: true,
    compartilhaEnvelopeCom: 'mercado',
    nota: 'Sem teto fixo — usa o que sobrar do envelope semanal de Mercado',
  },
]

// Valores-seed dos "cofres". Editáveis via UI (persistidos no store em config/cofres).
export const COFRES_SEED = {
  colchao: { nome: 'Colchão (Reserva)', valorAtual: 2394.83, meta: 4510.0 },
  caixaQuitacao: { nome: 'Caixa de Quitação', valorAtual: 0, meta: null },
}
