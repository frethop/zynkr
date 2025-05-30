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
	callback(ip: string) {}
	text: string;
	ip: string;
	possible: number;
	catname: string;
	scores: Map<string, number>;
	fields: TextComponent[];
	possibleField: Setting;
	ec: boolean;
	enterhandler: KeymapEventHandler;
	field: number;

	constructor(app: App, callback: (ip) => void) {
		super(app);
		this.callback = callback;
		this.scores = new Map<string, number>();
		this.possible = 0;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "Client Mode" });

		new Setting(contentEl).setName("Destination address").addText((text) =>
			text.setValue("").onChange((value) => {
				this.ip = value;
			})
		);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("OK")
				.setCta()
				.onClick(() => {
					this.close();
					this.callback(this.ip);
				})
		);
	}

	onClose() {
		this.scope.unregister(this.enterhandler);
	}
}
