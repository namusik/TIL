# Jenkins 설정 

## nodejs 플러그인 사용

pulgins 에서 nodejs 설치 

Tools에서 add nodejs

## pem 키 jenkins가 쓸 수 있도록 복사
```sh
# jenkins 서버에 있어야 된다.
# /usr/local/share에 배치하면 모든 사용자가 이 파일에 접근할 수 있습니다. 이 디렉토리는 여러 사용자가 공유할 수 있는 데이터를 저장하는 중앙 위치로 사용되며, 시스템에 특정되지 않은 데이터(예: PEM 키)를 저장하는 데 적합
cp megabird-local-ec2.pem /usr/local/share/

# jenkins 계정이 읽을 수 있도록 권한 수정
sudo chown jenkins:jenkins /usr/local/share/megabird-local-ec2.pem

sudo chmod 644 /usr/local/share/megabird-local-ec2.pem
```

## ansible 사용해서 SSH 접속할 때 주의 
이상하게 ansible을 사용해서 ssh로 private ec2에 연결할 때 SSH 키가 검증되지 않았다. 

강제로 jenkins 서버 ec2에 jenkins 사용자로 연결해서 직접 ssh로 private 인스턴스에 연결하고 난 후에야 jenkins 파이프라인에서 ansible이 동작하게 되었다.

