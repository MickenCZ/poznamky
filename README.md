# poznamky
server na poznamky. Prvni dva commity nepočítám, Commit 1 je třetí. 

# Jak jsem to udělal?
## Commit 1
1. Vytvořím soubor na kterém mám kód serveru, zvolím port a zapnu server. (server.listen)
1. Vytvořím složku public (pojmenuj si to jak chceš) a z ní budu brát všechny statické html soubory. Z nich to budou brát API endpointy na get requesty.
1. Vytvořím v ní všechny potřebné soubory. Prozatím stačí index.html, register.html a login.html. Do další složky static dávám CSS případně JS a obrázky. Zní si to bude brát automaticky. To dělá to ```express.static```.
1. Pro všechny tři vytvořím endpointy tak, aby poslali příslušný soubor. Priklad.com/register je registrace, priklad.com/login je přihlášení atd, prohlížení poznamek je na priklad.com, tedy na index.html

## Commit 2
1. Vytvořím formulář na registraci a login, včetně CSS. Důležité je dát form tagu atribut method POST a action /register, tedy jméno endpointu na zpracování POST requestu po registraci. To samé pro login. Tady dej pozor na to, že by měli být na inputech správné name attributy. Podle nich pak budeš brát informace na serveru z HTTP request body. Dej také pozor na správné parsování dat z formulářů, zde používám ```app.use(express.urlencoded({ extended: true }));```
1.  Máme tedy udělané graficky formuláře, method, action, name na inputech, css ve složce a na serveru přijímání údajů na přihlášení.

## Commit 3
1. Teď setupneme "databázi". Vytvoříme dva JSON soubory, users a poznamky. Budou mimo složku public, protože jsou to serverové soubory. V souboru users.json bude objekt, ve kterém klíče budou symbolizovat uživatelské jméno (a také budou unikátní) a hodnota bude objekt s položkami email a passHash.
1. Teď dokončíme api endpoint pro registraci (POST na /register). Po načtení hesla do proměnné ho hashujeme a saltujeme. Nainstaluj knihovnu bcrypt, uděláno linou ```const hashedPassword = bcrypt.hashSync(password, 10)```.
1. Importuju modul "fs", není třeba nic instalovat. Po hashnutí hesla přečtu JSON soubor users (readfilesync). Pokud uživatel už existuje, hodím error status code a pošlu request zpět. Pokud ne, zapíšu nový pár hodnoty a klíče do mého objektu v proměnné a potom ho zapíšu do souboru a pošlu zpátky kladný status kód a login stránku. (zapsání je writeFileSync)

# Commit 4
1. Teď se budeme soustředit na přihlášení. V Api endpointu pro login (/login) zkontrolujeme, jestli jsme přijali jméno a heslo, načteme JSON soubor stejně jako minule a podíváme se, jestli uživatel existuje. Pokud ne tak vrátíme zpátky, pokud ano, porovnáme hash hesla v json souboru s heslem co jsme dostali. 
1. Pokud to sedí, pomocí knihovny express-session přiřazuju cookies. Konfigiruju přes app.use (podívej se na komentáře v kódu), je to nahoře. Setnu session cookie tak, aby objekt měl property authenticated, a setnu to true. ```req.session.authenticated = true```. Potom v kódu, kterej odpovídá GET requestu na /, pokud je to authenticated true tak mu tu stránku pošlu, pokud ne tak ho přesměruju na login.

# Commit 5
1. Teď zprovozníme vkládání poznámek. Vytvořím formulář v index.html a ve složce static tomu css, které potom importuju. Formu dám metodu POST a action /createNote. Inputům dám nějaká jména, která potom použiju, já dal ```noteTitle, noteContent, importantNote```. V POST API endpointu /createNote na serveru, Parsnu to z body, přečtu soubor ```poznamky.json``` (tvar zhruba takový: 
{
    "ASD":[
        {
            "date":1690548812907,
            "header":"nadpis",
            "content":"obsah",
            "isImportant":true
        }
    ]
})
1. u POST endpointu /createNote: zkontroluju přítomnost obsahu a nadpisu, zkontroluju, jestli je uživatel přihlášenej (pokud ne tak redirect na login), načtu soubor poznamky.json, pokud tam neexistuje array pro konkrétního uživatele (příklad uživatele ASD nahoře), tak ho vytvořím. S klíčem uživatelského jména přidám objekt s poznámkou do arraye uživatele. header a content píšu rovnou, isImportant je podle checkboxu, date je jen vygenerovanej timestamp. Potom toto zapíšu do json souboru (zatím to mám jen v proměnné). Pokud je všechno v pořádku, redirectnu na / (tedy reload stránky)  a pošlu status kód 200.

# Commit 6
1. Teď začneme řešit zobrazování dat o poznámkách. Nainstalovaj jsem ejs a vytvořil složku views a v ní index.ejs Jedná se standardní templatování. Zkopíruju prozatím obsah index.html do index.ejs, a index.html můžu smazat. Nastavil jsem view engine jako ejs ```app.set("view engine", "ejs")``` a tím jsem zapnul používání těchto souborů. V endpointu na GET request na / jsem to nastavil, aby to renderovalo ten ejs soubor a ne html ```res.render("index", data)```. Pomocí toho parametru data můžu dávat serverová data přímo do toho souboru a dynamicky ho generovat, já to konkrétně použiju na zobrazení poznámek. Pokud to děláš v .NET, použij prostě ten template engine, co je ti v tom jazyce nejbližší.
1. Až mi přijde GET request na / a zjistím, že je uživatel přihlášen tak: přečtu poznámky z JSON souboru, konverutju na objekt, podle klíče vezmu jen array poznámek náležící jednomu uživateli, (jeho jméno zjistím podle autentikace, v JS to je z ```req.session```, u mě konkrétně ```req.session.user.username```). Potom do templatu pošlu tento array jako data.
1. Template přizpůsobím těm datům, přidám css a html tak aby to nějak vypadalo. Koukni se na tu finální podobu ```index.ejs```. Stejně jako třeba v PHP střídám psaní kódu a markupu.

