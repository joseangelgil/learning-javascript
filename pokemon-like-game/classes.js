class Boundary {
  static width = 48
  static height = 48
  constructor({position}) {
    this.position = position
    this.width = 48 // 12*12px with a zoom of 400%
    this.height = 48
  }

  draw() {
    c.fillStyle = 'rgba(255,0,0,0)'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}

class Sprite {
  constructor({ 
    position, 
    imageSrc, 
    frames = { max: 1, hold: 10 }, 
    sprites, 
    animate = false,
  }) {
    this.position = position
    this.image = new Image()
    this.image.src = imageSrc
    this.frames = { ...frames, val: 0, elapsed: 0 }
    this.image.onload = () => {
      this.width = this.image.width / this.frames.max
      this.height = this.image.height
    }
    this.animate = animate
    this.sprites = sprites
    this.lastDirection = 'down'
  }

  draw() {
    c.save()
    c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2)
    c.rotate(this.rotation)
    c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2)
    c.globalAlpha = this.opacity
    c.drawImage(
      this.image,
      this.width * this.frames.val,
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max,
      this.image.height
    )
    c.restore()

    if(!this.animate && this.lastDirection === 'right') {
      this.frames.val = 1
      return
    } else if(!this.animate) {
      this.frames.val = 0
      return
    }

    if(this.frames.max > 1) {
      this.frames.elapsed++
    }

    if(this.frames.elapsed % this.frames.hold === 0) {
      if(this.frames.val < this.frames.max - 1) this.frames.val++
      else  this.frames.val = 0
    }
  }

  changeSprite(direction) {
    this.image.src = this.sprites[direction]
  }
}

class Monster extends Sprite {
  constructor({      
    position, 
    imageSrc, 
    frames = { max: 1, hold: 10 }, 
    sprites, 
    animate = false,    
    isEnemy = false,
    rotation = 0,
    name,
    attacks
  }) {    
    super({ 
      position, 
      imageSrc, 
      frames,
      sprites, 
      animate
    })
    this.opacity = 1
    this.health = 100
    this.isEnemy = isEnemy
    this.rotation = rotation
    this.name = name
    this.attacks = attacks
  }

  faint() {   
    document.querySelector('#dialogueBox').innerText = `${this.name} fainted!`
    const originalPosition = this.position.y
    gsap.to(this.position, {
      y: this.position.y + 20
    })
    gsap.to(this, {
      opacity: 0,
      onComplete: () => {
        this.position.y = originalPosition
      }
    })
    audio.battle.stop() 
    audio.victory.play()
  }

  attack({ attack, recipient, renderedSprites }) {

    const dialogueBox = document.querySelector('#dialogueBox')

    dialogueBox.style.display = 'block'
    dialogueBox.innerText = `${this.name} used ${attack.name}`

    let healthBar = '#enemyHealthBar'
    if(this.isEnemy) healthBar = '#playerHealthBar'

    let rotation = 1
    if(this.isEnemy) rotation = -2.2
    
    recipient.health -= attack.damage

    switch(attack.name) {
      case 'Tackle':
        const tl = gsap.timeline()

        let movementDistance = 20
        if(this.isEnemy) movementDistance = -20

        tl.to(this.position, {
          x: this.position.x - movementDistance
        }).to(this.position, {
          x: this.position.x + movementDistance * 2,
          duration: 0.1,
          onComplete: () => {
            //enemy gets hit
            audio.tackleHit.play()
            gsap.to(healthBar, {
              width: `${recipient.health}%`
            })
            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: .08,
            })
            gsap.to(recipient, {
              opacity: 0.2,
              repeat: 5,          
              yoyo: true,
              duration: 0.08
            })
          }
        }).to(this.position, {
          x: this.position.x
        })
        break
      case 'Fireball':        
        audio.initFireball.play()
        const fireball = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          imageSrc: './Images/fireball.png',
          frames: {
            max: 4,
            hold: 10
          },
          animate: true,
          rotation: rotation
        })

        renderedSprites.splice(1,0,fireball)

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            //enemy gets hit
            audio.fireballHit.play()
            gsap.to(healthBar, {
              width: `${recipient.health}%`
            })
            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: .08,
            })
            gsap.to(recipient, {
              opacity: 0.2,
              repeat: 5,          
              yoyo: true,
              duration: 0.08
            })
            renderedSprites.splice(1,1)
          }
        })
        break
    }    
  }
}