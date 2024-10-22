1.	Fork 대신 직접 clone하기:
•	먼저 원본 repository를 로컬로 clone합니다.

```sh
git clone https://github.com/원본-사용자/원본-레포지토리.git
```

2.	새로운 private repository 생성:
•	GitHub에서 새로운 private repository를 생성합니다. 이때, 동일한 이름을 사용할 수도 있고, 다른 이름을 사용할 수도 있습니다.
3.	로컬 repository에서 새 private repository로 push:
•	로컬로 clone한 repository의 remote URL을 새로 생성한 private repository로 변경합니다.

```sh
cd 원본-레포지토리
git remote remove origin
git remote add origin https://github.com/내-사용자명/새-private-레포지토리.git
```

4.	새 repository로 push:
•	모든 변경 사항을 새 repository에 push합니다.
```sh
git push -u origin main
```

•	원본 repository와의 연결이 끊기기 때문에, 원본 repository의 업데이트를 수동으로 동기화해야 합니다.
•	원본 repository와 동기화를 원할 경우, git remote add upstream 명령어로 원본 repository를 추적할 수 있습니다.
```sh
git remote add upstream https://github.com/원본-사용자/원본-레포지토리.git
git fetch upstream
git merge upstream/main
```