# Le rituel de la date — Grande Section

Application de rituel interactif conçue pour un tableau blanc interactif en format paysage. Elle fonctionne avec HTML, CSS et JavaScript natifs, sans bibliothèque ni connexion Internet.

## Lancer l’application

Ouvrir `index.html` dans Firefox. Le bouton **Plein écran** lance le mode plein écran du navigateur. Pour quitter ce mode, utiliser `Échap`.

L’application est pensée pour un écran de classe en paysage. Les choix peuvent être glissés vers la case correspondante ou simplement touchés. Le second geste facilite l’utilisation au stylet, à la souris ou sur un écran tactile.

## Déroulement

1. Choisir le jour parmi les sept jours présentés dans l’ordre.
2. Choisir le numéro du jour.
3. Choisir le mois parmi trois propositions mélangées.
4. Choisir une saison, puis vérifier la date.

Les réponses sont révélées seulement après la vérification. Les cases vertes sont correctes et les rouges sont à corriger. Le bouton **Retour** permet de revenir à l’étape précédente en gardant la réponse déjà posée ; une nouvelle sélection la remplace. **Recommencer** efface les réponses.

## Réglages enseignant

Le menu **Enseignant** permet de choisir la date du jour de l’ordinateur ou de travailler une date manuelle, et de choisir entre tous les numéros de 1 à 31 ou sept numéros autour du numéro attendu. Les réglages sont mémorisés dans le navigateur de l’appareil. Revenir à la date automatique dans ce menu pour reprendre le rituel quotidien.

La saison suit des dates fixes simplifiées : printemps à partir du 20 mars, été à partir du 21 juin, automne à partir du 22 septembre et hiver à partir du 21 décembre.

## Utilisation hors ligne et GitHub Pages

Pour un usage local, conserver les quatre fichiers dans le même dossier et ouvrir `index.html`. Aucune installation n’est nécessaire.

Pour publier le projet sur GitHub Pages, placer `index.html`, `style.css`, `app.js` et `README.md` à la racine du dépôt, puis activer **Settings → Pages → Deploy from a branch → main → /(root)**.

## Fichiers

- `index.html` : structure et libellés de l’application.
- `style.css` : mise en page responsive et styles adaptés au TBI.
- `app.js` : étapes, date cible, interactions tactiles et vérification.
- `README.md` : instructions d’utilisation et de publication.

## Pistes d’évolution

Le projet pourra accueillir un module météo indépendant, l’historique des dates, hier et demain, un calendrier mensuel ou des illustrations de saisons personnalisées.