# Commit 7
1. Teď vyřešíme mazání jednotlivých poznámek. I když by bylo dobré používat unikátní ID jako v databázi, zde v pohodě stačí použít na identifikaci poznámek autora a čas. Ve stejnou milisekundu dvakrát nic nevytvořím, takže pokud smažu všechny timestampy uživatele "Já" s časem 1690548812907, mělo by to smazat jen jeden. Pro smazání vytvořím API POST endpoint deletePoznamka a callovat ho budu přes onClick funkci na tlačítku pro vymazání poznámky, na které dám fetch a timestamp toho postu do body.
1. Na to, abychom mohli parsovat JSON poslaný z funkce fetch, nainstalujeme body-parser a setupneme middleware app.use. Fetch bude vypadat nějak takhle, akorát dynamicky pošlu date: 

fetch('/deleteNote', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({date:123}),
            })
1. V API endpointu POST pro /deleteNote zkontrolujeme jestli nám bylo posláno datum, (unix timestamp v ms), jestli je uživatel přihlášen, a pokud ano oboje, tak přečtu poznamky, převedu na objekt, vyberu jen poznamky přihlášeného uživatele, podle timestampu (date) pomocí filtru vymažu poznámku s objektu, ten objekt zapíšu do poznamky.json a hotovo. mimo fetch musí být po něm v Ejs/html ještě reload, protože forcenout to po fetchi nemůžu. Tímto už máme hotové mazání poznámek

# Commit 8
1. Teď implementujeme mazání účtu. V ```index.ejs``` vytvoříme tlačítko, které pošle přes fetch request na náš server, já jsem zvolil POST /deleteUser, ale klidně by šla asi použít i DELETE metoda. Stejně jako před tím po fetchi refreshnu stránku přes javascript. (POZOR, tohle je změněno v Commitu 10 na elegantnější řešení, které se ještě zeptá uživatele na heslo.)
1. Na endpointu POST /deleteUser udělám toto: přečtu users.json a poznamky.json a oboje parsnu na objekt. Z obou odstraním klíč odpovídající jménu uživatele. Oba soubory zapíšu zpět do souborového systému. Odhlásím uživatele ze session. Pošlu zpět status kód 200 a hotovo. Teď máme hotovou bezpečnou aplikaci s loginem, která umí ukládat poznámky.

# Commit 9 - Dokumentace
Jak spustit aplikaci? Nainstaluj node.js a ve složce s tímto projektem napiš: ```npm install``` a až se nainstalují dependence tak ```node server.js```. Tímto se spustí server na ```localhost:3000```. Nejdřív doporučuji vytvořit účet na ```localhost:3000/register```. Poté dostanete přístup ke zbytku aplikace. Pokud chcete autorefreshovat server při vývoji, stačí přidat flag ```node --watch server.js```. Mějte ale na vědomí, že při flagu watch se to bude refrehsovat pořád, a nebudete tak schopní třeba dokončit registraci.

# Commit 10 - Přidání posledních maličkostí
1. Chceme úvodní stránku s možností redirectu na login a register. Vytvoříme ve složce public html soubor (home.html) a pokud není uživatel přihlášený po navigaci GET "/", tak ho tam přepošleme. 
```if (!req.session.authenticated) {res.redirect("/home")}```
Poté přidáme do našeho serveru endpoint GET /home, který uživateli pošle stránku home.html. Funguje to stejně jako u login a register. Také můžeme ve složce static vytvořit CSS soubor pro tento HTML soubor. V HTML souboru použiju tag ```a``` s atributem ```href``` na přesměrování uživatele na jinou stránku.
1. Chceme se naposledy zeptat na heslo, než smažeme uživatele. Plán je takový, že po zmáčknutí tlačítka na smazání uživatele, ho přesměrujeme na novou stránku, kde bude formulář na zadání hesla a tlačítko smazat. Po zmáčknutí tlačítka smazat a poslání requestu na POST /deleteUser si ověříme heslo a pokud bude správné, tak smažeme účet a oznámíme to uživateli.
Vytoříme tedy stránku delete.html a stejně jako u home přidáme css a endpoint na GET /delete. V endpointu musíme mít tuhle logiku:
Pokud je uživatel přihlášen, přesměrujeme ho na stránku ```delete.html```. Pokud ne, přesměrujeme ho na ```home.html```.
Ve formuláři v delete.html nastavíme POST /deleteUser a dáme tam jako jediný field heslo a submit tlačítko na smazání. 
Potom se podíváme do index.ejs a můžeme smazat všechen client-side javascript, který se děje po zmáčknutí tlačítka Odstranit účet. Chceme teď jen po něm, aby nás přesměroval na /delete. Použijeme tag zase ```a``` s atributem ```href``` na přesměrování uživatele na jinou stránku. Dáme ho dovnitř do tlačítka. 
Teď už nám stačí jenom upravit endpoint POST /deleteUser v souboru server.js. 
V endpointu po zkontrolování, že je uživatel přihlášený, které tam už máme, parsneme heslo z formuláře. Použijeme kód, který nám čte JSON soubor users, konkrétně už parsnutý JS object k tomu, abychom se ujistili o správnosti hesla. Pokud hash tohoto hesla odpovídá hashi hesla v databázi (bcrypt.compareSync), tak necháme běžet zbytek kódu na smazání účtu tak, jak ho už máme. Pokud ne, řekneme uživateli, že zadal špatné heslo.