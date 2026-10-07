import React, { useRef, useState } from "react"
import { UploadCloud, FileText, Image as ImageIcon, X, AlertCircle } from "lucide-react"

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  isUploading?: boolean
  className?: string
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  isUploading = false,
  className = "",
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateAndSelect = (file: File) => {
    setError(null)
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/tiff",
      "application/pdf",
    ]

    if (!allowed.includes(file.type)) {
      setError("Please upload a supported format: JPG, PNG, WebP, TIFF, or PDF.")
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("File size exceeds 15 MB limit.")
      return
    }

    setSelectedFile(file)
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0])
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition cursor-pointer ${
          dragActive
            ? "border-teal-500 bg-teal-50/50"
            : selectedFile
            ? "border-teal-300 bg-teal-50/20"
            : "border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/tiff,application/pdf"
          className="hidden"
          onChange={handleChange}
          disabled={isUploading}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center text-center">
            {previewUrl ? (
              <div className="relative mb-3">
                <img
                  src={previewUrl}
                  alt="Medicine Scan Preview"
                  className="w-32 h-32 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
                {!isUploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClear()
                    }}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-900 text-white hover:bg-rose-600 transition shadow"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-teal-100/70 border border-teal-200 flex items-center justify-center text-teal-800 mb-3 shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
            )}

            <p className="text-sm font-semibold text-slate-800">{selectedFile.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for OCR extraction
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-3 shadow-sm">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h4 className="text-sm font-semibold text-slate-800">
              Upload medicine package / prescription
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Drag and drop your medicine box, label photograph, or prescription PDF here, or browse files.
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Supports JPEG, PNG, WebP, TIFF, PDF (max 15 MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}

export default FileUploader
