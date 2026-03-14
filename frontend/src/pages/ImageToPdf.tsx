import { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { 
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { ProcessingSpinner } from '../components/ProcessingSpinner';
import { DownloadButton } from '../components/DownloadButton';
import { ErrorToast } from '../components/ErrorToast';
import { uploadImages } from '../lib/api';

// Need a unique ID for each file since we might upload files with the same name
interface ImageWithId {
  id: string;
  file: File;
  previewUrl: string;
}

function SortableImageItem({ 
  imageWithId, 
  onRemove 
}: { 
  imageWithId: ImageWithId; 
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: imageWithId.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 mb-3 bg-white border rounded-xl shadow-sm transition-colors ${
        isDragging ? 'border-[#0165ff] shadow-md opacity-80' : 'border-gray-200 hover:border-gray-300 hover:shadow'
      }`}
    >
      <div className="flex items-center flex-1 min-w-0">
        <button
          className="p-1 mr-2 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 focus:outline-none"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center w-12 h-12 mr-3 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
          <img 
            src={imageWithId.previewUrl} 
            alt={imageWithId.file.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium text-gray-900 truncate">
            {imageWithId.file.name}
          </span>
          <span className="text-sm text-gray-500">
            {(imageWithId.file.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      </div>
      <button
        onClick={() => onRemove(imageWithId.id)}
        className="p-2 ml-4 text-gray-400 rounded-full hover:bg-gray-100 hover:text-red-500 focus:outline-none transition-colors"
        aria-label="Remove image"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function ImageToPdf() {
  const [images, setImages] = useState<ImageWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    };
  }, []); // Only on unmount for full cleanup, handled individually on remove

  const handleFilesSelected = (newFiles: File[]) => {
    const newImages = newFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    
    setImages(prev => [...prev, ...newImages]);
    setError(null);
    setResultBlob(null);
  };

  const handleRemoveImage = (idToRemove: string) => {
    setImages(prev => {
      const imgToRemove = prev.find(img => img.id === idToRemove);
      if (imgToRemove) {
        URL.revokeObjectURL(imgToRemove.previewUrl);
      }
      return prev.filter(img => img.id !== idToRemove);
    });
    setResultBlob(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setResultBlob(null);
    }
  };

  const handleCreatePdf = async () => {
    if (images.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setResultBlob(null);

    try {
      const filesToUpload = images.map(img => img.file);
      const blob = await uploadImages('/image-to-pdf', filesToUpload);
      setResultBlob(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert images to PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setResultBlob(null);
    setError(null);
  };

  if (isProcessing) {
    return <ProcessingSpinner message="Converting images to PDF..." />;
  }

  if (resultBlob) {
    return (
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto space-y-8 mt-12">
        <div className="p-8 text-center bg-white border border-gray-200 shadow-sm rounded-2xl w-full">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Conversion Complete!</h2>
          <p className="mb-8 text-gray-500">Your images have been successfully converted to a PDF document.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-auto px-8">
              <DownloadButton 
                blob={resultBlob} 
                filename="images_combined.pdf" 
              />
            </div>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-8 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Image to PDF</h1>
        <p className="mt-4 text-lg text-gray-500">
          Convert your images (PNG, JPG) to a single PDF document. Drag and drop to reorder.
        </p>
      </div>

      <div className="space-y-8">
        <FileDropzone
          accept={{
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg']
          }}
          maxFiles={50}
          label="Choose images or drag & drop"
          sublabel="PNG, JPG up to 50MB each"
          onFilesSelected={handleFilesSelected}
          showFileList={false}
        />

        {images.length > 0 && (
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Selected Images ({images.length})
              </h2>
              <button
                onClick={handleReset}
                className="text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none"
              >
                Clear All
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map(img => img.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {images.map((img) => (
                    <SortableImageItem
                      key={img.id}
                      imageWithId={img}
                      onRemove={handleRemoveImage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="mt-8">
              <button
                onClick={handleCreatePdf}
                disabled={images.length === 0}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0165ff] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0165ff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <ErrorToast 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}
    </div>
  );
}
