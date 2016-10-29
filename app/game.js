define('app/game', [
  'underscore',
  'userInput',
  'utils',
], function (
  _,
  userInput,
  utils
) {
  const canvasWidth = 480
  const canvasHeight = 640

  const DEBUG_RENDER_HITBOXES = !false
  const DEBUG_WRITE_BUTTONS = false

  let playSound

  let gameObjects = []
  let playerShip

  class GameObject {
    constructor(config) {
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
  }

  class PlayerShip extends GameObject {
    constructor(config) {
      super(config)
      this.speed = config.speed
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
  }

  // class EnemyBullet extends GameObject {
  //   constructor(config) {
  //     super(config)
  //   }
  // }

  class Enemy extends GameObject {
    constructor(config) {
      super(config)
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
      console.log('RESOLVE')
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
    init: function(_playSound) {

      playSound = _playSound

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
        return !gameObject.isRemoved
      })

      window.gameObjects = gameObjects

    },
    draw: function (renderingContext) {
      // bg black
      renderingContext.fillStyle = '#000000'
      renderingContext.fillRect(0, 0, canvasWidth, canvasHeight)

      _.each(gameObjects, function (gameObject) {
        gameObject.draw(renderingContext)
      })
    },
  }
})
