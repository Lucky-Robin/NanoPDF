import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from './Home'

describe('Home', () => {
  it('renders page title NanoPDF', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    expect(screen.getByText('NanoPDF')).toBeInTheDocument()
  })

  it('renders tagline', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    expect(screen.getByText(/Your local PDF toolkit/i)).toBeInTheDocument()
  })

  it('renders 6 feature cards', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    expect(screen.getByText('Preview & Sort')).toBeInTheDocument()
    expect(screen.getByText('Merge PDFs')).toBeInTheDocument()
    expect(screen.getByText('Compress')).toBeInTheDocument()
    expect(screen.getByText('Split PDF')).toBeInTheDocument()
    expect(screen.getByText('PDF to Image')).toBeInTheDocument()
    expect(screen.getByText('Image to PDF')).toBeInTheDocument()
  })

  it('links to /preview route', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    const links = screen.getAllByRole('link')
    const previewLink = links.find(link => link.getAttribute('href') === '/preview')
    expect(previewLink).toBeInTheDocument()
  })

  it('links to /merge route', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    const links = screen.getAllByRole('link')
    const mergeLink = links.find(link => link.getAttribute('href') === '/merge')
    expect(mergeLink).toBeInTheDocument()
  })

  it('links to /compress route', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    const links = screen.getAllByRole('link')
    const compressLink = links.find(link => link.getAttribute('href') === '/compress')
    expect(compressLink).toBeInTheDocument()
  })
})
