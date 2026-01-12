"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { NotificationProvider, useNotification } from "@/contexts/NotificationContext";
import NotificationContainer from "@/components/Notification";

export default function ProtectedPage() {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-white flex">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Loading...</p>
              </div>
            </main>
          </div>
        }>
          <ProtectedInner />
        </Suspense>
      </SidebarProvider>
    </NotificationProvider>
  );
}

function ProtectedInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError } = useNotification();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [apiKeyData, setApiKeyData] = useState<{ name: string; type: string } | null>(null);
  const hasValidated = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasValidated.current) return;
    
    const validateApiKey = async () => {
      const apiKey = searchParams.get("key");
      
      // Mark as validated before async operations to prevent double execution
      hasValidated.current = true;

      if (!apiKey) {
        showError("API key is invalid");
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch("/api/keys/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: apiKey }),
        });

        const result = await response.json();

        if (result.valid) {
          setIsValid(true);
          setApiKeyData({
            name: result.data.name,
            type: result.data.type,
          });
          success("Valid API KEY, /protected can be accessed");
        } else {
          setIsValid(false);
          showError("API key is invalid");
        }
      } catch (err) {
        setIsValid(false);
        showError("API key is invalid");
      } finally {
        setIsValidating(false);
      }
    };

    validateApiKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <NotificationContainer />
      <div className="min-h-screen bg-white flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Top Bar */}
          <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1 font-medium">Pages / Protected</div>
                <h1 className="text-2xl font-semibold text-gray-900">Protected Area</h1>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            {isValidating ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Validating API key...</p>
              </div>
            ) : isValid && apiKeyData ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Access Granted</h2>
                      <p className="text-sm text-gray-600">Your API key is valid</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-1">API Key Name</div>
                    <div className="text-base text-gray-900">{apiKeyData.name}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-1">Type</div>
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                      apiKeyData.type === "dev" 
                        ? "bg-blue-50 text-blue-700 border border-blue-200" 
                        : "bg-purple-50 text-purple-700 border border-purple-200"
                    }`}>
                      {apiKeyData.type}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => router.push("/dashboard/playground")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Test Another Key
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
                      <p className="text-sm text-gray-600">Invalid API key</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => router.push("/dashboard/playground")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

