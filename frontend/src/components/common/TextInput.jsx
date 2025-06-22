
export default function TextInput({ label, name ="", placeholder, value, onChange, type = "text", 
    showSeconds = false, step='', min=undefined, max=undefined , icon: Icon }) {
    return (
        <div className="w-full mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />}
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    step={type ==="datetime-local" && showSeconds ? "1" : step}
                    onChange={onChange}
                    min={min}
                    max={max}
                    className={`w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white ${Icon ? 'pl-10' : ''}`}
                />
            </div>
        </div>
    );
}


