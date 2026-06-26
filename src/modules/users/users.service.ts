import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { QueryFailedError, Repository } from "typeorm";
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
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

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

    try {
      const savedUser = await this.usersRepository.save(user);
      const createdUser = await this.usersRepository.findOne({
        where: { id: savedUser.id },
        relations: ["role"],
      });

      if (!createdUser) {
        throw new BadRequestException("Failed to create user");
      }

      return createdUser;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };
        if (driverError.code === "23505") {
          throw new ConflictException("Email already exists");
        }
      }

      throw error;
    }
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
    const existingRole = await this.findRoleByName(name);
    if (existingRole) {
      throw new BadRequestException("Role already exists");
    }

    const role = this.rolesRepository.create({ name, description });
    return this.rolesRepository.save(role);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }
}
