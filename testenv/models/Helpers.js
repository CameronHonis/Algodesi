"use strict";
exports.__esModule = true;
var V2_1 = require("./V2");
var Helpers = /** @class */ (function () {
    function Helpers() {
    }
    Helpers.binarySearch = function () {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        var arr, comparator;
        if (typeof arg[0] === "function" && arg[1] instanceof Array) {
            comparator = arg[0];
            arr = arg[1];
        }
        else if ((typeof arg[0] === "number" || typeof arg[0] === "string" || typeof arg[0] === "boolean")
            && arg[1] instanceof Array && typeof arg[0] === typeof arg[1][0]) {
            comparator = function (val) {
                if (val < arg[0]) {
                    return -1;
                }
                else if (val > arg[0]) {
                    return 1;
                }
                else {
                    return 0;
                }
            };
            arr = arg[1];
        }
        else if (typeof arg[0]["compare"] === "function" && arg[0].constructor.name === arg[1][0].constructor.name) {
            comparator = arg[0]["compare"];
            arr = arg[1];
        }
        else {
            var errorStr = "Unhandled parameter types: " + arg[0].constructor.name;
            for (var i = 1; i < arg.length; ++i) {
                errorStr += ", " + arg[i].constructor.name;
            }
            errorStr += " for Helpers.binarySearch";
            throw new Error(errorStr);
        }
        if (arr.length === 0) {
            return [0, false];
        }
        var leftPointer = 0;
        var rightPointer = arr.length - 1;
        var foundMatch = false;
        while (leftPointer <= rightPointer) {
            var mid = Math.floor((leftPointer + rightPointer) / 2);
            if (comparator(arr[mid]) === 1) {
                rightPointer = mid - 1;
            }
            else if (comparator(arr[mid]) === -1) {
                leftPointer = mid + 1;
            }
            else {
                rightPointer = mid - 1;
                leftPointer = mid;
                foundMatch = true;
            }
        }
        return [rightPointer + 1, foundMatch];
    };
    Helpers.round = function (num, sigFigs, sciNotation) {
        if (sigFigs === void 0) { sigFigs = 4; }
        if (sciNotation === void 0) { sciNotation = false; }
        sigFigs = Math.max(sigFigs, 1);
        var coeff = Math.pow(10, sigFigs - 1);
        var pow10 = num ? -Math.ceil(Math.log10(Math.abs(1 / num))) : 0;
        var rounded = Math.round(coeff * Math.pow(10, -pow10) * num) / coeff;
        if (sciNotation) {
            return rounded + (pow10 ? "E" + pow10 : "");
        }
        else {
            var xStrSize = Math.max(sigFigs + pow10 + Math.max(-Math.sign(rounded), 0), sigFigs - pow10 + 1 + Math.max(-Math.sign(rounded), 0), sigFigs + 1);
            return (rounded * Math.pow(10, pow10)).toString().slice(0, xStrSize);
        }
    };
    Helpers.toPixelPos = function (screenPos, screenSize, pos) {
        return new V2_1.V2((pos.x - screenPos.x + screenSize.x / 2) / screenSize.x * window.innerWidth, (1 - (pos.y - screenPos.y + screenSize.y / 2) / screenSize.y) * window.innerHeight);
    };
    Helpers.toScreenPos = function (screenPos, screenSize, pos) {
        return new V2_1.V2(pos.x / window.innerWidth * screenSize.x - screenSize.x / 2 + screenPos.x, (1 - pos.y / window.innerHeight) * screenSize.y - screenSize.y / 2 + screenPos.y);
    };
    Helpers.toPixelSize = function (screenSize, size) {
        return new V2_1.V2(size.x / screenSize.x * window.innerWidth, -size.y / screenSize.y * window.innerHeight);
    };
    Helpers.toScreenSize = function (screenSize, size) {
        return new V2_1.V2(size.x / window.innerWidth * screenSize.x, -size.y / window.innerHeight * screenSize.y);
    };
    Helpers.rad = function (deg) {
        return deg / 180 * Math.PI;
    };
    Helpers.deg = function (rad) {
        return rad * 180 / Math.PI;
    };
    Helpers.snapAngle = function (angle, lowerBound) {
        if (lowerBound === void 0) { lowerBound = 0; }
        angle = ((angle - lowerBound) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        return angle + lowerBound;
    };
    Helpers.deepCopy = function (obj, rtnObj) {
        if (rtnObj === void 0) { rtnObj = {}; }
        if (typeof obj !== "object") {
            return obj;
        }
        for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], val = _b[1];
            if (typeof val !== "object") {
                rtnObj[key] = val;
            }
            else {
                rtnObj[key] = {};
                this.deepCopy(val, rtnObj[key]);
            }
        }
        return rtnObj;
    };
    Helpers.shallowArrayCompare = function (arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (var i = 0; i < arr1.length; ++i) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    };
    Helpers.listTypes = function (arr) {
        var rtn = "";
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var v = arr_1[_i];
            if (rtn.length) {
                rtn += ", ";
            }
            if (v) {
                rtn += v.constructor.name;
            }
            else if (v === null) {
                rtn += "null";
            }
            else {
                rtn += "undefined";
            }
        }
        return rtn;
    };
    return Helpers;
}());
exports["default"] = Helpers;
