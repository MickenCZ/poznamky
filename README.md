# poznamky
server na poznamky

# Jak jsem to udělal?
## Commit 1
1. Vytvořím soubor na kterém mám kód serveru, zvolím port a zapnu server. (server.listen)
1. Vytvořím složku public (pojmenuj si to jak chceš) a z ní budu brát všechny statické html soubory. To dělá to ```express.static```
1. Vytvořím v ní všechny potřebné soubory. Prozatím stačí index.html, register.html a login.html. Do této samé složky dávám i CSS případně JS a obrázky.
1. Pro všechny tři vytvořím endpointy tak, aby poslali příslušný soubor. Priklad.com/register je registrace, priklad.com/login je přihlášení atd, prohlížení poznamek je na priklad.com, tedy na index.html