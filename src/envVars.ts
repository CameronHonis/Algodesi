// RENDER ---------------------------------------------------------
export type ForceTypeKeys = keyof typeof ForceType;
export const NODE_POS_LABELS: boolean = false;
export const NODE_POS_LABELS_WHITELIST: Set<number> = new Set([]);
export const NODE_FORCES_VECTORS: boolean = false;
export const FORCES_VECTORS_WHITELIST: Set<ForceType> = new Set([]);
export const NODE_FORCES_VECTORS_WHITELIST: Set<number> = new Set([]);
export const NODE_FORCES_VECTORS_COLORS: {[key in ForceTypeKeys]: string} = {
  REPULSIVE: "rgba(255,255,0,1)",
  DRAG: "rgba(255,0,0,1)",
  BOND_ANGLE: "rgba(0,255,0,1)",
  BOND_LENGTH: "rgba(0,0,255,1)",
}
export const MESSAGE_DURATION: number = 5;

// PHYSICS ----------------------------------------------------------
// clock
export const PHYSICS_CLOCK_MS: number = 20;
export const HULL_UPDATE_CLOCK_MS: number = 1000;
export const PRIORITIES_CLOCK_MS: number = 1000;
// general physics
export const PHYSICS_PAUSED: boolean = false;
export const PHYSICS_SPEED: number = 1;
export const MAX_DT: number = .2;
export const MAX_SPEED: number = 20;
export const PRIORITY_RANGE: number = 5;
export enum ForceType {
  REPULSIVE = "REPULSIVE",
  DRAG = "DRAG",
  BOND_ANGLE = "BOND_ANGLE",
  BOND_LENGTH = "BOND_LENGTH",
}
// repulsive
export const NODE_MAX_REPULSIVE_FORCE: number = 40;
export const NODE_REPULSIVE_COEFF: number = 10;
export const NODE_REPULSIVE_OFFSET: number = -2.5;
export const DS_COLLISION_REPULSION_COEFF: number = 100;
export const DS_MAX_COLLISION_REPULSIVE_FORCE: number = 100;
export const DS_NOCOLLIDE_REPULSIVE_COEFF: number = 20;
export const DS_MAX_NOCOLLIDE_REPULSIVE_FORCE: number = 20;
export const DS_MAX_REPULSIVE_DIS: number = 2;
// drag/friction
export const DS_DRAG_COEFF: number = 3;
export const DS_STATIC_FRIC_COEFF: number = 1;
export const NODE_DRAG_COEFF: number = 3;
export const NODE_STATIC_FRIC_COEFF: number = 1;
// bonds
export const BOND_BASE_LENGTH: number = 2;
export const BOND_LENGTH_COEFF: number = 400;
export const BOND_LENGTH_POW: number = 2;
export const BOND_ANGLE: number = 30;
export const BOND_ANGLE_COEFF: number = 200;

// DEBUGGING --------------------------------------------------------
export const HULL_TRIS_VISIBLE: boolean = false;
export const PRINT_COMPS_RERENDER: boolean = false;
export const PRINT_WINDOW_RERENDER: boolean = false;
export const PRINT_DS_FORCES: boolean = false;