#systemd

##systemd란?

    PlD1을 차지하고 있는 프로세스 
    
    부팅부터 서비스 관리 로그관리 등의 시스템 전반적인 영역에 걸쳐있는 프로세스 

    리눅스는 OS이기 때문에, 전원을 ON할 경우 시스템을 초기화하고 환경설정을 누군가가 해주어야 함. 

    init과 다르게 병렬로 실행되어서 부팅속도 빨라짐. 

    systemctl 명령어도 systemd를 사용. 관리도구.

##init 

    systemd 이전에 사용되던 프로세스

    부팅 시 가장 먼저 시작되는 프로세스, 부모 프로세스

##systemctl 

    기존에는 시스템 서비스를 조작하기 위해 service 명령어 사용

    /etc/init.d 디렉토리에 있는 링크 파일들 중에 사직아니 종료 재시작을 
    선택할 수 있었음. 

~~~sh 
service vsftpd start

systemctl start vsftpd
~~~

