# AWS 인프라 생성 TIP

1. VPC
   1. VPC를 만들면 메인 라우팅 테이블이 자동으로 만들어짐
      1. 이 테이블은 모든 서브넷과 자동으로 연결됨
   2. 이 때 CIDR 설계를 잘 해야될듯?
2. 서브넷
   1. 이름지을 때, 가용영역 (a~d)에 따라서 서브넷 이름에도 a~d 적어주면 좋을 듯하다.
3. 인터넷 게이트웨이
4. 라우팅 테이블
   1. 퍼블릭 테이블은 인터넷게이트웨이, 퍼블릿 서브넷 연결
   2. 프라이빗 테이블은 NAT 게이트웨이, 프라이빗 서브넷 연결
5. NAT 게이트웨이
   1. 퍼블릭 서브넷에 있어야 한다.
6. 보안그룹
   1. bastion 인스턴스 보안그룹
      1. SSH - 내 IP
   2. private 인스턴스 보안그룹
      1. SSH - bastion 인스턴스에 적용된 보안그룹을 선택
7. 인스턴스
   1. bastion 인스턴스 
      1. public subnet에
      2. 탄력적 IP 할당 필요
      3. public 보안그룹 설정
   2. private app 인스턴스
      1. private subnet에
      2. private 보안그룹 설정
   3. openVpn 용 인스턴스
      1. openvpn API 사용해야 함. OpenVPN Access Server
      2. public subnet에
      3. 보안그룹 자동생성 그대고 사용
      4. 탄력적 IP 할당 필요
8. 탄력적 IP
   1. 
9.  ㅇㅇ
10. ㅇㅇ
11. ㅇㅇ
12. ㅇㅇ
13. ㅇㅇ
14. ㅇㅇ 
