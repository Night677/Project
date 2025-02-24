class Animatronic {
    constructor(x, y, z) {
        this.obj = document.createElement("a-entity");
        this.obj.setAttribute("gltf-model", "#zombie");
        this.obj.setAttribute("scale", "1.3 1.2 1.3");
        this.obj.setAttribute("position", `${x} ${y} ${z}`);
        document.querySelector('a-scene').appendChild(this.obj);

        // Initialize the angle and speed
        this.angle = 0;
        this.damage = 10; 
        this.health = 30;
        this.model = {
            die: "FallingBack",
            speed: .1, // Increase the speed as needed
            walk: "Run_InPlace", // Replace with the actual walking animation clip name
            idle: "Idle", // Replace with the actual idle animation clip name
            attack: "Attack" // Replace with the actual attack animation clip name
        };

        // Bind the chase method to the current instance
        this.chase = this.chase.bind(this);

        // Initialize the last attack time
        this.lastAttackTime = 0;
        this.attackCooldown = 2000; // 2 seconds cooldown between attacks

        // Listen for the model to load
        this.obj.addEventListener('model-loaded', () => {
            // Call the chase method at regular intervals to make the zombie chase the camera
            this.chaseInterval = setInterval(this.chase, 100); // Adjust the interval as needed
        });
    }

    angleTo(that) {
        let dx = that.object3D.position.x - this.obj.object3D.position.x;
        let dz = that.object3D.position.z - this.obj.object3D.position.z;

        this.angle = Math.atan2(dx, dz); // Use atan2 for correct angle calculation
        this.obj.object3D.rotation.y = this.angle; // Update the zombie's rotation
    }

    forward() {
        let dx = this.model.speed * Math.sin(this.angle);
        let dz = this.model.speed * Math.cos(this.angle);
        this.obj.object3D.position.x += dx;
        this.obj.object3D.position.z += dz;

        // Sync the new position with the A-Frame position attribute
        const pos = this.obj.object3D.position;
        this.obj.setAttribute("position", `${pos.x} ${pos.y} ${pos.z}`);

        this.obj.setAttribute("animation-mixer", { clip: this.model.walk, timeScale: 0.75 });
    }

    stop() {
        // Stop the zombie's movement
        this.obj.setAttribute("animation-mixer", { clip: this.model.idle, timeScale: 1 });
    }

    attack() {
        const currentTime = Date.now();
        if (currentTime - this.lastAttackTime > this.attackCooldown) {
            console.log("Zombie is attacking!");
            if (this.obj.getAttribute("visible") !== "false" && this.health > 0) {
                // Reduce camera health
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
        clearInterval(this.chaseInterval); // Stop the chase interval
        this.model = {
            die: "FallingBack",
            speed: .0, // Increase the speed as needed
            walk: "FallingBack", // Replace with the actual walking animation clip name
            idle: "Idle", // Replace with the actual idle animation clip name
            attack: "Attack" // Replace with the actual attack animation clip name
        };
        // Remove the zombie from the scene after the death animation
        setTimeout(() => {
            this.obj.setAttribute("visible", "false");
            setTimeout(() => {
                if (this.obj.parentNode) {
                    this.obj.parentNode.removeChild(this.obj);
                }
            }, 500); // Additional delay to ensure visibility change
        }, 1000); // Adjust the timeout to match the length of the death animation
    }
}