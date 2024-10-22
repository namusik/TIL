# Amazon EC2

## EC2 생성
- 이름 태그 추가할 때, 리소스 유형에 볼륨도 선택해주기
- ec2 스토리지 구성 > 고급 > 종료시 삭제 : 예 
  - ec2 삭제시 같이 삭제되도록
- 중지하고 재시작하면 public ip는 재설정됨.


## SSH 연결
```sh
# pem 키 권한 파일을 읽을 수 있는 권한을 소유자만 가지게 설정
chmod 400 ./megabird-local-ec2.pem

# ssh 연결
ssh -i ./megabird-local-ec2.pem ec2-user@15.165.253.184

# private 인스턴스 연결
bastion 서버에 먼저 ssh로 붙는다.
bastion 서버에 pem 키를 업로드 
ssh로 private 인스턴스 private IP로 연결
```