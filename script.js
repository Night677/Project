let rnd = (l, u) => Math.random() * (u - l) + l;
let scene, camera, cursor, gun, player;
let bosss = [], animatronics = [], bullets = [];
let isShooting = false, isWalking = false, isReloading = false, isJumping = false;
let health = 100, score = 0, ammo = 30, wave = 1, maxWave = 30, maxHealth = 100, maxAmmo = 100;
let Boss = { template: "#Bosszombie", charge: "Mon_BlackDragon31_Btl_Atk01", scale: 0.65, speed: 0.1 };
let Zombie = { template: "#zombie", charge: "Walk", scale: 1.5, speed: 0.06 };
let robots = [Boss, Zombie];
let loopCounter = 0;

const walkKeys = new Set(['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
const jumpKey = ' ';

window.onload = function () {
    scene = document.querySelector("a-scene");
    camera = document.querySelector("a-camera");
    cursor = document.querySelector("a-cursor");
    gun = document.querySelector("#gun1");
    player = document.querySelector("#player");
    loop()
    console.log("Camera initial position:", camera.object3D.position);

    for (let z = 240; z > 20; z -= 15) {
        let x = rnd(-3, 3);
        let pz = z + rnd(-5, 5);
        animatronics.push(new Animatronic(x, 0.1, -pz));
      }
      for (let zombie of animatronics) {
        setInterval(() => {
            zombie.chase();
        }, 100); 
    }
   
    
    window.addEventListener("keydown", function (e) {
        if (walkKeys.has(e.key) && !isWalking && !isReloading) {
            isWalking = true;
            updateAnimation();
        } else if (e.key === 'r' && !isReloading) {
            isReloading = true;
            ammo = maxAmmo; // Refill ammo instantly
            updateAnimation();

          
            setTimeout(() => {
                console.log("Reloading animation finished, Ammo left:", ammo);
                isReloading = false;
                updateAnimation();
            }, 2000); 
        }
    });

    // Handle keyup events
    window.addEventListener("keyup", function (e) {
        if (walkKeys.has(e.key)) {
            isWalking = false;
            updateAnimation();
        }
    });

    // Handle mouse down (shooting)
    window.addEventListener('mousedown', function (e) {
        if (e.button === 0 && ammo > 0 && !isReloading) { // Left mouse button and has ammo and not reloading
            isShooting = true;
            updateAnimation();
            console.log("Shooting animation triggered");
            let bullet = new Bullet();
            bullet.shoot();
            ammo--;
        }
    });

    // Handle mouse up (stop shooting)
    window.addEventListener('mouseup', function (e) {
        if (e.button === 0) { // Left mouse button
            isShooting = false;
            updateAnimation();
            console.log("Stopped shooting");
        }
    });

  
};


window.reduceHealth = function(amount) {
    health -= amount;
    console.log(`Health reduced by ${amount}. Current health: ${health}`);
    if (health <= 0) {
        console.log("Player is dead");
       
    }
};


function updateAnimation() {
    if (isReloading) {
        gun.setAttribute('animation-mixer', "clip: Armature.003|reload; loop: once; timeScale: 1");
    } else if (isShooting) {
        gun.setAttribute('animation-mixer', "clip: Armature.003|shooting; loop: once; timeScale: 2");
    } else if (isWalking) {
        gun.setAttribute('animation-mixer', "clip: Armature.003|run cycle; loop: repeat; timeScale: 2");
    } else {
        gun.setAttribute('animation-mixer', "clip: Armature.003|idle; loop: repeat; timeScale: 1");
    }
}



function loop() {
    for (let bullet of bullets) {
        for (let zombie of animatronics) {
            if (distance(bullet, zombie.obj) < 1) {
                console.log("Zombie hit by bullet");
                bullet.setAttribute("visible", "false");
                zombie.die();
                bullets = bullets.filter(b => b !== bullet); // Remove bullet after hit
            }
        }
    }
    window.requestAnimationFrame(loop);
}





function distance(obj1, obj2) {
    let x1 = obj1.object3D.position.x;
    let y1 = obj1.object3D.position.y;
    let z1 = obj1.object3D.position.z;
    let x2 = obj2.object3D.position.x;
    let y2 = obj2.object3D.position.y;
    let z2 = obj2.object3D.position.z;

    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
}



