"use strict";
exports.__esModule = true;
exports.Tri = void 0;
var Helpers_1 = require("./Helpers");
var M2_1 = require("./M2");
var V2_1 = require("./V2");
var Tri = /** @class */ (function () {
    function Tri() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var p1, p2, p3;
        if (args[0] instanceof M2_1.M2 && args[1] instanceof V2_1.V2) {
            p1 = args[1];
            p2 = args[0].r0;
            p3 = args[0].r1;
        }
        else if (args[0] instanceof V2_1.V2 && args[1] instanceof V2_1.V2 && args[2] instanceof V2_1.V2) {
            p1 = args[0];
            p2 = args[1];
            p3 = args[2];
        }
        else {
            throw new Error("Error constructing Tri, unhandled parameter types " + Helpers_1["default"].listTypes(args));
        }
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        if (new M2_1.M2(p1, p2).collinear(p3)) {
            console.warn("Tri constructed with 3 collinear points");
        }
    }
    Tri.prototype.pointInTri = function (p) {
        var sign = function (p0, p1, p) {
            return (p0.x - p.x) * (p1.y - p.y) - (p1.x - p.x) * (p0.y - p.y);
        };
        var d1 = sign(p, this.p1, this.p2);
        var d2 = sign(p, this.p2, this.p3);
        var d3 = sign(p, this.p3, this.p1);
        var hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        var hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        return !(hasNeg && hasPos);
    };
    Tri.prototype.pointInTri2 = function (p) {
        var det123 = Math.abs(new M2_1.M2(this.p2.add(this.p1.scale(-1)), this.p3.add(this.p1.scale(-1))).det());
        var det12p = Math.abs(new M2_1.M2(this.p2.add(this.p1.scale(-1)), p.add(this.p1.scale(-1))).det());
        var det13p = Math.abs(new M2_1.M2(this.p3.add(this.p1.scale(-1)), p.add(this.p1.scale(-1))).det());
        var det23p = Math.abs(new M2_1.M2(this.p3.add(this.p2.scale(-1)), p.add(this.p2.scale(-1))).det());
        return det12p + det13p + det23p <= det123;
    };
    Tri.prototype.toString = function () {
        return "Tri[" + this.p1.toString() + "," + this.p2.toString() + "," + this.p3.toString() + "]";
    };
    return Tri;
}());
exports.Tri = Tri;
