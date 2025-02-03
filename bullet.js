class Bullet {
    constructor() {
        // Automatically fetch the scene and camera from the DOM
        this.scene = document.querySelector("a-scene");
        this.camera = document.querySelector("a-camera");

        if (!this.scene || !this.camera) {
            throw new Error("Scene or Camera not found. Ensure they exist in the DOM.");
        }

        // Create the bullet entity
        this.obj = document.createElement("a-entity");
        this.obj.setAttribute("gltf-model", "#bullet");
        this.obj.setAttribute("scale", "0.01 0.01 0.01");
        this.obj.setAttribute("rotation", "0 0 0");
        this.obj.setAttribute("visible", "false");

        // Append the bullet to the scene
        this.scene.appendChild(this.obj);

        this.fire = false;
        this.speed = 5; // Set the speed of the bullet
    }
    shoot() {
        this.fire = true;
        this.obj.setAttribute("visible", "true");
    
        // Get the camera's world position
        const cameraWorldPos = new THREE.Vector3();
        this.camera.object3D.getWorldPosition(cameraWorldPos);
    
        // Get the camera's forward direction
        const cameraForward = new THREE.Vector3();
        this.camera.object3D.getWorldDirection(cameraForward);
    
        // Get the camera's right direction
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(new THREE.Vector3(0, 1, 0), cameraForward).normalize();
    
        // Normalize the forward direction (ensures consistent scaling)
        cameraForward.normalize();
    
        // Set the bullet's starting position to the right side of the screen and lower it
        const startPosition = {
            x: cameraWorldPos.x + cameraRight.x * 1.5, // Offset to the right
            y: cameraWorldPos.y - .5, // Lower the bullet
            z: cameraWorldPos.z + cameraRight.z * 1.5,
        };
        this.obj.setAttribute("position", startPosition);
    
        // Set the movement direction of the bullet
        this.dx = cameraForward.x * this.speed;
        this.dy = cameraForward.y * this.speed;
        this.dz = cameraForward.z * this.speed;
    
        this.move();
    }
    move() {
        if (this.fire) {
            let interval = setInterval(() => {
                let pos = this.obj.getAttribute("position");
                pos.x += -this.dx;
                pos.y += -this.dy;
                pos.z += -this.dz;
                this.obj.setAttribute("position", pos);

                // Remove the bullet after it has traveled a certain distance
                if (Math.abs(pos.x - this.camera.object3D.position.x) > 50 || Math.abs(pos.z - this.camera.object3D.position.z) > 50) {
                    this.obj.setAttribute("visible", "false");
                    clearInterval(interval);
                }
            }, 50);
        }
    }
}