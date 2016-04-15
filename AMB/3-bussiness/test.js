! function(util, debug, $, undefined) {
    "use strict";

    function removeClassesExcept(el, keep) {
        var i, c, newClasses = "",
            classList = el.className.split(" ");
        for (i = 0; i < classList.length; i++) c = classList[i], $.inArray(c, keep) >= 0 && (newClasses += " " + c);
        el.className = newClasses.substr(1)
    }

    function domIndex(el$) {
        return el$.parent().children(":visible").index(el$)
    }

    function getIdFromNode(node$) {
        var id = node$.get(0).id;
        return id.substring(id.lastIndexOf("_") + 1)
    }

    function getLevelFromNode(node$, labelSel) {
        return parseInt(node$.children(SEL_CONTENT).find(labelSel).attr(A_LEVEL), 10)
    }

    function getLevel(nodeContent$, labelSel) {
        return parseInt(nodeContent$.find(labelSel).attr(A_LEVEL), 10)
    }

    function renderTreeNodeContent(out, node, nodeAdapter, options, state) {
        var icon, link, elementName;
        nodeAdapter.renderNodeContent ? .renderNodeContent(node, out, options, state) : 
        (nodeAdapter.getIcon && (icon = nodeAdapter.getIcon(node), null !== icon 
        && out.markup("<span").attr("class", options.iconType + " " + icon).markup("></span>")), 
        link = options.useLinks && nodeAdapter.getLink && nodeAdapter.getLink(node), 
        elementName = link ? "a" : 
        "span", out.markup("<" + elementName + " tabIndex='-1' role='treeitem'")
        .attr("class", options.labelClass)
        .optionalAttr("href", link)
        .attr(A_LEVEL, state.level)
        .attr(A_SELECTED, state.selected ? "true" : "false")
        .optionalAttr(A_DISABLED, state.disabled ? "true" : null)
        .optionalAttr(A_EXPANDED, state.hasChildren === !1 ? null : state.expanded ? "true" : "false")
        .markup(">")
        .content(nodeAdapter.getLabel(node)).markup("</" + elementName + ">"))
    }

    function setFocus(elem) {
        elem.tabIndex = 0, elem.focus()
    }

    function nextNode(node$) {
        var next$;
        return node$.hasClass(C_COLLAPSIBLE) ? next$ = node$.children("ul").children("li").first() : (next$ = node$.next(), 0 === next$.length && (next$ = node$.parent().parents("li").next("li").first())), next$
    }

    function prevNode(node$) {
        var prev$;
        return prev$ = node$.prev(), prev$.length > 0 ? prev$.hasClass(C_COLLAPSIBLE) && (prev$ = prev$.find("li").filter(":visible").last()) : prev$ = node$.parent().parent("li"), prev$
    }

    function clearSelection() {
        var sel = {};
        window.getSelection ? sel = window.getSelection() : document.selection && (sel = document.selection.createRange()), sel.rangeCount ? sel.removeAllRanges() : sel.text > "" && document.selection.empty()
    }

    function preventNextScroll(scrollParent$) {
        var top = scrollParent$.scrollTop(),
            el$ = scrollParent$,
            timer = null;
        scrollParent$[0] === document && (el$ = $(window)), el$.on("scroll.treeTemp", function() {
            scrollParent$.scrollTop(top), el$.off(".treeTemp"), clearTimeout(timer)
        }), timer = setTimeout(function() {
            el$.off(".treeTemp")
        }, 20)
    }

    function initNodeLabelInput(input$, label, width, complete, cancel) {
        var input = input$.val(label).width(width).keydown(function(event) {
            var kc = event.which;
            event.shiftKey || event.ctrlKey || event.altKey || (kc === keys.ENTER ? (complete($(this).val()), event.preventDefault()) : kc === keys.ESCAPE && (setTimeout(function() {
                cancel()
            }, 10), event.preventDefault()))
        }).blur(function(event) {
            complete($(this).val())
        })[0];
        return setFocus(input), input.select(), input
    }
    var C_TREEVIEW = "a-TreeView",
        C_NODE = "a-TreeView-node",
        C_NO_COLLAPSE = "a-TreeView--noCollapse",
        SEL_NODE = "." + C_NODE,
        C_TOP_NODE = "a-TreeView-node--topLevel",
        C_ROW = "a-TreeView-row",
        SEL_ROW = "." + C_ROW,
        C_CONTENT = "a-TreeView-content",
        SEL_CONTENT = "." + C_CONTENT,
        SEL_ROW_CONTENT = SEL_CONTENT + ", " + SEL_ROW,
        C_LABEL = "a-TreeView-label",
        C_TOGGLE = "a-TreeView-toggle",
        SEL_TOGGLE = "." + C_TOGGLE,
        C_HELPER = "a-TreeView-dragHelper",
        C_PLACEHOLDER = "a-TreeView-placeholder",
        C_SELECTED = "is-selected",
        SEL_SELECTED = "." + C_SELECTED,
        C_DISABLED = "is-disabled",
        SEL_DISABLED = "." + C_DISABLED,
        C_FOCUSED = "is-focused",
        C_HOVER = "is-hover",
        C_EXPANDABLE = "is-expandable",
        C_COLLAPSIBLE = "is-collapsible",
        C_PROCESSING = "is-processing",
        C_LEAF = "a-TreeView-node--leaf",
        C_DEFAULT_ICON_TYPE = "a-Icon",
        C_RTL = "u-RTL",
        A_EXPANDED = "aria-expanded",
        A_SELECTED = "aria-selected",
        C_ACTIVE = "is-active",
        A_DISABLED = "aria-disabled",
        A_LEVEL = "aria-level",
        M_BEGIN_CHILDREN = "<ul role='group'>",
        M_END_CHILDREN = "</ul>",
        EVENT_SELECTION_CHANGE = "selectionChange",
        EVENT_EXPANSION_STATE_CHANGE = "expansionStateChange",
        keys = $.ui.keyCode;
    $.widget("apex.treeView", $.ui.mouse, {
        version: "5.0",
        widgetEventPrefix: "treeview",
        options: {
            getNodeAdapter: null,
            adapterTypesMap: null,
            showRoot: !0,
            expandRoot: !0,
            collapsibleRoot: !0,
            autoCollapse: !1,
            useLinks: !0,
            multiple: !1,
            idPrefix: null,
            contextMenuAction: null,
            contextMenu: null,
            contextMenuId: null,
            iconType: C_DEFAULT_ICON_TYPE,
            labelClass: C_LABEL,
            doubleClick: !1,
            clickToRename: !1,
            keyboardRename: !1,
            keyboardAdd: !1,
            keyboardDelete: !1,
            tooltip: null,
            navigation: !1,
            dragAndDrop: !1,
            dragMultiple: !1,
            dragReorder: !1,
            dragAppendTo: "parent",
            dragContainment: !1,
            dragCursor: "auto",
            dragCursorAt: !1,
            dragHelper: null,
            dragOpacity: !1,
            dragAnimate: !1,
            dragExpandDelay: 1200,
            dragScroll: !0,
            dragScrollSensitivity: 20,
            dragScrollSpeed: 10,
            dragZIndex: 1e3,
            scope: "default",
            activate: null,
            deactivate: null,
            out: null,
            over: null,
            start: null,
            drag: null,
            beforeStop: null,
            stop: null,
            selectionChange: null,
            expansionStateChange: null,
            activateNode: null,
            beginEdit: null,
            endEdit: null,
            added: null,
            renamed: null,
            deleted: null,
            moved: null,
            copied: null
        },
        scrollTimerId: null,
        delayExpandTimer: null,
        hasCurrent: !1,
        tooltipOptions: null,
        triggerTimerId: null,
        forwardKey: keys.RIGHT,
        backwardKey: keys.LEFT,
        scrollParent: null,
        animating: !1,
        dragging: !1,
        dragItems: null,
        currentItem: null,
        _create: function() {
            var self = this,
                ctrl$ = this.element,
                o = this.options;
            if (o.getNodeAdapter || (o.getNodeAdapter = this._parseTreeMarkup(ctrl$, o.adapterTypesMap || null)), !o.getNodeAdapter) throw "Missing required option getNodeAdapter";
            if (this.nodeAdapter = o.getNodeAdapter(), this.containerCache = {}, o.collapsibleRoot === !1 && (o.expandRoot = !0), ctrl$.addClass(C_TREEVIEW).attr("role", "tree"), this.baseId = (o.idPrefix || ctrl$[0].id || "tree") + "_", this.labelSelector = "." + o.labelClass, o.multiple && ctrl$.attr("aria-multiselectable", "true"), this.rtlFactor = 1, "rtl" === ctrl$.css("direction") && (ctrl$.addClass(C_RTL), this.forwardKey = keys.LEFT, this.backwardKey = keys.RIGHT, this.rtlFactor = -1), o.disabled && ctrl$.attr(A_DISABLED, "true"), o.tooltip && this._initTooltips(o.tooltip), o.contextMenu)
                if ($.apex.menu) {
                    if (o.contextMenu.menubar) throw "TreeView contextMenu must not be a menubar";
                    o.contextMenu._originalBeforeOpen = o.contextMenu.beforeOpen, o.contextMenu.beforeOpen = function(event, ui) {
                        o.contextMenu._originalBeforeOpen && (ui.menuElement = self.contextMenu$, ui.tree = ctrl$, ui.treeNodeAdapter = self.nodeAdapter, ui.treeSelection = self.getSelection(), ui.treeSelectedNodes = self.getNodes(ui.treeSelection), o.contextMenu._originalBeforeOpen(event, ui))
                    }, o.contextMenu.oldAfterClose = o.contextMenu.afterClose, o.contextMenu.afterClose = function(event, ui) {
                        o.contextMenu.oldAfterClose && (ui.menuElement = self.contextMenu$, ui.tree = ctrl$, o.contextMenu.oldAfterClose(event, ui)), ui.actionTookFocus || self.focus()
                    }, this.contextMenu$ = $("<div style='display:none'></div>").appendTo("body"), o.contextMenuId && (this.contextMenu$[0].id = o.contextMenuId), this.contextMenu$.menu(o.contextMenu), o.contextMenuAction && debug.warn("TreeView contextMenuAction option ignored when contextMenu option present"), o.contextMenuAction = function(event) {
                        var target$, pos;
                        "contextmenu" === event.type ? self.contextMenu$.menu("toggle", event.pageX, event.pageY) : (target$ = $(event.target), pos = target$.offset(), self.contextMenu$.menu("toggle", pos.left, pos.top + target$.closest(SEL_CONTENT).height()))
                    }
                } else debug.warn("TreeView contextMenu option ignored because menu widget not preset");
            this.scrollParent = ctrl$.scrollParent(), this.offset = this.element.offset(), this._mouseInit(), this._on(this._eventHandlers), this.renderNodeOptions = {
                iconType: o.iconType,
                labelClass: o.labelClass,
                useLinks: o.useLinks
            }, this.refresh()
        },
        _eventHandlers: {
            click: function(event) {
                var node$, o = this.options,
                    target$ = $(event.target);
                return o.multiple || "A" !== event.target.nodeName || !event.shiftKey && !event.ctrlKey ? (target$.hasClass(C_TOGGLE) ? (this._toggleNode(target$.parent()), this.scrollParent && preventNextScroll(this.scrollParent), this.lastFocused.focus(), event.preventDefault()) : (node$ = target$.closest(SEL_NODE), node$.length > 0 && (o.clickToRename && "true" === node$.children(SEL_CONTENT).find(this.labelSelector).attr(A_SELECTED) && !event.ctrlKey && !event.altKey && 1 === this.getSelection().length && target$.closest(this.labelSelector).length ? this.renameNodeInPlace(node$.children(SEL_CONTENT)) : (this._select(node$.children(SEL_CONTENT), event, !0), o.navigation && (this.keyboardActivate || "activate" !== o.doubleClick) && this._activate(event)), event.preventDefault())), this.keyboardActivate = !1, void clearSelection()) : void(this.keyboardActivate = !1)
            },
            dblclick: function(event) {
                var node$, doubleClick = this.options.doubleClick;
                doubleClick && (node$ = $(event.target).closest(SEL_NODE), node$.length > 0 && ("toggle" === doubleClick ? (this._toggleNode(node$), event.preventDefault()) : "activate" === doubleClick && this._activate(event)))
            },
            keydown: function(event) {
                var node$, nodeContent$, nh, scrollHeight, page, self = this,
                    o = this.options,
                    ctrl$ = this.element,
                    kc = event.which;
                event.altKey || "INPUT" === event.target.nodeName || this.dragging || ((kc === keys.PAGE_UP || kc === keys.PAGE_DOWN) && (this.scrollParent ? (nh = ctrl$.find(SEL_ROW).filter(":visible").first().outerHeight() || 24, node$ = ctrl$.find("li").filter(":visible").first(), nh += parseInt(node$.css("margin-top"), 10) + parseInt(node$.css("margin-bottom"), 10), scrollHeight = this.scrollParent[0] === document ? $(window).height() : this.scrollParent[0].clientHeight, page = Math.floor(scrollHeight / nh) - 1) : page = 10), kc === keys.HOME ? (ctrl$.find(SEL_CONTENT).filter(":visible").first().each(function() {
                    self._select($(this), event, !0, !0)
                }), event.preventDefault()) : kc === keys.END ? (ctrl$.find(SEL_CONTENT).filter(":visible").last().each(function() {
                    self._select($(this), event, !0, !0)
                }), event.preventDefault()) : kc === keys.SPACE ? (this.lastFocused && this._select($(self.lastFocused).closest(SEL_CONTENT), event, !0, !0), event.preventDefault()) : kc === keys.DOWN ? (this._traverseDown(event, 1), event.preventDefault()) : kc === keys.UP ? (this._traverseUp(event, 1), event.preventDefault(), event.stopPropagation()) : kc === keys.PAGE_DOWN ? (this._traverseDown(event, page), event.preventDefault()) : kc === keys.PAGE_UP ? (this._traverseUp(event, page), event.preventDefault()) : kc === this.backwardKey ? (this.lastFocused && (node$ = $(this.lastFocused).closest(SEL_NODE), node$.hasClass(C_COLLAPSIBLE) ? this._collapseNode(node$) : node$.parent().prevAll(SEL_CONTENT).each(function() {
                    self._select($(this), event, !0, !0)
                })), event.preventDefault()) : kc === this.forwardKey ? (this.lastFocused && (node$ = $(this.lastFocused).closest(SEL_NODE), node$.hasClass(C_EXPANDABLE) ? this._expandNode(node$) : node$.hasClass(C_COLLAPSIBLE) && node$.children("ul").children("li").first().children(SEL_CONTENT).each(function() {
                    self._select($(this), event, !0, !0)
                })), event.preventDefault()) : kc === keys.ENTER ? "A" === event.target.nodeName || event.shiftKey || event.ctrlKey ? this.keyboardActivate = !0 : (this._activate(event), event.preventDefault()) : 113 === kc && o.keyboardRename ? (nodeContent$ = this.lastFocused && $(this.lastFocused).closest(SEL_CONTENT + SEL_SELECTED).length > 0 ? $(this.lastFocused).closest(SEL_CONTENT) : this.getSelection().first(), nodeContent$.length > 0 && this.renameNodeInPlace(nodeContent$)) : 45 === kc && o.keyboardAdd ? (nodeContent$ = this.lastFocused && $(this.lastFocused).closest(SEL_CONTENT + SEL_SELECTED).length > 0 ? $(this.lastFocused).closest(SEL_CONTENT) : this.getSelection().first(), nodeContent$.length > 0 && this.addNodeInPlace(nodeContent$)) : kc === keys.DELETE && o.keyboardDelete ? this.deleteNodes(this.getSelection()) : this.options.contextMenuAction && event.shiftKey && 121 === kc && (self.lastFocused && !$(self.lastFocused).closest(SEL_CONTENT).hasClass(C_SELECTED) && self._select($(self.lastFocused).closest(SEL_CONTENT), {}, !1, !0), this.options.contextMenuAction(event), event.preventDefault()))
            },
            keypress: function(event) {
                function findNode(search) {
                    function next() {
                        nextNode$ = nextNode(nextNode$), 0 === nextNode$.length && (nextNode$ = self.element.find(SEL_NODE).filter(":visible").first())
                    }
                    var startNode$, nextNode$, label$, slen = search.length;
                    for (nextNode$ = startNode$ = $(self.lastFocused).closest(SEL_NODE), 1 === slen && next();;) {
                        if (label$ = nextNode$.children(SEL_CONTENT).find(self.labelSelector).first(), label$.text().substring(0, slen).toLowerCase() === search) return label$.closest(SEL_CONTENT);
                        if (next(), nextNode$[0] === startNode$[0]) break
                    }
                    return null
                }
                var ch, next$, self = this;
                if (!(0 === event.which || event.ctrlKey || event.altKey || "INPUT" === event.target.nodeName || this.dragging)) {
                    if (ch = String.fromCharCode(event.which).toLowerCase(), this.searchTimerId) ch !== this.searchString && (this.searchString += ch), clearTimeout(this.searchTimerId), this.searchTimerId = null;
                    else {
                        if (" " === ch) return;
                        this.searchString = ch
                    }
                    this.searchTimerId = setTimeout(function() {
                        self.searchTimerId = null
                    }, 500), next$ = findNode(this.searchString), next$ && this._select(next$, {}, !0, !0)
                }
            },
            focusin: function(event) {
                var label$ = $(event.target).closest(this.labelSelector);
                label$.length && (label$.addClass(C_FOCUSED).closest(SEL_NODE).children(SEL_ROW).addClass(C_FOCUSED), this._setFocusable(label$))
            },
            focusout: function(event) {
                var label$ = $(event.target).closest(this.labelSelector);
                label$.removeClass(C_FOCUSED).closest(SEL_NODE).children(SEL_ROW).removeClass(C_FOCUSED)
            },
            mousemove: function(event) {
                var node$;
                this.dragging || (node$ = $(event.target).closest(SEL_NODE), node$.length && this.lastHover !== node$[0] && ($(this.lastHover).children(SEL_ROW_CONTENT).removeClass(C_HOVER), node$.children(SEL_ROW_CONTENT).addClass(C_HOVER), this.lastHover = node$[0]))
            },
            mouseleave: function(event) {
                this.dragging || this.lastHover && ($(this.lastHover).children(SEL_ROW_CONTENT).removeClass(C_HOVER), this.lastHover = null)
            },
            contextmenu: function(event) {
                var nodeContent$;
                this.options.contextMenuAction && (nodeContent$ = $(event.target).closest(SEL_CONTENT).not(SEL_SELECTED), nodeContent$.length && this._select(nodeContent$, {}, !1, !1), this.options.contextMenuAction(event), event.preventDefault())
            }
        },
        _setOption: function(key, value) {
            var startLabel;
            if ("disabled" === key) this.options[key] = value, this.widget().toggleClass(C_DISABLED, !!value), value ? (this.element.attr(A_DISABLED, "true"), this.lastFocused && (this.lastFocused.tabIndex = -1), this.lastFocused = null) : (this.element.removeAttr(A_DISABLED), startLabel = this.getSelection().first().find(this.labelSelector), startLabel.length || (startLabel = this.element.find(this.labelSelector).first()), this._setFocusable(startLabel));
            else {
                if ("contextMenu" === key || "contextMenuId" === key) throw "TreeView " + key + " cannot be set";
                if ("contextMenuAction" === key && this.options.contextMenu) throw "TreeView contextMenuAction cannot be set when the contextMenu option is used";
                if ("dragMultiple" === key && value && !this.options.multiple) throw "TreeView dragMultiple cannot be true when the multiple option is false";
                if ("multiple" === key && !value && this.options.dragMultiple) throw "TreeView multiple cannot be false when the dragMultiple option is true";
                if ("collapsibleRoot" === key) throw "TreeView collapsibleRoot option cannot be set";
                $.Widget.prototype._setOption.apply(this, arguments)
            }
            this.renderNodeOptions = {
                iconType: this.options.iconType,
                labelClass: this.options.labelClass,
                useLinks: this.options.useLinks
            }, "showRoot" === key || "useLinks" === key ? this.refresh() : "getNodeAdapter" === key ? (this.nodeAdapter = this.options.getNodeAdapter(), this.refresh()) : "multiple" === key ? (this.element.attr("aria-multiselectable", value ? "true" : "false"), value === !1 && this.getSelection().length > 0 && this._select($(this.lastFocused).closest(SEL_CONTENT), {}, !1, !1)) : "expandRoot" === key && value === !1 ? this.options.collapsibleRoot === !1 && (this.options.expandRoot = !0, debug.warn("ExpandRoot option cannot be false when collapsibleRoot is false")) : "tooltip" === key && this._initTooltips(value)
        },
        _initTooltips: function(options) {
            var ttOptions, self = this;
            return $.ui.tooltip ? (this.tooltipOptions && (this.element.tooltip("destroy"), this.tooltipOptions = null), void(options && (ttOptions = this.tooltipOptions = $.extend(!0, {}, options), ttOptions.items = this.labelSelector, ttOptions.content && $.isFunction(ttOptions.content) && (ttOptions._originalContent = ttOptions.content, ttOptions.content = function(callback) {
                var node = self.getNodes($(this).closest(SEL_CONTENT))[0];
                return ttOptions._originalContent.call(this, callback, node)
            }), this.element.tooltip(ttOptions)))) : void debug.warn("tooltip option ignored because missing tooltip widget dependency")
        },
        _destroy: function() {
            this.element.empty().removeClass(C_TREEVIEW + " " + C_RTL).removeAttr("role").removeAttr("aria-multiselectable"), this.contextMenu$ && this.contextMenu$.remove(), this.options.tooltip && $.ui.tooltip && this.element.tooltip("destroy"), this._mouseDestroy()
        },
        refresh: function(nodeContent$) {
            var rootNode, root$, sel$, self = this,
                o = this.options,
                nodeAdapter = this.nodeAdapter,
                selectedNodes = null,
                ctrl$ = this.element,
                out = util.htmlBuilder();
            nodeAdapter.getViewId && (selectedNodes = this.getSelectedNodes()), nodeContent$ ? nodeContent$.each(function() {
                var node$ = $(this).parent(),
                    node = self.treeMap[getIdFromNode(node$)];
                node$.find(SEL_NODE).addBack().each(function() {
                    delete self.treeMap[getIdFromNode($(this))]
                }), out.clear(), self._renderNode(node, getLevelFromNode(node$, self.labelSelector), out), node$.replaceWith(out.toString())
            }) : (this.treeMap = {}, this.nextNodeId = 0, nodeAdapter.clearViewId && nodeAdapter.clearViewId(this.baseId), rootNode = nodeAdapter.root(), rootNode ? (out.markup(M_BEGIN_CHILDREN), o.showRoot ? this._renderNode(rootNode, 1, out) : nodeAdapter.hasChildren(rootNode) && this._renderChildren(rootNode, 1, out), out.markup(M_END_CHILDREN), ctrl$.html(out.toString())) : (out.markup(M_BEGIN_CHILDREN), out.markup(M_END_CHILDREN), ctrl$.html(out.toString())), o.expandRoot && o.showRoot && (root$ = this._getRoots(), root$.length > 0 && this._expandNode(root$))), this.hasCurrent ? (sel$ = this.find({
                depth: -1,
                match: function(n) {
                    return n.current === !0
                }
            }), this.hasCurrent = !1, this.setSelection(sel$)) : selectedNodes && selectedNodes.length > 0 ? this.setSelectedNodes(selectedNodes) : (this.selectAnchor = this.lastFocused, this._setFocusable(ctrl$.find(this.labelSelector).first()))
        },
        getNodeAdapter: function() {
            return this.nodeAdapter
        },
        focus: function() {
            this.lastFocused && this.lastFocused.focus()
        },
        getTreeNode: function(node) {
            var id, nodeAdapter = this.nodeAdapter;
            if (!nodeAdapter.getViewId) throw "Unsupported by model";
            return id = nodeAdapter.getViewId(this.baseId, node), $("#" + this.baseId + id).children(SEL_CONTENT)
        },
        getSelection: function() {
            return this.element.find(SEL_CONTENT + SEL_SELECTED)
        },
        getNodes: function(nodeContent$) {
            var self = this,
                nodes = [];
            return nodeContent$.each(function() {
                nodes.push(self.treeMap[getIdFromNode($(this).closest("li"))])
            }), nodes
        },
        getSelectedNodes: function() {
            return this.getNodes(this.getSelection())
        },
        setSelection: function(nodeContent$, focus) {
            focus = !!focus, this.options.multiple || (nodeContent$ = nodeContent$.first()), this._select(nodeContent$, null, focus, !1)
        },
        setSelectedNodes: function(nodes, focus) {
            var i, id, el, elements = [],
                nodeAdapter = this.nodeAdapter;
            if (!nodeAdapter.getViewId) throw "Unsupported by model";
            for (focus = !!focus, this.options.multiple || (nodes = [nodes[0]]), i = 0; i < nodes.length; i++) id = nodeAdapter.getViewId(this.baseId, nodes[i]), el = $("#" + this.baseId + id).children(SEL_CONTENT)[0], el ? elements.push(el) : debug.warn("TreeView: Ignoring bad node in setSelectedNodes");
            this._select($(elements), null, focus, !1, !0)
        },
        getExpandedNodeIds: function() {
            var nodeAdapter = this.nodeAdapter;
            if (!nodeAdapter.getExpandedNodeIds) throw "Unsupported by model";
            return nodeAdapter.getExpandedNodeIds(this.baseId)
        },
        getExpandedState: function() {
            var nodeAdapter = this.nodeAdapter;
            if (!nodeAdapter.getExpandedState) throw "Unsupported by model";
            return nodeAdapter.getExpandedState(this.baseId)
        },
        find: function(options) {
            return $(this._find(options.parentNodeContent$ || null, options.match, options.depth || 1, options.findAll || !1))
        },
        expand: function(nodeContent$) {
            var self = this;
            nodeContent$ || (nodeContent$ = this._getRoots().children(SEL_CONTENT)), nodeContent$.each(function() {
                var node$ = $(this).closest(SEL_NODE);
                node$.hasClass(C_EXPANDABLE) && self._expandNode(node$)
            })
        },
        expandAll: function(nodeContent$) {
            var self = this;
            nodeContent$ || (nodeContent$ = this._getRoots().children(SEL_CONTENT)), nodeContent$.each(function() {
                var node$ = $(this).closest(SEL_NODE);
                node$.hasClass(C_EXPANDABLE) ? self._expandNode(node$, function() {
                    self.expandAll(node$.children("ul").children("li").children(SEL_CONTENT))
                }) : self.expandAll(node$.children("ul").children("li").children(SEL_CONTENT))
            })
        },
        collapse: function(nodeContent$) {
            var self = this;
            nodeContent$ || (nodeContent$ = this._getRoots().children(SEL_CONTENT)), nodeContent$.each(function() {
                var node$ = $(this).closest(SEL_NODE);
                node$.hasClass(C_COLLAPSIBLE) && self._collapseNode(node$)
            })
        },
        collapseAll: function(nodeContent$) {
            var self = this;
            nodeContent$ || (nodeContent$ = this._getRoots().children(SEL_CONTENT)), nodeContent$.each(function() {
                var node$ = $(this).closest(SEL_NODE);
                self.collapseAll(node$.children("ul").children("li").children(SEL_CONTENT)), node$.hasClass(C_COLLAPSIBLE) && self._collapseNode(node$)
            })
        },
        addNodeInPlace: function(parentNodeContent$, initialLabel, context) {
            function cancel() {
                newNode$.remove(), self._makeLeafIfNeeded(parentNodeContent$), self._select(parentNodeContent$, {}, !0), self._endEdit({
                    action: "add",
                    status: "cancel"
                })
            }

            function complete(newName) {
                var input;
                completed || (completed = !0, nodeAdapter.addNode(parent, ul$.children().length - 1, newName, context, function(child, index) {
                    var node$, out;
                    return child === !1 ? (completed = !1, input = newNode$.find("input").val(initialLabel).get(0), setFocus(input), void input.select()) : void(child ? (newNode$.remove(), out = util.htmlBuilder(), self._renderNode(child, level, out), index >= ul$.children("li").length ? ul$.append(out.toString()) : ul$.children("li").eq(index).before(out.toString()), node$ = ul$.children("li").eq(index), self._select(node$.children(SEL_CONTENT), {}, !0), self._endEdit({
                        action: "add",
                        status: "complete"
                    }), self._trigger("added", {}, {
                        parentNode: parent,
                        parent$: parentNodeContent$,
                        index: index,
                        node: child,
                        node$: node$.children(SEL_CONTENT)
                    })) : cancel())
                }))
            }

            function addInput() {
                var inputWidth, nodeContent$, input$, out = util.htmlBuilder(),
                    addId = self.baseId + "new";
                out.markup("<li").attr("id", addId).attr("class", C_NODE + " " + C_LEAF).markup("><div").attr("class", C_ROW).markup("></div><div").attr("class", C_CONTENT).markup(">"), nodeAdapter.getIcon && out.markup("<span").attr("class", o.iconType).markup("></span>"), out.markup("<span role='treeitem'").attr("class", o.labelClass).attr(A_LEVEL, level).attr(A_SELECTED, "true").markup("><input type='text'></span></div></li>"), ul$.append(out.toString()), newNode$ = ul$.find("#" + addId), nodeContent$ = newNode$.children(SEL_CONTENT), inputWidth = 1 === self.rtlFactor ? nodeContent$.width() - nodeContent$.find(self.labelSelector)[0].offsetLeft - 16 : nodeContent$.find(self.labelSelector)[0].offsetLeft + nodeContent$.find(self.labelSelector).width() - 16, input$ = nodeContent$.find("input"), initNodeLabelInput(input$, initialLabel, inputWidth, complete, cancel), self._beginEdit({
                    action: "add",
                    context: context,
                    input: input$[0]
                })
            }
            var ul$, newNode$, parent, level, self = this,
                ctrl$ = this.element,
                o = this.options,
                nodeAdapter = this.nodeAdapter,
                completed = !1;
            if (!nodeAdapter.addNode || !nodeAdapter.allowAdd) throw "Unsupported by model";
            if (null === parentNodeContent$) {
                if (parent = nodeAdapter.root(), !o.showRoot) {
                    if (!nodeAdapter.allowAdd(parent, "add", context ? [context] : undefined)) return;
                    return level = 1, ul$ = ctrl$.find("ul:first"), void addInput()
                }
                parentNodeContent$ = ctrl$.find("ul:first > li")
            } else parent = this.treeMap[getIdFromNode(parentNodeContent$.parent())];
            nodeAdapter.allowAdd(parent, "add", context ? [context] : undefined) && (level = getLevel(parentNodeContent$, self.labelSelector) + 1, self._makeParentIfNeeded(parentNodeContent$), this._expandNode(parentNodeContent$.parent(), function() {
                ul$ = parentNodeContent$.next("ul"), addInput()
            }))
        },
        renameNodeInPlace: function(nodeContent$) {
            function cancel() {
                out.clear(), renderTreeNodeContent(out, node, nodeAdapter, self.renderNodeOptions, renderState), nodeContent$.html(out.toString()), self._select(nodeContent$, {}, !0), self._endEdit({
                    action: "rename",
                    status: "cancel"
                })
            }

            function complete(newLabel) {
                var input;
                if (!completed) return completed = !0, newLabel === oldLabel ? void cancel() : void nodeAdapter.renameNode(node, newLabel, function(renamedNode, index) {
                    var oldIndex, ul$, children$;
                    return renamedNode === !1 ? (completed = !1, input = nodeContent$.find("input").val(oldLabel)[0], setFocus(input), void input.select()) : void(renamedNode ? (out.clear(), renderTreeNodeContent(out, renamedNode, nodeAdapter, self.renderNodeOptions, renderState), nodeContent$.html(out.toString()), self.treeMap[nodeId] = renamedNode, ul$ = node$.parent(), children$ = ul$.children("li"), oldIndex = children$.index(node$), oldIndex !== index && (index > oldIndex && (index += 1), index >= children$.length ? ul$.append(node$) : children$.eq(index).before(node$)), self._select(nodeContent$, {}, !0), self._endEdit({
                        action: "rename",
                        status: "complete"
                    }), self._trigger("renamed", {}, {
                        prevLabel: oldLabel,
                        index: index,
                        node: renamedNode,
                        node$: nodeContent$
                    }), self._trigger(EVENT_SELECTION_CHANGE, 0)) : cancel())
                })
            }
            var node, input$, oldLabel, inputWidth, label$, renderState, self = this,
                nodeAdapter = (this.options, this.nodeAdapter),
                node$ = nodeContent$.parent(),
                nodeId = getIdFromNode(node$),
                completed = !1,
                out = util.htmlBuilder();
            if (!nodeAdapter.renameNode || !nodeAdapter.allowRename) throw "Unsupported by model";
            node = this.treeMap[nodeId], nodeAdapter.allowRename(node) && (label$ = nodeContent$.find(this.labelSelector), renderState = {
                level: parseInt(label$.attr(A_LEVEL), 10),
                selected: "true" === label$.attr(A_SELECTED),
                disabled: "true" === label$.attr(A_DISABLED),
                hasChildren: label$.attr(A_EXPANDED) !== undefined,
                expanded: "true" === label$.attr(A_EXPANDED)
            }, oldLabel = nodeAdapter.getLabel(node), inputWidth = 1 === self.rtlFactor ? nodeContent$.width() - label$[0].offsetLeft - 16 : label$[0].offsetLeft + label$.width() - 16, label$.html("<input type='text'>"), input$ = nodeContent$.find("input"), initNodeLabelInput(input$, oldLabel, inputWidth, complete, cancel), self._beginEdit({
                action: "rename",
                node: node,
                input: input$[0]
            }))
        },
        deleteNodes: function(nodeContent$) {
            function doDelete(index) {
                function callback(success) {
                    count += 1, success && (deletedEl.push(info.element), deleted.push({
                        node: info.node,
                        parent$: info.parent$,
                        index: info.index
                    }), nodeAdapter.clearViewId && nodeAdapter.clearViewId(self.baseId, info.node)), count >= total && (self.deleteTreeNodes($(deletedEl)), self._trigger("deleted", {}, {
                        items: deleted
                    }))
                }
                var info = toDelete[index];
                nodeAdapter.deleteNode(info.node, callback, total - 1 > index)
            }
            var i, total, count, self = this,
                toDelete = [],
                deletedEl = [],
                deleted = [],
                nodeAdapter = this.nodeAdapter;
            if (!nodeAdapter.deleteNode || !nodeAdapter.allowDelete) throw "Unsupported by model";
            for (nodeContent$.each(function() {
                    var nc$ = $(this),
                        node = self.treeMap[getIdFromNode(nc$.parent())];
                    nodeAdapter.allowDelete(node) && toDelete.push({
                        node: node,
                        element: nc$[0],
                        parent$: nc$.parent().parent().parent().children(SEL_CONTENT),
                        index: domIndex(nc$.parent())
                    })
                }), total = toDelete.length, count = 0, i = 0; total > i; i++) doDelete(i)
        },
        deleteTreeNodes: function(nodeContent$) {
            var prevNode$, self = this,
                parentNodeContent$ = nodeContent$.closest("ul").prev(),
                node$ = nodeContent$.parent(),
                thisLastFocused = nodeContent$.children(this.labelSelector).filter(this.lastFocused).length > 0,
                thisSelected = nodeContent$.hasClass(C_SELECTED);
            (thisSelected || thisLastFocused) && (prevNode$ = prevNode(node$.eq(0)), 0 === prevNode$.length && (prevNode$ = this._getRoots().first()), prevNode$.length > 0 ? thisSelected ? this._select(prevNode$.children(SEL_CONTENT), {}, thisLastFocused) : this._setFocusable(prevNode$.children(SEL_CONTENT).find(this.labelSelector)) : thisLastFocused && (this.lastFocused = null)), node$.remove().each(function() {
                delete self.treeMap[getIdFromNode(node$)]
            }), this._makeLeafIfNeeded(parentNodeContent$)
        },
        addNode: function(toParentNodeContent$, index, node) {
            var focus, parentNode, nodeAdapter = this.nodeAdapter;
            if (!nodeAdapter.addNode || !nodeAdapter.allowAdd) throw "Unsupported by model";
            if (toParentNodeContent$ && toParentNodeContent$.length) parentNode = this.treeMap[getIdFromNode(toParentNodeContent$.parent())];
            else {
                if (this.options.showRoot) throw "Parent node required";
                parentNode = nodeAdapter.root()
            }
            nodeAdapter.allowAdd(parentNode, "add", node ? [node] : undefined) && (focus = this.element.find("." + C_FOCUSED).length > 0, this._add({}, toParentNodeContent$, index, node, focus))
        },
        moveNodes: function(toParentNodeContent$, index, nodeContent$) {
            var i, focus, parentNode, nodes = this.getNodes(nodeContent$),
                allAllowDelete = !0,
                nodeAdapter = this.nodeAdapter;
            if (!nodeAdapter.moveNodes || !nodeAdapter.allowDelete || !nodeAdapter.allowAdd) throw "Unsupported by model";
            if (toParentNodeContent$ && toParentNodeContent$.length) parentNode = this.treeMap[getIdFromNode(toParentNodeContent$.parent())];
            else {
                if (this.options.showRoot) throw "Parent node required";
                parentNode = nodeAdapter.root()
            }
            for (i = 0; i < nodes.length; i++)
                if (!nodeAdapter.allowDelete(nodes[i])) {
                    allAllowDelete = !1;
                    break
                }
            allAllowDelete && nodeAdapter.allowAdd(parentNode, "move", nodes) && (focus = this.element.find("." + C_FOCUSED).length > 0, this._moveOrCopy({}, toParentNodeContent$, index, nodeContent$, !1, focus))
        },
        copyNodes: function(toParentNodeContent$, index, nodeContent$) {
            var focus, parentNode, nodes = this.getNodes(nodeContent$),
                nodeAdapter = this.nodeAdapter;
            if (!nodeAdapter.copyNodes || !nodeAdapter.allowAdd) throw "Unsupported by model";
            if (toParentNodeContent$ && toParentNodeContent$.length) parentNode = this.treeMap[getIdFromNode(toParentNodeContent$.parent())];
            else {
                if (this.options.showRoot) throw "Parent node required";
                parentNode = nodeAdapter.root()
            }
            nodeAdapter.allowAdd(parentNode, "copy", nodes) && (focus = this.element.find("." + C_FOCUSED).length > 0, this._moveOrCopy({}, toParentNodeContent$, index, nodeContent$, !0, focus))
        },
        update: function(nodeContent$) {
            var wasFocused, nc, row$, label$, renderState, disabled, node = this.treeMap[getIdFromNode(nodeContent$.parent())],
                nodeAdapter = this.nodeAdapter,
                out = util.htmlBuilder();
            label$ = nodeContent$.find(this.labelSelector), wasFocused = label$[0] === this.lastFocused, (nodeAdapter.getClasses || nodeAdapter.isDisabled) && (row$ = nodeContent$.prevAll(SEL_ROW), removeClassesExcept(nodeContent$[0], [C_CONTENT, C_DISABLED, C_FOCUSED, C_SELECTED, C_HOVER]), removeClassesExcept(row$[0], [C_ROW, C_DISABLED, C_FOCUSED, C_SELECTED, C_HOVER]), nodeAdapter.getClasses && (nc = nodeAdapter.getClasses(node), nc && (nodeContent$.addClass(nc), row$.addClass(nc))), nodeAdapter.isDisabled && nodeAdapter.isDisabled(node) && (nodeContent$.addClass(C_DISABLED), row$.addClass(C_DISABLED), disabled = !0)), renderState = {
                level: parseInt(label$.attr(A_LEVEL), 10),
                selected: "true" === label$.attr(A_SELECTED),
                disabled: disabled,
                hasChildren: label$.attr(A_EXPANDED) !== undefined,
                expanded: "true" === label$.attr(A_EXPANDED)
            }, renderTreeNodeContent(out, node, nodeAdapter, this.renderNodeOptions, renderState), nodeContent$.html(out.toString()), wasFocused && this._setFocusable(nodeContent$.find(this.labelSelector))
        },
        _parseTreeMarkup: function($el, types) {
            function parseNodeChildrenMarkup(el$) {
                var children = [];
                return el$.children("ul").children("li").each(function() {
                    var node, icon, id, classes, type, node$ = $(this),
                        a$ = node$.children("a").first(),
                        span$ = node$.children("span").first();
                    node = {}, a$.length > 0 ? (node.label = a$.text(), node.link = a$.attr("href")) : span$.length > 0 && (node.label = span$.text()), id = node$.attr("data-id"), id ? node.id = id : allHaveId = !1, "true" === node$.attr("data-current") && (node.current = !0, self.hasCurrent = !0), classes = node$.attr("class"), classes && (node.classes = classes), "true" === node$.attr("data-disabled") && (node.isDisabled = !0), icon = node$.attr("data-icon"), icon && (node.icon = icon), type = node$.attr("data-type"), type && (node.type = type), node$.children("ul").length > 0 && (node.children = parseNodeChildrenMarkup(node$)), children.push(node)
                }), children
            }
            var a, c, treeData, allHaveId = !0,
                self = this;
            return c = parseNodeChildrenMarkup($el), treeData = c.length >= 1 ? 1 === c.length && this.options.showRoot ? c[0] : {
                    children: c
                } : null, types || (types = {
                    "default": {
                        operations: {
                            canAdd: !1,
                            canDelete: !1,
                            canRename: !1,
                            canDrag: !1
                        }
                    }
                }), a = $.apex.treeView.makeDefaultNodeAdapter(treeData, types, allHaveId),
                function() {
                    return a
                }
        },
        _renderNode: function(node, level, out) {
            var hasChildren, nextId, nodeClass, contentClass, noCollapse, expanded, rowClass, nc, disabled = !1,
                o = this.options,
                nodeAdapter = this.nodeAdapter;
            nextId = this.nextNodeId, this.treeMap[nextId] = node, nodeAdapter.setViewId && nodeAdapter.setViewId(this.baseId, node, nextId), this.nextNodeId += 1, nodeClass = C_NODE + " ", hasChildren = nodeAdapter.hasChildren(node), null === hasChildren && (hasChildren = !0), hasChildren ? (expanded = !1, nodeAdapter.isExpanded && (expanded = nodeAdapter.isExpanded(this.baseId, node)), nodeClass += expanded ? C_COLLAPSIBLE : C_EXPANDABLE) : nodeClass += C_LEAF, noCollapse = 0 === nextId && o.showRoot && !o.collapsibleRoot, noCollapse && (nodeClass += " " + C_NO_COLLAPSE),
                1 === level && (nodeClass += " " + C_TOP_NODE), contentClass = C_CONTENT, nodeAdapter.isDisabled && nodeAdapter.isDisabled(node) && (contentClass += " " + C_DISABLED, disabled = !0), rowClass = C_ROW, out.markup("<li").attr("id", this.baseId + nextId).attr("class", nodeClass).markup(">"), nodeAdapter.getClasses && (nc = nodeAdapter.getClasses(node), nc && (contentClass += " " + nc, rowClass += " " + nc)), out.markup("<div").attr("class", rowClass).markup("></div>"), hasChildren && !noCollapse && out.markup("<span class='" + C_TOGGLE + "'></span>"), out.markup("<div").attr("class", contentClass).markup(">"), renderTreeNodeContent(out, node, nodeAdapter, this.renderNodeOptions, {
                    level: level,
                    selected: !1,
                    disabled: disabled,
                    hasChildren: hasChildren,
                    expanded: expanded
                }), out.markup("</div>"), expanded && (out.markup(M_BEGIN_CHILDREN), this._renderChildren(node, level + 1, out), out.markup(M_END_CHILDREN)), out.markup("</li>")
        },
        _renderChildren: function(node, level, out, fn, node$) {
            function doit() {
                var i;
                for (i = 0; len > i; i++) self._renderNode(nodeAdapter.child(node, i), level, out);
                fn && fn(!0)
            }
            var len, self = this,
                nodeAdapter = this.nodeAdapter;
            len = nodeAdapter.childCount(node), null === len ? fn && (util.delayLinger.start(node$[0].id, function() {
                node$.addClass(C_PROCESSING)
            }), nodeAdapter.fetchChildNodes(node, function(status) {
                if (util.delayLinger.finish(node$[0].id, function() {
                        node$.removeClass(C_PROCESSING), 0 === status && fn(status)
                    }), status) {
                    if (len = nodeAdapter.childCount(node), len > 0) return void doit();
                    status = 0
                }
                status === !1 && fn(status)
            })) : len > 0 ? doit() : fn && fn(0)
        },
        _getRoots: function() {
            return this.element.children("ul").children("li")
        },
        _find: function(parentNodeContent$, match, depth, findAll) {
            var node, childrenNodes$, node$, self = this,
                result = [];
            return parentNodeContent$ ? (node$ = parentNodeContent$.parent(), this._addChildrenIfNeeded(node$), childrenNodes$ = node$.children("ul").children("li")) : childrenNodes$ = this._getRoots(), childrenNodes$.each(function() {
                return node = self.treeMap[getIdFromNode($(this))], match(node) && (result.push($(this).children(SEL_CONTENT)[0]), !findAll) ? !1 : void 0
            }), (findAll || 0 === result.length) && (depth > 1 || -1 === depth) && childrenNodes$.each(function() {
                return result = result.concat(self._find($(this).children(SEL_CONTENT), match, -1 === depth ? depth : depth - 1, findAll)), result.length > 0 && !findAll ? !1 : void 0
            }), result
        },
        _makeParentIfNeeded: function(nodeContent$) {
            nodeContent$ && 0 === nodeContent$.prev(SEL_TOGGLE).length && (nodeContent$.parent().removeClass(C_LEAF).addClass(C_EXPANDABLE), nodeContent$.before("<span class='" + C_TOGGLE + "'></span>"), nodeContent$.after(M_BEGIN_CHILDREN + M_END_CHILDREN), nodeContent$.parent().children("ul").hide())
        },
        _makeLeafIfNeeded: function(nodeContent$) {
            var self = this,
                nodeAdapter = this.nodeAdapter;
            nodeContent$.each(function() {
                var node, node$, nc$ = $(this);
                0 === nc$.next("ul").find("li").length && (node$ = nc$.parent(), node$.hasClass(C_COLLAPSIBLE) && nodeAdapter.setExpanded && (node = self.treeMap[getIdFromNode(node$)], nodeAdapter.setExpanded(self.baseId, node, !1)), nc$.parent().removeClass(C_EXPANDABLE + " " + C_COLLAPSIBLE).addClass(C_LEAF), nc$.find(self.labelSelector).removeAttr(A_EXPANDED), nc$.prev(SEL_TOGGLE).remove(), nc$.next("ul").remove())
            })
        },
        _addChildrenIfNeeded: function(node$) {
            var ul$, out, node = this.treeMap[getIdFromNode(node$)];
            ul$ = node$.children("ul"), ul$.length > 0 || node$.hasClass(C_LEAF) || (out = util.htmlBuilder(), out.markup(M_BEGIN_CHILDREN), this._renderChildren(node, getLevelFromNode(node$, this.labelSelector) + 1, out), out.markup(M_END_CHILDREN), node$.append(out.toString()).children("ul").hide())
        },
        _toggleNode: function(node$) {
            node$.hasClass(C_EXPANDABLE) ? this._expandNode(node$) : this._collapseNode(node$)
        },
        _persistExpansionState: function(node, node$, state) {
            var nodeAdapter = this.nodeAdapter;
            nodeAdapter.setExpanded && nodeAdapter.setExpanded(this.baseId, node, state), this._trigger(EVENT_EXPANSION_STATE_CHANGE, {}, {
                node: node,
                nodeContent$: node$.children(SEL_CONTENT),
                expanded: state
            })
        },
        _expandNode: function(node$, fn) {
            var ul$, out, self = this,
                nodeAdapter = this.nodeAdapter,
                node = this.treeMap[getIdFromNode(node$)];
            this.options.autoCollapse && node$.parent().children("." + C_COLLAPSIBLE).each(function() {
                self._collapseNode($(this))
            }), node$.removeClass(C_EXPANDABLE), ul$ = node$.children("ul"), ul$.length > 0 && null !== nodeAdapter.childCount(node) ? (ul$.show(), node$.addClass(C_COLLAPSIBLE).children(SEL_CONTENT).find(this.labelSelector).attr(A_EXPANDED, "true"), this._persistExpansionState(node, node$, !0), fn && fn()) : (ul$.remove(), out = util.htmlBuilder(), out.markup(M_BEGIN_CHILDREN), this._renderChildren(node, getLevelFromNode(node$, this.labelSelector) + 1, out, function(status) {
                status ? (node$.addClass(C_COLLAPSIBLE).children(SEL_CONTENT).find(self.labelSelector).attr(A_EXPANDED, "true"), out.markup(M_END_CHILDREN), node$.append(out.toString()), self._persistExpansionState(node, node$, !0)) : 0 === status ? (node$.children(SEL_TOGGLE).remove(), node$.addClass(C_LEAF).children(SEL_CONTENT).find(self.labelSelector).removeAttr(A_EXPANDED)) : (node$.addClass(C_EXPANDABLE).children(SEL_CONTENT).find(self.labelSelector).attr(A_EXPANDED, "false"), self._persistExpansionState(node, node$, !1)), fn && fn()
            }, node$))
        },
        _collapseNode: function(node$) {
            var o = this.options;
            o.showRoot && !o.collapsibleRoot && node$.parent().parent().hasClass(C_TREEVIEW) || (node$.removeClass(C_COLLAPSIBLE).addClass(C_EXPANDABLE).children(SEL_CONTENT).find(this.labelSelector).attr(A_EXPANDED, "false"), node$.find(SEL_SELECTED).length > 0 && this._select(node$.children(SEL_CONTENT), {}, !0), node$.children("ul").hide(), this._persistExpansionState(this.treeMap[getIdFromNode(node$)], node$, !1))
        },
        _traverseDown: function(event, count) {
            var node$, next$, i;
            if (this.lastFocused) {
                for (node$ = $(this.lastFocused).closest(SEL_NODE), i = 0; count > i && (next$ = nextNode(node$), 0 !== next$.length); i++) node$ = next$;
                node$.length > 0 && this._select(node$.children(SEL_CONTENT), event, !0, !0)
            }
        },
        _traverseUp: function(event, count) {
            var node$, prev$, i;
            if (this.lastFocused) {
                for (node$ = $(this.lastFocused).closest(SEL_NODE), i = 0; count > i && (prev$ = prevNode(node$), 0 !== prev$.length); i++) node$ = prev$;
                node$.length > 0 && this._select(node$.children(SEL_CONTENT), event, !0, !0)
            }
        },
        _activate: function(event) {
            var href, o = this.options,
                nodeAdapter = this.nodeAdapter,
                nodes = this.getSelectedNodes();
            0 !== nodes.length && (this._trigger("activateNode", event, {
                nodes: nodes
            }), o.navigation && nodeAdapter.getLink && !event.isDefaultPrevented() && (href = nodeAdapter.getLink(nodes[0]), href && apex.navigation.redirect(href)))
        },
        _select: function(nodeContent$, event, focus, delayTrigger, noNotify) {
            var node$, focusLabel$, range$, prevSelected, sp, spOffset, treeOffset, offset, originalNodeContent$ = nodeContent$,
                action = "set",
                self = this,
                prevSel$ = this.element.find(SEL_CONTENT + SEL_SELECTED);
            if (event && this.options.multiple && ("click" === event.type ? event.ctrlKey || event.metaKey ? action = "toggle" : event.shiftKey && (action = "range") : "keydown" === event.type && (event.keyCode === $.ui.keyCode.SPACE ? action = event.ctrlKey ? "toggle" : event.shiftKey ? "range" : "add" : event.ctrlKey ? action = "none" : event.shiftKey && (action = "range"))), "range" !== action || this.selectAnchor || (action = "set"), ("set" === action || "range" === action) && (prevSel$.prevAll(SEL_ROW).addBack().removeClass(C_SELECTED), prevSel$.find(this.labelSelector).attr(A_SELECTED, "false")), focusLabel$ = nodeContent$.eq(0).find(this.labelSelector), nodeContent$ = nodeContent$.not(SEL_DISABLED), prevSelected = nodeContent$.hasClass(C_SELECTED), "set" === action || "add" === action || "toggle" === action && !prevSelected) nodeContent$.prevAll(SEL_ROW).addBack().addClass(C_SELECTED), nodeContent$.find(this.labelSelector).attr(A_SELECTED, "true"), nodeContent$.parent().parents(SEL_NODE).each(function() {
                node$ = $(this), node$.hasClass(C_EXPANDABLE) && self._expandNode(node$)
            }), this.selectAnchor = nodeContent$[0];
            else if ("range" === action) {
                for (range$ = $("#" + this.selectAnchor.parentNode.id + ", #" + originalNodeContent$[0].parentNode.id), node$ = range$.first();;)
                    if (node$.children(SEL_CONTENT).hasClass(C_DISABLED) || (node$.children(SEL_CONTENT).prevAll(SEL_ROW).addBack().addClass(C_SELECTED), node$.children(SEL_CONTENT).find(this.labelSelector).attr(A_SELECTED, "true")), node$ = nextNode(node$), 0 === node$.length || 1 === range$.length || node$[0] === range$[1]) break;
                node$.length > 0 && 2 === range$.length && !node$.children(SEL_CONTENT).hasClass(C_DISABLED) && (node$.children(SEL_CONTENT).prevAll(SEL_ROW).addBack().addClass(C_SELECTED), node$.children(SEL_CONTENT).find(this.labelSelector).attr(A_SELECTED, "true"))
            } else "toggle" === action && prevSelected && (nodeContent$.prevAll(SEL_ROW).addBack().removeClass(C_SELECTED), nodeContent$.find(this.labelSelector).attr(A_SELECTED, "false"), this.selectAnchor = nodeContent$[0]);
            focusLabel$.length > 0 && (focus ? setFocus(focusLabel$[0]) : this._setFocusable(focusLabel$), this.scrollParent && (sp = this.scrollParent[0], offset = focusLabel$.parent().offset(), treeOffset = this.element.offset(), sp === document ? (spOffset = {
                top: $(document).scrollTop(),
                left: $(document).scrollLeft()
            }, (offset.top < spOffset.top || offset.top > spOffset.top + $(window).height()) && $(document).scrollTop(offset.top - treeOffset.top), (offset.left + focusLabel$.parent()[0].offsetWidth < spOffset.left || offset.left > spOffset.left + $(window).width()) && $(document).scrollLeft(offset.left - treeOffset.left)) : (spOffset = this.scrollParent.offset(), treeOffset = this.element.offset(), (offset.top < spOffset.top || offset.top > spOffset.top + sp.offsetHeight) && (sp.scrollTop = offset.top - treeOffset.top), (offset.left + focusLabel$.parent()[0].offsetWidth < spOffset.left || offset.left > spOffset.left + sp.offsetWidth) && (sp.scrollLeft = offset.left - treeOffset.left)))), noNotify || ("toggle" === action || "range" === action && !prevSelected || "add" === action && !prevSelected || "set" === action && (prevSel$[0] !== nodeContent$[0] || prevSel$.length !== nodeContent$.length)) && (self.triggerTimerId && (clearTimeout(self.triggerTimerId), self.triggerTimerId = null), self.triggerTimerId = setTimeout(function() {
                self.triggerTimerId = null, self._trigger(EVENT_SELECTION_CHANGE, event)
            }, delayTrigger ? 350 : 1))
        },
        _setFocusable: function(label$) {
            var label = label$[0];
            label && (this.lastFocused && this.lastFocused !== label && (this.lastFocused.tabIndex = -1), label.tabIndex = 0, this.lastFocused = label)
        },
        _beginEdit: function(eventArg) {
            apex.tooltipManager && apex.tooltipManager.disableTooltips(), this._trigger("beginEdit", {}, eventArg)
        },
        _endEdit: function(eventArg) {
            apex.tooltipManager && apex.tooltipManager.enableTooltips(), this._trigger("endEdit", {}, eventArg)
        },
        _mouseCapture: function(event, fromOutside) {
            var i, items$, nodes, allDraggable = !0,
                o = this.options;
            if (event.preventDefault(), this.animating || o.disabled || !o.dragAndDrop || $(event.target).hasClass(C_TOGGLE)) return !1;
            if (items$ = $(event.target).closest(SEL_NODE).children(SEL_CONTENT), 0 === items$.length) return !1;
            if (o.dragMultiple && (items$.hasClass(C_SELECTED) ? items$ = this.getSelection() : event.ctrlKey && (items$ = items$.add(this.getSelection()))), fromOutside !== !0) {
                for (nodes = this.getNodes(items$), i = 0; i < nodes.length; i++)
                    if (!this.nodeAdapter.allowDrag || !this.nodeAdapter.allowDrag(nodes[i])) {
                        allDraggable = !1;
                        break
                    }
                if (!allDraggable) return !1
            }
            return this.dragItems = items$, !0
        },
        _mouseStart: function(downEvent, event, noActivation) {
            var body, itemHeight, dragNodes = null,
                o = this.options,
                self = this;
            return noActivation || ($("body").on("keydown.treeview", function(event) {
                return event.keyCode === $.ui.keyCode.ESCAPE ? void self._cancel(event) : void self._dragCopyOrMove(event, !0)
            }), $("body").on("keyup.treeview", function(event) {
                self._dragCopyOrMove(event, !0)
            }), this._select(this.dragItems, {}, !0, !1)), this.helper || (this.helper = this._createHelper(event)), this.margins = {
                left: parseInt(this.dragItems.css("marginLeft"), 10) || 0,
                top: parseInt(this.dragItems.css("marginTop"), 10) || 0
            }, this.offset = this.dragItems.offset(), this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            }, $.extend(this.offset, {
                click: {
                    left: event.pageX - this.offset.left,
                    top: event.pageY - this.offset.top
                },
                parent: this._getParentOffset()
            }), this.helper.css("position", "absolute"), this._cacheHelperProportions(), $.ui.ddmanager && !noActivation && (this.currentItem = this.dragItems.first(), $.ui.ddmanager.current = this, $.ui.ddmanager.prepareOffsets(this, downEvent)), this.originalPosition = this._generatePosition(event), o.dragCursorAt && this._adjustOffsetFromHelper(o.dragCursorAt), this.dragItems && this.dragItems.length > 0 && !this.isOver && (dragNodes = this.getNodes(this.dragItems), dragNodes[0] || (dragNodes = null)), this.nodeAdapter.dragOperations ? this.dragOperations = this.nodeAdapter.dragOperations(dragNodes) : this.dragOperations = dragNodes ? {
                normal: "move",
                ctrl: "copy"
            } : {
                normal: "add"
            }, this.dragOperation = this.dragOperations.normal, this.dragging = !0, this.lastHover && ($(this.lastHover).children(SEL_ROW_CONTENT).removeClass(C_HOVER), this.lastHover = null), o.dragReorder && (itemHeight = this.dragItems.first().outerHeight(), "move" === this.dragOperation && this.dragItems.parent().hide(), this._createPlaceholder(itemHeight), this.initialPlaceholderPos = null), this._initPositions(), this._refreshPositions(), o.dragContainment && this._setContainment(), noActivation || o.dragCursor && "auto" !== o.dragCursor && (body = this.document.find("body"), this.storedCursor = body.css("cursor"), body.css("cursor", o.dragCursor), this.storedStylesheet = $("<style>*{ cursor: " + o.dragCursor + " !important; }</style>").appendTo(body)), o.dragOpacity && this.helper.css("opacity", o.dragOpacity), o.dragZIndex && this.helper.css("zIndex", o.dragZIndex), this.helper.addClass(C_HELPER), this.scrollParent && this.scrollParent[0] !== document && "HTML" !== this.scrollParent[0].tagName && (this.overflowOffset = this.scrollParent.offset(), this.originalScroll = {
                top: this.scrollParent[0].scrollTop,
                left: this.scrollParent[0].scrollLeft
            }), apex.tooltipManager && apex.tooltipManager.disableTooltips(), this._trigger("start", event, this._uiHashDnD()), this._mouseDrag(event), $.ui.ddmanager && !noActivation && $.ui.ddmanager.dragStart(this, event), !0
        },
        _mouseDrag: function(event) {
            var mousePos = {
                pageX: event.pageX,
                pageY: event.pageY
            };
            return this.position = this._generatePosition(event), this.positionAbs = this._adjustPositionForScroll(), this.lastPositionAbs || (this.lastPositionAbs = this.positionAbs), this.dragEventTarget = event.target, this.options.dragScroll && (this._scrollCheck(mousePos) ? this.scrollTimerId || this._scrollStart(mousePos) : this.scrollTimerId && this._scrollStop()), this.helper[0].style.left = this.position.left + "px", this.helper[0].style.top = this.position.top + "px", this._dragCopyOrMove(event), this._dragHitCheck(), $.ui.ddmanager && !this.isOver && $.ui.ddmanager.drag(this, event), this._trigger("drag", event, this._uiHashDnD()), this.lastPositionAbs = this.positionAbs, !1
        },
        _dragHitCheck: function() {
            function getDragVerticalDirection() {
                var delta = self.positionAbs.top - self.lastPositionAbs.top;
                return 0 !== delta && (delta > 0 ? "down" : "up")
            }

            function clearExpandTimer() {
                self.delayExpandTimer && (clearTimeout(self.delayExpandTimer), self.delayExpandTimer = null)
            }
            var i, item, x, y, targetNode$, location, dir, deltaX, self = this,
                deltaY = 0,
                newDropTargetId = null,
                prevDropTargetId = this.dropTargetNode ? this.dropTargetNode[0].id : null,
                o = this.options;
            if (this.scrollParent[0] !== document && (deltaY = this.scrollParent[0].scrollTop - this.dropPositionsOrigin), x = this.positionAbs.left + this.offset.click.left, x > this.containerCache.left && x < this.containerCache.left + this.containerCache.width)
                if (this.placeholder && $(this.dragEventTarget).closest("." + C_PLACEHOLDER).length) null === this.initialPlaceholderPos && (this.initialPlaceholderPos = x), deltaX = (x - this.initialPlaceholderPos) * this.rtlFactor, deltaX > (this.options.dragScrollSensitivity || 10) ? (this.initialPlaceholderPos = x, this._movePlaceholder({
                    element: this.placeholder.children(SEL_CONTENT)
                }, "below")) : deltaX < (-this.options.dragScrollSensitivity || -10) && (this.initialPlaceholderPos = x, this._movePlaceholder({
                    element: this.placeholder.children(SEL_CONTENT)
                }, "above"));
                else
                    for (this.initialPlaceholderPos = null, y = this.positionAbs.top + this.offset.click.top + deltaY, i = 0; i < this.dropPositions.length; i++)
                        if (item = this.dropPositions[i], y >= item.top && y <= item.bottom) {
                            newDropTargetId = item.nodeId, location = y > item.top + (item.bottom - item.top) / 2 ? "bottom" : "top";
                            break
                        }(prevDropTargetId !== newDropTargetId || location !== this.lastLocation) && (clearExpandTimer(), this.element.find("." + C_ACTIVE).removeClass(C_ACTIVE), newDropTargetId ? (targetNode$ = $("#" + newDropTargetId), o.dragExpandDelay >= 0 && targetNode$.hasClass(C_EXPANDABLE) && (this.delayExpandTimer = setTimeout(function() {
                            self.delayExpandTimer = null, self._expandNode(targetNode$, function() {
                                self._initPositions(targetNode$), self._refreshPositions()
                            })
                        }, o.dragExpandDelay)), item.canAdd ? (this.dropTargetNode = targetNode$, this.placeholder ? (dir = getDragVerticalDirection(), "top" === location && "up" === dir ? this._movePlaceholder(item, "before") : "bottom" === location && "down" === dir && this._movePlaceholder(item, "after")) : this.dropTargetNode.children(SEL_CONTENT + "," + SEL_ROW).addClass(C_ACTIVE)) : item.canAddChild && this.placeholder && (this.initialPlaceholderPos = x, this._movePlaceholder(item, "after"), this._movePlaceholder({
                            element: this.placeholder.children(SEL_CONTENT)
                        }, "below"))) : this.dropTargetNode = null), this.lastLocation = location
        },
        _mouseStop: function(event, fromOutside) {
            var dropped, animation, self = this;
            return this.delayExpandTimer && (clearTimeout(this.delayExpandTimer), this.delayExpandTimer = null), this._scrollStop(), $.ui.ddmanager && !fromOutside && $.ui.ddmanager.dragStop(this, event), fromOutside || $("body").off(".treeview"), this._deactivate(), this.storedCursor && (this.document.find("body").css("cursor", this.storedCursor), this.storedStylesheet.remove()), $.ui.ddmanager && !fromOutside && (dropped = $.ui.ddmanager.drop(this, event)) ? (this.placeholder && (this.dragItems.parent().show(), this._removePlaceholder()), this.dragging = !1, this.dragItems = null, this.currentItem = null, this.helper.remove(), this.helper = null, void this._stop(event)) : event.target ? void(this.options.dragAnimate ? (animation = this._getAnimation(), this.animating = !0, this.helper.animate(animation, parseInt(this.options.dragAnimate, 10) || 500, function() {
                self._finishDrag(event)
            })) : this._finishDrag(event)) : (this.fromOutside = !1, void(this.dragging = !1))
        },
        _scrollCheck: function(mousePos, update) {
            var sTop, sLeft, scrolled, deltaY = 0,
                deltaX = 0,
                o = this.options,
                sp = this.scrollParent[0];
            return sp && sp !== document && "HTML" !== sp.tagName ? (this.overflowOffset.top + sp.offsetHeight - mousePos.pageY < o.dragScrollSensitivity ? deltaY = o.dragScrollSpeed : mousePos.pageY - this.overflowOffset.top < o.dragScrollSensitivity && (deltaY = -o.dragScrollSpeed), update && deltaY && (sTop = sp.scrollTop + deltaY, 0 > sTop ? (sp.scrollTop = 0, deltaY = 0) : sTop > sp.scrollHeight - sp.clientHeight ? (sp.scrollTop = sp.scrollHeight - sp.clientHeight, deltaY = 0) : sp.scrollTop = sTop), this.overflowOffset.left + sp.offsetWidth - mousePos.pageX < o.dragScrollSensitivity ? deltaX = o.dragScrollSpeed : mousePos.pageX - this.overflowOffset.left < o.dragScrollSensitivity && (deltaX = -o.dragScrollSpeed), update && deltaX && (sLeft = sp.scrollLeft + deltaX, 0 > sLeft ? (sp.scrollLeft = 0, deltaX = 0) : sLeft > sp.scrollWidth - sp.clientWidth ? (sp.scrollLeft = sp.scrollWidth - sp.clientWidth, deltaX = 0) : sp.scrollLeft = sLeft), scrolled = !(!deltaX && !deltaY)) : (sTop = $(document).scrollTop(), sLeft = $(document).scrollLeft(), mousePos.pageY - sTop < o.dragScrollSensitivity ? deltaY = -o.dragScrollSpeed : $(window).height() - (mousePos.pageY - sTop) < o.dragScrollSensitivity && (deltaY = o.dragScrollSpeed), update && deltaY && (sTop += deltaY, 0 > sTop ? ($(document).scrollTop(0), deltaY = 0) : sTop > $(document).height() - $(window).height() ? ($(document).scrollTop($(document).height() - $(window).height()), deltaY = 0) : (mousePos.pageY += deltaY, $(document).scrollTop(sTop))), mousePos.pageX - sLeft < o.dragScrollSensitivity ? deltaX = -o.dragScrollSpeed : $(window).width() - (mousePos.pageX - sLeft) < o.dragScrollSensitivity && (deltaX = o.dragScrollSpeed), update && deltaX && (sLeft += deltaX, 0 > sLeft ? ($(document).scrollLeft(0), deltaX = 0) : sLeft + this.helper.width() > $(document).width() - $(window).width() ? ($(document).scrollLeft($(document).width() - $(window).width() - this.helper.width()), deltaX = 0) : (mousePos.pageX += deltaX, $(document).scrollLeft(sLeft))), scrolled = !(!deltaX && !deltaY), scrolled && update && (this.position = this._generatePosition(mousePos), this.helper[0].style.left = this.position.left + "px", this.helper[0].style.top = this.position.top + "px", $.ui.ddmanager && $.ui.ddmanager.prepareOffsets(this, mousePos))), scrolled
        },
        _scrollStart: function(mousePos) {
            function scroll() {
                self.scrollTimerId = setTimeout(function() {
                    self._scrollCheck(mousePos, !0) ? (self._dragHitCheck(), scroll()) : self._scrollStop()
                }, times[timeIndex]), timeIndex < times.length - 1 && (timeIndex += 1)
            }
            var self = this,
                timeIndex = 0,
                times = [150, 125, 100, 99, 96, 91, 84, 75, 64, 51, 36];
            this.scrollTimerId && this._scrollStop(), scroll()
        },
        _scrollStop: function() {
            clearTimeout(this.scrollTimerId), this.scrollTimerId = null
        },
        _getAnimation: function() {
            var cur, el$, animation = {};
            return this.placeholder || this.dropTargetNode ? (this.placeholder ? (el$ = this.placeholder, cur = el$.offset()) : (el$ = this.dropTargetNode, cur = el$.offset()), animation.left = cur.left - this.offset.parent.left - this.margins.left, animation.top = cur.top - this.offset.parent.top - this.margins.top) : (el$ = this.dragItems.eq(0), cur = this.originalPosition, animation.left = cur.left - this.margins.left, animation.top = cur.top - this.margins.top, this.scrollParent[0] !== document && (animation.left += this.originalScroll.left - this.scrollParent[0].scrollLeft, animation.top += this.originalScroll.top - this.scrollParent[0].scrollTop)), -1 === this.rtlFactor && (animation.left += el$.width() - this.helper.width()), animation
        },
        _initPositions: function(startNode$) {
            var i, dropPositions, index, id, dragNodes, self = this,
                excludedNodes = [],
                reorder = this.options.dragReorder,
                nodeAdapter = this.nodeAdapter;
            if (this.dragItems && this.dragItems.length > 0 ? (dragNodes = this.getNodes(this.dragItems), dragNodes[0] || (dragNodes = [])) : dragNodes = [], startNode$ && this.dropPositions)
                for (dropPositions = [], id = startNode$[0].id, index = 0; index < this.dropPositions.length && id !== this.dropPositions[index].nodeId; index++);
            else dropPositions = this.dropPositions = [], startNode$ = this.element;
            if (startNode$.find(SEL_NODE).each(function() {
                    var node, parent$, canAdd, canAddChild = !1,
                        node$ = $(this);
                    if (node$.is(":visible") && !node$.is("." + C_PLACEHOLDER)) {
                        if (reorder ? (parent$ = node$.parent().closest(SEL_NODE), node = parent$.length ? self.treeMap[getIdFromNode(parent$)] : self.options.showRoot ? null : nodeAdapter.root()) : node = self.treeMap[getIdFromNode(node$)], !reorder && "move" === self.dragOperation && (dragNodes.indexOf(node) >= 0 || excludedNodes.indexOf(node$.parent().closest(SEL_NODE)[0]) >= 0)) return void excludedNodes.push(this);
                        canAdd = node && nodeAdapter.allowAdd(node, self.dragOperation, dragNodes), reorder && (canAddChild = nodeAdapter.allowAdd(self.treeMap[getIdFromNode(node$)], self.dragOperation, dragNodes)), (canAdd || canAddChild || node$.hasClass(C_EXPANDABLE)) && dropPositions.push({
                            canAdd: canAdd,
                            canAddChild: canAddChild,
                            element: $(this).children(SEL_ROW),
                            nodeId: this.id,
                            top: 0,
                            bottom: 0
                        })
                    }
                }), index !== undefined && dropPositions.length)
                for (i = 0; i < dropPositions.length; i++) this.dropPositions.splice(index + i, 0, dropPositions[i])
        },
        _refreshPositions: function() {
            var i, item, p, h, vp$;
            for (i = 0; i < this.dropPositions.length; i++) item = this.dropPositions[i], h = item.element.outerHeight(), p = item.element.offset(), item.top = p.top, item.bottom = p.top + h;
            this.dropPositionsOrigin = 0, vp$ = this.scrollParent, vp$ && vp$[0] !== document ? this.dropPositionsOrigin = vp$[0].scrollTop : vp$ = this.element, p = vp$.offset(), this.containerCache.left = p.left, this.containerCache.top = p.top, this.containerCache.width = vp$.outerWidth(), this.containerCache.height = vp$.outerHeight()
        },
        _makeTempDragItem: function() {
            var i, item$, parent$, out = util.htmlBuilder();
            for (out.markup("<li").attr("class", C_NODE).markup("><div").attr("class", C_ROW).markup("></div><div").attr("class", C_CONTENT).markup(">unseen content</div></li>"), item$ = $(out.toString()), i = 0; i < this.dropPositions.length; i++)
                if (this.dropPositions[i].canAdd) {
                    parent$ = $(this.dropPositions[i].nodeId).parent();
                    break
                }
            parent$ || (parent$ = this.element.children("ul")), parent$.append(item$), this.dragItems = item$.children(SEL_CONTENT)
        },
        _createPlaceholder: function(height) {
            this.placeholder = $("<li class='" + C_NODE + " " + C_PLACEHOLDER + "'><div class='" + C_ROW + "'></div><div class='" + C_CONTENT + "'>&nbsp;</div></li>"), this.dragItems.first().parent().before(this.placeholder), height && this.placeholder.height(height)
        },
        _movePlaceholder: function(item, place) {
            var prev$, parent$, canAdd, extraLevelDown, node, self = this,
                prevParentUl$ = this.placeholder.parent(),
                nodeAdapter = this.nodeAdapter,
                node$ = item.element.parent(),
                el = node$[0];
            if ("after" === place && node$.hasClass(C_COLLAPSIBLE) && nodeAdapter.allowAdd(self.treeMap[getIdFromNode(node$)], self.dragOperation) && (el = node$.children("ul").children()[0], place = "before"), "above" === place) {
                if (node$.next(":visible").length) return;
                if (el = node$.parent().parent()[0], node$ = $(el), parent$ = node$.parent().closest(SEL_NODE), node = parent$.length ? self.treeMap[getIdFromNode(parent$)] : self.options.showRoot ? null : nodeAdapter.root(), node$.hasClass(C_TREEVIEW) || null === node) return;
                if (canAdd = nodeAdapter.allowAdd(node, self.dragOperation), !canAdd) return;
                place = "after"
            }
            if ("below" === place) {
                if (prev$ = node$.prevAll(":visible").first(), extraLevelDown = !1, prev$.hasClass(C_COLLAPSIBLE) && (prev$ = prev$.children("ul").children().last(), extraLevelDown = !0), 0 === prev$.length) return;
                if (canAdd = nodeAdapter.allowAdd(self.treeMap[getIdFromNode(prev$)], self.dragOperation), !extraLevelDown && prev$.hasClass(C_LEAF) && canAdd && this._makeParentIfNeeded(prev$.children(SEL_CONTENT)), prev$.hasClass(C_EXPANDABLE)) return void this._expandNode(prev$, function() {
                    self._initPositions(prev$), self._refreshPositions(), canAdd && prev$.children("ul")[0].appendChild(self.placeholder[0])
                });
                canAdd && prev$[0].parentNode.appendChild(this.placeholder[0])
            } else "after" !== place || el.nextSibling ? el.parentNode.insertBefore(this.placeholder[0], "before" === place ? el : el.nextSibling) : el.parentNode.appendChild(this.placeholder[0]);
            0 === prevParentUl$.children().length && this._makeLeafIfNeeded(prevParentUl$.parent().find(SEL_CONTENT)), this._refreshPositions()
        },
        _removePlaceholder: function() {
            var prevParentUl$ = this.placeholder.parent();
            this.placeholder.remove(), this.placeholder = null, 0 === prevParentUl$.children().length && this._makeLeafIfNeeded(prevParentUl$.parent().find(SEL_CONTENT))
        },
        _createHelper: function(event) {
            var helper$, o = this.options;
            return $.isFunction(o.dragHelper) ? helper$ = $(o.dragHelper.apply(this.element[0], [event, this.dragItems])) : 1 === this.dragItems.length ? helper$ = this.dragItems.clone().removeAttr("id").removeClass(C_SELECTED) : (helper$ = $("<div></div>"), helper$.html(this.dragItems.clone().removeClass(C_SELECTED))), helper$.parents("body").length || helper$.appendTo("parent" === o.dragAppendTo ? this.element[0].parentNode : o.dragAppendTo), /(fixed|absolute)/.test(helper$.css("position")) || helper$.css("position", "absolute"), helper$
        },
        _adjustOffsetFromHelper: function(obj) {
            "left" in obj && (this.offset.click.left = obj.left + this.margins.left), "right" in obj && (this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left), "top" in obj && (this.offset.click.top = obj.top + this.margins.top), "bottom" in obj && (this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top)
        },
        _getParentOffset: function() {
            var po;
            return this.offsetParent = this.helper.offsetParent(), po = this.offsetParent.offset(), this.scrollParent && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0]) && (po.left += this.scrollParent.scrollLeft(), po.top += this.scrollParent.scrollTop()), (this.offsetParent[0] === document.body || this.offsetParent[0].tagName && "html" === this.offsetParent[0].tagName.toLowerCase() && $.ui.ie) && (po = {
                top: 0,
                left: 0
            }), {
                top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
                left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
            }
        },
        _generatePosition: function(event) {
            var pageX = event.pageX,
                pageY = event.pageY,
                scroll = this.scrollParent && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0]) ? this.scrollParent : this.offsetParent,
                scrollIsRootNode = /(html|body)/i.test(scroll[0].tagName);
            return this.dragging || this.containment && (event.pageX - this.offset.click.left < this.containment[0] && (pageX = this.containment[0] + this.offset.click.left), event.pageY - this.offset.click.top < this.containment[1] && (pageY = this.containment[1] + this.offset.click.top), event.pageX - this.offset.click.left > this.containment[2] && (pageX = this.containment[2] + this.offset.click.left), event.pageY - this.offset.click.top > this.containment[3] && (pageY = this.containment[3] + this.offset.click.top)), {
                top: pageY - this.offset.click.top - this.offset.parent.top + (scrollIsRootNode ? 0 : scroll.scrollTop()),
                left: pageX - this.offset.click.left - this.offset.parent.left + (scrollIsRootNode ? 0 : scroll.scrollLeft())
            }
        },
        _adjustPositionForScroll: function() {
            var pos = this.position,
                scroll = this.scrollParent && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0]) ? this.scrollParent : this.offsetParent,
                scrollIsRootNode = /(html|body)/i.test(scroll[0].tagName);
            return {
                top: pos.top + this.offset.parent.top - (scrollIsRootNode ? 0 : scroll.scrollTop()),
                left: pos.left + this.offset.parent.left - (scrollIsRootNode ? 0 : scroll.scrollLeft())
            }
        },
        _cacheHelperProportions: function() {
            this.helperProportions = {
                width: this.helper.outerWidth(),
                height: this.helper.outerHeight()
            }
        },
        _setContainment: function() {
            var ce, co, over, o = this.options;
            "parent" === o.dragContainment && (o.dragContainment = this.helper[0].parentNode), ("document" === o.dragContainment || "window" === o.dragContainment) && (this.containment = [0 - this.offset.parent.left, 0 - this.offset.parent.top, $("document" === o.dragContainment ? document : window).width() - this.helperProportions.width - this.margins.left, ($("document" === o.dragContainment ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top]), /^(document|window|parent)$/.test(o.dragContainment) || (ce = $(o.dragContainment)[0], co = $(o.dragContainment).offset(), over = "hidden" !== $(ce).css("overflow"), this.containment = [co.left + (parseInt($(ce).css("borderLeftWidth"), 10) || 0) + (parseInt($(ce).css("paddingLeft"), 10) || 0) - this.margins.left, co.top + (parseInt($(ce).css("borderTopWidth"), 10) || 0) + (parseInt($(ce).css("paddingTop"), 10) || 0) - this.margins.top, co.left + (over ? Math.max(ce.scrollWidth, ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"), 10) || 0) - (parseInt($(ce).css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left, co.top + (over ? Math.max(ce.scrollHeight, ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"), 10) || 0) - (parseInt($(ce).css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top])
        },
        _intersectsWith: function(item) {
            var x1 = this.positionAbs.left,
                y1 = this.positionAbs.top,
                l = item.left,
                r = l + item.width,
                t = item.top,
                b = t + item.height,
                dyClick = this.offset.click.top,
                dxClick = this.offset.click.left,
                isOverElementHeight = y1 + dyClick > t && b > y1 + dyClick,
                isOverElementWidth = x1 + dxClick > l && r > x1 + dxClick;
            return isOverElementHeight && isOverElementWidth
        },
        _dragCopyOrMove: function(event, notify) {
            var key, op;
            event.ctrlKey ? key = "ctrl" : event.altKey ? key = "alt" : event.shiftKey ? key = "shift" : event.metaKey && (key = "meta"), op = this.dragOperations[key] || this.dragOperations.normal, this.dragOperation !== op && (this.dragOperation = op, this.placeholder && this.dragItems.parent().toggle("move" !== op), this._initPositions(), this._refreshPositions(), notify && this._trigger("drag", event, this._uiHashDnD()))
        },
        _cancel: function(event, fromOutside) {
            function cleanup() {
                self.animating = !1, self.helper && self.helper[0].parentNode && self.helper.remove(), self.helper = null, self.dragging = !1, self.dragItems = null, self.currentItem = null, self._stop(event)
            }
            var animation, self = this;
            this.dragging && (this.positionAbs.top = -99999, this._mouseUp({
                target: null
            }), this.placeholder && this.dragItems.parent().show()), this.dropTargetNode = null, this.placeholder && this._removePlaceholder(), this.options.dragAnimate && !fromOutside ? (animation = this._getAnimation(), this.animating = !0, this.helper.animate(animation, parseInt(this.options.dragAnimate, 10) || 500, function() {
                cleanup()
            })) : cleanup()
        },
        _deactivate: function() {
            this.element.find("." + C_ACTIVE).removeClass(C_ACTIVE)
        },
        _finishDrag: function(event) {
            var i, dropParentNode$, dropIndex, parentNode, nodes, validOperation = !0,
                nodeAdapter = this.nodeAdapter;
            if (this.animating = !1, this.placeholder ? (dropParentNode$ = this.placeholder.parent().closest(SEL_NODE), this.dragItems.parent().show(), dropIndex = domIndex(this.placeholder), "move" === this.dragOperation && this.dragItems.parent().hide()) : (dropParentNode$ = this.dropTargetNode, dropIndex = 0), this.fromOutside) {
                if (this.dragItems.parent().remove(),
                    "add" === this.dragOperation && nodeAdapter.addNode) try {
                    this.placeholder && this._removePlaceholder(), this._add(event, dropParentNode$.children(SEL_CONTENT), dropIndex, null, !0)
                } catch (ex) {
                    debug.error("Error in drop add action.", ex)
                }
            } else if (("copy" === this.dragOperation || "move" === this.dragOperation) && nodeAdapter.allowAdd && nodeAdapter["copy" === this.dragOperation ? "copyNodes" : "moveNodes"] && ("copy" === this.dragOperation || nodeAdapter.allowDelete)) try {
                if (parentNode = dropParentNode$.length || this.options.showRoot ? this.treeMap[getIdFromNode(dropParentNode$)] : nodeAdapter.root(), nodeAdapter.allowAdd(parentNode, this.dragOperation, this.dragItems) && "move" === this.dragOperation)
                    for (nodes = this.getNodes(this.dragItems), i = 0; i < nodes.length; i++)
                        if (!nodeAdapter.allowDelete(nodes[i])) {
                            validOperation = !1;
                            break
                        }
                if (validOperation && "move" === this.dragOperation)
                    if (this.placeholder) {
                        if (this.dragItems.last().closest(SEL_NODE).next()[0] === this.placeholder[0]) {
                            for (validOperation = !1, i = 0; i < this.dragItems.length - 1; i++)
                                if (this.dragItems.eq(i).closest(SEL_NODE).next()[0] !== this.dragItems.eq(i + 1).closest(SEL_NODE)[0]) {
                                    validOperation = !0;
                                    break
                                }
                        } else if (this.dragItems.first().closest(SEL_NODE).prev()[0] === this.placeholder[0])
                            for (validOperation = !1, i = 1; i < this.dragItems.length; i++)
                                if (this.dragItems.eq(i).closest(SEL_NODE).prev()[0] !== this.dragItems.eq(i - 1).closest(SEL_NODE)[0]) {
                                    validOperation = !0;
                                    break
                                }
                    } else
                        for (validOperation = !1, i = 0; i < this.dragItems.length; i++)
                            if (this.dragItems.eq(i).closest(SEL_NODE).parent().closest(SEL_NODE)[0] !== dropParentNode$[0]) {
                                validOperation = !0;
                                break
                            }
                validOperation ? (this.placeholder && this._removePlaceholder(), this._moveOrCopy(event, dropParentNode$.children(SEL_CONTENT), dropIndex, this.dragItems, "copy" === this.dragOperation, !0)) : this.dragItems.parent().show()
            } catch (ex) {
                this.dragItems.parent().show(), debug.error("Error in drop " + this.dragOperation + " action.", ex)
            }
            this.dragging = !1, this._trigger("beforeStop", event, this._uiHashDnD()), this.dragItems = null, this.currentItem = null, this.placeholder && this._removePlaceholder(), this.helper.remove(), this.helper = null, this.fromOutside && this._trigger("deactivate", event, this._uiHashDnD(this)), this._stop(event), this.fromOutside = !1
        },
        _stop: function(event) {
            apex.tooltipManager && apex.tooltipManager.enableTooltips(), this._trigger("stop", event, this._uiHashDnD())
        },
        _add: function(event, toParentNodeContent$, index, node, focus) {
            var parentNode, level, self = this,
                nodeAdapter = this.nodeAdapter;
            toParentNodeContent$ && toParentNodeContent$.length ? (parentNode = this.treeMap[getIdFromNode(toParentNodeContent$.parent())], level = getLevel(toParentNodeContent$, this.labelSelector) + 1) : (toParentNodeContent$ = null, parentNode = nodeAdapter.root(), level = 1), nodeAdapter.addNode(parentNode, index, null, node, function(newNode, newIndex) {
                function finishAdd() {
                    self._select(change.node$, event, focus), self._trigger("added", event, change)
                }
                var node$, ul$, childNodes$, out = util.htmlBuilder(),
                    change = {
                        parentNode: parentNode,
                        parent$: toParentNodeContent$,
                        node: newNode,
                        index: newIndex
                    };
                if (!(newNode === !1 || null === newNode || 0 > newIndex)) {
                    if (toParentNodeContent$) {
                        if (self._makeParentIfNeeded(toParentNodeContent$), ul$ = toParentNodeContent$.parent().children("ul"), 0 === ul$.length) return void self._expandNode(toParentNodeContent$.parent(), function() {
                            ul$ = toParentNodeContent$.parent().children("ul"), change.node$ = ul$.children().eq(index).children(SEL_CONTENT), finishAdd()
                        })
                    } else ul$ = self.element.children("ul");
                    self._renderNode(newNode, level, out), node$ = $(out.toString()), change.node$ = node$.children(SEL_CONTENT), childNodes$ = ul$.children(), newIndex >= childNodes$.length ? ul$.append(node$) : childNodes$.eq(newIndex).before(node$), finishAdd()
                }
            })
        },
        _moveOrCopy: function(event, toParentNodeContent$, index, nodeContent$, copy, focus) {
            var parentNode, level, self = this,
                nodes = this.getNodes(nodeContent$),
                op = copy ? "copyNodes" : "moveNodes",
                nodeAdapter = this.nodeAdapter;
            toParentNodeContent$ && toParentNodeContent$.length ? (parentNode = this.treeMap[getIdFromNode(toParentNodeContent$.parent())], level = getLevel(toParentNodeContent$, this.labelSelector) + 1) : (toParentNodeContent$ = null, parentNode = nodeAdapter.root(), level = 1), nodeAdapter[op](parentNode, index, nodes, function(places) {
                function finish() {
                    for (i = 0; i < resultItems.length; i++) resultItem = resultItems[i], node = nodeAdapter.child(parentNode, resultItem.toIndex), resultItem.toNode = node, out.clear(), self._renderNode(node, level, out), node$ = $(out.toString()), resultItem.toNode$ = node$.children(SEL_CONTENT), childNodes$ = ul$.children(":visible"), resultItem.toIndex >= childNodes$.length ? ul$.append(node$) : childNodes$.eq(resultItem.toIndex).before(node$), selection.push(resultItem.toNode$[0]), copy || (prevParentNode$ = resultItem.fromNode$.parent().parent().closest(SEL_NODE).children(SEL_CONTENT), resultItem.fromParent$ = prevParentNode$, resultItem.fromIndex = resultItem.fromNode$.parent().parent().children().index(resultItem.fromNode$.parent()), resultItem.fromNode$.parent().remove(), self._makeLeafIfNeeded(prevParentNode$));
                    self._select($(selection), event, focus), self._trigger(copy ? "copied" : "moved", event, change)
                }
                var i, place, node, node$, prevParentNode$, resultItem, ul$, childNodes$, out = util.htmlBuilder(),
                    resultItems = [],
                    selection = [],
                    change = {
                        parentNode: parentNode,
                        parent$: toParentNodeContent$,
                        items: resultItems
                    };
                if (places) {
                    for (i = 0; i < places.length; i++) place = places[i], place >= 0 && resultItems.push({
                        fromNode$: nodeContent$.eq(i),
                        toIndex: place
                    });
                    if (resultItems.sort(function(a, b) {
                            return a.toIndex - b.toIndex
                        }), toParentNodeContent$) return self._makeParentIfNeeded(toParentNodeContent$), ul$ = toParentNodeContent$.parent().children("ul"), void self._expandNode(toParentNodeContent$.parent(), function() {
                        finish()
                    });
                    ul$ = self.element.children("ul"), finish()
                }
            })
        },
        _uiHashDnD: function(_inst) {
            var inst = _inst || this;
            return {
                helper: inst.helper,
                placeholder: inst.dropTargetNode || inst.placeholder || $([]),
                position: inst.position,
                originalPosition: inst.originalPosition,
                offset: inst.positionAbs,
                items: inst.dragItems,
                operation: inst.dragOperation,
                sender: _inst ? _inst.element : null
            }
        }
    });
    var defaultNodeAdapter = {
        root: function() {
            return this.data
        },
        getLabel: function(n) {
            return n.label
        },
        getIcon: function(n) {
            var t = this.getType(n),
                icon = null;
            return n.icon || null === n.icon ? icon = n.icon : t.icon || null === t.icon ? icon = t.icon : this.types["default"].icon !== undefined && (icon = this.types["default"].icon), icon
        },
        getClasses: function(n) {
            var t = this.getType(n),
                classes = null;
            return t.classes ? classes = t.classes : this.types["default"].classes && (classes = this.types["default"].classes), n.classes && (classes ? classes += " " + n.classes : classes = n.classes), classes
        },
        getLink: function(n) {
            return n.link
        },
        isDisabled: function(n) {
            var t = this.getType(n),
                disabled = !1;
            return n.isDisabled !== undefined ? disabled = n.isDisabled : t.isDisabled !== undefined ? disabled = t.isDisabled : this.types["default"].isDisabled !== undefined && (disabled = this.types["default"].isDisabled), disabled
        },
        child: function(n, i) {
            return n.children ? n.children[i] : void 0
        },
        childCount: function(n) {
            return n.children ? n.children.length : 0
        },
        hasChildren: function(n) {
            return n.children ? n.children.length > 0 : !1
        },
        allowAdd: function(n, operation, children) {
            var i, validChildren, t = this.getType(n),
                addOK = !!n.children && this.check("canAdd", n, operation, children);
            if (addOK && children && (t.validChildren !== undefined ? validChildren = t.validChildren : this.types["default"].validChildren !== undefined && (validChildren = this.types["default"].validChildren), validChildren !== !0))
                for (i = 0; i < children.length; i++)
                    if (validChildren.indexOf(children[i].type) < 0) {
                        addOK = !1;
                        break
                    }
            return addOK
        },
        allowRename: function(n) {
            return this.check("canRename", n)
        },
        allowDelete: function(n) {
            return n === this.data ? !1 : this.check("canDelete", n)
        },
        allowDrag: function(n) {
            return this.check("canDrag", n)
        },
        dragOperations: function(nodes) {
            var i, ops, type;
            if (nodes) {
                if (nodes.length > 0) {
                    for (type = nodes[0].type || "default", i = 1; i < nodes.length; i++)
                        if (nodes[i].type !== type) {
                            type = "default";
                            break
                        }
                } else type = "default";
                ops = this.types[type].operations && this.types[type].operations.drag !== undefined ? this.types[type].operations.drag : this.types["default"].operations.drag
            } else ops = this.types["default"].operations.externalDrag;
            return ops
        },
        addNode: function(parent, index, label, context, callback) {
            var newIndex, newNode = $.extend(!0, {}, context || this.newNode(parent));
            label && (newNode.label = label), this.sortCompare ? parent.children.push(newNode) : parent.children.splice(index, 0, newNode), newNode._parent = parent, this._nextId !== undefined && (newNode.id === undefined ? newNode.id = this.nextId() : this._nextId += 1), this.sortCompare && parent.children.sort(this.sortCompare), newIndex = parent.children.indexOf(newNode), this.validateAdd(newNode, newIndex, function(status) {
                "string" == typeof status || status === !1 ? (parent.children.splice(newIndex, 1), callback(status === !1 ? null : !1)) : status && callback(newNode, newIndex)
            })
        },
        renameNode: function(n, newLabel, callback) {
            var newIndex, oldLabel = n.label;
            n.label = newLabel, n._parent ? (this.sortCompare && n._parent.children.sort(this.sortCompare), newIndex = n._parent.children.indexOf(n)) : newIndex = 0, this.validateRename(n, newIndex, function(status) {
                "string" == typeof status || status === !1 ? (n.label = oldLabel, callback(status === !1 ? null : !1)) : status && callback(n, newIndex)
            })
        },
        deleteNode: function(n, callback, more) {
            var oldParent = n._parent,
                oldIndex = n._parent.children.indexOf(n);
            oldParent.children.splice(oldIndex, 1), delete n._parent, this.validateDelete(n, more, function(status) {
                status || (n._parent = oldParent, oldParent.children.splice(oldIndex, 0, n)), callback(status)
            })
        },
        moveNodes: function(parent, index, nodes, callback) {
            var i, node, prevParent, prevIndex, places = [];
            for (i = 0; i < nodes.length; i++) node = nodes[i], prevParent = node._parent, prevIndex = prevParent.children.indexOf(node), prevParent.children.splice(prevIndex, 1), parent === prevParent && index > prevIndex && (index -= 1), this.sortCompare ? parent.children.push(node) : (parent.children.splice(index, 0, node), index += 1), node._parent = parent;
            for (this.sortCompare && parent.children.sort(this.sortCompare), i = 0; i < nodes.length; i++) places[i] = parent.children.indexOf(nodes[i]);
            this.validateMove(parent, nodes, places, function(status) {
                callback(status ? places : !1)
            })
        },
        copyNodes: function(parent, index, nodes, callback) {
            function cloneNode(node, parent) {
                var i, newNode = $.extend({}, node);
                if (newNode._parent = parent, self._nextId !== undefined && (newNode.id = self.nextId()), node.children)
                    for (newNode.children = [], i = 0; i < node.children.length; i++) newNode.children.push(cloneNode(node.children[i], newNode));
                return newNode
            }
            var i, node, newNode, self = this,
                newNodes = [],
                places = [];
            for (i = 0; i < nodes.length; i++) node = nodes[i], newNode = cloneNode(node, parent), this.sortCompare ? (parent.children.push(newNode), newNodes[i] = newNode) : (parent.children.splice(index, 0, newNode), places[i] = index, index += 1);
            if (this.sortCompare)
                for (parent.children.sort(this.sortCompare), i = 0; i < newNodes.length; i++) places[i] = parent.children.indexOf(newNodes[i]);
            this.validateCopy(parent, nodes, places, function(status) {
                callback(status ? places : !1)
            })
        },
        sortCompare: function(a, b) {
            return a.label > b.label ? 1 : a.label < b.label ? -1 : 0
        },
        nextId: function() {
            var nextId = this._nextId;
            return this._nextId += 1, "tn" + nextId
        },
        newNode: function(parent) {
            var ct, newNode = {},
                childrenAllowed = !0,
                t = this.getType(parent);
            return this._nextId !== undefined && (newNode.id = this.nextId()), $.isArray(t.validChildren) ? (newNode.type = t.validChildren[0], ct = this.types[newNode.type], ct && ct.operations && ct.operations.canAdd !== undefined ? childrenAllowed = t.operations.canAdd : this.types["default"].operations.canAdd !== undefined && (childrenAllowed = this.types["default"].operations.canAdd), ct && ct.defaultLabel !== undefined ? newNode.label = ct.defaultLabel : this.types["default"].defaultLabel !== undefined && (newNode.label = this.types["default"].defaultLabel)) : this.types["default"].defaultLabel !== undefined && (newNode.label = this.types["default"].defaultLabel), childrenAllowed && (newNode.children = []), newNode
        },
        extraCheck: function(result, rule, n, operation, children) {
            return result
        },
        validateAdd: function(node, index, callback) {
            callback(!0)
        },
        validateRename: function(node, index, callback) {
            callback(!0)
        },
        validateDelete: function(node, more, callback) {
            callback(!0)
        },
        validateMove: function(parent, nodes, places, callback) {
            callback(!0)
        },
        validateCopy: function(parent, nodes, places, callback) {
            callback(!0)
        },
        getType: function(n) {
            var t = "default";
            return n.type && (t = n.type), this.types[t] || this.types["default"]
        },
        check: function(rule, n, operation, children) {
            var result = !1,
                t = this.getType(n);
            return n.operations && n.operations[rule] !== undefined ? result = n.operations[rule] : t.operations && t.operations[rule] !== undefined ? result = t.operations[rule] : this.types["default"].operations[rule] !== undefined && (result = this.types["default"].operations[rule]), $.isFunction(result) && (result = result.call(this, n, operation, children)), this.extraCheck(result, rule, n, operation, children)
        }
    };
    if ($.apex.treeView.makeDefaultNodeAdapter = function(data, types, hasIdentity, initialExpandedNodeIds) {
            function traverse(n, p) {
                var i;
                if (n._parent = p, hasIdentity && (that._nextId += 1), n.children)
                    for (i = 0; i < n.children.length; i++) traverse(n.children[i], n)
            }
            var that = Object.create(defaultNodeAdapter);
            return $.isArray(hasIdentity) && (initialExpandedNodeIds = hasIdentity, hasIdentity = !0), (null === hasIdentity || hasIdentity === undefined) && (hasIdentity = !0), hasIdentity && (this.addViewStateMixin(that, "id", initialExpandedNodeIds), that._nextId = 1), that.data = data, that.types = $.extend(!0, {}, {
                "default": {
                    isDisabled: !1,
                    validChildren: !0,
                    operations: {
                        canAdd: !0,
                        canRename: !0,
                        canDelete: !0,
                        canDrag: !0,
                        drag: {
                            normal: "move",
                            ctrl: "copy"
                        },
                        externalDrag: {
                            normal: "add"
                        }
                    }
                }
            }, types), that.data && traverse(that.data, null), that
        }, $.apex.treeView.addViewStateMixin = function(adapter, nodeIdentity, initialExpandedNodeIds) {
            $.extend(adapter, {
                _getIdentity: $.isFunction(nodeIdentity) ? nodeIdentity : function(node) {
                    return node[nodeIdentity]
                },
                _state: {},
                isExpanded: function(treeId, n) {
                    var expandedNodes = this._getExpandedNodes(treeId);
                    return expandedNodes[this._getIdentity(n)] || !1
                },
                setExpanded: function(treeId, n, expanded) {
                    var expandedNodes = this._getExpandedNodes(treeId);
                    expandedNodes[this._getIdentity(n)] = expanded
                },
                getExpandedNodeIds: function(treeId) {
                    var n, nodes = [],
                        expandedNodes = this._getExpandedNodes(treeId);
                    for (n in expandedNodes) expandedNodes.hasOwnProperty(n) && expandedNodes[n] === !0 && nodes.push(n);
                    return nodes
                },
                getExpandedState: function(treeId) {
                    var expandedNodes = this._getExpandedNodes(treeId);
                    return $.extend({}, expandedNodes)
                },
                getViewId: function(treeId, n) {
                    var nodeMap = this._state[treeId] && this._state[treeId].nodeMap;
                    return nodeMap && nodeMap[this._getIdentity(n)]
                },
                setViewId: function(treeId, n, viewId) {
                    var nodeMap = this._state[treeId] && this._state[treeId].nodeMap;
                    nodeMap || (nodeMap = {}, this._state[treeId] || (this._state[treeId] = {}), this._state[treeId].nodeMap = nodeMap), nodeMap[this._getIdentity(n)] = viewId
                },
                clearViewId: function(treeId, n) {
                    var nodeMap = this._state[treeId] && this._state[treeId].nodeMap,
                        expandedNodes = this._state[treeId] && this._state[treeId].expandedNodes;
                    nodeMap && (n ? (delete nodeMap[this._getIdentity(n)], expandedNodes && delete expandedNodes[this._getIdentity(n)]) : (this._state[treeId].nodeMap = {}, delete this._state[treeId].expandedNodes))
                },
                _getExpandedNodes: function(treeId) {
                    var i, expandedNodes = this._state[treeId] && this._state[treeId].expandedNodes;
                    if (!expandedNodes && (this._state[treeId] || (this._state[treeId] = {}), expandedNodes = {}, this._state[treeId].expandedNodes = expandedNodes, initialExpandedNodeIds))
                        for (i = 0; i < initialExpandedNodeIds.length; i++) expandedNodes[initialExpandedNodeIds[i]] = !0;
                    return expandedNodes
                }
            })
        }, $.ui.draggable && ($.ui.plugin.add("draggable", "connectToTreeView", {
            start: function(event, ui) {
                var inst = $(this).data("ui-draggable"),
                    o = inst.options,
                    uiObj = $.extend({}, ui, {
                        item: inst.element
                    });
                $("body").on("keydown.treeviewplug", function(event) {
                    event.keyCode === $.ui.keyCode.ESCAPE && (inst.dropped = !1, inst.cancel())
                }), inst.trees = [], $(o.connectToTreeView).each(function() {
                    var treeView = $.data(this, "apex-treeView");
                    treeView && !treeView.options.disabled && treeView.options.dragAndDrop ? (inst.trees.push({
                        instance: treeView
                    }), treeView._initPositions(), treeView._refreshPositions(), treeView._trigger("activate", event, uiObj)) : debug.warn("Draggable connectToTreeView matches an element that is not a treeView, is disabled, or doesn't support drag and drop.")
                })
            },
            stop: function(event, ui) {
                var inst = $(this).data("ui-draggable");
                $("body").off(".treeviewplug"), $.each(inst.trees, function() {
                    this.instance.isOver && !this.invalid ? (this.instance.isOver = !1, inst.cancelHelperRemoval = !0, this.instance._mouseStop(event, !0), event.target || (this.instance._trigger("deactivate", event, this.instance._uiHashDnD(this.instance)), this.instance.dragItems.parent().remove(), this.instance._cancel(event, !0))) : (this.instance._deactivate(), this.instance._trigger("deactivate", event, this.instance._uiHashDnD(this.instance)), this.instance.dragItems && (this.instance.dragItems.parent().remove(), this.instance._cancel(event, !0)))
                })
            },
            drag: function(event, ui) {
                var inst = $(this).data("ui-draggable");
                $.each(inst.trees, function() {
                    var intersecting = !1;
                    if (!this.invalid)
                        if (this.instance.positionAbs = inst.positionAbs, this.instance.helperProportions = inst.helperProportions, this.instance.offset.click = inst.offset.click, this.instance._intersectsWith(this.instance.containerCache) && (intersecting = !0), intersecting) {
                            if (!this.instance.isOver) {
                                if (this.instance.isOver = !0, this.instance._makeTempDragItem(), this.instance.helper = ui.helper, this.instance.helper.css("position", "relative"), event.target = this.instance.dragItems.parent().children(SEL_ROW)[0], !this.instance._mouseCapture(event, !0)) return this.instance.isOver = !1, void(this.invalid = !0);
                                this.instance._trigger("over", event, this.instance._uiHashDnD(this.instance)), this.instance._mouseStart(event, event, !0), this.instance.offset.click.top = inst.offset.click.top, this.instance.offset.click.left = inst.offset.click.left, this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left, this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top, inst.dropped = this.instance.element, inst.currentItem = inst.element, this.instance.fromOutside = inst
                            }
                            this.instance.dragItems && this.instance._mouseDrag(event)
                        } else this.instance.isOver && (this.instance.isOver = !1, this.instance._trigger("out", event, this.instance._uiHashDnD(this.instance)), event.target = null, this.instance._mouseStop(event, !0), this.instance.dragItems.parent().remove(), this.instance.placeholder && this.instance._removePlaceholder(), inst.dropped = !1)
                })
            }
        }), $.ui.plugin.add("draggable", "cursor2", {
            start: function() {
                var b$ = $("body"),
                    inst = $(this).data("ui-draggable"),
                    o = inst.options;
                o.cursor2 && "auto" !== o.cursor2 && (inst.storedCursor = b$.css("cursor"), b$.css("cursor", o.cursor2), inst.storedStylesheet = $("<style>*{ cursor: " + o.cursor2 + " !important; }</style>").appendTo(b$))
            },
            stop: function() {
                var inst = $(this).data("ui-draggable");
                inst.storedCursor && ($("body").css("cursor", inst.storedCursor), inst.storedStylesheet.remove())
            }
        })), apex.widget)
        if (apex.widget.tree) debug.warn("Old and new tree implementations cannot be mixed.");
        else {
            var defaultTypeData = {
                "default": {
                    icon: "icon-tree-folder",
                    operations: {
                        canAdd: !1,
                        canDelete: !1,
                        canRename: !1,
                        canDrag: !1
                    }
                }
            };
            apex.widget.tree = {
                init: function(pTreeId, pTypes, pStaticData, pTreeAction, pSelectedNodeId, pHasIdentity, pRootAdded, pHasTooltips, iconType) {
                    var sel$, types = $.extend(!0, {}, defaultTypeData, pTypes),
                        tree$ = $("#" + util.escapeCSS(pTreeId), apex.gPageContext$);
                    tree$.treeView({
                        getNodeAdapter: function() {
                            return $.apex.treeView.makeDefaultNodeAdapter(pStaticData, types, pHasIdentity)
                        },
                        navigation: !0,
                        doubleClick: "D" === pTreeAction ? "activate" : !1,
                        tooltip: pHasTooltips ? {
                            show: apex.tooltipManager.defaultShowOption(),
                            content: function(callback, node) {
                                return node ? node.tooltip : null
                            }
                        } : null,
                        multiple: !1,
                        showRoot: !pRootAdded,
                        expandRoot: !0,
                        iconType: iconType
                    }), pSelectedNodeId && (sel$ = tree$.treeView("find", {
                        depth: -1,
                        findAll: !1,
                        match: function(node) {
                            return node.id === pSelectedNodeId
                        }
                    }), sel$.length && tree$.treeView("setSelection", sel$))
                },
                expand_all: function(pTreeId) {
                    $("#" + util.escapeCSS(pTreeId), apex.gPageContext$).treeView("expandAll")
                },
                collapse_all: function(pTreeId) {
                    $("#" + util.escapeCSS(pTreeId), apex.gPageContext$).treeView("collapseAll")
                },
                reset: function(pTreeId) {
                    var tree$ = $("#" + util.escapeCSS(pTreeId), apex.gPageContext$);
                    tree$.treeView("collapseAll").treeView("expand", tree$.children().children("li").first())
                }
            }
        }
}(apex.util, apex.debug, apex.jQuery);

