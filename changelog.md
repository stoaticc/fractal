# 0.0.2 - YEAHHHHH (15th december)
## Level System
- Start at Level 1, progress by killing enemies
- Each level requires more kills (10, then 15, 20, etc.)
- Difficulty increases: spawn rate gets faster each level
- Level displayed in UI with kill progress tracker
## Three Enemy Types (same red sprite, tiny color indicators):
- Dumb (no dot) - Walks straight toward you (Level 1+)
- Smart (yellow dot) - Dodges your projectiles and shoots at you! (Level 2+)
- Teleport (cyan dot) - Fades out and teleports near you (Level 3+)
## Level Transition Animation
- Screen fades with colorful celebration particles
- "LEVEL X - GET READY!" message
- 3-second transition between levels
- All enemies/projectiles cleared
## Death Animation
- Massive explosion of 50+ particles
- Ultra-intense screen shake (30 intensity, 40 frames)
- Player sprite disappears
- 2-second dramatic death sequence before game over
## Smart Enemy AI
- Detects nearby projectiles and dodges perpendicular
- Maintains distance from player (150px)
- Shoots red projectiles every 2 seconds
- More health (40 HP vs 30)
## Teleport Enemy Mechanics
- Fades to transparent before teleporting
- Reappears near player (100-250px away)
- Teleports every 3 seconds
- Less health (25 HP) to balance
# Enhanced UI
- Level number
- Kill progress (X/Y enemies)
- Final level shown on game over