class tree{
  constructor(x,y,z){
    this.x = x;
    this.y = y;
    this.z = y;

    this.obj = document.createElement("a-entity");
      this.obj.setAttribute("gltf-model", "#tree");
      this.obj.setAttribute("meterial","fog: false")
      this.obj.setAttribute("position", { x: x, y: y-1, z: z });
      this.obj.setAttribute("scale", `${rnd(1, 1.5)} ${rnd(1, 2)} ${rnd(1, 1.5)}`); 

     
      scene.append(this.obj);
  }
}