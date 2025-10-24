# Kafka 쿠버네티스 설치

broker가 controller 다 구동후에 띄우게 하려고
depends_on 은 단순히 시작 순서를 보장할 뿐,
“완전히 준비(ready)” 상태를 기다려주지는 않습니다.

즉:
	•	컨테이너 실행 → OK
	•	애플리케이션 부팅 완료 여부 → X (확인 안 함)

그래서 실무에서는 Healthcheck 를 함께 추가해 “컨트롤러가 진짜 리스닝 중인지” 확인하는 구성을 권장

controller1:
  healthcheck:
    test: ["CMD", "bash", "-c", "netstat -an | grep 9093"]
    interval: 5s
    retries: 10

broker : 
    depends_on:
  controller1:
    condition: service_healthy

이렇게 하면 컨트롤러 포트가 실제로 열릴 때까지 브로커가 대기하게 됩니다.