import admin from 'firebase-admin';
import Container from 'typedi';
import serviceAccountKey from '../../serviceAccountKey.json';

const firebaseLoader = () => {
  admin.initializeApp({
    credential: admin.credential.cert({
      clientEmail: serviceAccountKey.client_email,
      privateKey: serviceAccountKey.private_key,
      projectId: serviceAccountKey.project_id,
    }),
    storageBucket: 'a-simple-tag.appspot.com',
  });
  Container.set('storage.default', admin.storage().bucket());
};

export default firebaseLoader;
