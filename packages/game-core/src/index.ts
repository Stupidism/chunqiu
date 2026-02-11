// ============================================
// Chunqiu Game Core - Game Logic
// ============================================

// Map Generation
export {
  generateMap,
  calculateTileYields,
  getAdjacentTiles,
  getDistance,
  isValidPosition,
} from './mapGenerator';
export type { MapGenerationOptions } from './mapGenerator';

// Unit Logic
export {
  unitDefinitions,
  createUnit,
  calculateMovementCost,
  canMoveTo,
  getVisionRange,
  getVisibleTiles,
  calculateCombatDamage,
  canAttack,
  levelUpUnit,
  healUnit,
  resetUnitMovement,
} from './unitLogic';

// City Logic
export {
  buildingDefinitions,
  createCity,
  calculateCityYields,
  addBuilding,
  addToProductionQueue,
  removeFromProductionQueue,
  processCityProduction,
  processCityGrowth,
  expandCityBorders,
  toggleWorkedTile,
  getCityDefense,
  healCity,
  damageCity,
} from './cityLogic';
