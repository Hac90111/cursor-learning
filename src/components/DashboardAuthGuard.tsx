"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import GoogleLoginButton from "./GoogleLoginButton";
import TopBarAuth from "./TopBarAuth";

interface DashboardAuthGuardProps {
  children: ReactNode;
}

export default function DashboardAuthGuard({ children }: DashboardAuthGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Top Bar */}
          <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1 font-medium">Pages / Overview</div>
                <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
              </div>
              <TopBarAuth />
            </div>
          </div>

          {/* Login Content */}
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Authentication Required
                  </h1>
                  <p className="text-gray-600">
                    Please sign in with your Google account to manage API keys.
                  </p>
                </div>
                <div className="flex justify-center">
                  <GoogleLoginButton />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <>{children}</>;
}

