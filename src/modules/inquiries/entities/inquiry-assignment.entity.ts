import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Inquiry } from "./inquiry.entity";
import { AssignmentRole } from "./inquiry.enums";

@Entity({ name: "inquiry_assignments" })
export class InquiryAssignment {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id!: number;

  @Index()
  @Column({ type: "uuid" })
  inquiryId!: string;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.assignments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inquiryId" })
  inquiry!: Inquiry;

  @Index()
  @Column({ type: "uuid" })
  staffUserId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "staffUserId" })
  staffUser!: User;

  @Column({ type: "enum", enum: AssignmentRole, default: AssignmentRole.STAFF })
  role!: AssignmentRole;

  @CreateDateColumn({ type: "timestamp with time zone" })
  assignedAt!: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  unassignedAt!: Date | null;
}
