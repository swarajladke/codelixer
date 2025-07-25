// src/extension.ts
import * as dotenv from 'dotenv';
dotenv.config();
import * as vscode from 'vscode';
import OpenAI from 'openai';



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export function activate(context: vscode.ExtensionContext) {
  console.log("🔥 CodeLixer activated");

  // Register the command manually to allow testing
  let commandDisposable = vscode.commands.registerCommand('codelixer.correct', () => {
    vscode.window.showInformationMessage('CodeLixer is working!');
    console.log("🚀 Codelixer command executed");
  });
  context.subscriptions.push(commandDisposable);

  // Listen for changes in the editor
  const changeDisposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || event.document !== editor.document){ 
      return;
    }

    const lastChange = event.contentChanges[event.contentChanges.length - 1];
    if (!lastChange || lastChange.text.length > 10 || lastChange.text.trim() === '') {
      return;
    }

    const fullLine = editor.document.lineAt(lastChange.range.start.line).text;
    const prompt = `Fix typos and syntax errors in this code. Return only the corrected code:\n\n${fullLine}`;

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
        console.log("🔧 Line autocorrected by CodeLixer");
      }
    } catch (error) {
      console.error('❌ OpenAI correction error:', error);
    }
  });

  context.subscriptions.push(changeDisposable);
}

export function deactivate() {
  console.log("🛑 CodeLixer deactivated");
}

console.log("Loaded Key: ", process.env.OPENAI_API_KEY);
