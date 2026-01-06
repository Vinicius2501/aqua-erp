# Em Desenvolvimento — ERP Aqua (Front-end)

Front-end do **ERP Aqua (Aqua Ledger)**: uma aplicação web **responsiva (desktop + mobile)** para suportar o ciclo de POs (criação, acompanhamento, aprovações e validações como Legal/Contratos), com **Design System próprio** (tokens) e UI baseada em componentes.

---

## Stack e decisões técnicas

- **React 19 + TypeScript**
- **Vite** (DX rápida, build otimizado)
- **React Router** (rotas e navegação SPA)
- **Tailwind CSS v4 + @tailwindcss/vite** (tokens + utilitários)
- **shadcn/ui + Radix UI** (componentes acessíveis e reutilizáveis)
- **TanStack React Query** (cache, fetch e estado server-side)
- **Sonner** (toasts)
- **Lucide** (ícones)
- **next-themes** (suporte a tema/dark mode — em evolução)

---

## Requisitos

- **Node.js** (recomendado: LTS)
- **npm**

---

## Como rodar localmente

Instalar dependências:

```bash
npm install
```

Subir ambiente de desenvolvimento:
```bash
npm run dev
```
Build de produção:
```bash
npm run build
```
Preview do build:
```bash
npm run preview
```
Lint:
```bash
npm run lint
```




