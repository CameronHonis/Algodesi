"use strict";
exports.__esModule = true;
exports.DSPhysics = void 0;
var V2_1 = require("./V2");
var DSPhysics = /** @class */ (function () {
    function DSPhysics() {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        this.hitbox = [];
        if (arg[0] instanceof V2_1.V2 && !arg[1]) {
            this.pos = arg[0];
        }
        else if (arg[0] instanceof V2_1.V2 && arg[1] instanceof Array) {
            this.pos = arg[0];
            this.hitbox = arg[1];
        }
    }
    return DSPhysics;
}());
exports.DSPhysics = DSPhysics;
