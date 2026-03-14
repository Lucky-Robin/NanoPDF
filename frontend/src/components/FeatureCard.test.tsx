import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { FeatureCard } from './FeatureCard'
import { Eye } from 'lucide-react'

describe('FeatureCard', () => {
  it('renders title and description', () => {
    render(
      <BrowserRouter>
        <FeatureCard
          title="Test Title"
          description="Test Description"
          icon={Eye}
          href="/test"
        />
      </BrowserRouter>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('links to correct href', () => {
    render(
      <BrowserRouter>
        <FeatureCard
          title="Test Title"
          description="Test Description"
          icon={Eye}
          href="/preview"
        />
      </BrowserRouter>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/preview')
  })

  it('renders icon component', () => {
    const { container } = render(
      <BrowserRouter>
        <FeatureCard
          title="Test Title"
          description="Test Description"
          icon={Eye}
          href="/test"
        />
      </BrowserRouter>
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
