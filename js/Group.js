class Group {

    constructor (name, key) {
        this.name = name;
        this.key = key;
        this.children = [];
    }

    add_child (child) {
        this.children.push(child);
    }

    get_last_child () {
        return this.children[this.children.length-1];
    }

    add_parent (parent) {
        this.parent = parent;
    }

}