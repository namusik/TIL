# Java 동작 원리

> 최종 업데이트: 2026-08-25 | Java 21 기준

## 개념

Java는 **"Write Once, Run Anywhere"** — 한 번 작성하면 어디서든 실행 가능한 구조.

- 소스 코드를 OS별 기계어로 직접 컴파일하지 않고, **중간 언어(바이트코드)** 로 변환한 뒤 **JVM이 실행 시점에 기계어로 변환**하는 2단계 구조
- 국제 학회에 비유하면: 발표자(개발자)가 에스페란토(바이트코드)로 발표문을 작성하면, 각 나라 통역사(JVM)가 현지어(기계어)로 동시통역하는 것

## 전체 실행 흐름

![javaCompile](../../Images/Java/javacompile.png)

```
 ① 소스 코드 작성          ② 컴파일               ③ 클래스 로딩
┌──────────────┐    javac    ┌──────────────┐   ClassLoader  ┌──────────────┐
│  Hello.java  │ ──────────→ │  Hello.class │ ─────────────→ │ JVM 메모리에  │
│  (소스 코드)  │   컴파일타임  │  (바이트코드)  │    런타임       │   적재        │
└──────────────┘            └──────────────┘               └──────┬───────┘
                                                                  │
                            ⑤ OS 실행                ④ 실행 엔진   ▼
                         ┌──────────────┐         ┌──────────────────────┐
                         │   기계어      │ ←────── │ Interpreter + JIT    │
                         │ (OS/CPU별)   │         │ (바이트코드 → 기계어)  │
                         └──────────────┘         └──────────────────────┘
```

| 단계 | 시점 | 수행 주체 | 입력 → 출력 |
|------|------|----------|------------|
| ① 작성 | 개발 시 | 개발자 | — → `.java` |
| ② 컴파일 | 빌드 시 (컴파일타임) | `javac` | `.java` → `.class` (바이트코드) |
| ③ 클래스 로딩 | 실행 시 (런타임) | Class Loader | `.class` → JVM 메모리 |
| ④ 실행 | 실행 시 (런타임) | Interpreter + JIT | 바이트코드 → 기계어 |
| ⑤ OS 실행 | 실행 시 | OS/CPU | 기계어 실행 |

## ① 소스 코드 (.java)

Java 소스 코드는 `.java` 파일에 작성하며, 모든 코드는 **클래스 안에** 존재해야 함.

```java
public class Hello {
    public static void main(String[] args) {    // 진입점 (Entry Point)
        System.out.println("Hello, Java!");
    }
}
```

- 여러 클래스가 모여 하나의 애플리케이션을 구성
- 실행의 시작점이 되는 클래스에 **`main` 메서드**가 반드시 존재해야 함
- `public static void main(String[] args)` — JVM이 인스턴스 생성 없이 직접 호출하기 위해 `static`

## ② 컴파일 (javac)

`javac` 컴파일러가 소스 코드를 검증하고 **바이트코드(.class)** 로 변환하는 단계.

- 출판 전 **교정·교열** 과정에 비유: 문법 오류를 찾고(Syntax Check), 내용 일관성을 확인한 뒤(Type Check), 인쇄 가능한 형태(바이트코드)로 변환

```sh
javac Hello.java    # → Hello.class 생성
```

**컴파일러가 수행하는 작업:**

| 작업 | 설명 | 예시 |
|------|------|------|
| 문법 검사 | Java 언어 규칙에 맞는지 확인 | 세미콜론 누락, 괄호 불일치 |
| 타입 검사 | 타입 안전성 확인 | `String x = 1;` → 컴파일 에러 |
| 바이트코드 생성 | `.java` → `.class` 변환 | JVM이 이해하는 명령어로 변환 |
| 상수 인라이닝 | `static final` 상수를 사용 위치에 직접 삽입 | 아래 예시 참고 |
| 제네릭 타입 소거 | 제네릭 타입 정보를 제거 (Type Erasure) | `List<String>` → `List` |
| Syntactic Sugar 제거 | 편의 문법을 기본 구조로 변환 | 향상된 for → Iterator, 오토박싱 등 |

