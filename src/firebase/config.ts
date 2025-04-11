import { initializeApp, FirebaseApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Obtendo o ambiente
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
console.log(`Ambiente: ${isDevelopment ? 'Desenvolvimento' : 'Produção'}`);

// Configuração do Firebase para o projeto "studying-place-df051"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCH3znpWLYiSaNZClwHK_aaK75CEVBM1xA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "studying-place-df051.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studying-place-df051",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "studying-place-df051.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "444244328352",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:444244328352:web:70c954ff79bc5751142ec5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-VB1QE59GHF"
};

// Log das configurações em desenvolvimento
if (isDevelopment) {
  console.log('Configurações do Firebase:', {
    apiKey: firebaseConfig.apiKey ? 'Definida' : 'Não definida',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
  });
}

// Variáveis para os serviços
let app: FirebaseApp | null = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

try {
  // Inicializa o Firebase
  console.log('Inicializando Firebase...');
  app = initializeApp(firebaseConfig);
  
  // Inicializa os serviços
  try {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Analytics apenas no ambiente de produção e navegador
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
    
    console.log('Firebase inicializado com sucesso');
    
    // Instruções para desenvolvedores sobre a configuração do CORS
    if (isDevelopment) {
      console.info('⚠️ IMPORTANTE: Se encontrar erros de CORS no Firebase Storage:');
      console.info('1. Acesse o console do Firebase (https://console.firebase.google.com)');
      console.info('2. Navegue até Storage > Rules');
      console.info('3. Certifique-se que as regras permitam acesso de localhost durante desenvolvimento');
      console.info('4. Exemplo de regra permitindo leitura/escrita (apenas para ambiente dev):');
      console.info(`
        rules_version = '2';
        service firebase.storage {
          match /b/{bucket}/o {
            match /{allPaths=**} {
              allow read, write: if request.auth != null || request.origin == "http://localhost:8080";
            }
          }
        }
      `);
    }
  } catch (serviceError) {
    console.error('Erro ao inicializar serviços Firebase:', serviceError);
  }
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
}

// Exporta os serviços necessários
export { auth, db, storage, app, analytics };

export default app; 