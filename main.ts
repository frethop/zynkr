import { App, Editor, MarkdownPostProcessorContext, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, setIcon } from 'obsidian';

import { Acknowledgement } from "Acknowledgement";
import { Command } from "Command";
import { Packet } from "Packet";
import { SetupModel } from "modals/SetupModel";
import { Socket } from "net";
import Utilities from "Utilities";

// Remember to rename these classes and interfaces!

interface ClassroomClientSettings {
	userName: string;
	IPAddress: string;
}

const DEFAULT_SETTINGS: ClassroomClientSettings = {
	userName: "jipping@hope.edu",
	IPAddress: "10.140.9.140"
}

const version = "Classroom Client version 0.0.2 (06042025)";

export default class ClassroomClient extends Plugin {
	settings: ClassroomClientSettings;
	keystring = "";
	serverIPAddress = "";
	interacting = true;
	
	//socket = new Socket();

	async onload() {
		await this.loadSettings();

		console.log(version + " loaded.");

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('monitor-check', 'Classroom Client Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			console.log("username = " + this.settings.userName);
			console.log("IP address = " + this.settings.IPAddress);
			new SetupModel(this.app,  this.settings.userName, this.settings.IPAddress,   (userName: string, IPAddress: string) => {
				console.log("Client: got " + IPAddress);
				this.serverIPAddress = this.settings.IPAddress = IPAddress;
				this.settings.userName = userName;
				this.interacting = true;

				// Register with server
				const packet = new Packet(Packet.CHECK, "checking connection");
				packet.send(IPAddress, 59898);
				const sent = packet.error;
				console.log("Client: sent? = " + sent);
				if (sent == Acknowledgement.OK) {
					this.saveSettings();
					const packet = new Packet(Packet.REQUEST_TO_JOIN, userName);
					packet.send(IPAddress, 59898);

					if (packet.error == Acknowledgement.OK) {
						this.interacting = true;
						console.log("Client: successfully registered with server at " + IPAddress);
						console.log("interacting = " + this.interacting);
	
						// Set up this note for collecting keystrokes.  Set up status bar notification.
						this.keystring = "";
						this.registerDomEvent(window, 'keydown', this.handleKeys);
						const statusBarItemEl = this.addStatusBarItem();
						const iconName = this.interacting ? 'monitor-check' : 'monitor-off';
						setIcon(statusBarItemEl, iconName);
						statusBarItemEl.setAttr("Interactive", "This note is interactive");
						statusBarItemEl.addEventListener("click", () => {
							this.interacting = !this.interacting;
							const iconName = this.interacting ? 'monitor-check' : 'monitor-off';
							setIcon(statusBarItemEl, iconName);
							console.log("interacting: " + this.interacting);
						});
					} else {
						new Notice("Could not connect to server at " + IPAddress);
						console.log("Could not connect to server at " + IPAddress);
					}
				} else {
					new Notice("Could not connect to server at " + IPAddress);
					console.log("Could not connect to server at " + IPAddress);
				}
			}).open();
	
		});
	
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-classroom-server-class');
		
		this.addCommand({
			id: 'Client Status Dump',
			name: 'Status Dump',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				let text = "";
				if (this.serverIPAddress == "") {
					text += "No server IP address set.\n";
				} else {
					text += "**Connected to server.**\nServer IP address: " + this.serverIPAddress + "\n";
				}
				Utilities.insertText(view, text);
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
		// if (!this.interacting) {
		// 	console.log("Not interacting, ignoring key press.");
		// 	return;	
		// }

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
			.setName('Setting #1 (061225)')
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
