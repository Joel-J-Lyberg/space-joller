define('app/game', [
  'underscore',
  'userInput',
  'utils',
  'app/GameObject',
  'app/Collision',
], function (
  _,
  userInput,
  utils,
  GameObject,
  Collision
) {
  const canvasWidth = 480
  const canvasHeight = 640

  const DEBUG_RENDER_HITBOXES = !false

  class Hitbox {
    constructor(config) {
      
    }
  }

  class GameObject {
    constructor(config) {
      this.hitbox = config.hitbox
      this.keepInsideGameArea = config.keepInsideGameArea || false
      this.velocity = config.velocity || {
        x: 0,
        y: 0,
      }
    }
    doAction(type, params) {
      switch (type) {
        case world.ACTION_SET_POSITION:
          this.position = params
          break
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
  
  function debugWriteButtons(pad) {
    if (world.DEBUG_WRITE_BUTTONS && pad) {
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
    return world.gameObjects.filter(function (gameObject) {
      return !gameObject.isRemoved && !gameObject.isSpawned
    })
  }

  function mapTypesToObjects(object1, object2, type1, type2) {
    if (object1 instanceof type1 && object2 instanceof type2 ||
          object2 instanceof type1 && object1 instanceof type2) {
      if (type1 === type2) {
        return {
          [type1]: [object1, object2],
        }
      }
      return {
        [type1]: object1 === type1 ? type1 : type2,
        [type2]: object2 === type1 ? type1 : type2,
      }
    }
    return null
  }

  function resolveCollision(collisionObject) {

    // Ship - Bullet
    // if (collisionObject.isGameObjectsOfTypes(Ship, Bullet)) {
    //   console.log('Ship Bullet')
    //   const bullet = collisionObject.getGameObjectsOfType(Bullet).pop()
    //   world.removeGameObject(bullet) // TODO: Add check for side (players or AI)
    //   return true
    // }

    // // Bullet - Bullet
    // if (collisionObject.isGameObjectsOfTypes(Bullet, Bullet)) {
    //   const bullets = collisionObject.getGameObjectsOfType(Bullet)
    //   bullets.map(world.removeGameObject.bind(world))
    //   return true
    // }

    // return true
  }

  function detectCollision(gameObject, nextPosition, other) {
    if (gameObject === other) {
      return false
    }

    for (let i = 0; i < gameObject.parts.length; i++) {
      const gameObjectPart = gameObject.parts[i]
      for (let j = 0; j < other.parts.length; j++) {
        const otherPart = other.parts[j]
        const gameObjectPartNextWorldPosition = utils.addVectors(
            gameObjectPart.relativePosition,
            nextPosition)
        const otherPartWorldPosition = calcPartWorldPosition(other, otherPart)

        if (utils.isXYInsideRect(
            gameObjectPartNextWorldPosition.x,
            gameObjectPartNextWorldPosition.y,
            otherPartWorldPosition.x,
            otherPartWorldPosition.y,
            otherPartWorldPosition.x + world.GRID_SIZE,
            otherPartWorldPosition.y + world.GRID_SIZE
            )) {
          return new Collision(gameObject, gameObjectPart, other, otherPart)
        }
      }
    }

    return false
  }

  return {
    init: function() {

      const player0Behaviour = new PlayerBehaviour(0)
      const playerShip = faction1Ship1Factory([player0Behaviour], {x: 12, y: 70}, true)
      world.addGameObject(playerShip)

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
        


        // keep object inside game area
        if (gameObject.keepInsideGameArea) {
          nextPosition.x = utils.cap(nextPosition.x, 0, world.GRID_XMAX)
          nextPosition.y = utils.cap(nextPosition.y, 0, world.GRID_YMAX)
        }

        let collisionObject
        for (let i = 0; i < activeGameObjects.length; i++) {
          const other = activeGameObjects[i]
          collisionObject = detectCollision(gameObject, nextPosition, other)
          if (collisionObject) {
            break;
          }
        }

        if (collisionObject) { // TODO: check so you can still move in a train
          const isMoveLegal = resolveCollision(collisionObject)
          if (isMoveLegal) { // TODO: uuuh
            gameObject.doAction(world.ACTION_SET_POSITION, nextPosition)
          }
        } else {
          gameObject.doAction(world.ACTION_SET_POSITION, nextPosition)
        }
        
      })

      // activate all spawned objects
      _.each(world.gameObjects, function (gameObject) {
        if (gameObject.isSpawned) {
          gameObject.isSpawned = false
        }
      })

      // remove all removed world.gameObjects
      world.gameObjects = world.gameObjects.filter(function (gameObject) {
        if (gameObject.isRemoved) {
          gameObject.cleanUp()
        }
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
