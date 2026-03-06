import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

test("str_replace_editor create call state shows Creating", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "src/App.jsx" }} state="call" />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  expect(document.querySelector(".animate-spin")).toBeDefined();
});

test("str_replace_editor create result state shows Created", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "src/App.jsx" }} state="result" />);
  expect(screen.getByText("Created App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace call state shows Editing", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "str_replace", path: "src/Card.tsx" }} state="call" />);
  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
});

test("str_replace_editor str_replace result state shows Edited", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "str_replace", path: "src/Card.tsx" }} state="result" />);
  expect(screen.getByText("Edited Card.tsx")).toBeDefined();
});

test("str_replace_editor insert result state shows Edited", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "insert", path: "src/utils.ts" }} state="result" />);
  expect(screen.getByText("Edited utils.ts")).toBeDefined();
});

test("str_replace_editor view result state shows Viewed", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "view", path: "src/index.ts" }} state="result" />);
  expect(screen.getByText("Viewed index.ts")).toBeDefined();
});

test("file_manager rename result state shows Renamed", () => {
  render(<ToolCallBadge toolName="file_manager" args={{ command: "rename", path: "src/old.tsx", new_path: "src/new.tsx" }} state="result" />);
  expect(screen.getByText("Renamed old.tsx → new.tsx")).toBeDefined();
});

test("file_manager delete call state shows Deleting", () => {
  render(<ToolCallBadge toolName="file_manager" args={{ command: "delete", path: "src/helper.ts" }} state="call" />);
  expect(screen.getByText("Deleting helper.ts")).toBeDefined();
});

test("file_manager delete result state shows Deleted", () => {
  render(<ToolCallBadge toolName="file_manager" args={{ command: "delete", path: "src/helper.ts" }} state="result" />);
  expect(screen.getByText("Deleted helper.ts")).toBeDefined();
});

test("unknown tool shows raw tool name", () => {
  render(<ToolCallBadge toolName="some_other_tool" args={{}} state="result" />);
  expect(screen.getByText("some_other_tool")).toBeDefined();
});

test("partial-call with empty args renders without crashing and shows tool name fallback", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{}} state="partial-call" />);
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("extracts only filename from deep path", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "src/components/Button.tsx" }} state="result" />);
  expect(screen.getByText("Created Button.tsx")).toBeDefined();
});
