# Acordes para o Futuro · site

Site estático da ação social de Dia das Crianças 2026 no CCInter Vila Nilo.
HTML, CSS e JavaScript puros: sem framework, sem build, sem backend.

```
index.html            página única (todo o conteúdo)
css/styles.css        estilos (tokens de cor/tipografia no topo)
js/main.js            menu, copiar Pix, contagem regressiva, galeria, compartilhar, barra de arrecadação
assets/img/           fotos (WebP), QR Code Pix (SVG), imagem de compartilhamento (compartilhar.jpg)
404.html              página de erro
CNAME                 domínio personalizado (GitHub Pages)
robots.txt, sitemap.xml
```

## Rodar localmente

```powershell
cd C:\Users\Gustavo\projeto_acordes\site
python -m http.server 8000
```

Abrir http://localhost:8000.

## Publicar de graça: GitHub Pages + DNS do Registro.br

Custo único: o domínio no Registro.br (cerca de R$ 40/ano). Hospedagem, HTTPS e DNS saem de graça.

### 1. Registrar o domínio

1. Em https://registro.br, pesquise `acordesparaofuturo.com.br` e registre com seu CPF.
2. Pague com Pix: a confirmação é mais rápida que a do boleto.
3. Mantenha a opção padrão de DNS, que usa os servidores do próprio Registro.br.

### 2. Publicar no GitHub

```powershell
cd C:\Users\Gustavo\projeto_acordes\site
git init -b main
git add .
git commit -m "Site Acordes para o Futuro"
gh repo create acordesparaofuturo --public --source . --remote origin --push
gh api -X POST repos/GustavoMolino59/acordesparaofuturo/pages -f "source[branch]=main" -f "source[path]=/"
```

O repositório precisa ser público: o GitHub Pages é grátis só para repositório público.
O mesmo pela interface: em **Settings → Pages → Build and deployment**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.

O arquivo `CNAME` já aponta para `acordesparaofuturo.com.br`. Até o DNS funcionar, o endereço `*.github.io`
redireciona para o domínio e ainda não abre. Isso é esperado.

### 3. Verificar o domínio na sua conta do GitHub (recomendado)

Isso impede que outra conta do GitHub use o seu domínio.

1. Acesse https://github.com/settings/pages e clique em **Add a domain**: `acordesparaofuturo.com.br`.
2. O GitHub mostra um registro TXT, `_github-pages-challenge-GustavoMolino59`, e um código. Ele entra no DNS no passo 4.
3. Depois de criar o registro, volte nessa tela e clique em **Verify**.

### 4. Configurar o DNS no Registro.br

No painel do Registro.br, abra o domínio, vá à seção **DNS** e edite a zona. Se o painel pedir para ativar o
"modo avançado", ative: a ativação pode levar algum tempo. Crie os registros abaixo. Para o domínio raiz,
deixe o campo de nome vazio.

| Tipo  | Nome                                       | Valor                       |
|-------|--------------------------------------------|-----------------------------|
| A     | (vazio)                                    | 185.199.108.153             |
| A     | (vazio)                                    | 185.199.109.153             |
| A     | (vazio)                                    | 185.199.110.153             |
| A     | (vazio)                                    | 185.199.111.153             |
| AAAA  | (vazio)                                    | 2606:50c0:8000::153         |
| AAAA  | (vazio)                                    | 2606:50c0:8001::153         |
| AAAA  | (vazio)                                    | 2606:50c0:8002::153         |
| AAAA  | (vazio)                                    | 2606:50c0:8003::153         |
| CNAME | www                                        | gustavomolino59.github.io   |
| TXT   | _github-pages-challenge-gustavomolino59    | (código mostrado no passo 3)|

Os registros AAAA (IPv6) são opcionais, mas recomendados.

Para conferir a propagação, que leva de minutos a algumas horas:

```powershell
nslookup acordesparaofuturo.com.br 8.8.8.8
nslookup www.acordesparaofuturo.com.br 8.8.8.8
```

### 5. Ativar o HTTPS

Em **Settings → Pages** do repositório:

1. Confira se o campo **Custom domain** mostra `acordesparaofuturo.com.br` e o *DNS check* passou.
2. Quando o certificado for emitido (minutos, às vezes até 24 h), marque **Enforce HTTPS**.

Pelo terminal:

```powershell
gh api -X PUT repos/GustavoMolino59/acordesparaofuturo/pages -F https_enforced=true
```

Depois disso, `https://acordesparaofuturo.com.br` e `https://www.acordesparaofuturo.com.br` passam a abrir o site.
O endereço com www redireciona para o domínio sem www.

## Atualizar o site

Edite os arquivos e publique:

```powershell
git add .
git commit -m "Atualiza valor arrecadado"
git push
```

A publicação leva cerca de 1 minuto. O cache do GitHub Pages pode segurar a versão anterior por até 10 minutos.

### Barra de arrecadação

No `index.html`, procure `data-arrecadado` e preencha os dois campos:

```html
<div class="progress" data-progress data-meta="12179.81" data-arrecadado="3.500,00" data-atualizado="10/10/2026" hidden>
```

Com `data-arrecadado` vazio, a barra fica escondida.

### Horário da entrega

Quando o horário for confirmado, troque o texto "Horário a confirmar" no `index.html`.
Se quiser, inclua o horário também no `startDate` do bloco `application/ld+json`, no formato `2026-10-16T14:00-03:00`.

### Prévia no WhatsApp

A imagem e o texto da prévia vêm das tags `og:*` no `<head>`. Se mudar a imagem `assets/img/compartilhar.jpg`,
o WhatsApp pode demorar para atualizar a prévia de links já compartilhados.
