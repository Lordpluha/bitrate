/**
 * Конвертирует имя файла в PascalCase для имени компонента
 * @param {string} filename - Имя файла SVG
 * @returns {string} - Имя компонента в PascalCase
 */
export function toPascalCase(filename) {
  return filename
    .replace(/\.svg$/, "")
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^(.)/, (chr) => chr.toUpperCase())
}
