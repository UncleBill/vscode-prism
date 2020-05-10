// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from 'vscode';
import { calculatePath } from './utils';
import { TextDecoder, TextEncoder } from "util";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "prism" is now active!');
	if (!vscode.workspace.workspaceFolders) {
		console.log('no workspaceFolders, end');
		return;
	}
	const themeExtentions = vscode.extensions.all.filter(ext => {
		return ext.packageJSON.contributes && ext.packageJSON.contributes.themes;
	});
	const colorThemes = themeExtentions.reduce((acc: Array<string>, ext: any) => {
		const themes: Array<Object> = ext.packageJSON.contributes.themes;
		const labels: Array<string> = themes.map((theme: any) => theme.label);
		acc.push(...labels);
		return acc;
	}, []);
	console.log('colorthems', colorThemes.join('\n'));
	vscode.workspace.workspaceFolders.forEach(async folder => {
		const settingsJsonFile = path.resolve(folder.uri.fsPath, ".vscode/settings.json");
		const settingsJsonUri = vscode.Uri.parse(settingsJsonFile);
		const enc = new TextEncoder();
		const colorTheme = path2theme(folder.uri.fsPath, colorThemes);
		try {
			const dec = new TextDecoder();
			const settingsJson = await vscode.workspace.fs.readFile(settingsJsonUri);
			const settings = JSON.parse(dec.decode(settingsJson));
			if (!settings['workbench.colorTheme'] || !(settings['workbench.colorTheme'] in colorThemes)) {
				settings['workbench.colorTheme'] = colorTheme;
				vscode.workspace.fs.writeFile(settingsJsonUri, enc.encode(JSON.stringify(settings, null, 2)));
			}
		} catch (err) {
			if (err.name.startsWith('EntryNotFound')) {
				const json = JSON.stringify({
					"workbench.colorTheme": colorTheme
				}, null, 2);
				vscode.workspace.fs.writeFile(settingsJsonUri, enc.encode(json));
			}
		}
	});
}

function path2theme (fspath: string, themes: Array<string>) : string{
	const count = themes.length;
	const sum = calculatePath(fspath);
	const idx = sum % count;
	return themes[idx];
}

// this method is called when your extension is deactivated
export function deactivate() {}
