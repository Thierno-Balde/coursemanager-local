# Spécifications Techniques : Persistance des Données & Gestion de Fichiers

## 1. Vue d'ensemble
L'application doit permettre à un formateur de gérer une hiérarchie de cours en local.
L'architecture de données repose sur deux piliers :
1. **Base de données JSON** : Pour la structure (Cours/Modules/Métadonnées).
2. **Système de Fichiers (File System)** : Pour le stockage sécurisé des documents lourds.

## 2. Stack Technique Recommandée
*   **Framework** : Electron
*   **Base de données** : `lowdb` (v1 ou v3 selon préférence ESM/CJS) ou `electron-store`.
*   **Gestion Fichiers** : `fs-extra` (pour la copie facilitée) + `path`.
*   **Utilitaires** : `uuid` (pour la génération d'IDs uniques).

## 3. Modèle de Données (Schema JSON)
Le fichier `db.json` stockera l'arbre complet.
*Ne jamais stocker de binaire (base64) dans ce fichier.*

```json
{
  "courses": [
    {
      "id": "uuid-v4-course-01",
      "title": "Introduction au JavaScript",
      "createdAt": "2023-10-27T10:00:00Z",
      "modules": [
        {
          "id": "uuid-v4-module-01",
          "title": "Chapitre 1 : Variables",
          "resources": [
            {
              "id": "uuid-v4-res-01",
              "type": "file", 
              "format": "pdf",
              "name": "Support de cours.pdf",
              "path": "resources/uuid-v4-res-01.pdf" 
            },
            {
              "id": "uuid-v4-res-02",
              "type": "link",
              "provider": "youtube",
              "name": "Démo Vidéo",
              "url": "https://youtube.com/watch?v=..."
            },
            {
              "id": "uuid-v4-res-03",
              "type": "cloud",
              "provider": "gdrive",
              "name": "Exercices Collab",
              "url": "https://docs.google.com/..."
            }
          ]
        }
      ]
    }
  ]
}
```

## 4. Logique de Gestion des Ressources

### A. Cas : Fichier Local (PPTX, PDF, MP4 local)
*Stratégie : "Managed Library" (Copie interne)*

1.  **Import** : L'utilisateur sélectionne un fichier via `dialog.showOpenDialog`.
2.  **Traitement** :
    *   Générer un ID unique pour la ressource.
    *   Définir le dossier de destination : `app.getPath('userData') + '/resources/'`.
    *   **Action** : Copier le fichier source vers le dossier destination (utiliser `fs.copyFile`).
3.  **Enregistrement** : Sauvegarder le *chemin relatif* ou absolu de la copie dans le `db.json`.

> **Avantage** : Si l'utilisateur supprime le fichier original de son dossier "Téléchargements", le cours reste intact.

### B. Cas : Ressource Web / Cloud (YouTube, Drive, Web)
*Stratégie : "External Reference"*

1.  **Import** : L'utilisateur colle une URL ou utilise un champ texte.
2.  **Enregistrement** : Sauvegarder l'URL directement dans le `db.json`.
3.  **Ouverture (Lecture)** :
    *   Utiliser `shell.openExternal(url)`.
    *   *Ne pas utiliser d'iframe ou de webview* pour éviter les problèmes de sécurité (CORS, Auth Google/Microsoft). L'ouverture se fait dans le navigateur par défaut de l'OS.

## 5. Points de vigilance
*   **Path** : Toujours utiliser `path.join()` pour gérer les séparateurs de fichiers (Windows `\` vs Mac `/`).
*   **Nettoyage** : Si un utilisateur supprime une ressource de type "Fichier" dans l'app, le code doit aussi supprimer le fichier physique dans le dossier `userData` pour ne pas encombrer le disque (utiliser `fs.unlink`).
