## 출처

https://velog.io/@ronron/github-public-repo%EB%A5%BC-fork%ED%95%98%EC%97%AC-private%EC%9C%BC%EB%A1%9C-%EB%B0%94%EA%BE%B8%EA%B8%B0

1. private repo 만들기
2. fork할 repo clone하기. private repo에 복사하기
~~~git
git clone --bare public-repo git url
cd public-repo.git
git push --mirror private-repo git url
cd ..
rm -rf public-repo.git (public-repo bare clone 삭제)
~~~
3. pull하기
~~~git
git clone private-repo git url
~~~