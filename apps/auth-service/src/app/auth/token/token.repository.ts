import { DataSource, Repository } from 'typeorm';
import { Token } from '@nx-nestjs-boilerplate-server/sqlml';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenRepository extends Repository<Token> {
  constructor(dataSource: DataSource) {
    super(Token, dataSource.createEntityManager());
  }

  async findByToken(token: string): Promise<Token | undefined> {
    return this.findOne({ where: { token } });
  }

  async findValidToken(token: string, tokenType: string): Promise<Token | undefined> {
    return this.findOne({
      where: {
        token,
        tokenType,
        blackListed: false,
      },
    });
  }

  async blacklistToken(token: string): Promise<void> {
    await this.update({ token }, { blackListed: true });
  }

  async removeToken(token: string): Promise<void> {
    await this.delete({ token });
  }

  async removeTokensByUser(userId: string, tokenType?: string): Promise<void> {
    const query = this.createQueryBuilder()
      .delete()
      .from(Token)
      .where("user.id = :userId", { userId });

    if (tokenType) {
      query.andWhere("tokenType = :tokenType", { tokenType });
    }

    await query.execute();
  }
}
