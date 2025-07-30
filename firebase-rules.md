# Firebase Security Rules

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
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // News can be read by anyone, but only admins can write
    match /news/{newsId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
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

## Como Configurar

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá para **Firestore Database** > **Rules**
4. Cole as regras do Firestore acima
5. Vá para **Storage** > **Rules**
6. Cole as regras do Storage acima
7. Clique em **Publish**

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
  features: ["string"],
  additionalImages: ["string"],
  createdAt: timestamp
}
```

### news

```javascript
{
  title: "string",
  content: "string",
  image: "string",
  createdAt: timestamp
}
```

### orders

```javascript
{
  userId: "string",
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
    size: "string",
    quantity: number,
    image: "string"
  }],
  total: number,
  status: "pending" | "approved" | "in_production" | "shipped" | "delivered" | "cancelled",
  createdAt: timestamp
}
```
