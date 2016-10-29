requirejs.config({
  waitSeconds: 200,
  baseUrl: 'lib',
  paths: {
    'app': '../app',
  }
})

requirejs([
  'app/game',
], function (game) {

  let running = true
  let muted = false

  // const musicAudio = document.getElementById('music')
  const musicAudio = new Audio('music.ogg')
  musicAudio.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
  }, false);
  // musicAudio.play();

  const sfxs = {
    shot: new Audio('Shot001.ogg'),
    enemyShot: new Audio('Shot003.ogg'),
    enemyHit: new Audio('Shot002.ogg'),
  }
  
  window.addEventListener('keydown', function (e) {
    if (e.keyCode === 80) { // P - pause
      running = !running
    } else if (e.keyCode === 77) { // M - mute
      muted = !muted
    }

    if (muted) {
      musicAudio.pause()
    } else {
      musicAudio.play()
    }
  })

  function playSound(soundString) {
    if (!muted) {
      sfxs[soundString].play()
    }
  }

  const canvas = document.getElementById('canvas')
  const renderingContext = canvas.getContext('2d')

  game.init(playSound)

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
