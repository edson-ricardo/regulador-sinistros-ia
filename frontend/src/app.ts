const ANO_ATUAL = 2026;
const QUANTIDADE_CLIENTES = 500;

type FaixaCondutor = 'Jovem (18–25)' | 'Intermediária (26–69)' | 'Sênior (70+)';
type PerfilVeiculo = 'Padrão (até 15 anos)' | 'Importado (limite menor)' | 'Antigo / Restrito (15–35+ anos)';
type CoberturaTipo = 'Compreensiva' | 'Roubo, Furto e Terceiros (Específica)';
type FormaPagamento = 'Pix (À vista)' | 'Boleto (Parcelado)' | 'Cartão de Crédito (Parcelado)';
type StatusSolicitacaoSeguradora = 'AGUARDANDO SEGURADORA' | 'APROVADA PELA SEGURADORA' | 'RECUSADA PELA SEGURADORA';

interface Cliente {
  id: string;
  nome: string;
  idadeCondutor: number;
  faixaCondutor: FaixaCondutor;
  anoCarro: number;
  importado: boolean;
  perfilVeiculo: PerfilVeiculo;
  valorVeiculo: number;
  quantidadeSinistros: number;
}

interface PoliticaSeguradora {
  id: string;
  nome: string;
  taxaBase: number;
  pesoJovem: number;
  pesoSenior: number;
  pesoImportado: number;
  pesoAntigo: number;
  pesoSinistro: number;
  limiteAnosCompreensivo: number;
}

interface ResultadoCotacao {
  seguradoraId: string;
  seguradora: string;
  valorAnual: number;
  valorMensal: number;
  coberturaSugerida: CoberturaTipo;
  motivoPrincipal: string;
  scoreRiscoIA: number;
}

interface SolicitacaoRiscoSeguradora {
  id: string;
  cliente: Cliente;
  cotacao: ResultadoCotacao;
  motivoRiscoIA: string;
  status: StatusSolicitacaoSeguradora;
}

interface ApoliceFinalizada {
  numeroApolice: string;
  dataEmissao: string;
  cliente: Cliente;
  cotacao: ResultadoCotacao;
  formaPagamento: FormaPagamento;
  detalhePagamento: string;
  origemAprovacao: 'Aprovado direto pela IA' | 'Aprovado pela Seguradora após análise de risco';
}

const TITULOS_ABAS: Record<string, { titulo: string; subtitulo: string }> = {
  clientes: {
    titulo: 'Clientes — Base de Perfis (500)',
    subtitulo: 'Visão de gestão da base de clientes com idade do condutor, ano do carro, valor do veículo e sinistros.'
  },
  cotacoes: {
    titulo: 'Cotações — Simulação & Contratação',
    subtitulo: 'O cliente escolhe a cotação e clica em Contratar: IA libera o pagamento ou envia para análise da seguradora.'
  },
  seguradora: {
    titulo: 'Seguradora — Análise de Risco',
    subtitulo: 'Recebe apenas as contratações sinalizadas como risco pela IA para aprovar ou recusar.'
  },
  finalizado: {
    titulo: 'Finalizado — Documento da Apólice',
    subtitulo: 'Consulta das apólices emitidas após aprovação e pagamento.'
  }
};

