class Animatronic {
    constructor(x, y, z) {
        this.obj = document.createElement("a-entity");
        this.obj.setAttribute("gltf-model", "#zombie");
        this.obj.setAttribute("scale", "1.2 1 1.2");
        this.obj.setAttribute("position", `${x} ${y} ${z}`);
        document.querySelector('a-scene').appendChild(this.obj);

      
        this.angle = 0;
        this.damage = 10; 
        this.health = 30;
        this.model = {
            die: "FallingBack",
            speed: .1, 
            walk: "Run_InPlace",
            idle: "Idle",
            attack: "Attack" 
        };

        
        this.chase = this.chase.bind(this);

        
        this.lastAttackTime = 0;
        this.attackCooldown = 2000;

        
        this.obj.addEventListener('model-loaded', () => {
            
            this.chaseInterval = setInterval(this.chase, 100);
        });
    }

    angleTo(that) {
        let dx = that.object3D.position.x - this.obj.object3D.position.x;
        let dz = that.object3D.position.z - this.obj.object3D.position.z;

        this.angle = Math.atan2(dx, dz); 
        this.obj.object3D.rotation.y = this.angle; 
    }

    forward() {
        let dx = this.model.speed * Math.sin(this.angle);
        let dz = this.model.speed * Math.cos(this.angle);
        this.obj.object3D.position.x += dx;
        this.obj.object3D.position.z += dz;

       
        const pos = this.obj.object3D.position;
        this.obj.setAttribute("position", `${pos.x} ${pos.y} ${pos.z}`);

        this.obj.setAttribute("animation-mixer", { clip: this.model.walk, timeScale: 0.75 });
    }

    stop() {
       
        this.obj.setAttribute("animation-mixer", { clip: this.model.idle, timeScale: 1 });
    }

    attack() {
        const currentTime = Date.now();
        if (currentTime - this.lastAttackTime > this.attackCooldown) {
            console.log("Zombie is attacking!");
            if (this.obj.getAttribute("visible") !== "false" && this.health > 0) {
              
                console.log("Camera health reduced!");
                this.obj.setAttribute("animation-mixer", { clip: this.model.attack, timeScale: 1 });
            }
            this.lastAttackTime = currentTime;
        }
    }

    chase() {
        const camera = document.querySelector('[camera]');
        if (camera) {
            this.angleTo(camera);
            const distanceToCamera = this.distanceTo(camera);
            if (distanceToCamera < 2) {
                this.attack();
            } else {
                this.forward();
            }
        }
    }

    distanceTo(that) {
        let dx = that.object3D.position.x - this.obj.object3D.position.x;
        let dz = that.object3D.position.z - this.obj.object3D.position.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    takeDamage(damage) {
        this.health -= damage;
        console.log(`Zombie health: ${this.health}`);
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        console.log("Zombie has died!");
        clearInterval(this.chaseInterval);
        this.model = {
            die: "FallingBack",
            speed: .0,
            walk: "FallingBack", 
            idle: "Idle",
            attack: "Attack" 
        };
       
        setTimeout(() => {
            this.obj.setAttribute("visible", "false");
            setTimeout(() => {
                if (this.obj.parentNode) {
                    this.obj.parentNode.removeChild(this.obj);
                }
            }, 500); 
        }, 1000); 
    }
}
