import Player from './Player.js';
import Enemy from './Enemy.js';
import Projectile from './Projectile.js';
import EnemyProjectile from './EnemyProjectile.js';
import InputHandler from './InputHandler.js';
import Particle, { ExplosionParticle, ProjectileTrail } from './Particle.js';
import ScreenShake from './ScreenShake.js';
import Light, { LightingSystem } from './Light.js';
import PowerUp from './PowerUp.js';

export default class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.init();
        
        // Start game loop
        this.lastTime = 0;
        this.animate(0);
    }

    init() {
        this.player = new Player(this.width / 2, this.height / 2);
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.particles = [];
        this.powerUps = [];
        this.input = new InputHandler();
        this.screenShake = new ScreenShake();
        this.lightingSystem = new LightingSystem();
        
        this.score = 0;
        this.level = 1;
        this.enemiesKilled = 0;
        this.enemiesPerLevel = 10;
        this.gameOver = false;
        this.paused = false;
        this.levelTransition = false;
        this.levelTransitionTimer = 0;
        this.levelTransitionDuration = 180; // 3 seconds
        this.deathAnimation = false;
        this.deathAnimationTimer = 0;
        this.deathAnimationDuration = 120; // 2 seconds
        
        // Accuracy tracking
        this.shotsFired = 0;
        this.shotsHit = 0;
        
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 120; // Spawn enemy every 2 seconds at 60fps
        this.powerUpSpawnTimer = 0;
        this.powerUpSpawnInterval = 600; // Spawn power-up every 10 seconds
        
        // Power-up states
        this.multiShotActive = false;
        this.multiShotTimer = 0;
        this.multiShotDuration = 300; // 5 seconds at 60fps
        
        // Setup shooting
        this.input.setupMouseListeners(this.canvas, (x, y) => this.shoot(x, y));
        
        // Add player light
        this.playerLight = new Light(
            this.player.getCenterX(), 
            this.player.getCenterY(), 
            150, 
            'rgba(0, 255, 0, 0.3)'
        );
        this.lightingSystem.addLight(this.playerLight);
    }

    reset() {
        this.init();
    }
    
    updateUI() {
        // Update HTML elements
        const levelDisplay = document.getElementById('levelDisplay');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const healthBar = document.getElementById('healthBar');
        const killsDisplay = document.getElementById('killsDisplay');
        const accuracyDisplay = document.getElementById('accuracyDisplay');
        const accuracyPhrase = document.getElementById('accuracyPhrase');
        const statsSmall = document.getElementById('statsSmall');
        const multishotPanel = document.getElementById('multishotPanel');
        const multishotProgress = document.getElementById('multishotProgress');
        
        if (levelDisplay) levelDisplay.textContent = `>> ${this.level}`;
        if (scoreDisplay) scoreDisplay.textContent = this.score;
        if (killsDisplay) killsDisplay.textContent = `${this.enemiesKilled} / ${this.enemiesPerLevel}`;
        
        // Health bar
        if (healthBar) {
            const healthPercent = this.player.health / 100;
            healthBar.style.width = `${healthPercent * 100}%`;
            if (healthPercent > 0.6) {
                healthBar.style.background = '#00ff00';
            } else if (healthPercent > 0.3) {
                healthBar.style.background = '#ffff00';
            } else {
                healthBar.style.background = '#ff0000';
            }
        }
        
        // Accuracy
        const accuracy = this.getAccuracy();
        const phrase = this.getAccuracyPhrase(accuracy);
        if (accuracyDisplay) accuracyDisplay.textContent = `${accuracy}%`;
        if (accuracyPhrase) {
            accuracyPhrase.textContent = `[[ ${phrase} ]]`;
            if (accuracy === 69) {
                accuracyPhrase.style.color = '#ff69b4';
            } else if (accuracy >= 85) {
                accuracyPhrase.style.color = '#ff00ff';
            } else if (accuracy >= 65) {
                accuracyPhrase.style.color = '#00ff00';
            } else {
                accuracyPhrase.style.color = '#ffffff';
            }
        }
        if (statsSmall) statsSmall.textContent = `${this.shotsHit}/${this.shotsFired} hits`;
        
        // Multi-shot
        if (multishotPanel && multishotProgress) {
            if (this.multiShotActive) {
                multishotPanel.style.display = 'block';
                const progress = (this.multiShotTimer / this.multiShotDuration) * 100;
                multishotProgress.style.width = `${progress}%`;
            } else {
                multishotPanel.style.display = 'none';
            }
        }
    }
    
    getAccuracy() {
        if (this.shotsFired === 0) return 0;
        return Math.floor((this.shotsHit / this.shotsFired) * 100);
    }
    
    getAccuracyPhrase(accuracy) {
        if (accuracy === 69) return 'NICE';
        if (accuracy >= 95) return 'GODLIKE';
        if (accuracy >= 85) return 'INSANE';
        if (accuracy >= 75) return 'good... ig';
        if (accuracy >= 65) return 'skibidi';
        if (accuracy >= 50) return 'bro.. nah';
        if (accuracy >= 35) return 'just give up';
        if (accuracy >= 20) return 'so bad lol';
        return 'pathetic';
    }

    shoot(targetX, targetY) {
        if (!this.gameOver && !this.paused) {
            if (this.multiShotActive) {
                // Triple shot
                const angles = [-0.3, 0, 0.3]; // Spread angles
                angles.forEach(angleOffset => {
                    const dx = targetX - this.player.getCenterX();
                    const dy = targetY - this.player.getCenterY();
                    const angle = Math.atan2(dy, dx) + angleOffset;
                    const distance = 500; // arbitrary distance for direction
                    const newTargetX = this.player.getCenterX() + Math.cos(angle) * distance;
                    const newTargetY = this.player.getCenterY() + Math.sin(angle) * distance;
                    
                    const projectile = new Projectile(
                        this.player.getCenterX(),
                        this.player.getCenterY(),
                        newTargetX,
                        newTargetY
                    );
                    this.projectiles.push(projectile);
                    this.shotsFired++;
                });
            } else {
                // Normal single shot
                const projectile = new Projectile(
                    this.player.getCenterX(),
                    this.player.getCenterY(),
                    targetX,
                    targetY
                );
                this.projectiles.push(projectile);
                this.shotsFired++;
            }
            
            // Add muzzle flash particles
            for (let i = 0; i < 5; i++) {
                this.particles.push(new Particle(
                    this.player.getCenterX(),
                    this.player.getCenterY(),
                    '#ffff00'
                ));
            }
        }
    }

    spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: // Top
                x = Math.random() * this.width;
                y = -30;
                break;
            case 1: // Right
                x = this.width + 30;
                y = Math.random() * this.height;
                break;
            case 2: // Bottom
                x = Math.random() * this.width;
                y = this.height + 30;
                break;
            case 3: // Left
                x = -30;
                y = Math.random() * this.height;
                break;
        }
        
        // Choose enemy type based on level
        let type = 'dumb';
        const rand = Math.random();
        
        if (this.level >= 3) {
            // Level 3+: all types
            if (rand < 0.33) type = 'dumb';
            else if (rand < 0.66) type = 'smart';
            else type = 'teleport';
        } else if (this.level >= 2) {
            // Level 2: dumb and smart
            type = rand < 0.6 ? 'dumb' : 'smart';
        }
        // Level 1: only dumb
        
        this.enemies.push(new Enemy(x, y, 30, 30, type));
    }

    spawnPowerUp() {
        const x = Math.random() * (this.width - 40) + 20;
        const y = Math.random() * (this.height - 40) + 20;
        const type = Math.random() < 0.5 ? 'health' : 'multishot';
        this.powerUps.push(new PowerUp(x, y, type));
    }
    
    startLevelTransition() {
        this.levelTransition = true;
        this.levelTransitionTimer = 0;
        this.enemies = [];
        this.enemyProjectiles = [];
        this.projectiles = [];
        
        // Celebration particles
        for (let i = 0; i < 100; i++) {
            this.particles.push(new Particle(
                this.width / 2,
                this.height / 2,
                ['#ffff00', '#00ff00', '#00ffff', '#ff00ff'][Math.floor(Math.random() * 4)]
            ));
        }
    }
    
    startDeathAnimation() {
        this.deathAnimation = true;
        this.deathAnimationTimer = 0;
        
        // Death explosion particles
        for (let i = 0; i < 50; i++) {
            this.particles.push(new ExplosionParticle(
                this.player.getCenterX(),
                this.player.getCenterY()
            ));
        }
        
        this.screenShake.shake(30, 40);
    }

    update() {
        // Check for reset
        if (this.input.consumeResetPress()) {
            this.reset();
            return;
        }
        
        // Check for pause
        if (this.input.consumePausePress()) {
            this.paused = !this.paused;
        }
        
        if (this.paused) return;
        
        // Handle death animation
        if (this.deathAnimation) {
            this.deathAnimationTimer++;
            this.screenShake.update();
            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.isDead());
            
            if (this.deathAnimationTimer >= this.deathAnimationDuration) {
                this.gameOver = true;
                this.deathAnimation = false;
            }
            return;
        }
        
        // Handle level transition
        if (this.levelTransition) {
            this.levelTransitionTimer++;
            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.isDead());
            
            if (this.levelTransitionTimer >= this.levelTransitionDuration) {
                this.levelTransition = false;
                // Increase difficulty
                this.enemySpawnInterval = Math.max(40, this.enemySpawnInterval - 10);
            }
            return;
        }
        
        if (this.gameOver) return;

        // Update screen shake
        this.screenShake.update();

        // Update player
        this.player.update(this.input, this.width, this.height);
        
        // Update player light
        this.playerLight.update(this.player.getCenterX(), this.player.getCenterY());

        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.player.getCenterX(), this.player.getCenterY(), this.projectiles);
            
            // Smart enemies shoot
            if (enemy.shouldShoot()) {
                const enemyProj = new EnemyProjectile(
                    enemy.getCenterX(),
                    enemy.getCenterY(),
                    this.player.getCenterX(),
                    this.player.getCenterY()
                );
                this.enemyProjectiles.push(enemyProj);
            }
            
            // Check collision with player
            if (enemy.checkCollision(this.player)) {
                if (this.player.takeDamage(enemy.damage)) {
                    this.startDeathAnimation();
                }
            }
        });
        
        // Update enemy projectiles
        this.enemyProjectiles = this.enemyProjectiles.filter(proj => {
            proj.update();
            
            // Remove if off screen
            if (proj.isOffScreen(this.width, this.height)) {
                return false;
            }
            
            // Check collision with player
            if (proj.checkCollision(this.player)) {
                if (this.player.takeDamage(proj.damage)) {
                    this.startDeathAnimation();
                }
                return false;
            }
            
            return true;
        });

        // Update projectiles
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update();
            
            // Add trail particles
            if (Math.random() < 0.5) {
                this.particles.push(new ProjectileTrail(projectile.x, projectile.y));
            }
            
            // Remove if off screen
            if (projectile.isOffScreen(this.width, this.height)) {
                return false;
            }
            
            // Check collision with enemies
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                if (projectile.checkCollision(this.enemies[i])) {
                    this.shotsHit++; // Track hit - counts every shot that connects
                    
                    if (this.enemies[i].takeDamage(projectile.damage)) {
                        const enemy = this.enemies[i];
                        
                        // Create explosion
                        for (let j = 0; j < 30; j++) {
                            this.particles.push(new ExplosionParticle(
                                enemy.getCenterX(),
                                enemy.getCenterY()
                            ));
                        }
                        
                        // Screen shake - MORE INTENSE!
                        this.screenShake.shake(20, 25);
                        
                        // Add explosion light
                        const explosionLight = new Light(
                            enemy.getCenterX(),
                            enemy.getCenterY(),
                            200,
                            'rgba(255, 100, 0, 0.8)'
                        );
                        this.lightingSystem.addLight(explosionLight);
                        setTimeout(() => {
                            this.lightingSystem.removeLight(explosionLight);
                        }, 300);
                        
                        this.enemies.splice(i, 1);
                        this.score += 10;
                        this.enemiesKilled++;
                        
                        // Check for level up
                        if (this.enemiesKilled >= this.enemiesPerLevel) {
                            this.level++;
                            this.enemiesKilled = 0;
                            this.enemiesPerLevel += 5; // More enemies needed each level
                            this.startLevelTransition();
                        }
                    }
                    return false; // Remove projectile
                }
            }
            
            return true;
        });

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return !particle.isDead();
        });

        // Update power-ups
        this.powerUps.forEach(powerUp => powerUp.update());

        // Check power-up collisions
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            if (this.powerUps[i].checkCollision(this.player)) {
                const powerUp = this.powerUps[i];
                
                if (powerUp.type === 'health') {
                    // Heal player
                    this.player.health = Math.min(100, this.player.health + 30);
                    
                    // Healing particles
                    for (let j = 0; j < 20; j++) {
                        this.particles.push(new Particle(
                            powerUp.getCenterX(),
                            powerUp.getCenterY(),
                            '#00ff00'
                        ));
                    }
                } else if (powerUp.type === 'multishot') {
                    // Activate multi-shot
                    this.multiShotActive = true;
                    this.multiShotTimer = this.multiShotDuration;
                    
                    // Power-up particles
                    for (let j = 0; j < 20; j++) {
                        this.particles.push(new Particle(
                            powerUp.getCenterX(),
                            powerUp.getCenterY(),
                            '#ff00ff'
                        ));
                    }
                }
                
                this.powerUps.splice(i, 1);
            }
        }

        // Update multi-shot timer
        if (this.multiShotActive) {
            this.multiShotTimer--;
            if (this.multiShotTimer <= 0) {
                this.multiShotActive = false;
            }
        }

        // Spawn enemies
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
            
            // Gradually increase difficulty
            if (this.enemySpawnInterval > 60) {
                this.enemySpawnInterval -= 1;
            }
        }

        // Spawn power-ups
        this.powerUpSpawnTimer++;
        if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
            this.spawnPowerUp();
            this.powerUpSpawnTimer = 0;
        }
    }

    draw() {
        // Apply screen shake
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-this.screenShake.x, -this.screenShake.y, this.width, this.height);

        // Draw particles (behind)
        this.particles.forEach(particle => particle.draw(this.ctx));

        // Draw projectiles
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));
        
        // Draw enemy projectiles
        this.enemyProjectiles.forEach(proj => proj.draw(this.ctx));

        // Draw enemies with lights
        this.enemies.forEach(enemy => {
            enemy.draw(this.ctx);
            
            // Add enemy light
            const enemyLight = new Light(
                enemy.getCenterX(),
                enemy.getCenterY(),
                80,
                'rgba(255, 0, 0, 0.2)'
            );
            enemyLight.draw(this.ctx);
        });

        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            powerUp.draw(this.ctx);
            
            // Add power-up light
            const powerUpLight = new Light(
                powerUp.getCenterX(),
                powerUp.getCenterY(),
                100,
                powerUp.type === 'health' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 0, 255, 0.3)'
            );
            powerUpLight.draw(this.ctx);
        });

        // Draw player (unless in death animation)
        if (!this.deathAnimation) {
            this.player.draw(this.ctx);
        }
        
        // Draw lighting system
        this.lightingSystem.draw(this.ctx, this.width, this.height);
        
        this.ctx.restore();

        // Update HTML UI elements
        this.updateUI();
        
        // Level transition overlay
        if (this.levelTransition) {
            const progress = this.levelTransitionTimer / this.levelTransitionDuration;
            const alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
            
            this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.7})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            
            // Glitch effect border
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(this.width / 2 - 250, this.height / 2 - 100, 500, 150);
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(this.width / 2 - 253, this.height / 2 - 103, 506, 156);
            
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 72px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#00ff00';
            this.ctx.fillText(`>> LEVEL ${this.level} <<`, this.width / 2, this.height / 2 - 20);
            this.ctx.shadowBlur = 0;
            this.ctx.font = 'bold 36px Arial';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText('! GET READY !', this.width / 2, this.height / 2 + 40);
            this.ctx.restore();
            this.ctx.textAlign = 'left';
        }

        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(this.width / 2 - 200, this.height / 2 - 80, 400, 160);
            
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 56px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00ff00';
            this.ctx.fillText('|| PAUSED ||', this.width / 2, this.height / 2);
            this.ctx.shadowBlur = 0;
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText('» ESC / P = resume', this.width / 2, this.height / 2 + 40);
            this.ctx.fillText('» R = restart', this.width / 2, this.height / 2 + 70);
            this.ctx.textAlign = 'left';
        }

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Red border
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(this.width / 2 - 250, this.height / 2 - 120, 500, 240);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(this.width / 2 - 253, this.height / 2 - 123, 506, 246);
            
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 72px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = '#ff0000';
            this.ctx.fillText('×× GAME OVER ××', this.width / 2, this.height / 2 - 30);
            this.ctx.shadowBlur = 0;
            
            this.ctx.font = 'bold 28px Arial';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText(`LEVEL ${this.level} // SCORE ${this.score}`, this.width / 2, this.height / 2 + 20);
            
            const finalAccuracy = this.getAccuracy();
            const finalPhrase = this.getAccuracyPhrase(finalAccuracy);
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillText(`ACCURACY: ${finalAccuracy}% [${finalPhrase}]`, this.width / 2, this.height / 2 + 60);
            
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText('» Press R to restart «', this.width / 2, this.height / 2 + 100);
            this.ctx.textAlign = 'left';
        }
    }

    animate(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update();
        this.draw();

        requestAnimationFrame((time) => this.animate(time));
    }
}
