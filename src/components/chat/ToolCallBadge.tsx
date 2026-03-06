"use client";

import { Loader2, FilePlus, FilePen, Eye, Trash2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
}

function basename(path: string): string {
  return path.split("/").pop() ?? path;
}

function getLabel(toolName: string, args: Record<string, unknown>, state: "call" | "partial-call" | "result"): string {
  const isLoading = state !== "result";

  if (toolName === "str_replace_editor") {
    const command = args?.command as string | undefined;
    const file = args?.path ? basename(args.path as string) : undefined;

    if (!command || !file) return toolName;

    switch (command) {
      case "create":
        return isLoading ? `Creating ${file}` : `Created ${file}`;
      case "str_replace":
      case "insert":
        return isLoading ? `Editing ${file}` : `Edited ${file}`;
      case "view":
        return isLoading ? `Viewing ${file}` : `Viewed ${file}`;
      default:
        return toolName;
    }
  }

  if (toolName === "file_manager") {
    const command = args?.command as string | undefined;
    const file = args?.path ? basename(args.path as string) : undefined;

    if (!command || !file) return toolName;

    switch (command) {
      case "rename": {
        const newFile = args?.new_path ? basename(args.new_path as string) : undefined;
        return newFile ? `Renamed ${file} → ${newFile}` : toolName;
      }
      case "delete":
        return isLoading ? `Deleting ${file}` : `Deleted ${file}`;
      default:
        return toolName;
    }
  }

  return toolName;
}

function getIcon(toolName: string, args: Record<string, unknown>, state: "call" | "partial-call" | "result") {
  if (state !== "result") {
    return <Loader2 className="w-3 h-3 animate-spin text-blue-600" />;
  }

  const command = args?.command as string | undefined;

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return <FilePlus className="w-3 h-3 text-emerald-500" />;
      case "str_replace":
      case "insert":
        return <FilePen className="w-3 h-3 text-blue-500" />;
      case "view":
        return <Eye className="w-3 h-3 text-neutral-500" />;
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "delete":
        return <Trash2 className="w-3 h-3 text-red-500" />;
      case "rename":
        return <FilePen className="w-3 h-3 text-blue-500" />;
    }
  }

  return <div className="w-2 h-2 rounded-full bg-emerald-500" />;
}

export function ToolCallBadge({ toolName, args, state }: ToolCallBadgeProps) {
  const label = getLabel(toolName, args, state);
  const icon = getIcon(toolName, args, state);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {icon}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
