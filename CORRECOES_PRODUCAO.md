# Correções para Produção

## 🚨 Problemas Identificados

### 1. Erro de Preço

```
Uncaught TypeError: p.price?.toFixed is not a function
```

**Causa:** Preços sendo salvos como strings em vez de números.

### 2. Problema de Edição de Produtos

**Causa:** ProductForm recebendo `initialData` em vez de `product`.

### 3. Erro 404 do Manifest

```
GET https://confeccoescardoso.online/site.webmanifest 404 (Not Found)
```

**Causa:** Arquivo PWA não encontrado.

---

## ✅ Correções Implementadas

### 1. Correção do ProductForm (Admin.jsx)

**Antes:**

```javascript
<ProductForm
  initialData={editingProduct} // ❌ Prop incorreta
  onSubmit={handleProductSubmit}
  onCancel={() => {
    setShowProductForm(false);
    setEditingProduct(null);
  }}
/>
```

**Depois:**

```javascript
<ProductForm
  product={editingProduct} // ✅ Prop correta
  onSubmit={handleProductSubmit}
  onCancel={() => {
    setShowProductForm(false);
    setEditingProduct(null);
  }}
/>
```

### 2. Conversão de Preços para Números

#### ProductForm.jsx

```javascript
const handleSubmit = (e) => {
  e.preventDefault();

  // Converter preço para número
  const productData = {
    ...formData,
    price: parseFloat(formData.price) || 0,
    customization: {
      ...formData.customization,
      embroideryPrice: parseFloat(formData.customization.embroideryPrice) || 0,
      printingPrice: parseFloat(formData.customization.printingPrice) || 0,
      sublimationPrice:
        parseFloat(formData.customization.sublimationPrice) || 0,
      paintPrice: parseFloat(formData.customization.paintPrice) || 0,
    },
  };

  onSubmit(productData);
};
```

#### CartContext.jsx

```javascript
// addToCart
price: parseFloat(product.price) || 0, // Garantir que seja número

// saveCart
price: parseFloat(item.price) || 0, // Garantir que seja número

// generateOrder
price: parseFloat(item.price) || 0, // Garantir que seja número
```

#### ProdutoDetalhe.jsx

```javascript
// getTotalPrice
let total = parseFloat(product.price) || 0;
const price = parseFloat(product.customization[`${key}Price`]) || 0;

// handleAddToCart
let totalPrice = parseFloat(product.price) || 0;
const price = parseFloat(product.customization[`${key}Price`]) || 0;

// originalPrice
parseFloat(product.originalPrice) > parseFloat(product.price)
R$ {parseFloat(product.originalPrice).toFixed(2)}

// Produtos relacionados
R$ {parseFloat(relatedProduct.price)?.toFixed(2) || "0,00"}
```

#### Home.jsx

```javascript
// Produtos em destaque
R$ {parseFloat(product.price)?.toFixed(2) || "0,00"}
```

#### Produtos.jsx

```javascript
// Lista de produtos
R$ {parseFloat(product.price)?.toFixed(2) || "0,00"}
```

#### Admin.jsx

```javascript
// Lista de produtos no admin
R$ {parseFloat(product.price)?.toFixed(2) || "0,00"}
```

### 3. Arquivo PWA (site.webmanifest)

Criado em `public/site.webmanifest`:

```json
{
  "name": "Cardoso Confecções",
  "short_name": "Cardoso Confecções",
  "description": "Fardamentos Industriais de Qualidade",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/src/assets/logoOrcamento.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/src/assets/logoOrcamento.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🧪 Testes Realizados

### 1. Teste de Adição de Produto

- ✅ Formulário abre corretamente
- ✅ Preço é salvo como número
- ✅ Produto aparece na lista

### 2. Teste de Edição de Produto

- ✅ Botão "Editar" abre formulário com dados
- ✅ Dados são carregados corretamente
- ✅ Alterações são salvas

### 3. Teste de Preços

- ✅ Preços são exibidos corretamente
- ✅ Cálculos funcionam
- ✅ Não há erros de toFixed()

### 4. Teste PWA

- ✅ Manifest não gera erro 404
- ✅ Site funciona normalmente

---

## 📋 Checklist de Verificação

### Antes do Deploy

- [ ] **ProductForm** recebe prop `product` (não `initialData`)
- [ ] **Preços** são convertidos para números com `parseFloat()`
- [ ] **site.webmanifest** existe em `public/`
- [ ] **Build** é gerado sem erros
- [ ] **Testes** locais passam

### Após o Deploy

- [ ] **Adicionar produto** funciona
- [ ] **Editar produto** carrega dados
- [ ] **Preços** são exibidos corretamente
- [ ] **Carrinho** funciona sem erros
- [ ] **Console** não mostra erros de preço
- [ ] **Manifest** não gera 404

---

## 🚀 Próximos Passos

1. **Fazer novo build** com as correções
2. **Deployar** para produção
3. **Testar** todas as funcionalidades
4. **Monitorar** console por erros
5. **Verificar** se leads são capturados

---

**Status:** ✅ Correções implementadas
**Próximo:** Deploy para produção
**Observações:** Todas as correções foram testadas localmente
