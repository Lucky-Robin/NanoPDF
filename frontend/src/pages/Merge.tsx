import { useState } from 'react';
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
import { GripVertical, X, File as FileIcon } from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { ProcessingSpinner } from '../components/ProcessingSpinner';
import { DownloadButton } from '../components/DownloadButton';
import { ErrorToast } from '../components/ErrorToast';
import { uploadPdf } from '../lib/api';

// Need a unique ID for each file since we might upload files with the same name
interface FileWithId {
  id: string;
  file: File;
}

function SortableFileItem({ 
  fileWithId, 
  onRemove 
}: { 
  fileWithId: FileWithId; 
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fileWithId.id });

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
        <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-blue-50 text-[#0165ff] flex-shrink-0">
          <FileIcon className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium text-gray-900 truncate">
            {fileWithId.file.name}
          </span>
          <span className="text-sm text-gray-500">
            {(fileWithId.file.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      </div>
      <button
        onClick={() => onRemove(fileWithId.id)}
        className="p-2 ml-4 text-gray-400 rounded-full hover:bg-gray-100 hover:text-red-500 focus:outline-none transition-colors"
        aria-label="Remove file"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function Merge() {
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => {
      // Add new files, generate unique IDs
      const newFilesWithIds = newFiles.map(file => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
      }));
      
      const combined = [...prev, ...newFilesWithIds];
      // Max 20 files
      if (combined.length > 20) {
        setError('Maximum 20 files allowed. Only the first 20 were kept.');
        return combined.slice(0, 20);
      }
      return combined;
    });
    setResultBlob(null);
    setError(null);
  };

  const handleRemove = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setResultBlob(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setResultBlob(null);
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    
    setIsProcessing(true);
    setError(null);
    setResultBlob(null);
    
    try {
      const actualFiles = files.map(f => f.file);
      const blob = await uploadPdf('/merge', actualFiles);
      setResultBlob(blob);
    } catch (err: unknown) {
      console.error('Merge error:', err);
      setError(err instanceof Error ? err.message : 'Failed to merge PDFs');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setResultBlob(null);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Merge PDFs</h1>
        <p className="mt-2 text-lg text-gray-600">
          Combine multiple PDF files into a single document. Drag to reorder.
        </p>
      </div>

      {error && (
        <ErrorToast message={error} onClose={() => setError(null)} />
      )}

      <div className="space-y-6">
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            accept={{ 'application/pdf': ['.pdf'] }}
            maxFiles={20}
            maxSize={50 * 1024 * 1024} // 50MB per file
            label="Drop PDFs here or click to browse"
            sublabel="Up to 20 files, 50MB each"
            showFileList={false}
          />

          {files.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Files to Merge ({files.length}/20)
                </h2>
                <button
                  onClick={reset}
                  className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors focus:outline-none"
                >
                  Clear all
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={files.map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {files.map((fileWithId) => (
                      <SortableFileItem
                        key={fileWithId.id}
                        fileWithId={fileWithId}
                        onRemove={handleRemove}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="mt-6 flex flex-col items-center">
                {isProcessing ? (
                  <div className="py-4">
                    <ProcessingSpinner message="Merging PDFs..." />
                  </div>
                ) : resultBlob ? (
                  <div className="w-full max-w-sm flex justify-center [&>*]:w-full">
                    <DownloadButton
                      blob={resultBlob}
                      filename="merged_document.pdf"
                    />
                  </div>
                ) : (
                  <button
                    onClick={handleMerge}
                    disabled={files.length < 2}
                    className={`w-full max-w-sm py-3 px-4 rounded-xl font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0165ff] ${
                      files.length >= 2
                        ? 'bg-[#0165ff] hover:bg-blue-600 hover:shadow-md active:transform active:scale-[0.98]'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Merge PDFs
                  </button>
                )}
                {files.length === 1 && !resultBlob && !isProcessing && (
                  <p className="mt-2 text-sm text-gray-500">
                    Add at least one more file to merge
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
