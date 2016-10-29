requirejs.config({
  waitSeconds: 60,
  baseUrl: 'lib',
  paths: {
    'app': '../app',
  }
})

requirejs([
  'app/game',
], function (game) {

  let running = true

  window.addEventListener('keydown', function (e) {
    if (e.keyCode === 80) { // P - pause
      running = !running
    }
  })

  const canvas = document.getElementById('canvas')
  const renderingContext = canvas.getContext('2d')

  game.init()

  function gameLoop() {
    window.requestAnimationFrame(gameLoop)
    if (running) {
      try {
        game.tick()
        game.draw(renderingContext)
      } catch (e) {
        console.error(e)
        running = false
      }
    }
  }

  gameLoop()
})
