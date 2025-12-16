export default class NovaLaser {
    constructor(x, y, directionX, directionY) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.speed = 15;
        this.width = 8;
        this.height = 8;
        this.damage = 25;
        this.trail = [];
        this.glowPulse = 0;
    }

    update() {
        // Move
        this.x += this.directionX * this.speed;
        this.y += this.directionY * this.speed;

        // Add trail
        this.trail.push({
            x: this.x,
            y: this.y,
            alpha: 1
        });

        // Update trail
        this.trail = this.trail.filter(t => {
            t.alpha -= 0.05;
            return t.alpha > 0;
        });

        // Limit trail length
        if (this.trail.length > 30) {
            this.trail.shift();
        }

        this.glowPulse += 0.2;
    }

    draw(ctx) {
        ctx.save();

        // Draw trail
        this.trail.forEach((t, i) => {
            const gradient = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, 8);
            gradient.addColorStop(0, `rgba(255, 0, 255, ${t.alpha})`);
            gradient.addColorStop(0.5, `rgba(0, 255, 255, ${t.alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(255, 0, 255, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw laser line from start to current position
        const pulse = Math.sin(this.glowPulse) * 0.3 + 0.7;
        
        ctx.strokeStyle = `rgba(255, 0, 255, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        // Draw laser head
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 30 * pulse;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isOffScreen(width, height) {
        return this.x < -50 || this.x > width + 50 || 
               this.y < -50 || this.y > height + 50;
    }

    checkCollision(entity) {
        const dx = this.x - (entity.x + entity.width / 2);
        const dy = this.y - (entity.y + entity.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.width / 2 + Math.min(entity.width, entity.height) / 2);
    }
}
