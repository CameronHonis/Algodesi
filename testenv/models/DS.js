"use strict";
exports.__esModule = true;
exports.DS = exports.DSType = void 0;
var DSType;
(function (DSType) {
    DSType[DSType["BST"] = 0] = "BST";
})(DSType = exports.DSType || (exports.DSType = {}));
var nextId = 0;
var DS = /** @class */ (function () {
    function DS(type) {
        this.nodes = {};
        this.id = nextId++;
        this.type = type;
    }
    return DS;
}());
exports.DS = DS;
