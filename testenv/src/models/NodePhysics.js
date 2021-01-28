"use strict";
exports.__esModule = true;
exports.NodePhysics = exports.BOND_LENGTH_POW = exports.BOND_LENGTH_COEFF = exports.BOND_LENGTH = exports.STATIC_DRAG_COEFF = exports.KINETIC_DRAG_COEFF = exports.REPULSIVE_COEFF = exports.MAX_REPULSIVE_FORCE = exports.MAX_REPULSIVE_LENGTH = exports.PHYSICS_SPEED = void 0;
var V2_1 = require("./V2");
var M2_1 = require("./M2");
exports.PHYSICS_SPEED = .1;
exports.MAX_REPULSIVE_LENGTH = 2;
exports.MAX_REPULSIVE_FORCE = 80;
exports.REPULSIVE_COEFF = 10;
exports.KINETIC_DRAG_COEFF = 3;
exports.STATIC_DRAG_COEFF = 4;
exports.BOND_LENGTH = 2;
exports.BOND_LENGTH_COEFF = 30;
exports.BOND_LENGTH_POW = 2;
var NodePhysics = /** @class */ (function () {
    function NodePhysics(node, pos) {
        this.velo = new V2_1.V2(0, 0);
        this.accel = new V2_1.V2(0, 0);
        this.mass = 1;
        this.anchored = false;
        this.highPriorityRelations = new Set();
        this.highPriorityRender = true;
        this.node = node;
        this.pos = pos;
    }
    NodePhysics.prototype.setRelation = function (that, predPath) {
        var _this = this;
        if (!predPath) {
            predPath = new M2_1.M2(this.pos, this.pos.add(this.velo.scale(2)));
        }
        var predPath2 = new M2_1.M2(that.pos, that.pos.add(that.velo.scale(2)));
        var isInProx = function () {
            if (_this.node.parent === that.node || that.node.parent === _this.node) {
                return true;
            }
            if (predPath) {
                var int = predPath.intersectVector(predPath2);
                if (predPath.inBounds(int) && predPath2.inBounds(int)) {
                    return true;
                }
                if (predPath.r0.equals(predPath.r1) && predPath2.r0.equals(predPath2.r1)) {
                    if (predPath.r0.add(predPath2.r0.scale(-1)).magnitude() < 3) {
                        return true;
                    }
                }
                else if (predPath.r0.equals(predPath.r1)) {
                    if (predPath2.pointDistance(predPath.r0) < 3) {
                        return true;
                    }
                }
                else if (predPath2.r0.equals(predPath2.r1)) {
                    if (predPath.pointDistance(predPath2.r0) < 3) {
                        return true;
                    }
                }
                else {
                    if (predPath.pointDistance(predPath2.r0) < 3) {
                        return true;
                    }
                    else if (predPath.pointDistance(predPath2.r1) < 3) {
                        return true;
                    }
                    else if (predPath2.pointDistance(predPath.r0) < 3) {
                        return true;
                    }
                    else if (predPath2.pointDistance(predPath.r1) < 3) {
                        return true;
                    }
                }
            }
            return false;
        };
        if (isInProx()) {
            this.highPriorityRelations.add(that);
            that.highPriorityRelations.add(this);
        }
        else {
            this.highPriorityRelations["delete"](that);
            that.highPriorityRelations["delete"](this);
        }
    };
    NodePhysics.prototype.addForce = function (that, nodePhysicsAll) {
        var dis = this.pos.add(that.pos.scale(-1)).magnitude();
        if (dis > exports.MAX_REPULSIVE_LENGTH) {
            return;
        }
        var force = Math.min(exports.MAX_REPULSIVE_FORCE, exports.REPULSIVE_COEFF * Math.pow(1 / dis, 2));
        var thisAccelDiff = force / this.mass;
        var thatAccelDiff = force / that.mass;
        this.accel = this.accel.add(this.pos.add(that.pos.scale(-1)).unit().scale(thisAccelDiff));
        that.accel = that.accel.add(that.pos.add(this.pos.scale(-1)).unit().scale(thatAccelDiff));
        var parent = undefined;
        var child = undefined;
        if (this.node.parent === that.node) {
            parent = that;
            child = this;
        }
        else if (that.node.parent === this.node) {
            parent = this;
            child = that;
        }
        if (parent && child) {
            var currBond = child.pos.add(parent.pos.scale(-1));
            var anchorBond = new V2_1.V2(0, 1);
            if (parent.node.parent && parent.node.parent.id in nodePhysicsAll) {
                anchorBond = parent.pos.add(nodePhysicsAll[parent.node.parent.id].pos.scale(-1));
            }
            var targAngleVert = new V2_1.V2(0, 1).angleBetween(anchorBond);
            if (anchorBond.x < 0) {
                targAngleVert *= -1;
            }
            if (child.node.left === child.node) {
                targAngleVert -= 30;
            }
            else {
                targAngleVert += 30;
            }
            var bondAngleForce = new V2_1.V2(currBond.y, -currBond.x).unit().scale(targAngleVert);
            var bondLengthForce = currBond.unit().scale(exports.BOND_LENGTH_COEFF * Math.pow(exports.BOND_LENGTH - currBond.magnitude(), exports.BOND_LENGTH_POW));
            child.accel = child.accel.add(bondAngleForce).add(bondLengthForce);
        }
    };
    NodePhysics.prototype.addDrag = function () {
        this.accel = this.accel.add(this.velo.scale(-exports.KINETIC_DRAG_COEFF));
        if (this.velo.magnitude() < .01 && this.accel.magnitude() < exports.STATIC_DRAG_COEFF / this.mass) {
            this.accel = new V2_1.V2(0, 0);
        }
    };
    NodePhysics.prototype.incrementPhysics = function (dt, screenPos, screenSize) {
        if (!this.anchored) {
            this.velo = this.velo.add(this.accel.scale(dt * exports.PHYSICS_SPEED));
            this.pos = this.pos.add(this.velo.scale(dt * exports.PHYSICS_SPEED));
        }
    };
    return NodePhysics;
}());
exports.NodePhysics = NodePhysics;
