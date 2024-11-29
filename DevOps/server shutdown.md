# Server Shutdown

## 서버 종료(Shutdown)의 중요성

서버 종료는 단순히 프로세스를 멈추는 것 이상의 의미를 가집니다. 
올바른 종료 절차를 따르지 않으면 데이터 손상, 클라이언트 요청의 손실, 리소스 누수 등 다양한 문제가 발생할 수 있습니다. 
따라서 서버는 종료 신호를 수신했을 때 적절히 대응하여 안정적으로 종료되어야 합니다.

## UNIX 신호(Signals) 개요
- Unix에서 signal이란 프로세스에 특정한 의미를 담아 보내는 inter-process communication (IPC)
- POSIX 호환 OS라면 (Linux, MacOS도 포함) 터미널에서 kill -l를 실행해서 현재 OS가 지원하는 signal의 종류를 확인
-	SIGINT (Signal Interrupt)
	-	번호: 2
	-	설명: 일반적으로 키보드에서 Ctrl+C를 눌렀을 때 발생합니다. 프로세스의 인터럽트 요청을 나타냅니다.
-	SIGTERM (Signal Terminate)
	-	번호: 15
	-	설명: 프로세스 종료 요청을 나타냅니다. 기본적으로 프로세스가 종료되도록 요청하지만, 프로세스가 이를 무시할 수 있습니다.
-	SIGKILL (Signal Kill)
	-	번호: 9
	-	설명: 프로세스를 즉시 종료시킵니다. 무시하거나 처리할 수 없습니다.
-	SIGHUP (Signal Hang Up)
	-	번호: 1
	-	설명: 터미널 세션이 종료될 때 발생하거나, 데몬 프로세스의 설정을 재로드하도록 요청할 때 사용됩니다.
-	SIGQUIT (Signal Quit)
	-	번호: 3
	-	설명: 프로세스를 종료시키고 코어 덤프를 생성합니다. 

## Spring Boot 그레이스풀 셧다운
- 서버가 현재 진행 중인 작업을 완료하거나 안전하게 중단한 후 종료하는 절차
### Spring Boot의 기본 종료 메커니즘
- Spring Boot 애플리케이션은 기본적으로 **JVM의 종료 신호(SIGINT, SIGTERM 등)를 수신**하면 **애플리케이션 컨텍스트를 닫고**, 등록된 DisposableBean 또는 @PreDestroy 메서드를 호출하여 리소스를 정리
-	Spring Boot의 그레이스풀 셧다운은 HTTP 요청의 처리가 완료될 때까지 대기합니다.
-	그러나 **비동기 작업(@Async)** 이나 **백그라운드 스레드**는 기본적으로 그레이스풀 셧다운의 대상에 포함되지 않습니다.
-	따라서, 애플리케이션 컨텍스트가 종료되면서 **데이터소스와 기타 빈들이 먼저 종료**되고, 비동기 작업은 진행 중인 상태에서 필요한 리소스를 잃게 됩니다.

```java
@EnableAsync
@Configuration
public class AsyncConfig {
    @Bean
    public Executor asyncTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setThreadNamePrefix("Async-");
				// 최소 스레드 수. 기본값: 1
        executor.setCorePoolSize(10);
				// 최대 스레드 수 기본값: Integer.MAX_VALUE (즉, 2,147,483,647)
        executor.setMaxPoolSize(20);
				// 작업 큐의 용량 기본값: Integer.MAX_VALUE (즉, 2,147,483,647)
				// 스레드 수가 corePoolSize에 도달하면 추가로 들어오는 작업은 작업 큐에 저장
        executor.setQueueCapacity(500); // 필요에 따라 조정
        executor.setWaitForTasksToCompleteOnShutdown(true);
        //애플리케이션이 종료될 때, 해당 Executor가 처리 중인 작업이 완료될 때까지 최대 초까지 대기
        executor.setAwaitTerminationSeconds(600);
        executor.initialize();
        return executor;
    }
}
```

### 1.2 그레이스풀 셧다운 활성화

