# Changelog — MamiNa bêta

## 1.1.37-beta.7 — 2026-10-01

- Date de publication affichée dans chaque vignette de la liste d’édition des articles Aide.
- Liste d’édition triée par date décroissante ; identifiant du message Telegram décroissant en cas d’égalité. Les dates inconnues passent en dernier.
- Photos affichées intégralement dans les deux dispositions, avec proportions conservées et centrage dans la zone disponible. Suppression du recadrage automatique : une photo 4:3 conserve notamment toute sa hauteur.
- Les limites photo publiées correspondent à l’image effectivement dessinée, pour la vue photo du lecteur.
- Les images déjà publiées ne peuvent pas retrouver les pixels supprimés : republier l’article avec sa photo source pour corriger un ancien recadrage.
- Versions application, packages et cache PWA alignées.

### Vérifications

- Tests de régression ajoutés pour le tri par date (égalité et date absente) et la conservation de photos 4:3, 3:4, carrées et proches de 4:3 dans les deux dispositions.
- Contrôles syntaxiques et versions vérifiés en mémoire. GitHub Actions : `npm run check`, tests de régression et `npm run build` réussis sur le commit `d66dcfb`. Déploiement GitHub Pages réussi.
- Validation visuelle sur appareil encore nécessaire.

## 1.1.37-beta.6 — 2026-10-01

### Canal Aide : corrections

- Compteur de lignes dynamique dans l’éditeur riche partagé, visible uniquement pour la rédaction d’un article Aide. Il utilise les mêmes mesures de texte, titre et disposition que l’aperçu et signale un dépassement, y compris après une modification de mise en forme.
- Photo portrait rendue en 3:4, photo paysage en 4:3, avec recadrage centré respectant l’orientation de l’image. Les images déjà publiées restent telles qu’elles ont été générées.
- Comparaison des noms de sujets Telegram normalisée des deux côtés : le sujet Aide existant est retrouvé et réutilisé.
- Lecture de tous les sujets Aide homonymes créés par les anciennes bêtas : récupération des articles dans la liste d’administration et le lecteur, sans suppression des sujets Telegram.
- Les contributions aux articles récupérés utilisent leur sujet Telegram d’origine ; les états de visibilité sont résolus dans l’ordre des messages.
- Bouton « Aide & idées » compact sous le logo MamiNa, qui reste centré.
- Recalcul de l’aperçu avant publication pour éviter d’utiliser un rendu périmé.
- Versions de l’application, des packages et du cache PWA alignées.

### Vérifications

- Analyse syntaxique JavaScript, références DOM, unicité des identifiants HTML et cohérence des versions contrôlées en mémoire.
- Scénario de régression exécuté en mémoire : deux sujets Aide homonymes donnent deux articles utilisateur, deux entrées admin et la bonne destination pour les contributions.
- Ajout de `tools/check-help.mjs` à `npm run check` : couverture des sujets homonymes, textes, liste admin, masquage/restauration et destination des contributions.
- GitHub Actions : `npm run check` (dont le test de régression Canal Aide) et `npm run build` réussis sur le commit `75bab5c`. Déploiement GitHub Pages réussi.
- Pas de navigateur disponible dans cette session : validation visuelle et saisie réelle sur appareil encore nécessaires.
- À valider sur appareil : compteur pendant saisie/mise en forme, cadrage des photos et présentation du bouton.

## Historique antérieur

Le dépôt ne contenait pas de CHANGELOG.md avant cette version. Les étapes antérieures restent consultables dans l’historique Git.
