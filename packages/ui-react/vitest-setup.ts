import '@testing-library/jest-dom'

// Radix UI calls these pointer capture methods which happy-dom doesn't implement
if (!window.Element.prototype.hasPointerCapture) {
  window.Element.prototype.hasPointerCapture = () => false
  window.Element.prototype.setPointerCapture = () => {}
  window.Element.prototype.releasePointerCapture = () => {}
}
