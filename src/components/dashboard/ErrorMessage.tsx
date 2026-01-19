import { InfoIcon } from "../icons";

interface ErrorMessageProps {
  error: string;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-2">
        <InfoIcon />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800 mb-1">Connection Error</p>
          <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
          <div className="mt-3 pt-3 border-t border-red-200">
            <a 
              href="/api/health" 
              target="_blank"
              className="text-xs text-red-700 hover:text-red-900 underline"
            >
              Check API health status →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}






