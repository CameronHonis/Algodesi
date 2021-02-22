"use strict";
exports.__esModule = true;
exports.DSPhysics = void 0;
var V2_1 = require("./V2");
var Tri_1 = require("./Tri");
var DS_1 = require("./DS");
var Helpers_1 = require("./Helpers");
var M2_1 = require("./M2");
var M3_1 = require("./M3");
var ENV = require("../envVars");
var DSPhysics = /** @class */ (function () {
    function DSPhysics() {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        this.velo = new V2_1.V2(0, 0);
        this.accel = new V2_1.V2(0, 0);
        this.forces = [];
        this.mass = 0;
        this.hull = [];
        this.hullRadius = 0;
        this.highPriorityRelations = new Set();
        if (arg[0] instanceof DS_1.DS && !arg[1]) {
            this.ds = arg[0];
        }
        else if (arg[0] instanceof DS_1.DS && arg[1] instanceof Array) {
            this.ds = arg[0];
            this.hull = arg[1];
        }
        else {
            throw new Error();
        }
    }
    DSPhysics.prototype.inHull = function (p) {
        if (this.hull.length < 3) {
            return [false];
        }
        if (!this.center) {
            return [false];
        }
        var pointerIdx = 1;
        while (pointerIdx < this.hull.length) {
            var tri = new Tri_1.Tri(this.hull[pointerIdx].physics.pos, this.hull[pointerIdx - 1].physics.pos, this.center);
            if (tri.pointInTri(p)) {
                return [true, tri];
            }
            pointerIdx++;
        }
        return [false];
    };
    DSPhysics.prototype.hullDistance = function (p) {
        if (this.hull.length < 2) {
            return 100000;
        }
        var minDis = 100000;
        var pointerIdx = 1;
        while (pointerIdx < this.hull.length) {
            var line = new M2_1.M2(this.hull[pointerIdx - 1].physics.pos, this.hull[pointerIdx].physics.pos);
            minDis = Math.min(minDis, line.pointDistance(p, true));
        }
        return minDis;
    };
    DSPhysics.prototype.addToHull = function (addNode) {
        var _this = this;
        if (this.center) {
            var centerAddNodeAngle_1 = addNode.physics.pos.add(this.center.scale(-1)).originAngle();
            var insertIdx = Helpers_1["default"].binarySearch(function (node) {
                return centerAddNodeAngle_1 - node.physics.pos.add(_this.center.scale(-1)).originAngle();
            }, this.hull)[0];
            this.hull.splice(insertIdx, 0, addNode);
            this.center = this.center.scale((this.hull.length - 1) / this.hull.length).add(addNode.physics.pos.scale(1 / this.hull.length));
            var negOuterPerp = undefined;
            var negOuterPerpAngle = 0;
            var posOuterPerp = undefined;
            var posOuterPerpAngle = 0;
            for (var _i = 0, _a = this.hull; _i < _a.length; _i++) {
                var node = _a[_i];
                var addNodeNodeFrame = new M3_1.M3(addNode.physics.pos, this.center);
                var addNodeNodeDiff = addNodeNodeFrame.inverse().translate(node.physics.pos.add(addNode.physics.pos.scale(-1)));
                if (Math.atan2(addNodeNodeDiff.y, -addNodeNodeDiff.x) > negOuterPerpAngle) {
                    negOuterPerp = node;
                    negOuterPerpAngle = Math.atan2(addNodeNodeDiff.y, -addNodeNodeDiff.x);
                }
                else if (Math.atan2(addNodeNodeDiff.y, addNodeNodeDiff.x) > posOuterPerpAngle) {
                    posOuterPerp = node;
                    posOuterPerpAngle = Math.atan2(addNodeNodeDiff.y, addNodeNodeDiff.x);
                }
            }
            if (negOuterPerp && posOuterPerp) {
                var addedTri = new Tri_1.Tri(addNode.physics.pos, negOuterPerp.physics.pos, posOuterPerp.physics.pos);
                for (var i = 0; i < this.hull.length; ++i) {
                    var node = this.hull[i];
                    if (node === addNode || node === negOuterPerp || node === posOuterPerp) {
                        continue;
                    }
                    if (addedTri.pointInTri(node.physics.pos)) {
                        this.center = this.center.add(node.physics.pos.scale(-1 / this.hull.length)).scale(this.hull.length / (this.hull.length - 1));
                        this.hull.splice(i, 1);
                    }
                }
            }
        }
        else {
            this.hull.push(addNode);
            this.center = addNode.physics.pos;
        }
    };
    DSPhysics.prototype.updateHull = function () {
        var _this = this;
        this.hull = [];
        this.center = undefined;
        this.hullRadius = 0;
        this.mass = 0;
        var nodes = Object.values(this.ds.nodes);
        if (nodes.length === 0) {
            return;
        }
        var boundBox = new M2_1.M2(nodes[0].physics.pos, nodes[0].physics.pos);
        for (var _i = 0, _a = Object.values(this.ds.nodes); _i < _a.length; _i++) {
            var node = _a[_i];
            boundBox = new M2_1.M2(Math.min(boundBox.m00, node.physics.pos.x), Math.min(boundBox.m01, node.physics.pos.y), Math.max(boundBox.m10, node.physics.pos.x), Math.max(boundBox.m11, node.physics.pos.y));
        }
        this.center = new V2_1.V2(boundBox.m00 * .5 + boundBox.m10 * .5, boundBox.m01 * .5 + boundBox.m11 * .5);
        var _loop_1 = function (node) {
            this_1.mass += node.physics.mass;
            var centerNodeAngle = node.physics.pos.add(this_1.center.scale(-1)).originAngle();
            var insertIdx = Helpers_1["default"].binarySearch(function (node2) { return Math.sign(node2.physics.pos.add(_this.center.scale(-1)).originAngle() - centerNodeAngle); }, this_1.hull)[0];
            var toAdd = true;
            if (this_1.hull.length >= 3) {
                var lineOne = new M2_1.M2(this_1.center, this_1.hull[(this_1.hull.length + insertIdx - 1) % this_1.hull.length].physics.pos);
                if (!lineOne.collinear(this_1.hull[insertIdx % this_1.hull.length].physics.pos)) {
                    var adjTri = new Tri_1.Tri(lineOne, this_1.hull[insertIdx % this_1.hull.length].physics.pos);
                    if (adjTri.pointInTri(node.physics.pos)) {
                        toAdd = false;
                    }
                }
            }
            if (this_1.hull.length > 0) {
                if (Math.abs(this_1.hull[insertIdx % this_1.hull.length].physics.pos.add(this_1.center.scale(-1)).originAngle() -
                    node.physics.pos.add(this_1.center.scale(-1)).originAngle()) > 15) {
                    toAdd = false;
                    if (node.physics.pos.add(this_1.center.scale(-1)).magnitude() >
                        this_1.hull[insertIdx % this_1.hull.length].physics.pos.add(this_1.center.scale(-1)).magnitude()) {
                        this_1.hull[insertIdx % this_1.hull.length] = node;
                    }
                }
            }
            if (toAdd) {
                this_1.hull.splice(insertIdx, 0, node);
                this_1.hullRadius = Math.max(this_1.hullRadius, node.physics.pos.add(this_1.center.scale(-1)).magnitude());
                if (this_1.hull.length > 3) {
                    var sharedM2 = new M2_1.M2(this_1.center, this_1.hull[insertIdx].physics.pos);
                    if (!sharedM2.collinear(this_1.hull[(this_1.hull.length + insertIdx - 2) % this_1.hull.length].physics.pos)) {
                        var lowerBackTri = new Tri_1.Tri(sharedM2, this_1.hull[(this_1.hull.length + insertIdx - 2) % this_1.hull.length].physics.pos);
                        if (lowerBackTri.pointInTri(this_1.hull[(this_1.hull.length + insertIdx - 1) % this_1.hull.length].physics.pos)) {
                            this_1.hull.splice((this_1.hull.length + insertIdx - 1) % this_1.hull.length, 1);
                            if ((this_1.hull.length + 1 + insertIdx - 1) % (this_1.hull.length + 1) < insertIdx) {
                                insertIdx--;
                            }
                        }
                    }
                    if (!sharedM2.collinear(this_1.hull[(this_1.hull.length + insertIdx + 2) % this_1.hull.length].physics.pos)) {
                        var upperBackTri = new Tri_1.Tri(sharedM2, this_1.hull[(insertIdx + 2) % this_1.hull.length].physics.pos);
                        if (upperBackTri.pointInTri(this_1.hull[(insertIdx + 1) % this_1.hull.length].physics.pos)) {
                            this_1.hull.splice((insertIdx + 1) % this_1.hull.length, 1);
                        }
                    }
                }
            }
        };
        var this_1 = this;
        for (var _b = 0, _c = Object.values(this.ds.nodes); _b < _c.length; _b++) {
            var node = _c[_b];
            _loop_1(node);
        }
    };
    DSPhysics.prototype.setRelation = function (that) {
        var _this = this;
        var isInProx = function () {
            if (!_this.center) {
                return false;
            }
            if (!that.center) {
                return false;
            }
            var dis = _this.center.add(that.center.scale(-1)).magnitude();
            if (_this.hullRadius + that.hullRadius + 10 > dis) {
                return true;
            }
            else {
                return false;
            }
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
    DSPhysics.prototype.addForces = function (that) {
        if (!this.center || !that.center) {
            return;
        }
        var isClipping = false;
        for (var _i = 0, _a = this.hull; _i < _a.length; _i++) {
            var thisNode = _a[_i];
            if (!thisNode.physics) {
                continue;
            }
            var nodeThatCenter = that.center.add(thisNode.physics.pos.scale(-1));
            if (nodeThatCenter.magnitude() > that.hullRadius) {
                continue;
            }
            var hullCollision = that.inHull(thisNode.physics.pos);
            if (hullCollision && hullCollision[0] && hullCollision[1]) {
                isClipping = true;
                break;
            }
        }
        for (var _b = 0, _c = that.hull; _b < _c.length; _b++) {
            var thatNode = _c[_b];
            if (!thatNode.physics) {
                continue;
            }
            var nodeThisCenter = this.center.add(thatNode.physics.pos.scale(-1));
            if (nodeThisCenter.magnitude() > this.hullRadius) {
                continue;
            }
            var hullCollision = this.inHull(thatNode.physics.pos);
            if (hullCollision && hullCollision[0] && hullCollision[1]) {
                isClipping = true;
                break;
            }
        }
        if (isClipping) {
            this.forces.push([this.center.add(that.center.scale(-1)).unit().scale(ENV.DS_MAX_COLLISION_REPULSIVE_FORCE
                    * Math.min(this.mass, that.mass)), ENV.ForceType.REPULSIVE, that.ds]);
            that.forces.push([that.center.add(this.center.scale(-1)).unit().scale(ENV.DS_MAX_COLLISION_REPULSIVE_FORCE
                    * Math.min(this.mass, that.mass)), ENV.ForceType.REPULSIVE, this.ds]);
            for (var _d = 0, _e = Object.values(this.ds.nodes); _d < _e.length; _d++) {
                var thisNode = _e[_d];
                if (!thisNode.physics) {
                    continue;
                }
                var newThisForces = [];
                for (var _f = 0, _g = thisNode.physics.forces; _f < _g.length; _f++) {
                    var force = _g[_f];
                    if (!force[2] || force[2].ds !== that.ds) {
                        newThisForces.push(force);
                    }
                }
                thisNode.physics.forces = newThisForces;
            }
            for (var _h = 0, _j = Object.values(that.ds.nodes); _h < _j.length; _h++) {
                var thatNode = _j[_h];
                if (!thatNode.physics) {
                    continue;
                }
                var newThatForces = [];
                for (var _k = 0, _l = thatNode.physics.forces; _k < _l.length; _k++) {
                    var force = _l[_k];
                    if (!force[2] || force[2].ds !== this.ds) {
                        newThatForces.push(force);
                    }
                }
                thatNode.physics.forces = newThatForces;
            }
        }
    };
    DSPhysics.prototype.addDrag = function () {
        if (this.velo.magnitude() < 1) {
            this.forces.push([this.velo.scale(-ENV.DS_DRAG_COEFF * this.mass), ENV.ForceType.DRAG]);
        }
        else {
            this.forces.push([this.velo.pow(2).abs().parallelProduct(this.velo.sign().scale(-ENV.DS_DRAG_COEFF * this.mass)), ENV.ForceType.DRAG]);
        }
    };
    DSPhysics.prototype.resetForces = function () {
        this.forces = [];
    };
    DSPhysics.prototype.incrementPhysics = function (dt, physicsSpeed, printForces) {
        if (physicsSpeed === void 0) { physicsSpeed = ENV.PHYSICS_SPEED; }
        if (printForces === void 0) { printForces = ENV.PRINT_DS_FORCES; }
        dt = Math.min(dt, ENV.MAX_DT);
        var netForce = new V2_1.V2(0, 0);
        if (printForces) {
            console.group("DS" + this.ds.id + " forces:");
        }
        for (var _i = 0, _a = this.forces; _i < _a.length; _i++) {
            var force = _a[_i];
            netForce = netForce.add(force[0]);
            if (printForces) {
                console.log(force[0].toString() + "  " + force[1]);
            }
        }
        if (printForces) {
            console.groupEnd();
        }
        if (this.velo.magnitude() < .01 && netForce.magnitude() < ENV.DS_STATIC_FRIC_COEFF) {
            this.accel = new V2_1.V2(0, 0);
            this.velo = new V2_1.V2(0, 0);
        }
        else {
            this.accel = netForce.scale(1 / this.mass);
        }
        this.velo = this.velo.add(this.accel.scale(dt * physicsSpeed));
        if (this.velo.magnitude() > ENV.MAX_SPEED) {
            this.velo = this.velo.scale(ENV.MAX_SPEED / this.velo.magnitude());
        }
        for (var _b = 0, _c = Object.values(this.ds.nodes); _b < _c.length; _b++) {
            var node = _c[_b];
            node.physics.pos = node.physics.pos.add(this.velo.scale(dt * physicsSpeed));
        }
    };
    DSPhysics.prototype.translateNodes = function (p) {
        for (var _i = 0, _a = Object.values(this.ds.nodes); _i < _a.length; _i++) {
            var node = _a[_i];
            if (!node.physics) {
                continue;
            }
            node.physics.pos = node.physics.pos.add(p);
        }
        this.updateHull();
    };
    return DSPhysics;
}());
exports.DSPhysics = DSPhysics;
