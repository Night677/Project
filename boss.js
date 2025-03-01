class Bosszombie{
    constructor(x,y,z){
      this.x = x;
      this.y = y;
      this.z = z;
      
      this.obj = document.createElement('a-entity');
      this.obj.setAttribute("position",{x:this.x,y:this.y,z:this.z});
      this.obj.setAttribute("gltf-model","#Bosszombie");
      this.obj.setAttribute("animation-mixer","clip: Mon_BlackDragon31_Btl_Atk01");
      scene.append(this.obj);
    }
}
//No time :( 
