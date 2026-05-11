# Docker Compose

https://docs.docker.com/compose/

https://docs.docker.com/reference/cli/docker/compose/

## 개념
- 여러 개의 Docker 컨테이너를 동시에 정의하고 실행할 수 있게 해주는 도구
- 여러 서비스를 하나의 YAML 파일(docker-compose.yml)에 정의
- 여러 개의 컨테이너를 한 번에 쉽게 관리하고 실행

## docker-compose.yml
```yml
  web:
    # 이미지 build할 때
    build: .
    ports:
      - "8080:80"
    networks:
      - app-network
  db:
    # 기존 이미지 사용할 때
    image: postgres:latest
    volumes: # 도커 볼륨 마운트
    - db:/var/lib/mysql
    restart: always # 컨테이너 재시작전략. 에러가 나도 계속 재시작
    environment: # 환경변수
      POSTGRES_PASSWORD: example
    networks: # 특정 네트워크 연결
      - app-network
  redis:
    depends_on:  # 해당 컨테이너가 실행되고 난 다음에. 준비되었음의 여부는 확인하지 않음
    - db
    image: redis:latest
    networks:
      - app-network

volumes:
  db: {}

networks:
  app-network:
    driver: bridge
```
1.	서비스(services): 애플리케이션에서 실행되는 **각각의 컨테이너**입니다. 예를 들어, 웹 서버, 데이터베이스, 캐시 서버 등이 각각 하나의 서비스가 됩니다. 컨테이너 수평 확장 가능
2.	네트워크(networks): **서로 다른 컨테이너들이 서로 통신할 수 있게 네트워크를 설정**할 수 있습니다. 기본적으로 Docker Compose는 컨테이너들이 서로 통신할 수 있게 하나의 기본 네트워크를 생성합니다.
3.	볼륨(volumes): 데이터나 설정 파일을 **여러 컨테이너에서 공유**할 수 있게 해주는 방법입니다. 예를 들어, 데이터베이스의 데이터를 저장하거나, 웹 서버의 설정 파일을 공유할 때 사용됩니다.


## 명령어
```sh
# docker-compose.yml 파일에 정의된 모든 서비스를 시작
docker compose up

 ✔ Network build_default    Created     # default 브릿지 네트워크 생성됨.
 ✔ Container build-redis-1  Created     # 프로젝트명-서비스명-컨테이너 인덱스 
 ✔ Container build-web-1    Created
- project 이름을 지정해 주지 않으면 디렉토리명으로 생성됨

# 백그라운드 시작 & 프로젝트 이름 지정
docker compose -p my-project up -d 

# 실행 중인 모든 서비스를 중지하고, 네트워크와 볼륨 등 관련 리소스를 정리
docker compose -v

# 실행 중인 서비스의 로그를 확인
docker compose logs

# compose 프로젝트 확인
docker compose ls

# 컨테이너 스케일 업. 서비스명을 적어준다
docker compose -p my-project up --scale web=3 -d
- ports에 호스트 포트를 지정해주거나, container 이름을 지정해주면 스케일업이 안됨

# compose 서비스 확인
docker compose -p my-project ps
NAME                 IMAGE            COMMAND                   SERVICE   CREATED          STATUS          PORTS
my-project-redis-1   redis:alpine     "docker-entrypoint.s…"   redis     16 minutes ago   Up 13 minutes   6379/tcp
my-project-web-1     my-project-web   "flask run"               web       16 minutes ago   Up 13 minutes   0.0.0.0:54077->5000/tcp
my-project-web-2     my-project-web   "flask run"               web       18 seconds ago   Up 18 seconds   0.0.0.0:56232->5000/tcp
my-project-web-3     my-project-web   "flask run"               web       18 seconds ago   Up 18 seconds   0.0.0.0:56233->5000/tcp


docker compose -p my-project logs
```