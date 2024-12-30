import { Column, Entity, OneToMany } from "typeorm";
import { Profile } from "./Profile";
import { Token } from "./Token";

@Entity("user", { schema: "public" })
export class User {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", { name: "email" })
  email: string;

  @Column("character varying", { name: "password" })
  password: string;

  @Column("character varying", { name: "username" })
  username: string;

  @Column("jsonb", { name: "useragent", nullable: true })
  useragent: object | null;

  @Column("character varying", { name: "authType" })
  authType: string;

  @Column("boolean", { name: "isVerified", default: () => "false" })
  isVerified: boolean;

  @Column("boolean", { name: "isBlocked", default: () => "false" })
  isBlocked: boolean;

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

  @OneToMany(() => Profile, (profile) => profile.user)
  profiles: Profile[];

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];
}
