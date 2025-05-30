import { App, DropdownComponent, Editor, FileSystemAdapter, ItemView, MarkdownFileInfo, MarkdownRenderer, MarkdownView, Menu, MenuItem, Modal, Notice, Platform, Setting, TFile, TFolder, TextFileView, WorkspaceLeaf } from "obsidian";

import { Command } from "Command";
import net from "net";

export class Server {

    className: string;
    shaper: string;

    classServer: net.server;
    classSocket: net.socket;

    constructor(name: string, shapr: string) {

        this.className = name;
        this.shaper = shapr;
    }

    async start() {

        console.log("Server class starting for "+this.className+".");

        this.classServer = net.createServer((socket: net.socket) => {
            console.log("Connection from", socket.remoteAddress, "port", socket.remotePort);
            this.classSocket = socket;

            socket.on("data", (buffer: Buffer) => {
                console.log("Request from", socket.remoteAddress, "port", socket.remotePort);
                const command = new Command(buffer, socket.remoteAddress);
                //const command = buffer.toString("utf-8").trim()
                console.log("Received: "+command.toString());

                if (command.getCommand() === Command.REQUEST_TO_JOIN) {
                    console.log("Request to join from", socket.remoteAddress, "port", socket.remotePort);

                } else if (command.getCommand() === Command.TEXT) {
                    console.log("Text from", socket.remoteAddress, "port", socket.remotePort);
                    console.log("Text: "+command.getData());
                    socket.write(`${buffer.toString("utf-8").toUpperCase()}\n`);
                    
                } else if (command.getCommand() === Command.QUIT) {
                    console.log("Quit from", socket.remoteAddress, "port", socket.remotePort);
                }
            })

            socket.on("end", () => {
                console.log("Closed", socket.remoteAddress, "port", socket.remotePort);
            })
        })

        this.classServer.maxConnections = 20;
        this.classServer.listen(59898);
        
        this.run();

    }

    run() {

    }

    stop() {
        if (this.classSocket !== undefined) {
            this.classSocket.destroy();
        }
    }

}