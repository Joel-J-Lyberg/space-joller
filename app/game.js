define('app/game', [
  'underscore',
  'userInput',
  'utils',
  'SpriteSheet',
  'app/images'
], function (
  _,
  userInput,
  utils,
  SpriteSheet,
  images
) {
  const canvasWidth = 480
  const canvasHeight = 640

  const DEBUG_RENDER_HITBOXES = !false
  const DEBUG_WRITE_BUTTONS = false
  const DEBUG_DISABLE_GRAPHICS = false;

  let gameObjects = []
  let playerShip

  class GameObject {
    constructor(config) {
      this.markedForRemoval = false;
      this.hitbox = config.hitbox
      this.velocity = config.velocity || {
        x: 0,
        y: 0,
      }
    }
    tick() {
    }
    draw(renderingContext) {
      if (DEBUG_RENDER_HITBOXES) {
        const hitbox = this.hitbox
        renderingContext.strokeStyle = '#FFFF00'
        renderingContext.strokeRect(
          hitbox.x,
          hitbox.y,
          hitbox.width,
          hitbox.height)
      }
    }
    remove() {
      this.markedForRemoval = true;
    }
  }

  class PlayerShip extends GameObject {
    constructor(config) {
      super(config)
      this.speed = config.speed
    }
    draw(renderingContext) {
      if (!DEBUG_DISABLE_GRAPHICS) {
        renderingContext.drawImage(images.player, this.hitbox.x, this.hitbox.y);
      } else {
        super.draw(renderingContext);
      }
    }

  }

  class PlayerBullet extends GameObject {
    constructor(config) {
      super(config)
      this.speed = config.speed
    }
    tick() {
      this.velocity.y = -this.speed
    }
    draw(renderingContext) {
      if (!DEBUG_DISABLE_GRAPHICS) {
        renderingContext.drawImage(images.player_shot, this.hitbox.x, this.hitbox.y);
      } else {
        super.draw(renderingContext);
      }
    }
  }

  // class EnemyBullet extends GameObject {
  //   constructor(config) {
  //     super(config)
  //   }
  // }

  class Enemy extends GameObject {
    constructor(config) {
      super(config)
      this.spritesheet = SpriteSheet.new(images.invader, images.invader_spritesheet_blueprint)
      this.spritesheet.play();
    }
    tick() {
      super.tick();
      this.spritesheet.tick(1000/60);
    }
    draw(renderingContext) {
      if (!DEBUG_DISABLE_GRAPHICS) {
        renderingContext.save()
        renderingContext.translate(this.hitbox.x, this.hitbox.y);
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
      renderingContext.translate(this.hitbox.x - 7, this.hitbox.y - 7);
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

  function isOfTypes(gameObject, other, type1, type2) {
    return (gameObject instanceof type1 && other instanceof type2) ||
        (gameObject instanceof type2 && other instanceof type1)
  }

  function resolveCollision(gameObject, other) {
    if (isOfTypes(gameObject, other, Enemy, PlayerBullet)) {
      gameObject.remove();
      other.remove();

      gameObjects.push(new EnemyExplosion({
        hitbox: {
          x: other.hitbox.x,
          y: other.hitbox.y
        },
      }))
    }
  }

  function detectCollision(hitbox, nextPosition, otherHitbox) {
    if (hitbox === otherHitbox) {
      return false
    }
    if (utils.isXYInsideRect(
        nextPosition.x,
        nextPosition.y,
        otherHitbox.x,
        otherHitbox.y,
        otherHitbox.width,
        otherHitbox.height) ||
      utils.isXYInsideRect(
        nextPosition.x + hitbox.width,
        nextPosition.y,
        otherHitbox.x,
        otherHitbox.y,
        otherHitbox.width,
        otherHitbox.height) ||
      utils.isXYInsideRect(
        nextPosition.x,
        nextPosition.y + hitbox.height,
        otherHitbox.x,
        otherHitbox.y,
        otherHitbox.width,
        otherHitbox.height) ||
      utils.isXYInsideRect(
        nextPosition.x + hitbox.width,
        nextPosition.y + hitbox.height,
        otherHitbox.x,
        otherHitbox.y,
        otherHitbox.width,
        otherHitbox.height)
      ) {
      return true
    }

    return false
  }

  return {
    init: function() {

      playerShip = new PlayerShip({
        hitbox: {
          x: canvasWidth / 2,
          y: canvasHeight - 48,
          width: 27,
          height: 21,
        },
        speed: 4,

      })
      gameObjects.push(playerShip)

      gameObjects.push(new Enemy({
        hitbox: {
          x: 200,
          y: 20,
          width: 27,
          height: 21,
        },
      }))

    },
    tick: function() {

      const pad = userInput.getInput(0)
      debugWriteButtons(pad)

      if (pad.buttons[14].pressed) { // left
        playerShip.velocity.x = -playerShip.speed
      }
      if (pad.buttons[15].pressed) { // right
        playerShip.velocity.x = playerShip.speed
      }
      if (pad.buttons[0].pressed) { // shoot
        const bulletHeight = 15
        gameObjects.push(new PlayerBullet({
          hitbox: {
            x: playerShip.hitbox.x,
            y: playerShip.hitbox.y - bulletHeight - 1,
            width: 3,
            height: bulletHeight,
          },
          speed: 7,
        }))
      }

      _.each(gameObjects, function (gameObject) {
        gameObject.tick()
      })

      // resolve movement changes and collisions
      _.each(gameObjects, function (gameObject) {
        const nextPosition = {
          x: gameObject.hitbox.x + gameObject.velocity.x,
          y: gameObject.hitbox.y + gameObject.velocity.y,
        }
        for (let i = 0; i < gameObjects.length; i++) {
          const other = gameObjects[i]
          if (detectCollision(
              gameObject.hitbox,
              nextPosition,
              other.hitbox)) {
            resolveCollision(gameObject, other)
          }
        }

        // set new position
        // if (
        //     nextPosition.x >= 0 &&
        //     nextPosition.x + gameObject.hitbox.width <= canvasWidth)
        // {
          gameObject.hitbox.x = nextPosition.x
          gameObject.hitbox.y = nextPosition.y
        // }

        // reset velocity
        gameObject.velocity.x = 0
        gameObject.velocity.y = 0

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
    },
  }
})
