# Site Webmarketing Conseil — version statique (sans Webflow)

Site complet en HTML/CSS/JS. Aucune dépendance à Webflow ni à jsDelivr : **tout est dans ce dossier** (pages, styles, scripts, polices, images).

## Structure

```
site/
├── index.html                              → page d'accueil  (/)
├── accompagnement/index.html               → /accompagnement
├── agence/index.html                       → /agence
├── cold-emailing/index.html                → /cold-emailing
├── contact/index.html                      → /contact
├── formations/index.html                   → /formations
├── formations-ia/index.html                → /formations-ia
├── prospection-email/index.html            → /prospection-email
├── webinaire/index.html                    → /webinaire
├── outil-strategie-trafic-clients/index.html
├── bonus/index.html
├── validation/…  validation-entretien/…  validation-inscription-webinaire/…   (pages de confirmation, en noindex)
├── css/site.css        → tous les styles + @font-face (polices locales)
├── js/site.js          → animations + diagnostic + redirections de formulaire
├── assets/             → images + polices (.woff2)
├── sitemap.xml · robots.txt · 404.html · CNAME · .nojekyll
```

Chaque dossier `slug/index.html` donne une **URL propre** (`/slug`). Chaque page contient son `<head>` complet : titre + meta description SEO, Open Graph, favicon, polices, `site.css`, et un **bloc TRACKING** à remplir.

## 1) Mettre vos scripts de conversion

Dans **chaque** page, en haut du `<head>`, un bloc commenté `<!-- ===== TRACKING ===== -->` contient des modèles GA4, Meta Pixel et LinkedIn. Décommentez et remplacez les ID.

> Astuce : pour ne pas le coller 14 fois à la main, faites un rechercher-remplacer global sur tous les fichiers (votre éditeur de code, ou demandez-moi de l'injecter partout d'un coup une fois que vous avez les ID).

## 2) Mettre en ligne — 2 options

### Option A — Déploiement Git (recommandé)
1. Poussez le **contenu de ce dossier `site/`** à la racine d'un dépôt GitHub.
2. Connectez le dépôt à **Netlify**, **Cloudflare Pages** ou **Vercel** (publish directory = racine), OU activez **GitHub Pages** (Settings → Pages → Deploy from branch → root).
3. Pointez votre domaine `www.webmarketing-conseil.fr` vers l'hébergeur (le fichier `CNAME` est déjà prêt pour GitHub Pages).
4. À chaque modification : commit → le site se met à jour tout seul. **Plus de purge jsDelivr.**

### Option B — FTP / FileZilla
1. Connectez-vous à votre hébergeur en FTP.
2. Déposez **tout le contenu de `site/`** à la racine web (`www/` ou `public_html/`).
3. Pour mettre à jour : ré-uploadez le(s) fichier(s) modifié(s). Activez le HTTPS/SSL côté hébergeur.

## Chemins relatifs — fonctionne partout
Toutes les ressources et liens internes sont en **chemins relatifs**. Le site fonctionne donc tel quel à la **racine d'un domaine**, dans un **sous-dossier** (ex. `compte.github.io/site/`), et même en **ouverture locale** — sans rien changer.

## Points à décider
- **Blog** : les liens `/blog` pointent vers une section blog. Si votre blog reste sur WordPress, remplacez ces liens par son URL complète, ou intégrez le blog au même domaine.
- **Pages légales** : `/mentions-legales`, `/conditions-generales-de-vente`, `/politique-confidentialite` sont liées mais pas encore créées ici — à ajouter (je peux les générer).
- **Formulaires** : les `<form>` pointent vers des actions à remplacer par votre outil (Brevo, etc.) ; Contact utilise déjà l'embed Calendly. La redirection après envoi se règle côté outil.
