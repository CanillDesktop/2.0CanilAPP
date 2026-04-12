# Deploy do Backend na DigitalOcean (Droplet)

Guia para publicar a API **CanilApp** (ASP.NET Core 8 + SQLite) em um **Droplet** Ubuntu, com **Nginx**, **HTTPS (Let’s Encrypt)** e **systemd**.

---

## Pré-requisitos

- Conta na [DigitalOcean](https://www.digitalocean.com/)
- **Droplet** Ubuntu **22.04 LTS** (recomendado: pelo menos 2 GB RAM)
- **Domínio** com subdomínio (ex.: `api.seudominio.com`) apontando por registro **A** para o **IP público** do Droplet
- Na DigitalOcean: **Firewall** com portas **22** (SSH, idealmente restrita ao seu IP), **80** e **443** liberadas

---

## 1. Primeira configuração do servidor (SSH)

Conecte ao Droplet:

```bash
ssh usuario@IP_DO_DROPLET
```

Atualize o sistema e instale Nginx:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx
```

### Instalar o runtime ASP.NET Core 8

Opção A — script oficial (ajuste o destino se quiser instalação global):

```bash
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x dotnet-install.sh
sudo ./dotnet-install.sh --channel 8.0 --runtime aspnetcore --install-dir /usr/share/dotnet
sudo ln -sf /usr/share/dotnet/dotnet /usr/bin/dotnet
dotnet --info
```

Opção B — pacotes Microsoft para Ubuntu (recomendado para servidores): siga a documentação oficial da Microsoft: [Instalar .NET no Linux](https://learn.microsoft.com/dotnet/core/install/linux-ubuntu) e instale o pacote **`aspnetcore-runtime-8.0`**.

Verifique:

```bash
dotnet --list-runtimes
```

---

## 2. Usuário e diretórios da aplicação

```bash
sudo useradd -r -s /bin/false -m -d /opt/canilapp canilapp 2>/dev/null || true
sudo mkdir -p /opt/canilapp/app /opt/canilapp/data
sudo chown -R canilapp:canilapp /opt/canilapp
```

- **`/opt/canilapp/app`**: arquivos publicados da API (`Backend.dll`, etc.)
- **`/opt/canilapp/data`**: arquivo SQLite persistente (`canilapp.db`)

---

## 3. Publicar o projeto (máquina de desenvolvimento)

No Windows (PowerShell), na pasta do Backend:

```powershell
cd "C:\caminho\para\CanipApp\backend\Backend"
dotnet publish -c Release -o ./publish
```

Envie os arquivos para o Droplet (substitua `usuario` e `IP_DO_DROPLET`):

```powershell
scp -r ./publish/* usuario@IP_DO_DROPLET:/opt/canilapp/app/
```

**Alternativa:** clonar o repositório no servidor, instalar o **SDK** .NET 8 e rodar `dotnet publish` diretamente no Droplet.

---

## 4. Variáveis de ambiente e segredos

Crie o arquivo de ambiente (somente root, não versionar):

```bash
sudo nano /etc/canilapp.env
```

Conteúdo de exemplo (ajuste `Jwt__SecretKey` e o domínio depois no Nginx):

```bash
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://127.0.0.1:5000
ConnectionStrings__DefaultConnection=Data Source=/opt/canilapp/data/canilapp.db
Jwt__SecretKey=SUBSTITUA_POR_SEGREDO_LONGO_MINIMO_32_CARACTERES
Jwt__Issuer=CanilApp
Jwt__Audience=CanilApp
```

Proteja o arquivo:

```bash
sudo chmod 600 /etc/canilapp.env
sudo chown root:root /etc/canilapp.env
```

**Notas:**

- Kestrel escuta só em **127.0.0.1:5000**; o **Nginx** expõe **80/443** para a internet.
- O caminho absoluto do SQLite evita perder o banco se o diretório de trabalho mudar.
- Faça **backup** periódico de `/opt/canilapp/data/canilapp.db` (com o serviço parado ou usando `sqlite3 ... ".backup ..."`).

---

## 5. Serviço systemd

```bash
sudo nano /etc/systemd/system/canilapp.service
```

Cole:

```ini
[Unit]
Description=CanilApp API
After=network.target

[Service]
User=canilapp
Group=canilapp
WorkingDirectory=/opt/canilapp/app
ExecStart=/usr/bin/dotnet /opt/canilapp/app/Backend.dll
Restart=always
RestartSec=5
EnvironmentFile=/etc/canilapp.env

[Install]
WantedBy=multi-user.target
```

Ative e inicie:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now canilapp.service
sudo systemctl status canilapp.service
```

Logs do serviço:

```bash
journalctl -u canilapp.service -f
```

Teste local no servidor:

```bash
curl -sS http://127.0.0.1:5000/api/health
```

---

## 6. Nginx (proxy reverso)

```bash
sudo nano /etc/nginx/sites-available/canilapp
```

Substitua `api.seudominio.com` pelo seu subdomínio:

```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Habilite o site e recarregue o Nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/canilapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. HTTPS com Let’s Encrypt (Certbot)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.seudominio.com
```

Renovação automática costuma ser registrada no **cron** do sistema; teste com:

```bash
sudo certbot renew --dry-run
```

---

## 8. Cliente (app MAUI / HttpClient)

- URL base da API: **`https://api.seudominio.com`**
- Ajuste a configuração do app para usar essa URL em produção (em vez de `localhost` ou backend embutido).

### CORS

Se usar **Blazor WebView** ou requisições a partir de um **browser**, configure no servidor a seção **`Cors:AllowedOrigins`** no `appsettings` ou via variáveis de ambiente (`Cors__AllowedOrigins__0`, etc.). Para cliente nativo só com `HttpClient`, CORS em geral não se aplica.

---

## 9. Atualizar a API após mudanças

Na sua máquina:

```powershell
cd backend\Backend
dotnet publish -c Release -o ./publish
scp -r ./publish/* usuario@IP_DO_DROPLET:/opt/canilapp/app/
```

No servidor:

```bash
sudo systemctl restart canilapp.service
```

Se houver **novas migrations** do EF Core, elas rodam na subida (`Database.Migrate()`), desde que o `Backend.dll` publicado inclua as migrations atualizadas.

---

## 10. Checklist final

| Verificação | Comando / ação |
|-------------|----------------|
| Serviço ativo | `systemctl status canilapp.service` |
| Health público | `curl -sS https://api.seudominio.com/api/health` |
| TLS válido | Navegador ou `curl -vI https://api.seudominio.com` |
| Firewall DO | Portas 80 e 443 abertas para o tráfego web |
| Segredo JWT | Forte, exclusivo de produção, em `/etc/canilapp.env` |
| Backup SQLite | Cópia segura de `/opt/canilapp/data/canilapp.db` |

---

## Referências

- [Documentação DigitalOcean — Droplets](https://docs.digitalocean.com/products/droplets/)
- [API Reference DigitalOcean](https://docs.digitalocean.com/reference/api/reference/)
- [Publicar ASP.NET Core no Linux](https://learn.microsoft.com/aspnet/core/host-and-deploy/linux-nginx)

---

## Observação: App Platform (GitHub — só backend no monorepo)

Na página **Install & Authorize DigitalOcean** (GitHub), ao escolher **Only select repositories** e marcar `2.0CanilAPP`, estás apenas a **permitir que a DO leia esse repositório**. Não existe aí opção “não enviar o frontend”: o Git continua com `frontend/` e `backend/`; o que manda é **como configurares a App** depois do redirect para `cloud.digitalocean.com`.

1. **Source directory** (ou “Root Directory” / diretório de origem do componente): define **`backend/Backend`**. Assim o build da API corre em cima do projeto .NET certo, sem comando `npm` no `frontend/`.
2. **Build command** (exemplo):  
   `dotnet publish -c Release -o ./publish`  
   (executado já dentro de `backend/Backend`, conforme o passo 1.)
3. **Run command**: apontar para o DLL publicado (ex.: `dotnet publish/Backend.dll` — o caminho exato depende do `-o` que usares na build).
4. **`.doignore`** na raiz do repositório: lista pastas a **excluir do pacote enviado para o build** (similar ao `.gitignore`). Este projeto inclui `frontend/`, `node_modules`, artefactos de build, etc., para aligeirar e deixar explícito que o front não entra no contexto de publicação da API.

**SQLite na App Platform:** o ficheiro `.db` tem de ficar num **volume persistente** ligado ao componente; caso contrário os dados podem perder-se a cada deploy. Para SQLite simples num só servidor, o **Droplet** (guia acima) costuma ser mais direto.
