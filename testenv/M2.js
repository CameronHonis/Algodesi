"use strict";
exports.__esModule = true;
exports.M2 = void 0;
var Helpers_1 = require("./Helpers");
var V2_1 = require("./V2");
var M2 = /** @class */ (function () {
    function M2() {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        if (arg[0] instanceof V2_1.V2 && arg[1] instanceof V2_1.V2) {
            this.m00 = arg[0].x;
            this.m01 = arg[0].y;
            this.m10 = arg[1].x;
            this.m11 = arg[1].y;
            this.r0 = arg[0];
            this.r1 = arg[1];
        }
        else if (arg.length === 4 && typeof arg[3] === "number") {
            this.m00 = arg[0];
            this.m01 = arg[1];
            this.m10 = arg[2];
            this.m11 = arg[3];
            this.r0 = new V2_1.V2(arg[0], arg[1]);
            this.r1 = new V2_1.V2(arg[2], arg[3]);
        }
        else if (arg[0] instanceof V2_1.V2 && typeof arg[1] === "number" && typeof arg[2] === "number") {
            var r1 = new V2_1.V2(arg[0].x + Math.cos(arg[1]) * arg[2], arg[0].y + Math.sin(arg[1]) * arg[2]);
            this.m00 = arg[0].x;
            this.m01 = arg[0].x;
            this.m10 = r1.x;
            this.m11 = r1.y;
            this.r0 = arg[0];
            this.r1 = r1;
        }
        else {
            throw new Error();
        }
    }
    M2.prototype.pointDistance = function (p, capEnds) {
        if (capEnds === void 0) { capEnds = false; }
        var m2 = new M2(p.x, p.y, p.x + this.m00 - this.m10, p.y + this.m11 - this.m01);
        var int = this.intersectVector(m2);
        if (capEnds) {
            var lineMag = this.r0.add(this.r1.scale(-1)).magnitude();
            if (this.r0.add(int.scale(-1)).magnitude() < lineMag) { // int resides on line
                return p.add(int.scale(-1)).magnitude();
            }
            else { // int is outside line bounds
                return Math.min(this.r0.add(p.scale(-1)).magnitude(), this.r1.add(p.scale(-1)).magnitude());
            }
        }
        else {
            return p.add(int.scale(-1)).magnitude();
        }
    };
    M2.prototype.intersectVector = function (m2) {
        var xTopM00 = this.det();
        var xTopM01 = new M2(this.m00, 1, this.m10, 1).det();
        var xTopM10 = m2.det();
        var xTopM11 = new M2(m2.m00, 1, m2.m10, 1).det();
        var xBotM00 = xTopM01;
        var xBotM01 = new M2(this.m01, 1, this.m11, 1).det();
        var xBotM10 = xTopM11;
        var xBotM11 = new M2(m2.m01, 1, m2.m11, 1).det();
        var x = new M2(xTopM00, xTopM01, xTopM10, xTopM11).det() / new M2(xBotM00, xBotM01, xBotM10, xBotM11).det();
        var y = new M2(xTopM00, xBotM01, xTopM10, xBotM11).det() / new M2(xTopM01, xBotM01, xTopM11, xBotM11).det();
        return new V2_1.V2(x, y);
    };
    M2.prototype.det = function () {
        return this.m00 * this.m11 - this.m01 * this.m10;
    };
    M2.prototype.inBounds = function (p) {
        return Math.min(this.m00, this.m10) <= p.x && Math.max(this.m00 && this.m10) >= p.x
            && Math.min(this.m01, this.m11) >= p.y && Math.max(this.m01, this.m11) <= p.y;
    };
    M2.prototype.fitDiv = function (div, screenPos, screenSize, minThickness, maxThickness) {
        if (minThickness === void 0) { minThickness = 1; }
        if (maxThickness === void 0) { maxThickness = 10; }
        var pixR0 = Helpers_1["default"].toPixelPos(screenPos, screenSize, this.r0);
        var pixR1 = Helpers_1["default"].toPixelPos(screenPos, screenSize, this.r1);
        var mag = pixR1.add(pixR0.scale(-1)).magnitude();
        var angle = pixR1.add(pixR0.scale(-1)).originAngle();
        var thick = Math.max(minThickness, Math.min(Math.sqrt(mag) * .2, maxThickness));
        div.style.width = mag + "px";
        div.style.height = thick + "px";
        div.style.left = pixR0.x + "px";
        div.style.top = pixR0.y + "px";
        div.style.transform = "matrix(" + Math.cos(angle) + "," + Math.sin(angle) + "," + -Math.sin(angle) + "," + Math.cos(angle) + ","
            + (Math.cos(angle) - 1) * mag / 2 + "," + (Math.sin(angle) * mag / 2 - thick / 2) + ")";
    };
    M2.prototype.matrixString = function () {
        var mag = this.r1.add(this.r0.scale(-1)).magnitude();
        var angle = this.r1.add(this.r0.scale(-1)).originAngle();
        return "matrix(" + Math.cos(angle) + "," + Math.sin(angle) + "," + -Math.sin(angle) + "," + Math.cos(angle) + "," + (Math.cos(angle) - 1) * mag / 2 + "," + Math.sin(angle) * mag / 2 + ")";
    };
    return M2;
}());
exports.M2 = M2;
