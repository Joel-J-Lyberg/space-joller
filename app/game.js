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
  const DEBUG_WRITE_BUTTONS = !false

  let gameObjects = []
  let playerShip

  class Hitbox {
    constructor(x, y, width, height) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
    }
  }

  class GameObject {
    constructor(config) {
      this.hitbox = config.hitbox
      this.velocity = config.velocity || {
        x: 0,
        y: 0,
      }

      this.nextPosition = {
        x: this.hitbox.x,
        y: this.hitbox.y,
      }
      this.isRemoved = false
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

  function getAllActiveGameObjects() {
    return gameObjects.filter(function (gameObject) {
      return !gameObject.isRemoved
    })
  }

  function resolveCollision(gameObject, other) {
    console.log('resolveCollision')
    if (isOfTypes(gameObject, other, Enemy, PlayerBullet)) {
      console.log("HITHITHIH")
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
        hitbox: new Hitbox(
            canvasWidth / 2,
            canvasHeight - 48,
            27,
            21),
        speed: 4,

      })
      gameObjects.push(playerShip)

      gameObjects.push(new Enemy({
        hitbox: new Hitbox(
            200,
            40,
            27,
            21),
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
          hitbox: new Hitbox(
              playerShip.hitbox.x,
              playerShip.hitbox.y - bulletHeight - 4,
              3,
              bulletHeight),
          speed: 1,
        }))
      }

      const activeGameObjects = getAllActiveGameObjects()
      _.each(activeGameObjects, function (gameObject) {
        gameObject.tick()
      })

      // resolve movement changes and collisions
      _.each(activeGameObjects, function (gameObject) {

        const nextPosition = {
          x: gameObject.hitbox.x + gameObject.velocity.x,
          y: gameObject.hitbox.y + gameObject.velocity.y,
        }
        
        for (let i = 0; i < activeGameObjects.length; i++) {
          const other = activeGameObjects[i]
          if (detectCollision(
              gameObject.hitbox,
              gameObject.nextPosition,
              other.hitbox)) {
            resolveCollision(gameObject, other)
          }
        }

        // set new position
        if (nextPosition.x >= 0 && nextPosition.x + gameObject.hitbox.width <= canvasWidth) {
          gameObject.hitbox.x = nextPosition.x
          gameObject.hitbox.y = nextPosition.y
        }

        // reset velocity
        gameObject.velocity.x = 0
        gameObject.velocity.y = 0
        
      })

      // remove all removed gameObjects
      gameObjects = gameObjects.filter(function (gameObject) {
        return !gameObject.isRemoved
      })

    },
    draw: function (renderingContext) {
      // bg black
      renderingContext.fillStyle = '#000000'
      renderingContext.fillRect(0, 0, canvasWidth, canvasHeight)

      const activeGameObjects = getAllActiveGameObjects()
      _.each(activeGameObjects, function (gameObject) {
        gameObject.draw(renderingContext)
      })
    },
  }
})
