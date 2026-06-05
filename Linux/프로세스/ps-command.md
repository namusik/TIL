# ps — 프로세스 스냅샷 조회

> 최종 업데이트: 2026-05-20 | 기준: Linux (procps-ng)

## 개념

`ps`(process status)는 **현재 실행 중인 프로세스의 한 순간(스냅샷)** 을 출력하는 명령이다. 그 시점의 PID·소유자·상태·CPU·메모리·명령행 등을 표 형태로 보여준다.

> "지금 이 순간 사진 한 장 찍기"라고 보면 된다. 실시간 동영상이 필요하면 `top`/`htop`, 단순히 PID만 빠르게 찾고 싶으면 `pgrep`/`pidof`를 쓴다.

## 배경/역사

- 1973년 유닉스 v4에 처음 등장. 이후 **AT&T 계열(SysV)** 과 **버클리 계열(BSD)** 이 각자 옵션 문법을 만들면서 갈라졌고, 리눅스의 `ps`(procps-ng)는 **두 스타일을 모두 지원**한다.
- 그래서 `ps -ef`(SysV)와 `ps aux`(BSD)가 거의 같은 일을 하는데 둘 다 자주 쓰인다 — 같은 명령에 옵션 문법이 두 가지 공존하는 드문 케이스.
- 옵션 표기 차이:
  - **SysV**: `-` 붙음, 한 글자 묶음 가능 → `ps -ef`, `ps -eLf`
  - **BSD**: `-` 안 붙음 → `ps aux`, `ps auxf`
  - **GNU 긴 옵션**: `--` 붙음 → `ps --forest`, `ps --sort=-%cpu`

## ps -ef vs ps aux — 가장 많이 쓰는 두 명령

| 옵션 조합 | 스타일 | 의미 | 주요 컬럼 |
|---|---|---|---|
| `ps -ef` | SysV | **e**very process + **f**ull format | UID, PID, PPID, C, STIME, TTY, TIME, CMD |
| `ps aux` | BSD | **a**ll users + **u**ser format + 데몬 포함(**x**) | USER, PID, %CPU, %MEM, VSZ, RSS, TTY, STAT, START, TIME, COMMAND |

```bash
ps -ef                  # 모든 프로세스 + 풀 포맷 (SysV)
ps aux                  # 모든 프로세스 + 사용자 친화 포맷 (BSD)
ps -ef | grep nginx     # 특정 프로세스 찾기 (가장 흔한 패턴)
```

- **`-ef`** 는 PPID(부모 프로세스 ID)가 보여서 **프로세스 트리 추적**에 유리.
- **`aux`** 는 `%CPU`·`%MEM`·`STAT`이 보여서 **자원 사용량 모니터링**에 유리.
- 둘의 옵션을 섞어 쓰면 안 된다 (`ps -aux`는 경고가 뜨거나 BSD로 해석됨).

## 출력 컬럼 의미 — ps -ef 예시

```
$ ps -ef | grep m2msDispatchRouter
ec2-user 12927  5837  0 18:26 ?        00:00:00 m2msDispatchRouter
         ↑PID  ↑PPID                            ↑CMD
```

| 컬럼 | 의미 |
|---|---|
| `UID` | 프로세스 소유자(`ec2-user`) |
| `PID` | 프로세스 고유 번호 — `kill`·`strace` 등에서 이 번호로 지정 |
| `PPID` | 부모 프로세스 ID — 누가 이 프로세스를 띄웠는지. 같은 PPID를 가진 프로세스들이 죽었다 살아나면 **부모가 supervisor**일 가능성이 높다 |
| `C` | 스케줄러용 CPU 사용률 정수값. 현대 리눅스에선 의미가 크지 않음. 정확한 CPU는 `ps aux`의 `%CPU` 사용 |
| `STIME` | 프로세스 시작 시각 (오늘이면 시:분, 어제 이전이면 날짜) |
| `TTY` | 연결된 터미널. `?`는 **연결된 터미널 없음** = 보통 데몬/백그라운드 서비스 |
| `TIME` | 누적 CPU 사용 시간 (벽시계 시간 아님) |
| `CMD` | 실행된 명령과 인자 |

## 출력 컬럼 의미 — ps aux 추가 컬럼

```
$ ps aux | grep nginx
root  1234  0.0  0.2  72088  4512 ?  Ss  May18  0:00 nginx: master process
```

| 컬럼 | 의미 |
|---|---|
| `%CPU` | **마지막 1초간** CPU 사용률(%). 시작 직후엔 부정확 |
| `%MEM` | RSS 기준 물리 메모리 사용률(%) |
| `VSZ` | 가상 메모리 크기 (KB) — 매핑된 주소공간 전체. mmap 파일 포함하므로 실제 사용량 아님 |
| `RSS` | **실제 점유 중인 물리 메모리** (KB) — 메모리 사용량은 보통 이 값으로 판단 |
| `STAT` | 프로세스 상태 (아래 별도 섹션) |
| `START` | 시작 시각 (당일이면 시:분, 이전이면 날짜) |

## STATE / STAT 컬럼 — 프로세스 상태

`ps aux`의 `STAT`, `ps -l`의 `S` 컬럼에 나오는 한 글자 상태값. **실무 디버깅에서 매우 중요**.

