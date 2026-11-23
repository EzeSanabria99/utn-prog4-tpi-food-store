# Trabajo Práctico Integrador (TPI) — Food Store (Programación IV - UTN)

Aplicación full-stack **Food Store** desarrollada con **FastAPI** (JWT en cookie `HttpOnly`, roles `user` y `admin`, gestión de categorías, productos con control de stock y pedidos con transiciones de estado y restitución de stock al cancelar) y **React + TypeScript** (arquitectura modular por `features/`, `shared/`, `store/` y `routes/`, alias `@/`, TanStack Query y Zustand).

## Enlaces del proyecto

- **Repositorio público en GitHub:** `COMPLETAR_URL_REPOSITORIO_GITHUB`
- **Video de demostración (10 a 15 minutos):** `COMPLETAR_URL_PUBLICA_VIDEO`

## Requisitos previos

- **Python:** 3.11 o superior
- **Node.js:** 18 o superior y **pnpm** (o npm)

## Estructura del proyecto

- `backend/`: API REST en FastAPI (`app/`), script de carga inicial (`python -m app.db.seed`), `requirements.txt` y `.env.example`.
- `frontend/`: aplicación React + TypeScript organizada por features (`auth`, `categories`, `products`, `orders`, `ingredients`), `package.json` y `.env.example`.
- `README.md`: guía principal de instalación, variables de entorno, ejecución y credenciales.

## Variables de entorno

### Backend (`backend/.env.example` -> `backend/.env`)

```env
SECRET_KEY=cambia_esta_clave_por_una_de_al_menos_32_caracteres_en_produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=sqlite:///./tpi.db