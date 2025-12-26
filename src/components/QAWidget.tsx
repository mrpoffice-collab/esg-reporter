"use client";

import { useState, useEffect } from "react";

/**
 * QA Widget - Embed this component in any app for manual testing
 *
 * Usage:
 * 1. Copy this file to your app's components folder
 * 2. Import and add <QAWidget appName="Your App Name" /> to your layout
 * 3. Set NEXT_PUBLIC_WHITEBOARD_URL in your .env (defaults to localhost:3000)
 *
 * Features:
 * - Floating panel that can be minimized
 * - Shows checklist from whiteboard or custom items
 * - Mark pass/fail for each item
 * - Add notes about bugs
 * - Syncs feedback to whiteboard database
 */

interface ChecklistItem {
  id: string;
  description: string;
  type?: string;
  passed: boolean | null;
  notes?: string;
}

interface QAWidgetProps {
  appName: string;
  appUrl?: string;
  whiteboardUrl?: string;
  /** Custom checklist if not fetching from whiteboard */
  checklist?: { description: string; type?: string }[];
  /** Position of the widget */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export function QAWidget({
  appName,
  appUrl,
  whiteboardUrl,
  checklist: customChecklist,
  position = "bottom-right",
}: QAWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const baseUrl = whiteboardUrl || process.env.NEXT_PUBLIC_WHITEBOARD_URL || "http://localhost:3000";

  useEffect(() => {
    if (customChecklist) {
      setItems(
        customChecklist.map((item, i) => ({
          id: `custom-${i}`,
          description: item.description,
          type: item.type || "manual",
          passed: null,
          notes: "",
        }))
      );
      setLoading(false);
      return;
    }

    // Fetch checklist from whiteboard
    async function fetchChecklist() {
      try {
        const params = new URLSearchParams({ app: appName });
        if (appUrl) params.set("url", appUrl);

        const res = await fetch(`${baseUrl}/api/qa?${params}`);
        const data = await res.json();

        if (data.checklist?.length > 0) {
          setItems(
            data.checklist.map((c: any) => ({
              id: c.id,
              description: c.description,
              type: c.type,
              passed: c.passed,
              notes: c.testResult || "",
            }))
          );
        } else {
          // Default checklist for new apps
          setItems([
            { id: "default-1", description: "Page loads without errors", type: "ui", passed: null },
            { id: "default-2", description: "Main functionality works", type: "function", passed: null },
            { id: "default-3", description: "Data persists after refresh", type: "function", passed: null },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch QA checklist:", error);
        setItems([
          { id: "error-1", description: "Could not connect to whiteboard", type: "error", passed: null },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchChecklist();
  }, [appName, appUrl, baseUrl, customChecklist]);

  const updateItem = async (id: string, passed: boolean, notes?: string) => {
    setSaving(id);

    // Update local state immediately
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, passed, notes: notes ?? item.notes } : item
      )
    );

    // Sync to whiteboard
    try {
      await fetch(`${baseUrl}/api/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName,
          appUrl: appUrl || window.location.origin,
          criterionId: id.startsWith("custom-") || id.startsWith("default-") ? null : id,
          passed,
          notes,
          pageName: window.location.pathname,
          checkDescription: items.find((i) => i.id === id)?.description,
        }),
      });
    } catch (error) {
      console.error("Failed to save QA feedback:", error);
    } finally {
      setSaving(null);
    }
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        description: newItem.trim(),
        type: "manual",
        passed: null,
      },
    ]);
    setNewItem("");
  };

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  const passedCount = items.filter((i) => i.passed === true).length;
  const failedCount = items.filter((i) => i.passed === false).length;
  const untestedCount = items.filter((i) => i.passed === null).length;

  return (
    <div className={`fixed ${positionClasses[position]} z-[9999]`}>
      {/* Minimized button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg shadow-lg hover:bg-amber-600 transition-colors font-medium text-sm"
        >
          <span>QA</span>
          {failedCount > 0 && (
            <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {failedCount}
            </span>
          )}
          {failedCount === 0 && passedCount > 0 && (
            <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {passedCount}/{items.length}
            </span>
          )}
        </button>
      )}

      {/* Expanded panel */}
      {isOpen && (
        <div className="w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">QA Checklist</div>
              <div className="text-xs text-amber-100">{appName}</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-amber-100 hover:text-white text-xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Stats bar */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex gap-4 text-xs">
            <span className="text-green-700">{passedCount} passed</span>
            <span className="text-red-700">{failedCount} failed</span>
            <span className="text-gray-600">{untestedCount} untested</span>
          </div>

          {/* Checklist */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-gray-600 text-sm">Loading checklist...</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex gap-1 mt-0.5">
                        <button
                          onClick={() => updateItem(item.id, true)}
                          disabled={saving === item.id}
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors ${
                            item.passed === true
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                          }`}
                          title="Pass"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => updateItem(item.id, false)}
                          disabled={saving === item.id}
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors ${
                            item.passed === false
                              ? "bg-red-600 text-white"
                              : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                          }`}
                          title="Fail"
                        >
                          ✗
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900">{item.description}</div>
                        {item.type && (
                          <div className="text-xs text-gray-500 mt-0.5">{item.type}</div>
                        )}
                      </div>
                    </div>
                    {item.passed === false && (
                      <input
                        type="text"
                        placeholder="What's broken?"
                        value={item.notes || ""}
                        onChange={(e) => {
                          const notes = e.target.value;
                          setItems((prev) =>
                            prev.map((i) => (i.id === item.id ? { ...i, notes } : i))
                          );
                        }}
                        onBlur={(e) => updateItem(item.id, false, e.target.value)}
                        className="mt-2 w-full text-xs px-2 py-1.5 border border-red-200 rounded bg-red-50 text-gray-900 placeholder-gray-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add item */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add check item..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                className="flex-1 text-sm px-2 py-1.5 border border-gray-300 rounded text-gray-900 placeholder-gray-500"
              />
              <button
                onClick={addItem}
                className="px-3 py-1.5 bg-amber-500 text-white text-sm rounded hover:bg-amber-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QAWidget;
