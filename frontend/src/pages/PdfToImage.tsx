import { useState } from 'react';
import { ArrowRight, Image as ImageIcon, Settings } from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { ProcessingSpinner } from '../components/ProcessingSpinner';
import { DownloadButton } from '../components/DownloadButton';
import { ErrorToast } from '../components/ErrorToast';
import { uploadPdf } from '../lib/api';

export default function PdfToImage() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [dpi, setDpi] = useState<number>(150);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const file = files[0];

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFiles([selectedFiles[0]]);
      setResultBlob(null);
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResultBlob(null);

    try {
      const blob = await uploadPdf('/pdf-to-image', [file], {
        format,
        dpi: dpi.toString(),
      });
      setResultBlob(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert PDF to images');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setFiles([]);
    setResultBlob(null);
    setError(null);
  };

  const getDownloadFilename = () => {
    if (!file || !resultBlob) return 'converted';
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    if (resultBlob.type === 'application/zip') {
      return `${baseName}_images.zip`;
    }
    return `${baseName}.${format}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
          PDF to Image
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Convert PDF pages to high-quality PNG or JPEG images.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {!file && !resultBlob && (
          <div className="p-8">
            <FileDropzone
              onFilesSelected={handleFileSelect}
              accept={{ 'application/pdf': ['.pdf'] }}
              maxFiles={1}
              label="Upload PDF to convert"
              sublabel="Select a single PDF file"
            />
          </div>
        )}

        {file && !resultBlob && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-[#0165ff] rounded-lg">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={resetState}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                Change File
              </button>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                  <Settings className="w-5 h-5 mr-2 text-gray-500" />
                  Conversion Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-gray-200 rounded-xl bg-gray-50">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Output Format
                    </label>
                    <div className="flex space-x-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="png"
                          checked={format === 'png'}
                          onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
                          className="w-4 h-4 text-[#0165ff] border-gray-300 focus:ring-[#0165ff]"
                        />
                        <span className="ml-2 text-gray-700 font-medium">PNG</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="jpeg"
                          checked={format === 'jpeg'}
                          onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
                          className="w-4 h-4 text-[#0165ff] border-gray-300 focus:ring-[#0165ff]"
                        />
                        <span className="ml-2 text-gray-700 font-medium">JPEG</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dpi" className="block text-sm font-medium text-gray-900 mb-3">
                      Resolution (DPI)
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        id="dpi"
                        min={72}
                        max={300}
                        value={dpi}
                        onChange={(e) => setDpi(Number(e.target.value))}
                        className="block w-24 rounded-lg border-gray-300 shadow-sm focus:border-[#0165ff] focus:ring-[#0165ff] sm:text-sm px-3 py-2 border"
                      />
                      <span className="text-sm text-gray-500">pixels per inch</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Min: 72, Max: 300, Default: 150</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="flex items-center justify-center space-x-2 w-full sm:w-auto px-8 py-3 bg-[#0165ff] text-white rounded-xl font-medium hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0165ff] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <span>Convert to Images</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {resultBlob && (
          <div className="p-12 text-center bg-gray-50">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <ImageIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Conversion Complete!</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Your PDF has been successfully converted to {format.toUpperCase()} images.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <DownloadButton
                blob={resultBlob}
                filename={getDownloadFilename()}
              />
              <button
                onClick={resetState}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors shadow-sm"
              >
                Convert Another File
              </button>
            </div>
          </div>
        )}
      </div>

      {isProcessing && <ProcessingSpinner message={`Converting to ${format.toUpperCase()}...`} />}
      
      <ErrorToast 
        message={error} 
        onClose={() => setError(null)} 
      />
    </div>
  );
}
