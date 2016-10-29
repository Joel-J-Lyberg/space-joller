var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")

var invader = new Image();
invader.src = "enemy1_spritesheet.png";

var spritesheet = SpriteSheet.new(invader, {
  frames: [200, 200, 200],
  x: 0,
  y: 0,
  width: 27,
  height: 21,
  restart: true,
  autostart: true,
})

setInterval(function() {
    context.fillStyle = "black";
    context.fillRect(0,0, 800, 600);

    spritesheet.play();
    spritesheet.tick(1000/60);
    spritesheet.draw(context);
}, 1000/60);