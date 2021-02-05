"use strict";
exports.__esModule = true;
exports.NodePhysics = exports.ForceType = exports.BOND_ANGLE_COEFF = exports.BOND_ANGLE = exports.BOND_LENGTH_POW = exports.BOND_LENGTH_COEFF = exports.BOND_BASE_LENGTH = exports.STATIC_FRIC_COEFF = exports.DRAG_COEFF = exports.REPULSIVE_OFFSET = exports.REPULSIVE_COEFF = exports.MAX_REPULSIVE_FORCE = exports.PRIORITY_RANGE = exports.MAX_SPEED = exports.MAX_DT = exports.PHYSICS_SPEED = void 0;
var V2_1 = require("./V2");
var M2_1 = require("./M2");
var Helpers_1 = require("./Helpers");
exports.PHYSICS_SPEED = 1;
exports.MAX_DT = .2;
exports.MAX_SPEED = 10;
exports.PRIORITY_RANGE = 5;
exports.MAX_REPULSIVE_FORCE = 80;
exports.REPULSIVE_COEFF = 10;
exports.REPULSIVE_OFFSET = -2.5;
exports.DRAG_COEFF = 3;
exports.STATIC_FRIC_COEFF = 5;
exports.BOND_BASE_LENGTH = 2;
exports.BOND_LENGTH_COEFF = 400;
exports.BOND_LENGTH_POW = 2;
exports.BOND_ANGLE = 30;
exports.BOND_ANGLE_COEFF = 80;
var ForceType;
(function (ForceType) {
    ForceType[ForceType["REPULSIVE"] = 0] = "REPULSIVE";
    ForceType[ForceType["DRAG"] = 1] = "DRAG";
    ForceType[ForceType["BOND_ANGLE"] = 2] = "BOND_ANGLE";
    ForceType[ForceType["BOND_LENGTH"] = 3] = "BOND_LENGTH";
})(ForceType = exports.ForceType || (exports.ForceType = {}));
var NodePhysics = /** @class */ (function () {
    function NodePhysics(node, pos) {
        this.velo = new V2_1.V2(0, 0);
        this.accel = new V2_1.V2(0, 0);
        this.forces = [];
        this.mass = 1;
        this.anchored = false;
        this.highPriorityRelations = new Set();
        this.highPriorityRender = true;
        this.node = node;
        this.node.physics = this;
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
                    if (predPath.r0.add(predPath2.r0.scale(-1)).magnitude() < exports.PRIORITY_RANGE) {
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
    NodePhysics.prototype.addForces = function (that) {
        var _this = this;
        if (this.pos.equals(that.pos)) {
            var angle = Math.random() * 2 * Math.PI;
            this.pos = this.pos.add(new V2_1.V2(Math.cos(angle) * .01, Math.sin(angle) * .01));
        }
        var addRepulsiveForce = function () {
            var dis = _this.pos.add(that.pos.scale(-1)).magnitude();
            var force = Math.max(0, Math.min(exports.REPULSIVE_COEFF * Math.pow(1 / dis, 2) + exports.REPULSIVE_OFFSET, exports.MAX_REPULSIVE_FORCE));
            var thisForce = _this.pos.add(that.pos.scale(-1)).unit().scale(force);
            var thatForce = that.pos.add(_this.pos.scale(-1)).unit().scale(force);
            _this.forces.push([thisForce, ForceType.REPULSIVE]);
            that.forces.push([thatForce, ForceType.REPULSIVE]);
        };
        addRepulsiveForce();
        var addBondForce = function () {
            if (!_this.node.ds || _this.node.ds !== that.node.ds) {
                return;
            }
            var parent = undefined;
            var child = undefined;
            if (_this.node.parent === that.node) {
                parent = that;
                child = _this;
            }
            else if (that.node.parent === _this.node) {
                parent = _this;
                child = that;
            }
            if (parent && child) {
                var bst = parent.node.ds;
                if (!bst.root) {
                    throw new Error();
                }
                var maxDepth = Math.max(bst.root.leftDepth, bst.root.rightDepth);
                var bondStrength = 1 - .25 * (parent.node.depth / maxDepth);
                var x = .4 * Math.pow(2, maxDepth - parent.node.depth) + .2;
                var bondAngle = Math.atan(x / 2);
                var bondLength = Math.sqrt(Math.pow(x, 2) + Math.pow(1.5, 2));
                var currBond = child.pos.add(parent.pos.scale(-1));
                var anchorAngle = 3 * Math.PI / 2;
                if (parent.node.parent && parent.node.parent.id in bst.nodes) {
                    var par2Physics = bst.nodes[parent.node.parent.id].physics;
                    if (!par2Physics) {
                        throw new Error();
                    }
                    if (parent.node.parent.left && parent.node.parent.right) {
                        var par2LeftPhysics = bst.nodes[parent.node.parent.left.id].physics;
                        if (!par2LeftPhysics) {
                            throw new Error();
                        }
                        var par2RightPhysics = bst.nodes[parent.node.parent.right.id].physics;
                        if (!par2RightPhysics) {
                            throw new Error();
                        }
                        var par2LeftBond = par2LeftPhysics.pos.add(par2Physics.pos.scale(-1));
                        var par2RightBond = par2RightPhysics.pos.add(par2Physics.pos.scale(-1));
                        anchorAngle = (par2LeftBond.originAngle() + par2RightBond.originAngle()) / 2;
                    }
                    else if (parent.node.parent.left) {
                        var par2Bond = parent.pos.add(par2Physics.pos.scale(-1));
                        var par2BondAngle = par2Bond.originAngle();
                        anchorAngle = par2BondAngle + bondAngle / 2;
                    }
                    else if (parent.node.parent.right) {
                        var par2Bond = parent.pos.add(par2Physics.pos.scale(-1));
                        var par2BondAngle = par2Bond.originAngle();
                        anchorAngle = par2BondAngle - bondAngle / 2;
                    }
                }
                var targAngle = anchorAngle;
                if (parent.node.left === child.node) {
                    targAngle -= bondAngle;
                }
                else {
                    targAngle += bondAngle;
                }
                var angleDiff = Helpers_1["default"].snapAngle(targAngle - currBond.originAngle(), -Math.PI);
                var bondAngleForce = new V2_1.V2(currBond.y, -currBond.x).unit().scale(bondStrength * exports.BOND_ANGLE_COEFF * -angleDiff);
                child.forces.push([bondAngleForce, ForceType.BOND_ANGLE]);
                parent.forces.push([bondAngleForce.scale(-1), ForceType.BOND_ANGLE]);
                var bondLengthDiff = currBond.magnitude() - bondLength;
                var bondLengthForce = currBond.unit().scale(bondStrength * exports.BOND_LENGTH_COEFF * Math.sign(bondLengthDiff) * Math.abs(Math.pow(bondLengthDiff, exports.BOND_LENGTH_POW)));
                parent.forces.push([bondLengthForce, ForceType.BOND_LENGTH]);
                child.forces.push([bondLengthForce.scale(-1), ForceType.BOND_LENGTH]);
            }
        };
        addBondForce();
    };
    NodePhysics.prototype.addDrag = function () {
        if (this.velo.magnitude() < 1) {
            this.forces.push([this.velo.scale(-exports.DRAG_COEFF), ForceType.DRAG]);
        }
        else {
            this.forces.push([this.velo.pow(2).abs().parallelProduct(this.velo.sign().scale(-exports.DRAG_COEFF)), ForceType.DRAG]);
        }
    };
    NodePhysics.prototype.resetForces = function () {
        this.forces = [];
    };
    NodePhysics.prototype.incrementPhysics = function (dt) {
        dt = Math.min(dt, exports.MAX_DT);
        var netForce = new V2_1.V2(0, 0);
        for (var _i = 0, _a = this.forces; _i < _a.length; _i++) {
            var force = _a[_i][0];
            netForce = netForce.add(force);
        }
        if (this.anchored || (this.velo.magnitude() < .01 && netForce.magnitude() < exports.STATIC_FRIC_COEFF)) {
            this.accel = new V2_1.V2(0, 0);
            this.velo = new V2_1.V2(0, 0);
        }
        else {
            this.accel = netForce.scale(1 / this.mass);
        }
        this.velo = this.velo.add(this.accel.scale(dt * exports.PHYSICS_SPEED));
        if (this.velo.magnitude() > exports.MAX_SPEED) {
            this.velo = this.velo.scale(exports.MAX_SPEED / this.velo.magnitude());
        }
        this.pos = this.pos.add(this.velo.scale(dt * exports.PHYSICS_SPEED));
    };
    return NodePhysics;
}());
exports.NodePhysics = NodePhysics;
