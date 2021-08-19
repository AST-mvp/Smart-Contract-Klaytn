import admin from 'firebase-admin';
import serviceAccountKey from '../../serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: serviceAccountKey.client_email,
    privateKey: serviceAccountKey.private_key,
    projectId: serviceAccountKey.project_id,
  }),
  storageBucket: 'a-simple-tag.appspot.com',
});
