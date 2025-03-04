window.addEventListener('keydown', ({ key }) => {
  if(player.preventInput) return
  switch(key) {
    case 'ArrowUp':

      for (let i = 0; i < doors.length; i++) {
        const door = doors[i]

        if( 
          player.hitbox.position.x + player.hitbox.width <= door.position.x + door.width &&
          player.hitbox.position.x >= door.position.x &&
          player.hitbox.position.y + player.hitbox.height >= door.position.y &&
          player.hitbox.position.y <= door.position.y + door.height
        ) {
          player.velocity.x = 0
          player.velocity.y = 0
          player.preventInput = true
          player.switchSprite('enterDoor')
          door.play()
          return
        }
      }  
      if(player.velocity.y === 0) player.velocity.y = -20
      break
    case 'ArrowLeft':
      keys.arrowLeft.pressed = true
      break
    case 'ArrowRight':
      keys.arrowRight.pressed = true
      break
  }
})

window.addEventListener('keyup', ({ key }) => {
  switch(key) {
    case 'ArrowLeft':
      keys.arrowLeft.pressed = false
      break
    case 'ArrowRight':
      keys.arrowRight.pressed = false
      break
  }
})