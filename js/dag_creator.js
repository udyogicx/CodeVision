// dag_create() function draws the dag using nodeDataArray and linkDataArray created by json_reader

function dag_create() {
  
    // init for these samples -- you don't need to call this
    // if (window.goSamples) goSamples();  
    // for conciseness in defining templates
    var $ = go.GraphObject.make;  

    if (typeof myDiagram !== 'undefined') {
      myDiagram.div = null;
      myDiagram = null;
    }

    myDiagram =
        // create a Diagram for the DIV HTML element
        $(go.Diagram, "myDiagramDiv",  
            {
                "layout": $(go.LayeredDigraphLayout, 
                    {
                        direction: 90, 
                        layerSpacing: 10,
                        setsPortSpots: false
                    }
                )
            }
        );

    // Define the appearance and behavior for Nodes:
    // First, define the shared context menu for all Nodes, Links, and Groups.
    // To simplify this code we define a function for creating a context menu button:
    function makeButton(text, action, visiblePredicate) {
        return $("ContextMenuButton", $(go.TextBlock, text), { click: action },
            // don't bother with binding GraphObject.visible if there's no predicate
            visiblePredicate ? new go.Binding("visible", "", function(o, e) { return o.diagram ? visiblePredicate(o, e) : false; }).ofObject() : {});
    }

    // a context menu is an Adornment with a bunch of buttons in them
    var partContextMenu =
        $("ContextMenu",
            makeButton("Properties",
                function(e, obj) {  // OBJ is this Button
                    var contextmenu = obj.part;  // the Button is in the context menu Adornment
                    var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
                    // now can do something with PART, or with its data, or with the Adornment (the context menu)
                    if (part instanceof go.Link) alert(linkInfo(part.data));
                    else if (part instanceof go.Group) alert(groupInfo(contextmenu));
                    else alert(nodeInfo(part.data));
                }
            ),
            makeButton("Cut",
                function(e, obj) { e.diagram.commandHandler.cutSelection(); },
                function(o) { return o.diagram.commandHandler.canCutSelection(); }),
            makeButton("Copy",
                function(e, obj) { e.diagram.commandHandler.copySelection(); },
                function(o) { return o.diagram.commandHandler.canCopySelection(); }),
            makeButton("Paste",
                function(e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); },
                function(o) { return o.diagram.commandHandler.canPasteSelection(); }),
            makeButton("Delete",
                function(e, obj) { e.diagram.commandHandler.deleteSelection(); },
                function(o) { return o.diagram.commandHandler.canDeleteSelection(); }),
            makeButton("Undo",
                function(e, obj) { e.diagram.commandHandler.undo(); },
                function(o) { return o.diagram.commandHandler.canUndo(); }),
            makeButton("Redo",
                function(e, obj) { e.diagram.commandHandler.redo(); },
                function(o) { return o.diagram.commandHandler.canRedo(); }),
            makeButton("Group",
                function(e, obj) { e.diagram.commandHandler.groupSelection(); },
                function(o) { return o.diagram.commandHandler.canGroupSelection(); }),
            makeButton("Ungroup",
                function(e, obj) { e.diagram.commandHandler.ungroupSelection(); },
                function(o) { return o.diagram.commandHandler.canUngroupSelection(); })
        );

    // Tooltip info for a node data object
    function nodeInfo(d) {  
        var str = "Node " + d.key + ": " + d.text + "\n";
        if (d.group)
            str += "member of " + d.group;
        else
            str += "top-level node";
        return str;
    }

    // Tooltip info for a link data object
    function linkInfo(d) {  
        return "Link:\nfrom " + d.from + " to " + d.to;
    }

    // takes the tooltip or context menu, not a group node data object
    function groupInfo(adornment) {  
        var g = adornment.adornedPart;  // get the Group that the tooltip adorns
        var mems = g.memberParts.count;
        var links = 0;
        g.memberParts.each(function(part) {
            if (part instanceof go.Link) links++;
        });
        return "Group " + g.data.key + ": " + g.data.text + "\n" + mems + " members including " + links + " links";
    }

    // Tooltip info for the diagram's model
    function diagramInfo(model) {  
        return "Model:\n" + model.nodeDataArray.length + " nodes, " + model.linkDataArray.length + " links";
    }

    // These nodes have text surrounded by a rounded rectangle
    // whose fill color is bound to the node data.
    // The user can drag a node by dragging its TextBlock label.
    // Dragging from the Shape will start drawing a new link.
    myDiagram.nodeTemplate =
        $(go.Node, "Auto",
            {locationSpot: go.Spot.Center},
            $(go.Shape, "Circle",
                {
                    fill: "white", // the default fill, if there is no data bound value
                    portId: "", 
                    cursor: "pointer",  // the Shape is the port, not the whole Node
                    fromLinkable: true, // allow all kinds of links from and to this port
                    fromLinkableSelfNode: true, 
                    fromLinkableDuplicates: true,
                    toLinkable: true, 
                    toLinkableSelfNode: true, 
                    toLinkableDuplicates: true
                },
                new go.Binding("fill", "color")
            ),
            $(go.TextBlock,
                {
                    font: "bold 14px sans-serif",
                    stroke: '#333',
                    margin: 6,  // make some extra space for the shape around the text
                    isMultiline: false,  // don't allow newlines in text
                    editable: false  // allow in-place editing by user
                },
                new go.Binding("text", "text").makeTwoWay()
            )
        );

    // Define the appearance and behavior for Links:
    // The link shape and arrowhead have their stroke brush data bound to the "color" property
    myDiagram.linkTemplate =
        $(go.Link,
            { 
                toShortLength: 3,
            },  
            $(go.Shape,
                { 
                    strokeWidth: 2 
                },
                new go.Binding("stroke", "color")
            ),
            $(go.Shape,
                { 
                    toArrow: "Standard", 
                    stroke: null 
                },
            new go.Binding("fill", "color"))
        );

    // Define the appearance and behavior for Groups:
    // Groups consist of a title in the color given by the group node data
    // above a translucent gray rectangle surrounding the member parts
    myDiagram.groupTemplate =
        $(go.Group, go.Panel.Vertical, 
            {
                layout: $(go.GridLayout, {wrappingColumn: 3}),
                selectionObjectName: "PANEL",  // selection handle goes around shape, not label
                ungroupable: false  // enable Ctrl-Shift-G to ungroup a selected Group
            },
            $(go.TextBlock,
                {
                    font: "bold 19px sans-serif",
                    isMultiline: false,  // don't allow newlines in text
                    editable: false  // allow in-place editing by user
                },
                new go.Binding("text", "text").makeTwoWay(),
                new go.Binding("stroke", "color")
            ),
            $(go.Panel, "Auto",
                {name: "PANEL"},
                $(go.Shape, "RoundedRectangle",  // the rectangular shape around the members
                    {
                        fill: "rgba(128,128,128,0.2)", 
                        stroke: "gray", 
                        strokeWidth: 3,
                        portId: "", 
                        cursor: "pointer",  // the Shape is the port, not the whole Node
                        fromLinkable: true, // allow all kinds of links from and to this port
                        fromLinkableSelfNode: true, 
                        fromLinkableDuplicates: true,
                        toLinkable: true, 
                        toLinkableSelfNode: true, 
                        toLinkableDuplicates: true
                    }
                ),
            $(go.Placeholder, 
                { 
                    margin: 10, 
                    background: "transparent" 
                }
            )
        )
    );

    // Define the behavior for the Diagram background:  
    // provide a context menu for the background of the Diagram, when not over any Part
    myDiagram.contextMenu =
        $("ContextMenu",
            makeButton("Paste",
                function(e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); },
                function(o) { return o.diagram.commandHandler.canPasteSelection(); }),
            makeButton("Undo",
                function(e, obj) { e.diagram.commandHandler.undo(); },
                function(o) { return o.diagram.commandHandler.canUndo(); }),
            makeButton("Redo",
                function(e, obj) { e.diagram.commandHandler.redo(); },
                function(o) { return o.diagram.commandHandler.canRedo(); })
        );

    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
    myDiagram.isReadOnly = true;
}