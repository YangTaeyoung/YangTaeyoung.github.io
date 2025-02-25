---
title: Application de tests en utilisant un modèle Unmanaged (feat. Table XXX n'existe pas)
type: Blog
date: 2022-04-20
comments: true
translated: true
---

Je vous avais déjà dit qu'on essayait de refondre du code legacy écrit en requêtes brutes vers du Django ORM dans notre entreprise, n'est-ce pas?

Certains des dilemmes que j'avais évoqués la dernière fois ont trouvé leur résolution et des méthodologies pour structurer le projet ou organiser les fichiers se sont formalisées. Je vais donc poster à propos des événements qui ont eu lieu lors de la classification des modèles.

En analysant les `SQL Query` existantes, j'avais bien réussi à classer les modèles en vérifiant quelles tables étaient jointes entre elles et en évaluant leur impact. Et en tentant d'écrire du code de test pour m'assurer que tout fonctionne bien, un problème est survenu. Un ~~agréable?~~ bug est apparu pour le développeur.

`Table my_database.XXX doesn't exist.`

~~Quoi... où est passée la table?~~

---

## Qu'est-ce qu'un modèle Unmanaged?

Sous `Django`, on utilise le module `django.db.models.Model` pour définir des `Modèles` qui se connectent à la `Base de données`. Avec `Django`, il est possible de configurer l'accès et la gestion de la `Table DB` si elle est conçue en tant qu'`Application Native Django` grâce au support des `migrations`.
_Je posterai plus en détail sur les `migrations` une prochaine fois!_

Dans ces cas-là, le `Modèle` défini devient un schéma pour se connecter directement à la base de données dans `Django`.

Ainsi, un schéma DB géré par `Django` est par défaut réglé avec un `managed = True` dans la classe `Model`. En code, cela ressemblerait à:

```python
class MyModel(models.Model):
  ...
  # Définition des champs DB
  ...
  class Meta:
    db_table = "real_database_table_name"
    managed = True # C'est cette partie.
```

Dans les définitions de modèles à travers l'`Application Native Django`, la classe interne `Meta` n'a pas besoin d'être explicitement déclarée, car `Django Model` la configure par défaut, donc il n'est généralement pas nécessaire de la configurer manuellement.

 > Dans le cas où la variable `managed` dans la classe Meta serait définie sur False, cela deviendrait un Modèle Unmanaged, c'est-à-dire un modèle non géré par Django. 


## Table xxx doesn't exist

Enfin, je vais expliquer l'erreur que j'ai rencontrée. Dans le cas de tests unitaires avec `Django`, on n'utilise pas la base de données existante pour effectuer les tests.

**En réalité, ce n’est pas recommandé.**

Même pour une base de données de développement, mon projet pourrait avoir des incidences sur d'autres projets, ou la base de données pourrait être désordonnée par de nombreux tests redondants... ~~(désordre...)~~

Pour résoudre ces problèmes, `Django Test` crée une `Test Database` basée sur le modèle où `managed = True` et y exécute les tests dans un tableau temporaire. Puis, après les tests, il supprime la base de données de test et ses tables.

À ce stade, le schéma de table défini dans `app/migration` est crucial.

Bien que je pensais suivre le modèle, il y a en réalité un processus intermédiaire pour appliquer les modifications à la DB, que `Django` détecte, juge et suit via les `migrations` dans chaque application.

_+ Lors de l'apprentissage de Django, on utilise fréquemment les commandes `python manage.py makemigrations` et `python manage.py migrate`, qui sont générées à ce moment-là!_

Cependant, dans le cas d'un `Modèle Unmanaged`, il ne faut pas utiliser `migration`. Il ne faut pas laisser `Django` traquer des DB qui pourraient être utilisées par d’autres services et on considère que la responsabilité de modifier des tables revient à la DB, et non à `Django`. Par conséquent, il doit être `managed = False`.

Pour créer du code modèle à partir d'une DB dans `Django`, on utilise beaucoup la commande `python manage.py inspectdb`, et le code du modèle généré montre que `managed = False`.

Cependant, la situation des `Tests` est très différente, car même pour une DB temporaire, où créer des tables n'a pas d'importance, l'impact de `managed = False` empêche la création d'une Test DB, et l'erreur de non-existence de table en résulte.

## Solution, que devrions-nous faire alors?

Dans ma situation, j'ai utilisé une solution simple mais quelque peu brute. (Bien que fonctionnelle, je ne recommande pas cette méthode et compte la changer à terme).

De nombreux blogs recommandent de changer le `Default Test Runner` utilisé pour exécuter les `Tests` et modifier le `managed` dans la `Meta Class` du modèle avant d'exécuter un test.

Bien que j'ai suivi cette approche, le principe du code d'exemple ci-dessous est identique.

### Solution #1: Interception de commande (ma méthode)

Lors de l'exécution d'un test à travers une commande, je l'intercepte pour changer `managed = False` si `test` est inclus dans la commande. Le changement de code était vraiment simple et bien fonctionnant.

D'abord, ajouter une fonction pour vérifier si `test` est inclus dans la commande Python dans le fichier de configuration.

Référence utilisée : [https://stackoverflow.com/questions/53289057/how-to-run-django-test-when-managed-false](https://stackoverflow.com/questions/53289057/how-to-run-django-test-when-managed-false)

```python
# settings.py
...
UNDER_TEST = (len(sys.argv) > 1 and sys.argv[1] == 'test')
...
```
Ensuite, insérer `managed = getattr(settings, 'UNDER_TEST', False)` dans la classe Meta du modèle de test comme suit :
```python
# models.py
from django.conf import settings # Module permettant de récupérer les vals de settings.py.

class MyModel(models.Model):
  ...
  # Mes champs définis
  ...
  class Meta(object):
      db_table = 'your_db_table'
      managed = getattr(settings, 'UNDER_TEST', False)
```

### Solution #2: Utilisation d'un Test Runner Personnalisé

L'avantage de l'exemple précédent est la simplicité du test, mais il présente l'inconvénient de forcer le changement de la variable `managed` sur tous les modèles testés.

Avec de nombreux tables, cela pourrait être fastidieux et un inconvénient important si quelqu'un d'autre crée du code de test sans en être conscient. _(Trop de règles peuvent compliquer la vie des développeurs)_

En définissant un `Test Runner` personnalisé, qui exécute le code de test tout en préservant les règles de programmation de base de `Django`, l'équipe peut exécuter un code de manière cohérente sans transmission d'informations.

Le principe est de définir une classe où le `Test Runner` reconnaît les classes `managed = False`, et change tous ces classes en `managed = True` au moment de l’exécution du test avant de procéder.

Bien que mon code actuel n’ait pas réussi, je laisse des références pour plus de détails :

[Django 1.9 et supérieur](https://technote.fyi/programming/django/django-database-testing-unmanaged-tables-with-migrations/)

[Django 1.8 et inférieur](https://www.pythonfixing.com/2021/11/fixed-how-to-create-table-during-django.html)

## Conclusion

> Ce n'était peut-être pas aussi bien organisé que d'habitude, mais j'ai l'impression que ma confiance grandit en changeant et appliquant les choses pas à pas. Bien que le post en lui-même ne soit pas très long, cela m’a pris beaucoup de temps au bureau pour rédiger cet article... ㅠㅠ
>
> Je vais clôturer le post d’aujourd’hui ici. La prochaine fois, j’aimerais me pencher de manière plus détaillée sur le `Django Test Runner` découvert pendant la résolution du bug d'aujourd'hui, ou encore sur les `migrations` !
> Merci aussi de m'avoir lu aujourd'hui. Vos questions ou critiques sont les bienvenues à tout moment. Veuillez utiliser les commentaires!