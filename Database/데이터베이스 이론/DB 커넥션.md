# DB 커넥션

## 개념

### max_connections

- 확인 방법
  - SHOW VARIABLES LIKE 'max_connections';
  - AWS RDS DB 파라미터 그룹 > max_connections
- 동시에 열려 있을 수 있는 세션 소켓(연결) 총합이 5,000개라는 뜻
  - 애플리케이션-커넥션 풀에서 점유한 연결, DBA가 접속한 세션, Aurora 내부·백그라운드 쓰레드, 복제·메인터넌스 작업까지 모두 포함


## DB 세션 기간


### wait_timeout (MySQL)

- **wait_timeout**: 비대화형 연결(non-interactive connections)에서 서버가 활동이 없는 연결을 닫기 전에 대기하는 시간을 초 단위로 설정합니다. 기본값은 28,800초(8시간)
- **interactive_timeout**: 대화형 연결(interactive connections)에서 서버가 활동이 없는 연결을 닫기 전에 대기하는 시간을 초 단위로 설정합니다. 기본값은 28,800초(8시간)입니다.
- 파라미터 그룹에 있는 wait_timeout 값을 통해 설정된 시간 동안 아무런 요청(쿼리) 없이 유휴 상태로 있으면, 해당 세션을 서버 측에서 일방적으로 끊어버린다. 

### 커넥션 풀

- 스프링 부트에서 사용하는 HikariCP, Tomcat JDBC Pool 등의 커넥션 풀은 미리 데이터베이스와의 물리적인 연결을 여러 개 만들어두고(풀링), 애플리케이션이 DB 작업이 필요할 때마다 이 풀에서 커넥션을 빌려주고 반납받는 방식으로 동작
- 애플리케이션이 커넥션을 빌려가지 않은 동안, 풀 안의 커넥션들은 "유휴 상태(idle)"로 대기

### 시나리오

- MySQL 서버의 wait_timeout이 커넥션 풀의 설정보다 짧게 설정되어 있다면 
  - 커넥션 풀에 있는 어떤 커넥션이 한동안 사용되지 않아 유휴 상태로 존재
  - 이 유휴 시간이 MySQL 서버의 **wait_timeout을** 초과
  - MySQL 서버는 해당 커넥션을 "얘는 이제 안 쓰는구나"라고 판단하고 자신의 쪽에서 연결을 끊어버림.
  - 하지만, 애플리케이션의 커넥션 풀은 이 사실을 즉시 모름. 풀 입장에서는 여전히 해당 커넥션이 유효하다고 생각하고 있을 수 있다.
  - 이후, 애플리케이션이 DB 작업을 위해 이 "이미 서버에 의해 끊어진" 커넥션을 풀로부터 빌려와서 쿼리를 실행하려고 하면, "MySQL server has gone away", "Broken pipe", "Communications link failure" 와 같은 오류가 발생할 수 있음.

### 커넥션의 풀의 대응 방안

#### max-lifetime (HikariCP의 경우 maxLifetime):

- 커넥션 풀에서 **커넥션이 살아있을 수 있는 최대 수명**을 설정
- 이 시간이 지나면 해당 **커넥션은 풀에서 제거**되고, 필요하다면 새 커넥션으로 교체됨.
- 이 값을 MySQL의 **wait_timeout보다 약간 짧게 설정하는 것이 일반적**인 권장 사항입니다.
- 예를 들어, wait_timeout이 28800초(8시간)라면, max-lifetime은 28740초(7시간 59분) 등으로 설정하여 MySQL 서버가 연결을 끊기 전에 풀에서 먼저 해당 커넥션을 갱신하도록 합니다.

#### idle-timeout (HikariCP의 경우 idleTimeout):

- 커넥션이 풀에서 사용되지 않고 유휴 상태로 있을 수 있는 최대 시간 
- 이 시간이 지나면 풀에서 제거됨.
- 이 값 역시 wait_timeout을 고려하여 너무 길지 않게 설정하는 것이 좋다.
- 일반적으로 **max-lifetime보다는 짧게** 설정됨.

#### validation-timeout / connection-test-query (HikariCP의 경우 connectionTimeout, validationTimeout, connectionTestQuery):

- 풀에서 커넥션을 빌려주기 전에 해당 커넥션이 여전히 유효한지 검사하는 기능
- connectionTestQuery (예: SELECT 1)를 설정하면, 커넥션을 빌려줄 때 이 쿼리를 실행하여 DB와의 연결 상태를 확인합니다.
validationTimeout은 이 테스트 쿼리가 응답을 기다리는 시간입니다.
이 기능을 사용하면 이미 끊어진 커넥션을 사용하는 것을 방지할 수 있지만, 매번 테스트 쿼리를 실행하는 것은 약간의 성능 오버헤드가 있을 수 있습니다. (HikariCP는 이 오버헤드를 최소화하는 최적화가 되어 있습니다.)
- 자주 발생한다는 것은 **풀의 모든 커넥션이 동시에 사용 중이라는 의미**
- 이 경우 connection-timeout 값을 늘리는 것보다 maximum-pool-size가 충분한지 먼저 검토해야 합니다. 풀 크기가 너무 작으면 아무리 connection-timeout을 길게 설정해도 근본적인 문제가 해결되지 않습니다.

#### keepalive-time (HikariCP의 경우 keepaliveTime):

- HikariCP의 독특한 기능 중 하나로, 유휴 상태의 커넥션에 대해 주기적으로 "keepalive ping" (보통 connectionTestQuery를 이용)을 보내서 해당 커넥션이 DB 서버의 wait_timeout에 의해 끊어지는 것을 방지하고, 실제로 끊어졌는지도 감지합니다.
- 이 값을 wait_timeout보다 훨씬 짧게 (예: wait_timeout이 30분이라면 keepaliveTime은 5분 또는 10분) 설정하면 효과적

### 결론
- 가장 중요한 것은 커넥션 풀의 max-lifetime을 DB 서버의 wait_timeout (또는 interactive_timeout, 상황에 맞게)보다 짧게 설정
- 이렇게 하면 DB 서버가 연결을 먼저 끊는 상황을 방지 가능


## 모니터링
- 