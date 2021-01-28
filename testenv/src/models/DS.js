"use strict";
exports.__esModule = true;
exports.DS = void 0;
var nextId = 0;
var DS = /** @class */ (function () {
    function DS() {
        this.isGhost = true;
        this.id = nextId++;
    }
    return DS;
}());
exports.DS = DS;
