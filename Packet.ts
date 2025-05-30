import { Socket } from "net";

export class Packet {

    static readonly CHECK = 0xFE;
    static readonly DUMP = 0xFF;
    static readonly QUIT = 0x00;
    static readonly REQUEST_TO_JOIN = 0x01;
    static readonly TEXT = 0x02;

    command: number;
    data: any;

    constructor(public type: number, public d: any) {
        this.command = type;
        this.data = d;
    }

    checkConnection(destination: string, port: number): boolean{
        console.log("Checking connection to " + destination + ":" + port);
        const socket = new Socket();
        socket.connect(port, destination, () => {
            console.log('Connected to server');
            const buffer = new Uint8Array(2 + this.data.length);
            buffer[0] = Packet.CHECK;
            buffer[1] = this.data.length;
            for (let i = 0; i < this.data.length; i++) {
                buffer[2 + i] = this.data.charCodeAt(i);}    
            socket.write(buffer);
            socket.destroy();
            return true;
        });
        socket.on('error', (err) => {
            console.error('Connection error:', err);
            return false;
        });
    }

    send( destination: string, port: number) {
        console.log("Sending packet to " + destination + ":" + port);
        console.log("Command: " + this.command);
        console.log("Data length: " + this.data.length);
        console.log("Data string: " + this.data.toString());
        const socket = new Socket();
        socket.connect(port, destination, () => {
            console.log('Connected to server');
            const buffer = new Uint8Array(2 + this.data.length);
            buffer[0] = this.command;
            buffer[1] = this.data.length;
            for (let i = 0; i < this.data.length; i++) {
                buffer[2 + i] = this.data.charCodeAt(i);}    
            socket.write(buffer);
            socket.destroy();
        });
    }

}