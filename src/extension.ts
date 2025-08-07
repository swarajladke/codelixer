// src/extension.ts

import * as vscode from 'vscode';
import fetch from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {
  console.log("✅ CodeLixer is activating...");

  // Manual command (optional, but nice)
  const commandDisposable = vscode.commands.registerCommand('extension.fixCode', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const line = editor.selection.active.line;
    const fullLine = editor.document.lineAt(line).text;
    const fixed = await fixCode(fullLine);

    if (fixed && fixed !== fullLine) {
      const edit = new vscode.WorkspaceEdit();
      const range = editor.document.lineAt(line).range;
      edit.replace(editor.document.uri, range, fixed);
      await vscode.workspace.applyEdit(edit);
    }
  });

  context.subscriptions.push(commandDisposable);

  // Debounced automatic fix
  let timeout: NodeJS.Timeout | null = null;
  let lastFixedLine = "";

  const disposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || event.document !== editor.document) return;

    const lastChange = event.contentChanges[event.contentChanges.length - 1];
    if (!lastChange || lastChange.text.trim() === "") return;

    const lineNum = lastChange.range.start.line;
    const fullLine = editor.document.lineAt(lineNum).text;

    // Cancel previous timeout
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(async () => {
      if (!shouldFix(fullLine, lastFixedLine)) return;

      const fixed = await fixCode(fullLine);

      if (fixed && fixed !== fullLine) {
        const edit = new vscode.WorkspaceEdit();
        const range = editor.document.lineAt(lineNum).range;
        edit.replace(editor.document.uri, range, fixed);
        await vscode.workspace.applyEdit(edit);
        lastFixedLine = fixed; // prevent re-fixing same line
      }
    }, 600); // Wait 600ms after last keystroke
  });

  context.subscriptions.push(disposable);
  console.log("✅ CodeLixer activated successfully.");
}

export function deactivate() {
  console.log("🛑 CodeLixer deactivated.");
}

async function fixCode(fullLine: string): Promise<string> {
  const prompt = `Correct this line of Python code. Only return the corrected line:\n\n${fullLine}`;
  try {
    const response = await fetch("https://codelixer-backend.onrender.com/fix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    return data.response?.trim() || "";
  } catch (err) {
    console.error("❌ Fixer API Error:", err);
    return "";
  }
}

function shouldFix(newLine: string, lastLine: string): boolean {
  // Ignore numbers, variable names, or known keywords
  if (
    newLine.trim() === "" ||
    newLine === lastLine ||
    newLine.length < 3 ||
    /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newLine.trim())
  ) {
    return false;
  }
  return true;
}