| 코드 | 이름 | 의미 |
|---|---|---|
| `R` | Running | 실행 중 또는 실행 큐에 대기 |
| `S` | Sleeping (interruptible) | 이벤트 대기 중. 시그널로 깨울 수 있음. **대부분의 정상 프로세스** |
| `D` | Uninterruptible sleep | 보통 디스크/NFS I/O 대기. **시그널로 깨우거나 죽일 수 없음** — `kill -9`도 안 먹힘 |
| `Z` | Zombie | 종료됐는데 부모가 `wait()`로 회수하지 않음. 자원은 거의 없지만 PID 슬롯 점유 |
| `T` | Stopped | `SIGSTOP`·`SIGTSTP`로 멈춤(Ctrl+Z) 또는 디버거에 의해 정지 |
| `I` | Idle kernel thread | 리눅스 4.14+ 커널 스레드 유휴 상태 |

추가 표시자(state 글자 뒤에 붙음):

| 기호 | 의미 |
|---|---|
| `<` | 높은 우선순위 (음수 nice) |
| `N` | 낮은 우선순위 (양수 nice) |
| `L` | 메모리에 페이지 락 |
| `s` | 세션 리더 |
| `l` | 멀티스레드 |
| `+` | 포그라운드 프로세스 그룹 |

예: `Ss` = sleeping + session leader, `R+` = running + foreground, `Z` 단독 = 좀비.

> `D` 상태가 자주 보이거나 길게 지속되면 디스크/네트워크 I/O 문제 신호. `Z`(좀비)가 쌓이면 부모 프로세스의 `wait()` 누락 버그.

## 자주 쓰는 옵션

```bash
# 특정 PID만
ps -p 12927
ps -p 12927,12928,12929          # 여러 개

# 특정 사용자
ps -u ec2-user
ps -U ec2-user                    # 실제 UID 기준

# 트리 구조 (부모-자식 관계 시각화)
ps -ef --forest
ps auxf

# 정렬
ps aux --sort=-%cpu | head        # CPU 많이 쓰는 순
ps aux --sort=-%mem | head        # 메모리 많이 쓰는 순

# 컬럼 커스터마이즈 (-o)
ps -eo pid,ppid,user,cmd
ps -eo pid,etime,cmd              # 실행 경과시간 포함
ps -eo pid,pcpu,pmem,rss,cmd --sort=-pcpu

# 스레드까지 보기 (-L)
ps -eLf                           # LWP(스레드) 컬럼 추가
ps -eL -p 12927                   # 특정 프로세스의 스레드들

# 명령행 전체 보기 (긴 명령이 잘릴 때)
ps -ef ww                         # w를 두 번 주면 끝까지 표시
```

## grep 자기 자신 거르기 — `[c]md` 트릭

```bash
ps -ef | grep nginx
# nginx 프로세스                                  ← 원하는 것
# user  9999  ...  grep --color=auto nginx       ← grep 자기 자신도 잡힘
```

**`grep` 명령행 자체에 `nginx` 문자열이 있어서 자기 자신이 결과에 포함**되는 흔한 함정. 해결책 3가지:

```bash
# ① 정규식 트릭: 첫 글자를 [ ]로 감싸면 grep 명령행은 [n]ginx, 검색 패턴은 nginx → 자기 자신 안 잡힘
ps -ef | grep "[n]ginx"

# ② grep -v로 명시 제외
ps -ef | grep nginx | grep -v grep

# ③ 애초에 pgrep 사용 (권장)
pgrep -af nginx                   # -a: 명령행 포함, -f: 전체 명령행 매칭
```

## 관련 명령 비교

| 명령 | 용도 | 출력 |
|---|---|---|
| `ps` | 스냅샷 1회 출력 | 정적 |
| `top` | 실시간 갱신 (기본 3초) | 동적, 대화형 |
| `htop` | top의 컬러풀/스크롤/마우스 지원 버전 | 동적, 대화형 (별도 설치 필요) |
| `pgrep` | 이름/패턴으로 **PID만** 추출 | PID 목록 |
| `pidof` | 정확한 프로그램명으로 PID 조회 | PID 목록 |
| `pstree` | 프로세스 부모-자식 트리만 시각화 | 트리 |

```bash
# 한 줄로 PID만 필요하면 pgrep
pgrep -f m2msDispatchRouter
# 12927

# 트리 형태로만 보고 싶으면 pstree
pstree -p 5837                    # PID 5837 이하 자식 트리
```

## 실무 패턴

```bash
# 특정 프로세스가 살아있는지 확인
pgrep -x nginx >/dev/null && echo "alive" || echo "dead"

# 메모리 가장 많이 먹는 상위 5개
ps aux --sort=-%mem | head -6

# 특정 부모의 자식 프로세스들
ps -ef | awk '$3==5837'

# 좀비 프로세스 찾기
ps -eo pid,ppid,stat,cmd | awk '$3 ~ /^Z/'

# 오래된 프로세스 (실행 경과시간 기준)
ps -eo pid,etime,cmd --sort=-etime | head
```

## 한계

- **스냅샷이라 빠르게 변하는 상태(CPU 스파이크 등)는 놓친다** → `top`/`htop`로 보완.
- `%CPU`는 1초 평균이라 시작 직후 프로세스에선 신뢰도 낮음.
- `VSZ`는 실제 메모리 사용량이 아니다 — 메모리 압박 판단은 `RSS`로.
- 컨테이너 안에서 호스트의 다른 프로세스는 안 보인다(PID 네임스페이스 격리). 호스트에서 봐야 함.

## 관련 문서

- [프로세스](프로세스.md) — 프로세스 개념 기초
- [kill command](kill-command.md) — `ps`로 찾은 PID에 시그널 보내기
- [strace command](strace-command.md) — `ps`로 찾은 PID에 attach해 시스템 콜 추적
- [systemd](systemd.md) — 서비스 관리 (`systemctl status`로 프로세스 상태 확인)

## 출처

- [Dale Seo - shell-command-ps](https://www.daleseo.com/shell-command-ps/)
- `man ps`, procps-ng 공식 문서
