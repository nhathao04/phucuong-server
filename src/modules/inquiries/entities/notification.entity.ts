import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Inquiry } from "./inquiry.entity";

@Entity({ name: "notifications" })
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  inquiryId!: string;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.notifications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inquiryId" })
  inquiry!: Inquiry;

  @Column({ type: "varchar", length: 220 })
  title!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({ type: "boolean", default: false })
  isRead!: boolean;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;
}
