// server.js
import express from 'express'
import cors from 'cors'
const app = express()
const PORT = 3001 // o el puerto que prefieras

app.use(cors())

app.get('/api/roll-d20', (req, res) => {
  const result = Math.floor(Math.random() * 20) + 1
  res.json({ result })
})

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})