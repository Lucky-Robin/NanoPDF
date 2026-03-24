import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, RefreshCw } from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { ProcessingSpinner } from '../components/ProcessingSpinner';
import { DownloadButton } from '../components/DownloadButton';
import { ErrorToast } from '../components/ErrorToast';
import { getThumbnails } from '../lib/api';

interface ThumbnailItem {
  id: string;
  base64: string;
  originalIndex: number;
}

function SortableItem({ item, index }: { item: ThumbnailItem; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col items-center p-2 bg-white rounded-xl shadow-sm border border-gray-200 ${
        isDragging ? 'shadow-lg border-[#0066FF] opacity-90 scale-105' : 'hover:border-gray-300'
      }`}
    >
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs font-medium rounded backdrop-blur-sm z-10">
        {index + 1}
      </div>
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-900 rounded-md cursor-grab active:cursor-grabbing backdrop-blur-sm shadow-sm transition-colors z-10"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <img
        src={item.base64}
        alt={`Page ${item.originalIndex + 1}`}
        className="w-full aspect-[1/1.4] object-contain bg-\[#FAFAFA\] rounded-lg pointer-events-none"
      />
    </div>
  );
}

export default function Preview() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<ThumbnailItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reorderedBlob, setReorderedBlob] = useState<Blob | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    
    setFile(selectedFile);
    setIsProcessing(true);
    setError(null);
    setReorderedBlob(null);

    try {
      const b64s = await getThumbnails(selectedFile);
      setThumbnails(
        b64s.map((b64, index) => ({
          id: `page-${index}`,
          base64: b64,
          originalIndex: index,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate thumbnails');
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setThumbnails((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        setReorderedBlob(null);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleReorder = async () => {
    if (!file) return;

    setIsReordering(true);
    setError(null);

    try {
      const order = thumbnails.map((t) => t.originalIndex);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('order', JSON.stringify(order));

      const response = await fetch('/api/reorder', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to reorder PDF');
      }

      const blob = await response.blob();
      setReorderedBlob(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder PDF');
    } finally {
      setIsReordering(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setThumbnails([]);
    setReorderedBlob(null);
    setError(null);
  };

  const isPreviewing = thumbnails.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Preview & Sort PDF</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Upload a PDF, drag and drop the pages to reorder them, and download the new PDF.
        </p>
      </div>

      {!isPreviewing && (
        <FileDropzone
          onFilesSelected={handleFileSelect}
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          label="Choose a PDF file to reorder"
          sublabel="Up to 50 MB, max 50 pages"
        />
      )}

      {isPreviewing && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-\[#FAFAFA\] p-4 rounded-xl border border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-4 sm:mb-0">
              <span className="text-[#0066FF] font-bold">{thumbnails.length}</span> pages loaded from {file?.name}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={resetState}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-\[#FAFAFA\] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Start Over</span>
              </button>
              {reorderedBlob ? (
                <DownloadButton
                  blob={reorderedBlob}
                  filename={`reordered_${file?.name || 'document.pdf'}`}
                />
              ) : (
                <button
                  onClick={handleReorder}
                  disabled={isReordering}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#0066FF] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Download Reordered PDF</span>
                </button>
              )}
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={thumbnails.map((t) => t.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {thumbnails.map((item, index) => (
                  <SortableItem key={item.id} item={item} index={index} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {isProcessing && <ProcessingSpinner message="Generating thumbnails..." />}
      {isReordering && <ProcessingSpinner message="Reordering PDF pages..." />}
      <ErrorToast message={error} onClose={() => setError(null)} />
    </div>
  );
}
