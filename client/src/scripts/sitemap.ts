// src/scripts/sitemap.js
import { SitemapStream, streamToPromise } from "sitemap";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- Configuration ---
const hostname = "https://qsi.co.zw"; // Your live domain
const backendApiUrl = "https://api.qsi.africa/api"; // Your API base

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output path — goes to /public/sitemap.xml
const outputFilePath = path.resolve(
  __dirname,
  "..",
  "..",
  "public",
  "sitemap.xml"
);

// --- Static URLs ---
const staticUrls = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/about-us", changefreq: "monthly", priority: 0.7 },
  { url: "/contact-us", changefreq: "monthly", priority: 0.5 },
];

// --- Dynamic Module URLs ---
const moduleKeys = ["infrastructure", "healing", "vision"];
const moduleUrls = moduleKeys.map((key) => ({
  url: `/chat/${key}`,
  changefreq: "weekly",
  priority: 0.8,
}));

// --- Function to Fetch Dynamic Pilot URLs ---
async function fetchPilotUrls() {
  console.log(`Fetching pilots from ${backendApiUrl}/submit/pilots...`);
  try {
    const response = await axios.get(`${backendApiUrl}/submit/pilots`);
    const pilots = response.data;

    if (!Array.isArray(pilots)) {
      console.error("Error: Fetched pilot data is not an array:", pilots);
      return [];
    }

    console.log(`Found ${pilots.length} pilot entries.`);
    return pilots.map((pilot) => ({
      url: `/pilots/${pilot.key}`,
      changefreq: "monthly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching pilot projects:", error.message);
    return [];
  }
}

// --- Generate Sitemap ---
async function generateSitemap() {
  console.log("Generating sitemap...");

  const dynamicPilotUrls = await fetchPilotUrls();
  const allUrls = [...staticUrls, ...moduleUrls, ...dynamicPilotUrls];

  try {
    const stream = new SitemapStream({ hostname });

    allUrls.forEach((url) => stream.write(url));
    stream.end();

    const xml = await streamToPromise(stream).then((data) => data.toString());

    // Ensure /public directory exists
    const publicDir = path.dirname(outputFilePath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log(`Created directory: ${publicDir}`);
    }

    fs.writeFileSync(outputFilePath, xml);
    console.log(`✅ Sitemap successfully generated at ${outputFilePath}`);
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
  }
}

// --- Execute ---
generateSitemap();
