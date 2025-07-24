// src/extension.ts

import * as vscode from 'vscode';
import fetch from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {
  console.log("✅ CodeLixer is activating...");

  const commandDisposable = vscode.commands.registerCommand('extension.fixCode', () => {
  vscode.window.showInformationMessage('CodeLixer: Fix Code command triggered!');
});

context.subscriptions.push(commandDisposable);
  console.log("✅ CodeLixer command registered.");

  const disposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || event.document !== editor.document) {
      return;
    }

    const lastChange = event.contentChanges[event.contentChanges.length - 1];
    if (!lastChange || lastChange.text.length > 20 || lastChange.text === ' ') {
      return;
    }

    const fullLine = editor.document.lineAt(lastChange.range.start.line).text;
    const prompt = `Correct this programming code for typos and syntax errors. Return only the corrected line:\n\n${fullLine}`;

    try {
      const response = await fetch("https://codelixer-backend.onrender.com/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      const fixedLine = data.response?.trim(); // ✅ using .response here to match backend

      if (fixedLine && fixedLine !== fullLine) {
        const edit = new vscode.WorkspaceEdit();
        const lineRange = editor.document.lineAt(lastChange.range.start.line).range;
        edit.replace(editor.document.uri, lineRange, fixedLine);
        await vscode.workspace.applyEdit(edit);
      }
    } catch (error) {
      console.error("❌ Error calling backend:", error);
    }
  });

  context.subscriptions.push(disposable);
  console.log("✅ CodeLixer activated successfully.");
}

export function deactivate() {
  console.log("🛑 CodeLixer deactivated.");
}
