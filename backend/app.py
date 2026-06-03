"""
NUTRIBOX — Backend Flask
API REST simples + serve os arquivos estáticos do frontend.
Dados persistidos em backend/data.json (sem banco de dados).
"""
import json
import os
import secrets
import uuid
from datetime import datetime
from functools import wraps

from flask import Flask, jsonify, request, send_from_directory, abort
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend"))
DATA_FILE = os.path.join(BASE_DIR, "data.json")

app = Flask(__name__, static_folder=None)
CORS(app)

# ---------- Persistência simples em JSON ----------
def load_db():
    if not os.path.exists(DATA_FILE):
        return {"users": [], "sessions": {}}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(db):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

# ---------- Dados fixos (cardápio, pedidos, planos) ----------
WEEK_MENU = [
    {"day": "Segunda", "meals": [
        {"type": "Almoço", "name": "Frango grelhado com arroz integral",
         "description": "Peito de frango, arroz integral, brócolis e cenoura",
         "protein": 42, "carbs": 45, "fat": 8, "kcal": 420},
        {"type": "Jantar", "name": "Tilápia com batata-doce",
         "description": "Tilápia ao forno, batata-doce e salada verde",
         "protein": 38, "carbs": 35, "fat": 7, "kcal": 355},
    ]},
    {"day": "Terça", "meals": [
        {"type": "Almoço", "name": "Strogonoff fit de frango",
         "description": "Frango ao molho de iogurte, arroz e legumes",
         "protein": 40, "carbs": 50, "fat": 9, "kcal": 441},
        {"type": "Jantar", "name": "Wrap integral de atum",
         "description": "Wrap integral, atum, alface e tomate",
         "protein": 32, "carbs": 30, "fat": 8, "kcal": 320},
    ]},
    {"day": "Quarta", "meals": [
        {"type": "Almoço", "name": "Carne moída com purê",
         "description": "Patinho moído, purê de mandioquinha e abobrinha",
         "protein": 38, "carbs": 48, "fat": 10, "kcal": 434},
        {"type": "Jantar", "name": "Salada caesar com frango",
         "description": "Mix de folhas, frango grelhado e molho leve",
         "protein": 36, "carbs": 18, "fat": 9, "kcal": 297},
    ]},
    {"day": "Quinta", "meals": [
        {"type": "Almoço", "name": "Salmão com quinoa",
         "description": "Salmão grelhado, quinoa e legumes assados",
         "protein": 40, "carbs": 42, "fat": 14, "kcal": 454},
        {"type": "Jantar", "name": "Sopa de legumes com frango",
         "description": "Sopa cremosa de abóbora com desfiado de frango",
         "protein": 30, "carbs": 28, "fat": 6, "kcal": 286},
    ]},
    {"day": "Sexta", "meals": [
        {"type": "Almoço", "name": "Frango xadrez fit",
         "description": "Frango com pimentões, arroz e shoyu light",
         "protein": 38, "carbs": 52, "fat": 8, "kcal": 432},
        {"type": "Jantar", "name": "Hambúrguer artesanal fit",
         "description": "Pão integral, blend de patinho e salada",
         "protein": 34, "carbs": 38, "fat": 12, "kcal": 396},
    ]},
    {"day": "Sábado", "meals": [
        {"type": "Almoço", "name": "Risoto de cogumelos",
         "description": "Arroz arbóreo, mix de cogumelos e frango",
         "protein": 36, "carbs": 55, "fat": 9, "kcal": 445},
        {"type": "Jantar", "name": "Pizza fit de frango",
         "description": "Massa integral, frango desfiado e tomate",
         "protein": 32, "carbs": 42, "fat": 10, "kcal": 386},
    ]},
    {"day": "Domingo", "meals": [
        {"type": "Almoço", "name": "Lasanha de berinjela",
         "description": "Berinjela, ricota e molho de tomate caseiro",
         "protein": 30, "carbs": 36, "fat": 11, "kcal": 363},
        {"type": "Jantar", "name": "Crepioca recheada",
         "description": "Crepioca de queijo cottage e peito de peru",
         "protein": 28, "carbs": 26, "fat": 7, "kcal": 279},
    ]},
]

MOCK_ORDERS = [
    {"id": "#1042", "date": "2026-04-19", "meals": 21, "status": "entregue"},
    {"id": "#1051", "date": "2026-04-15", "meals": 21, "status": "entregue"},
    {"id": "#1067", "date": "2026-04-21", "meals": 14, "status": "em_rota"},
    {"id": "#1072", "date": "2026-04-22", "meals": 21, "status": "em_preparo"},
    {"id": "#1078", "date": "2026-04-25", "meals": 21, "status": "pendente"},
]

