import convert from "color-convert"
import colorName from "color-name"

/**
 * Парсит цвет из строки в RGB массив [r, g, b]
 */
function parseColor(colorString) {
  const c = colorString.toLowerCase().trim()

  // HEX формат
  if (c.startsWith("#")) {
    const hex = c.replace("#", "")
    // Короткий формат (#000 -> #000000)
    const fullHex =
      hex.length === 3
        ? hex
            .split("")
            .map((h) => h + h)
            .join("")
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
  return `#${rgb.map((x) => x.toString(16).padStart(2, "0")).join("")}`
}

/**
 * Конвертирует любой цвет в HEX формат
 */
function colorToHex(color) {
  const rgb = parseColor(color)
  return rgb ? rgbToHex(rgb) : color
}

/**
 * Извлекает все уникальные цвета из SVG
 */
export function extractColors(svgContent) {
  const colors = new Set()

  // Ищем fill и stroke атрибуты
  const fillMatches = svgContent.matchAll(/fill="([^"]+)"/g)
  const strokeMatches = svgContent.matchAll(/stroke="([^"]+)"/g)

  for (const match of fillMatches) {
    const color = match[1].toLowerCase()
    if (color !== "none" && color !== "transparent" && !color.startsWith("url(")) {
      colors.add(color)
    }
  }

  for (const match of strokeMatches) {
    const color = match[1].toLowerCase()
    if (color !== "none" && color !== "transparent" && !color.startsWith("url(")) {
      colors.add(color)
    }
  }

  // Ищем цвета в inline-стилях (style="fill: #fff; stroke: #000")
  const styleMatches = svgContent.matchAll(/style="([^"]+)"/g)
  for (const match of styleMatches) {
    const styleContent = match[1]

    // Извлекаем fill из стилей
    const fillStyleMatch = styleContent.match(/fill\s*:\s*([^;]+)/i)
    if (fillStyleMatch) {
      const color = fillStyleMatch[1].trim().toLowerCase()
      if (color !== "none" && color !== "transparent" && !color.startsWith("url(")) {
        colors.add(color)
      }
    }

    // Извлекаем stroke из стилей
    const strokeStyleMatch = styleContent.match(/stroke\s*:\s*([^;]+)/i)
    if (strokeStyleMatch) {
      const color = strokeStyleMatch[1].trim().toLowerCase()
      if (color !== "none" && color !== "transparent" && !color.startsWith("url(")) {
        colors.add(color)
      }
    }
  }

  // Ищем цвета в градиентах (stop-color атрибут)
  const stopColorMatches = svgContent.matchAll(/stop-color="([^"]+)"/g)
  for (const match of stopColorMatches) {
    const color = match[1].toLowerCase()
    if (color !== "none" && color !== "transparent") {
      colors.add(color)
    }
  }

  // Ищем stop-color в inline-стилях градиентов
  const stopStyleMatches = svgContent.matchAll(/<stop[^>]*style="([^"]+)"/g)
  for (const match of stopStyleMatches) {
    const styleContent = match[1]
    const stopColorMatch = styleContent.match(/stop-color\s*:\s*([^;]+)/i)
    if (stopColorMatch) {
      const color = stopColorMatch[1].trim().toLowerCase()
      if (color !== "none" && color !== "transparent") {
        colors.add(color)
      }
    }
  }

  // Конвертируем все цвета в HEX
  const hexColors = new Set()
  for (const color of colors) {
    hexColors.add(colorToHex(color))
  }

  return hexColors
}

/**
 * Извлекает цвета с сохранением оригинальных значений
 * @returns {Map<string, string>} - mapping HEX -> оригинальное значение
 */
export function extractColorsWithOriginals(svgContent) {
  const colorMap = new Map() // HEX -> original value

  // Ищем fill и stroke атрибуты
  const fillMatches = svgContent.matchAll(/fill="([^"]+)"/g)
  const strokeMatches = svgContent.matchAll(/stroke="([^"]+)"/g)

  for (const match of fillMatches) {
    const color = match[1].toLowerCase()
    if (color !== "none" && color !== "transparent" && !color.startsWith("url(")) {
      const hexColor = colorToHex(color)
      if (!colorMap.has(hexColor)) {
        colorMap.set(hexColor, color)
      }
    }
  }

  for (const match of strokeMatches) {
    const color = match[1].toLowerCase()
    if (color !== "none" && color !== "transparent" && !color.startsWith("url(")) {
      const hexColor = colorToHex(color)
      if (!colorMap.has(hexColor)) {
        colorMap.set(hexColor, color)
      }
    }
  }

  // Ищем цвета в inline-стилях
  const styleMatches = svgContent.matchAll(/style="([^"]+)"/g)
  for (const match of styleMatches) {
    const styleContent = match[1]

    const fillStyleMatch = styleContent.match(/fill\s*:\s*([^;]+)/i)
    if (fillStyleMatch) {
      const color = fillStyleMatch[1].trim().toLowerCase()
      if (color !== "none" && color !== "transparent" && !color.startsWith("url(")) {
        const hexColor = colorToHex(color)
        if (!colorMap.has(hexColor)) {
          colorMap.set(hexColor, color)
        }
      }
    }

    const strokeStyleMatch = styleContent.match(/stroke\s*:\s*([^;]+)/i)
    if (strokeStyleMatch) {
      const color = strokeStyleMatch[1].trim().toLowerCase()
      if (color !== "none" && color !== "transparent" && !color.startsWith("url(")) {
        const hexColor = colorToHex(color)
        if (!colorMap.has(hexColor)) {
          colorMap.set(hexColor, color)
        }
      }
    }
  }

  // Ищем цвета в градиентах
  const stopColorMatches = svgContent.matchAll(/stop-color="([^"]+)"/g)
  for (const match of stopColorMatches) {
    const color = match[1].toLowerCase()
    if (color !== "none" && color !== "transparent") {
      const hexColor = colorToHex(color)
      if (!colorMap.has(hexColor)) {
        colorMap.set(hexColor, color)
      }
    }
  }

  const stopStyleMatches = svgContent.matchAll(/<stop[^>]*style="([^"]+)"/g)
  for (const match of stopStyleMatches) {
    const styleContent = match[1]
    const stopColorMatch = styleContent.match(/stop-color\s*:\s*([^;]+)/i)
    if (stopColorMatch) {
      const color = stopColorMatch[1].trim().toLowerCase()
      if (color !== "none" && color !== "transparent") {
        const hexColor = colorToHex(color)
        if (!colorMap.has(hexColor)) {
          colorMap.set(hexColor, color)
        }
      }
    }
  }

  return colorMap
}

/**
 * Определяет, является ли SVG одноцветным
 */
export function isMonochrome(svgContent) {
  const colors = extractColors(svgContent)

  // Если нет цветов или только один цвет (черный/белый), то одноцветная
  if (colors.size === 0) return true
  if (colors.size === 1) {
    const color = Array.from(colors)[0]
    return color === "#000000" || color === "#ffffff"
  }

  return false
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
  const colors = extractColors(svgContent)
  const originals = extractColorsWithOriginals(svgContent)
  const mapping = createColorVariableMapping(colors, varNames)

  return { colors, mapping, originals }
}
