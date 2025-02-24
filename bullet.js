class Bullet {
    constructor() {
        
        this.scene = document.querySelector("a-scene");
        this.camera = document.querySelector("a-camera");


      
        this.obj = document.createElement("a-entity");
        this.obj.setAttribute("gltf-model", "#bullet");
        this.obj.setAttribute("scale", "0.01 0.01 0.01");
        this.obj.setAttribute("rotation", "0 0 0");
        this.obj.setAttribute("visible", "false");

      
        this.scene.append(this.obj);

        this.fire = false;
        this.speed = 10;
    }

    shoot() {



        this.fire = true;
        this.obj.setAttribute("visible", "true");

        
        const cameraWorldPos = new THREE.Vector3();
        this.camera.object3D.getWorldPosition(cameraWorldPos);

     
        const cameraForward = new THREE.Vector3();
        this.camera.object3D.getWorldDirection(cameraForward);

        
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(new THREE.Vector3(0, 1, 0), cameraForward);

        const startPosition = {
            x: cameraWorldPos.x,
            y: cameraWorldPos.y, 
            z: cameraWorldPos.z,
        };
        this.obj.setAttribute("position", startPosition);

        
        this.dx = cameraForward.x * this.speed;
        this.dy = cameraForward.y * this.speed;
        this.dz = cameraForward.z * this.speed  ;

       
        bullets.push(this);

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

                
                if (Math.abs(pos.x - this.camera.object3D.position.x) > 50 || Math.abs(pos.z - this.camera.object3D.position.z) > 50) {
                    this.obj.setAttribute("visible", "false");
                    clearInterval(interval);

                   
                    bullets.splice(bullets.indexOf(this), 1);
                    console.log("Bullet removed. Total bullets: " + bullets.length);
                }
            }, 50);
        }
    }
}
