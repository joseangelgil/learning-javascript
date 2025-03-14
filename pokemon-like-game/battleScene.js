const battleGround = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: "./Images/battleBackground.png"
})

let emby
let draggle
let renderedSprites
let battleAnimationId
let queue = []

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block'
  document.querySelector('#dialogueBox').style.display = 'none'
  document.querySelector('#enemyHealthBar').style.width = '100%'
  document.querySelector('#playerHealthBar').style.width = '100%'
  document.querySelector('#attacksBox').replaceChildren()

  emby = new Monster(monsters.Emby)
  draggle = new Monster(monsters.Draggle)
  renderedSprites = [draggle, emby]
  queue = []

  emby.attacks.forEach(attack=> {
    const button = document.createElement('button')
    button.innerText = attack.name
    document.querySelector('#attacksBox').append(button)
  }) 

  //event listener for attack buttons
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener("click", (e) => {
      const selectedAttack = attacks[e.target.innerHTML]
      emby.attack({ 
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites
      })
      
      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint()
        })
        queue.push(() => {
          // fade back to balck
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId)
              animate()              
              audio.battle.stop()
              audio.map.play()
              document.querySelector('#userInterface').style.display = 'none'
              gsap.to('#overlappingDiv', {
                opacity: 0
              })
              battle.initiated = false
            }
          })
        })
      }
      // draggle or enemy attacks right here
      const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

      queue.push(() => {
        draggle.attack({ 
          attack: randomAttack,
          recipient: emby,
          renderedSprites
        })

        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint()
          })        
          queue.push(() => {
            // fade back to balck
            gsap.to('#overlappingDiv', {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId)
                animate()                
                audio.battle.stop()
                audio.map.play()
                document.querySelector('#userInterface').style.display = 'none'
                gsap.to('#overlappingDiv', {
                  opacity: 0
                })                
                battle.initiated = false
              }
            })
          })
        }
      })
    })

    button.addEventListener('mouseover', (e) => {    
      const selectedAttack = attacks[e.target.innerHTML]
      document.getElementById('attackType').innerText = selectedAttack.type 
      document.getElementById('attackType').style.color = selectedAttack.color
    })
  })
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle)
  battleGround.draw()
  renderedSprites.forEach(sprite => {
    sprite.draw()
  })
}

// initBattle()
// animateBattle()

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
  if(queue.length > 0) {
    queue[0]()
    queue.shift()
  } else {
    e.target.style.display = 'none'
  }
})