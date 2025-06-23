# Quartz Scheduler

## 개념

## 코드 설명
### build.gradle
```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-quartz'
}
```
### application.yml
```yaml

```

### QuartzTriggerListener
-  Quartz의 **TriggerListener** 인터페이스를 구현하여 Trigger 실행과 관련된 이벤트(발동, misfire, 완료 등)를 가로채고 로그를 남긴다.

```java
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobExecutionContext;
import org.quartz.Trigger;
import org.quartz.Trigger.CompletedExecutionInstruction;
import org.quartz.TriggerListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class QuartzTriggerListener implements TriggerListener {

  @Override
  public String getName() {
    return "commonTriggerListener";
  }

  // 트리거가 발동되면, 연결된 Job의 이름을 로그에 기록
  @Override
  public void triggerFired(Trigger trigger, JobExecutionContext context) {
    log.info("trigger success, job name: {}", context.getJobDetail().getKey().getName());
  }


  /**
   * 리스너가 실행 취소(바 veto)가 필요한지 판단할 때 호출되며, 여기서는 항상 false를 반환하여 실행을 막지 않음
   * 트리거됐지만, 특정 조건에따라 Job을 실행하고 싶지 않은 경우 true를 반환
   */
  @Override
  public boolean vetoJobExecution(Trigger trigger, JobExecutionContext context) {
    return false;
  }

  // Trigger가 미스파이어(misfire)되는 경우(예: 예약 시간이 지나쳤을 때) 호출되어 트리거의 이름을 로그에 기록
  @Override
  public void triggerMisfired(Trigger trigger) {
    log.info("trigger failed, trigger name: {}", trigger.getKey().getName());
  }


  /**
   * job이 완료되고 나서 호출되는 메서드, JobListener와 중복되므로 구현 x
   */
  @Override
  public void triggerComplete(
      Trigger trigger, JobExecutionContext context,
      CompletedExecutionInstruction triggerInstructionCode
  ) {
  }
}
```

### QuartzJobListener
-  **JobListener** 인터페이스를 구현하여 Job 실행 전후 및 실행 취소( veto ) 관련 이벤트를 로그로 남긴다.

```java
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.JobListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class QuartzJobListener implements JobListener {

  //리스너 이름 “commonJobListener”를 반환
  @Override
  public String getName() {
    return "commonJobListener";
  }

  // Job 실행 직전에 호출되며, context에서 Job의 그룹과 이름을 추출하여 “job start” 로그를 남김
  @Override
  public void jobToBeExecuted(JobExecutionContext context) {
    log.info(
        "job start, group: {}, name: {}",
        context.getJobDetail().getKey().getGroup(),
        context.getJobDetail().getKey().getName()
    );
  }

  // 작업 실행이 취소된 경우 호출되어 취소된 Job의 그룹과 이름을 로그에 기록
  @Override
  public void jobExecutionVetoed(JobExecutionContext context) {
    log.info(
        "job failed, group: {}, name: {}",
        context.getJobDetail().getKey().getGroup(),
        context.getJobDetail().getKey().getName()
    );
  }

// Job 실행 후, 성공 여부나 예외 발생 여부를 로그에 기록
  @Override
  public void jobWasExecuted(JobExecutionContext context, JobExecutionException jobException) {
    log.info(
        "job success, group: {}, name: {}",
        context.getJobDetail().getKey().getGroup(),
        context.getJobDetail().getKey().getName()
    );
  }

}
```

### QuartzConfig
-  스프링 부트 애플리케이션 내에서 Quartz 스케줄러의 공통 리스너들을 등록하는 설정 클래스
-  Quartz 스케줄러에서 Job과 Trigger가 실행되거나 misfire되는 등의 이벤트가 발생할 때 이를 감지하여 로깅하거나 후속 처리를 수행할 수 있도록, 두 종류의 리스너(QuartzJobListener와 QuartzTriggerListener)를 스케줄러에 등록

```java
import com.mz.message.common.schedule.common.listener.QuartzJobListener;
import com.mz.message.common.schedule.common.listener.QuartzTriggerListener;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.quartz.ListenerManager;
import org.quartz.SchedulerException;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;

@Configuration
@RequiredArgsConstructor
public class QuartzConfig {

  private final Scheduler scheduler;
  private final QuartzJobListener quartzJobListener;
  private final QuartzTriggerListener quartzTriggerListener;

  // PostConstruct 어노테이션을 사용하여 스케줄러가 초기화된 후 리스너를 추가
  @PostConstruct
  public void addListeners() throws SchedulerException {

    ListenerManager listenerManager = scheduler.getListenerManager();
    listenerManager.addJobListener(quartzJobListener);
    listenerManager.addTriggerListener(quartzTriggerListener);
  }

}
```

