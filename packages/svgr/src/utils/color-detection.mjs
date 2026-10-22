import convert from 'color-convert'
import colorName from 'color-name'

/**
 * Парсит цвет из строки в RGB массив [r, g, b]
 */
function parseColor(colorString) {
  const c = colorString.toLowerCase().trim()

  // HEX формат
  if (c.startsWith('#')) {
    const hex = c.replace('#', '')
    // Короткий формат (#000 -> #000000)
    const fullHex =
      hex.length === 3
        ? hex
            .split('')
            .map((h) => h + h)
            .join('')
        : hex
    return convert.hex.rgb(fullHex)
  }

  // RGB/RGBA формат
  const rgbMatch = c.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgbMatch) {
    return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])]
  }

  // HSL/HSLA формат
  const hslMatch = c.match(/hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/)
  if (hslMatch) {
    return convert.hsl.rgb([Number(hslMatch[1]), Number(hslMatch[2]), Number(hslMatch[3])])
  }

  // Именованные цвета (используем библиотеку color-name с 140+ цветами)
  if (colorName[c]) {
    return colorName[c]
  }

  // Не удалось распознать
  return null
}

/**
 * RGB массив в HEX
 */
function rgbToHex(rgb) {
  return `#${rgb.map((x) => x.toString(16).padStart(2, '0')).join('')}`
}

/**
 * Конвертирует любой цвет в HEX формат
 */
function colorToHex(color) {
  const rgb = parseColor(color)
  return rgb ? rgbToHex(rgb) : color
}

const IGNORED = new Set(['none', 'transparent'])
/** A fill/stroke paint that is a colour (not `none`, `transparent` or a `url(#…)` reference). */
const isPaintColor = (color) => !IGNORED.has(color) && !color.startsWith('url(')
const isStopColor = (color) => !IGNORED.has(color)

/**
 * Every colour value the SVG paints with, lower-cased, in scan order: fill/stroke attributes,
 * fill/stroke in inline styles, then gradient stop-color attributes and stop inline styles.
 */
function* paintedColors(svgContent) {
  for (const match of svgContent.matchAll(/fill="([^"]+)"/g))
    yield [match[1].toLowerCase(), isPaintColor]
  for (const match of svgContent.matchAll(/stroke="([^"]+)"/g))
    yield [match[1].toLowerCase(), isPaintColor]
  for (const match of svgContent.matchAll(/style="([^"]+)"/g)) {
    const fill = match[1].match(/fill\s*:\s*([^;]+)/i)
    if (fill) yield [fill[1].trim().toLowerCase(), isPaintColor]
    const stroke = match[1].match(/stroke\s*:\s*([^;]+)/i)
    if (stroke) yield [stroke[1].trim().toLowerCase(), isPaintColor]
  }
  for (const match of svgContent.matchAll(/stop-color="([^"]+)"/g))
    yield [match[1].toLowerCase(), isStopColor]
  for (const match of svgContent.matchAll(/<stop[^>]*style="([^"]+)"/g)) {
    const stop = match[1].match(/stop-color\s*:\s*([^;]+)/i)
    if (stop) yield [stop[1].trim().toLowerCase(), isStopColor]
  }
}

/**
 * Собирает цвета SVG за один проход
 * @returns {Map<string, string>} - mapping HEX -> первое оригинальное значение, в порядке появления
 */
export function collectColors(svgContent) {
  const colorMap = new Map()
  for (const [color, accepts] of paintedColors(svgContent)) {
    if (!accepts(color)) continue
    const hexColor = colorToHex(color)
    if (!colorMap.has(hexColor)) colorMap.set(hexColor, color)
  }
  return colorMap
}

/**
 * Извлекает все уникальные цвета из SVG
 */
export function extractColors(svgContent) {
  return new Set(collectColors(svgContent).keys())
}

/**
 * Извлекает цвета с сохранением оригинальных значений
 * @returns {Map<string, string>} - mapping HEX -> оригинальное значение
 */
export function extractColorsWithOriginals(svgContent) {
  return collectColors(svgContent)
}

/**
 * Одноцветен ли набор HEX-цветов: пусто или один чёрный/белый цвет
 * @param {Set<string>} colors
 */
export function colorsAreMonochrome(colors) {
  if (colors.size === 0) return true
  if (colors.size === 1) {
    const [color] = colors
    return color === '#000000' || color === '#ffffff'
  }
  return false
}

/**
 * Определяет, является ли SVG одноцветным
 */
export function isMonochrome(svgContent) {
  return colorsAreMonochrome(extractColors(svgContent))
}

/**
 * Создает mapping цветов к именам переменных
 * @param {Set<string>} colors - набор цветов в HEX формате
 * @param {string[]} varNames - массив имён переменных (например, ['color1', 'color2'])
 * @returns {Map<string, string>} - mapping цвета -> имя переменной
 */
export function createColorVariableMapping(colors, varNames = []) {
  const colorArray = Array.from(colors)
  const mapping = new Map()

  colorArray.forEach((color, index) => {
    // Используем заданное имя или генерируем автоматически
    const varName = varNames[index] || `color${index + 1}`
    mapping.set(color, varName)
  })

  return mapping
}

/**
 * Извлекает цвета и создает для них mapping к переменным
 * @param {string} svgContent - содержимое SVG файла
 * @param {string[]} varNames - массив имён переменных
 * @returns {{colors: Set<string>, mapping: Map<string, string>, originals: Map<string, string>}}
 */
export function extractColorsWithMapping(svgContent, varNames = []) {
  const originals = collectColors(svgContent)
  const colors = new Set(originals.keys())
  const mapping = createColorVariableMapping(colors, varNames)

  return { colors, mapping, originals }
}
