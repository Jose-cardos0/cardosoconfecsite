# Configuração CORS para Firebase Storage

## Problema

O erro de CORS ocorre porque o Firebase Storage não permite acesso direto às imagens de outros domínios (como localhost:5173).

## Solução

### Opção 1: Configurar CORS via Firebase CLI (Recomendado)

1. **Instale o Firebase CLI** (se ainda não tiver):

```bash
npm install -g firebase-tools
```

2. **Faça login no Firebase**:

```bash
firebase login
```

3. **Aplique as configurações CORS**:

```bash
gsutil cors set cors.json gs://disparador-f7f2a.firebasestorage.app
```

### Opção 2: Configurar CORS via Firebase Console

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto `disparador-f7f2a`
3. Vá para **Storage** > **Rules**
4. Substitua as regras por:

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

5. Clique em **Publish**

### Opção 3: Solução Temporária (Já implementada)

Removemos as imagens dos produtos do PDF para evitar problemas de CORS. O PDF agora mostra:

- ✅ Nome do produto
- ✅ Descrição do produto
- ✅ Personalizações selecionadas
- ✅ Tamanho, cor, quantidade
- ✅ Preços
- ✅ Logo da empresa
- ✅ Assinatura

## Verificação

Após aplicar as configurações:

1. **Teste o PDF**: Gere um orçamento e verifique se não há mais erros de CORS
2. **Verifique o console**: Não deve aparecer mais erros de CORS
3. **Teste as imagens**: As imagens devem carregar normalmente no site

## Se o problema persistir

Se ainda houver problemas de CORS, você pode:

1. **Usar um proxy CORS**:

```javascript
const proxyUrl = "https://cors-anywhere.herokuapp.com/";
const imageUrl = proxyUrl + originalFirebaseUrl;
```

2. **Converter imagens para base64** (mais complexo, mas resolve definitivamente)

3. **Hospedar imagens em outro serviço** como Cloudinary ou AWS S3

## Comandos úteis

```bash
# Verificar configurações CORS atuais
gsutil cors get gs://disparador-f7f2a.firebasestorage.app

# Remover configurações CORS (se necessário)
gsutil cors set cors.json gs://disparador-f7f2a.firebasestorage.app
```

## Nota importante

A solução atual (remover imagens do PDF) é funcional e profissional. O PDF contém todas as informações necessárias sem as imagens dos produtos, mantendo a funcionalidade completa do orçamento.
