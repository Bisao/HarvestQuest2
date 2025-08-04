
interface LoadingScreenProps {
  message: string;
  subMessage?: string;
}

export default function LoadingScreen({ message, subMessage }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{message}</h2>
        {subMessage && (
          <p className="text-gray-600">{subMessage}</p>
        )}
      </div>
    </div>
  );
}
