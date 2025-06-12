import { net } from "net";

export class Acknowledgement {

    static readonly ERROR = 0xFF;
    static readonly OK = 0x00;
    static readonly NOT_AUTHORIZED_FOR_TEXT = 0x01;
    static readonly NOT_AUTHORIZED_TO_JOIN = 0x02;

    errno: number = 0;

    constructor() {
        console.log("Acknowledgement class created.");
    }

    static send(socket: net.Socket, ack: number) {
        const buffer = Buffer.alloc(1);
        buffer[0] = Acknowledgement.OK;
        socket.write(buffer);
        console.log("Acknowledgement sent.");
    }

    static receive(socket: net.Socket): number { 
        // socket.on('data', (data: Buffer) => {
        //     console.log("Acknowledgement received = " + data[0]);
        //     return data[0];
        // });
        // socket.on('error', (err) => {
        //     console.error("Error receiving acknowledgement: ", err);
        //     return Acknowledgement.ERROR;
        // });

    //     return new Promise((resolve, reject) => {
    //         socket.on('data', (data: Buffer) => {
    //             console.log("Acknowledgement received = " + data[0]);
    //             resolve(data[0]);
    //         });
    //         socket.on('error', (err) => {
    //             console.error("Error receiving acknowledgement: ", err);
    //             resolve(Acknowledgement.ERROR);
    //         });
    //     });

    return 0;

        }   
     
}
