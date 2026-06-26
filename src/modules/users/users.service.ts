import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { Role } from "./entities/role.entity";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const defaultRole = await this.findRoleByName("user");
    const role = createUserDto.roleId
      ? await this.rolesRepository.findOne({
          where: { id: createUserDto.roleId },
        })
      : defaultRole;

    if (!role) {
      throw new BadRequestException("Role not found");
    }

    const password = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      email: createUserDto.email,
      password,
      fullName: createUserDto.fullName,
      roleId: role.id,
    });

    const savedUser = await this.usersRepository.save(user);
    const createdUser = await this.usersRepository.findOne({
      where: { id: savedUser.id },
      relations: ["role"],
    });

    if (!createdUser) {
      throw new BadRequestException("Failed to create user");
    }

    return createdUser;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByIdWithRole(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ["role"],
    });
  }

  async findByEmailWithRole(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ["role"],
    });
  }

  async hasAdminOrStaffRole(user: User): Promise<boolean> {
    if (!user.role) return false;
    return ["admin", "staff"].includes(user.role.name);
  }

  async findRoleByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ where: { name } });
  }

  async createRole(name: string, description?: string): Promise<Role> {
    const role = this.rolesRepository.create({ name, description });
    return this.rolesRepository.save(role);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }
}
