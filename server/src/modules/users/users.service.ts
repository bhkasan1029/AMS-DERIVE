import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly collection = 'users';

  constructor(private firebaseService: FirebaseService) {}

  async create(uid: string, createUserDto: CreateUserDto) {
    const data = {
      ...createUserDto,
      createdAt: new Date().toISOString(),
    };

    await this.firebaseService.firestore
      .collection(this.collection)
      .doc(uid)
      .set(data);

    return { uid, ...data };
  }

  async findOne(uid: string) {
    const doc = await this.firebaseService.firestore
      .collection(this.collection)
      .doc(uid)
      .get();

    if (!doc.exists) {
      throw new NotFoundException('User not found');
    }

    return { uid, ...doc.data() };
  }

  async update(uid: string, updateUserDto: UpdateUserDto) {
    const docRef = this.firebaseService.firestore
      .collection(this.collection)
      .doc(uid);

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('User not found');
    }

    await docRef.update({ ...updateUserDto });

    const updated = await docRef.get();
    return { uid, ...updated.data() };
  }

  async remove(uid: string) {
    const docRef = this.firebaseService.firestore
      .collection(this.collection)
      .doc(uid);

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('User not found');
    }

    await docRef.delete();
    return { uid, deleted: true };
  }
}
