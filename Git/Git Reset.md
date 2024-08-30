# Git Reset

- 깃 push 이력을 특정 commit으로 reset 하는 법

```git
git log

git reset --hard <COMMIT_HASH>

git push origin <branch_name> --force
```
- hard 옵션을 주면 local에서 commit 이력을 다 지움.
- soft 옵션을 주면 local에서 commit 이력을 지우고 해당 코드 변경사항이 changes에 뜬다.