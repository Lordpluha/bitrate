---
name: 🔄 CI/CD Issue
about: Report an issue with GitHub Actions workflows or deployment
title: "[CI/CD] "
labels: ["cicd", "infrastructure"]
assignees: []
---

## 📝 Description
<!-- Clear description of the CI/CD issue -->


## 🔧 Affected Workflow
- **Workflow File**: `.github/workflows/[workflow-name].yml`
- **Job**: [job-name]
- **Run ID**: [Link to failed workflow run]

## ❌ Current Behavior
<!-- What's happening? -->


## ✅ Expected Behavior
<!-- What should happen? -->


## 🔍 Error Details

### Error Message
```
# Paste error from workflow logs
```

### Workflow Logs
<!-- Link to workflow run or relevant log excerpts -->


## 🌐 Environment
- **Trigger**: [push | pull_request | schedule | workflow_dispatch]
- **Branch**: [master | develop | feature/...]
- **Runner**: [ubuntu-latest | windows-latest | macos-latest]

## 🛠️ Affected Services
- [ ] Docker build
- [ ] Tests (unit | integration | e2e)
- [ ] Deployment
- [ ] Security scanning
- [ ] Performance testing
- [ ] Release automation

## 💡 Possible Solution
<!-- If you have ideas -->


## 📊 Impact
- [ ] 🚨 **Critical** - Blocks all deployments
- [ ] 🔴 **High** - Blocks specific workflow
- [ ] 🟡 **Medium** - Intermittent failures
- [ ] 🟢 **Low** - Minor improvement

## 📚 References
<!-- Related workflow runs, issues, docs -->
