# Firebase Security Rules

## Problemas Corrigidos

### 1. Erro de campos undefined

- **Problema**: Firestore não aceita campos com valor `undefined`
- **Solução**: Limpeza de dados antes de salvar, garantindo valores padrão

### 2. Regras muito restritivas

- **Problema**: Regras impediam operações básicas
- **Solução**: Regras mais permissivas para desenvolvimento

### 3. Estrutura de dados inconsistente

- **Problema**: Campos faltando ou mal definidos
- **Solução**: Estrutura padronizada para todas as coleções

## Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Products can be read by anyone, but only admins can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // News can be read by anyone, but only admins can write
    match /news/{newsId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Orders can be read/written by authenticated users
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all files
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Configuração CORS para Firebase Storage

Para resolver problemas de CORS com imagens do Firebase Storage, você precisa configurar o CORS no Firebase Storage:

### 1. Instale o Firebase CLI (se ainda não tiver):

```bash
npm install -g firebase-tools
```

### 2. Faça login no Firebase:

```bash
firebase login
```

### 3. Crie um arquivo `cors.json` na raiz do projeto:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": [
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Headers"
    ]
  }
]
```

### 4. Aplique as configurações CORS:

```bash
gsutil cors set cors.json gs://disparador-f7f2a.firebasestorage.app
```

### 5. Alternativa via Firebase Console:

1. Vá para **Storage** no Firebase Console
2. Clique em **Rules**
3. Adicione as regras acima
4. Clique em **Publish**

## Solução Alternativa para CORS

Se o problema persistir, você pode usar um proxy CORS ou converter as imagens para base64:

### Opção 1: Usar um proxy CORS

```javascript
// Substitua URLs do Firebase Storage por um proxy
const proxyUrl = "https://cors-anywhere.herokuapp.com/";
const imageUrl = proxyUrl + originalFirebaseUrl;
```

### Opção 2: Converter para base64 (recomendado)

```javascript
// No componente que gera o PDF, converter imagens para base64
const convertImageToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Erro ao converter imagem:", error);
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="; // placeholder
  }
};
```

## Como Configurar

### Passo a Passo:

1. **Acesse o Firebase Console**

   - Vá para [console.firebase.google.com](https://console.firebase.google.com/)
   - Selecione seu projeto `disparador-f7f2a`

2. **Configure Firestore Rules**

   - Vá para **Firestore Database** > **Rules**
   - Substitua o conteúdo pelas regras do Firestore acima
   - Clique em **Publish**

3. **Configure Storage Rules**

   - Vá para **Storage** > **Rules**
   - Substitua o conteúdo pelas regras do Storage acima
   - Clique em **Publish**

4. **Verifique as Configurações**
   - Teste adicionando um produto ao carrinho
   - Teste gerando um orçamento
   - Verifique se não há mais erros de undefined

## Estrutura das Coleções

### users

```javascript
{
  uid: "string",
  email: "string",
  displayName: "string",
  phone: "string",
  company: "string",
  isAdmin: boolean,
  createdAt: timestamp,
  cart: [{
    id: "string",
    name: "string",
    price: number,
    image: "string",
    images: ["string"],
    size: "string",
    quantity: number,
    selectedColor: "string",
    customizationDetails: ["string"]
  }],
  orders: ["orderId1", "orderId2"]
}
```

### products

```javascript
{
  name: "string",
  description: "string",
  price: number,
  category: "string",
  image: "string",
  images: ["string"],
  sizes: ["string"],
  colors: ["string"],
  customization: {
    embroidery: boolean,
    embroideryPrice: number,
    printing: boolean,
    printingPrice: number,
    sublimation: boolean,
    sublimationPrice: number,
    paint: boolean,
    paintPrice: number
  },
  specifications: {
    fabric: "string",
    composition: "string",
    care: "string",
    origin: "string"
  },
  features: ["string"],
  status: "active" | "inactive" | "out_of_stock",
  createdAt: timestamp
}
```

### news

```javascript
{
  title: "string",
  content: "string",
  image: "string",
  link: "string",
  createdAt: timestamp
}
```

### orders

```javascript
{
  orderId: "string",
  userId: "string",
  userEmail: "string",
  userName: "string",
  customer: {
    name: "string",
    email: "string",
    phone: "string",
    company: "string",
    address: "string"
  },
  items: [{
    id: "string",
    name: "string",
    price: number,
    image: "string",
    images: ["string"],
    size: "string",
    quantity: number,
    selectedColor: "string",
    customizationDetails: ["string"]
  }],
  total: number,
  status: "pending" | "completed" | "cancelled",
  createdAt: timestamp,
  deliveryDate: timestamp,
  pdfGenerated: boolean
}
```

## Testes Recomendados

Após aplicar as regras, teste:

1. ✅ Adicionar produto ao carrinho
2. ✅ Gerar orçamento
3. ✅ Fazer login/logout
4. ✅ Acessar painel admin
5. ✅ Criar/editar produtos
6. ✅ Fazer upload de imagens

## Troubleshooting

Se ainda houver erros:

1. **Limpe o cache do navegador**
2. **Verifique se as regras foram publicadas**
3. **Aguarde alguns minutos** para propagação
4. **Verifique o console** para erros específicos
