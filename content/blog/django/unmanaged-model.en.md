---
title: Applying Tests Using Unmanaged Model (feat. Table XXX doesn't exist)
type: Blog
date: 2022-04-20
comments: true
translated: true
---

Previously, I mentioned at work that we plan to reorganize the legacy code, which was written in Raw Query, into a Django ORM-based structure.

Some of the dilemmas I wrote about last time have been somewhat resolved, and methodologies for organizing project structures and files have been sorted out, so I'm planning to post about what happened while categorizing the models.

While analyzing the existing `SQL Query`, I checked which tables were joined with others and how much they were affected, and I think the model classification went well. Then, I encountered an issue while writing test codes to see if it worked properly. A ~~pleasant?~~ error occurred for the developer.

`Table my_database.XXX doesn't exist.`

~~What the heck... Why is the table missing?~~

---

## What is an Unmanaged Model?

In `Django`, when defining a `Model` that connects to a `DB`, you use the `django.db.models.Model` module. Since `Django` supports `migration` based on `Model`, if the design was done with a `Django Native App`, it can be set up to directly manage the `DB Table`.
_I will post more about `migration` in detail next time!_

In such cases, the `Model` defined in `Django` becomes the blueprint that directly accesses the database.

The DB Schema managed in `Django` is, by default, set in the `Model` class as `managed = True`. In the actual code, it will be applied like this:

```python
class MyModel(models.Model):
  ...
  # Define DB fields
  ...
  class Meta:
    db_table = "real_database_table_name"
    managed = True # This is the part here.
```

The `Meta` class inside the `Model` is set as default in the `Django Model` when defining the model through a `Django Native App`, so you don't need to specify it separately.

 > However, if the managed variable set inside the Meta class is False, it becomes an Unmanaged Model, meaning a model not managed by Django. 

## Table xxx doesn't exist

Finally, I can explain the error I faced. In the case of `Django Unit Test`, the existing database is not used for testing.

**In fact, it should not be used.**

Even if it is a development database, your project can affect other projects, or the database can become messy due to many test executions (due to numerous duplicative test cases... ~~dirty~~).

To solve such problems, the `Django Test` uses the model schema defined with `managed = True` to create a `Test Database` in the DB, creates temporary tables, and runs tests within them. After the test ends, it deletes the test database and the tables along with it.

At this point, the table schema defined in `app/migration` becomes important.

Although it is said that the model was created according to the model, a middle step is necessary to apply the changes to the DB because model changes must be applied there. Therefore, `Django` tracks and judges changes through `migrations` within each app.

_+ When learning `Django`, you often use the `python manage.py makemigrations` and `python manage.py migrate` commands, and this is the code generated at that time!_

However, you should not use `migration` for `Unmanaged Model`. You should not let `Django` track a DB that might be used by another service. And you assume that the main subject of table modifications lies in the DB, not in `Django`. Therefore, it must be `managed = False`.

A lot of times, you use the `python manage.py inspectdb` command to generate code to Django models from the DB, and you can see that the generated model code has `managed = False`.

However, things are quite different for `Test`. Since it's a temporary DB, it doesn't matter if it's created, but due to the influence of `managed = False`, it cannot create a Test DB and consequently results in an error saying the table does not exist.

## Solution, then what should be done?

For my case, I solved it simply but a bit bluntly. (Ultimately successful, but I plan to change it, and it's not a recommended way.)

Many blogs introduce a method to change the `managed` to `False` before the test is run by replacing the `Default Test Runner` that runs the `Test`.

What I used and the examples below are fundamentally based on the above method.

### Solution #1: Intercepting Commands (The method I used)

I intercepted the command during the test and modified the setting to change `managed = False` if the command included `test`. The code to change is only two lines, so it was really simple, and it worked well.

First, define a code in the configuration file to determine if `test` is included in the Python command.

I referred to this reference: [https://stackoverflow.com/questions/53289057/how-to-run-django-test-when-managed-false](https://stackoverflow.com/questions/53289057/how-to-run-django-test-when-managed-false)

```python
# settings.py
...
UNDER_TEST = (len(sys.argv) > 1 and sys.argv[1] == 'test')
...
```
Then, put `managed = getattr(settings, 'UNDER_TEST', False)` in the meta class of the test model class as follows:
```python
# models.py
from django.conf import settings # Module to fetch the value defined in settings.py


class MyModel(models.Model)
  ...
  # Fields I defined
  ...
  class Meta(object):
      db_table = 'your_db_table'
      managed = getattr(settings, 'UNDER_TEST', False)
```

### Solution #2: Using a Custom Test Runner

In the above example, it is easy to test, but it has the downside that you have to change the `managed` variable of all the models to the same value.

If you keep proceeding in that way, as the number of tables increases, things you miss may increase, and in situations where working with others, it has a big disadvantage where another team member has to be aware of it while writing test codes. _(Many rules make developers struggle)_

As I mentioned earlier, defining and executing a specific `Test Runner` at runtime allows for a consistent code conduct among team members without any particular knowledge transfer, while maintaining the basic programming rules of `Django`.

The principle is to define a class that recognizes classes with `managed = False` and changes all classes to `managed = True` at runtime to execute tests.

However, since this is an example of code that hasn't been successfully completed yet, I will only leave the reference link.

_Perhaps, when I later deleted the `migration` folder in the latest successful case, the empty `migration` folder left behind was the main cause. (It was supposed to be removed completely.) I'll attempt it in the company later and update if applicable._

[Django 1.9 or higher](https://technote.fyi/programming/django/django-database-testing-unmanaged-tables-with-migrations/)

[Django 1.8 or lower](https://www.pythonfixing.com/2021/11/fixed-how-to-create-table-during-django.html)

## In Conclusion

> It may not be as neat as usual, but as I change and apply things one by one, I feel more confident. Even though the actual post isn't that long, at work, I had to spend a lot of time writing this post.. ㅠㅠ
> 
> I will conclude today's post here, and next time I would like to post more detailed content about the `Django Test Runner` or `migration` that I explored while finding today's bug!
> Thank you for reading today. Any questions or criticisms are always welcome. Please use the comments!