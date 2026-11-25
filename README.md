# RiscoZero IA — Seguros & Decisão Autônoma

Aplicação web para simulação de cotações, análise de risco com IA (`FastAPI` + `scikit-learn`), aceite automático pela IA, triagem de seguradoras, escolha de pagamento e emissão de apólice.

## Estrutura do Projeto

- `backend/` — API em Python (`FastAPI` + `scikit-learn`) e base `sinistros_db.json`
- `frontend/` — Interface SPA em HTML, CSS e TypeScript (`src/app.ts` compilado para `dist/app.js`)

---

## Como rodar no GitHub Codespaces (Apresentação Online)

### 1. Terminal 1 — Subir o Backend Python (Porta 8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn scikit-learn
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Terminal 2 — Compilar o TypeScript e Subir o Frontend (Porta 5500)

```bash
npx tsc -p frontend/tsconfig.json
cd frontend && python3 -m http.server 5500
```

#### 2.1 - Observação: comando único

```
cd /workspaces/regulador-sinistros-ia/backend && source .venv/bin/activate && nohup uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 & cd /workspaces/regulador-sinistros-ia && npx tsc -p frontend/tsconfig.json && cd frontend && python3 -m http.server 5500
```

### 3. Deixar as Portas Públicas e Conectar a API

1. Abra a aba **Portas** (`Ports`) no Codespaces.
2. Marque a porta **8000** como **Pública** (`Public`) e copie o **Endereço Encaminhado** (ex.: `https://seu-codespace-8000.app.github.dev`).
3. Marque a porta **5500** como **Pública** (`Public`).
4. No arquivo `frontend/src/app.ts`, atualize `API_URL` com a URL pública da porta `8000` (sem barra no final):

```ts
const API_URL = '[https://seu-codespace-8000.app.github.dev](https://seu-codespace-8000.app.github.dev)';
```

5. Recompile e reinicie o servidor do frontend no **Terminal 2** (`Ctrl + C` para parar o servidor atual e depois execute):

```bash
cd .. && npx tsc -p frontend/tsconfig.json && cd frontend && python3 -m http.server 5500
```

6. Abra o link público da porta **5500** no navegador.

---

## Como rodar localmente no Windows (PowerShell)

### 1. Terminal 1 — Backend Python

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn scikit-learn
uvicorn main:app --reload
```

### 2. Terminal 2 — Compilar TypeScript e Abrir o Frontend

```powershell
npx tsc -p frontend/tsconfig.json
```

Certifique-se de que `API_URL` em `frontend/src/app.ts` esteja em `http://127.0.0.1:8000` e abra o `frontend/index.html` no navegador.

---

## Fluxo de Demonstração (6 Abas)

1. **1. Critérios:** exibe os critérios, taxas e limites de cada uma das 10 seguradoras.
2. **2. Clientes:** clique em **Gerar 500 Clientes** para montar a base.
3. **3. Cotações:** informe um número de cliente (`1` a `500`), compare as seguradoras e clique em **Contratar**.
4. **4. Aprovadas IA:** registra aprovações diretas e casos aceitos automaticamente pela IA (liberando o pagamento na tela).
5. **5. Seguradoras:** recebe casos complexos para **Aprovar** ou **Recusar**.
6. **6. Apólices:** exibe o documento da apólice após a escolha da forma de pagamento (**Pix**, **Boleto** ou **Cartão de Crédito**).