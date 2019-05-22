var nodeDataArray = [];
var linkDataArray = [];
var root = new Group("root", 0);

function create_json_tree (json, fn, noc) {

    var i = 0;
    var key = 4;
    var current_parent = root;

    while (i < json.length) {

        // '{' ignore
        if (json.substr(i, 1) == "{") {
            // do nothing
        }

        // '}' changes current parent to current parent's parent
        if (json.substr(i, 1) == "}") {
            current_parent = current_parent.parent;
        }

        // '"#"' defines a new group
        if (json.substr(i, 1) == '"') {
            var j = json.indexOf('"', i+1);
            var group = new Group(fn + '(' + json.slice(i+1, j) + ')', key);
            group.add_parent(current_parent);
            current_parent.add_child(group);
            key = key + noc + 1;
            i = j;
        } 

        // ':' changes current parent to current parent's last child 
        if (json.substr(i, 1) == ":") {
            current_parent = current_parent.get_last_child();
        }

        // ',' ignore
        if (json.substr(i, 1) == ",") {
            // do nothing
        }

        i++;
    }
    
}

function pre_order_traverse(group, n) {

    // adding group template 
    grouptemplate = '{"key":'+ group.key +', "text":"'+ group.name +'", "color": "purple", "isGroup": true}';
    nodeDataArray.push(JSON.parse(grouptemplate));
    
    // adding node templates
    if (group.children.length > 0) {
        for (var a = 0; a < n; a++) {
            nodetemplate = '{"key":'+ (group.key + a + 1) +', "text": "", "color": "black", "group":'+ group.key +'}';
            nodeDataArray.push(JSON.parse(nodetemplate));
        }
    } else {
        nodetemplate = '{"key":'+ (group.key + 1) +', "text": "", "color": "black", "group":'+ group.key +'}';
        nodeDataArray.push(JSON.parse(nodetemplate));
    }
    
    // adding link templates
    if (group.children.length > 0) {
        linktemplate = '{ "from":'+ (group.key + 1) +', "to":'+ (group.key + 2) +'}';
        linkDataArray.push(JSON.parse(linktemplate));
        for (var b = 0; b < group.children.length; b++) {
            linktemplate = '{ "from":'+ (group.key + b + 1) +', "to":'+ (group.children[b].key + 1) +'}';
            linkDataArray.push(JSON.parse(linktemplate));
        }
        linktemplate = '{ "from":'+ (group.key + n) +', "to":'+ (group.parent.key + n) +'}';
        linkDataArray.push(JSON.parse(linktemplate));  
    } else {
        linktemplate = '{ "from":'+ (group.key + 1) +', "to":'+ (group.parent.key + n) +'}';
        linkDataArray.push(JSON.parse(linktemplate));
    }
    
    // traverse children
    for (var c = 0; c < group.children.length; c++) {
        pre_order_traverse(group.children[c], n);
    }
    
}

function json_read(json, fn, n) {
    create_json_tree(json, fn, n);
    pre_order_traverse(root.children[0], n);
}