## ScheduleJobService
```java
package com.example.service;

import com.example.quartz.SampleJob;
import lombok.RequiredArgsConstructor;
import org.quartz.*;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class ScheduleJobService {

    private final Scheduler scheduler;

    /**
     * Cron 표현식을 이용하여 예약 작업을 등록하는 메서드
     *
     * @param jobName        예약 작업의 이름
     * @param groupName      예약 작업의 그룹명
     * @param cronExpression 실행 주기를 설정하는 Cron 표현식
     *                       (예: "0 0 12 ? * *" - 매일 정오에 실행)
     * @throws SchedulerException
     */
    public void scheduleJob(String jobName, String groupName, Date startTime, int intervalInSec)
            throws SchedulerException {

        // JobDetail 생성: 실행할 job 클래스와 고유의 jobKey 지정
        JobDetail jobDetail = JobBuilder.newJob(SampleJob.class)
                .withIdentity(jobName, groupName)
                .usingJobData("jobSays", "Hello Quartz") // 예시: JobDataMap에 데이터 저장
                storeDurably(true) 
                .build();

        // CronTrigger 생성: CronScheduleBuilder를 사용하여 cron 표현식을 설정
        Trigger trigger = TriggerBuilder.newTrigger()
                .withIdentity(jobName + "Trigger", groupName)
                .withSchedule(CronScheduleBuilder.cronSchedule(cronExpression))
                .build();

        // Scheduler에 job과 trigger 등록
        scheduler.scheduleJob(jobDetail, trigger);
    }

    /**
     * 기존 예약 작업의 trigger 시간을 새로운 cron 표현식으로 업데이트하는 메서드
     *
     * @param jobName          예약 작업의 이름 (JobDetail에 지정한 값)
     * @param groupName        예약 작업의 그룹명
     * @param newCronExpression 변경 후 적용할 cron 표현식
     * @return 새로운 trigger가 스케줄링된 시간을 반환하며, null이면 업데이트에 실패한 것임
     * @throws SchedulerException
     */
    public Date updateJobTrigger(String jobName, String groupName, String newCronExpression)
            throws SchedulerException {

        // 기존 trigger의 key 생성 (생성 시 사용한 key와 동일해야 함)
        TriggerKey triggerKey = new TriggerKey(jobName + "Trigger", groupName);

        // 새로운 CronTrigger 생성
        CronTrigger newTrigger = TriggerBuilder.newTrigger()
                .withIdentity(triggerKey)
                .withSchedule(CronScheduleBuilder.cronSchedule(newCronExpression))
                .build();

        // 기존 trigger를 새로운 trigger로 교체
        // scheduler.rescheduleJob()는 기존 trigger를 새로운 trigger로 대체하고, 다음 실행 시간을 반환합니다.
        return scheduler.rescheduleJob(triggerKey, newTrigger);
    }
}
```
- JobDetail
  - 생성할 때 **QRTZ_JOB_DETAILS** 테이블에 저장
- storeDurably()
  - JobDetail이 스케줄러의 JobStore에 유지될지 여부를 결정
  - true
    - JobDetail이 triggers와 연결되지 않더라도 JobStore에 계속 보존됩니다. 예를 들어, 특정 Job이 나중에 Trigger에 의해 동적으로 예약되거나 업데이트될 가능성이 있을 때,미리 JobDetail을 등록해 놓고 Trigger가 생성되기 전에도 이 JobDetail이 삭제되지 않도록 유지할 수 있습니다. 기존 Trigger를 제거한 후 새로운 Trigger를 등록하는 상황
  - false
    - JobDetail이 durable하지 않은 경우, 해당 JobDetail에 어떤 Trigger도 연결되어 있지 않다면 스케줄러는 자동으로 이 Job을 JobStore에서 제거합니다. 즉, JobDetail이 등록된 후 적어도 하나의 Trigger가 존재해야만 Job이 유지됩니다.
- Trigger
  - 생성할 때 기본 Trigger 정보는 **QRTZ_TRIGGERS** 테이블에 저장.
  - 크론 표현식 등 CronTrigger 전용 정보는 **QRTZ_CRON_TRIGGERS** 테이블에 저장
  - TriggerBuilder.newTrigger().forJob(jobDetail)
    - Trigger와 Job을 연결해주는 용도로 사용되며, 반드시 필수는 아닙니다.
    - JobDetail과 Trigger를 동시에 등록한다면, Trigger 자체에 명시적으로 .forJob(jobDetail)을 호출하지 않아도 Quartz가 내부적으로 두 객체를 연결해줍니다.
    - Trigger만 따로 등록(예: scheduler.scheduleJob(trigger))하거나 이미 존재하는 Job과 연결할 필요가 있다면, trigger에 어떤 Job과 연관된 것인지를 명확히 하기 위해 .forJob(jobDetail) (또는 .forJob(jobKey))를 호출하는 것이 좋습니다.

