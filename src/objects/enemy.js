import findPath from "../engine/enemy_pathing";

class Enemy {
    constructor(type, x, y, width, height, color, name, health, attack, speed, sent_by, to_who) {
      this.type = type;
      this.x = x; // spawn per x cord
      this.y = y; // spawn per y cord
      this.width = width; // Temp kol textures ner
      this.height = height; // Temp kol textures ner
      this.color = color; // Temp kol textures ner
      this.name = name; // tikriausiai nereikia
      this.health = health;
      this.attack = attack;
      this.speed = speed;
      this.sent_by = sent_by; // kas siunte Enemy
      this.to_who = to_who; // kam siustas Enemy
    }
  

  }
  
  export default Enemy;
  