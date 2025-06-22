
import Card from './Card';
import { Sparkles, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';



export default function GeminiResponseCard({ content, isLoading }) {
    return (
        <Card>
            <h2 className="flex items-center font-bold text-lg text-white mb-4">
                <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                Gemini AI Analysis
            </h2>
            {isLoading ? (
                <div className="flex items-center justify-center h-24">
                    <Loader className="animate-spin h-8 w-8 text-purple-400" />
                    <p className="ml-3 text-gray-400">Generating insights...</p>
                </div>
            ) : (
                <div className="text-gray-300 prose prose-invert prose-sm max-w-none" >
                    <ReactMarkdown >{content}</ReactMarkdown>
                </div>
            )}
        </Card>
    );
}
