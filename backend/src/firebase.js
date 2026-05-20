import admin from "firebase-admin";
import { config } from "./config.js";

let app = null;

function parseServiceAccount() {
  if (!config.firebase.serviceAccountJson) {
    return null;
  }

  try {
    return JSON.parse(config.firebase.serviceAccountJson);
  } catch (error) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON.");
  }
}

export function getFirebaseServices() {
  const hasFirebaseConfig =
    config.firebase.serviceAccountJson ||
    config.firebase.credentialsPath ||
    config.firebase.projectId ||
    config.firebase.storageBucket;

  if (!hasFirebaseConfig) {
    return { db: null, bucket: null, mode: "local" };
  }

  if (!app) {
    const serviceAccount = parseServiceAccount();
    const credential = serviceAccount
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault();

    app = admin.initializeApp({
      credential,
      projectId: config.firebase.projectId || serviceAccount?.project_id,
      storageBucket: config.firebase.storageBucket
    });
  }

  return {
    db: admin.firestore(app),
    bucket: config.firebase.storageBucket ? admin.storage(app).bucket() : null,
    mode: "firebase"
  };
}

