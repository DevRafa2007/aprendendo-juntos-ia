# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/2a474830-a7e0-4871-a2b7-02622c64228b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2a474830-a7e0-4871-a2b7-02622c64228b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2a474830-a7e0-4871-a2b7-02622c64228b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Aprendendo Juntos - Plataforma de Cursos

## Configuração do Firebase

Este projeto utiliza o Firebase para armazenamento de arquivos, autenticação e banco de dados. Para configurar o Firebase, siga os passos abaixo:

### 1. Configuração de Variáveis de Ambiente

O projeto já está configurado com o Firebase. As variáveis de ambiente necessárias estão no arquivo `.env`:

```
VITE_FIREBASE_API_KEY=AIzaSyCH3znpWLYiSaNZClwHK_aaK75CEVBM1xA
VITE_FIREBASE_AUTH_DOMAIN=studying-place-df051.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=studying-place-df051
VITE_FIREBASE_STORAGE_BUCKET=studying-place-df051.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=444244328352
VITE_FIREBASE_APP_ID=1:444244328352:web:70c954ff79bc5751142ec5
VITE_FIREBASE_MEASUREMENT_ID=G-VB1QE59GHF
```

### 2. Configuração do Firebase Storage

Para que o upload de arquivos funcione corretamente, você precisa configurar o Firebase Storage:

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Navegue até seu projeto: "studying-place-df051"
3. Selecione "Storage" no menu lateral
4. Clique em "Começar" ou "Get Started" se for a primeira vez
5. Escolha uma região próxima aos seus usuários (por exemplo, us-central1)
6. Configure as regras de segurança para permitir acesso:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null || request.origin == "http://localhost:8080";
    }
  }
}
```

⚠️ **Importante**: A regra acima permite acesso no ambiente de desenvolvimento. Em produção, você deve modificar para permitir apenas usuários autenticados:

```
allow read, write: if request.auth != null;
```

### 3. Buckets Necessários

O sistema usa os seguintes buckets no Firebase Storage:

- `course-images`: para imagens de cursos e avatares
- `course-videos`: para vídeos de aulas
- `course-documents`: para documentos e PDFs

Eles são criados automaticamente quando você faz o primeiro upload.

## Desenvolvimento Local

Para iniciar o servidor de desenvolvimento:

```
npm run dev
```

## Construção para Produção

Para construir o projeto para produção:

```
npm run build
```

## Tecnologias Utilizadas

- Vite + React
- TypeScript
- Firebase (Storage, Auth)
- Supabase (Auth, Database)
- Chakra UI / Shadcn UI
- TailwindCSS
