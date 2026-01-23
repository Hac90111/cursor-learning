"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import DashboardAuthGuard from "@/components/DashboardAuthGuard";
import TopBarAuth from "@/components/TopBarAuth";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { NotificationProvider, useNotification } from "@/contexts/NotificationContext";
import NotificationContainer from "@/components/Notification";
import { useApiKeys } from "@/hooks/useApiKeys";
import { ApiKey, ApiKeyFormData, defaultFormData } from "@/types/api-key";

export default function Dashboard() {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <DashboardAuthGuard>
          <DashboardInner />
        </DashboardAuthGuard>
      </SidebarProvider>
    </NotificationProvider>
  );
}

function DashboardInner() {
  const { success, error: showError, info } = useNotification();
  const {
    apiKeys,
    loading,
    error,
    createApiKey,
    updateApiKey,
    deleteApiKey,
  } = useApiKeys({
    onSuccess: success,
    onError: showError,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState<ApiKeyFormData>(defaultFormData);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const handleCreate = async () => {
    try {
      await createApiKey(formData);
      setFormData(defaultFormData);
      setShowModal(false);
    } catch (err) {
      // Error already handled by hook via onError callback
    }
  };

  const handleUpdate = async () => {
    if (!editingKey) return;

    try {
      await updateApiKey(editingKey.id, formData, editingKey.key);
      setEditingKey(null);
      setFormData(defaultFormData);
      setShowModal(false);
    } catch (err) {
      // Error already handled by hook via onError callback
    }
  };

  const handleDeleteClick = (key: ApiKey) => {
    setDeleteConfirm({ id: key.id, name: key.name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteApiKey(deleteConfirm.id, deleteConfirm.name);
      setDeleteConfirm(null);
    } catch (err) {
      // Error already handled by hook via onError callback
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (key: ApiKey) => {
    setEditingKey(key);
    setFormData({
      name: key.name,
      key: key.key,
      keyType: key.type === "dev" ? "dev" : "prod",
      limitMonthlyUsage: key.limit_monthly_usage || false,
      monthlyLimit: key.monthly_limit || 1000,
      enablePII: key.enable_pii || false,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingKey(null);
    setShowModal(false);
  };

  const toggleShowKey = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    info("API key copied to clipboard!");
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return "•".repeat(key.length);
    return key.substring(0, 8) + "•".repeat(28);
  };

  // Icons as SVG components
  const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const CopyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );

  const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );

  const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );

  const ExternalLinkIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );

  const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );

  const { toggleSidebar } = useSidebar();

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
              <div className="text-xs text-gray-400 mb-1 font-medium">Pages / Overview</div>
              <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Operational
              </div>
              <TopBarAuth />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* API Keys Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">API Keys</h2>
                <p className="text-sm text-gray-500">
                  Manage your API keys for authenticating requests to the{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Research API</a>
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Key
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 mb-1">Connection Error</p>
                    <p className="text-sm text-red-700 whitespace-pre-line leading-relaxed">{error}</p>
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <a 
                        href="/api/health" 
                        target="_blank"
                        className="text-xs text-red-700 hover:text-red-900 font-medium inline-flex items-center gap-1"
                      >
                        Check API health status
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-gray-500 text-sm">Loading API keys...</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <p className="text-gray-600 font-medium mb-1">No API keys yet</p>
                <p className="text-sm text-gray-500 mb-4">Create your first API key to get started</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Create API Key
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usage</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Key</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {apiKeys.map((apiKey) => (
                        <tr key={apiKey.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                              apiKey.type === "dev" 
                                ? "bg-blue-50 text-blue-700 border border-blue-200" 
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}>
                              {apiKey.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{apiKey.usage.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <code className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                {showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                              </code>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleShowKey(apiKey.id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                                title={showKey[apiKey.id] ? "Hide" : "Show"}
                              >
                                <EyeIcon />
                              </button>
                              <button
                                onClick={() => copyToClipboard(apiKey.key)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                                title="Copy"
                              >
                                <CopyIcon />
                              </button>
                              <button
                                onClick={() => handleEdit(apiKey)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                                title="Edit"
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(apiKey)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                                title="Delete"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {editingKey ? "Edit API key" : "Create a new API key"}
              </h2>
              <p className="text-sm text-gray-500">
                {editingKey 
                  ? "Update the API key settings and configuration." 
                  : "Configure your new API key settings below."}
              </p>
            </div>

            <div className="space-y-6">
              {/* Key Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Key Name
                </label>
                <p className="text-xs text-gray-500 mb-2">A unique name to identify this key</p>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Production Key"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Key Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Key Type
                </label>
                <p className="text-xs text-gray-500 mb-3">{editingKey ? "Environment for this key" : "Choose the environment for this key"}</p>
                <div className="space-y-2.5">
                  <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.keyType === "dev" ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}>
                    <input
                      type="radio"
                      name="keyType"
                      value="dev"
                      checked={formData.keyType === "dev"}
                      onChange={(e) => setFormData({ ...formData, keyType: e.target.value as "dev" | "prod" })}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                          <path d="M8 6l-6 6 6 6" />
                          <path d="M16 6l6 6-6 6" />
                        </svg>
                        <span className="font-medium text-gray-900">Development</span>
                      </div>
                      <p className="text-sm text-gray-500">Rate limited to 100 requests/minute</p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.keyType === "prod" ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}>
                    <input
                      type="radio"
                      name="keyType"
                      value="prod"
                      checked={formData.keyType === "prod"}
                      onChange={(e) => setFormData({ ...formData, keyType: e.target.value as "dev" | "prod" })}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                          <path d="M4.5 16.5c-1.5 1.26-2 5.5 0 5.5s1.5-4.24 0-5.5z" />
                          <path d="M12 15l-3-3 22-6-22 6 3 3z" />
                          <path d="M12 15l3 3" />
                          <path d="M9 12l-3-3-4 1 4 1 3 3z" />
                        </svg>
                        <span className="font-medium text-gray-900">Production</span>
                      </div>
                      <p className="text-sm text-gray-500">Rate limited to 1,000 requests/minute</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Monthly Usage Limit */}
              <div>
                <label className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.limitMonthlyUsage}
                    onChange={(e) => setFormData({ ...formData, limitMonthlyUsage: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 block mb-1">Limit monthly usage</span>
                    <p className="text-xs text-gray-500">
                      If the combined usage of all your keys exceeds your account's allocated usage limit, all requests will be rejected.
                    </p>
                  </div>
                </label>
                {formData.limitMonthlyUsage && (
                  <div className="ml-7 mb-2">
                    <input
                      type="number"
                      value={formData.monthlyLimit}
                      onChange={(e) => setFormData({ ...formData, monthlyLimit: parseInt(e.target.value) || 1000 })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="1000"
                    />
                  </div>
                )}
              </div>

              {/* Enable PII Restrictions */}
              <div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.enablePII}
                    onChange={(e) => setFormData({ ...formData, enablePII: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 block mb-1">Enable PII Restrictions</span>
                    <p className="text-xs text-gray-500">
                      Configure how to handle Personal Identifiable Information (PII) in user queries
                    </p>
                  </div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={editingKey ? handleUpdate : handleCreate}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                >
                  {editingKey ? "Save Changes" : "Create Key"}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Delete API Key
              </h2>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the API key <span className="font-medium text-gray-900">"{deleteConfirm.name}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm shadow-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

