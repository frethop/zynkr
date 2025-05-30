import { Shaper } from "./Shaper";

export class Colorify extends Shaper{

    shapeThis(data: string) {
        console.log("Coloring data: "+data);
        return data;
    }
}