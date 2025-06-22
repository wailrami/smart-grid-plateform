
import { Sparkles } from 'lucide-react';


export default function GeminiAPIButton({ children, onClick, className = '', disabled = false }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center w-full px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all transform active:scale-95 duration-200 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed ${className}`}
        >
            <Sparkles className="h-5 w-5 mr-2" />
            {children}
        </button>
    );
}
