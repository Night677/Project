class rock {
  constructor(x, y, z) {
      let rnd = (l, u) => Math.random() * (u - l) + l;
      this.x = x;
      this.y = y;
      this.z = z; // Corrected this line
      this.available = true;

      this.obj = document.createElement("a-entity");
      this.obj.setAttribute("gltf-model", "#rock");
      this.obj.setAttribute("position", { x: x, y: y, z: z });
      this.obj.setAttribute("scale", `${rnd(.4, .6)} ${rnd(.2, .4)} ${rnd(.4, .6)}`); // Corrected this line

      const scene = document.querySelector('a-scene'); // Added this line
      scene.append(this.obj);
  }
}