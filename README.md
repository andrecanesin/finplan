# Finplan

Controle financeiro pessoal (MVP) — substitui a planilha Excel. App estático
(React + Vite), hospedado no GitHub Pages, com dados salvos no Firebase
(Firestore). Monousuário: uma única conta de login protege os dados.

3 telas: **Lançar** (lançamento rápido de gasto), **Painel** (cascata do mês +
orçado x realizado por conta contábil + cofres) e **Contas Fixas** (vencimento
e status de cada conta PF/PJ).

## Rodando localmente

```bash
npm install
npm run dev
```

Sem configurar o Firebase (veja abaixo), o app roda normalmente usando
`localStorage` — bom pra testar, mas os dados ficam só nesse navegador e não
sincronizam entre dispositivos.

## Configurando o Firebase (persistência real, entre dispositivos)

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** → Sign-in method → ative **E-mail/senha**. Você cria a
   sua única conta direto pelo app, na tela de login (botão "Primeira vez?
   Criar conta") — não precisa criar pelo console.
3. **Firestore Database** → criar banco (modo produção). Em **Regras**, cole
   o conteúdo de `firestore.rules` deste repo (restringe cada usuário aos
   próprios dados).
4. **Configurações do projeto** → **Seus apps** → adicione um app Web → copie
   as chaves do SDK.
5. Copie `.env.example` para `.env.local` e preencha com essas chaves.
6. `npm run dev` novamente — agora o app já usa o Firestore.

### Deploy (GitHub Pages)

O workflow `.github/workflows/deploy.yml` builda e publica em GitHub Pages a
cada push em `main`. Antes de habilitar:

1. Em **Settings → Pages** do repositório, mude "Build and deployment" para
   **GitHub Actions**.
2. Em **Settings → Secrets and variables → Actions**, cadastre as 6 variáveis
   do `.env.example` (mesmos valores) como *repository secrets* — o workflow
   as usa no build de produção.
3. Dê push em `main` (ou rode o workflow manualmente).

O app fica em `https://<seu-usuário>.github.io/finplan/`. Se o repositório
tiver outro nome, ajuste `base` em `vite.config.js`.

## Dados de referência (out–dez/2026)

Fontes de renda, contas fixas (PF/PJ) e contas contábeis (envelopes de
orçamento) estão em `src/config/referenceData.js`, junto com os valores dos
cofres (Colchão/Caixa de Quitação). Editar esse arquivo é a forma mais rápida
de ajustar valores/vencimentos conforme a realidade mudar — o app é
monousuário, então não há tela de administração desses cadastros no MVP.

**Assunções que valem revisar com você:**

- **Dias de vencimento dos custos PJ** (Contador, Nota Control, Google One,
  Sicoob, DARF, Simples Nacional): o briefing só tinha o total mensal
  (R$1.083,38), não as datas. Usei estimativas plausíveis, marcadas com
  `diaEstimado: true` — ajuste em `referenceData.js` quando souber as datas
  reais.
- **"Comer fora" sem teto**: implementei como consumindo o que sobrar do
  envelope semanal de "Mercado" (mesmo pool), já que o briefing diz que ele
  "usa o que sobrar da Caixa semanal" mas não deixa 100% explícito se é o
  mesmo pool do Mercado ou um pool separado. Ver `compartilhaEnvelopeCom` em
  `referenceData.js`.
- **Lançamento de receita extra** (freelas/e-commerce, que vão pra Caixa de
  Quitação): não faz parte do mockup da Tela 1 (que é só lançamento de
  gasto), então não construí uma tela pra isso agora — os valores dos cofres
  são editáveis manualmente no Painel.

## Como o app calcula

- **Cascata mensal** (`src/lib/calculations.js#calcCascata`): Faturamento
  (soma das fontes ativas no mês) → − Custos PJ → Retirada pessoal → − Fixas
  PF → Sobra do mês → − gasto real em contas contábeis → Saldo do mês.
- **Rollover**: `calcSaldoAcumulado` soma o saldo de todos os meses desde
  out/2026 até o mês selecionado — sobra ou estouro rola automaticamente pro
  mês seguinte.
- **Envelope semanal**: contas contábeis com `cadencia: 'semanal'` liberam o
  orçado em fatias (orçado ÷ 4,33 semanas/mês), acumuladas conforme as
  semanas do mês passam — evita gastar o mês inteiro nas primeiras semanas.
- **Faxineira**: gera uma instância de conta fixa por sexta-feira real do
  calendário daquele mês (4 ou 5x conforme o mês), não um número fixo.
- **Status de conta fixa**: Pago (marcado manualmente) / Atrasado (venceu e
  não foi marcado) / Vence em breve (≤3 dias) / Em dia.
- **Escola SEB**: sai automaticamente do cálculo de Fixas PF a partir de
  jan/2027 (período `inicio`/`fim` em `referenceData.js`), fazendo a sobra
  subir como esperado.

## Estrutura

```
src/
  config/referenceData.js   dados de referência (fontes, contas fixas, contas contábeis, cofres)
  lib/calculations.js       toda a lógica de negócio (cascata, envelopes, status, rollover)
  lib/firebase.js           init do Firebase + auth
  lib/store/                camada de dados (Firestore ou localStorage, mesma interface)
  screens/                  as 3 telas (Lancar, Painel, ContasFixas)
  components/                peças reutilizáveis (nav, badge, barra de progresso, auth)
```
