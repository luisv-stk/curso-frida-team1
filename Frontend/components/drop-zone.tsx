// Language: TypeScript+React
'use client';
import { cn } from "@/lib/utils";
import { useUploadDropzone, useUploadStore } from "@/stores";
import React, { useState, useRef } from "react";
import { FiCloud, FiCamera } from "react-icons/fi";

type DropzoneComponentProps = {
  message?: string;
  iconSize?: number;
};

const DEFAULT_MESSAGE =
  "Arrastra desde tu ordenador el archivo que quieres cargar\nRecuerda que el archivo no puede super la 2 Mb. y tiene que ser en formato .JPG o .PNG";

const ICON_COLOR = "#ee28ff";
const MESSAGE_COLOR = "#6f7274";

/**
 * DropzoneComponent renders an area indicating the user can drop files.
 *
 * @param {DropzoneComponentProps} props - Optional props to customize message and icon.
 * @returns {JSX.Element} The dropzone UI element.
 */
export const DropzoneComponent: React.FC<DropzoneComponentProps> = ({
  message = DEFAULT_MESSAGE,
  iconSize = 40,
}) =>{ 
    const store = useUploadStore();
    const { handleDrop, handleFileInput } = useUploadDropzone();
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const onDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        // hint to the browser and OS that we'll copy the file
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
        setIsDragOver(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        // Prefer items when available (better for some drag sources)
        let files: File[] = [];
        if (e.dataTransfer?.items && e.dataTransfer.items.length) {
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                const item = e.dataTransfer.items[i];
                if (item.kind === "file") {
                    const file = item.getAsFile();
                    if (file) files.push(file);
                }
            }
        } else if (e.dataTransfer?.files) {
            files = Array.from(e.dataTransfer.files);
        }

        if (files.length) handleDrop(files);
    };

   return (
    <div 
      className={cn(`flex flex-col items-center dropzone w-full p-10`, '', {
        'bg-green-100': isDragOver,
      })}
      onClick={() => inputRef.current?.click()}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      aria-label="Drop files here or click to upload"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
    >
        {store.files.length === 0 && 
            <div>
                <FiCloud size={iconSize} className="mx-auto" color={ICON_COLOR} />
                <input
                    ref={inputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileInput}
                    style={{ display: "none" }}
                    id="file-input"
                />
                <p className="mt-2" style={{ color: MESSAGE_COLOR }}>
                    {message.split('\n').map((line, i) => (
                        <span key={i}>
                        {line}
                        <br />
                        </span>
                    ))}
                </p>
            </div>
        }
        {store.files.length > 0 && 
            <div>
                <FiCamera size={iconSize} className="mx-auto" color={ICON_COLOR} />
                <p className="mt-2" style={{ color: MESSAGE_COLOR }}>
                    {`${store.files[0].name} - (${(store.files[0].size / (1024 * 1024)).toFixed(2)} Mb)`}
                </p>
            </div>
        }
        
        
    </div>
    )
};