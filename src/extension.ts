import * as vscode from 'vscode';
import fetch from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {
  console.log("✅ CodeLixer is activating...");

  // Command to manually trigger fix
  const commandDisposable = vscode.commands.registerCommand('extension.fixCode', () => {
    vscode.window.showInformationMessage('CodeLixer: Fix Code command triggered!');
  });
  context.subscriptions.push(commandDisposable);
  console.log("✅ CodeLixer command registered.");

  // Listen to typing in editor
  const typingDisposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || event.document !== editor.document) {
      return;
    }

    const lastChange = event.contentChanges[event.contentChanges.length - 1];
    if (!lastChange || lastChange.text.length > 20 || lastChange.text.trim() === '') {
      return;
    }

    const position = lastChange.range.start;
    const lineText = editor.document.lineAt(position.line).text;

    // Skip lines that are only variable names or identifiers
    const skipPatterns = [/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*$/];
    if (skipPatterns.some((pattern) => pattern.test(lineText.trim()))) {
      return;
    }

    const prompt = `Fix syntax and typo errors in this code line without adding extra code. Only return the corrected version:\n\n${lineText}`;

    try {
      const response = await fetch("https://codelixer-backend.onrender.com/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      const fixedLine: string = data.response?.trim();

      if (fixedLine && fixedLine !== lineText) {
        const edit = new vscode.WorkspaceEdit();
        const lineRange = editor.document.lineAt(position.line).range;
        edit.replace(editor.document.uri, lineRange, fixedLine);
        await vscode.workspace.applyEdit(edit);
      }
    } catch (error) {
      console.error("❌ CodeLixer backend error:", error);
    }
  });

  context.subscriptions.push(typingDisposable);
  console.log("✅ CodeLixer activated successfully.");
}

export function deactivate() {
  console.log("🛑 CodeLixer deactivated.");
}
