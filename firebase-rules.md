# Firebase Rules & Collection Structure

## Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários - cada usuário pode ler/escrever apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Produtos - qualquer pessoa pode ler, apenas admins podem escrever
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null; // Temporariamente permissivo para desenvolvimento
    }

    // Notícias - qualquer pessoa pode ler, apenas admins podem escrever
    match /news/{newsId} {
      allow read: if true;
      allow write: if request.auth != null; // Temporariamente permissivo para desenvolvimento
    }

    // Pedidos - qualquer pessoa pode criar pedidos (para captura de leads)
    match /orders/{orderId} {
      allow read: if request.auth != null; // Apenas usuários logados podem ler
      allow write: if true; // Qualquer pessoa pode criar pedidos
    }

    // Leads - apenas admins podem ler, qualquer pessoa pode escrever (para captura)
    match /leads/{leadId} {
      allow read: if request.auth != null; // Temporariamente permissivo para desenvolvimento
      allow write: if true; // Permite captura de leads de usuários não logados
    }
  }
}
```

## Storage Rules

```javascript
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

## Collection Structures

### Users Collection

```javascript
{
  uid: "string",
  email: "string",
  displayName: "string",
  phone: "string",
  company: "string",
  address: "string",
  isAdmin: boolean,
  cart: [
    {
      id: "string",
      name: "string",
      price: number,
      image: "string",
      images: ["string"],
      size: "string",
      quantity: number,
      selectedColor: "string",
      customizationDetails: ["string"]
    }
  ],
  orders: ["orderId"],
  createdAt: timestamp
}
```

### Products Collection

```javascript
{
  name: "string",
  description: "string",
  price: number,
  image: "string", // Campo legado
  images: ["string"], // Novo campo para múltiplas imagens
  category: "string",
  sizes: ["PP", "P", "M", "G", "GG", "XG"],
  colors: ["Branco", "Preto", "Azul"],
  customization: [
    {
      name: "string",
      price: number
    }
  ],
  specifications: {
    fabric: "string",
    composition: "string",
    care: "string",
    origin: "string",
    weight: "string",
    dimensions: "string"
  },
  features: ["string"],
  status: "active" | "inactive" | "out_of_stock",
  createdAt: timestamp
}
```

### News Collection

```javascript
{
  title: "string",
  content: "string",
  image: "string",
  link: "string", // Novo campo
  createdAt: timestamp
}
```

### Orders Collection

```javascript
{
  orderId: "string", // ORC-timestamp-random
  userId: "string", // Se usuário logado
  userEmail: "string",
  userName: "string",
  items: [
    {
      id: "string",
      name: "string",
      price: number,
      image: "string",
      images: ["string"],
      size: "string",
      quantity: number,
      selectedColor: "string",
      customizationDetails: ["string"]
    }
  ],
  total: number,
  customer: {
    name: "string",
    email: "string",
    phone: "string",
    company: "string",
    address: "string"
  },
  status: "pending" | "completed" | "cancelled",
  createdAt: timestamp,
  deliveryDate: timestamp,
  pdfGenerated: boolean
}
```

### Leads Collection (NOVA)

```javascript
{
  email: "string",
  name: "string",
  phone: "string",
  company: "string",
  orderId: "string",
  orderTotal: number,
  orderItems: number,
  hasAccount: boolean,
  createdAt: timestamp,
  source: "orcamento",
  status: "active" | "inactive"
}
```

## Problemas Corrigidos

1. **Undefined values**: Implementada limpeza de dados antes de salvar no Firestore
2. **Cart item uniqueness**: Implementado sistema de chaves únicas baseado em características do produto
3. **Image display**: Corrigido fallback para produtos com estrutura de imagens antiga
4. **PDF generation**: Implementada lógica de múltiplas páginas
5. **Lead capture**: Implementado sistema de captura de e-mails de todos os usuários que geram orçamentos

## Testes Recomendados

1. **Cadastro de usuário**: Teste criar conta e verificar se dados são salvos corretamente
2. **Login admin**: Teste login com admin@confecc.com / 14111995
3. **Adição de produtos**: Teste adicionar produtos com múltiplas imagens e características
4. **Carrinho**: Teste adicionar produtos com diferentes tamanhos/cores e verificar unicidade
5. **Geração de orçamento**: Teste gerar PDF com muitos itens para verificar múltiplas páginas
6. **Captura de leads**: Teste gerar orçamento com e sem cadastro e verificar se aparece na aba Leads
7. **Upload de imagens**: Teste upload de imagens no painel admin
8. **Regras de segurança**: Teste acesso às coleções com diferentes níveis de autenticação
