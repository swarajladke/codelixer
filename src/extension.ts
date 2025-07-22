// src/extension.ts
import * as vscode from 'vscode';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey:' process.env.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'});

export function activate(context: vscode.ExtensionContext) {
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
    const prompt = `Correct this programming code for typos and syntax errors, return corrected version only:\n\n${fullLine}`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      const fixedLine = res.choices[0].message.content?.trim();

      if (fixedLine && fixedLine !== fullLine) {
        const edit = new vscode.WorkspaceEdit();
        const lineRange = editor.document.lineAt(lastChange.range.start.line).range;
        edit.replace(editor.document.uri, lineRange, fixedLine);
        await vscode.workspace.applyEdit(edit);
      }
    } catch (error) {
      console.error('OpenAI correction error:', error);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
