# strace — 시스템 콜 추적

> 최종 업데이트: 2026-05-20 | 기준: Linux (strace 5.x+, `ptrace(2)` 기반)

## 개념

`strace`(**s**ystem call **trace**)는 프로세스가 커널에 요청하는 **시스템 콜과 시그널을 실시간으로 가로채서 출력**하는 도구다. 파일 열기, 네트워크 송수신, 메모리 할당 등 프로세스가 OS에 "이거 해줘"라고 부탁하는 모든 호출을 그대로 볼 수 있다.

> 비유하자면 **프로세스의 콜택시 통화 도청기**. 프로세스가 OS(커널)에 뭘 시키는지를 옆에서 다 받아 적어준다.

## 언어/런타임 무관

`strace`는 **모든 언어/런타임에 동일하게 동작**한다. 이유는 시스템 콜이 **커널 경계에서 모두 같은 방식으로 호출**되기 때문 — 컴파일된 바이너리든 인터프리터든, C/C++/Java/Python/Go/Node.js 어느 것이든 OS 입장에선 똑같이 `openat()`·`read()`·`write()`를 호출한다.

```bash
strace ls /tmp                    # C 바이너리
strace python myapp.py            # 파이썬
strace java -jar app.jar          # 자바
strace node server.js             # Node.js
```

## 배경/역사

- 1991년 Paul Kranenburg가 **SunOS용**으로 처음 작성 (`trace`).
- 1992년 Branko Lankester가 **리눅스로 포팅**, 이후 Rick Sladkey가 합쳐 현재 형태(`strace`)가 됨.
- 내부적으로 **`ptrace(2)`** 시스템 콜을 사용 — 디버거(gdb)와 같은 메커니즘. 그래서 추적 대상 프로세스를 일시정지·재개하며 syscall 진입/복귀 시점을 가로챈다.
- 현재는 strace.io 프로젝트(GitHub `strace/strace`)에서 활발히 유지보수 중. 최근 버전은 `seccomp-bpf` 기반 필터링을 통해 오버헤드를 줄이는 옵션도 제공.

## 기본 사용법

```bash
strace COMMAND                    # 새 명령을 실행하면서 추적
strace -p PID                     # 이미 실행 중인 프로세스에 attach
strace -p PID1 -p PID2            # 여러 PID 동시 attach
```

`-p`로 attach 한 경우 Ctrl+C로 떼면 **대상 프로세스는 그대로 살아있다** — 추적만 멈출 뿐 종료시키지 않는다.

## 출력 읽는 법

```
openat(AT_FDCWD, "/etc/passwd", O_RDONLY) = 3
read(3, "root:x:0:0:root:/root:/bin/bash\n"..., 4096) = 1842
close(3)                                = 0
write(1, "hello\n", 6)                  = 6
connect(4, {sa_family=AF_INET, ...}, 16) = -1 ECONNREFUSED (Connection refused)
```

| 부분 | 의미 |
|---|---|
| `openat`, `read`, ... | 시스템 콜 이름 |
| `(...)` | 인자 |
| `= 3`, `= 1842`, ... | 반환값 (보통 fd 또는 바이트 수) |
| `= -1 ECONNREFUSED` | 음수면 실패, 뒤에 `errno` 이름과 설명 |

> 트러블슈팅의 핵심은 **반환값이 음수인 줄**을 찾는 것. `ENOENT`(파일 없음), `EACCES`(권한 없음), `ECONNREFUSED`(연결 거부) 같은 errno가 그대로 보여서 원인 파악이 빠르다.

## 자주 쓰는 옵션

```bash
# 자식 프로세스(fork)까지 따라가기
strace -f -p 12927

# 시간 정보 추가
strace -t -p 12927                # 각 호출 시각 (시:분:초)
strace -tt -p 12927               # 마이크로초까지
strace -T -p 12927                # 각 호출 소요시간 표시
strace -r -p 12927                # 직전 호출 대비 상대시간

# 출력을 파일로 (출력 빠를 때 권장)
strace -o trace.log -p 12927
strace -ff -o trace.log -p 12927  # 자식별로 trace.log.PID 분리 저장

# 인자 문자열 길이 늘리기 (기본 32바이트로 잘림)
strace -s 4096 -p 12927

# 호출별 통계 요약 (디테일 안 보고 통계만)
strace -c -p 12927                # Ctrl+C 시 종합 표 출력
strace -C -p 12927                # 통계 + 상세 둘 다
```

## 필터링 — `-e trace=`

전체 syscall은 너무 많아서 보통 좁혀서 본다.

