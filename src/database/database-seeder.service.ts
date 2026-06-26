import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Role } from "../modules/users/entities/role.entity";
import { User } from "../modules/users/entities/user.entity";

@Injectable()
export class DatabaseSeederService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seedRoles(): Promise<void> {
    const roles = [
      { name: "admin", description: "Administrator with full access" },
      { name: "staff", description: "Staff member with limited access" },
      { name: "user", description: "Regular customer user" },
    ];

    for (const role of roles) {
      const existing = await this.roleRepository.findOne({
        where: { name: role.name },
      });
      if (!existing) {
        await this.roleRepository.save(role);
        console.log(`✓ Role '${role.name}' created`);
      }
    }
  }

  async seedAdminUser(): Promise<void> {
    const adminEmail = "admin@phucuong.com";
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const adminRole = await this.roleRepository.findOne({
        where: { name: "admin" },
      });

      if (!adminRole) {
        console.log("⚠ Admin role not found. Run seedRoles first.");
        return;
      }

      const hashedPassword = await bcrypt.hash("Admin@123456", 10);
      const admin = this.userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        fullName: "Administrator",
        roleId: adminRole.id,
        isActive: true,
      });

      await this.userRepository.save(admin);
      console.log(`✓ Admin user created (email: ${adminEmail}, password: Admin@123456)`);
    }
  }

  async seedStaffUser(): Promise<void> {
    const staffEmail = "staff@phucuong.com";
    const existingStaff = await this.userRepository.findOne({
      where: { email: staffEmail },
    });

    if (!existingStaff) {
      const staffRole = await this.roleRepository.findOne({
        where: { name: "staff" },
      });

      if (!staffRole) {
        console.log("⚠ Staff role not found. Run seedRoles first.");
        return;
      }

      const hashedPassword = await bcrypt.hash("Staff@123456", 10);
      const staff = this.userRepository.create({
        email: staffEmail,
        password: hashedPassword,
        fullName: "Staff Member",
        roleId: staffRole.id,
        isActive: true,
      });

      await this.userRepository.save(staff);
      console.log(`✓ Staff user created (email: ${staffEmail}, password: Staff@123456)`);
    }
  }

  async runAllSeeds(): Promise<void> {
    console.log("🌱 Starting database seeding...");
    try {
      await this.seedRoles();
      await this.seedAdminUser();
      await this.seedStaffUser();
      console.log("✅ Database seeding completed successfully!");
    } catch (error) {
      console.error("❌ Database seeding failed:", error);
      throw error;
    }
  }
}