Spring Boot 2.3부터 그레이스풀 셧다운 기능이 기본적으로 제공됩니다. 이를 활성화하려면 application.properties 또는 application.yml 파일에서 설정을 추가해야 합니다.

```yml
# 그레이스풀 셧다운을 활성화
server:
  shutdown: graceful
# 각 셧다운 단계의 타임아웃을 설정
spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
```
### 1.3 커스텀 종료 로직 구현

애플리케이션이 종료될 때 추가적인 작업을 수행하려면 @PreDestroy 어노테이션을 사용하거나, DisposableBean 인터페이스를 구현할 수 있습니다.
- @PreDestroy 예시1
```java
import javax.annotation.PreDestroy;
import org.springframework.stereotype.Component;

@Component
public class ShutdownHandler {

    @PreDestroy
    public void onShutdown() {
        // 리소스 정리 로직
        System.out.println("Application is shutting down...");
        // 예: 데이터베이스 연결 종료, 캐시 클리어 등
    }
}
```

- DisposableBean 구현 예시
```import org.springframework.beans.factory.DisposableBean;
import org.springframework.stereotype.Component;

@Component
public class MyDisposableBean implements DisposableBean {

    @Override
    public void destroy() throws Exception {
        // 리소스 정리 로직
        System.out.println("DisposableBean is destroying...");
    }
}
```

### Timeout 설정 및 기타 설정

그레이스풀 셧다운 시 모든 종료 작업이 지정된 시간 내에 완료되지 않으면 강제 종료됩니다. 이를 적절히 설정하여 애플리케이션의 종료 시간을 관리할 수 있습니다.
-	Timeout 설정: spring.lifecycle.timeout-per-shutdown-phase를 통해 각 단계의 타임아웃을 설정합니다.
-	기타 설정:
	-	server.shutdown.grace-period: 셧다운 전 대기 시간을 설정할 수 있습니다.
	-	스레드 풀 종료: 비동기 작업을 처리하는 스레드 풀을 적절히 종료하도록 설정합니다.


## 데이터소스 종료 시점 문제:
-	HikariCP 데이터소스는 애플리케이션 컨텍스트가 종료될 때 함께 종료됩니다.
-	비동기 작업이 진행 중인 상태에서 데이터소스가 종료되면, **Connection is closed**와 같은 예외가 발생합니다.

## 비동기 작업의 종료 관리 미흡:
-	현재 비동기 작업은 SimpleAsyncTaskExecutor 또는 기본 **ThreadPoolTaskExecutor**를 사용하고 있을 가능성이 높습니다.
-	이 경우, 애플리케이션 종료 시 비동기 작업의 완료를 대기하지 않고 즉시 종료됩니다.


