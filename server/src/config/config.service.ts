import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get firebaseProjectId(): string {
    return this.configService.getOrThrow<string>('FIREBASE_PROJECT_ID');
  }

  get firebaseClientEmail(): string {
    return this.configService.getOrThrow<string>('FIREBASE_CLIENT_EMAIL');
  }

  get firebasePrivateKey(): string {
    return this.configService
      .getOrThrow<string>('FIREBASE_PRIVATE_KEY')
      .replace(/\\n/g, '\n');
  }
}
