"use strict";
exports.__esModule = true;
exports.M3 = void 0;
var Helpers_1 = require("./Helpers");
var M2_1 = require("./M2");
var V2_1 = require("./V2");
var M3 = /** @class */ (function () {
    function M3() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args[0] instanceof M2_1.M2) {
            this.upVector = args[0].r1.add(args[0].r0.scale(-1)).unit();
            this.position = args[0].r0;
        }
        else if (args[0] instanceof V2_1.V2 && args[0] instanceof V2_1.V2) {
            this.position = args[0];
            this.upVector = args[1].add(args[0].scale(-1)).unit();
        }
        else if (typeof args[0] === "number" && args.length === 9) {
            this.position = new V2_1.V2(args[2], args[5]);
            this.upVector = new V2_1.V2(args[1], args[4]);
        }
        else {
            throw new Error();
        }
        this.m00 = this.upVector.y;
        this.m10 = -this.upVector.x;
        this.m20 = 0;
        this.m01 = this.upVector.x;
        this.m11 = this.upVector.y;
        this.m21 = 0;
        this.m02 = this.position.x;
        this.m12 = this.position.y;
        this.m22 = 1;
        this.rightVector = new V2_1.V2(this.m00, this.m10);
    }
    M3.prototype.translate = function (v2) {
        return new V2_1.V2(this.m00 * v2.x + this.m01 * v2.y + this.m02, this.m10 * v2.x + this.m11 * v2.y + this.m12);
    };
    M3.prototype.inverse = function () {
        return new M3(new M2_1.M2(this.m11, this.m12, this.m21, this.m22).det(), new M2_1.M2(this.m02, this.m01, this.m22, this.m21).det(), new M2_1.M2(this.m01, this.m02, this.m11, this.m12).det(), new M2_1.M2(this.m12, this.m10, this.m22, this.m20).det(), new M2_1.M2(this.m00, this.m02, this.m20, this.m22).det(), new M2_1.M2(this.m02, this.m00, this.m12, this.m10).det(), new M2_1.M2(this.m10, this.m11, this.m20, this.m21).det(), new M2_1.M2(this.m01, this.m00, this.m21, this.m20).det(), new M2_1.M2(this.m00, this.m01, this.m10, this.m11).det());
    };
    M3.prototype.toString = function (compact) {
        if (compact === void 0) { compact = false; }
        if (compact) {
            return "M3[" + Helpers_1["default"].round(this.m00) + "," + Helpers_1["default"].round(this.m01) + "," + Helpers_1["default"].round(this.m02) + ","
                + Helpers_1["default"].round(this.m10) + "," + Helpers_1["default"].round(this.m11) + "," + Helpers_1["default"].round(this.m12) + ","
                + Helpers_1["default"].round(this.m20) + "," + Helpers_1["default"].round(this.m21) + "," + Helpers_1["default"].round(this.m22) + "]";
        }
        else {
            return "M3[" + Helpers_1["default"].round(this.m00) + "," + Helpers_1["default"].round(this.m01) + "," + Helpers_1["default"].round(this.m02) + "]\n  ["
                + Helpers_1["default"].round(this.m10) + "," + Helpers_1["default"].round(this.m11) + "," + Helpers_1["default"].round(this.m12) + "]\n  ["
                + this.m20 + "," + this.m21 + "," + this.m22 + "]";
        }
    };
    return M3;
}());
exports.M3 = M3;