```java
2024-11-26 13:58:54.186  INFO [mmp-api,,] 73003 --- [ionShutdownHook] o.s.b.w.e.tomcat.GracefulShutdown        : Commencing graceful shutdown. Waiting for active requests to complete 
2024-11-26 13:58:54.198  INFO [mmp-api,,] 73003 --- [tomcat-shutdown] o.s.b.w.e.tomcat.GracefulShutdown        : Graceful shutdown complete 
2024-11-26 13:58:56.345  INFO [mmp-api,,] 73003 --- [     sqs-task-2] c.m.m.o.v.s.s.OpenApiSmsAsyncServiceImpl : 통합엔진 batch insert count : 60000 105653 
insert into `megabird`.`TNT_INTG_MSG_SND` (
  `message_id`,
  `SVC_KND_CD`,
  `MSG_GRP_NO`,
  `MSG_TTL`,
  `MSG_COTN`,
  `FL_TYP_CD`,
  `FL_INF_COTN`,
  `MB_CLCLN_ID`,
  `MBLNUM`,
  `REGR_ID`,
  `SND_RQ_DTT`
)
values (
  null, 
  null, 
  null, 
  null, 
  null, 
  null, 
  null, 
  null, 
  null, 
  null, 
  null
)
2024-11-26 13:58:56.357  INFO [mmp-api,,] 73003 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated... 
2024-11-26 13:58:56.375  INFO [mmp-api,,] 73003 --- [ionShutdownHook] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed. 
2024-11-26 13:58:56.377  WARN [mmp-api,,] 73003 --- [     sqs-task-2] com.zaxxer.hikari.pool.ProxyConnection   : HikariPool-1 - Connection com.mysql.cj.jdbc.ConnectionImpl@25580fce marked as broken because of SQLSTATE(08003), ErrorCode(0) 

java.sql.SQLNonTransientConnectionException: Connection is closed.
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:110) ~[mysql-connector-java-8.0.29.jar:8.0.29]
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:97) ~[mysql-connector-java-8.0.29.jar:8.0.29]
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:89) ~[mysql-connector-java-8.0.29.jar:8.0.29]
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:63) ~[mysql-connector-java-8.0.29.jar:8.0.29]
	at com.mysql.cj.jdbc.StatementImpl.<init>(StatementImpl.java:208) ~[mysql-connector-java-8.0.29.jar:8.0.29]
	at com.mysql.cj.jdbc.ClientPreparedStatement.<init>(ClientPreparedStatement.java:172) ~[mysql-connector-java-8.0.29.jar:8.0.29]
	at com.mysql.cj.jdbc.ClientPreparedStatement.<init>(ClientPreparedStatement.java:211) ~[mysql-connector-java-8.0.29.jar:8.0.29]
	at com.mysql.cj.jdbc.ClientPreparedStatement.prepareBatchedInsertSQL(ClientPreparedStatement.java:1105) ~[mysql-connector-java-8.0.29.jar:8.0.29]
	at com.mysql.cj.jdbc.ClientPreparedStatement.executeBatchedInserts(ClientPreparedStatement.java:653) ~[mysql-connector-java-8.0.29.jar:8.0.29]
	at com.mysql.cj.jdbc.ClientPreparedStatement.executeBatchInternal(ClientPreparedStatement.java:409) ~[mysql-connector-java-8.0.29.jar:8.0.29]
	at com.mysql.cj.jdbc.StatementImpl.executeBatch(StatementImpl.java:795) ~[mysql-connector-java-8.0.29.jar:8.0.29]
	at com.zaxxer.hikari.pool.ProxyStatement.executeBatch(ProxyStatement.java:127) ~[HikariCP-4.0.3.jar:na]
	at com.zaxxer.hikari.pool.HikariProxyPreparedStatement.executeBatch(HikariProxyPreparedStatement.java) ~[HikariCP-4.0.3.jar:na]
	at org.jooq.tools.jdbc.DefaultStatement.executeBatch(DefaultStatement.java:122) ~[jooq-3.16.4.jar:na]
	at org.jooq.impl.BatchSingle.executePrepared(BatchSingle.java:231) ~[jooq-3.16.4.jar:na]
	at org.jooq.impl.BatchSingle.execute(BatchSingle.java:175) ~[jooq-3.16.4.jar:na]
	at com.mz.message.openapi.v1.sms.service.OpenApiSmsAsyncServiceImpl.sendOpenApiSms(OpenApiSmsAsyncServiceImpl.java:320) ~[classes/:na]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:na]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62) ~[na:na]
	at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[na:na]
	at java.base/java.lang.reflect.Method.invoke(Method.java:566) ~[na:na]
	at org.springframework.aop.support.AopUtils.invokeJoinpointUsingReflection(AopUtils.java:344) ~[spring-aop-5.3.20.jar:5.3.20]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.invokeJoinpoint(ReflectiveMethodInvocation.java:198) ~[spring-aop-5.3.20.jar:5.3.20]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:163) ~[spring-aop-5.3.20.jar:5.3.20]
	at org.springframework.aop.interceptor.AsyncExecutionInterceptor.lambda$invoke$0(AsyncExecutionInterceptor.java:115) ~[spring-aop-5.3.20.jar:5.3.20]
	at java.base/java.util.concurrent.FutureTask.run(FutureTask.java:264) ~[na:na]
	at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128) ~[na:na]
	at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628) ~[na:na]
	at java.base/java.lang.Thread.run(Thread.java:829) ~[na:na]


Process finished with exit code 130 (interrupted by signal 2:SIGINT)
```