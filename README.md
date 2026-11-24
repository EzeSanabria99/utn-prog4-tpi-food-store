# Trabajo Practico Integrador (TPI) - Food Store (Programacion IV - UTN)

Aplicacion full-stack **Food Store** desarrollada con **FastAPI** (JWT en cookie HttpOnly, roles user y admin, categorias, productos con control de stock y pedidos con estados y restitucion de stock al cancelar) y **React + TypeScript** (arquitectura por features/, shared/, store/ y routes/, alias @/, TanStack Query y Zustand).

## Enlaces del proyecto

- **Repositorio publico en GitHub:** https://github.com/EzeSanabria99/utn-prog4-tpi-food-store
- **Video de demostracion (10 a 15 minutos):** https://youtu.be/GwmnkwMZZoc

## Estructura de entrega

- backend/: API en FastAPI (app/), seed (python -m app.db.seed), requirements.txt y .env.example.
- frontend/: aplicacion React + TypeScript organizada por features (auth, categories, products, orders, ingredients), package.json y .env.example.
- README.md: documentacion principal de instalacion, ejecucion, entorno y credenciales.

## Variables de entorno

### Backend (backend/.env.example -> backend/.env)

SECRET_KEY=cambia_esta_clave_por_una_de_al_menos_32_caracteres_en_produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=sqlite:///./tpi.db

### Frontend (frontend/.env.example -> frontend/.env)

VITE_API_URL=http://localhost:8000

## Credenciales iniciales (python -m app.db.seed)

- **Administrador (admin):** admin@foodstore.local / Admin1234!
- **Cliente (user):** cliente@foodstore.local / Cliente1234!

## Instalacion y ejecucion

### 1. Backend (FastAPI)

1. cd backend
2. pip install -r requirements.txt
3. Copy-Item .env.example .env -Force
4. python -m app.db.seed
5. uvicorn app.main:app --reload

### 2. Frontend (React + TypeScript)

1. cd frontend
2. pnpm install
3. Copy-Item .env.example .env -Force
4. pnpm build
5. pnpm dev
