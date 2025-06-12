import { MarkdownView } from 'obsidian';
import os from 'os';

export default class Utilities {

    static getIPAddress(): string {

        const interfaces = os.networkInterfaces();

        for (const name of Object.keys(interfaces)) {
            for (const net of interfaces[name]) {
                if (net.family === 'IPv4' && !net.internal) {
                return net.address;
                }
            }
        }
        return "";
    }

    static insertText(view: MarkdownView, text: string) {
        if (view) {
            view.editor.replaceRange(text, view.editor.getCursor());
            view.editor.setCursor(view.editor.getCursor().line + 1, 0);
        } else {
            console.error("No active Markdown view found.");
        }
    }
}