import { useEffect, useRef, useState } from 'react'
import { isMotionReduced } from '../lib/landingInteractions'

type Point = { x: number; y: number }
export type CreditsSceneConnections = {
  width: number
  height: number
  paths: { id: string; d: string }[]
}

function connect(from: DOMRect, to: DOMRect, origin: DOMRect) {
  const dx = to.x + to.width / 2 - from.x - from.width / 2
  const dy = to.y + to.height / 2 - from.y - from.height / 2
  const horizontal = Math.abs(dx) > Math.abs(dy)
  const direction = Math.sign(horizontal ? dx : dy)
  const point = (box: DOMRect, edge: number): Point => ({
    x:
      box.x -
      origin.x +
      box.width / 2 +
      (horizontal ? (box.width / 2) * edge : 0),
    y:
      box.y -
      origin.y +
      box.height / 2 +
      (horizontal ? 0 : (box.height / 2) * edge),
  })
  const start = point(from, direction)
  const end = point(to, -direction)
  const middle = horizontal ? (start.x + end.x) / 2 : (start.y + end.y) / 2
  const format = (p: Point) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`
  const first = horizontal
    ? { x: middle, y: start.y }
    : { x: start.x, y: middle }
  const second = horizontal ? { x: middle, y: end.y } : { x: end.x, y: middle }
  return `M${format(start)} C${format(first)} ${format(second)} ${format(end)}`
}

/** Measure stable card surfaces; pointer tilts never drive layout or React renders. */
export function useCreditsScene(selected: number) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)
  const [connections, setConnections] =
    useState<CreditsSceneConnections | null>(null)
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    if (isMotionReduced()) setEntered(true)
    if (!('IntersectionObserver' in window)) {
      setEntered(true)
      scene.dataset.visible = 'true'
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false
        scene.dataset.visible = String(visible)
        if (visible) setEntered(true)
      },
      { threshold: 0.2 },
    )
    observer.observe(scene)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || typeof ResizeObserver === 'undefined') return
    const person = scene.querySelector(`[data-credit-person="${selected}"]`)
    const artwork = scene.querySelector('.artist-credits-artwork')
    const splits = scene.querySelector('.artist-credits-splits')
    if (!person || !artwork || !splits) return
    let frame = 0
    const measure = () => {
      frame = 0
      const origin = scene.getBoundingClientRect()
      if (!origin.width || !origin.height) return
      const cover = window.matchMedia('(max-width: 650px)').matches
        ? (scene
            .querySelector('.artist-credits-release-stage')
            ?.getBoundingClientRect() ?? artwork.getBoundingClientRect())
        : artwork.getBoundingClientRect()
      setConnections({
        width: origin.width,
        height: origin.height,
        paths: [
          {
            id: 'person',
            d: connect(person.getBoundingClientRect(), cover, origin),
          },
          {
            id: 'shares',
            d: connect(cover, splits.getBoundingClientRect(), origin),
          },
        ],
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    for (const element of [scene, person, artwork, splits])
      observer.observe(element)
    measure()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [selected])
  return { sceneRef, entered, connections }
}