### CustomJob
```java
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@DisallowConcurrentExecution
public class SampleJob implements Job {

    private static final Logger logger = LoggerFactory.getLogger(SampleJob.class);

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        // Job 실행시 처리할 로직
        logger.info("SampleJob 실행! 실행 시간: {}", context.getFireTime());
        // 필요한 작업 수행...
    }
}
```
- @DisallowConcurrentExecution
  - Quartz 스케줄러에서 한 JobDetail에 대해 동시에 여러 인스턴스가 실행되는 것을 방지하기 위해 사용
  - 동시 실행 제한
    - 이 애너테이션이 적용된 Job 클래스는 동일한 JobDetail에 대해 현재 실행 중인 인스턴스가 있는 경우, 동일 JobDetail의 새 Trigger가 발동되더라도 동시 실행하지 않습니다
  - JobInstance 생성 및 관리
    - Quartz 스케줄러는 Job이 실행될 때마다 일반적으로 Job 클래스로부터 새로운 인스턴스를 생성합니다. 하지만, @DisallowConcurrentExecution 애너테이션이 붙은 경우, 동일한 JobDetail(즉, 동일한 식별자와 JobDataMap을 가진 경우)에 대해 현재 실행 중인 인스턴스가 있다면 새 인스턴스 실행을 차단
  - 동시성 제어
    - 스케줄러 내부에서는 특정 JobKey(보통 JobDetail의 식별자)를 기준으로 현재 실행 중인 작업이 있는지 여부를 판단합니다. 작업이 아직 실행 중인 상태면, 새 Trigger가 도착하더라도 해당 Job의 실행을 보류하거나 스킵
  - 비동기 작업의 순차성 보장
    - 예약 메시지를 처리하거나 데이터 동기화를 수행할 때 이전 작업의 결과가 다음 작업에 영향을 준다면, 동시 실행 제한이 필수적
----------------------

## 테이블 설명

### QRTZ_JOB_DETAILS
-	역할: 등록된 모든 Job의 상세 정보를 저장합니다.
-	주요 컬럼:
  -	SCHED_NAME : 스케줄러 인스턴스의 이름
  - JOB_NAME : 작업의 고유 식별자
  - JOB_GROUP: 작업을 그룹화하는 용도
  -	JOB_CLASS_NAME: 실제 실행할 작업(Job)을 구현한 클래스의 이름.
  -	IS_DURABLE: 지속성 여부로, Job이 스케줄 삭제 후에도 DB에 남아야 하는지 결정합니다. `1`이면 삭제되지 않음.
  -	IS_NONCONCURRENT: 동시 실행 제한 여부. `1`이면 동시 실행 허용되지 않음.
  - IS_UPDATE_DATA : `0`이면 작업 실행 도중 JobDataMap의 내용이 업데이트되지 않는다는 의미
  -	REQUESTS_RECOVERY: 시스템 장애 후 복구가 필요한 Job인지 여부. `0`은 스케줄러 장애 복구(recovery)가 필요 없음
  -	JOB_DATA: Job 실행 시 필요한 파라미터 등 추가 데이터를 저장하는 BLOB 필드.


