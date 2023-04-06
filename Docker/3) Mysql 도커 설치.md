# Docker에 Mysql 설치하기 

## 명령어 

docker run --platform linux/amd64 
-p 3306:3306 
--name [컨테이너 이름] 
-e MYSQL_ROOT_PASSWORD=[루트 유저 비밀번호] 
-e MYSQL_DATABASE=[데이터베이스 이름]
-e MYSQL_USER=[유저 이름]
-e MYSQL_PASSWORD=[비밀번호] 
-d mysql

    <이미지 다운>
    docker pull mysql

    <이미지 run>
    docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password --name mysqlCont mysql

혹은 비밀번호를 지정안하려면

    docker run -d -p 3306:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=yes --name mysqlCont mysql

    docker run --platform linux/amd64 -p 3306:3306 --name mysql -e MYSQL_ALLOW_EMPTY_PASSWORD=YES -e MYSQL_DATABASE=SALESMEMO_LOCAL -d mysql:5.6

    //ONLY_FULL_GROUP_BY 에러제거
    --sql-mode="STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION"

    <mysql 컨테이너 접속>
    docker exec -it mysqlCont /bin/bash

    <비밀번호 입력>
    mysql -u root -p

    비밀번호 입력창 나옴

    <비밀번호 없으면>
    mysql -u root

AWS RDS Mysql 접속 명령어

~~~sh
mysql -h 엔드포인트 -P 포트번호 -u 유저네임 -p
~~~