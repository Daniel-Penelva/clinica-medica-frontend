<div align="center">

# 🏥 Clínica Médica — Frontend

### Sistema de Gestão de Clínica Médica

[![Angular](https://img.shields.io/badge/Angular-17-red?style=for-the-badge&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Angular Material](https://img.shields.io/badge/Angular_Material-17-purple?style=for-the-badge&logo=angular)](https://material.angular.io/)
[![JWT](https://img.shields.io/badge/JWT-Auth-purple?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io/)
[![jsPDF](https://img.shields.io/badge/jsPDF-Export-orange?style=for-the-badge)](https://github.com/parallax/jsPDF)

> Interface moderna e responsiva para gestão de clínica médica, construída com Angular 17 Standalone Components, Signals e Angular Material.

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Telas do Sistema](#-telas-do-sistema)
- [Como Executar](#-como-executar)
- [Boas Práticas Implementadas](#-boas-práticas-implementadas)
- [Autor](#-autor)

---

## 💡 Sobre o Projeto

O **Clínica Médica Frontend** é uma Single Page Application (SPA) desenvolvida com **Angular 17**, utilizando os recursos mais modernos do framework: **Standalone Components**, **Signals**, nova sintaxe de template (`@if`, `@for`) e **Lazy Loading** em todas as rotas.

A interface foi construída com **Angular Material**, oferecendo um design profissional, consistente e responsivo. A autenticação é feita via **JWT** com interceptor automático que injeta o token em todas as requisições autenticadas.

---

## 🛠 Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Angular | 17 | Framework principal |
| TypeScript | 5.x | Linguagem principal |
| Angular Material | 17 | Componentes de UI |
| RxJS | 7.x | Programação reativa |
| jsPDF | 4.x | Exportação de PDF |
| html2canvas | 1.4.x | Captura de tela para PDF |
| ViaCEP | API pública | Preenchimento automático de endereço |

---

## ✅ Funcionalidades

### 🔐 Autenticação
- Login com Reactive Forms e validação em tempo real
- Token JWT armazenado e renovado automaticamente
- Interceptor HTTP que injeta token em todas as requisições
- AuthGuard protegendo rotas privadas
- Logout com limpeza do token

### 🎨 Layout
- Navbar com menu do usuário e botão hamburguer
- Sidebar responsivo com itens filtrados por perfil
- Shell Component como container principal
- Rodapé com identificação do sistema
- Feedback visual com MatSnackBar (sucesso/erro)

### 🧑‍⚕️ Pacientes
- Lista paginada com busca em tempo real (debounce 400ms)
- Formulário com máscara de CPF e telefone
- Preenchimento automático de endereço via ViaCEP
- Seleção de UF com MatSelect (27 estados)
- Seleção de convênio buscado do banco
- DatePicker para data de nascimento (pt-BR)
- Dialog de confirmação para desativar

### 👨‍⚕️ Médicos
- Lista paginada com chips de especialidades
- Formulário com gerenciamento de especialidades:
  - **Cadastro**: MatSelect múltiplo
  - **Edição**: MatChips com adicionar/remover em tempo real
- Máscara de telefone

### 📅 Consultas
- Lista paginada com chips coloridos por status
- Ações condicionais por status e perfil:
  - Confirmar presença (ADMIN/RECEP)
  - Realizar consulta (MÉDICO)
  - Cancelar (ADMIN/RECEP)
  - Não compareceu (ADMIN/RECEP)
  - Criar/Ver prontuário (MÉDICO)
- Agendamento com DatePicker e horários fixos

### 📋 Prontuários
- Formulário com campos de anamnese, diagnóstico, prescrição e observações
- Visualização formatada do prontuário
- Histórico completo do paciente com timeline de consultas

### 🏥 Convênios
- CRUD completo (somente ADMIN)
- Tabela com status ativo/inativo

### 👤 Gestão de Usuários
- CRUD completo (somente ADMIN)
- Chips coloridos por perfil (Admin, Médico, Recepcionista)
- Campo de senha com mostrar/ocultar
- Senha opcional na edição

### 📊 Dashboard
- 4 cards coloridos com estatísticas em tempo real
- Tabela da agenda do dia
- Lista das próximas consultas (7 dias)
- Carregamento paralelo com forkJoin

### 📈 Relatórios (somente ADMIN)
- 3 abas: Por Mês, Por Especialidade, Por Status
- Cards de resumo rápido
- Barra visual de percentual por especialidade
- **Exportação de PDF** com jsPDF + html2canvas
- PDF com cabeçalho, título e data de geração

---

## 📁 Estrutura do Projeto

```
src/app/
│
├── core/
│   ├── auth/
│   │   ├── auth.service.ts         # Signals: currentUser, currentRole
│   │   ├── auth.guard.ts           # Protege rotas privadas
│   │   ├── role.guard.ts           # Protege por perfil
│   │   └── jwt.interceptor.ts      # Injeta token JWT
│   │
│   ├── models/                     # Interfaces TypeScript
│   │   ├── paciente.model.ts
│   │   ├── medico.model.ts
│   │   ├── consulta.model.ts
│   │   ├── prontuario.model.ts
│   │   ├── convenio.model.ts
│   │   ├── usuario.model.ts
│   │   ├── dashboard.model.ts
│   │   └── estados.model.ts
│   │
│   └── services/                   # Chamadas HTTP
│       ├── paciente.service.ts
│       ├── medico.service.ts
│       ├── consulta.service.ts
│       ├── prontuario.service.ts
│       ├── convenio.service.ts
│       ├── usuario.service.ts
│       ├── dashboard.service.ts
│       └── cep.service.ts
│
├── shared/
│   ├── layout/
│   │   ├── shell/                  # Container principal
│   │   ├── navbar/                 # Toolbar do topo
│   │   └── sidebar/                # Menu lateral
│   └── components/
│       └── confirm-dialog/         # Dialog reutilizável
│
├── features/
│   ├── login/
│   ├── dashboard/
│   ├── pacientes/
│   │   ├── lista/
│   │   └── form/
│   ├── medicos/
│   │   ├── lista/
│   │   └── form/
│   ├── consultas/
│   │   ├── lista/
│   │   └── form/
│   ├── prontuarios/
│   │   ├── form/
│   │   ├── view/
│   │   └── historico/
│   ├── convenios/
│   │   ├── lista/
│   │   └── form/
│   ├── usuarios/
│   │   ├── lista/
│   │   └── form/
│   └── relatorios/
│
├── app.routes.ts                   # Lazy loading em todas as rotas
└── app.config.ts                   # Configuração standalone
```

---

## 🖥 Telas do Sistema

### Login
- Tela com fundo gradiente azul
- Reactive Forms com validação em tempo real
- Mostrar/ocultar senha
- Spinner no botão durante autenticação

### Dashboard
- 4 cards coloridos: Pacientes Ativos, Médicos Ativos, Consultas Hoje, Consultas no Mês
- Tabela da agenda do dia com status colorido
- Lista das próximas consultas em 7 dias

### Pacientes
- Lista com paginação, busca em tempo real e chips de status
- Formulário com 3 seções: Dados Pessoais, Endereço, Convênio
- CEP com busca automática via ViaCEP e barra de progresso

### Médicos
- Lista com especialidades exibidas como chips
- Formulário com gerenciamento dinâmico de especialidades

### Consultas
- Lista com chips coloridos por status (5 cores diferentes)
- Botões de ação visíveis conforme status e perfil do usuário
- Agendamento com DatePicker e seleção de horário

### Relatórios
- 3 abas organizadas com MatTabGroup
- Barra visual de percentual por especialidade
- Botão de exportar PDF individual por aba

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- npm 9+
- Angular CLI 17+
- Backend rodando em `http://localhost:8080`

### 1. Clone o repositório

```bash
git clone https://github.com/Daniel-Penelva/clinica-medica-frontend.git
cd clinica-medica-frontend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Verifique o arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

### 4. Execute a aplicação

```bash
ng serve
```

Acesse: `http://localhost:4200`

---

## 🔑 Usuários para Teste

> ⚠️ Credenciais disponíveis apenas para fins de demonstração.

| Email | Senha | Perfil |
|---|---|---|
| medico@clinica.com | Medico@123 | Médico |
| recepcionista@clinica.com | Recep@123 | Recepcionista |

> 🔐 **Acesso ADMIN:** disponível mediante solicitação.
> Entre em contato antes da entrevista técnica.
>
> 📧 **Email:** d4n.andrade@gmail.com
> 💼 **LinkedIn:** [linkedin.com/in/danielpenalva](https://www.linkedin.com/in/daniel-penelva-andrade/)

---

## 💡 Boas Práticas Implementadas

### Angular 17 Moderno
- ✅ Standalone Components — sem NgModules
- ✅ Signals para estado reativo (`currentUser`, `currentRole`)
- ✅ Nova sintaxe de template (`@if`, `@for`, `@else`)
- ✅ Lazy Loading em todas as rotas com `loadComponent`
- ✅ `inject()` em vez de injeção no construtor

### UX e Formulários
- ✅ Debounce de 400ms na busca para reduzir requisições
- ✅ `forkJoin` no Dashboard para requisições paralelas
- ✅ Máscaras de CPF e telefone sem biblioteca externa
- ✅ CEP automático via ViaCEP com feedback visual
- ✅ DatePicker em pt-BR com bloqueio de datas passadas
- ✅ Spinners e estados de loading em todas as telas
- ✅ Chips coloridos por status das consultas

### Segurança
- ✅ JWT Interceptor automático em todas as requisições
- ✅ AuthGuard protegendo rotas privadas
- ✅ Botões e menus filtrados por perfil no frontend
- ✅ Sidebar com itens condicionais por role

### Padrões de Código
- ✅ Services separados por domínio
- ✅ Interfaces TypeScript para todos os modelos
- ✅ ConfirmDialog reutilizável para ações destrutivas
- ✅ Mensagens de feedback padronizadas (snack-success/snack-error)
- ✅ CSS consistente em todos os componentes

---

## 👨‍💻 Autor

<div align="center">

**Daniel Penelva de Andrade**

[![GitHub](https://img.shields.io/badge/GitHub-danielpenalva-black?style=for-the-badge&logo=github)](https://github.com/Daniel-Penelva)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Daniel_Penelva-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/daniel-penelva-andrade/)

*© 2026 Daniel Penelva de Andrade — Todos os direitos reservados*

</div>