import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";

/**
 * Clase para parsear archivos HTML de productos de Mercadona
 * y generar archivos JSON con la información extraída.
 */
class ProductParser {
  constructor(htmlFolder = "htmlToParse", jsonFolder = "parsedJson") {
    this.htmlFolder = htmlFolder;
    this.jsonFolder = jsonFolder;
  }

  /**
   * Limpia un texto eliminando saltos de línea y espacios extras
   * @param {string} text - Texto a limpiar
   * @returns {string} Texto limpio
   */
  cleanText(text) {
    let cleaned = text.replace("\n", "");
    cleaned = cleaned.replace(/\s+/g, " ");
    return cleaned.trim();
  }

  /**
   * Lee un archivo de texto
   * @param {string} filename - Ruta del archivo a leer
   * @returns {string} Contenido del archivo
   */
  readFile(filename) {
    try {
      return fs.readFileSync(filename, "utf8");
    } catch (error) {
      console.error("Error reading file: ", error);
      throw error;
    }
  }

  /**
   * Parsea un archivo HTML extrayendo toda la información de productos
   * @param {string} htmlFile - Nombre del archivo HTML a parsear
   * @returns {Array} Array de objetos con la información de cada producto
   */
  parseHtmlFile(htmlFile) {
    const productInfo = [];

    const htmlPath = path.join(this.htmlFolder, htmlFile);
    const html = this.readFile(htmlPath);

    const root = parse(html);

    const category = this.cleanText(root.querySelector("h1").text);

    // Iterar sobre cada sección (subcategoría)
    const sections = root.querySelectorAll("section.section");
    for (const section of sections) {
      const subcategory = this.cleanText(section.querySelector("h2").text);

      const productList = section.querySelectorAll("div.product-cell");
      for (const product of productList) {
        const img = product.querySelector("img");
        const imageUrl = img.attrs.src;
        const text1 = img.attrs.alt;
        const t2 = product.querySelector("div.product-format");
        const text2 = this.cleanText(t2.text);
        const priceText = this.cleanText(
          product.querySelector("div.product-price").innerText
        );
        const r1 = priceText.match(/(\d+),?(\d+)?(.+)/);
        const priceEuros = r1.length > 2 ? Number(r1[1] + "." + r1[2]) : undefined;
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

    return productInfo;
  }

  /**
   * Guarda datos en un archivo JSON
   * @param {Array|Object} data - Datos a guardar
   * @param {string} filename - Nombre del archivo JSON
   */
  saveJsonFile(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const jsonPath = path.join(this.jsonFolder, filename);

    try {
      fs.writeFileSync(jsonPath, jsonString);
      console.log(`File saved: ${jsonPath}`);
    } catch (error) {
      console.error(`Error saving file ${jsonPath}: `, error);
      throw error;
    }
  }

  /**
   * Procesa todos los archivos HTML de la carpeta configurada,
   * generando un archivo JSON individual por cada HTML y un archivo
   * all.json con todos los productos combinados.
   * @returns {Array} Array con todos los productos parseados
   */
  parseAll() {
    // Obtener todos los archivos HTML de la carpeta
    const htmlFiles = fs.readdirSync(this.htmlFolder).filter(file => file.endsWith('.html'));

    // Array para acumular todos los productos de todos los archivos
    const allProducts = [];

    // Procesar cada archivo HTML
    for (const htmlFile of htmlFiles) {
      const productInfo = this.parseHtmlFile(htmlFile);

      // Generar nombre del archivo JSON basado en el nombre del HTML
      const jsonFilename = htmlFile.replace('.html', '.json');
      this.saveJsonFile(productInfo, jsonFilename);

      // Añadir todos los productos al array global
      allProducts.push(...productInfo);
    }

    // Guardar todos los productos en un único archivo all.json
    this.saveJsonFile(allProducts, 'all.json');
    console.log(`All products saved: ${path.join(this.jsonFolder, 'all.json')}`);

    return allProducts;
  }
}

export default ProductParser;
