
export default function SelectInput({ label, name="", options, value, onChange, icon:Icon }) {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />}
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white ${Icon ? 'pl-10' : ''}`}
                >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.icon && <option.icon className="inline-block mr-2" />}
                        {option.label}
                    </option>
                ))}
                </select>
            </div>
    </div>
    );
}


