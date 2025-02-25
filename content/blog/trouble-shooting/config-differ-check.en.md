---
title: Prevent Missing Configuration Values Across Environments
type: blog
date: 2025-01-03
comments: true
translated: true
---
## Why Is Configuration Management Difficult?
One recurrent issue during every deployment has been configuration. 

In our company, we use Spring Boot, and configurations that differ by deployment environment are managed using Spring Cloud Config.

Typically, configurations in Spring are managed through application.yml, but the fundamental problem lies in the reflection of this configuration file.

![image](/images/trouble-shooting/config-differ-check-1735855932407.png)

In our company, deployments proceed in the following order: environments are divided into dev, qa, stage, and production, each with its unique configuration file.

The issue arises when any configuration is missed, potentially necessitating a redeployment or causing unreflected content in production due to a missing configuration file.

## 1. Creating Deployment Reviews
![image](/images/trouble-shooting/config-differ-check-1735856331653.png)

To resolve this, the initial thought was to have a review session before deployment.

The drawback to this approach is that it consumes everyone's time and has high costs, so we currently only review added infrastructure or configuration before production deployment.

This approach was more effective in preventing missing configurations as multiple people reviewed it. However, scrutinizing each added part extended the review time.

## 2. Creating a Configuration File Comparison Action
The second approach we implemented was creating a bot to compare configuration files.

While there are YAML comparison tools available, they compare values entirely, which isn't suitable for comparing files with environment-specific values.

Thus, we considered the following method:

1. Extract only the Key values from the configuration files for each environment.
2. Check for differences in types, missing keys on one side, or index differences in arrays, etc.
3. Generate a report as a comment on the PR for merging branches of each environment if changes are detected.

This allows for accurate tracking of missing configurations across environments.

### Design
![image](/images/trouble-shooting/config-differ-check-1735857073333.png)

The overall structure is fairly straightforward, and the basic setup is as follows. We implemented a CLI tool called [yaml-diff-reporter](https://github.com/YangTaeyoung/yaml-diff-reporter), which parses and compares two YAML configuration files, exporting the report to the console or a file.

> Usage instructions are included, so if you're facing similar issues, feel free to use it. It is implemented to allow file comparison mode selection via flags.

### Creating the Action
```yaml
name: Configuration File Comparison

on:
  pull_request:
    branches: [ qa, stg, prod ]
```

As previously mentioned, we have four environments. Generally, during development, the code merges into dev, and for deployment, a PR for `qa`, `stg`, or `prod` is created, hence the setup.

```yaml
jobs:
  config-check:
    permissions:
      contents: read
      pull-requests: write
      issues: write
env:
  MERGE_FROM: ${{ github.event.pull_request.base.ref == 'qa' && 'dev' || (github.event.pull_request.base.ref == 'stg' && 'qa' || 'stg') }}
  MERGE_TO: ${{ github.event.pull_request.base.ref }}
```
As our server operates in a Private Repository, permissions are granted for the bot token to write PR comments.  
Moreover, the settings are arranged to compare dev with qa, and qa with stg based on the current environment, by setting MERGE_FROM and MERGE_TO environment variables.

```yaml
runs-on: ubuntu-latest
steps:
  - name: Install Go
    uses: actions/setup-go@v5
    with:
      go-version: '1.23'
  - name: Install yaml-diff-reporter CLI
    run: go install github.com/YangTaeyoung/yaml-diff-reporter@v1.0.0
```
Go is installed, followed by the `yaml-diff-reporter`. Side note: Go makes it very convenient to install CLI tools with a simple install command.  

```yaml
  - name: Download Config Files
    uses: AcmeSoftwareLLC/github-downloader@v1
    with:
      git-pat: ${{ secrets.GH_TOKEN }}
      repo: # Cloud Config Repository
      ref: # Cloud Config Repository Branch
      includes: |
        {application yaml path}/${{ env.MERGE_FROM }}/application.yml:${{ env.MERGE_FROM }}.yml
        {application yaml path}/${{ env.MERGE_TO }}/application.yml:${{ env.MERGE_TO }}.yml
```
Files are then downloaded from the specified path in the Github Repository. There are numerous existing download actions, so feel free to choose any that suit your needs.

```yaml
  - name: Compare Config Files
    id: compare
    run: |
      DIFF_RESULT=$(yaml-diff-reporter -l ${{ env.MERGE_FROM }}.yml -r ${{ env.MERGE_TO }}.yml \
      -la ${{ env.MERGE_FROM }} -ra ${{ env.MERGE_TO }} \
      -M type -M key -M index \ # Specify mode (excluding value)
      -I  # Specify keys to ignore
      -lang ko # Specify report output language, currently supports Korean (ko) and English (en)
      -f markdown) # Specify report format: markdown, JSON, or plain text

      echo "diff_result<<EOF" >> $GITHUB_OUTPUT
      echo "${DIFF_RESULT}" >> $GITHUB_OUTPUT
      echo "EOF" >> $GITHUB_OUTPUT
```

The downloaded files are compared using CLI, and the results are stored in the variable `diff_result`, which is then specified as the output of the step.
> The reason for using EOF is that reports are output in multiline format.<br>
> For a single line, something like `echo "diff_result=${DIFF_RESULT}"` would suffice.

```yaml
  - name: Create Result PR Comment
    if: always()
    uses: thollander/actions-comment-pull-request@v3
    with:
      message: |
        # Configuration File Comparison Result
        ${{ steps.compare.outputs.diff_result == 'No differences found' && '![pass-badge](https://img.shields.io/badge/check-passed-green)' || '![fail-badge](https://img.shields.io/badge/check-failed-red)' }}

        ${{ steps.compare.outputs.diff_result }}

        ## File Reference
        - [${{ env.MERGE_FROM }}.yml](Github file path)
        - [${{ env.MERGE_TO }}.yml](Github file path)
        

  - name: Handle Failure (On Differences)
    if: steps.compare.outputs.diff_result != 'No differences found'
    run: exit 1
```

The result is then written as a PR comment, and if it fails, the action is set to fail, preventing merging of the PR. You can also just output the report with `${{ steps.compare.outputs.diff_result }}`, but I decided to embellish it a bit.

## Outcome
![image](/images/trouble-shooting/config-differ-check-1735858672464.png)

Sensitive internal information has been redacted, but the result shows comments in the PR indicating which keys have issues, making it easier to understand.

## Drawbacks
This method also has a clear drawback. It only compares newly added keys, so if existing values are changed or modified, simple comparisons of keys or types alone won't detect this.

As there is no perfect silver bullet, developers must continually strive, improve, and search for better solutions.