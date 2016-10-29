var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")

var invader = new Image();
invader.src = "../graphics/enemy1_spritesheet.png";

var player = new Image();
player.src = "../graphics/player.png";

var player_exploding = new Image();
player_exploding.src = "../graphics/player_explosion_spritesheet.png";

var invader_exploding = new Image();
invader_exploding.src = "../graphics/enemy_exploding_spritesheet.png";

var star = new Image();
star.src = "../graphics/star_spritesheet.png";

var background = new Image();
background.src = "../graphics/background.png";

var invader_spritesheet = SpriteSheet.new(invader, {
  frames: [200, 200, 200],
  x: 0,
  y: 0,
  width: 27,
  height: 21,
  restart: true,
  autostart: true,
})

var invader_exploding_spritesheet = SpriteSheet.new(invader_exploding, {
  frames: [1000, 50, 100, 100, 100, 150, 200],
  x: 0,
  y: 0,
  width: 14 * 3,
  height: 14 * 3,
  restart: true,
  autostart: true,
})

var star_spritesheet = SpriteSheet.new(star, {
  frames: [3000, 50, 200, 200, 200, 50],
  x: 0,
  y: 0,
  width: 21,
  height: 21,
  restart: true,
  autostart: true,
})

var star_spritesheet2 = SpriteSheet.new(star, {
  frames: [3000, 50, 200, 200, 200, 50],
  x: 0,
  y: 0,
  width: 21,
  height: 21,
  restart: true,
  autostart: true,
})

var player_exploding_spritesheet = SpriteSheet.new(player_exploding, {
  frames: [1000, 100, 200, 300, 400],
  x: 0,
  y: 0,
  width: 42,
  height: 42,
  restart: true,
  autostart: true,
})

star_spritesheet.play();
star_spritesheet2.play();
star_spritesheet2.tick(2000);
invader_spritesheet.play();
invader_exploding_spritesheet.play();
player_exploding_spritesheet.play();
    
setInterval(function() {
    context.drawImage(background, 0,0)

    context.save()
    context.translate(100, 100);
    invader_spritesheet.tick(1000/60);
    invader_spritesheet.draw(context);
    context.restore();

    context.save()
    context.translate(300, 100);
    invader_exploding_spritesheet.tick(1000/60);
    invader_exploding_spritesheet.draw(context);
    context.restore();

    context.save()
    context.translate(200, 400);
    star_spritesheet.tick(1000/60);
    star_spritesheet.draw(context);
    context.restore();

    context.save()
    context.translate(50, 200);
    star_spritesheet2.tick(1000/60);
    star_spritesheet2.draw(context);
    context.restore();

    context.save()
    context.translate(200, 500);
    context.drawImage(player, 0,0 );
    context.restore();

    context.save()
    context.translate(200, 100);
    player_exploding_spritesheet.tick(1000/60);
    player_exploding_spritesheet.draw(context);
    context.restore();
}, 1000/60);