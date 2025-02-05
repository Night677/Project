class House {
  constructor(x, y, z) {
    this.x = x; // X position
    this.y = y; // Y position
    this.z = z; // Z position
    this.house = document.createElement("a-entity"); // Create the main entity for the house
    this.createWalls(); // Create the walls of the house
    this.createFloor(); // Create the floor of the house
    this.createDebris(); // Optionally create debris
    this.setPosition(); // Set the position of the house
  }

  createWalls() {
    const wallDimensions = { height: 3, width: 3, depth: 0.1 };

    // Front wall
    this.createWall(0, 0, -1.5, 0); // (x, y, z, rotation)

    // Left wall
    this.createWall(-1.5, 0, -1.5, 90); // Rotated 90 degrees

    // Back wall
    this.createWall(0, 0, -3, 180); // Rotated 180 degrees

    // Right wall
    this.createWall(1.5, 0, -1.5, 270); // Rotated 270 degrees
  }

  createWall(x, y, z, rotation) {
    const wall = document.createElement("a-box");
    wall.setAttribute("height", 3);
    wall.setAttribute("width", 3);
    wall.setAttribute("depth", 0.1);
    wall.setAttribute("position", { x: x, y: y, z: z });
    wall.setAttribute("rotation", 0, rotation, 0);
    this.house.append(wall); // Add wall to the house entity
  }

  createFloor() {
    const floor = document.createElement("a-box");
    floor.setAttribute("height", 0.1);
    floor.setAttribute("width", 3);
    floor.setAttribute("depth", 3);
    floor.setAttribute("rotation", 90, 0, 0); // Rotate the floor to be flat
    this.house.append(floor); // Add floor to the house entity
  }

  createDebris() {
    const debris = document.createElement("a-cylinder");
    debris.setAttribute("height", 0.5);
    debris.setAttribute("radius", 0.1);
    debris.setAttribute("rotation", 90, 0, 0); // Rotate debris if needed
    debris.setAttribute("position", { x: this.x, y: this.y, z: this.z }); // Position debris
    this.house.append(debris); // Add debris to the house entity
  }

  setPosition() {
    this.house.setAttribute("position", { x: this.x, y: this.y, z: this.z }); // Set the position of the house
    document.querySelector("a-scene").appendChild(this.house); // Append the house to the A-Frame scene
  }
}