// Function to generate a random number between l (lower bound) and u (upper bound)
let rnd = (l, u) => Math.random() * (u - l) + l;
let foods = [], healths = [], ammos = [], waters = []; trees = []; rocks = [];
let food_collected = 0, ammo_collected = 0, health_collected = 0, water_collected = 0;

let scene, tmp;
window.onload = function(){
  scene = document.querySelector("a-scene");
  camera = document.querySelector("a-camera");
  item = document.getElementById("item");
  q1 = document.getElementById("Quest1");
  q2 = document.getElementById("Quest2");
  q3 = document.getElementById("Quest3");
  q4 = document.getElementById("Quest4");
  q1.setAttribute("value", `Quest #1: ${food_collected} / 50 food collected`); // Initialize score display
  q2.setAttribute("value", `Quest #2: ${water_collected} / 100 water collected`); // Initialize score display
  q3.setAttribute("value", `Quest #3: ${ammo_collected} / 20 ammo collected`); // Initialize score display
  q4.setAttribute("value", `Quest #4: ${health_collected} / 5 health collected`); // Initialize score display

  for(let i = 0; i < 75; i++){
    let x = rnd(-100,100);
    let z = rnd(-100,100);
    foods.push(new food(x,0,z));
  }
  for(let i = 0; i < 150; i++){
    let x = rnd(-100,100);
    let z = rnd(-100,100);
    waters.push(new water(x,0,z));
  }
  for(let i = 0; i < 40; i++){
    let x = rnd(-100,100);
    let z = rnd(-100,100);
    ammos.push(new ammo(x,0,z));
  }
  for(let i = 0; i < 10; i++){
    let x = rnd(-100,100);
    let z = rnd(-100,100);
    healths.push(new health(x,0,z));
  }
	for(let i = 0;i < 50; i++){
    let x = rnd(-100,-10);
    let z = rnd(-100,100);
   trees.push(new tree(x,0,z));
 }
 for(let i = 0;i < 25; i++){
  let x = rnd(-100,-10);
  let z = rnd(-100,100);
 rocks.push(new rock(x,-.6,z));
}
for(let i = 0;i < 50; i++){
  let x = rnd(10,100);
  let z = rnd(-100,100);
 trees.push(new tree(x,0,z));
}
for(let i = 0;i < 25; i++){
  let x = rnd(10,100);
  let z = rnd(-100,100);
 rocks.push(new rock(x,-0.6,z));
}
setTimeout(loop,1000);
}
function loop(){
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
		  q1.setAttribute("value", `Quest #1: ${food_collected} / 50 food collected`);
		}
	}
	for(let health of healths){
		health.spin();
		if (distance(camera, health.obj) < 3 && health.available) {
		  health.collect();
		  q4.setAttribute("value", `Quest #4: ${health_collected} / 5 health collected`);
		}

	}
	for(let water of waters){
		water.spin();
		if (distance(camera, water.obj) < 3 && water.available) {
			
		  water.collect();
		  q2.setAttribute("value", `Quest #2: ${water_collected} / 100 water collected`);
		}
    
	}
  window.requestAnimationFrame(loop);
	
}
function results() {

  if (food_collected >= 1 && water_collected >= 1 && ammo_collected >= 1 && health_collected >= 1) {
  let resultImage = document.getElementById("mission_Complete");
	resultImage.setAttribute("opacity", 1);

  } 
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
