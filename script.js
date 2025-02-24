let rnd = (l, u) => Math.random() * (u - l) + l;
let camera, cursor, gun, player;
let bosss = [], animatronics = [], bullets = [], fastzombies = [], foods = [], heals = [], ammos = [], waters = []; trees = []; rocks = [];
let isShooting = false, isWalking = false, isReloading = false, isJumping = false;
let health = 20, score = 0, bullet = 30, wave = 1, maxWave = 30, maxHealth = 100, maxAmmo = 100;
let food_collected = -3, ammo_collected = -3, health_collected = -3, water_collected = -3;
const walkKeys = new Set(['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
const jumpKey = ' ';

function updateHUD() {
    document.querySelector('#health').setAttribute('value', `Health: ${health}`);
    document.querySelector('#ammo').setAttribute('value', `Bullets: ${bullet}`);
}

window.onload = function () {
    scene = document.querySelector("a-scene");
    camera = document.querySelector("a-camera");
    cursor = document.querySelector("a-cursor");
    gun = document.querySelector("#gun1");
    q1 = document.getElementById("Quest1");
    q2 = document.getElementById("Quest2");
    q3 = document.getElementById("Quest3");
    q4 = document.getElementById("Quest4");

    // Initialize score display
    q1.setAttribute("value", `Quest #1: ${food_collected} / 50 food collected`);
    q2.setAttribute("value", `Quest #2: ${water_collected} / 100 water collected`);
    q3.setAttribute("value", `Quest #3: ${ammo_collected} / 20 ammo collected`);
    q4.setAttribute("value", `Quest #4: ${health_collected} / 5 health collected`);

    player = document.querySelector("#player");
    loop();
    console.log("Camera initial position:", camera.object3D.position);

    // Spawn animatronics every 10 seconds
    setInterval(() => {
        for (let i = 0; i < 1; i++) {
            let x = rnd(-100, 100);
            let z = rnd(-100, 100);
            animatronics.push(new Animatronic(x, 0, z));
        }
        for (let zombie of animatronics) {
            setInterval(() => {
                zombie.chase();
            }, 100);
        }
    }, 10000); // 10 seconds interval

    // Spawn fast zombies every 10 seconds
    setInterval(() => {
        for (let i = 0; i < 1; i++) {
            let x = rnd(-100, 100);
            let z = rnd(-100, 100);
            fastzombies.push(new FastZombie(x, 0.1, z));
        }
        for (let fastzom of fastzombies) {
            setInterval(() => {
                fastzom.chase();
            }, 100);
        }
    }, 30000); // 10 seconds interval

    window.addEventListener("keydown", function (e) {
        if (walkKeys.has(e.key) && !isWalking && !isReloading) {
            isWalking = true;
            updateAnimation();
        } else if (e.key === 'r' && !isReloading) {
            isReloading = true;
            bullet = maxAmmo; // Refill ammo instantly
            updateHUD();
            updateAnimation();
            setTimeout(() => {
                console.log("Reloading animation finished, Ammo left:", bullet);
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
        if (e.button === 0 && bullet > 0 && !isReloading) { // Left mouse button and has ammo and not reloading
            isShooting = true;
            updateAnimation();
            console.log("Shooting animation triggered");
            let newBullet = new Bullet();
            newBullet.shoot();
            bullet--; // Decrement the bullet count
            updateHUD();
            console.log(`Bullets left: ${bullet}`);
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

    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            let x = rnd(-100, 100);
            let z = rnd(-100, 100);
            foods.push(new food(x, 0, z));
        }, i * 1000); // Adjust the delay as needed
    }

    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            let x = rnd(-100, 100);
            let z = rnd(-100, 100);
            waters.push(new water(x, 0, z));
        }, i * 1000); // Adjust the delay as needed
    }

    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            let x = rnd(-100, 100);
            let z = rnd(-100, 100);
            ammos.push(new ammo(x, 0, z));
        }, i * 1000); // Adjust the delay as needed
    }

    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            let x = rnd(-100, 100);
            let z = rnd(-100, 100);
            heals.push(new heal(x, 0, z));
        }, i * 1000); // Adjust the delay as needed
    }

    for (let i = 0; i < 25; i++) {
        setTimeout(() => {
            let x = rnd(-100, -10);
            let z = rnd(-100, 100);
            trees.push(new tree(x, 0, z));
        }, i * 1000); // Adjust the delay as needed
    }

    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            let x = rnd(-100, -10);
            let z = rnd(-100, 100);
            rocks.push(new rock(x, -0.6, z));
        }, i * 1000); // Adjust the delay as needed
    }

    for (let i = 0; i < 25; i++) {
        setTimeout(() => {
            let x = rnd(10, 100);
            let z = rnd(-100, 100);
            trees.push(new tree(x, 0, z));
        }, i * 1000); // Adjust the delay as needed
    }

    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            let x = rnd(10, 100);
            let z = rnd(-100, 100);
            rocks.push(new rock(x, -0.6, z));
        }, i * 1000); // Adjust the delay as needed
    }

    setTimeout(loop, 5000);
};

window.reduceHealth = function(amount) {
    health -= amount;
    updateHUD();
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
    for (let i = fastzombies.length - 1; i >= 0; i--) {
        let zombiefast = fastzombies[i];      
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            if (distance(bullet.obj, zombiefast.obj) < 3) { 
                console.log("Fast Zombie hit! Calling takeDamage() function");
                zombiefast.takeDamage(10); // Pass the damage value
                bullets.splice(j, 1);
                if (bullet.obj.parentNode) {
                    bullet.obj.parentNode.removeChild(bullet.obj);
                }
                break; 
            }
        }
    }
    for (let i = animatronics.length - 1; i >= 0; i--) {
        let zombie = animatronics[i];   
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            if (distance(bullet.obj, zombie.obj) < 5) { 
                console.log("Zombie hit! Calling takeDamage() function");
                zombie.takeDamage(10);
                if (zombie.health <= 0) {
                    animatronics.splice(i, 1);
                }
                if (bullet.obj.parentNode) {
                    bullet.obj.parentNode.removeChild(bullet.obj);
                }
                break; 
            }
        }
    }
    
    for(let ammo of ammos){
        ammo.spin();
        if (distance(camera, ammo.obj) < 3 && ammo.available) {
            ammo.collect();
            q3.setAttribute("value", `Quest #3: ${ammo_collected} / 20 ammo collected`);
        }
    }
    for(let food of foods){
        food.spin();
        if (distance(camera, food.obj) < 3 && food.available) {
            food.collect();
            q1.setAttribute("value", `Quest #1: ${food_collected} / 25 food collected`);
        }
    }
    for(let heal of heals){
        heal.spin();
        if (distance(camera, heal.obj) < 3 && heal.available) {
            heal.collect();
            q4.setAttribute("value", `Quest #4: ${health_collected} / 5 health collected`);
        }
    }
    for(let water of waters){
        water.spin();
        if (distance(camera, water.obj) < 3 && water.available) {
            water.collect();
            q2.setAttribute("value", `Quest #2: ${water_collected} / 25 water collected`);
        }
    }
    requestAnimationFrame(loop); // Ensure continuous checking
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