import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Asset, AssetOwnerType } from "../modules/media/entities/asset.entity";
import { Product } from "../modules/products/entities/product.entity";
import { Blog } from "../modules/blogs/entities/blog.entity";
import { BlogAsset } from "../modules/blogs/entities/blog-asset.entity";
import { ProductImage } from "../modules/products/entities/product-image.entity";
import {
  ProductTechnicalSpecification,
} from "../modules/products/entities/product-technical-specification.entity";
import {
  ProductPackagingOption,
} from "../modules/products/entities/product-packaging-option.entity";
import {
  ProductTargetBuyer,
} from "../modules/products/entities/product-target-buyer.entity";
import {
  ProductWhyChooseUs,
} from "../modules/products/entities/product-why-choose-us.entity";

async function seedLandingData() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const assetsRepo = app.get<Repository<Asset>>(getRepositoryToken(Asset));
  const productsRepo = app.get<Repository<Product>>(
    getRepositoryToken(Product),
  );
  const blogsRepo = app.get<Repository<Blog>>(getRepositoryToken(Blog));
  const blogAssetsRepo = app.get<Repository<BlogAsset>>(
    getRepositoryToken(BlogAsset),
  );
  const productImagesRepo = app.get<Repository<ProductImage>>(
    getRepositoryToken(ProductImage),
  );
  const techSpecsRepo = app.get<Repository<ProductTechnicalSpecification>>(
    getRepositoryToken(ProductTechnicalSpecification),
  );
  const packagingRepo = app.get<Repository<ProductPackagingOption>>(
    getRepositoryToken(ProductPackagingOption),
  );
  const targetsRepo = app.get<Repository<ProductTargetBuyer>>(
    getRepositoryToken(ProductTargetBuyer),
  );
  const reasonsRepo = app.get<Repository<ProductWhyChooseUs>>(
    getRepositoryToken(ProductWhyChooseUs),
  );

  // Seed Products with full landing page data
  const products = await productsRepo.find();
  for (const product of products) {
    let existing;
    const hero = await assetsRepo.findOne({
      where: { ownerType: AssetOwnerType.PRODUCT, ownerId: product.id },
    });

    if (!hero) {
      const heroAsset = assetsRepo.create({
        url: `https://cdn.example.com/products/${product.slug}/hero.webp`,
        thumbnailUrl: `https://cdn.example.com/products/${product.slug}/hero-thumb.webp`,
        alt: `${product.name} hero`,
        caption: "Product",
        width: 1600,
        height: 1000,
        sortOrder: 0,
        mimeType: "image/webp",
        ownerType: AssetOwnerType.PRODUCT,
        ownerId: product.id,
      });
      existing = await assetsRepo.save(heroAsset);
    } else {
      existing = hero;
    }

    await productsRepo.update(product.id, {
      hero: {
        eyebrow: "Premium Export Quality",
        title: product.name,
        subtitle:
          "Vietnamese coconut products prepared for international buyers.",
        stats: [
          { value: "10+", label: "Years export" },
          { value: "30+", label: "Export markets" },
          { value: "FCL", label: "Shipment ready" },
        ],
      } as Product["hero"],
      quoteConfig: {
        moq: "1 container",
        tradeTerms: ["FOB", "CNF", "CIF"],
        fields: [
          {
            key: "quantity",
            label: "Quantity",
            type: "number",
            unit: "MT",
            required: true,
          },
          {
            key: "destinationPort",
            label: "Destination Port",
            type: "text",
            required: true,
          },
        ],
      } as Product["quoteConfig"],
      badges: product.badges?.length ? product.badges : ["Export Ready", "FCL"],
    });

    await productImagesRepo.save(
      productImagesRepo.create({
        productId: product.id,
        assetId: existing.id,
        sortOrder: 0,
      }),
    );

    const techSpecs = [
      { label: "Origin", value: product.origin ?? "Ben Tre, Vietnam", sortOrder: 0 },
      { label: "HS Code", value: product.hsCode ?? "0801.19", sortOrder: 1 },
      { label: "Shelf life", value: product.shelfLife ?? "12 months", sortOrder: 2 },
    ];
    for (const spec of techSpecs) {
      await techSpecsRepo.save(techSpecsRepo.create({ productId: product.id, ...spec }));
    }

    await packagingRepo.save(
      packagingRepo.create({
        productId: product.id,
        title: "Export Carton",
        description: "Strong carton packaging for sea freight.",
        details: ["Retail or bulk packing", "Palletized on request"],
        sortOrder: 0,
      }),
    );

    await targetsRepo.save(
      targetsRepo.create({
        productId: product.id,
        title: "Importers",
        description: "Stable Vietnamese coconut supply.",
        sortOrder: 0,
      }),
    );

    await reasonsRepo.save(
      reasonsRepo.create({
        productId: product.id,
        title: "Reliable Export Coordination",
        description: "Clear production, documentation, and shipment planning.",
        sortOrder: 0,
      }),
    );

    console.log(`✓ Product ${product.slug} seeded with landing data`);
  }

  // Seed Blog cover/thumbnail assets
  const blogs = await blogsRepo.find();
  for (const blog of blogs) {
    const coverAsset = assetsRepo.create({
      url: `https://cdn.example.com/blog/${blog.slug}/cover.webp`,
      thumbnailUrl: `https://cdn.example.com/blog/${blog.slug}/cover-thumb.webp`,
      alt: blog.title,
      caption: "",
      width: 1600,
      height: 900,
      sortOrder: 0,
      mimeType: "image/webp",
      ownerType: AssetOwnerType.BLOG,
      ownerId: blog.id,
    });
    const savedCover = await assetsRepo.save(coverAsset);
    const thumbAsset = assetsRepo.create({
      url: `https://cdn.example.com/blog/${blog.slug}/thumb.webp`,
      thumbnailUrl: `https://cdn.example.com/blog/${blog.slug}/thumb-thumb.webp`,
      alt: blog.title,
      caption: "",
      width: 1200,
      height: 800,
      sortOrder: 0,
      mimeType: "image/webp",
      ownerType: AssetOwnerType.BLOG,
      ownerId: blog.id,
    });
    const savedThumb = await assetsRepo.save(thumbAsset);

    await blogsRepo.update(blog.id, {
      coverImageAssetId: savedCover.id,
      thumbnailAssetId: savedThumb.id,
    });

    await blogAssetsRepo.save(
      blogAssetsRepo.create({
        blogId: blog.id,
        assetId: savedCover.id,
        sortOrder: 0,
      }),
    );

    console.log(`✓ Blog ${blog.slug} seeded with cover + thumbnail assets`);
  }

  await app.close();
}

seedLandingData().catch((error) => {
  console.error("Landing seed failed:", error);
  process.exit(1);
});
