class rock {
  constructor(x, y, z) {
      let rnd = (l, u) => Math.random() * (u - l) + l;
      this.x = x;
      this.y = y;
      this.z = z; // Corrected this line
      this.available = true;

      this.obj = document.createElement("a-entity");
      this.obj.setAttribute("gltf-model", "#bush");
      this.obj.setAttribute("meterial","fog: false")
      this.obj.setAttribute("position", { x: x, y: y, z: z });
      this.obj.setAttribute("scale", `${rnd(3, 4)} ${rnd(3, 4)} ${rnd(3, 4)}`); 

      
      scene.append(this.obj);
  }
}