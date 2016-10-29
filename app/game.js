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
        x: hitbox.x,
        y: hitbox.y,
      }
      this.isRemoved = false
    }
    doAction(type, params) {
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

  function getAllActiveGameObjects() {
    return gameObjects.filter(function (gameObject) {
      return !gameObject.isRemoved
    })
  }

  function resolveCollision(collisionObject) {

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

      

    },
    tick: function() {

      const pad = userInput.getInput(0)
      debugWriteButtons(pad)

      const activeGameObjects = getAllActiveGameObjects()
      _.each(activeGameObjects, function (gameObject) {
        gameObject.tick()
      })

      // resolve movement changes and collisions
      _.each(activeGameObjects, function (gameObject) {
        
        for (let i = 0; i < activeGameObjects.length; i++) {
          const other = activeGameObjects[i]
          if (detectCollision(
              gameObject.hitbox,
              gameObject.nextPosition,
              other.hitbox)) {
            resolveCollision(gameObject, other)
          }
        }
        
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
