define('app/Collision', [], function () {
  return class Collision {
    constructor(collider, colliderPart, other, otherPart) {
      this.collider = {
        gameObject: collider,
        part: colliderPart,
      }
      this.other = {
        gameObject: other,
        part: otherPart,
      }
    }
    getPart(gameObject) {
      return (gameObject === this.collider.gameObject && this.collider.part) ||
          (gameObject === this.other.gameObject && this.other.part)
    }
    isGameObjectsOfTypes(type1, type2) {
      return (this.collider.gameObject instanceof type1 &&
          this.other.gameObject instanceof type2) ||
          (this.collider.gameObject instanceof type2 &&
          this.other.gameObject instanceof type1)
    }
    getGameObjectsOfType(type) {
      const result = []
      if (this.collider.gameObject instanceof type) {
        result.push(this.collider.gameObject)
      }
      if (this.other.gameObject instanceof type) {
        result.push(this.other.gameObject)
      }
      if (result.length) {
        return result
      }
      return null
    }
  }
})