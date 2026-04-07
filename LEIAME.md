# Tez — Calculadora de Especificação

## Instalação e execução

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev

# 3. Acessar no navegador
http://localhost:3000
```

## Usuários de acesso (já criados)

| E-mail                     | Senha      | Perfil   |
|----------------------------|------------|----------|
| admin@tez.com.br           | tez@2024   | Admin    |
| gerente@boutique.com       | senha123   | Gerente  |
| vendedor@boutique.com      | senha123   | Vendedor |

## Estrutura do projeto

```
tez-app/
├── app/
│   ├── login/          → Tela de login
│   ├── dashboard/      → Início com histórico recente
│   ├── especificacao/  → Calculadora (4 passos)
│   ├── historico/      → Histórico de simulações
│   ├── admin/          → Painel admin (boutiques, usuários, produtos)
│   └── api/            → Backend (auth, simulações, admin)
├── lib/
│   ├── db.ts           → Banco de dados JSON + seed inicial
│   ├── auth.ts         → JWT + sessão por cookie
│   └── calculo.ts      → Motor de cálculo centralizado
├── components/
│   └── Nav.tsx         → Navegação compartilhada
├── data/
│   └── db.json         → Banco criado automaticamente no primeiro acesso
└── middleware.ts        → Proteção de rotas por perfil
```

## Categorias disponíveis

- Cimento Queimado (Matte e Lunar)
- Cristal de Pedras Naturais (#10 e #20)
- Piso Drenante Resinado
- Granulados (9 cores)

## Perfis

- **Vendedor** — faz simulações, vê histórico da boutique
- **Gerente** — tudo do vendedor + cria usuários
- **Admin** — acesso total + painel de gestão

## Próximos passos (Fase 2)

- Editor visual de regras e SKUs no admin
- Exportação PDF
- Integração WhatsApp API
- Dashboards analíticos por boutique
- Integração com ERP/estoque

