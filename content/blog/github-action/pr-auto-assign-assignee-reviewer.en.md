---
title: How to Automatically Assign Assignees and Reviewers in PR (Pull Request)
type: blog
date: 2024-05-23
comments: true
translated: true
---

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716454592138.png)

When developing in a company, there are times when trivial things become annoying.

For example, there might be rules requiring specific labels or designating specific Assignees and Reviewers when raising a PR, which are simple but tedious and easy to forget... Such things seem to be the case.

It was the same when I first joined the company; determining which label to attach and which Reviewer to designate seemed cumbersome.

## Auto Assign Action
Actually, Github’s features don’t automatically designate these. However, by using Github Actions events, you can target specific actions to be performed when a PR is opened.

While you can implement actions yourself, it is convenient to use existing implementations to automatically assign Assignees and Reviewers.

In this example, we will use the [Auto Assign Action](https://github.com/kentaro-m/auto-assign-action) available in the Github Actions marketplace.

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716454564478.png)

According to the specification, Assignees and Reviewers can be designated by group.

It seems useful when a repository is managed by multiple teams.

Additionally, it is possible to define labels or keywords to include or ignore, allowing the Auto Assign Action to ignore PRs that don’t require it (e.g., release PRs, test PRs, etc.).

## Usage
To use this action, you need to prepare two files: a configuration yaml file to set up the action, and a Github Workflow yaml file to use Github Actions.

```yaml{filename=".github/auto_assign.yml"}
# Reviewer auto-assignment settings
addReviewers: true

# Set Assignee as Author
addAssignees: author

# List of users to add as Reviewers
reviewers:
  - YangTaeyoung # My name
  - {Team_Member_Github_Username_1}
  - {Team_Member_Github_Username_2}
  - {Team_Member_Github_Username_3 ...}

  
# Number of additional reviewers
# Set to 0 to add all reviewers in a group (default: 0)
numberOfReviewers: 0

# Skip the reviewer addition process if the following keywords are included in the Pull Request
skipKeywords:
  - exclude-review # Keyword setting to exclude reviews
```

Besides these parameters, there are various conditions under which automatic assignment can be done.

The workflow can be constructed as follows.

```yaml{filename=".github/workflows/auto_assign.yml"}
name: 'Auto Assign'
on:
  pull_request:
    types: [opened, ready_for_review]
    
jobs:
  add-reviews:
    runs-on: ubuntu-latest
    permissions: # Permission settings
      contents: read
      pull-requests: write
    steps:
      - uses: kentaro-m/auto-assign-action@v2.0.0
        with:
          configuration-path: '.github/auto_assign.yml' # Only needed if you use something other than .github/auto_assign.yml
```

Here, `opened` refers to when the PR is opened, and `ready_for_review` means when a Draft PR changes to Open status.

The part different from the example in the repo is the `permission` setting below. When the action is executed, if the warning `Warning: Resource not accessible by integration` appears and the Reviewer and Assignee are not assigned, by setting the permission, the warning disappears, and assignments occur automatically.
```yaml
permissions: # Permission settings
  contents: read
  pull-requests: write
```

By attaching this action, you can hear small cheers from your team members. 😁

![image](/images/github_action/pr-auto-assign-assignee-reviewer-1716458343634.png)