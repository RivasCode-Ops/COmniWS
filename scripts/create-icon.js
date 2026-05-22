const fs = require('fs')
const path = require('path')

// PNG 16x16 azul (#3b82f6) mínimo válido
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHklEQVQ4T2P8z8BQzwAEjFSMZGRg+A8VDAwMAMC5BAWv6y9yAAAAAElFTkSuQmCC',
  'base64'
)

const dir = path.join(__dirname, '../resources')
fs.mkdirSync(dir, { recursive: true })
fs.writeFileSync(path.join(dir, 'icon.png'), png)
console.log('icon.png criado em resources/')
