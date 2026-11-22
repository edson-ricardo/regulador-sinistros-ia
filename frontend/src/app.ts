const ANO_ATUAL = 2026;
const QUANTIDADE_CLIENTES = 500;

type FaixaCondutor = 'Jovem (18–25)' | 'Intermediária (26–79)' | 'Sênior (70+)';
type PerfilVeiculo = 'Padrão (até 15 anos)' | 'Importado (limite menor)' | 'Antigo / Restrito (15–35+ anos)';

interface Cliente {
  id: string;
  nome: string;
  idadeCondutor: number;
  faixaCondutor: FaixaCondutor;
  anoCarro: number;
  perfilVeiculo: PerfilVeiculo;
  valorVeiculo: number;
  quantidadeSinistros: number;
}

let clientesBase: Cliente[] = [];

function classificarCondutor(idade: number): FaixaCondutor {
  if (idade <= 25) return 'Jovem (18–25)';
  if (idade >= 70) return 'Sênior (70+)';
  return 'Intermediária (26–79)';
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

  const selectCotacao = document.getElementById('select-cliente-cotacao') as HTMLSelectElement | null;
  if (selectCotacao) {
    selectCotacao.innerHTML = clientesBase
      .map((c) => `<option value="${c.id}">${c.id} — ${c.nome} (${c.anoCarro})</option>`)
      .join('');
  }

  renderizarTabelaClientes();
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
          <td>${c.valorVeiculo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
          <td>${c.quantidadeSinistros}</td>
        </tr>
      `;
    })
    .join('');
}

function configurarAbas(): void {
  const botoes = document.querySelectorAll<HTMLButtonElement>('.nav-item');
  const paineis = document.querySelectorAll<HTMLElement>('.tab-panel');

  botoes.forEach((btn) => {
    btn.addEventListener('click', () => {
      const aba = btn.dataset.tab;
      if (!aba) return;

      botoes.forEach((b) => b.classList.remove('active'));
      paineis.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${aba}`)?.classList.add('active');
    });
  });
}

function iniciarApp(): void {
  configurarAbas();

  const btnGerar = document.getElementById('btn-gerar-base');
  btnGerar?.addEventListener('click', gerarClientes500);

  const inputBusca = document.getElementById('busca-cliente') as HTMLInputElement | null;
  inputBusca?.addEventListener('input', () => {
    renderizarTabelaClientes(inputBusca.value);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarApp);
} else {
  iniciarApp();
}