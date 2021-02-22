"use strict";
exports.__esModule = true;
exports.PRINT_DS_FORCES = exports.PRINT_WINDOW_RERENDER = exports.PRINT_COMPS_RERENDER = exports.HULL_TRIS_VISIBLE = exports.BOND_ANGLE_COEFF = exports.BOND_ANGLE = exports.BOND_LENGTH_POW = exports.BOND_LENGTH_COEFF = exports.BOND_BASE_LENGTH = exports.NODE_STATIC_FRIC_COEFF = exports.NODE_DRAG_COEFF = exports.DS_STATIC_FRIC_COEFF = exports.DS_DRAG_COEFF = exports.DS_MAX_REPULSIVE_DIS = exports.DS_MAX_NOCOLLIDE_REPULSIVE_FORCE = exports.DS_NOCOLLIDE_REPULSIVE_COEFF = exports.DS_MAX_COLLISION_REPULSIVE_FORCE = exports.DS_COLLISION_REPULSION_COEFF = exports.NODE_REPULSIVE_OFFSET = exports.NODE_REPULSIVE_COEFF = exports.NODE_MAX_REPULSIVE_FORCE = exports.ForceType = exports.PRIORITY_RANGE = exports.MAX_SPEED = exports.MAX_DT = exports.PHYSICS_SPEED = exports.PHYSICS_PAUSED = exports.PRIORITIES_CLOCK_MS = exports.HULL_UPDATE_CLOCK_MS = exports.PHYSICS_CLOCK_MS = exports.MESSAGE_DURATION = exports.NODE_FORCES_VECTORS_COLORS = exports.NODE_FORCES_VECTORS_WHITELIST = exports.FORCES_VECTORS_WHITELIST = exports.NODE_FORCES_VECTORS = exports.NODE_POS_LABELS_WHITELIST = exports.NODE_POS_LABELS = void 0;
exports.NODE_POS_LABELS = false;
exports.NODE_POS_LABELS_WHITELIST = new Set([]);
exports.NODE_FORCES_VECTORS = false;
exports.FORCES_VECTORS_WHITELIST = new Set([]);
exports.NODE_FORCES_VECTORS_WHITELIST = new Set([]);
exports.NODE_FORCES_VECTORS_COLORS = {
    REPULSIVE: "rgba(255,255,0,1)",
    DRAG: "rgba(255,0,0,1)",
    BOND_ANGLE: "rgba(0,255,0,1)",
    BOND_LENGTH: "rgba(0,0,255,1)"
};
exports.MESSAGE_DURATION = 5;
// PHYSICS ----------------------------------------------------------
// clock
exports.PHYSICS_CLOCK_MS = 20;
exports.HULL_UPDATE_CLOCK_MS = 1000;
exports.PRIORITIES_CLOCK_MS = 1000;
// general physics
exports.PHYSICS_PAUSED = false;
exports.PHYSICS_SPEED = 1;
exports.MAX_DT = .2;
exports.MAX_SPEED = 20;
exports.PRIORITY_RANGE = 5;
var ForceType;
(function (ForceType) {
    ForceType["REPULSIVE"] = "REPULSIVE";
    ForceType["DRAG"] = "DRAG";
    ForceType["BOND_ANGLE"] = "BOND_ANGLE";
    ForceType["BOND_LENGTH"] = "BOND_LENGTH";
})(ForceType = exports.ForceType || (exports.ForceType = {}));
// repulsive
exports.NODE_MAX_REPULSIVE_FORCE = 40;
exports.NODE_REPULSIVE_COEFF = 10;
exports.NODE_REPULSIVE_OFFSET = -2.5;
exports.DS_COLLISION_REPULSION_COEFF = 100;
exports.DS_MAX_COLLISION_REPULSIVE_FORCE = 100;
exports.DS_NOCOLLIDE_REPULSIVE_COEFF = 20;
exports.DS_MAX_NOCOLLIDE_REPULSIVE_FORCE = 20;
exports.DS_MAX_REPULSIVE_DIS = 2;
// drag/friction
exports.DS_DRAG_COEFF = 3;
exports.DS_STATIC_FRIC_COEFF = 1;
exports.NODE_DRAG_COEFF = 3;
exports.NODE_STATIC_FRIC_COEFF = 1;
// bonds
exports.BOND_BASE_LENGTH = 2;
exports.BOND_LENGTH_COEFF = 400;
exports.BOND_LENGTH_POW = 2;
exports.BOND_ANGLE = 30;
exports.BOND_ANGLE_COEFF = 200;
// DEBUGGING --------------------------------------------------------
exports.HULL_TRIS_VISIBLE = false;
exports.PRINT_COMPS_RERENDER = false;
exports.PRINT_WINDOW_RERENDER = false;
exports.PRINT_DS_FORCES = false;