```java
// 상수 인라이닝 (Constant Inlining)
public class Constants {
    public static final int MAX = 100;
}

public class App {
    int value = Constants.MAX;
    // 컴파일 후 바이트코드에는 Constants.MAX 참조가 아닌 100이 직접 삽입됨
    // → Constants 클래스가 변경되어도 App을 재컴파일하지 않으면 반영 안 됨 (주의)
}
```

상세 내용은 [컴파일과 바이트코드](./컴파일과-바이트코드.md) 참고.

## ③ 클래스 로딩 (Class Loader)

JVM이 `.class` 파일을 **필요한 시점에 동적으로** 메모리에 적재하는 단계.

- 도서관 사서에 비유: 책(클래스)을 처음부터 전부 꺼내두지 않고, 요청이 올 때 서고에서 찾아오는 것

```
Class Loading 과정:

.class 파일
    ↓  Loading — 바이트코드를 읽어들임
    ↓  Verification — 유효한 바이트코드인지 검증 (보안)
    ↓  Preparation — static 필드 메모리 할당 (기본값)
    ↓  Resolution — 심볼릭 참조 → 실제 메모리 주소 변환
    ↓  Initialization — static 변수에 실제 값 할당, static 블록 실행
    ↓
  JVM 메모리 (Method Area)에 클래스 정보 적재
```

상세 내용은 [JVM - Class Loader Subsystem](./JVM.md) 참고.

## ④ 실행 (Execution Engine)

바이트코드를 **기계어로 변환하여 실행**하는 단계. Interpreter와 JIT Compiler의 혼합 방식.

- 처음 가는 식당에서: 처음엔 메뉴판을 한 줄씩 읽으며 주문(Interpreter), 자주 가게 되면 단골 메뉴를 외워서 바로 주문(JIT)

```
실행 흐름:

바이트코드
    ↓
Interpreter (한 줄씩 해석/실행)
    ↓  실행 횟수 카운팅 (프로파일링)
    ↓  자주 실행되는 코드(핫스팟) 감지
    ↓
JIT Compiler (기계어로 한 번에 변환)
    ↓
Code Cache (변환된 기계어 저장)
    ↓
이후 동일 코드 실행 시 → Code Cache에서 기계어 직접 실행 (빠름)
```

### Warm-up (워밍업)

Java 애플리케이션은 시작 직후에는 Interpreter로 실행되어 느리고, **JIT이 핫스팟을 컴파일한 후부터 최대 성능**에 도달. 이 "느림 → 빨라짐"으로 올라가는 구간 자체를 **JIT 웜업**이라 부른다.

- 자동차 엔진에 비유: 시동 직후(Cold Start)에는 성능이 낮고, 엔진이 적정 온도에 올라야(Warm-up) 최대 출력이 나옴

```
성능
 ▲
 │              ┌──────────── 최대 성능 (JIT 최적화 완료)
 │            ╱
 │          ╱   ← JIT 컴파일 진행 중
 │        ╱
 │──────╱  ← Interpreter 단계
 └──────────────────────→ 시간
   Cold     Warm-up    Warmed-up
```

**왜 즉시 최적화하지 않나** — JIT 컴파일 자체도 CPU·시간을 쓰는 작업이라, "진짜 자주 쓰이는 코드"만 선별해 최적화해야 이득이다. HotSpot JVM은 이를 단계적으로 한다(Tiered Compilation).

| 레벨 | 컴파일러 | 특징 |
|------|---------|------|
| 0 | Interpreter | 최적화 없음, 시작만 빠름 |
| 1~3 | **C1** (Client Compiler) | 빠르게 컴파일, 가벼운 최적화 |
| 4 | **C2** (Server Compiler) | 느리게 컴파일하지만 공격적으로 최적화 — 진짜 성능은 여기서 나옴 |

