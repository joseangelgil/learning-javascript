const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const collisionsMap = []
for(let i = 0; i < collisions.length; i+=70) { //70 tiles wide on Tiled.
  collisionsMap.push(collisions.slice(i, i + 70))
}

const battleZonesMap = []
for(let i = 0; i < battleZonesData.length; i+=70) { //70 tiles wide on Tiled.
  battleZonesMap.push(battleZonesData.slice(i, i + 70))
}

const boundaries = []
const battleZones = []

const offset = {
  x: -735,
  y: -610 
}

collisionsMap.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if(symbol === 1025) boundaries.push(new Boundary({
      position: {
        x: x * Boundary.width + offset.x,
        y: y * Boundary.height + offset.y
      }
    }))
  })  
})

battleZonesMap.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if(symbol === 1026) battleZones.push(new Boundary({
      position: {
        x: x * Boundary.width + offset.x,
        y: y * Boundary.height + offset.y + 8
      }
    }))
  })  
})

const player = new Sprite({
  position: {
    x: canvas.width / 2 - (192 / 4) / 2,
    y: canvas.height / 2 - 68 / 2
  },
  imageSrc: './Images/playerDown.png',
  frames: {
    max: 4,
    hold: 10
  },
  sprites: {
    up: './Images/playerUp.png',
    left: './Images/playerLeft.png',
    right: './Images/playerRight.png',
    down: './Images/playerDown.png',
  }
})
const background = new Sprite({ 
  position: {
    x: offset.x,
    y: offset.y
  },
  imageSrc: "./Images/Pellet Town.png"
})

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  imageSrc: "./Images/foreground.png"
})

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

let lastKey

const movables = [background, foreground, ...boundaries, ...battleZones]

function rectangularCollision({rectangle1, rectangle2}) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height
  ) 
}

const battle = {
  initiated: false
}

function animate() {
  const animationId = window.requestAnimationFrame(animate)
  background.draw()
  boundaries.forEach(boundary => {
    boundary.draw()
  })
  battleZones.forEach(battleZone => {
    battleZone.draw()
  })
  player.draw()
  foreground.draw()

  let moving = true  
  player.animate = false

  if(battle.initiated) return 

  //activate battle
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for(let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i]
      const overlappingArea = (
        Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) -
        Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) -
        Math.max(player.position.y, battleZone.position.y))
      if(rectangularCollision({
        rectangle1: player,
        rectangle2: battleZone
      }) && overlappingArea > (player.width * player.height) / 2 && Math.random() < 0.01) {
        console.log('activate battle')
        // deactivate current animation loop
        window.cancelAnimationFrame(animationId)

        audio.map.stop()
        audio.initBattle.play()
        audio.battle.play()
        battle.initiated = true
        gsap.to('#overlappingDiv', {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                // activate a new animation loop 
                initBattle()
                animateBattle()                
                gsap.to('#overlappingDiv', {
                  opacity: 0,
                  duration: 0.4,
                })
              }
            })            
          }
        })
        break
      }
    }
  }

  if(keys.w.pressed && lastKey === 'w') {
    player.animate = true
    player.changeSprite('up')
    player.lastDirection = 'up'
    for(let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if(rectangularCollision({
        rectangle1: player,
        rectangle2: {...boundary, position: {
          x: boundary.position.x,
          y: boundary.position.y + 3
        }}
      })) {
        moving = false;
        break
      }
    }
    if(moving) movables.forEach(movable => { movable.position.y += 3 })
  }else if(keys.s.pressed && lastKey === 's') {
    player.animate = true
    player.changeSprite('down')
    player.lastDirection = 'down'
    for(let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if(rectangularCollision({
        rectangle1: player,
        rectangle2: {...boundary, position: {
          x: boundary.position.x,
          y: boundary.position.y - 3
        }}
      })) {
        moving = false;
        break
      }
    }
    if(moving) movables.forEach(movable => { movable.position.y -= 3 })
  }else if(keys.a.pressed && lastKey === 'a') {
      player.animate = true
      player.changeSprite('left')     
      player.lastDirection = 'left'
      for(let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i]
        if(rectangularCollision({
          rectangle1: player,
          rectangle2: {...boundary, position: {
            x: boundary.position.x + 3,
            y: boundary.position.y
          }}
        })) {
          moving = false;
          break
        }
      }
      if(moving)  movables.forEach(movable => { movable.position.x += 3 })
  }else if(keys.d.pressed && lastKey === 'd') {
      player.animate = true
      player.changeSprite('right')
      player.lastDirection = 'right'
      for(let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i]
        if(rectangularCollision({
          rectangle1: player,
          rectangle2: {...boundary, position: {
            x: boundary.position.x - 3,
            y: boundary.position.y
          }}
        })) {
          moving = false;
          break
        }
      }
      if(moving) movables.forEach(movable => { movable.position.x -= 3 })
  }
}

animate()

window.addEventListener('keydown', (e) => {
  switch(e.key.toLowerCase()) {
    case 'w':
      keys.w.pressed = true
      lastKey = 'w'
      break
    case 'a':
      keys.a.pressed = true
      lastKey = 'a'
      break
    case 's':
      keys.s.pressed = true
      lastKey = 's'
      break
    case 'd':
      keys.d.pressed = true
      lastKey = 'd'
      break
  }
})

window.addEventListener('keyup', (e) => {
  switch(e.key.toLowerCase()) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 's':
      keys.s.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
})

let clicked = false
addEventListener('click', () => {
  if(!clicked) {
    audio.map.play()
    clicked = true
  }
})


