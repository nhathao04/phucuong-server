import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { InquiryCertificate } from "./inquiry-certificate.entity";

@Entity({ name: "certificates" })
export class Certificate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "varchar", length: 500, nullable: true })
  fileUrl!: string | null;

  @OneToMany(
    () => InquiryCertificate,
    (inquiryCertificate) => inquiryCertificate.certificate,
  )
  inquiryCertificates!: InquiryCertificate[];

  @CreateDateColumn()
  createdAt!: Date;
}
