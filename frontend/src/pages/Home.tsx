import { Eye, Combine, Minimize2, Scissors, Image, FileImage } from 'lucide-react';
import { FeatureCard } from '../components/FeatureCard';

export default function Home() {
  const features = [
    {
      title: 'Preview & Sort',
      description: 'View and reorganize PDF pages',
      icon: Eye,
      href: '/preview',
    },
    {
      title: 'Merge PDFs',
      description: 'Combine multiple PDFs into one',
      icon: Combine,
      href: '/merge',
    },
    {
      title: 'Compress',
      description: 'Reduce PDF file size',
      icon: Minimize2,
      href: '/compress',
    },
    {
      title: 'Split PDF',
      description: 'Extract pages from a PDF',
      icon: Scissors,
      href: '/split',
    },
    {
      title: 'PDF to Image',
      description: 'Convert PDF pages to images',
      icon: Image,
      href: '/pdf-to-image',
    },
    {
      title: 'Image to PDF',
      description: 'Create a PDF from images',
      icon: FileImage,
      href: '/image-to-pdf',
    },
  ];

  return (
    <div className="min-h-full bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">NanoPDF</h1>
          <p className="text-gray-500 text-lg">Your local PDF toolkit — fast, private, free</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.href}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              href={feature.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