메서드 호출 횟수가 임계치(`-XX:CompileThreshold`, 기본 수천~1만 회 수준)를 넘을 때마다 다음 레벨로 승격된다. 즉 웜업 구간의 길이는 **각 코드가 이 임계치들을 하나씩 넘어가는 데 걸리는 시간**이다.

**배포 직후 CPU 스파이크로 이어지는 이유** — 컨테이너가 막 떠서 트래픽을 받기 시작하는 시점이 곧 JVM이 갓 시작한 시점이다. 이때는 인터프리터로 실행돼 응답이 느린 동시에, JIT 컴파일러가 백그라운드에서 코드를 컴파일하며 CPU를 추가로 잡아먹는다. 두 요인이 겹쳐 **"배포 직후 짧은 CPU 급등 → 서서히 안정화"** 패턴이 나타난다. (→ [배포 직후 CPU 스파이크](../../DevOps/kubernetes/troubleshooting/배포-직후-CPU-스파이크.md))

**대응 방법**

| 방법 | 동작 |
|------|------|
| 웜업 요청 미리 보내기 | 실제 트래픽 받기 전 더미 요청을 몇 번 돌려 핫패스를 미리 JIT시킴 |
| Readiness Probe 지연 | 웜업이 끝날 때까지 오케스트레이터가 이 인스턴스로 트래픽을 안 보내게 함 |
| CDS / AppCDS | 클래스 메타데이터를 미리 덤프해 재사용 → 클래스 로딩 단계 시간 단축 |
| **GraalVM Native Image(AOT)** | 배포 전에 기계어를 미리 다 만들어둠 → **웜업 구간 자체가 없음** |

- 부하 테스트 시 Warm-up 구간을 제외하고 측정해야 정확한 성능 수치를 얻음

상세 내용은 [JVM - Execution Engine](./JVM.md) 참고.

## 다른 언어와의 실행 방식 비교

| 언어 | 실행 방식 | 특징 |
|------|----------|------|
| **C/C++** | 소스 → 기계어 (AOT 컴파일) | OS별 재컴파일 필요, 실행 속도 빠름 |
| **Java** | 소스 → 바이트코드 → JVM이 기계어 변환 | OS 독립적, JVM 필요, Warm-up 후 고성능 |
| **Python** | 소스 → 인터프리터가 직접 실행 | 별도 컴파일 불필요, 실행 속도 느림 |
| **Go** | 소스 → 기계어 (AOT 컴파일) | OS별 크로스 컴파일 지원, VM 불필요 |
| **Kotlin/Scala** | 소스 → 바이트코드 → JVM | Java와 동일한 실행 구조, JVM 생태계 공유 |

```
C/C++:    .c   → [컴파일러] → 기계어 (OS별)  → 실행
Java:     .java → [javac]  → .class        → [JVM] → 기계어 → 실행
Python:   .py   ─────────────────────────── → [인터프리터] → 실행
Go:       .go   → [go build] → 기계어 (OS별) → 실행
```

## Java 실행 명령어

```sh
# 컴파일
javac Hello.java                     # Hello.class 생성
javac -d out src/Hello.java          # 출력 디렉토리 지정

# 실행
java Hello                           # 클래스 직접 실행
java -jar myapp.jar                  # JAR 파일 실행
java -cp lib/*:. com.example.Main    # 클래스패스 지정 실행

# Java 11+: 단일 소스 파일 직접 실행 (컴파일 + 실행을 한 번에)
java Hello.java                      # javac 없이 바로 실행 가능 (단일 파일 한정)
```

## 관련 문서

- [컴파일과 바이트코드](./컴파일과-바이트코드.md)
- [JVM](./JVM.md)
- [JDK](./JDK.md)
- [Java Memory](./Java-Memory.md)
- [배포 직후 CPU 스파이크](../../DevOps/kubernetes/troubleshooting/배포-직후-CPU-스파이크.md) — JIT 웜업이 배포 직후 CPU 급등으로 이어지는 실무 사례
