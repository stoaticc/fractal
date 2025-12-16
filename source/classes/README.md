# Classes Folder Structure

This folder contains all game classes organized by category for better maintainability.

## 📁 Folder Organization

### `/bosses`

Boss enemy classes with complex AI and special abilities

-   `Mage.js` - Purple magic boss with teleport, walls, push/pull
-   `Nova.js` - Chaotic glitch boss with lasers, teleportation, reality-warping

### `/entities`

Player and basic enemy entities

-   `Player.js` - Player character with inventory and movement
-   `Enemy.js` - Basic enemy types (dumb, medium, smart, teleport)
-   `Wall.js` - Mage-summoned wall obstacles

### `/projectiles`

All projectile types

-   `Projectile.js` - Player projectiles
-   `EnemyProjectile.js` - Enemy projectiles
-   `NovaLaser.js` - Nova boss lightning lasers

### `/items`

Collectibles, powerups, and usable items

-   `PowerUp.js` - Health and multi-shot powerups
-   `Bomb.js` - Falling bombs
-   `PlaceableBomb.js` - Player-placed bombs
-   `ShockCrystal.js` - Mage drop, triggers shockwave
-   `Star.js` - Bouncing killer star
-   `StarOrb.js` - Purchasable star powerup (80 XP)
-   `XPOrb.js` - Experience point collectibles

### `/effects`

Visual effects and particle systems

-   `Particle.js` - Particle effects (ExplosionParticle, ProjectileTrail)
-   `ScreenShake.js` - Screen shake effect system
-   `Light.js` - Lighting system and light sources
-   `FirePatch.js` - Fire hazard patches

### `/systems`

Core game systems

-   `InputHandler.js` - Keyboard and mouse input handling

### `/utils`

Utility classes and helpers

-   `DeathMessages.js` - Hilarious death message generator

### Root Level

-   `Game.js` - Main game loop and state management (2000+ lines)
-   `index.js` - Entry point

## 🎮 Import Examples

```javascript
// Organized imports in Game.js
import Player from "./entities/Player.js";
import Mage from "./bosses/Mage.js";
import Projectile from "./projectiles/Projectile.js";
import PowerUp from "./items/PowerUp.js";
import ScreenShake from "./effects/ScreenShake.js";
import InputHandler from "./systems/InputHandler.js";
import DeathMessages from "./utils/DeathMessages.js";
```

## 📝 Notes

-   Game.js remains in the root as it's the central orchestrator
-   All imports use relative paths from the `classes/` folder
-   No circular dependencies between categories
