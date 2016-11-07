define('Krocka', [
  'Flogger',
], function (Flogger) {

  class Vector {
    constructor(x, y) {
      this.x = x || 0
      this.y = y || 0
    }
    getAngle() {
      return Math.atan2(this.y, this.x)
    }
    getMagnitude() {
      return this.getDistanceXY(0, 0)
    }
    getDistance(simpleVector) { // simpleVector can be anything with {x: Number, y: Number}
      return this.getDistanceXY(simpleVector.x, simpleVector.y)
    }
    getDistanceXY(x, y) {
      const dx = x - this.x
      const dy = y - this.y
      return Math.sqrt(dx * dx + dy * dy)
    }
    // chainable methods
    set(simpleVector) { // simpleVector can be anything with {x: Number, y: Number}
      return this.setXY(simpleVector.x, simpleVector.y)
    }
    setXY(x, y) {
      this.x = x
      this.y = y
      return this
    }
    add(simpleVector) { // simpleVector can be anything with {x: Number, y: Number}
      return this.addXY(simpleVector.x, simpleVector.y)
    }
    addXY(x, y) {
      this.x += x
      this.y += y
      return this
    }
    setMagnitude(magnitude) {
      const angle = this.getAngle()
      this.x = Math.cos(angle) * magnitude
      this.y = Math.sin(angle) * magnitude
      return this
    }
    clone() {
      return new Vector(this.x, this.y)
    }
  }

  class Krockable {
    constructor() {
      this.position = null
      this.velocity = null
      this.acceleration = null
      this.nextPosition = null
      this.isDetectable = false
      // this.hasResolved = false
    }
    // chainable methods
    setDetectable(detectable) {
      this.isDetectable = detectable
      return this
    }
    setPosition(vector) { // simpleVector can be anything with {x: Number, y: Number}
      return this.setPositionXY(vector.x, vector.y)
    }
    setPositionXY(x, y) {
      this.position.setXY(x, y)
      return this
    }
    setAcceleration(vector) { // simpleVector can be anything with {x: Number, y: Number}
      return this.setAccelerationXY(vector.x, vector.y)
    }
    setAccelerationXY(x, y) {
      this.acceleration.setXY(x, y)
      return this
    }
    setVelocity(vector) { // simpleVector can be anything with {x: Number, y: Number}
      return this.setVelocityXY(vector.x, vector.y)
    }
    setVelocityXY(x, y) {
      this.velocity.setXY(x, y)
      return this
    }
  }

  class Circle extends Krockable {
    constructor(radius) {
      super()
      this.radius = radius
    }
    isOverlappingPoint(point) {
      return this.position.getDistance(point) < this.radius
    }
    isOverlappingCircle(circle) {
      return this.position.getDistance(circle.position) < this.radius + circle.radius
    }
  }

  class AABB extends Krockable {
    constructor(width, height) {
      super()
      this.width = width
      this.height = height
    }
    isOverlappingPoint(point) {
      return point.x >= this.position.x &&
          point.x <= this.position.x + this.width &&
          point.y >= this.position.y &&
          point.y <= this.position.y + this.height
    }
    isOverlappingAABB(aabb) { // TODO: add swept detection
      const topRight = aabb.position.clone().addXY(aabb.width, 0)
      const bottomLeft = aabb.position.clone().addXY(0, aabb.height)
      const bottomRight = aabb.position.clone().addXY(aabb.width, aabb.height)

      return this.isOverlappingPoint(aabb.position) ||
          this.isOverlappingPoint(topRight) ||
          this.isOverlappingPoint(bottomLeft) ||
          this.isOverlappingPoint(bottomRight)
    }
    clone() {
      return new AABB(this.width, this.height)
    }
  }

  class Collision {
    constructor(config) {
      this.collidees = config.collidees
    }
    resolve(type1, type2, resolver) {
      const collidee1 = this.collidees[0]
      const collidee2 = this.collidees[1]
      if (collidee1 instanceof type1 &&
          collidee2 instanceof type2) {
        return resolver(collidee1, collidee2)
      } else if (collidee1 instanceof type2 &&
          collidee2 instanceof type1) {
        return resolver(collidee2, collidee1)
      }
      return null // TODO: KROCKA_NOT_MATCHING_TYPES maybe?
    }
  }

  function run(config) {
    // objects: [], detector: Function, resolver: Function
    const collisions = []

    // reset 
    // for (let i = 0; i < config.objects.length; i++) {
    //   const object = config.objects[i]
    //   if (object instanceof Krockable) {
    //     object.hasResolved = false
    //   }
    // }

    // detect
    for (let i = 0; i < config.objects.length; i++) {
      for (let j = i + 1; j < config.objects.length; j++) {
        const collidee1 = config.objects[i]
        const collidee2 = config.objects[j]
        if (collidee1.isDetectable === true &&
            collidee2.isDetectable === true &&
            config.detector(collidee1, collidee2)) {
          // if (collidee1 instanceof Krockable) {
          //   collidee1.hasResolved = true
          // }
          // if (collidee2 instanceof Krockable) {
          //   collidee2.hasResolved = true
          // }
          collisions.push(new Collision({
            collidees: [collidee1, collidee2],
          }))
        }
      }
    }

    // resolve
    for (let i = 0; i < collisions.length; i++) {
      config.resolver(collisions[i])
    }

    // return collisions for inspection
    return collisions
  }

  function detectCircleToCircle(circle1, circle2) {
    return circle1.isOverlappingCircle(circle2)
  }

  function detectAABBtoAABB(aabb1, aabb2) {
    return aabb1.isOverlappingAABB(aabb2)
  }

  // update

  // tick gameobjects

  // krocka.run({
  //   objects: [],
  //   detector: function (object1, object2) {
  //     return detectCircleToCircle(object1, object2)
  //   },
  //   resolver: function (collision) {
  //     collision.resolve(Ship, Bullet, function (ship, bullet) {
  //       bullet.destroy()
  //       ship.hit()
  //     })
  //   },
  // })

  return {
    Vector: Vector,
    Krockable: Krockable,
    Circle: Circle,
    AABB: AABB,
    Collision: Collision,
    run: run,
    detectCircleToCircle: detectCircleToCircle,
    detectAABBtoAABB: detectAABBtoAABB,
  }

})