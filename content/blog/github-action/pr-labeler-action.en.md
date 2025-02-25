---
title: Automatically Set Labels Based on Github PR (Pull Request) Titles and Issue Titles
type: blog
date: 2024-05-27
comments: true
translated: true
---

While reviewing our company's project, I found an action that is being used effectively, so I decided to post about it.

It is an action that automatically sets labels based on the PR title.

Typically, labels are attached to Github issues or PRs to easily categorize them. This is to facilitate history tracking or filtering of what types of issues or PRs existed later on. 
~~(It also makes the issues or PRs look prettier.)~~

If labels are manually added each time in the company, they might be missed or incorrectly attached. Below, I introduce an action that automatically sets labels based on PR and issue titles.

![image](/images/github_action/pr-labeler-action-1716800204381.png)

## PR Labeler Action
![image](/images/github_action/pr-labeler-action-1716800340299.png)

To automatically attach labels, we will use [Auto Labeler](https://github.com/jimschubert/labeler-action).

This action is registered on Github Marketplace and has the feature to automatically set labels according to PR and issue titles.

The usage is very simple.

First, create `.github/workflow/labeler.yml` and write the following. You can name the filename and name as you like.
```yaml
name: Community
on:
  issues:
    types: [opened, edited, milestoned]
  pull_request_target:
    types: [opened]

jobs:

  labeler:
    runs-on: ubuntu-latest

    steps:
      - name: Check Labels
        id: labeler
        uses: jimschubert/labeler-action@v2
        with:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

Since this file is a Workflow file, when you push, the action named `Community` which you specified, is created.

Now, create a detailed configuration file `.github/labeler.yml` and write the following.
```yaml
enable:
  issues: false
  prs: true

labels:
  'bug':
    include:
      - '\bfix\b'
  'enhancement':
    include:
      - '\bfeat\b'
  'documentation':
    include:
      - '\bdocs\b'
  'release':
    include:
      - '\brelease\b'
  'refactoring':
    include:
      - '\brefactor\b'
  'test':
    include:
      - '\btest\b'
```

In my case, I set `issues` to `false` in `enable` to attach labels only to PRs.

`labels` define the name of the label and the conditions under which the label will be attached.

The above configuration file defines labels such as `bug`, `enhancement`, `documentation`, `release`, `refactoring`, and `test`.

Since the default title of a PR is generated as a commit message when it is created, I set it up to integrate the Github commit message convention directly into the labels.

You can see that the labels are automatically set when you create a PR or an issue in this way.