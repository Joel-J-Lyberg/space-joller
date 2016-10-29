define('app/images', ['SpriteSheet'], function(SpriteSheet) {
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

  var player_shot = new Image();
  player_shot.src = "../graphics/player_shot.png";

  var invader_spritesheet_blueprint = {
    frames: [200, 200, 200],
    x: 0,
    y: 0,
    width: 27,
    height: 21,
    restart: true,
    autostart: true,
  }

  var invader_exploding_blueprint = {
    frames: [10, 50, 100, 100, 100, 150, 200],
    x: 0,
    y: 0,
    width: 14 * 3,
    height: 14 * 3,
    restart: false,
    autostart: true,
  }

  var star_spritesheet_blueprint = {
    frames: [3000, 50, 200, 200, 200, 50],
    x: 0,
    y: 0,
    width: 21,
    height: 21,
    restart: true,
    autostart: true,
  };
  var star_spritesheet = SpriteSheet.new(star, star_spritesheet_blueprint)

  var player_exploding_blueprint = {
    frames: [10, 100, 200, 300, 400],
    x: 0,
    y: 0,
    width: 42,
    height: 42,
    restart: true,
    autostart: true,
  }

  return {
    player: player,
    player_exploding: player_exploding,
    player_exploding_blueprint: player_exploding_blueprint,
    invader: invader,
    invader_exploding: invader_exploding,
    invader_spritesheet_blueprint: invader_spritesheet_blueprint,
    invader_exploding_blueprint: invader_exploding_blueprint,
    star: star,
    star_spritesheet_blueprint: star_spritesheet_blueprint,
    background: background,
    player_shot: player_shot,
  }
})