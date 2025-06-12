import { Acknowledgement } from "./Acknowledgement";
import { Socket } from "net";

export class Packet {

    static readonly CHECK = 0xFE;
    static readonly DUMP = 0xFF;
    static readonly QUIT = 0x00;
    static readonly REQUEST_TO_JOIN = 0x01;
    static readonly TEXT = 0x02;
    static readonly CONTENT = 0x03;

    command: number;
    data: any;
    error: number;

    constructor(public type: number, public d: any) {
        this.command = type;
        this.data = d;
        this.error = 0;
    }

    send( destination: string, port: number) {
        console.log("Sending packet to " + destination + ":" + port);
        console.log("Command: " + this.command);
        console.log("Data length: " + this.data.length);
        console.log("Data string: " + this.data.toString());
                    
        let socket = new Socket();

        let ack = Acknowledgement.ERROR;
        socket.connect(port, destination,  () => {
            console.log('Connected to server, sending packet...');
            const buffer = new Uint8Array(2 + this.data.length);
            buffer[0] = this.command;
            buffer[1] = this.data.length;
            for (let i = 0; i < this.data.length; i++) {
                buffer[2 + i] = this.data.charCodeAt(i);
            } 
            socket.write(buffer);
            console.log("Packet sent, waiting for acknowledgement...");
        })

        socket.on('data', (data: Buffer) => {
            ack = data[0]; 
            if (ack == Acknowledgement.OK) {
                console.log("Acknowledgement received successfully.");
                this.error = Acknowledgement.OK;
            } else {
                console.log("Failed to receive acknowledgement.");
                this.error = Acknowledgement.ERROR;
            }

            socket.destroy();
        });

    }

}