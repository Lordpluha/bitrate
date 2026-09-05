import { describe, expect, it } from 'vitest'
import { createSvgrConfig } from './svgr-config.mjs'

describe('createSvgrConfig', () => {
  describe('common options', () => {
    it('enables TypeScript output', () => {
      expect(createSvgrConfig(true).typescript).toBe(true)
      expect(createSvgrConfig(false).typescript).toBe(true)
    })

    it('uses named export type', () => {
      expect(createSvgrConfig(true).exportType).toBe('named')
      expect(createSvgrConfig(false).exportType).toBe('named')
    })

    it('uses automatic JSX runtime', () => {
      expect(createSvgrConfig(true).jsxRuntime).toBe('automatic')
      expect(createSvgrConfig(false).jsxRuntime).toBe('automatic')
    })

    it('sets aria-hidden and focusable svg props', () => {
      const config = createSvgrConfig(true)
      expect(config.svgProps['aria-hidden']).toBe('true')
      expect(config.svgProps.focusable).toBe('false')
    })

    it('includes svgo and jsx plugins', () => {
      const config = createSvgrConfig(true)
      expect(config.plugins).toHaveLength(2)
    })

    it('disables prettier', () => {
      expect(createSvgrConfig(true).prettier).toBe(false)
      expect(createSvgrConfig(false).prettier).toBe(false)
    })

    it('is not native', () => {
      expect(createSvgrConfig(true).native).toBe(false)
      expect(createSvgrConfig(false).native).toBe(false)
    })

    it('expands props at the end', () => {
      expect(createSvgrConfig(true).expandProps).toBe('end')
      expect(createSvgrConfig(false).expandProps).toBe('end')
    })

    it('has a template function', () => {
      expect(typeof createSvgrConfig(true).template).toBe('function')
    })
  })

  describe('monochrome config', () => {
    it('includes convertColors plugin with currentColor', () => {
      const config = createSvgrConfig(true)
      const plugins = config.svgoConfig.plugins
      const convertColors = plugins.find((p) => p.name === 'convertColors')
      expect(convertColors).toBeDefined()
      expect(convertColors.params.currentColor).toBe(true)
    })

    it('has replaceAttrValues mapping black to currentColor', () => {
      const config = createSvgrConfig(true)
      expect(config.replaceAttrValues['#000000']).toBe('currentColor')
      expect(config.replaceAttrValues['#000']).toBe('currentColor')
    })

    it('has replaceAttrValues mapping white to currentColor', () => {
      const config = createSvgrConfig(true)
      expect(config.replaceAttrValues['#ffffff']).toBe('currentColor')
      expect(config.replaceAttrValues['#fff']).toBe('currentColor')
    })

    it('has replaceAttrValues mapping named white/black to currentColor', () => {
      const config = createSvgrConfig(true)
      expect(config.replaceAttrValues.white).toBe('currentColor')
      expect(config.replaceAttrValues.black).toBe('currentColor')
    })
  })

  describe('multicolor config', () => {
    it('does not have replaceAttrValues', () => {
      const config = createSvgrConfig(false)
      expect(config.replaceAttrValues).toBeUndefined()
    })

    it('does not include convertColors plugin', () => {
      const config = createSvgrConfig(false)
      const plugins = config.svgoConfig.plugins
      const convertColors = plugins.find((p) => p.name === 'convertColors')
      expect(convertColors).toBeUndefined()
    })

    it('disables convertColors in preset-default overrides', () => {
      const config = createSvgrConfig(false)
      const plugins = config.svgoConfig.plugins
      const presetDefault = plugins.find((p) => p.name === 'preset-default')
      expect(presetDefault.params.overrides.convertColors).toBe(false)
    })
  })

  describe('svgo common plugins', () => {
    it('keeps viewBox via removeViewBox: false in both modes', () => {
      for (const isMonochrome of [true, false]) {
        const config = createSvgrConfig(isMonochrome)
        const presetDefault = config.svgoConfig.plugins.find((p) => p.name === 'preset-default')
        expect(presetDefault.params.overrides.removeViewBox).toBe(false)
      }
    })

    it('includes prefixIds plugin in both modes', () => {
      for (const isMonochrome of [true, false]) {
        const config = createSvgrConfig(isMonochrome)
        const prefixIds = config.svgoConfig.plugins.find((p) => p.name === 'prefixIds')
        expect(prefixIds).toBeDefined()
      }
    })

    it('includes removeAttrs plugin targeting xmlns:xlink in both modes', () => {
      for (const isMonochrome of [true, false]) {
        const config = createSvgrConfig(isMonochrome)
        const removeAttrs = config.svgoConfig.plugins.find((p) => p.name === 'removeAttrs')
        expect(removeAttrs).toBeDefined()
        expect(removeAttrs.params.attrs).toContain('xmlns:xlink')
      }
    })
  })

  describe('color variables parameter', () => {
    it('accepts a null color variables map without throwing', () => {
      expect(() => createSvgrConfig(false, null)).not.toThrow()
    })

    it('accepts a color variables Map without throwing', () => {
      const map = new Map([['#ff0000', 'primaryColor']])
      expect(() => createSvgrConfig(false, map)).not.toThrow()
    })
  })
})
