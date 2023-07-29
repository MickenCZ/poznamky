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