PLANS = [
    {"type": "semanal", "name": "Semanal", "price": 279.9, "period": "/semana",
     "features": ["10 refeições", "Cardápio personalizado", "Entrega programada"],
     "highlighted": False},
    {"type": "mensal", "name": "Quinzenal", "price": 519.8, "period": "",
     "features": ["20 refeições", "Cardápio personalizado",
                  "Entregas programada", "Acompanhamento nutricional"],
     "highlighted": True},
    {"type": "anual", "name": "Mensal", "price": 956.6, "period": "/mês",
     "features": ["Acompanhamento de resultados",
                  "Troca de refeições (flexibilidade)",
                  "Cardápio personalizado",
                  "Rastreamento da entrega",
                  "Acompanhamento nutricional"],
     "highlighted": False},
]

RESTRICTIONS = ["Lactose", "Glúten", "Vegetariano", "Vegano",
                "Frutos do mar", "Amendoim", "Ovos", "Soja"]

# ---------- Helpers ----------
def public_user(u):
    return {k: v for k, v in u.items() if k != "password"}

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "").strip()
        if not token:
            return jsonify({"error": "Não autenticado"}), 401
        db = load_db()
        user_id = db["sessions"].get(token)
        if not user_id:
            return jsonify({"error": "Sessão inválida"}), 401
        user = next((u for u in db["users"] if u["id"] == user_id), None)
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 401
        request.user = user
        request.db = db
        request.token = token
        return fn(*args, **kwargs)
    return wrapper

# ---------- API ----------
@app.post("/api/signup")
def signup():
    data = request.get_json(force=True)
    required = ["fullName", "email", "password", "age", "weight", "height", "goal"]
    for k in required:
        if k not in data:
            return jsonify({"error": f"Campo obrigatório: {k}"}), 400
    db = load_db()
    email = data["email"].strip().lower()
    if any(u["email"].lower() == email for u in db["users"]):
        return jsonify({"error": "E-mail já cadastrado"}), 409

    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password": data["password"],  # mock; em produção, hash!
        "fullName": data["fullName"].strip(),
        "age": int(data["age"]),
        "weight": float(data["weight"]),
        "height": float(data["height"]),
        "goal": data["goal"],
        "restrictions": data.get("restrictions", []),
        "nutrition": None,
        "plan": None,
        "createdAt": datetime.utcnow().isoformat(),
    }
    db["users"].append(user)
    token = secrets.token_hex(16)
    db["sessions"][token] = user["id"]
    save_db(db)
    return jsonify({"token": token, "user": public_user(user)})

@app.post("/api/signin")
def signin():
    data = request.get_json(force=True)
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    db = load_db()
    user = next((u for u in db["users"]
                 if u["email"].lower() == email and u["password"] == password), None)
    if not user:
        return jsonify({"error": "E-mail ou senha inválidos"}), 401
    token = secrets.token_hex(16)
    db["sessions"][token] = user["id"]
    save_db(db)
    return jsonify({"token": token, "user": public_user(user)})

@app.post("/api/signout")
@require_auth
def signout():
    request.db["sessions"].pop(request.token, None)
    save_db(request.db)
    return jsonify({"ok": True})

@app.get("/api/me")
@require_auth
def me():
    return jsonify({"user": public_user(request.user)})

@app.patch("/api/me")
@require_auth
def update_me():
    data = request.get_json(force=True)
    allowed = {"fullName", "age", "weight", "height", "goal",
               "restrictions", "nutrition", "plan"}
    for k, v in data.items():
        if k in allowed:
            request.user[k] = v
    save_db(request.db)
    return jsonify({"user": public_user(request.user)})

@app.get("/api/menu")
def menu():
    return jsonify({"week": WEEK_MENU})

@app.get("/api/orders")
@require_auth
def orders():
    return jsonify({"orders": MOCK_ORDERS})

@app.get("/api/plans")
def plans():
    return jsonify({"plans": PLANS})

@app.get("/api/restrictions")
def restrictions():
    return jsonify({"restrictions": RESTRICTIONS})

# ---------- Servir frontend ----------
@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    full = os.path.join(FRONTEND_DIR, path)
    if os.path.isfile(full):
        return send_from_directory(FRONTEND_DIR, path)
    # fallback: tenta página .html
    if os.path.isfile(full + ".html"):
        return send_from_directory(FRONTEND_DIR, path + ".html")
    abort(404)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
