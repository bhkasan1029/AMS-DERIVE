import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private firebaseService: FirebaseService) {}

  async register(registerDto: RegisterDto) {
    const { email, password, displayName } = registerDto;

    const userRecord = await this.firebaseService.auth.createUser({
      email,
      password,
      displayName,
    });

    await this.firebaseService.firestore
      .collection('users')
      .doc(userRecord.uid)
      .set({
        email,
        displayName: displayName || null,
        createdAt: new Date().toISOString(),
      });

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    };
  }

  async verifyToken(token: string) {
    return this.firebaseService.auth.verifyIdToken(token);
  }

  async getProfile(uid: string) {
    const userDoc = await this.firebaseService.firestore
      .collection('users')
      .doc(uid)
      .get();

    if (!userDoc.exists) {
      return null;
    }

    return { uid, ...userDoc.data() };
  }
}
