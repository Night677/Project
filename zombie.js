class Animatronic {
    constructor(x, y, z) {
      this.obj = document.createElement("a-entity");
      this.obj.setAttribute("gltf-model", "#zombie");
      this.obj.setAttribute("position", `${x} ${y} ${z}`);
      document.querySelector('a-scene').appendChild(this.obj);
  
      // Initialize the angle and speed
      this.angle = 0;
      this.model = {
        speed: .3, // Increase the speed as needed
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
      if (currentTime - this.lastAttackTime >= this.attackCooldown) {
        // Play the attack animation
        this.obj.setAttribute("animation-mixer", { clip: this.model.attack, timeScale: 1 });
        // Reduce player's health
        window.reduceHealth(5);
        // Update the last attack time
        this.lastAttackTime = currentTime;
      }
    }
  
    chase() {
      // Get the camera entity
      const camera = document.querySelector('[camera]');
      if (camera) {
        // Calculate the angle towards the camera
        this.angleTo(camera);
  
        // Check the distance to the camera
        const distanceToCamera = this.distanceTo(camera);
        if (distanceToCamera < 2) { // Adjust the distance threshold as needed
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

    // Method to reduce health and check for death
    takeDamage(damage) {
      this.health -= damage;
      if (this.health <= 0) {
        this.die();
      }
    }
  
    // Method to handle zombie death
    die() {
      clearInterval(this.chaseInterval); // Stop chasing
      this.obj.setAttribute("animation-mixer", {
        clip: this.model.die,
        timeScale: 1,
        loop: "once"
      });
      // Optionally, remove the zombie from the scene after the death animation
      setTimeout(() => {
        this.obj.parentNode.removeChild(this.obj);
      }, 2000); // Adjust the timeout to match the length of the death animation
    }
  }
  
  // Wait for the DOM to be fully loaded before creating an instance of the Animatronic class
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.zombie) {
      window.zombie = new Animatronic(0, 0, 0); // Pass initial position (x, y, z)
      console.log("Zombie created and chasing the camera");
    }
  });