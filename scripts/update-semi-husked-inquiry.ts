import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "1",
  database: process.env.DB_NAME || "phucuongDB",
  entities: ["src/modules/**/*.entity.ts"],
  synchronize: false,
});

async function main() {
  await AppDataSource.initialize();
  
  // Find product
  const productResult = await AppDataSource.query(`
    SELECT id FROM products WHERE slug = 'semi-husked-coconut'
  `);
  
  if (productResult.length === 0) {
    console.log('Product not found');
    return;
  }
  
  const productId = productResult[0].id;
  console.log('Product ID:', productId);
  
  // Find attribute IDs
  const attrs = await AppDataSource.query(`
    SELECT id, code FROM product_attributes WHERE code IN (
      'quantity', 'coconut_size', 'husk_type', 'packaging', 'sample_required'
    )
  `);
  
  console.log('Attributes:', attrs);
  
  // Delete existing mappings for this product
  await AppDataSource.query(`
    DELETE FROM product_attribute_mappings WHERE "productId" = $1
  `, [productId]);
  
  // Insert new mappings
  const mappings = [
    { code: 'quantity', sortOrder: 0, required: true },
    { code: 'coconut_size', sortOrder: 1, required: true },
    { code: 'husk_type', sortOrder: 2, required: true },
    { code: 'packaging', sortOrder: 3, required: false },
    { code: 'sample_required', sortOrder: 4, required: false },
  ];
  
  for (const m of mappings) {
    const attr = attrs.find((a: any) => a.code === m.code);
    if (!attr) {
      console.log(`Attribute ${m.code} not found`);
      continue;
    }
    
    await AppDataSource.query(`
      INSERT INTO product_attribute_mappings 
        ("productId", "attributeId", "required", "isInquiryField", "sortOrder")
      VALUES ($1, $2, $3, true, $4)
    `, [productId, attr.id, m.required, m.sortOrder]);
    
    console.log(`Inserted mapping: ${m.code}`);
  }
  
  console.log('Done!');
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
