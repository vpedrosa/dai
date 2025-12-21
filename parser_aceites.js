import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";

const HTML_FOLDER = "htmlToParse";
const JSON_FOLDER = "parsedJson";

// Obtener todos los archivos HTML de la carpeta
const htmlFiles = fs
  .readdirSync(HTML_FOLDER)
  .filter((file) => file.endsWith(".html"));

// Array para acumular todos los productos de todos los archivos
const allProducts = [];

// Procesar cada archivo HTML
for (const htmlFile of htmlFiles) {
  const productInfo = [];

  const htmlPath = path.join(HTML_FOLDER, htmlFile);
  const html = readFile(htmlPath);

  const root = parse(html);

  const category = cleanText(root.querySelector("h1").text);

  // Iterar sobre cada sección (subcategoría)
  const sections = root.querySelectorAll("section.section");
  for (const section of sections) {
    const subcategory = cleanText(section.querySelector("h2").text);

    const productList = section.querySelectorAll("div.product-cell");
    for (const product of productList) {
      const img = product.querySelector("img");
      const imageUrl = img.attrs.src;
      const text1 = img.attrs.alt;
      const t2 = product.querySelector("div.product-format");
      const text2 = cleanText(t2.text);
      const priceText = cleanText(
        product.querySelector("div.product-price").innerText
      );
      const r1 = priceText.match(/(\d+),?(\d+)?(.+)/);
      const priceEuros =
        r1.length > 2 ? Number(r1[1] + "." + r1[2]) : undefined;
      const productData = {
        category,
        subcategory,
        imageUrl,
        text1,
        text2,
        priceText,
        priceEuros,
      };
      productInfo.push(productData);
    }
  }

  const jsonString = JSON.stringify(productInfo, null, 2);

  // Generar nombre del archivo JSON basado en el nombre del HTML
  const jsonFilename = htmlFile.replace(".html", ".json");
  const jsonPath = path.join(JSON_FOLDER, jsonFilename);

  try {
    fs.writeFileSync(jsonPath, jsonString);
    console.log(`File saved: ${jsonPath}`);
  } catch (error) {
    console.error(`Error saving file ${jsonPath}: `, error);
  }

  // Añadir todos los productos al array global
  allProducts.push(...productInfo);
}

// Guardar todos los productos en un único archivo all.json
const allJsonString = JSON.stringify(allProducts, null, 2);
const allJsonPath = path.join(JSON_FOLDER, "all.json");

try {
  fs.writeFileSync(allJsonPath, allJsonString);
  console.log(`All products saved: ${allJsonPath}`);
} catch (error) {
  console.error(`Error saving all.json: `, error);
}

/**
 * Limpia un texto eliminando saltos de línea y espacios extras
 * @param {string} text - Texto a limpiar
 * @returns {string} Texto limpio
 */
function cleanText(text) {
  let cleaned = text.replace("\n", "");
  cleaned = cleaned.replace(/\s+/g, " ");
  return cleaned.trim();
}

/**
 * Lee un archivo de texto
 * @param {string} filename - Ruta del archivo a leer
 * @returns {string} Contenido del archivo
 */
function readFile(filename) {
  try {
    return fs.readFileSync(filename, "utf8");
  } catch (error) {
    console.error("Error reading file: ", error);
  }
}