const SEGURADORAS_BRASIL: PoliticaSeguradora[] = [
  { id: 'porto-seguro', nome: 'Porto Seguro', taxaBase: 0.036, pesoJovem: 1.42, pesoSenior: 1.18, pesoImportado: 1.25, pesoAntigo: 1.30, pesoSinistro: 0.14, limiteAnosCompreensivo: 20 },
  { id: 'tokio-marine', nome: 'Tokio Marine', taxaBase: 0.034, pesoJovem: 1.38, pesoSenior: 1.15, pesoImportado: 1.22, pesoAntigo: 1.25, pesoSinistro: 0.12, limiteAnosCompreensivo: 18 },
  { id: 'allianz', nome: 'Allianz Seguros', taxaBase: 0.035, pesoJovem: 1.40, pesoSenior: 1.20, pesoImportado: 1.18, pesoAntigo: 1.32, pesoSinistro: 0.13, limiteAnosCompreensivo: 15 },
  { id: 'hdi', nome: 'HDI Seguros', taxaBase: 0.033, pesoJovem: 1.35, pesoSenior: 1.16, pesoImportado: 1.24, pesoAntigo: 1.22, pesoSinistro: 0.12, limiteAnosCompreensivo: 20 },
  { id: 'bradesco', nome: 'Bradesco Seguros', taxaBase: 0.035, pesoJovem: 1.45, pesoSenior: 1.18, pesoImportado: 1.20, pesoAntigo: 1.28, pesoSinistro: 0.15, limiteAnosCompreensivo: 18 },
  { id: 'mapfre', nome: 'Mapfre Seguros', taxaBase: 0.032, pesoJovem: 1.36, pesoSenior: 1.14, pesoImportado: 1.26, pesoAntigo: 1.20, pesoSinistro: 0.11, limiteAnosCompreensivo: 20 },
  { id: 'azul', nome: 'Azul Seguros', taxaBase: 0.030, pesoJovem: 1.32, pesoSenior: 1.12, pesoImportado: 1.30, pesoAntigo: 1.24, pesoSinistro: 0.12, limiteAnosCompreensivo: 15 },
  { id: 'suhai', nome: 'Suhai Seguradora', taxaBase: 0.028, pesoJovem: 1.22, pesoSenior: 1.08, pesoImportado: 1.15, pesoAntigo: 1.10, pesoSinistro: 0.10, limiteAnosCompreensivo: 10 },
  { id: 'zurich', nome: 'Zurich Seguros', taxaBase: 0.034, pesoJovem: 1.39, pesoSenior: 1.17, pesoImportado: 1.21, pesoAntigo: 1.26, pesoSinistro: 0.13, limiteAnosCompreensivo: 18 },
  { id: 'youse', nome: 'Youse Seguros', taxaBase: 0.031, pesoJovem: 1.34, pesoSenior: 1.15, pesoImportado: 1.28, pesoAntigo: 1.27, pesoSinistro: 0.12, limiteAnosCompreensivo: 15 }
];

let clientesBase: Cliente[] = [];
let ultimasCotacoesAtuais: { cliente: Cliente; cotacoes: ResultadoCotacao[] } | null = null;
let solicitacoesSeguradora: SolicitacaoRiscoSeguradora[] = [];
let apolicesFinalizadas: ApoliceFinalizada[] = [];
let pagamentoPendente: {
  cliente: Cliente;
  cotacao: ResultadoCotacao;
  origemAprovacao: 'Aprovado direto pela IA' | 'Aprovado pela Seguradora após análise de risco';
} | null = null;

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function classificarCondutor(idade: number): FaixaCondutor {
  if (idade <= 25) return 'Jovem (18–25)';
  if (idade >= 70) return 'Sênior (70+)';
  return 'Intermediária (26–69)';
}

function classificarVeiculo(anoCarro: number, importado: boolean): PerfilVeiculo {
  const idadeVeiculo = Math.max(0, ANO_ATUAL - anoCarro);
  if (importado && idadeVeiculo > 8) {
    return 'Importado (limite menor)';
  }
  if (idadeVeiculo > 15) {
    return 'Antigo / Restrito (15–35+ anos)';
  }
  return 'Padrão (até 15 anos)';
}

function gerarClientes500(): void {
  const nomes = [
    'Ana Souza', 'Bruno Lima', 'Carla Rocha', 'Diego Melo',
    'Eduarda Alves', 'Felipe Dias', 'Gabriela Pinto', 'Henrique Reis'
  ];

  const lista: Cliente[] = [];

  for (let i = 1; i <= QUANTIDADE_CLIENTES; i++) {
    const idadeCondutor = Math.floor(Math.random() * (85 - 18 + 1)) + 18;
    const anoCarro = Math.floor(Math.random() * (ANO_ATUAL - 1994 + 1)) + 1994;
    const importado = Math.random() < 0.25;
    const valorVeiculo = Math.floor(Math.random() * (160000 - 22000 + 1)) + 22000;
    const quantidadeSinistros = Math.floor(Math.random() * 5);

    lista.push({
      id: `CLI-${String(i).padStart(3, '0')}`,
      nome: `${nomes[i % nomes.length]} #${i}`,
      idadeCondutor,
      faixaCondutor: classificarCondutor(idadeCondutor),
      anoCarro,
      importado,
      perfilVeiculo: classificarVeiculo(anoCarro, importado),
      valorVeiculo,
      quantidadeSinistros
    });
  }

  clientesBase = lista;
  solicitacoesSeguradora = [];
  apolicesFinalizadas = [];
  pagamentoPendente = null;

  const contador = document.getElementById('total-registros');
  if (contador) {
    contador.textContent = String(clientesBase.length);
  }

  renderizarTabelaClientes();
  renderizarSolicitacoesSeguradora();
  renderizarApolicesFinalizadas();
}

