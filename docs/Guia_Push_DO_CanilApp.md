# Guia: enviar o backend (e SQLite) para o repositório DO_CanilApp

Repositório de destino: [https://github.com/CanillDesktop/DO_CanilApp](https://github.com/CanillDesktop/DO_CanilApp)  
Clone: `https://github.com/CanillDesktop/DO_CanilApp.git`

## O que vai para o Git (e o que não vai)

| Incluir no repositório | Motivo |
|------------------------|--------|
| `backend/Backend/` (código, `*.csproj`, `Migrations/`, `Program.cs`, etc.) | API que corre na DigitalOcean |
| `backend/Shared/` | Biblioteca partilhada |
| `CanilApp.sln` (opcional mas útil) | Abrir solução no Visual Studio |
| `backend/Backend/appsettings.example.json` | Modelo de configuração sem segredos |
| `docs/Deploy_DigitalOcean.md` (ou equivalente) | Deploy no servidor |

| Normalmente **não** commitar | Motivo |
|-------------------------------|--------|
| `backend/Backend/appsettings.json` e `appsettings.Development.json` | Segredos (JWT, connection strings) |
| Ficheiros `*.db`, `*.db-shm`, `*.db-wal` | Estão no `.gitignore` — dados locais / produção; risco de expor dados |

**SQLite no servidor:** o motor SQLite vem com o pacote NuGet (`Microsoft.EntityFrameworkCore.Sqlite`). Não é preciso “instalar sqlite3” à parte no servidor só para a API .NET. O ficheiro `.db` é **criado no disco** do Droplet/App (pasta persistente, ver `Deploy_DigitalOcean.md`). O **esquema** fica nas **Migrations** no Git; na primeira subida pode aplicar-se com `dotnet ef database update` ou ao arrancar a app, conforme o vosso `Program.cs`.

Se quiserem mesmo um `.db` vazio no repo (não recomendado para dados reais), teriam de remover ou exceção no `.gitignore` e usar `git add -f caminho.db` — só para cenários de demo.

---

## Frontend no GitHub, mas não na DigitalOcean

**GitHub** guarda o que commitam (monorepo com `frontend/` + `backend/` é normal). **A DigitalOcean** só recebe o que **publicarem** ou **copiarem** para o servidor — não há “cópia automática de todo o repositório” para dentro da API, desde que o deploy aponte só ao backend.

| Cenário | Como garantir que o frontend não vai para o DO |
|--------|------------------------------------------------|
| **Repositório só backend** (Caminho A, `DO_CanilApp` sem pasta `frontend/`) | O servidor nunca tem código de frontend; o GitHub do DO_CanilApp também não. O frontend continua noutro repo (ex. **CanipApp**) no GitHub. |
| **Um único repo no GitHub** (CanipApp com `frontend/` e `backend/`) | No deploy: usar **sempre** `dotnet publish` **só** no `.csproj` da API, por exemplo `backend/Backend/Backend.csproj`. A pasta `publish/` contém apenas a API — não inclui Vite/React. Se clonarem o repo inteiro no Droplet, **não** sirvam `frontend/` com Nginx como app principal a menos que queiram; para só API, copiem ou executem só o output do `publish`. |
| **DigitalOcean App Platform** | Definir **Source directory** (ou raiz do componente) como `backend/Backend` e comando de build `dotnet publish -c Release -o ./publish` (ou o que a plataforma usar). Assim o build **não** corre `npm` na pasta `frontend/`. |
| **Deploy manual (`scp` do guia)** | Enviar apenas o conteúdo de `./publish` gerado pelo `dotnet publish` do Backend — nunca `scp -r` da raiz do monorepo inteiro para `/opt/canilapp/app`. |

Resumo: **versionar o frontend no Git** não obriga a **instalá-lo no servidor**; basta que o pipeline ou os comandos de deploy usem **exclusivamente** o projeto `backend/Backend`.

---

## Caminho A — Repositório DO_CanilApp só com backend (recomendado)

Útil quando o [DO_CanilApp](https://github.com/CanillDesktop/DO_CanilApp) está quase vazio (só README).

### 1. Clonar o repositório da DigitalOcean

```powershell
cd "E:\Documentos\Materia vianna\PIEX\Projeto-DO"
git clone https://github.com/CanillDesktop/DO_CanilApp.git
cd DO_CanilApp
```

### 2. Copiar pastas do projeto CanipApp

A partir da pasta do **CanipApp** (onde está o código atual), copiar pelo menos:

- `backend\Backend\` → para `DO_CanilApp\backend\Backend\`
- `backend\Shared\` → para `DO_CanilApp\backend\Shared\`
- `CanilApp.sln` → raiz de `DO_CanilApp\` (opcional)
- `.gitignore` da raiz do CanipApp (ou fundir com o do DO_CanilApp)
- `docs\Deploy_DigitalOcean.md` (se existir)

No PowerShell (ajuste o caminho de origem se for diferente):

```powershell
$origem = "E:\Documentos\Materia vianna\PIEX\Projeto-DO\CanipApp"
$destino = "E:\Documentos\Materia vianna\PIEX\Projeto-DO\DO_CanilApp"
New-Item -ItemType Directory -Force -Path "$destino\backend" | Out-Null
Copy-Item -Recurse -Force "$origem\backend\Backend" "$destino\backend\Backend"
Copy-Item -Recurse -Force "$origem\backend\Shared" "$destino\backend\Shared"
Copy-Item -Force "$origem\CanilApp.sln" "$destino\"
Copy-Item -Force "$origem\.gitignore" "$destino\"
if (Test-Path "$origem\docs\Deploy_DigitalOcean.md") {
  New-Item -ItemType Directory -Force -Path "$destino\docs" | Out-Null
  Copy-Item -Force "$origem\docs\Deploy_DigitalOcean.md" "$destino\docs\"
}
```

### 3. Configuração local no clone (não vai para o Git)

Na pasta `DO_CanilApp\backend\Backend\`:

1. Copiar `appsettings.example.json` para `appsettings.json` (e ajustar connection string, JWT, etc.).
2. Garantir que `appsettings.json` **não** está tracked (`git status` não deve listá-lo para commit — o `.gitignore` deve ignorá-lo).

### 4. Primeiro commit e push

```powershell
cd "E:\Documentos\Materia vianna\PIEX\Projeto-DO\DO_CanilApp"
git status
git add backend/ CanilApp.sln .gitignore docs/
git commit -m "Adiciona backend ASP.NET Core e documentação de deploy."
git branch -M main
git push -u origin main
```

Se o remoto remoto já tiver um commit inicial (README), pode ser preciso:

```powershell
git pull origin main --rebase
git push -u origin main
```

---

## Caminho B — Manter um único clone do CanipApp e empurrar para os dois remotes

Quando quiserem continuar a trabalhar no **CanipApp** e também atualizar **DO_CanilApp**.

```powershell
cd "E:\Documentos\Materia vianna\PIEX\Projeto-DO\CanipApp"
git remote add do https://github.com/CanillDesktop/DO_CanilApp.git
```

Criar uma branch só com o que pretendem publicar no DO (por exemplo após commitar a reorganização `backend/`):

```powershell
git checkout -b deploy/do
git push -u do deploy/do:main
```

Isto envia a branch local `deploy/do` para `main` no repositório `do`. Se o DO_CanilApp tiver histórico diferente, pode ser necessário `--force` (só com acordo da equipa, apaga histórico remoto).

**Nota:** este caminho envia **todo** o repositório CanipApp (incluindo `frontend/` se existir). Para **só** backend, use o Caminho A ou `git subtree` / repositório separado.

---

## Depois do push (DigitalOcean)

1. No Droplet/App Platform, apontar o build para o repositório **DO_CanilApp** e branch `main` (ou a branch usada).
2. Comando típico de publicação (ajustar caminhos ao vosso doc):

   `dotnet publish backend/Backend/Backend.csproj -c Release -o /var/www/canilapp-api`

3. SQLite: garantir pasta de dados persistente (ex. `/var/canilapp/data`) e connection string nesse caminho; **não** depender de um `.db` dentro do repositório.

---

## Resumo

1. Clonar [DO_CanilApp](https://github.com/CanillDesktop/DO_CanilApp.git).  
2. Copiar `backend/Backend`, `backend/Shared`, `.gitignore`, solução e docs.  
3. Criar `appsettings.json` localmente a partir do example — **não** commitar.  
4. `git add`, `commit`, `push origin main`.  
5. No servidor: publicar o projeto, volume para o `.db`, aplicar migrations se necessário.

Para dúvidas de deploy concreto (Nginx, systemd), seguir `docs/Deploy_DigitalOcean.md` no repositório.
