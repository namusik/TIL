```sh
# colima 설치
brew install colima

# qemu 설치
brew install qemu

# colima 시작
colima start --arch x86_64


#  ARM64 플랫폼으로 이미지 명시적 PULL
# Gerald Venzl이라는 Oracle 직원이 개인적으로 관리하는 이미지로, ARM64 (Apple Silicon) 아키텍처를 잘 지원하여 M1/M2 사용자들에게 인기가 많습니다. Express Edition (XE) 기반이며 사용이 간편합니다. 이 가이드에서는 이 이미지를 기준으로 설명합니다.
docker pull --platform linux/arm64 gvenzl/oracle-xe:latest

# 
docker run -d --platform linux/arm64 -p 1521:1521 -e ORACLE_PASSWORD=your_strong_password --name oracle-xe-m2 gvenzl/oracle-xe
```