"use client"

import type React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import PdfViewer from "@/components/pdf-viewer"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTextbook } from "@/contexts/TextbookContext"

interface PdfViewerModalProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string | null
  bookTitle: string
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ isOpen, onClose, pdfUrl, bookTitle }) => {
  const { setIsTextbookOpen } = useTextbook()

  const handleClose = () => {
    setIsTextbookOpen(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="bg-primary text-primary-foreground p-2 flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-lg font-semibold">{bookTitle}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-primary-foreground hover:text-secondary-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <div className="flex-grow overflow-hidden relative">
            <div className="absolute inset-0">
              {pdfUrl ? (
                <PdfViewer
                  fileUrl={pdfUrl}
                  onError={(error) => {
                    console.error("Error loading PDF:", error)
                    // You can add additional error handling here if needed
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>No PDF file available for this book</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PdfViewerModal

