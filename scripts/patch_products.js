// patch_products.js
const fs = require('fs');
const path = 'd:/freelance/phucuong-server/src/modules/products/products.service.ts';
let src = fs.readFileSync(path, 'utf8');

// Match from "const mgr = repo.manager;" through the closing "]);" of the
// Promise.all that follows it in loadProductForDetailByWhere.
// We use a non-greedy regex over the Promise.all block.
const oldBlock = /const mgr = repo\.manager;\n    const productId = product\.id;\n    const \[\n      countryConfigs,\n      attributeMappings,\n      attributeValues,\n      containerConfigs,\n      tradeTerms,\n      faqs,\n      certificates,\n      images,\n      technicalSpecifications,\n      packagingOptions,\n      targetBuyers,\n      whyChooseUs,\n      applications,\n    \] = await Promise\.all\(\[[\s\S]*?\n    \]\);/;

const newBlock = `const mgr = repo.manager;
    const productId = product.id;

    const countryConfigs = await mgr
      .getRepository(ProductCountryConfig)
      .find({
        where: { productId },
        relations: { country: true },
        order: { sortOrder: "ASC" },
      });
    const attributeMappings = await mgr
      .getRepository(ProductAttributeMapping)
      .find({
        where: { productId },
        relations: { attribute: true, defaultOption: true },
        order: { sortOrder: "ASC" },
      });
    const attributeValues = await mgr
      .getRepository(ProductAttributeValue)
      .find({
        where: { productId },
        relations: { attribute: true },
        order: { sortOrder: "ASC" },
      });
    const containerConfigs = await mgr
      .getRepository(ProductContainerConfig)
      .find({
        where: { productId },
      });
    const tradeTerms = await mgr.getRepository(ProductTradeTerm).find({
      where: { productId },
      relations: { tradeTerm: true },
      order: { sortOrder: "ASC" },
    });
    const faqs = await mgr.getRepository(ProductFaq).find({
      where: { productId },
      order: { sortOrder: "ASC" },
    });
    const certificates = await mgr.getRepository(ProductCertificate).find({
      where: { productId },
      relations: { certificate: true },
      order: { sortOrder: "ASC" },
    });
    const images = await mgr.getRepository(ProductImage).find({
      where: { productId },
      relations: { asset: true },
      order: { sortOrder: "ASC" },
    });
    const technicalSpecifications = await mgr
      .getRepository(ProductTechnicalSpecification)
      .find({
        where: { productId },
        order: { sortOrder: "ASC" },
      });
    const packagingOptions = await mgr
      .getRepository(ProductPackagingOption)
      .find({
        where: { productId },
        order: { sortOrder: "ASC" },
      });
    const targetBuyers = await mgr.getRepository(ProductTargetBuyer).find({
      where: { productId },
      order: { sortOrder: "ASC" },
    });
    const whyChooseUs = await mgr.getRepository(ProductWhyChooseUs).find({
      where: { productId },
      order: { sortOrder: "ASC" },
    });
    const applications = await mgr.getRepository(ProductApplication).find({
      where: { productId },
      relations: { attributes: true },
      order: { sortOrder: "ASC" },
    });`;

const matches = src.match(oldBlock);
if (!matches) {
  console.error('NO MATCH found. Aborting.');
  process.exit(1);
}
console.log('Matches found:', matches.length);
if (matches.length > 1) {
  console.error('Multiple matches. Aborting.');
  process.exit(2);
}

const replaced = src.replace(oldBlock, newBlock);
fs.writeFileSync(path, replaced, 'utf8');
console.log('OK. New file length:', replaced.length);