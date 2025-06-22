export default function PageHeader ({ title, subtitle }) {
  return (
    <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-gray-400 mt-1">{subtitle}</p>
    </div>
  )
};