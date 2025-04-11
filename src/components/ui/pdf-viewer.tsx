
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from './button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Skeleton } from './skeleton';

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  file: string;
  onPageChange?: (page: number) => void;
  onLoadSuccess?: (numPages: number) => void;
  startPage?: number;
  className?: string;
}

export function PdfViewer({
  file,
  onPageChange,
  onLoadSuccess,
  startPage = 1,
  className = '',
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(startPage);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    if (onLoadSuccess) {
      onLoadSuccess(numPages);
    }
  };

  const changePage = (offset: number) => {
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setPageNumber(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative bg-white shadow-md rounded-md overflow-hidden">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Skeleton className="h-[800px] w-[600px]" />}
          error={
            <div className="flex items-center justify-center h-[400px] w-[300px] border border-dashed border-gray-300 rounded-md">
              <p className="text-center text-gray-500">
                Failed to load PDF. Please try again later.
              </p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            loading={<Skeleton className="h-[800px] w-[600px]" />}
          />
        </Document>
      </div>

      <div className="flex items-center justify-between w-full mt-4">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {pageNumber} / {numPages || '-'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={!numPages || pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
