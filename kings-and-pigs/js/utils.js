// The author created a new array method here with .parse2D, although a function would have done the job, and altering the array methods is not good practice. But 
Array.prototype.parse2D = function() {
  const rows = []
  for(let i = 0; i < this.length; i+=16) {
    rows.push(this.slice(i, i+16))
  }

  return rows
}

Array.prototype.createObjectsFrom2D = function() {
  const objects = []
  this.forEach((row,y) => {
    row.forEach((symbol, x) => {
      if(symbol === 292) {
        objects.push(new CollisionBlock({
          position: {
            x: x * 64,
            y: y * 64
          }
        }))
      }
    })
  })

  return objects
}
