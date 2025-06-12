import {
	App,
	DropdownComponent,
	KeymapEventHandler,
	Modal,
	Setting,
	TFile,
	TextComponent,
	TextFileView,
	WorkspaceLeaf,
} from "obsidian";

export class SetupModel extends Modal {
	callback(emailaddress: string, ip: string) {}
	text: string;
	ip: string;
	emailaddress: string;
	possible: number;
	catname: string;
	scores: Map<string, number>;
	fields: TextComponent[];
	possibleField: Setting;
	ec: boolean;
	enterhandler: KeymapEventHandler;
	field: number;

	constructor(app: App, userName: string, IPAddress: string, callback: (un, ip) => void) {
		super(app);
		this.emailaddress = userName;
		this.ip = IPAddress;
		this.callback = callback;
		this.scores = new Map<string, number>();
		this.possible = 0;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "Interactive Notes: Client Mode" });

		new Setting(contentEl).setName("Your email address").addText((text) =>
			text.setValue(this.emailaddress).onChange((value) => {
				this.emailaddress = value;
			})
		);

		new Setting(contentEl).setName("Destination address").addText((text) =>
			text.setValue(this.ip).onChange((value) => {
				this.ip = value;
			})
		);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("OK")
				.setCta()
				.onClick(() => {
					this.close();
					this.callback(this.emailaddress, this.ip);
				})
		);
	}

	onClose() {
		this.scope.unregister(this.enterhandler);
	}
}
