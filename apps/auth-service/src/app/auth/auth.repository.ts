import { DataSource, Repository } from 'typeorm';
import { User } from '@nx-nestjs-boilerplate-server/sqlml';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    return await this.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    return await this.findOne({ where: { username } });
  }

  async isVerifiedUser(email: string): Promise<boolean> {
    if (!email) return false;
    const user = await this.findOne({ where: { email, isVerified: true } });
    return !!user;
  }

  async isBlockedUser(email: string): Promise<boolean> {
    if (!email) return false;
    const user = await this.findOne({ where: { email, isBlocked: true } });
    return !!user;
  }

  async blockUser(userId: string): Promise<void> {
    await this.update({ id: userId }, { isBlocked: true });
  }

  async unblockUser(userId: string): Promise<void> {
    await this.update({ id: userId }, { isBlocked: false });
  }
}


