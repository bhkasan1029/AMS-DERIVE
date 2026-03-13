import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;

  constructor(private configService: AppConfigService) {}

  onModuleInit() {
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.firebaseProjectId,
        clientEmail: this.configService.firebaseClientEmail,
        privateKey: this.configService.firebasePrivateKey,
      }),
    });
  }

  get auth(): admin.auth.Auth {
    return this.app.auth();
  }

  get firestore(): admin.firestore.Firestore {
    return this.app.firestore();
  }

  get storage(): admin.storage.Storage {
    return this.app.storage();
  }
}
