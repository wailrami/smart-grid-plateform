


export default function Card({ children, className = '' }) {
    return (
        <div className={`bg-gray-800/50 rounded-xl shadow-lg p-6 border border-gray-700/50 ${className}`}>
        {children}
        </div>
    );
    }
