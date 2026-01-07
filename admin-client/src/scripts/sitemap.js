// src/scripts/sitemap-admin.js
import { SitemapStream, streamToPromise } from "sitemap";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- Configuration ---
const hostname = "https://admin.qsi.co.zw"; // Admin subdomain
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFilePath = path.resolve(
  __dirname,
  "..",
  "..",
  "public",
  "sitemap.xml"
);

// --- Only public routes should be indexed ---
const publicUrls = [
  { url: "/login", changefreq: "yearly", priority: 0.2 }, // Only login page is public
];

// --- Generate Sitemap ---
async function generateSitemap() {
  console.log("Generating admin sitemap...");

  try {
    const stream = new SitemapStream({ hostname });

    publicUrls.forEach((url) => stream.write(url));
    stream.end();

    const xml = await streamToPromise(stream).then((data) => data.toString());

    // Ensure /public directory exists
    const publicDir = path.dirname(outputFilePath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log(`Created directory: ${publicDir}`);
    }

    fs.writeFileSync(outputFilePath, xml);
    console.log(`✅ Admin sitemap successfully generated at ${outputFilePath}`);
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
  }
}

generateSitemap();
