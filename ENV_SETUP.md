# Configuração de Variáveis de Ambiente

## 📋 Pré-requisitos

Este projeto usa variáveis de ambiente para configurar o Firebase de forma segura.

## 🔧 Configuração

### 1. Criar arquivo `.env`

Na raiz do projeto, crie um arquivo chamado `.env` com o seguinte conteúdo:

```env
VITE_APIKEY=AIzaSyAxFCRKom6rdvqhtYnh945ptP6F5ojtPx4
VITE_AUTHDOMAIN=disparador-f7f2a.firebaseapp.com
VITE_PROJECTID=disparador-f7f2a
VITE_STORAGEBUCKET=disparador-f7f2a.firebasestorage.app
VITE_MESSAGESIGN=327920817043
VITE_APPID=1:327920817043:web:c3e63e94377aa26c89ce66
```

### 2. Estrutura das Variáveis

| Variável             | Descrição                    | Exemplo                       |
| -------------------- | ---------------------------- | ----------------------------- |
| `VITE_APIKEY`        | Chave da API do Firebase     | `AIzaSy...`                   |
| `VITE_AUTHDOMAIN`    | Domínio de autenticação      | `projeto.firebaseapp.com`     |
| `VITE_PROJECTID`     | ID do projeto Firebase       | `meu-projeto`                 |
| `VITE_STORAGEBUCKET` | Bucket do Storage            | `projeto.firebasestorage.app` |
| `VITE_MESSAGESIGN`   | ID do remetente de mensagens | `123456789`                   |
| `VITE_APPID`         | ID da aplicação              | `1:123456789:web:abc123`      |

## 🔒 Segurança

- ✅ O arquivo `.env` está no `.gitignore`
- ✅ As credenciais não são expostas no código
- ✅ Cada ambiente pode ter suas próprias configurações

## 🚀 Deploy

### Vercel

1. Vá para as configurações do projeto
2. Adicione as variáveis de ambiente na seção "Environment Variables"
3. Use o prefixo `VITE_` para todas as variáveis

### Netlify

1. Vá para Site settings > Environment variables
2. Adicione cada variável com o prefixo `VITE_`

### Firebase Hosting

1. Use o Firebase CLI para configurar as variáveis
2. Ou configure diretamente no console do Firebase

## 🧪 Desenvolvimento Local

1. Clone o repositório
2. Copie o arquivo `.env` para a raiz do projeto
3. Execute `npm install`
4. Execute `npm run dev`

## ⚠️ Importante

- **NUNCA** commite o arquivo `.env` no Git
- **SEMPRE** use o prefixo `VITE_` para variáveis que devem estar disponíveis no frontend
- **MANTENHA** as credenciais seguras e não as compartilhe publicamente

## 🔍 Verificação

Para verificar se as variáveis estão funcionando:

1. Abra o console do navegador
2. Digite: `console.log(import.meta.env.VITE_APIKEY)`
3. Deve retornar a chave da API (não `undefined`)

## 📝 Notas

- O Vite só expõe variáveis com prefixo `VITE_` no frontend
- Variáveis sem o prefixo ficam disponíveis apenas no servidor
- Para produção, configure as variáveis no seu provedor de hosting
