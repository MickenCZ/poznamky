const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
const fs = require('fs')
const session = require('express-session') //cookies na přihlášení
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json()) //parsuj json data z fetch
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, 'static'))) //ber soubory ze složky static
app.use(express.urlencoded({ extended: true })); //parsuj json data z formulářů
app.use(
  session({
    secret: 'sample-secret', // Klíč na podepsání cookies
    resave: false,
    saveUninitialized: false, //request se nebude generovat pokaždé
    cookie: {
      maxAge: 60 * 60 * 1000, // Za jak dlouho se expiruje cookie (v ms)
    },
  })
);

//po get requestu na / pošli zpátky index.ejs
app.get('/', (req, res) => {
  if (!req.session.authenticated) {
    res.redirect("/login")
  }
  else {
    const poznamkyString = fs.readFileSync('./poznamky.json',{ encoding: 'utf8'}) //přečtení poznamky.json
    const poznamkyObject = JSON.parse(poznamkyString) //převedení stringu JSONU na JS object
    const poznamky = poznamkyObject[req.session.user.username]
    const data = {poznamky:poznamky}
    res.render("index", data)
  }
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
  
    const usersString = fs.readFileSync('./users.json',{ encoding: 'utf8'}) //přečtení users.json
    const usersObject = JSON.parse(usersString) //převedení stringu JSONU na JS object

    if (!usersObject[username]) {
      res.status(409).send("Uživatel neexistuje")
    }
    else {
      if (bcrypt.compareSync(password, usersObject[username].passHash)) {
        if (!req.session.authenticated) {
          req.session.authenticated = true //přihlášení
          req.session.user = {username: username} //vytvoření session cookie
          res.status(200).redirect("/") //redirect na index po přihlášení
        }
        else {
          //už je přihlášen
          res.status(200).redirect("/") //redirect na index po přihlášení
        }
      }
      else {
        res.status(403).send("Heslo je špatně")
      }
    }
  });





  app.post('/createNote', (req, res) => {
    const { noteTitle, noteContent, importantNote } = req.body;
    if (!noteContent || !noteTitle) {
      return res.status(400).send("pro vložení poznámky musíš mít obsah i nadpis")
    }
    if (!req.session.user) {
      return res.status(403).redirect("/login")
    }
    else {
      const poznamkyString = fs.readFileSync('./poznamky.json',{ encoding: 'utf8'}) //přečtení poznamky.json
      const poznamkyObject = JSON.parse(poznamkyString) //převedení stringu JSONU na JS object

      if (!poznamkyObject[req.session.user.username]) {//pokud array poznámek pro uživatele neexistuje, vytvoříme ho
        poznamkyObject[req.session.user.username] = []
      }

      poznamkyObject[req.session.user.username].push({ //vložíme do arraye poznámek poznámku
        header:noteTitle,
        content:noteContent,
        isImportant: importantNote == "on" ? true : false,
        date: Date.now()
      })


      fs.writeFileSync("./poznamky.json", JSON.stringify(poznamkyObject)) //převede objekt na string a hodí ho do poznamky.json
      return res.status(200).redirect("/")
    }
  })




 app.post('/deleteNote', (req, res) => {
    const { date } = req.body;
    if (!date) {
      return res.status(400).send("pro vložení poznámky musíš mít obsah i nadpis")
    }

    if (!req.session.user) {
      return res.status(403).redirect("/login")
    }
    
      const poznamkyString = fs.readFileSync('./poznamky.json',{ encoding: 'utf8'}) //přečtení poznamky.json
      const poznamkyObject = JSON.parse(poznamkyString) //převedení stringu JSONU na JS object
      poznamkyObject[req.session.user.username] = poznamkyObject[req.session.user.username].filter(poznamka => poznamka.date !== date) //vymaže to poznámku z arraye tím, že filtr ponechá jen datumy, která se liší
      fs.writeFileSync("./poznamky.json", JSON.stringify(poznamkyObject))
      return res.status(200).redirect("/") //tohle ve skutečnosti nic neudělá, redirect musí být clientside
    
  })
  




  app.post('/deleteUser', (req, res) => {
    if (!req.session.user) {
      return res.status(403).redirect("/login")
    }
    const poznamkyString = fs.readFileSync('./poznamky.json',{ encoding: 'utf8'}) //přečtení poznamky.json
    const poznamkyObject = JSON.parse(poznamkyString) //převedení stringu JSONU na JS object
    const usersString = fs.readFileSync('./users.json',{ encoding: 'utf8'}) //přečtení users.json
    const usersObject = JSON.parse(usersString) //převedení stringu JSONU na JS object
    delete poznamkyObject[req.session.user.username]
    delete usersObject[req.session.user.username]
    fs.writeFileSync("./users.json", JSON.stringify(usersObject)) //převede objekt na string a hodí ho do users.json
    fs.writeFileSync("./poznamky.json", JSON.stringify(poznamkyObject)) //převede objekt na string a hodí ho do poznamky.json
    req.session.destroy();
    return res.status(200).send("Úspěšně jsme smazali váš účet")
  })




app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`)
})