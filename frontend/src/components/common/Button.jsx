
export default function Button({ children, onClick, className = '', icon: Icon, disabled = false }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform active:scale-95 duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed ${className}`}
        >
            {Icon && <Icon className="h-5 w-5 mr-2" />}
            {children}
        </button>
    );
}