### QRTZ_TRIGGERS
-	역할: Job이 언제 실행되어야 하는지를 결정하는 트리거 정보를 저장합니다.
-	주요 컬럼:
	-	SCHED_NAME, TRIGGER_NAME, TRIGGER_GROUP: 각 트리거를 유일하게 식별하는 키입니다.
	-	JOB_NAME, JOB_GROUP: 해당 트리거가 실행시킬 Job과의 연결 정보(외래 키).
	-	NEXT_FIRE_TIME : 트리거가 다음으로 실행될 시간. 밀리초 단위의 Unix epoch 타임스탬프로 나타낸 값. 실제 실행될 시점이 동적으로 결정
  - PREV_FIRE_TIME: 이전 실행 시간을 타임스탬프로 저장합니다. `-1`이라는 값은 아직 한 번도 실행되지 않았음을 의미
  - PRIORITY : 트리거의 우선순위를 나타냅니다. 여러 트리거가 동시에 실행 대상일 때, 우선순위가 높은 트리거부터 실행
	-	TRIGGER_STATE : 현재 트리거의 상태. `WAITING`은 아직 실행 대기 중임을 의미
  - TRIGGER_TYPE: 트리거의 타입(예, SIMPLE, CRON(Cron 표현식을 기반으로 스케줄이 설정되어 있음) 등)를 나타냅니다.
  - START_TIME: 트리거가 **활성화**되는 시작 시간. 해당 시간 이후부터 트리거가 실행 대상이 됩니다. 트리거가 생성될 때 정해지며, 별도로 갱신되지 않습니다.
  - END_TIME : 트리거의 종료 시간을 나타냅니다. 값이 0인 경우, 종료 시간이 별도로 설정되지 않았음을 의미
	-	MISFIRE_INSTR: 트리거 미스파이어(예정된 실행을 놓쳤을 때)의 처리 지침. 0은 기본값으로, 미스파이어 발생 시 기본 처리 정책을 따른다는 의미

### QRTZ_SIMPLE_TRIGGERS
-	역할: 단순한 간격 기반 스케줄링(SimpleTrigger) 정보를 추가로 저장합니다.
-	주요 컬럼:
	-	REPEAT_COUNT: 반복 횟수(무한 반복일 경우 특별한 값 사용).
	-	REPEAT_INTERVAL: 반복 주기(밀리초 단위).
	-	TIMES_TRIGGERED: 실제로 실행된 횟수.
-	연결: QRTZ_TRIGGERS와 외래 키로 연결되어, 기본 트리거 정보 외에 반복 관련 데이터를 추가합니다.

### QRTZ_CRON_TRIGGERS
-	역할: Cron 표현식을 사용하는 트리거에 대한 정보를 저장합니다.
-	주요 컬럼:
	-	CRON_EXPRESSION: Cron 문법에 따른 스케줄 표현식.
	-	TIME_ZONE_ID: 시간대 정보 (특정 시간대에 맞춰 작업을 실행하도록 설정).
-	연결: QRTZ_TRIGGERS와 외래 키로 연결되어 있으며, Cron 기반 스케줄링을 지원합니다.

### QRTZ_SIMPROP_TRIGGERS
-	역할: 추가적인 트리거 속성(문자열, 정수, 긴 숫자, 소수, 불린 값 등)을 저장하여, 커스텀 트리거 구성이나 부가 옵션을 지원합니다.
-	주요 컬럼:
여러 속성을 저장하기 위한 필드(STR_PROP_13, INT_PROP_12, LONG_PROP_12, DEC_PROP_12, BOOL_PROP_1~2).
-	연결: QRTZ_TRIGGERS와 외래 키로 연결되며, 트리거에 부가적인 세부 옵션이 필요한 경우 사용됩니다.

### QRTZ_BLOB_TRIGGERS
-	역할: 대용량의 트리거 데이터를 저장합니다.
-	주요 컬럼:
	-	BLOB_DATA: 트리거에 따른 대용량 바이너리 데이터를 저장할 수 있도록 구성되어 있습니다.
-	연결: QRTZ_TRIGGERS와 외래 키로 연결되어, 일반적인 텍스트 또는 숫자형 데이터보다 큰 데이터를 다루어야 하는 경우 사용됩니다.

### QRTZ_CALENDARS
-	역할: 작업 실행에 영향을 주는 캘린더 정보를 저장합니다.
-	주요 컬럼:
	-	CALENDAR_NAME: 캘린더를 식별하는 이름.
	-	CALENDAR: 특정 일정(예, 휴일, 제외 기간 등)을 BLOB 형태로 저장.
-	용도: 트리거 설정 시 특정 날짜나 시간대를 제외하거나 포함시켜야 하는 경우 참조됩니다.

### QRTZ_PAUSED_TRIGGER_GRPS
-	역할: 일시 중지된 트리거 그룹의 상태를 저장합니다.
-	주요 컬럼:
	-	TRIGGER_GROUP: 일시 중지된 트리거 그룹 이름.
-	용도: 해당 그룹의 모든 트리거가 잠시 중지되어야 할 때, 이를 관리하기 위한 테이블입니다.

### QRTZ_FIRED_TRIGGERS
-	역할: 현재 실행 중이거나 실행된 트리거의 정보를 기록합니다.
-	주요 컬럼:
	-	ENTRY_ID: 각 실행 기록의 고유 식별자.
	-	INSTANCE_NAME: 트리거를 실행한 스케줄러 인스턴스.
	-	FIRED_TIME, SCHED_TIME: 실제 실행 시각과 스케줄된 시각을 저장합니다.
	-	STATE: 실행 상태 및 회수 관련 정보를 표시합니다.
