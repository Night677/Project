class health{
  constructor(x,y,z){
	this.a = 0;
	this.da = .01;
    this.x = x;
    this.y = y;
    this.z = y;
	this.available = true;
    
    this.obj = document.createElement("a-entity");
	this.obj.setAttribute("gltf-model","#health");
	this.obj.setAttribute("scale",".15 .15 .15")
	this.obj.setAttribute("static-body","");
    this.obj.setAttribute("position",{x:x,y:y,z:z});
	this.ball = document.createElement("a-sphere");
	this.ball.setAttribute("opacity",".1");
	this.ball.setAttribute("radius","2.66666666");
	this.obj.append(this.ball);

    scene.append(this.obj);

  }
  spin(){
	if(this.available){
	this.a += this.da;
	this.obj.object3D.rotation.y = this.a;
	}
  }
  collect(){
	  this.available = false;
	        health_collected += 1;
		this.obj.remove();
  }
}