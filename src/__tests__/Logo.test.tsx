import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Logo } from '../components/ui/Logo'

describe('<Logo />', () => {
  it('defaults to the full lockup', () => {
    render(<Logo />)
    const img = screen.getByAltText('microchore') as HTMLImageElement
    expect(img.getAttribute('src')).toBe('/logo.svg')
  })

  it('variant="mark" renders the icon-only mark', () => {
    render(<Logo variant="mark" />)
    const img = screen.getByAltText('microchore') as HTMLImageElement
    expect(img.getAttribute('src')).toBe('/logo-mark.svg')
  })

  it('variant="wordmark" renders the wordmark-only SVG', () => {
    render(<Logo variant="wordmark" />)
    const img = screen.getByAltText('microchore') as HTMLImageElement
    expect(img.getAttribute('src')).toBe('/logo-wordmark.svg')
  })

  it('forwards className', () => {
    render(<Logo className="h-12 w-auto custom-class" />)
    const img = screen.getByAltText('microchore')
    expect(img).toHaveClass('h-12')
    expect(img).toHaveClass('custom-class')
  })

  it('accepts a custom alt label', () => {
    render(<Logo alt="Microchore home" />)
    expect(screen.getByAltText('Microchore home')).toBeInTheDocument()
  })

  it('is not draggable', () => {
    render(<Logo />)
    const img = screen.getByAltText('microchore')
    expect(img.getAttribute('draggable')).toBe('false')
  })
})
