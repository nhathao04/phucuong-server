import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { DatabaseSeederService } from "./database-seeder.service";

async function seedDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seederService = app.get(DatabaseSeederService);
  await seederService.runAllSeeds();

  await app.close();
}

seedDatabase().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
