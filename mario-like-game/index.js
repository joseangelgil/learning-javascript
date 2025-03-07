const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const gravity = .5

class Player {
  constructor({imageSrc}) {
    this.position = {
      x: 400,
      y: 100
    }
    this.velocity = {
      x: 0,
      y: 0
    }
    this.speed = 10
     
    this.width = 66
    this.height = 120

    this.image = new Image()
    this.image.src = imageSrc   
    this.frames = 0
    this.cropWidth = 177
    this.spriteDivisions = 60
    
  }

  draw() {
    c.drawImage(
      this.image, 
      this.cropWidth * this.frames,
      0,
      this.cropWidth,
      400,
      this.position.x, 
      this.position.y,
      this.width, 
      this.height)
  }

  update() {
    this.draw()   
    this.frames++
    if(this.frames >= this.spriteDivisions) this.frames = 0
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    this.velocity.y += gravity
    
  }
}

class Platform {
  constructor({ x, y, imageSrc }) {
    this.position = {
      x: x,
      y: y
    }
    this.image = new Image()
    this.image.src = imageSrc
    this.width = this.image.width
    this.height = this.image.height
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
  }
}

class GenericObject {
  constructor({ x, y, imageSrc }) {
    this.position = {
      x: x,
      y: y
    }
    this.image = new Image()
    this.image.src = imageSrc
    this.width = this.image.width
    this.height = this.image.height
  }

  draw() {
    c.drawImage(
      this.image, 
      this.position.x, 
      this.position.y, 
      this.width, 
      this.height)
  }
}

function init() {
  player = new Player({imageSrc: './img/spriteStandRight.png'})
  platforms = [
    new Platform({ x: -1, y: 470, imageSrc: './img/platform.png' }),
    new Platform({ x: 577, y: 470, imageSrc: './img/platform.png' }),
    new Platform({ x: 577*2 + 100, y: 470, imageSrc: './img/platform.png' }),
    new Platform({ x: 577*3 + 400, y: 470, imageSrc: './img/platform.png' }),
    new Platform({ x: 577*5, y: 470, imageSrc: './img/platform.png' }),
    new Platform({ x: 577*6 + 100, y: 370, imageSrc: './img/platformSmallTall.png' }),
    new Platform({ x: 577*7 + 300, y: 470, imageSrc: './img/platform.png' }),
  ]
  // platform.width = 580

  genericObjects = [
    new GenericObject({
      x: -1,
      y: -1,
      imageSrc: './img/background.png'
    }),
    new GenericObject({
      x: -1,
      y: -1,
      imageSrc: './img/hills.png'
    })
  ]

  scrollOffset = 0 // WIN CONTROLLER. how far we have scrolled till a specific number to win the game. 
}

let player
let platforms
let genericObjects

const keys = {
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  },
}

let lastKeyPressed

let scrollOffset = 0 // WIN CONTROLLER. how far we have scrolled till a specific number to win the game. 
let goalReached = false


function animate() {

  c.fillStyle = 'white'
  c.fillRect(0,0,canvas.width, canvas.height)
  
  genericObjects.forEach(genericObject => {
    genericObject.draw()
  })
  platforms.forEach(platform => {
    platform.draw()
  })
  
  player.update()
  
  if((keys.ArrowLeft.pressed && player.position.x > 400) || (keys.ArrowLeft.pressed && scrollOffset <= 0 && player.position.x > 0)) {
    player.velocity.x = -player.speed
  } else if(keys.ArrowRight.pressed && player.position.x + player.width < 400) {
    player.velocity.x = player.speed    
  } else {
    player.velocity.x = 0
    
    if(keys.ArrowRight.pressed && !goalReached) {
      scrollOffset += player.speed
      platforms.forEach(platform => {
        platform.position.x -= player.speed
      })
      genericObjects.forEach(genericObject => {
        genericObject.position.x -= player.speed*0.66
      })
    } else if(keys.ArrowLeft.pressed && scrollOffset > 0) {
      scrollOffset -= player.speed
      platforms.forEach(platform => {
        platform.position.x += player.speed
      })
      genericObjects.forEach(genericObject => {
        genericObject.position.x += player.speed*0.66
      })
    } else {
      player.cropWidth = 177
      player.spriteDivisions = 60
      player.width = 66
      if (lastKeyPressed === 'ArrowRight') player.image.src = './img/spriteStandRight.png'
      else player.image.src = './img/spriteStandLeft.png'
    } 
  }

  

  // platform collision detection
  platforms.forEach(platform => {
    if(
      player.position.y + player.height + player.velocity.y >= platform.position.y &&
      player.position.y + player.height <= platform.position.y &&
      player.position.x + player.width > platform.position.x &&
      player.position.x < platform.position.x + platform.width
    ) {
      player.velocity.y = 0
    }
  })

  // win condition
  if (scrollOffset > 577*7 + 300){
    goalReached = true
  } else goalReached = false

  // lose condition
  if (player.position.y > canvas.height) {
    init()
  }
  

  requestAnimationFrame(animate)
}

init()
animate()

addEventListener('keydown', ({ key }) => {
  switch(key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = true
      lastKeyPressed = 'ArrowRight'   
      player.image.src = './img/spriteRunRight.png'
      player.cropWidth = 341
      player.spriteDivisions = 30
      player.width = 127.875
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = true
      lastKeyPressed = 'ArrowLeft'
      player.image.src = './img/spriteRunLeft.png'
      player.cropWidth = 341
      player.spriteDivisions = 30
      player.width = 127.875
      break
    case 'ArrowUp':
      if(player.velocity.y === 0) player.velocity.y -= 10
      break
  }
})

addEventListener('keyup', ({ key }) => {
  switch(key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})