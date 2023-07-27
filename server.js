const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
const fs = require('fs')

const app = express()
app.use(express.static(path.join(__dirname, 'public'))) //ber soubory ze složky public
app.use(express.urlencoded({ extended: true })); //parsuj json data z formulářů

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







app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
  
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Pro registraci je nutné mít jméno, email a heslo' });
    }
  
    const hashedPassword = bcrypt.hashSync(password, 12) //hashnutí a saltnutí hesla
    const usersString = fs.readFileSync('./users.json',{ encoding: 'utf8'}) //přečtení users.json
    const usersObject = JSON.parse(usersString) //převedení stringu JSONU na JS object

    if (usersObject[username]) {
      res.status(409).send("Uživatel už existuje")
    }
    else {
      usersObject[username] = {
        "email":email,
        "passHash":hashedPassword
      }
      fs.writeFileSync("./users.json", JSON.stringify(usersObject)) //převede objekt na string a hodí ho do users.json
      res.status(200).sendFile(path.join(__dirname, 'public', 'login.html')) //Redirectne to uživatele na login
    }
  })


  app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ error: 'Pro přihlášení je nutné mít jméno a heslo' });
    }
  
    console.log('Name:', username);
    console.log('Password:', password);
  
    res.status(200).send() //zde bude později redirect na index
  });


app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`)
})