```bash
# 파일 관련
strace -e trace=openat,read,write,close -p 12927
strace -e trace=%file -p 12927          # 파일 관련 호출 묶음

# 네트워크 관련
strace -e trace=%network -p 12927
strace -e trace=connect,accept,sendto,recvfrom -p 12927

# 프로세스 관련
strace -e trace=%process -p 12927       # fork, exec, exit, wait 등

# 시그널 관련
strace -e trace=%signal -p 12927

# 특정 호출만 제외
strace -e trace=\!futex,clock_gettime -p 12927   # noise 줄이기

# fd 필터링
strace -e read=3 -p 12927               # fd 3의 read 내용까지 hex 덤프
```

자주 쓰는 syscall 묶음(`%file`, `%network`, `%process`, `%signal`, `%ipc`, `%memory`) 한 줄로 골라낼 수 있어서 편하다.

## 통계 요약 (`-c`) 출력 예

```
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 45.21    0.103214         516       200        0 read
 30.18    0.068902         229       301        0 write
 10.50    0.023980          80       300        0 openat
  8.12    0.018540          92       201        5 connect
```

**어느 호출에서 시간을 가장 많이 쓰는지** 한눈에 보임. 운영 환경에서 "왜 느리지?" 1차 진단에 유용.

## 비슷한 도구 비교

| 도구 | 추적 대상 | 오버헤드 | 비고 |
|---|---|---|---|
| **`strace`** | **시스템 콜** | **높음** (수십 배 가능) | `ptrace` 기반. 개발/디버깅용 표준 |
| `ltrace` | **라이브러리 함수** (libc 등) | 높음 | `printf`, `malloc` 등 추적 |
| `perf trace` | 시스템 콜 | 낮음 | `perf` 기반. 운영 환경에 적합 |
| `bpftrace` | eBPF 기반 만능 추적 | 매우 낮음 | 커널·유저공간 통합, 학습곡선 있음 |
| `tcpdump` | 네트워크 패킷 | 낮음 | 통신 페이로드 |
| `gdb` | 코드 흐름·변수 상태 | 매우 높음 | 디버거 |

## 운영 환경 주의사항

`strace`는 **`ptrace`로 동작하기 때문에 추적당하는 프로세스가 크게 느려진다**. 매 syscall마다 커널이 추적자에게 제어를 넘기는 컨텍스트 스위치가 발생해서, **단순 I/O 위주 워크로드는 10~100배까지 느려질 수 있다**.

- 운영 트래픽을 받는 프로세스에 함부로 붙이지 말 것
- 꼭 필요하면 `-e trace=...`로 syscall을 좁히거나, `-c`로 통계만 짧게 수집
- 가능하면 운영에선 **`perf trace`**, **`bpftrace`** 같은 저오버헤드 도구 사용
- `--seccomp-bpf` 옵션(strace 5.3+)을 쓰면 필터링이 커널 단에서 일어나 오버헤드가 줄어든다

## 디버깅 패턴 — 실무에서 자주 쓰는 조합

```bash
# 프로세스가 어떤 설정파일 찾고 있는지 (없는 파일 빼고)
strace -e trace=openat -f ./myapp 2>&1 | grep -v ENOENT

# 멈춰있는 프로세스, 지금 무슨 호출에 블락 중인가
strace -p $(pgrep myapp)
# → futex(...), read(...), poll(...) 같은 곳에서 멈춰있는 게 보임

# 어떤 syscall에서 시간을 가장 많이 쓰는지 (30초 샘플링)
timeout 30 strace -c -p 12927

# 네트워크 호출만 시간 포함해서
strace -tt -e trace=%network -p 12927

# 자식 프로세스까지 포함해 로그 분리 저장
strace -ff -tt -o /tmp/trace -p 12927
# → /tmp/trace.12927, /tmp/trace.12928, ... 생성

# "이 명령이 실제로 어떤 파일을 만지나" 한 줄 확인
strace -e trace=%file -f -o /tmp/t.log somecommand
grep -E 'openat|unlink|rename' /tmp/t.log | head
```

## 권한

- 자기 소유의 프로세스만 추적 가능. 다른 사용자의 프로세스는 **루트(또는 `CAP_SYS_PTRACE`)** 필요.
- 일부 배포판은 `kernel.yama.ptrace_scope` sysctl 설정으로 같은 사용자라도 자식이 아닌 프로세스 추적을 제한. 막혀 있으면:
  ```bash
  sudo sysctl kernel.yama.ptrace_scope=0   # 임시 (재부팅 시 초기화)
  # 영구 적용은 /etc/sysctl.d/10-ptrace.conf
  ```
- 컨테이너에서는 `--cap-add=SYS_PTRACE` 또는 `--privileged` 필요.

## 관련 문서

- [프로세스](프로세스.md) — 프로세스 개념 기초
- [ps command](ps-command.md) — 추적할 PID 찾기
- [kill command](kill-command.md) — `strace`에서 본 시그널 흐름을 직접 보내볼 때

## 출처

- `man strace`, strace.io 공식 문서
- [strace GitHub](https://github.com/strace/strace)
