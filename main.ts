import { App, Editor, MarkdownPostProcessorContext, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

import { Command } from "Command";
import { Packet } from "Packet";
import { SetupModel } from "modals/SetupModel";
import { Socket } from "net";

// Remember to rename these classes and interfaces!

interface ClassroomClientSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: ClassroomClientSettings = {
	mySetting: 'default'
}

const version = "Classroom Client version 0.0.1 (05212025)";

export default class ClassroomClient extends Plugin {
	settings: ClassroomClientSettings;
	keystring = "";
	serverIPAddress = "";
	
	//socket = new Socket();

	async onload() {
		await this.loadSettings();

		console.log(version + " loaded.");


		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('monitor-check', 'Classroom Client Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new SetupModel(this.app,  (IPAddress: string) => {
				console.log("Client: got " + IPAddress);
				this.serverIPAddress = IPAddress;
				//this.socket = new net.Socket();
				const packet = new Packet(Packet.REQUEST_TO_JOIN, "username");
				packet.send(IPAddress, 59898);
				this.keystring = "";
				this.registerDomEvent(window, 'keydown', this.handleKeys);

			}).open();
	
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-classroom-server-class');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000))
			
	}
	
	onunload() {
		
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async handleKeys(kbe: KeyboardEvent) {
		console.log("Key pressed: " + kbe.key);
		if (this.serverIPAddress != "" ) {
			if (kbe.code == "Enter") {
				const packet = new Packet(Packet.TEXT, this.keystring==undefined ? " " : this.keystring);
				packet.send(this.serverIPAddress, 59898);
				this.keystring = "";
			} else if (kbe.code != "ShiftLeft" && kbe.code != "ShiftRight" && kbe.code != "Backspace" && kbe.code != "CapsLock") {
				this.keystring += kbe.key;
			}
		}
	}

}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: ClassroomServer;

	constructor(app: App, plugin: ClassroomServer) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
