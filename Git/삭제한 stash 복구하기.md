# 실수로 삭제한 stash 복구하기

## Git 명령어

1. 삭제된 stash 목록 가져오기
```git
git fsck --unreachable | grep commit | cut -d ' ' -f3 | xargs git log --merges --no-walk
```

2. 복구할 stash의 commit hash를 넣고 복구하기
```git
git update-ref refs/stash [Commit hash] -m "다시 저장할 Stash 이름"
```

## 출처
https://mine-it-record.tistory.com/685