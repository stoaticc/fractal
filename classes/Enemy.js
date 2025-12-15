export default class Enemy {
    constructor(x, y, width = 30, height = 30, type = 'dumb') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'dumb', 'smart', 'teleport'
        this.speed = type === 'smart' ? 2.5 : type === 'teleport' ? 1.5 : 2;
        this.health = type === 'smart' ? 40 : type === 'teleport' ? 25 : 30;
        this.color = '#ff0000';
        this.damage = 10;
        
        // Smart enemy properties
        this.shootTimer = 0;
        this.shootInterval = 120; // Shoot every 2 seconds
        this.dodgeTimer = 0;
        this.dodgeDirection = { x: 0, y: 0 };
        
        // Teleport enemy properties
        this.teleportTimer = 0;
        this.teleportInterval = 180; // Teleport every 3 seconds
        this.teleportCooldown = 0;
        this.alpha = 1;
        this.isTeleporting = false;
        
        // Load sprite
        this.sprite = new Image();
        this.sprite.src = '../build/0.0.1/img/enemy.png';
        this.spriteLoaded = false;
        this.sprite.onload = () => {
            this.spriteLoaded = true;
        };
    }

    update(playerX, playerY, projectiles = []) {
        if (this.type === 'dumb') {
            // Dumb: just walks straight towards player
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            }
        } else if (this.type === 'smart') {
            // Smart: tries to dodge projectiles and shoots
            this.shootTimer++;
            
            // Check for nearby projectiles to dodge
            let shouldDodge = false;
            projectiles.forEach(proj => {
                const dx = proj.x - this.getCenterX();
                const dy = proj.y - this.getCenterY();
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 80) { // Dodge if projectile is close
                    shouldDodge = true;
                    // Dodge perpendicular to projectile direction
                    this.dodgeDirection.x = -dy / dist;
                    this.dodgeDirection.y = dx / dist;
                }
            });
            
            if (shouldDodge) {
                this.x += this.dodgeDirection.x * this.speed * 1.5;
                this.y += this.dodgeDirection.y * this.speed * 1.5;
            } else {
                // Move towards player (but not too close)
                const dx = playerX - this.getCenterX();
                const dy = playerY - this.getCenterY();
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 150) { // Keep distance
                    this.x += (dx / distance) * this.speed;
                    this.y += (dy / distance) * this.speed;
                }
            }
        } else if (this.type === 'teleport') {
            // Teleport enemy
            if (this.isTeleporting) {
                this.alpha -= 0.05;
                if (this.alpha <= 0) {
                    // Teleport to new position near player
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 100 + Math.random() * 150;
                    this.x = playerX + Math.cos(angle) * distance;
                    this.y = playerY + Math.sin(angle) * distance;
                    this.isTeleporting = false;
                    this.teleportCooldown = 60;
                }
            } else if (this.alpha < 1) {
                this.alpha += 0.05;
            } else {
                // Normal movement
                const dx = playerX - this.x;
                const dy = playerY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0) {
                    this.x += (dx / distance) * this.speed;
                    this.y += (dy / distance) * this.speed;
                }
                
                // Teleport timer
                this.teleportTimer++;
                if (this.teleportTimer >= this.teleportInterval && this.teleportCooldown === 0) {
                    this.isTeleporting = true;
                    this.teleportTimer = 0;
                }
                
                if (this.teleportCooldown > 0) {
                    this.teleportCooldown--;
                }
            }
        }
    }
    
    shouldShoot() {
        if (this.type === 'smart' && this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            return true;
        }
        return false;
    }

    draw(ctx) {
        if (this.spriteLoaded) {
            ctx.save();
            
            // Apply teleport alpha
            if (this.type === 'teleport') {
                ctx.globalAlpha = this.alpha;
            }
            
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff0000';
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
            
            // Draw type indicator (small dot)
            ctx.shadowBlur = 0;
            if (this.type === 'smart') {
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(this.x + this.width / 2 - 2, this.y - 5, 4, 4);
            } else if (this.type === 'teleport') {
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(this.x + this.width / 2 - 2, this.y - 5, 4, 4);
            }
            
            ctx.restore();
        } else {
            // Fallback to colored rectangle
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    getCenterX() {
        return this.x + this.width / 2;
    }

    getCenterY() {
        return this.y + this.height / 2;
    }

    checkCollision(entity) {
        return this.x < entity.x + entity.width &&
               this.x + this.width > entity.x &&
               this.y < entity.y + entity.height &&
               this.y + this.height > entity.y;
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
}
