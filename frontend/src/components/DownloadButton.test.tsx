import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DownloadButton } from './DownloadButton'

describe('DownloadButton', () => {
  it('is disabled when blob is null', () => {
    render(<DownloadButton blob={null} filename="test.pdf" />)
    const button = screen.getByRole('button', { name: /download/i })
    expect(button).toBeDisabled()
  })

  it('is enabled when blob is provided', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' })
    render(<DownloadButton blob={blob} filename="test.pdf" />)
    const button = screen.getByRole('button', { name: /download/i })
    expect(button).toBeEnabled()
  })

  it('displays Download text', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' })
    render(<DownloadButton blob={blob} filename="test.pdf" />)
    expect(screen.getByText('Download')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' })
    render(<DownloadButton blob={blob} filename="test.pdf" disabled={true} />)
    const button = screen.getByRole('button', { name: /download/i })
    expect(button).toBeDisabled()
  })
})