function renderizarTabelaClientes(filtro: string = ''): void {
  const tbody = document.getElementById('tabela-clientes-body');
  if (!tbody) return;

  const termo = filtro.trim().toLowerCase();
  const filtrados = clientesBase.filter(
    (c) =>
      c.id.toLowerCase().includes(termo) ||
      c.nome.toLowerCase().includes(termo) ||
      String(c.anoCarro).includes(termo) ||
      c.perfilVeiculo.toLowerCase().includes(termo)
  );

  if (filtrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">Nenhum cliente encontrado.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtrados
    .map((c) => {
      const badgeClass =
        c.idadeCondutor <= 25
          ? 'badge-risk'
          : c.idadeCondutor >= 70
          ? 'badge-senior'
          : 'badge-balanced';

      return `
        <tr>
          <td><strong>${c.id}</strong></td>
          <td>${c.nome}</td>
          <td>${c.idadeCondutor} anos</td>
          <td><span class="badge ${badgeClass}">${c.faixaCondutor}</span></td>
          <td>${c.anoCarro}</td>
          <td>${c.perfilVeiculo}</td>
          <td>${formatarMoeda(c.valorVeiculo)}</td>
          <td>${c.quantidadeSinistros}</td>
        </tr>
      `;
    })
    .join('');
}

function exibirErroCliente(mensagem: string | null): void {
  const erroEl = document.getElementById('erro-numero-cliente');
  if (!erroEl) return;

  if (!mensagem) {
    erroEl.textContent = '';
    erroEl.classList.add('hidden');
    return;
  }

  erroEl.textContent = mensagem;
  erroEl.classList.remove('hidden');
}

function ocultarAvisoFluxo(): void {
  const aviso = document.getElementById('aviso-fluxo-cotacao');
  if (!aviso) return;
  aviso.innerHTML = '';
  aviso.classList.add('hidden');
}

function exibirAvisoFluxo(html: string, corBordaHex: string): void {
  const aviso = document.getElementById('aviso-fluxo-cotacao');
  if (!aviso) return;
  aviso.style.borderLeft = `4px solid ${corBordaHex}`;
  aviso.innerHTML = html;
  aviso.classList.remove('hidden');
}

function ocultarPainelPagamento(): void {
  const painel = document.getElementById('painel-pagamento');
  if (!painel) return;
  painel.innerHTML = '';
  painel.classList.add('hidden');
}

function renderizarPainelPagamento(): void {
  const painel = document.getElementById('painel-pagamento');
  if (!painel || !pagamentoPendente) {
    ocultarPainelPagamento();
    return;
  }

  const { cliente, cotacao, origemAprovacao } = pagamentoPendente;
  const valorPix = Math.round(cotacao.valorAnual * 0.95);
  const parcela6x = Math.round(cotacao.valorAnual / 6);
  const parcela12x = cotacao.valorMensal;

  painel.classList.remove('hidden');
  painel.innerHTML = `
    <h3 style="margin-bottom: 6px;">Tela de Pagamento — ${cotacao.seguradora}</h3>
    <p style="margin-bottom: 14px; color: #CBD5E1;">
      <strong>Cliente:</strong> ${cliente.nome} (${cliente.id}) ·
      <strong>Cobertura:</strong> ${cotacao.coberturaSugerida} ·
      <strong>Origem:</strong> ${origemAprovacao}
    </p>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
      <div class="card" style="padding: 14px;">
        <strong>Pix (À vista · 5% off)</strong>
        <div style="font-size: 1.15rem; font-weight: 700; margin: 6px 0; color: #34D399;">
          ${formatarMoeda(valorPix)}
        </div>
        <button
          type="button"
          class="btn btn-primary btn-confirmar-pagamento"
          data-forma="Pix (À vista)"
          data-detalhe="À vista no Pix (${formatarMoeda(valorPix)})"
          style="width: 100%;"
        >
          Pagar no Pix
        </button>
      </div>

      <div class="card" style="padding: 14px;">
        <strong>Boleto Bancário (Parcelado)</strong>
        <div style="font-size: 1.15rem; font-weight: 700; margin: 6px 0;">
          6x de ${formatarMoeda(parcela6x)}
        </div>
        <button
          type="button"
          class="btn btn-primary btn-confirmar-pagamento"
          data-forma="Boleto (Parcelado)"
          data-detalhe="6x de ${formatarMoeda(parcela6x)} no Boleto (Total ${formatarMoeda(cotacao.valorAnual)})"
          style="width: 100%;"
        >
          Pagar com Boleto
        </button>
      </div>

      <div class="card" style="padding: 14px;">
        <strong>Cartão de Crédito (Parcelado)</strong>
        <div style="font-size: 1.15rem; font-weight: 700; margin: 6px 0;">
          12x de ${formatarMoeda(parcela12x)}
        </div>
        <button
          type="button"
          class="btn btn-primary btn-confirmar-pagamento"
          data-forma="Cartão de Crédito (Parcelado)"
          data-detalhe="12x de ${formatarMoeda(parcela12x)} no Cartão de Crédito (Total ${formatarMoeda(cotacao.valorAnual)})"
          style="width: 100%;"
        >
          Pagar com Cartão
        </button>
      </div>
    </div>
  `;
}

function limparTelaCotacoes(mensagemEstadoVazio?: string): void {
  ultimasCotacoesAtuais = null;
  pagamentoPendente = null;
  ocultarAvisoFluxo();
  ocultarPainelPagamento();

  const resumo = document.getElementById('resumo-cliente-cotacao');
  const lista = document.getElementById('lista-cotacoes');

  if (resumo) {
    resumo.innerHTML = '';
    resumo.classList.add('hidden');
  }

  if (lista) {
    const texto =
      mensagemEstadoVazio ??
      'Nenhuma cotação gerada ainda. Digite o número do cliente (1 a 500) acima.';
    lista.innerHTML = `<div class="card empty-state">${texto}</div>`;
  }
}

function buscarClientePorNumeroTexto(
  valorDigitado: string
): { vazio?: boolean; cliente?: Cliente; erro?: string } {
  const limpo = valorDigitado.trim();
  if (!limpo) {
    return { vazio: true };
  }

  if (clientesBase.length === 0) {
    return { erro: 'Gere a base de 500 clientes na aba 1 antes de pesquisar.' };
  }

  if (!/^\d+$/.test(limpo)) {
    return { erro: 'Entrada inválida: digite apenas um número inteiro (ex.: 10).' };
  }

  const numero = Number(limpo);
  if (!Number.isSafeInteger(numero) || numero <= 0 || numero > clientesBase.length) {
    return {
      erro: `Número fora do intervalo: informe um valor entre 1 e ${clientesBase.length}.`
    };
  }

  const idEsperado = `CLI-${String(numero).padStart(3, '0')}`;
  const clienteEncontrado = clientesBase.find((c) => c.id === idEsperado);

  if (!clienteEncontrado) {
    return { erro: `Cliente ${idEsperado} não encontrado na base.` };
  }

  return { cliente: clienteEncontrado };
}

function calcularScoreRiscoIA(cliente: Cliente, idadeVeiculo: number): number {
  let score = 15;
  if (cliente.idadeCondutor <= 25) score += 25;
  else if (cliente.idadeCondutor >= 70) score += 18;

  if (cliente.importado) score += 12;
  if (idadeVeiculo > 15) score += 18;
  score += Math.min(30, cliente.quantidadeSinistros * 10);

  return Math.min(99, Math.max(5, score));
}

function calcularCotacaoPorEmpresa(cliente: Cliente, politica: PoliticaSeguradora): ResultadoCotacao {
  const idadeVeiculo = Math.max(0, ANO_ATUAL - cliente.anoCarro);
  let premio = cliente.valorVeiculo * politica.taxaBase;
  const fatores: string[] = [];

  if (cliente.idadeCondutor <= 25) {
    premio *= politica.pesoJovem;
    fatores.push(`jovem 18–25 (${politica.pesoJovem}x)`);
  } else if (cliente.idadeCondutor >= 70) {
    premio *= politica.pesoSenior;
    fatores.push(`sênior 70+ (${politica.pesoSenior}x)`);
  }

  if (cliente.importado) {
    premio *= politica.pesoImportado;
    fatores.push(`importado (${politica.pesoImportado}x)`);
  }

  if (idadeVeiculo > 15) {
    premio *= politica.pesoAntigo;
    fatores.push(`veículo ${idadeVeiculo} anos (${politica.pesoAntigo}x)`);
  }

  if (cliente.quantidadeSinistros > 0) {
    const fatorSinistro = 1 + cliente.quantidadeSinistros * politica.pesoSinistro;
    premio *= fatorSinistro;
    fatores.push(`${cliente.quantidadeSinistros} sinistro(s)`);
  }

  const valorAnual = Math.round(premio);
  const valorMensal = Math.round(valorAnual / 12);
  const coberturaSugerida: CoberturaTipo =
    idadeVeiculo > politica.limiteAnosCompreensivo
      ? 'Roubo, Furto e Terceiros (Específica)'
      : 'Compreensiva';

  return {
    seguradoraId: politica.id,
    seguradora: politica.nome,
    valorAnual,
    valorMensal,
    coberturaSugerida,
    motivoPrincipal: fatores.length > 0 ? fatores.join(' • ') : 'Perfil padrão sem agravantes',
    scoreRiscoIA: calcularScoreRiscoIA(cliente, idadeVeiculo)
  };
}

function avaliarRiscoContratacaoIA(cliente: Cliente, cotacao: ResultadoCotacao): {
  temRisco: boolean;
  motivoRisco: string;
} {
  const idadeVeiculo = Math.max(0, ANO_ATUAL - cliente.anoCarro);
  const politica = SEGURADORAS_BRASIL.find((p) => p.id === cotacao.seguradoraId);
  const limiteAnos = politica?.limiteAnosCompreensivo ?? 15;
  const motivos: string[] = [];

  if (cliente.idadeCondutor <= 25) {
    motivos.push('condutor jovem (18–25 anos)');
  }
  if (cliente.idadeCondutor >= 70) {
    motivos.push('condutor sênior (70+ anos)');
  }
  if (cliente.quantidadeSinistros >= 2) {
    motivos.push(`${cliente.quantidadeSinistros} sinistros no histórico`);
  }
  if (idadeVeiculo > limiteAnos) {
    motivos.push(`veículo com ${idadeVeiculo} anos acima do limite compreensivo (${limiteAnos} anos)`);
  }
  if (cotacao.scoreRiscoIA >= 55) {
    motivos.push(`score de risco IA elevado (${cotacao.scoreRiscoIA}/100)`);
  }

  return {
    temRisco: motivos.length > 0,
    motivoRisco: motivos.length > 0 ? motivos.join(' · ') : 'Perfil dentro dos parâmetros seguros da IA'
  };
}

function finalizarEmissaoApolice(
  cliente: Cliente,
  cotacao: ResultadoCotacao,
  formaPagamento: FormaPagamento,
  detalhePagamento: string,
  origemAprovacao: 'Aprovado direto pela IA' | 'Aprovado pela Seguradora após análise de risco'
): ApoliceFinalizada {
  const seq = String(apolicesFinalizadas.length + 1).padStart(3, '0');
  const numeroApolice = `AP-${ANO_ATUAL}-${cliente.id.replace('CLI-', '')}-${seq}`;
  const dataEmissao = new Date().toLocaleString('pt-BR');

  const apolice: ApoliceFinalizada = {
    numeroApolice,
    dataEmissao,
    cliente,
    cotacao,
    formaPagamento,
    detalhePagamento,
    origemAprovacao
  };

  apolicesFinalizadas.unshift(apolice);
  pagamentoPendente = null;
  ocultarPainelPagamento();
  renderizarApolicesFinalizadas();

  exibirAvisoFluxo(
    `<strong>Contratação concluída!</strong> Apólice <strong>${apolice.numeroApolice}</strong> emitida via <strong>${formaPagamento}</strong>. Clique na aba <strong>4. Finalizado</strong> para visualizar o documento completo.`,
    '#34D399'
  );

  return apolice;
}

function renderizarSolicitacoesSeguradora(): void {
  const container = document.getElementById('lista-solicitacoes-seguradora');
  if (!container) return;

  if (solicitacoesSeguradora.length === 0) {
    container.innerHTML = `
      <div class="card empty-state">
        Nenhuma solicitação de risco enviada pela IA para a seguradora no momento.
      </div>
    `;
    return;
  }

  container.innerHTML = solicitacoesSeguradora
    .map((sol) => {
      const acoesHtml =
        sol.status === 'AGUARDANDO SEGURADORA'
          ? `
            <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
              <button
                type="button"
                class="btn btn-primary btn-seguradora-aprovar"
                data-solicitacao-id="${sol.id}"
              >
                ✓ Aprovar Contratação
              </button>
              <button
                type="button"
                class="btn btn-seguradora-recusar"
                data-solicitacao-id="${sol.id}"
                style="background: rgba(248, 113, 113, 0.15); color: #F87171; border: 1px solid rgba(248, 113, 113, 0.4);"
              >
                ✕ Recusar Contratação
              </button>
            </div>
          `
          : `<p style="margin-top: 10px; font-weight: 600;">Status atual: ${sol.status}</p>`;

      return `
        <div class="card mb-24" style="border-left: 4px solid #FBBF24;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
            <h4>${sol.id} — ${sol.cotacao.seguradora}</h4>
            <span class="badge badge-senior">${sol.status}</span>
          </div>
          <p style="margin: 8px 0 6px 0;">
            <strong>Cliente:</strong> ${sol.cliente.nome} (${sol.cliente.id}) ·
            <strong>Idade:</strong> ${sol.cliente.idadeCondutor} anos ·
            <strong>Veículo:</strong> ${sol.cliente.anoCarro} (${formatarMoeda(sol.cliente.valorVeiculo)}) ·
            <strong>Sinistros:</strong> ${sol.cliente.quantidadeSinistros}
          </p>
          <p style="margin: 0 0 6px 0;">
            <strong>Cotação escolhida:</strong> ${formatarMoeda(sol.cotacao.valorAnual)}/ano (${formatarMoeda(sol.cotacao.valorMensal)}/mês) ·
            <strong>Cobertura:</strong> ${sol.cotacao.coberturaSugerida} ·
            <strong>Score IA:</strong> ${sol.cotacao.scoreRiscoIA}/100
          </p>
          <p style="margin: 0; color: #FBBF24;">
            <strong>Motivo do alerta de risco pela IA:</strong> ${sol.motivoRiscoIA}
          </p>
          ${acoesHtml}
        </div>
      `;
    })
    .join('');
}

function renderizarApolicesFinalizadas(): void {
  const container = document.getElementById('lista-apolices-finalizadas');
  if (!container) return;

  if (apolicesFinalizadas.length === 0) {
    container.innerHTML = `
      <div class="card empty-state">
        Nenhuma apólice finalizada ainda. Conclua uma contratação com pagamento para gerar o documento aqui.
      </div>
    `;
    return;
  }

  container.innerHTML = apolicesFinalizadas
    .map((ap) => `
      <div class="card mb-24" style="border-left: 4px solid #38BDF8;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; border-bottom: 1px solid rgba(148, 163, 184, 0.2); padding-bottom: 10px; margin-bottom: 12px;">
          <div>
            <small style="color: #94A3B8;">DOCUMENTO DE APÓLICE EMITIDA</small>
            <h3 style="margin: 2px 0 0 0;">Apólice Nº ${ap.numeroApolice}</h3>
          </div>
          <span class="badge badge-balanced">VIGENTE / PAGO</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 12px;">
          <div>
            <small style="color: #94A3B8;">Seguradora</small>
            <div><strong>${ap.cotacao.seguradora}</strong></div>
          </div>
          <div>
            <small style="color: #94A3B8;">Segurado</small>
            <div><strong>${ap.cliente.nome}</strong> (${ap.cliente.id})</div>
          </div>
          <div>
            <small style="color: #94A3B8;">Veículo</small>
            <div>Ano ${ap.cliente.anoCarro} · ${formatarMoeda(ap.cliente.valorVeiculo)}</div>
          </div>
          <div>
            <small style="color: #94A3B8;">Cobertura</small>
            <div>${ap.cotacao.coberturaSugerida}</div>
          </div>
          <div>
            <small style="color: #94A3B8;">Prêmio Anual</small>
            <div><strong>${formatarMoeda(ap.cotacao.valorAnual)}</strong>/ano</div>
          </div>
          <div>
            <small style="color: #94A3B8;">Forma de Pagamento</small>
            <div>${ap.detalhePagamento}</div>
          </div>
        </div>

        <small style="color: #94A3B8;">
          Aprovação: ${ap.origemAprovacao} · Emitido em: ${ap.dataEmissao}
        </small>
      </div>
    `)
    .join('');
}

function renderizarCotacoes(): void {
  const inputNum = document.getElementById('input-numero-cliente') as HTMLInputElement | null;
  const resumo = document.getElementById('resumo-cliente-cotacao');
  const lista = document.getElementById('lista-cotacoes');

  if (!inputNum || !resumo || !lista) return;

  const { vazio, cliente, erro } = buscarClientePorNumeroTexto(inputNum.value);

  if (vazio) {
    exibirErroCliente(null);
    limparTelaCotacoes();
    return;
  }

  if (erro || !cliente) {
    exibirErroCliente(erro ?? 'Cliente inválido.');
    limparTelaCotacoes('Nenhum valor exibido. Informe um número válido de 1 a 500.');
    return;
  }

  exibirErroCliente(null);
  ocultarAvisoFluxo();
  ocultarPainelPagamento();
  pagamentoPendente = null;

  const cotacoes = SEGURADORAS_BRASIL
    .map((politica) => calcularCotacaoPorEmpresa(cliente, politica))
    .sort((a, b) => a.valorAnual - b.valorAnual);

  ultimasCotacoesAtuais = { cliente, cotacoes };

  const menorValor = cotacoes[0]?.valorAnual ?? 0;
  const maiorValor = cotacoes[cotacoes.length - 1]?.valorAnual ?? 0;

  resumo.classList.remove('hidden');
  resumo.innerHTML = `
    <strong>Cliente:</strong> ${cliente.nome} (${cliente.id}) ·
    <strong>Idade:</strong> ${cliente.idadeCondutor} anos ·
    <strong>Ano:</strong> ${cliente.anoCarro} ·
    <strong>Veículo:</strong> ${formatarMoeda(cliente.valorVeiculo)} ·
    <strong>Sinistros:</strong> ${cliente.quantidadeSinistros}<br/>
    <small style="color: #94A3B8;">
      Faixa de cotações nas 10 seguradoras: de <strong>${formatarMoeda(menorValor)}/ano</strong> até <strong>${formatarMoeda(maiorValor)}/ano</strong>. Clique em <strong>Contratar</strong> na seguradora desejada.
    </small>
  `;

  lista.innerHTML = cotacoes
    .map((cot, index) => `
      <div class="quote-card">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
          <h4>${index + 1}. ${cot.seguradora}</h4>
          <span class="badge badge-balanced">${cot.coberturaSugerida}</span>
        </div>
        <div class="quote-price">
          ${formatarMoeda(cot.valorAnual)} <small style="font-size: 0.85rem; font-weight: 500;">/ano</small>
        </div>
        <div class="quote-detail">
          <strong>Parcela aprox.:</strong> ${formatarMoeda(cot.valorMensal)}/mês · <strong>Score IA:</strong> ${cot.scoreRiscoIA}/100
        </div>
        <p class="quote-detail"><strong>Critérios aplicados:</strong> ${cot.motivoPrincipal}</p>
        <div style="margin-top: 12px;">
          <button
            type="button"
            class="btn btn-primary btn-contratar"
            data-seguradora-id="${cot.seguradoraId}"
            style="width: 100%;"
          >
            Contratar
          </button>
        </div>
      </div>
    `)
    .join('');
}

function selecionarAba(aba: string): void {
  const botoes = document.querySelectorAll<HTMLButtonElement>('.nav-item');
  const paineis = document.querySelectorAll<HTMLElement>('.tab-panel');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');

  botoes.forEach((b) => b.classList.toggle('active', b.dataset.tab === aba));
  paineis.forEach((p) => p.classList.toggle('active', p.id === `tab-${aba}`));

  const infoAba = TITULOS_ABAS[aba];
  if (infoAba && pageTitle && pageSubtitle) {
    pageTitle.textContent = infoAba.titulo;
    pageSubtitle.textContent = infoAba.subtitulo;
  }

  if (aba === 'seguradora') {
    renderizarSolicitacoesSeguradora();
  } else if (aba === 'finalizado') {
    renderizarApolicesFinalizadas();
  }
}

function configurarEventosCotacoes(): void {
  const lista = document.getElementById('lista-cotacoes');
  lista?.addEventListener('click', (event) => {
    const alvo = event.target as HTMLElement | null;
    const botao = alvo?.closest<HTMLButtonElement>('.btn-contratar');
    if (!botao || !ultimasCotacoesAtuais) return;

    const seguradoraId = botao.dataset.seguradoraId;
    const cotacaoEscolhida = ultimasCotacoesAtuais.cotacoes.find(
      (c) => c.seguradoraId === seguradoraId
    );
    if (!cotacaoEscolhida) return;

    const cliente = ultimasCotacoesAtuais.cliente;
    const avaliacao = avaliarRiscoContratacaoIA(cliente, cotacaoEscolhida);

    if (!avaliacao.temRisco) {
      pagamentoPendente = {
        cliente,
        cotacao: cotacaoEscolhida,
        origemAprovacao: 'Aprovado direto pela IA'
      };
      exibirAvisoFluxo(
        `<strong>IA aprovou a contratação!</strong> Perfil validado sem alertas de risco para <strong>${cotacaoEscolhida.seguradora}</strong>. Escolha a forma de pagamento abaixo.`,
        '#34D399'
      );
      renderizarPainelPagamento();
      document.getElementById('painel-pagamento')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      pagamentoPendente = null;
      ocultarPainelPagamento();

      const novaSolicitacao: SolicitacaoRiscoSeguradora = {
        id: `SOL-${String(solicitacoesSeguradora.length + 1).padStart(3, '0')}`,
        cliente,
        cotacao: cotacaoEscolhida,
        motivoRiscoIA: avaliacao.motivoRisco,
        status: 'AGUARDANDO SEGURADORA'
      };

      solicitacoesSeguradora.unshift(novaSolicitacao);
      renderizarSolicitacoesSeguradora();

      exibirAvisoFluxo(
        `<strong>Atenção — Contratação enviada para análise!</strong> A IA identificou risco (<em>${avaliacao.motivoRisco}</em>) e encaminhou a solicitação <strong>${novaSolicitacao.id}</strong> para a aba <strong>3. Seguradora</strong> decidir o aceite.`,
        '#FBBF24'
      );
    }
  });

  const painelPag = document.getElementById('painel-pagamento');
  painelPag?.addEventListener('click', (event) => {
    const alvo = event.target as HTMLElement | null;
    const botao = alvo?.closest<HTMLButtonElement>('.btn-confirmar-pagamento');
    if (!botao || !pagamentoPendente) return;

    const forma = botao.dataset.forma as FormaPagamento | undefined;
    const detalhe = botao.dataset.detalhe;
    if (!forma || !detalhe) return;

    finalizarEmissaoApolice(
      pagamentoPendente.cliente,
      pagamentoPendente.cotacao,
      forma,
      detalhe,
      pagamentoPendente.origemAprovacao
    );
  });
}

function configurarEventosSeguradora(): void {
  const container = document.getElementById('lista-solicitacoes-seguradora');
  container?.addEventListener('click', (event) => {
    const alvo = event.target as HTMLElement | null;
    const btnAprovar = alvo?.closest<HTMLButtonElement>('.btn-seguradora-aprovar');
    const btnRecusar = alvo?.closest<HTMLButtonElement>('.btn-seguradora-recusar');

    const solicitacaoId = btnAprovar?.dataset.solicitacaoId ?? btnRecusar?.dataset.solicitacaoId;
    if (!solicitacaoId) return;

    const solicitacao = solicitacoesSeguradora.find((s) => s.id === solicitacaoId);
    if (!solicitacao || solicitacao.status !== 'AGUARDANDO SEGURADORA') return;

    if (btnAprovar) {
      solicitacao.status = 'APROVADA PELA SEGURADORA';
      renderizarSolicitacoesSeguradora();

      selecionarAba('cotacoes');
      const inputNum = document.getElementById('input-numero-cliente') as HTMLInputElement | null;
      const numCliente = Number(solicitacao.cliente.id.replace('CLI-', ''));
      if (inputNum && !Number.isNaN(numCliente)) {
        inputNum.value = String(numCliente);
        renderizarCotacoes();
      }

      pagamentoPendente = {
        cliente: solicitacao.cliente,
        cotacao: solicitacao.cotacao,
        origemAprovacao: 'Aprovado pela Seguradora após análise de risco'
      };
      exibirAvisoFluxo(
        `<strong>Seguradora aprovou a solicitação ${solicitacao.id}!</strong> Agora escolha a forma de pagamento (Pix, Boleto ou Cartão de Crédito) para emitir a apólice.`,
        '#34D399'
      );
      renderizarPainelPagamento();
    } else if (btnRecusar) {
      solicitacao.status = 'RECUSADA PELA SEGURADORA';
      renderizarSolicitacoesSeguradora();
    }
  });
}

function configurarAbas(): void {
  const botoes = document.querySelectorAll<HTMLButtonElement>('.nav-item');
  botoes.forEach((btn) => {
    btn.addEventListener('click', () => {
      const aba = btn.dataset.tab;
      if (aba) {
        selecionarAba(aba);
      }
    });
  });
}

function iniciarApp(): void {
  configurarAbas();
  configurarEventosCotacoes();
  configurarEventosSeguradora();

  const btnGerar = document.getElementById('btn-gerar-base');
  btnGerar?.addEventListener('click', () => {
    gerarClientes500();
    renderizarCotacoes();
  });

  const inputBusca = document.getElementById('busca-cliente') as HTMLInputElement | null;
  inputBusca?.addEventListener('input', () => {
    renderizarTabelaClientes(inputBusca.value);
  });

  const inputNum = document.getElementById('input-numero-cliente') as HTMLInputElement | null;
  inputNum?.addEventListener('input', () => {
    renderizarCotacoes();
  });

  inputNum?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      renderizarCotacoes();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarApp);
} else {
  iniciarApp();
}