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

  @OneToMany(
    () => InquiryCertificate,
    (inquiryCertificate) => inquiryCertificate.certificate,
  )
  inquiryCertificates!: InquiryCertificate[];

  @CreateDateColumn()
  createdAt!: Date;
}
