
import { Upload } from 'lucide-react';

export default function FileInput({ onFileSelect, fileName }) {
    return (
    <div className="w-full">
        <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center w-full px-6 py-10 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 transition-colors duration-200 bg-gray-800/30">
        <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-500" />
            <p className="mt-2 text-sm text-gray-400">
                <span className="font-semibold text-blue-500">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">CSV file up to 10MB</p>
            {fileName && (
                <p className="text-sm font-medium text-green-400 mt-3">
                    Selected: {fileName}
                </p>
            )}
        </div>
        </label>
    <input
        id="file-upload"
        name="file-upload"
        type="file"
        className="sr-only"
        onChange={onFileSelect}
        accept=".csv"
    />
    </div>
    )
}



