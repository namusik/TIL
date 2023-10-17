# ThreadPoolTaskExecutor

## 개념


## 설정
### corePoolSize
- timing out 없이 항상 최소로 유지하는 thread의 수
  - 아무 작업을 하지 않더라고 이 개수를 유지하고 있음
- 실제 set하는 세부 로직은 `ThreadPoolExecutor`가 수행한다.
- 만약, `AllowCoreThreadTimeOut`을 true로 설정했을 때는
  - corePoolSize를 0으로 두는 것이 효과적이다.
  - 모든 스레드가 시간 초과될 수 있기 때문에.

## allowCoreThreadTimeOut
- 활성화되면, corePoolSize로 설정된 thread들도 일정 시간동안 아무 작업을 수행하지 않으면 제거됨.
- 비활성화가 default
- 만약 활성화했을 때는
  - corePoolSize를 0으로 두는 것이 효과적이다.
  - 어차피, 작업을 하지 않는 thread는 제거되기 때문에, 굳이 corePoolSize를 0개 이상으로 할 필요가 없다.
  - 

## 참고
https://www.baeldung.com/java-threadpooltaskexecutor-core-vs-max-poolsize