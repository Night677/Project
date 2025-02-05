class tree{
  constructor(x,y,z){
    this.x = x;
    this.y = y;
    this.z = y;

    this.obj = document.createElement("a-cone");
    this.obj.setAttribute("color","green");
    this.obj.setAttribute("height",5);
    this.obj.setAttribute("static-body","");
	this.obj.setAttribute("uniqueID","tr");
    this.obj.setAttribute("position",{x:x,y:y+3,z:z});
    scene.append(this.obj);
	this.objt = document.createElement("a-cylinder");
    this.objt.setAttribute("color","brown");
    this.objt.setAttribute("radius",.5);
    this.objt.setAttribute("height",2);
    this.objt.setAttribute("static-body","");
	this.obj.setAttribute("uniqueID","ee");

    this.objt.setAttribute("position",{x:x,y:y,z:z});
    scene.append(this.objt);
  }
}