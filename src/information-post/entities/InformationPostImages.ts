import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { InformationPosts } from "./InformationPosts";

@Index("informationPostId", ["informationPostId"], {})
@Entity("informationPostImages", { schema: "test" })
export class InformationPostImages {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "informationPostImageId",
    unsigned: true,
  })
  informationPostImageId: number;

  @Column("int", { name: "informationPostId", unsigned: true })
  informationPostId: number;

  @Column("varchar", { name: "imgUrl", nullable: true, length: 255 })
  imgUrl: string | null;

  @Column("timestamp", {
    name: "createdAt",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("timestamp", {
    name: "updatedAt",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @ManyToOne(
    () => InformationPosts,
    (informationPosts) => informationPosts.informationPostImages,
    { onDelete: "NO ACTION", onUpdate: "NO ACTION" }
  )
  @JoinColumn([
    { name: "informationPostId", referencedColumnName: "informationPostId" },
  ])
  informationPost: InformationPosts;
}
