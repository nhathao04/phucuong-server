import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { QueryFailedError, Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { CreateStaffDto, UpdateUserDto } from "./dto/user-admin.dto";
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Admin methods
  // ─────────────────────────────────────────────────────────────────────────────

  async createStaff(dto: CreateStaffDto): Promise<User> {
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const role = await this.findRoleByName(dto.roleName || "staff");
    if (!role) {
      throw new BadRequestException(`Role '${dto.roleName || "staff"}' not found`);
    }

    const password = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      email: dto.email,
      password,
      fullName: dto.fullName,
      roleId: role.id,
      isActive: true,
    });

    try {
      const savedUser = await this.usersRepository.save(user);
      return this.findByIdWithRole(savedUser.id) as Promise<User>;
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

  async findAllAdmin(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<{ data: User[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .orderBy("user.createdAt", "DESC");

    if (options.search) {
      queryBuilder.andWhere(
        "(user.fullName ILIKE :search OR user.email ILIKE :search)",
        { search: `%${options.search}%` }
      );
    }

    if (options.role) {
      queryBuilder.andWhere("role.name = :role", { role: options.role });
    }

    if (options.isActive !== undefined) {
      queryBuilder.andWhere("user.isActive = :isActive", { isActive: options.isActive });
    }

    const [data, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const updateData: Partial<User> = {};

    if (dto.fullName !== undefined) {
      updateData.fullName = dto.fullName;
    }

    if (dto.avatarUrl !== undefined) {
      updateData.avatarUrl = dto.avatarUrl;
    }

    if (dto.roleName !== undefined) {
      const role = await this.findRoleByName(dto.roleName);
      if (!role) {
        throw new BadRequestException(`Role '${dto.roleName}' not found`);
      }
      updateData.roleId = role.id;
    }

    await this.usersRepository.update(id, updateData);
    return this.findByIdWithRole(id) as Promise<User>;
  }

  async setUserActive(id: string, isActive: boolean): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.usersRepository.update(id, { isActive });
    return this.findByIdWithRole(id) as Promise<User>;
  }

  async listRoles(): Promise<Role[]> {
    return this.rolesRepository.find({
      order: { createdAt: "ASC" },
    });
  }
}
