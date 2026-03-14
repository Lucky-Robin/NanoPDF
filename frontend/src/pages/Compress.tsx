import { useState } from 'react';
import { FileDropzone } from '../components/FileDropzone';
import { ProcessingSpinner } from '../components/ProcessingSpinner';
import { DownloadButton } from '../components/DownloadButton';
import { ErrorToast } from '../components/ErrorToast';

interface CompressionStats {
  originalSize: string;
  compressedSize: string;
  reductionPercent: string;
  method: string;
}

export default function Compress() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [stats, setStats] = useState<CompressionStats | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setCompressedBlob(null);
      setStats(null);
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setCompressedBlob(null);
    setStats(null);

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('target', target.toString());

      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errData.detail || `API error: ${response.statusText}`);
      }

      const origSize = response.headers.get('X-Original-Size');
      const compSize = response.headers.get('X-Compressed-Size');
      const redPercent = response.headers.get('X-Reduction-Percent');
      const method = response.headers.get('X-Compression-Method');

      const blob = await response.blob();

      setStats({
        originalSize: origSize ? formatSize(parseInt(origSize, 10)) : '0.00',
        compressedSize: compSize ? formatSize(parseInt(compSize, 10)) : '0.00',
        reductionPercent: redPercent || '0',
        method: method || 'unknown'
      });

      setCompressedBlob(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compress PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Compress PDF</h1>
        <p className="text-gray-500">Reduce your PDF file size while maintaining quality.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
        <FileDropzone 
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFilesSelected}
          label="Choose PDF to compress"
          sublabel="Up to 50 MB"
        />

        {file && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Compression Target</label>
                <span className="text-sm font-bold text-[#0165ff] bg-blue-50 px-3 py-1 rounded-full">
                  {target}% Reduction
                </span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="90" 
                step="10" 
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0165ff]"
              />
              <div className="flex justify-between text-xs text-gray-400 font-medium">
                <span>10% (Less compression)</span>
                <span>90% (More compression)</span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleCompress}
                disabled={isProcessing}
                className="bg-[#0165ff] hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Compress PDF
              </button>
            </div>
          </div>
        )}

        {stats && compressedBlob && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">Compression Results</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Original Size</p>
                <p className="text-xl font-bold text-gray-900">{stats.originalSize} MB</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Compressed Size</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xl font-bold text-green-600">{stats.compressedSize} MB</p>
                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    -{stats.reductionPercent}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm">
                Method: <span className="font-medium text-gray-700">{stats.method}</span>
              </p>
              <DownloadButton 
                blob={compressedBlob} 
                filename={`compressed_${file?.name || 'document.pdf'}`} 
              />
            </div>
            <p className="text-center text-sm text-gray-500 italic pt-2">
              Original: {stats.originalSize} MB &rarr; Compressed: {stats.compressedSize} MB ({stats.reductionPercent}% reduction) &bull; Method: {stats.method}
            </p>
          </div>
        )}
      </div>

      {isProcessing && <ProcessingSpinner message={`Compressing ${file?.name}...`} />}
      
      <ErrorToast message={error} onClose={() => setError(null)} />
    </div>
  );
}
