# 깃허브 커밋 기록 지우기

가장 최근에 한 Push에 보안정보가 들어있을 경우가 종종 있음. 

이때, 정보를 지우고 다시 push를 하더라도 commit history에 기록은 남아있음.

~~~terminal
git reset --hard HEAD^

git push origin main(브랜치명)

git push -f origin main(브랜치명)
~~~

## 참고

https://www.whatwant.com/entry/Git-%ED%8A%B9%EC%A0%95-%ED%8C%8C%EC%9D%BC%EC%97%90-%EB%8C%80%ED%95%9C-%EC%9D%B4%EB%A0%A5-%EC%82%AD%EC%A0%9C