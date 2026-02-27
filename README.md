# AssurePro - Gestion de Fiches Assurance

Cette mini-application "Gestion de Fiches Assurance" a été développée dans le cadre du test technique frontend.

## Choix Techniques

1. **Framework & Architecture** :
   - Développé avec **Next.js 16 (App Router)** pour l'architecture des pages et les routes API intégrées.
   - **TypeScript** pour assurer un typage robuste sur l'ensemble de l'application.
2. **Gestion des données et authentification** :
   - Pour respecter la consigne d'une "API simulée" tout en ayant un rendu professionnel, j'ai opté pour implémenter une **API locale Next.js** (`/api/...`) qui utilise un fichier statique `data.json` pour la persistance à chaud selon votre règle (pas de fausse donnée / "no mock rule").
   - **Authentification** par JWT avec Cookies `HttpOnly`.
   - Mots de passe chiffrés avec `bcryptjs`.
3. **Gestion d'État & Fetching** :
   - Utilisation de **React Query (@tanstack/react-query)** pour la gestion des données asynchrones (mise en cache, invalidation après mise à jour, états de chargement fluides).
4. **Interface Utilisateur (UI)** :
   - **Tailwind CSS v4** pour le design responsif et sur-mesure.
   - **Shadcn UI** pour les composants de base (Table, Select, Card, Button, Input, Sheet...) avec les icônes de `lucide-react`.
   - **Recharts** pour la création de graphiques dynamiques sur le Dashboard.
   - **Sonner** pour les notifications toasts interactives.

## Fonctionnalités Implémentées

- **Dashboard** : KPI complets et répartition visuelle (par statut et par produit).
- **Authentification & Rôles** : Accès contrôlé via JWT. Les rôles (ADMIN et ADVISOR) déterminent la visibilité des fiches et la capacité de réassigner (ADMIN uniquement).
- **Liste des Fiches** : Affichage paginé avec recherche (par nom de client), et filtrage multi-critères (statut et produit). Badges de couleurs dynamiques en fonction des statuts.
- **Détails de Fiche** : Affichage scindé des informations du client et de son produit d'assurance.
- **Actions** : Tout conseiller peut mettre à jour le statut de sa fiche. Un admin peut réaffecter la fiche.
- **Responsive Design** : Sidebar rétractable sur Desktop pour un mode zen "icônes uniquement", et menu "Sheet" (Drawer) sur Mobile.

## Comptes de démonstration

Des comptes sont fournis directement sur l'écran de connexion (`/login`) via des boutons rapides :

- **ADMIN** : `admin@assurepro.fr` (Permet de voir et réassigner toutes les fiches)
- **ADVISOR** : `jean.dupont@assurepro.fr` (Ne voit que les fiches qui lui sont assignées)
- *(Mot de passe commun : `password123`)*

## Lancement du Projet

### 1. Installation des dépendances

```bash
npm install
```

### 2. Démarrage en développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

### 3. Build pour la production

```bash
npm run build
npm run start
```

---
*Réalisé par Nyamadi Atsu pour le test technique Frontend.*
