export default function Loader({ size = 'md', label = 'Loading...' }) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4',
  };
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`${sizes[size]} border-primary-500 border-t-transparent rounded-full animate-spin`}
      />
      {label && <p className="text-gray-500 text-sm mt-3">{label}</p>}
    </div>
  );
}
