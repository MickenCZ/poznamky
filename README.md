# poznamky
server na poznamky. Prvni dva commity nepočítám, Commit 1 je třetí. 

# Jak jsem to udělal?
## Commit 1
1. Vytvořím soubor na kterém mám kód serveru, zvolím port a zapnu server. (server.listen)
1. Vytvořím složku public (pojmenuj si to jak chceš) a z ní budu brát všechny statické html soubory. To dělá to ```express.static```
1. Vytvořím v ní všechny potřebné soubory. Prozatím stačí index.html, register.html a login.html. Do této samé složky dávám i CSS případně JS a obrázky.
1. Pro všechny tři vytvořím endpointy tak, aby poslali příslušný soubor. Priklad.com/register je registrace, priklad.com/login je přihlášení atd, prohlížení poznamek je na priklad.com, tedy na index.html

## Commit 2
1. Vytvořím formulář na registraci a login, včetně CSS. Důležité je dát form tagu atribut method POST a action /register, tedy jméno endpointu na zpracování POST requestu po registraci. To samé pro login. Tady dej pozor na to, že by měli být na inputech správné name attributy. Podle nich pak budeš brát informace na serveru z HTTP request body. Dej také pozor na správné parsování dat z formulářů, zde používám ```app.use(express.urlencoded({ extended: true }));```
1.  Máme tedy udělané graficky formuláře, method, action, name na inputech, css ve složce a na serveru přijímání údajů na přihlášení.

## Commit 3
1. Teď setupneme "databázi". Vytvoříme dva JSON soubory, users a poznamky. Budou mimo složku public, protože jsou to serverové soubory. V souboru users.json bude objekt, ve kterém klíče budou symbolizovat uživatelské jméno (a také budou unikátní) a hodnota bude objekt s položkami email a passHash.
1. Teď dokončíme api endpoint pro registraci (POST na /register). Po načtení hesla do proměnné ho hashujeme a saltujeme. Nainstaluj knihovnu bcrypt, uděláno linou ```const hashedPassword = bcrypt.hashSync(password, 10)```.
1. Importuju modul "fs", není třeba nic instalovat. Po hashnutí hesla přečtu JSON soubor users (readfilesync). Pokud uživatel už existuje, hodím error status code a pošlu request zpět. Pokud ne, zapíšu nový pár hodnoty a klíče do mého objektu v proměnné a potom ho zapíšu do souboru a pošlu zpátky kladný status kód a login stránku. (zapsání je writeFileSync)