export default class ClassList {
    classes: any;

    constructor() {
        this.classes = Array<any>(0);
    }

    toString() : string {
        return this.classes.join(' ');
    }

    fromString(n: string) {
        this.classes = n.split(' ');
    }

    contains(n: string) : boolean {
        return this.classes.includes(n);
    }

    add(n: string) : void {
        if(!this.contains(n)) this.classes.push(n);
    }

    remove(n: string) : void {
        const idx = this.classes.indexOf(n);
        if(idx > -1) this.classes.splice(idx,1);
    }

    forEach(fn: any) {
        return this.classes.forEach(fn);
    }

    clone() : Array<any> {
        const list = Array<any>(0);

        this.classes.forEach(c => list.push(c));

        return list;
    }
}