-	용도: 이 테이블은 스케줄링 실패 복구, 중복 실행 방지, 클러스터 환경에서 작업 상태를 관리하는 데 사용됩니다.

### QRTZ_SCHEDULER_STATE
-	역할: 클러스터 환경에서 각 스케줄러 인스턴스의 상태 정보를 저장합니다.
-	주요 컬럼:
	-	INSTANCE_NAME: 스케줄러 인스턴스의 이름.
	-	LAST_CHECKIN_TIME: 마지막 체크인 시간으로, 인스턴스의 활성 여부를 판단하는 데 사용됩니다.
	-	CHECKIN_INTERVAL: 체크인 간격.
-	용도: 여러 인스턴스가 동시에 실행되는 클러스터 환경에서, 각 노드의 상태를 모니터링하고 조정하는 역할을 합니다.

### QRTZ_LOCKS
-	역할: 데이터베이스 기반 락 메커니즘을 제공하여, 클러스터 환경에서 여러 스케줄러 인스턴스 간의 동시성 문제를 방지합니다.
-	주요 컬럼:
	-	LOCK_NAME: 락의 이름(예: 트리거 관리, 작업 저장 등 특정 작업에 대한 락을 관리).
-	용도: 여러 인스턴스가 동시에 작업을 수행할 때, 동일한 리소스에 접근하여 데이터 충돌이나 중복 처리가 일어나지 않도록 보증하는 역할을 합니다.

### 요약
-	Job 관련 테이블 (QRTZ_JOB_DETAILS): 등록된 작업의 정의 및 실행 데이터 저장.
-	Trigger 관련 테이블 (QRTZ_TRIGGERS, QRTZ_SIMPLE_TRIGGERS, QRTZ_CRON_TRIGGERS, QRTZ_SIMPROP_TRIGGERS, QRTZ_BLOB_TRIGGERS): 작업 실행 시점을 지정하는 트리거의 기본 및 상세 정보를 저장.
-	캘린더 (QRTZ_CALENDARS): 작업 실행에서 제외 또는 포함할 날짜/시간 정보 제공.
-	실행 및 상태 관리 테이블 (QRTZ_FIRED_TRIGGERS, QRTZ_SCHEDULER_STATE): 실행 중인 트리거 기록과 클러스터 환경 내 스케줄러 인스턴스의 상태 관리.
-	락 관리 테이블 (QRTZ_LOCKS): 클러스터 환경에서 동시 접근을 제어하기 위한 락 메커니즘 제공.

-----------

## 동작 흐름
1. JobDetail과 Trigger를 생성하여 Quartz 스케줄러에 등록
2. Quartz 스케줄러는 설정된 cron 표현식에 따라 Trigger가 발동될 시점을 체크
   1. Quartz 스케줄러는 내부에 **“QuartzSchedulerThread”라는** 전용 스레드를 두고, 이 스레드가 주기적으로 현재 시각과 각 Trigger의 다음 실행 시각(NextFireTime)을 비교하며 cron 표현식에 따라 언제 Trigger가 발동되어야 하는지를 판단
      1. JobStore(메모리 또는 JDBC 등)에 저장되어 있는 모든 Trigger의 다음 실행 시각(NextFireTime)을 조회
      2. 주기적으로 현재 시스템 시각과 각 Trigger의 NextFireTime을 비교하고, 만약 현재 시각이 NextFireTime에 도달했거나 초과했다면, 그 Trigger를 “발동(Fire)”할 준비
      3. 준비가 된 Trigger는 스레드풀을 통해 해당 Job(즉, execute() 메서드를 가진 Job 클래스)을 실행하도록 위임
3. 예약된 시점(예: cron 표현식에 의해 특정 시간)이 도래하면 Trigger가 “발동”되고, 해당 Trigger는 연결된 JobDetail을 참조
4. Quartz 스케줄러는 해당 JobDetail에 지정된 ReservationMessageSendJob 인스턴스를 생성(또는 재사용)합니다. (스프링의 경우, JobFactory를 통해 스프링 빈 관리 하에 필요한 의존성이 자동 주입됩니다.)
5. Quartz의 내부 로직에 따라 ReservationMessageSendJob 클래스에 구현된 execute(JobExecutionContext jobExecutionContext) 메서드를 호출
6. 이때 jobExecutionContext를 통해 JobDataMap 등 추가 데이터(예, msgGrpNo)나 Trigger/Job 관련 정보를 전달
7. 