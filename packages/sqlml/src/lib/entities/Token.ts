import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity("token", { schema: "public" })
export class Token {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "userId" })
  userId: string;

  @Column("character varying", { name: "token" })
  token: string;

  @Column("character varying", { name: "tokenType" })
  tokenType: string;

  @Column("timestamp without time zone", { name: "expires" })
  expires: Date;

  @Column("boolean", { name: "blackListed", default: () => "false" })
  blackListed: boolean;

  @Column("timestamp without time zone", {
    name: "createdAt",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp without time zone", {
    name: "updatedAt",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.tokens)
  @JoinColumn([{ name: "userId", referencedColumnName: "id" }])
  user: User;
}
