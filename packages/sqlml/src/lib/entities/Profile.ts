import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity("profile", { schema: "public" })
export class Profile {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "userId" })
  userId: string;

  @Column("character varying", { name: "nickName" })
  nickName: string;

  @Column("character varying", { name: "thumbnailCid" })
  thumbnailCid: string;

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

  @ManyToOne(() => User, (user) => user.profiles)
  @JoinColumn([{ name: "userId", referencedColumnName: "id" }])
  user: User;
}
