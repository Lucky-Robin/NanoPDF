import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Merge from './Merge'

vi.mock('../lib/api')

describe('Merge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title', () => {
    render(
      <BrowserRouter>
        <Merge />
      </BrowserRouter>
    )
    expect(screen.getByText('Merge PDFs')).toBeInTheDocument()
  })

  it('renders FileDropzone component', () => {
    render(
      <BrowserRouter>
        <Merge />
      </BrowserRouter>
    )
    expect(screen.getByText(/Drop PDFs here or click to browse/i)).toBeInTheDocument()
  })

  it('merge button is not visible initially', () => {
    render(
      <BrowserRouter>
        <Merge />
      </BrowserRouter>
    )
    const mergeButton = screen.queryByRole('button', { name: /merge pdfs/i })
    expect(mergeButton).not.toBeInTheDocument()
  })

  it('renders page description', () => {
    render(
      <BrowserRouter>
        <Merge />
      </BrowserRouter>
    )
    expect(screen.getByText(/Combine multiple PDF files into a single document/i)).toBeInTheDocument()
  })
})
