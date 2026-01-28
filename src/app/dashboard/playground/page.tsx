"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { NotificationProvider, useNotification } from "@/contexts/NotificationContext";
import NotificationContainer from "@/components/Notification";

export default function PlaygroundPage() {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <PlaygroundInner />
      </SidebarProvider>
    </NotificationProvider>
  );
}

function PlaygroundInner() {
  const router = useRouter();
  const { success, error: showError } = useNotification();
  const { toggleSidebar } = useSidebar();
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      showError("Please enter an API key");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Navigate to protected page with API key as query parameter
      router.push(`/protected?key=${encodeURIComponent(apiKey.trim())}`);
    } catch (err) {
      showError("Failed to submit API key");
      setIsSubmitting(false);
    }
  };

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
                <div className="text-xs text-gray-400 mb-1 font-medium">Pages / API Playground</div>
                <h1 className="text-2xl font-semibold text-gray-900">API Playground</h1>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Test Your API Key
                </h2>
                <p className="text-sm text-gray-600">
                  Enter your API key below to validate it and access the protected area.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-900 mb-2">
                    API Key
                  </label>
                  <input
                    id="apiKey"
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm font-mono"
                    disabled={isSubmitting}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Your API key will be validated when you submit the form.
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-semibold rounded-lg transition-all duration-200 text-sm shadow-lg hover:shadow-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                  >
                    {isSubmitting ? "Submitting..." : "Validate & Access Protected Area"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

