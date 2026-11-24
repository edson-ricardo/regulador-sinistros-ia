const ANO_ATUAL = 2026;
const QUANTIDADE_CLIENTES = 500;
const SEGURADORAS_BRASIL = [
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
let clientesBase = [];
let ultimasCotacoesAtuais = null;
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function classificarCondutor(idade) {
    if (idade <= 25)
        return 'Jovem (18–25)';
    if (idade >= 70)
        return 'Sênior (70+)';
    return 'Intermediária (26–79)';
}
function classificarVeiculo(anoCarro, importado) {
    const idadeVeiculo = Math.max(0, ANO_ATUAL - anoCarro);
    if (importado && idadeVeiculo > 8) {
        return 'Importado (limite menor)';
    }
    if (idadeVeiculo > 15) {
        return 'Antigo / Restrito (15–35+ anos)';
    }
    return 'Padrão (até 15 anos)';
}
function gerarClientes500() {
    const nomes = [
        'Ana Souza', 'Bruno Lima', 'Carla Rocha', 'Diego Melo',
        'Eduarda Alves', 'Felipe Dias', 'Gabriela Pinto', 'Henrique Reis'
    ];
    const lista = [];
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
    const contador = document.getElementById('total-registros');
    if (contador) {
        contador.textContent = String(clientesBase.length);
    }
    renderizarTabelaClientes();
}
function renderizarTabelaClientes(filtro = '') {
    const tbody = document.getElementById('tabela-clientes-body');
    if (!tbody)
        return;
    const termo = filtro.trim().toLowerCase();
    const filtrados = clientesBase.filter((c) => c.id.toLowerCase().includes(termo) ||
        c.nome.toLowerCase().includes(termo) ||
        String(c.anoCarro).includes(termo) ||
        c.perfilVeiculo.toLowerCase().includes(termo));
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
        const badgeClass = c.idadeCondutor <= 25
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
function exibirErroCliente(mensagem) {
    const erroEl = document.getElementById('erro-numero-cliente');
    if (!erroEl)
        return;
    if (!mensagem) {
        erroEl.textContent = '';
        erroEl.classList.add('hidden');
        return;
    }
    erroEl.textContent = mensagem;
    erroEl.classList.remove('hidden');
}
function ocultarPainelContratacao() {
    const painel = document.getElementById('painel-contratacao-ia');
    if (!painel)
        return;
    painel.innerHTML = '';
    painel.classList.add('hidden');
}
function limparTelaCotacoes(mensagemEstadoVazio) {
    ultimasCotacoesAtuais = null;
    const resumo = document.getElementById('resumo-cliente-cotacao');
    const lista = document.getElementById('lista-cotacoes');
    ocultarPainelContratacao();
    if (resumo) {
        resumo.innerHTML = '';
        resumo.classList.add('hidden');
    }
    if (lista) {
        const texto = mensagemEstadoVazio ??
            'Nenhuma cotação gerada ainda. Digite o número do cliente (1 a 500) acima.';
        lista.innerHTML = `<div class="card empty-state">${texto}</div>`;
    }
}
function buscarClientePorNumeroTexto(valorDigitado) {
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
function calcularScoreRiscoIA(cliente, idadeVeiculo) {
    let score = 18;
    if (cliente.idadeCondutor <= 25)
        score += 22;
    else if (cliente.idadeCondutor >= 70)
        score += 14;
    if (cliente.importado)
        score += 12;
    if (idadeVeiculo > 15)
        score += 16;
    score += Math.min(30, cliente.quantidadeSinistros * 9);
    return Math.min(99, Math.max(5, score));
}
function calcularCotacaoPorEmpresa(cliente, politica) {
    const idadeVeiculo = Math.max(0, ANO_ATUAL - cliente.anoCarro);
    let premio = cliente.valorVeiculo * politica.taxaBase;
    const fatores = [];
    if (cliente.idadeCondutor <= 25) {
        premio *= politica.pesoJovem;
        fatores.push(`jovem 18–25 (${politica.pesoJovem}x)`);
    }
    else if (cliente.idadeCondutor >= 70) {
        premio *= politica.pesoSenior;
        fatores.push(`sênior 70+ (${politica.pesoSenior}x / análise)`);
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
    const coberturaSugerida = idadeVeiculo > politica.limiteAnosCompreensivo
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
function executarContratacaoAutonomaIA(cliente, cotacao) {
    const idadeVeiculo = Math.max(0, ANO_ATUAL - cliente.anoCarro);
    const politica = SEGURADORAS_BRASIL.find((p) => p.id === cotacao.seguradoraId);
    const limiteAnos = politica?.limiteAnosCompreensivo ?? 15;
    const numeroApolice = `APL-IA-${ANO_ATUAL}-${cliente.id.replace('CLI-', '')}-${cotacao.seguradoraId
        .slice(0, 3)
        .toUpperCase()}`;
    if (idadeVeiculo > limiteAnos) {
        return {
            numeroApolice,
            cliente,
            cotacao,
            status: 'APROVADO COM COBERTURA ESPECÍFICA (IA)',
            justificativaIA: `A IA identificou veículo com ${idadeVeiculo} anos (acima do limite de ${limiteAnos} anos para cobertura compreensiva na ${cotacao.seguradora}) e score de risco ${cotacao.scoreRiscoIA}/100.`,
            acaoAutonomaIA: 'A IA enquadrou automaticamente a apólice na modalidade Roubo, Furto e Terceiros e emitiu o contrato sem etapa humana.'
        };
    }
    if (cotacao.scoreRiscoIA >= 60 || cliente.quantidadeSinistros >= 2) {
        return {
            numeroApolice,
            cliente,
            cotacao,
            status: 'VISTORIA AUTOMATIZADA DE RISCO (IA)',
            justificativaIA: `A IA detectou score de risco elevado (${cotacao.scoreRiscoIA}/100) devido a ${cotacao.motivoPrincipal}.`,
            acaoAutonomaIA: 'A IA aprovou a proposta condicionada à vistoria digital automatizada por fotos/telemetria e calibrou a franquia — sem fila humana.'
        };
    }
    return {
        numeroApolice,
        cliente,
        cotacao,
        status: 'APROVADO AUTOMATICAMENTE PELA IA',
        justificativaIA: `Perfil compatível com a política da ${cotacao.seguradora} (score de risco ${cotacao.scoreRiscoIA}/100; ${cotacao.motivoPrincipal}).`,
        acaoAutonomaIA: 'A IA validou os critérios, precificou e emitiu a apólice instantaneamente de forma 100% autônoma.'
    };
}
function renderizarDecisaoContratacaoIA(decisao) {
    const painel = document.getElementById('painel-contratacao-ia');
    if (!painel)
        return;
    painel.classList.remove('hidden');
    painel.innerHTML = `
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px;">
      <div>
        <span class="badge badge-balanced" style="margin-bottom: 6px; display: inline-block;">
          ${decisao.status}
        </span>
        <h3 style="margin: 4px 0 0 0;">
          Apólice ${decisao.numeroApolice} — ${decisao.cotacao.seguradora}
        </h3>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 1.25rem; font-weight: 700;">
          ${formatarMoeda(decisao.cotacao.valorAnual)}/ano
        </div>
        <small style="color: #94A3B8;">
          ${formatarMoeda(decisao.cotacao.valorMensal)}/mês · Cobertura: ${decisao.cotacao.coberturaSugerida}
        </small>
      </div>
    </div>

    <p style="margin: 0 0 8px 0;">
      <strong>Segurado:</strong> ${decisao.cliente.nome} (${decisao.cliente.id}) ·
      <strong>Veículo:</strong> ${decisao.cliente.anoCarro} (${formatarMoeda(decisao.cliente.valorVeiculo)}) ·
      <strong>Score IA:</strong> ${decisao.cotacao.scoreRiscoIA}/100
    </p>
    <p style="margin: 0 0 8px 0; color: #CBD5E1;">
      <strong>Análise autônoma da IA:</strong> ${decisao.justificativaIA}
    </p>
    <p style="margin: 0; color: #38BDF8;">
      <strong>Execução sem fator humano:</strong> ${decisao.acaoAutonomaIA}
    </p>
  `;
    painel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function renderizarCotacoes() {
    const inputNum = document.getElementById('input-numero-cliente');
    const resumo = document.getElementById('resumo-cliente-cotacao');
    const lista = document.getElementById('lista-cotacoes');
    if (!inputNum || !resumo || !lista)
        return;
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
    ocultarPainelContratacao();
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
      Faixa de cotações nas 10 seguradoras: de <strong>${formatarMoeda(menorValor)}/ano</strong> até <strong>${formatarMoeda(maiorValor)}/ano</strong>. Clique em <strong>Contratar (IA)</strong> em qualquer opção para simular a decisão autônoma.
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
            class="btn btn-primary btn-contratar-ia"
            data-seguradora-id="${cot.seguradoraId}"
            style="width: 100%;"
          >
            🤖 Contratar (Decisão IA)
          </button>
        </div>
      </div>
    `)
        .join('');
}
function configurarEventosCotacoes() {
    const lista = document.getElementById('lista-cotacoes');
    lista?.addEventListener('click', (event) => {
        const alvo = event.target;
        const botao = alvo?.closest('.btn-contratar-ia');
        if (!botao || !ultimasCotacoesAtuais)
            return;
        const seguradoraId = botao.dataset.seguradoraId;
        const cotacaoEscolhida = ultimasCotacoesAtuais.cotacoes.find((c) => c.seguradoraId === seguradoraId);
        if (!cotacaoEscolhida)
            return;
        const decisao = executarContratacaoAutonomaIA(ultimasCotacoesAtuais.cliente, cotacaoEscolhida);
        renderizarDecisaoContratacaoIA(decisao);
    });
}
function configurarAbas() {
    const botoes = document.querySelectorAll('.nav-item');
    const paineis = document.querySelectorAll('.tab-panel');
    botoes.forEach((btn) => {
        btn.addEventListener('click', () => {
            const aba = btn.dataset.tab;
            if (!aba)
                return;
            botoes.forEach((b) => b.classList.remove('active'));
            paineis.forEach((p) => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${aba}`)?.classList.add('active');
        });
    });
}
function iniciarApp() {
    configurarAbas();
    configurarEventosCotacoes();
    const btnGerar = document.getElementById('btn-gerar-base');
    btnGerar?.addEventListener('click', () => {
        gerarClientes500();
        renderizarCotacoes();
    });
    const inputBusca = document.getElementById('busca-cliente');
    inputBusca?.addEventListener('input', () => {
        renderizarTabelaClientes(inputBusca.value);
    });
    const inputNum = document.getElementById('input-numero-cliente');
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
}
else {
    iniciarApp();
}
export {};
//# sourceMappingURL=app.js.map