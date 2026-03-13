import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [ConfigModule, FirebaseModule, AuthModule, UsersModule],
})
export class AppModule {}
