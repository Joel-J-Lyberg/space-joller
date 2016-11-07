define('app/game', [
  'underscore',
  'userInput',
  'utils',
  'SpriteSheet',
  'app/images',
  'Krocka',
], function (
  _,
  userInput,
  utils,
  SpriteSheet,
  images,
  Krocka
) {
  const canvasWidth = 480
  const canvasHeight = 640

  const DEBUG_RENDER_HITBOXES = !false
  const DEBUG_WRITE_BUTTONS = false
  const DEBUG_DISABLE_GRAPHICS = false;

  let gameOver = false;

  const bulletHeight = 15

  let playSound

  let gameObjects = []
  let playerShip

  class GameObject extends Krocka.AABB {
    constructor(config) {
      super(config.width, config.height)
      this.markedForRemoval = false;
      this.position = new Krocka.Vector(config.position.x, config.position.y)
      this.velocity = (new Krocka.Vector()).set(config.velocity || {x: 0, y: 0})
    }
    tick() {
    }
    draw(renderingContext) {
      if (DEBUG_RENDER_HITBOXES) {
        renderingContext.strokeStyle = '#FFFF00'
        renderingContext.strokeRect(
          this.position.x,
          this.position.y,
          this.width,
          this.height)
      }
    }
    remove() {
      this.markedForRemoval = true;
    }
  }

  class Star extends GameObject {
    constructor(config) {
      super(config);
      var blueprint = images.star_spritesheet_blueprint;
      this.spritesheet = SpriteSheet.new(images.star, blueprint);
      this.spritesheet.play();
      this.spritesheet.tick(config.start)
    }
    tick() {
      this.spritesheet.tick(1000/60);
    }
    draw(renderingContext) {
      renderingContext.save()
      renderingContext.translate(this.position.x, this.position.y);
      this.spritesheet.draw(renderingContext);
      renderingContext.restore();
    }
  }

  class PlayerShip extends GameObject {
    constructor(config) {
      super(config)
      this.speed = config.speed
      this.recharged = true
      this.rechargeTimer = 0;
      this.setDetectable(true)
    }
    tick() {
      this.rechargeTimer--;
      if (this.rechargeTimer <= 0) {
        this.recharged = true;
      }
    }
    fire() {
      this.recharged = false;
      this.rechargeTimer = 30;
    }
    draw(renderingContext) {
      if (!DEBUG_DISABLE_GRAPHICS) {
        renderingContext.drawImage(images.player, this.position.x, this.position.y);
      } else {
        super.draw(renderingContext);
      }
    }

  }

  class PlayerExplosion extends GameObject {
    constructor(config) {
      super(config);
      var blueprint = images.player_exploding_blueprint;
      blueprint.callback = function() {
        this.markedForRemoval = true;
        gameOver = true;
      }.bind(this);
      this.spritesheet = SpriteSheet.new(images.player_exploding, blueprint);
      this.spritesheet.play();
    }
    tick() {
      this.spritesheet.tick(1000/60);
    }
    draw(renderingContext) {
      renderingContext.save()
      renderingContext.translate(this.position.x - 7, this.position.y - 7);
      this.spritesheet.draw(renderingContext);
      renderingContext.restore();
    }
  }

  class PlayerBullet extends GameObject {
    constructor(config) {
      super(config)
      this.speed = config.speed
      this.setDetectable(true)
    }
    tick() {
      this.velocity.y = -this.speed
    }
    draw(renderingContext) {
      if (!DEBUG_DISABLE_GRAPHICS) {
        renderingContext.drawImage(images.player_shot, this.position.x, this.position.y);
      } else {
        super.draw(renderingContext);
      }
    }
  }

  class EnemyBullet extends GameObject {
     constructor(config) {
      super(config)
      this.speed = config.speed
      this.setDetectable(true)
    }
    tick() {
      this.velocity.y = this.speed
    }
    draw(renderingContext) {
      if (!DEBUG_DISABLE_GRAPHICS) {
        renderingContext.drawImage(images.invader_shot, this.position.x, this.position.y);
      } else {
        super.draw(renderingContext);
      }
    }
   }

  class Enemy extends GameObject {
    constructor(config) {
      super(config)
      this.spritesheet = SpriteSheet.new(images.invader, images.invader_spritesheet_blueprint)
      this.spritesheet.play();
      this.direction = true; // false = left, true = right
      this.startX = config.position.x;
      this.setDetectable(true)
    }
    tick() {
      super.tick();
      this.spritesheet.tick(1000/60);
      if (this.direction && this.position.x > this.startX + 80) {
        this.direction = false;
      } else if (this.position.x < this.startX) {
        this.direction = true;
      }
      var multiplerX = (this.direction) ? 1 : -1;
      this.velocity.x = utils.interpolateLinear(24, 1.8, 0.1)[countEnemies()-1] * multiplerX;
      this.velocity.y = utils.interpolateLinear(24, 0.6, 0.1)[countEnemies()-1]

      this.possiblyAShot();
    }
    possiblyAShot() {
      var chance = utils.interpolateLinear(24, 0.002, 0.0002)[countEnemies()-1];
      if (Math.random() < chance) {
        playSound('enemyShot')
        gameObjects.push(new EnemyBullet({
          position: {
            x: this.position.x + this.width / 2,
            y: this.position.y + bulletHeight,
          },
          width: 3,
          height: bulletHeight,
          speed: 2,
        }))
      }
    }
    draw(renderingContext) {
      if (!DEBUG_DISABLE_GRAPHICS) {
        renderingContext.save()
        renderingContext.translate(this.position.x, this.position.y);
        this.spritesheet.draw(renderingContext);
        renderingContext.restore();
      } else {
        super.draw(renderingContext);
      }
    }
  }

  class EnemyExplosion extends GameObject {
    constructor(config) {
      super(config);
      var blueprint = images.invader_exploding_blueprint;
      blueprint.callback = function() {
        this.markedForRemoval = true;
      }.bind(this);
      this.spritesheet = SpriteSheet.new(images.invader_exploding, blueprint);
      this.spritesheet.play();
    }
    tick() {
      this.spritesheet.tick(1000/60);
    }
    draw(renderingContext) {
      renderingContext.save()
      renderingContext.translate(this.position.x - 7, this.position.y - 7);
      this.spritesheet.draw(renderingContext);
      renderingContext.restore();
    }
  }

  function debugWriteButtons(pad) {
    if (DEBUG_WRITE_BUTTONS && pad) {
      let str = 'axes'
      _.each(pad.axes, function (axis, i) {
        str = `${str}  ${i}: ${axis.toFixed(4)}`
      })
      str += ' buttons - '
      _.each(pad.buttons, function(button, i) {
        if (button.pressed) {
          str = `${str}  ${i}`
        }
      })
      console.log(str)
    }
  }

  function countEnemies() {
    return _.filter(gameObjects, function(obj) {
      return obj instanceof Enemy;
    }).length;
  }

  function endConditions() {
    _.chain(gameObjects)
        .filter(function(item) {
          return item instanceof Enemy;
        })
        .each(function(item) {
          if (item.position.y > 620) gameOver = true;
        });

    var enemies = _.filter(gameObjects, function(item) {
      return item instanceof Enemy || item instanceof EnemyExplosion;
    });
    if (enemies.length === 0) gameOver = true;
  }

  return {
    init: function(_playSound) {

      playSound = _playSound

      playerShip = new PlayerShip({
        position: {
          x: canvasWidth / 2,
          y: canvasHeight - 48,
        },
        width: 27,
        height: 21,
        speed: 4,

      })
      gameObjects.push(playerShip)

      _.each(new Array(7), function(item1, x) {
        _.each(new Array(3), function(item2, y) {
          gameObjects.push(new Enemy({
            position: {
              x: 50 + (x * 45),
              y: 20 + (y * 45),
            },
            width: 27,
            height: 21,
          }))
        });
      })

      gameObjects.push(new Star({
        position: {
          x: 430,
          y: 40,
        },
        start: 2000
      }))

      gameObjects.push(new Star({
        position: {
          x: 40,
          y: 600,
        },
        start: 0
      }))
    },
    tick: function() {

      endConditions();

      if (gameOver) {
        return;
      }

      const pad = userInput.getInput(0)
      debugWriteButtons(pad)

      if (pad.buttons[14].pressed) { // left
        playerShip.velocity.x = -playerShip.speed
      }
      if (pad.buttons[15].pressed) { // right
        playerShip.velocity.x = playerShip.speed
      }
      if (pad.buttons[0].pressed && playerShip.recharged) { // shoot
        playSound('shot')
        playerShip.fire();
        gameObjects.push(new PlayerBullet({
          position: {
            x: playerShip.position.x + playerShip.width / 2,
            y: playerShip.position.y - bulletHeight,
          },
          width: 3,
          height: bulletHeight,
          speed: 7,
        }))
      }

      const activeGameObjects = gameObjects.filter(function (gameObject) {
        return !gameObject.markedForRemoval
      })

      _.each(gameObjects, function (gameObject) {
        gameObject.tick()

        gameObject.nextPosition = {
          x: gameObject.position.x + gameObject.velocity.x,
          y: gameObject.position.y + gameObject.velocity.y,
        }
      })

      Krocka.run({
        objects: gameObjects,
        detector: function (gameObject, other) {
          if (!other.markedForRemoval && !gameObject.markedForRemoval) {
            return Krocka.detectAABBtoAABB(gameObject, other)
          }
          return false
        },
        resolver: function (collision) {

          collision.resolveByType(PlayerBullet, Enemy, function (playerBullet, enemy) {
            enemy.remove();
            playerBullet.remove();

            playSound('enemyHit')
            gameObjects.push(new EnemyExplosion({
              position: {
                x: enemy.position.x,
                y: enemy.position.y,
              },
            }))
          })

          collision.resolveByType(PlayerShip, Enemy, function (playerShip, enemy) {
            playerShip.markedForRemoval = true;
            gameObjects.push(new PlayerExplosion({
              position: {
                x: playerShip.position.x,
                y: playerShip.position.y,
              },
            }))
          })

          collision.resolveByType(PlayerShip, EnemyBullet, function (playerShip, enemyBullet) {
            playerShip.markedForRemoval = true;
            gameObjects.push(new PlayerExplosion({
              position: {
                x: playerShip.position.x,
                y: playerShip.position.y,
              },
            }))
          })

        },
      })

      _.each(gameObjects, function (gameObject) {

        gameObject.position.add(gameObject.velocity)

        // reset velocity
        gameObject.velocity.setXY(0, 0)
      })

      // remove all removed gameObjects
      gameObjects = gameObjects.filter(function (gameObject) {
        return !gameObject.markedForRemoval
      })

      window.gameObjects = gameObjects

    },
    draw: function (renderingContext) {
      renderingContext.drawImage(images.background, 0, 0);

      _.each(gameObjects, function (gameObject) {
        gameObject.draw(renderingContext)
      })

      if (gameOver) {
        renderingContext.font= "30px Verdana";
        renderingContext.fillStyle="white";
        renderingContext.fillText("GAME OVER",145,100);
      }
    },
  }
})
