import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "sinistros_db.json"

app = FastAPI(title="RiscoZero IA - Backend ML")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PerfilAvaliacao(BaseModel):
    idade_condutor: int
    ano_carro: int
    importado: bool
    valor_veiculo: float
    quantidade_sinistros: int
    limite_anos_seguradora: int = 15
    ano_atual: int = 2026


def carregar_e_treinar_modelo() -> tuple[RandomForestClassifier, list[dict]]:
    if DB_PATH.exists():
        registros = json.loads(DB_PATH.read_text(encoding="utf-8"))
    else:
        registros = []

    if len(registros) < 4:
        registros = [
            {"idade_condutor": 20, "idade_veiculo": 16, "importado": 1, "valor_veiculo": 50000, "qtd_sinistros": 2, "alto_risco": 1},
            {"idade_condutor": 38, "idade_veiculo": 5, "importado": 0, "valor_veiculo": 80000, "qtd_sinistros": 0, "alto_risco": 0},
            {"idade_condutor": 45, "idade_veiculo": 8, "importado": 0, "valor_veiculo": 70000, "qtd_sinistros": 1, "alto_risco": 0},
            {"idade_condutor": 75, "idade_veiculo": 22, "importado": 0, "valor_veiculo": 40000, "qtd_sinistros": 3, "alto_risco": 1},
        ]

    X = [
        [
            r["idade_condutor"],
            r["idade_veiculo"],
            int(r["importado"]),
            r["valor_veiculo"],
            r["qtd_sinistros"],
        ]
        for r in registros
    ]
    y = [r["alto_risco"] for r in registros]

    modelo = RandomForestClassifier(n_estimators=50, random_state=42)
    modelo.fit(X, y)
    return modelo, registros


modelo_ml, base_sinistros = carregar_e_treinar_modelo()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "servico": "RiscoZero IA FastAPI + scikit-learn",
        "registros_treino": len(base_sinistros),
    }


@app.post("/avaliar-risco")
def avaliar_risco(perfil: PerfilAvaliacao):
    idade_veiculo = max(0, perfil.ano_atual - perfil.ano_carro)
    features = [[
        perfil.idade_condutor,
        idade_veiculo,
        int(perfil.importado),
        perfil.valor_veiculo,
        perfil.quantidade_sinistros,
    ]]

    prob_risco = float(modelo_ml.predict_proba(features)[0][1])
    score_ml = round(prob_risco * 100)

    motivos: list[str] = []
    if perfil.quantidade_sinistros >= 2:
        motivos.append(f"{perfil.quantidade_sinistros} sinistros no histórico")
    if idade_veiculo > perfil.limite_anos_seguradora:
        motivos.append(f"veículo com {idade_veiculo} anos acima do limite ({perfil.limite_anos_seguradora} anos)")
    if score_ml >= 65:
        motivos.append(f"modelo scikit-learn apontou risco de {score_ml}/100")

    encaminhar_seguradora = len(motivos) > 0

    return {
        "score_risco_ml": score_ml,
        "encaminhar_seguradora": encaminhar_seguradora,
        "motivo": " · ".join(motivos) if motivos else "Perfil liberado pelo modelo de IA",
        "motor": "scikit-learn (RandomForestClassifier)",
    }