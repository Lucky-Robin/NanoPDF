import { useState } from 'react';
import { FileDropzone } from '../components/FileDropzone';
import { ProcessingSpinner } from '../components/ProcessingSpinner';
import { DownloadButton } from '../components/DownloadButton';
import { ErrorToast } from '../components/ErrorToast';
import { splitPdf } from '../lib/api';

export default function Split() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'all' | 'ranges'>('all');
  const [ranges, setRanges] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    if (mode === 'ranges' && !ranges.trim()) {
      setError('Please specify custom ranges to split by.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const blob = await splitPdf(file, mode, ranges);
      setResultBlob(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to split PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setMode('all');
    setRanges('');
    setResultBlob(null);
    setError(null);
  };

  const originalName = file?.name.replace('.pdf', '') || 'document';
  const zipFilename = `${originalName}_split.zip`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Split PDF
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Separate one page or a whole set for easy conversion into independent PDF files.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        {!resultBlob ? (
          <div className="space-y-8">
            <FileDropzone
              accept={{ 'application/pdf': ['.pdf'] }}
              maxFiles={1}
              onFilesSelected={handleFileSelected}
              label="Choose a PDF file to split"
              sublabel="Up to 50 MB"
            />

            {file && (
              <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Split Mode</h3>
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-6">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        value="all"
                        checked={mode === 'all'}
                        onChange={(e) => setMode(e.target.value as 'all' | 'ranges')}
                        className="w-4 h-4 text-[#0165ff] border-gray-300 focus:ring-[#0165ff]"
                      />
                      <span className="ml-2 text-gray-700 group-hover:text-gray-900">
                        Split into individual pages
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        value="ranges"
                        checked={mode === 'ranges'}
                        onChange={(e) => setMode(e.target.value as 'all' | 'ranges')}
                        className="w-4 h-4 text-[#0165ff] border-gray-300 focus:ring-[#0165ff]"
                      />
                      <span className="ml-2 text-gray-700 group-hover:text-gray-900">
                        Custom ranges
                      </span>
                    </label>
                  </div>
                </div>

                {mode === 'ranges' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label htmlFor="ranges" className="block text-sm font-medium text-gray-700">
                      Pages to extract
                    </label>
                    <input
                      type="text"
                      id="ranges"
                      value={ranges}
                      onChange={(e) => setRanges(e.target.value)}
                      placeholder="e.g. 1-3, 5, 7-9"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#0165ff] focus:ring-[#0165ff] sm:text-sm px-4 py-2 border"
                    />
                    <p className="text-xs text-gray-500">
                      Separate ranges with commas. Example: 1-3, 5, 7-9
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSplit}
                    disabled={isProcessing || !file || (mode === 'ranges' && !ranges.trim())}
                    className="px-6 py-2.5 bg-[#0165ff] text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Split PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">PDF Split Successfully!</h3>
            <p className="text-gray-600">
              Your file has been split and is ready to download.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <DownloadButton
                blob={resultBlob}
                filename={zipFilename}
              />
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Split Another PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {isProcessing && <ProcessingSpinner message="Splitting your PDF..." />}
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
    </div>
  );
}
