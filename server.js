const express = require('express')
const path = require('path')
const app = express()
app.use(express.static(path.join(__dirname, 'public'))) //ber soubory ze složky public

//po get requestu na / pošli zpátky index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'))
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'))
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`)
})