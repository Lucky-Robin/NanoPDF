import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileDropzone } from './FileDropzone'

describe('FileDropzone', () => {
  it('renders with label text', () => {
    const mockHandler = vi.fn()
    render(<FileDropzone onFilesSelected={mockHandler} label="Test Label" />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('shows sublabel text', () => {
    const mockHandler = vi.fn()
    render(<FileDropzone onFilesSelected={mockHandler} sublabel="Test sublabel" />)
    expect(screen.getByText('Test sublabel')).toBeInTheDocument()
  })

  it('accepts PDF files by default', () => {
    const mockHandler = vi.fn()
    const { container } = render(<FileDropzone onFilesSelected={mockHandler} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.accept).toBe('application/pdf,.pdf')
  })

  it('calls onFilesSelected when files are selected', async () => {
    const mockHandler = vi.fn()
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    
    render(<FileDropzone onFilesSelected={mockHandler} />)
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    await userEvent.upload(input, file)
    
    expect(mockHandler).toHaveBeenCalledWith([file])
  })
})
