# Cardoso Confecções - Loja Online

Uma loja online moderna para fardamentos industriais desenvolvida em React + Tailwind CSS com Firebase.

## 🚀 Funcionalidades

### Para Clientes

- **Home Page**: Banner rotativo, produtos em destaque, notícias da empresa
- **Catálogo de Produtos**: Filtros por nome e categoria, visualização em grid/lista
- **Detalhes do Produto**: Seleção de tamanho, quantidade e adição ao carrinho
- **Carrinho de Compras**: Gerenciamento de itens, quantidades e geração de orçamento
- **Sistema de Orçamento**: Geração de PDF com logo da empresa e envio via WhatsApp
- **Autenticação**: Login e cadastro de usuários
- **Meus Pedidos**: Histórico de pedidos para usuários logados
- **Contato**: Formulário de contato e informações da empresa

### Para Administradores

- **Painel Admin**: Gerenciamento completo de produtos e notícias
- **CRUD de Produtos**: Adicionar, editar, excluir produtos
- **CRUD de Notícias**: Gerenciar notícias da empresa
- **Upload de Imagens**: Integração com Firebase Storage

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **Firebase** - Backend (Auth, Firestore, Storage)
- **React Router** - Roteamento
- **React Hot Toast** - Notificações
- **Swiper** - Carrosséis e sliders
- **jsPDF** - Geração de PDFs
- **Lucide React** - Ícones

## 📋 Pré-requisitos

- Node.js 16+
- npm ou yarn
- Conta no Firebase

## 🔧 Instalação

1. **Clone o repositório**

```bash
git clone <url-do-repositorio>
cd cardosoconfecsite
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure o Firebase**

   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative Authentication, Firestore Database e Storage
   - Copie as credenciais do projeto
   - Atualize o arquivo `src/firebase/config.js` com suas credenciais

4. **Configure as regras do Firestore**

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    match /news/{newsId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. **Configure as regras do Storage**

```javascript
// Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

6. **Execute o projeto**

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 🔐 Configuração do Admin

Para acessar o painel administrativo:

1. **Crie uma conta admin**:

   - Faça login com: `admin@confecc.com` / `14111995`
   - O sistema automaticamente criará o usuário como admin

2. **Ou configure manualmente**:
   - Crie um usuário normal
   - No Firestore, edite o documento do usuário
   - Adicione o campo `isAdmin: true`

## 📱 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.jsx      # Header fixo com navegação
│   └── ProtectedRoute.jsx # Proteção de rotas
├── contexts/           # Contextos React
│   ├── AuthContext.jsx # Autenticação
│   └── CartContext.jsx # Carrinho de compras
├── firebase/           # Configuração Firebase
│   └── config.js       # Credenciais e inicialização
├── pages/              # Páginas da aplicação
│   ├── Home.jsx        # Página inicial
│   ├── Produtos.jsx    # Catálogo de produtos
│   ├── ProdutoDetalhe.jsx # Detalhes do produto
│   ├── Carrinho.jsx    # Carrinho de compras
│   ├── Login.jsx       # Página de login
│   ├── Cadastro.jsx    # Página de cadastro
│   ├── Contato.jsx     # Página de contato
│   ├── MeusPedidos.jsx # Histórico de pedidos
│   └── Admin.jsx       # Painel administrativo
├── App.jsx             # Componente principal
├── index.css           # Estilos globais
└── main.jsx            # Ponto de entrada
```

## 🎨 Paleta de Cores

- **Branco**: 70% (fundo principal)
- **Preto**: 20% (textos, botões, elementos principais)
- **Cinza**: 10% (elementos secundários, bordas)

## 📄 Funcionalidades Principais

### Sistema de Orçamento

1. Cliente adiciona produtos ao carrinho
2. Seleciona tamanhos e quantidades
3. Gera orçamento em PDF
4. PDF é enviado automaticamente via WhatsApp
5. Orçamento é salvo no Firebase (se logado)

### Carrinho de Compras

- Persistência local (usuários não logados)
- Sincronização com Firebase (usuários logados)
- Gerenciamento de quantidades
- Cálculo automático de totais

### Painel Administrativo

- Gerenciamento completo de produtos
- Upload de imagens via Firebase Storage
- Gerenciamento de notícias
- Interface intuitiva e responsiva

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente do Firebase
3. Deploy automático a cada push

### Netlify

1. Build do projeto: `npm run build`
2. Upload da pasta `dist`
3. Configure as variáveis de ambiente

## 📞 Suporte

- **WhatsApp**: (79) 99906-2401
- **Email**: contato@cardosoconfeccoes.com

## 🔄 Atualizações Futuras

- [ ] Sistema de cupons de desconto
- [ ] Integração com gateway de pagamento
- [ ] Sistema de avaliações de produtos
- [ ] Chat em tempo real
- [ ] App mobile (React Native)
- [ ] Dashboard com analytics
- [ ] Sistema de notificações push

## 📝 Licença

Este projeto é desenvolvido para Cardoso Confecções. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para revolucionar o comércio de fardamentos industriais**
