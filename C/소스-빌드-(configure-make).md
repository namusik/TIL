# 소스 코드 빌드 (configure / make)

> 최종 업데이트: 2026-04-22 | 기준: Linux/Unix 환경의 C/C++ 오픈소스 빌드 관행

## 개념

Linux/Unix 세계에서 C/C++ 오픈소스를 설치하는 전통적인 방법은 **소스 코드를 받아서 현재 시스템에 맞게 직접 컴파일**하는 것이다. 대부분 `./configure` → `make` → `sudo make install`의 3단계로 정형화되어 있고, 이걸 **Autotools 빌드 패턴**이라 부른다.

> 비유하자면 가구를 IKEA처럼 받는 것. 완제품(바이너리) 대신 **부품(소스)** 과 조립 설명서(Makefile 생성기)가 오고, 내가 있는 곳(시스템)의 치수를 재서 조립한다. 결과는 **이 시스템에 딱 맞게 맞춤 제작된 바이너리**.

## 왜 소스 빌드를 하나

패키지 매니저(`apt`, `yum`)로 깔면 편한데 왜 굳이 소스로?

| 상황 | 이유 |
|------|------|
| 패키지 저장소에 버전이 오래됨 | 최신 버전 필요 시 |
| 기본 패키지에 특정 기능이 빠져 있음 | 컴파일 옵션 커스터마이징 |
| 폐쇄망·제한된 서버 | rpm/deb 패키지가 없는 환경 |
| 성능 최적화 | 현재 CPU에 맞춘 최적화 (`-march=native`) |
| 라이브러리 연동 | 특정 버전의 의존성과 링크 |

## 배경/역사 (GNU Autotools)

- **1980년대 후반** — GNU 프로젝트가 여러 Unix 변종(AIX, HP-UX, SunOS, BSD 등)에서 **동일 코드가 돌게** 하려고 자동화 도구 시작
- **`autoconf`** (1991) — 시스템 환경을 탐지해 `configure` 스크립트를 생성
- **`automake`** — `Makefile.am`에서 플랫폼 독립적 `Makefile.in` 생성
- **`libtool`** — 공유/정적 라이브러리 빌드 추상화
- 이 3종 세트(**Autotools**)가 표준이 되며 `./configure && make && make install` 이 Unix 소스 배포의 **관행(de facto)** 으로 자리 잡음
- 현재 대안: CMake, Meson, Bazel 등

## 전체 흐름

```
[배포처]                            [내 서버]
sqlite.org ── tar.gz ──► wget ──► tar ──► (소스 디렉터리)
                                              │
                                              ▼
                                        ./configure  (환경 점검 → Makefile 생성)
                                              │
                                              ▼
                                          make        (컴파일 → 바이너리/라이브러리)
                                              │
                                              ▼
                                   sudo make install  (시스템 경로에 복사)
                                              │
                                              ▼
                                     /usr/local/bin 에서 실행
```

## 단계별 상세

### 1. 다운로드 — `wget` / `curl`

배포 사이트에서 소스 tarball을 받는다.

```sh
wget https://sqlite.org/2026/sqlite-autoconf-3530000.tar.gz
# 또는
curl -O https://sqlite.org/2026/sqlite-autoconf-3530000.tar.gz
```

- `wget` — 파일 다운로드 전용. HTTP/HTTPS/FTP 지원
- `curl -O` — 동일한 URL의 파일명으로 저장

> 배포 사이트에서 보통 **체크섬(SHA256)** 도 제공. 무결성 검증 권장.

### 2. 압축 해제 — `tar`

`.tar.gz`(또는 `.tgz`)는 Linux의 대표적인 소스 배포 포맷.

```sh
tar xvfz sqlite-autoconf-3530000.tar.gz
```

| 옵션 | 의미 |
|------|------|
| `x` | e**X**tract — 풀기 |
| `v` | **V**erbose — 진행 상황 출력 |
| `f` | **F**ile — 파일명 지정 |
| `z` | g**Z**ip 해제까지 함께 |

| 확장자 | 명령 |
|--------|------|
| `.tar.gz` / `.tgz` | `tar xvfz file.tar.gz` |
| `.tar.bz2` | `tar xvfj file.tar.bz2` |
| `.tar.xz` | `tar xvfJ file.tar.xz` |
| `.zip` | `unzip file.zip` |

### 3. 소스 디렉터리 이동 — `cd`

```sh
cd sqlite-autoconf-3530000
ls
# Makefile.in  configure  sqlite3.c  ...
```

전형적인 Autotools 프로젝트라면 `configure` 스크립트와 `Makefile.in`이 보인다.

#### `Makefile.in`이란?

**Makefile의 템플릿 파일**. `configure`가 이걸 읽어 플레이스홀더를 실제 값으로 채워 `Makefile`을 생성한다.

```
Makefile.in  ──►  ./configure  ──►  Makefile
 (템플릿)         (환경에 맞게 치환)  (실제 빌드 스크립트)
```

- 템플릿 안에는 `@CC@`, `@CFLAGS@`, `@prefix@` 같은 **플레이스홀더**가 박혀 있음
- `configure`가 시스템 환경(컴파일러 경로, `--prefix` 옵션 등)을 조사해 이 자리를 채움
- 플랫폼마다 다른 값(리눅스/macOS의 컴파일러 경로, 링크할 라이브러리 등)을 빌드 타임에 주입하기 위한 구조
- `.in` 접미사는 Autoconf 템플릿의 관례 — `sqlite3.pc.in`, `config.h.in` 등도 동일 패턴

> 더 위의 원본은 `Makefile.am`(개발자 작성) — `automake`가 `Makefile.in`을 생성해 **tarball에 포함**. 사용자 시스템에 `automake`가 없어도 `./configure && make`만으로 빌드되게 하기 위함.

### 4. 빌드 설정 — `./configure`

**현재 시스템 환경을 점검**해서 이 시스템에 맞는 `Makefile`을 생성한다.

```sh
./configure
```

- `./` 는 "현재 디렉터리의 파일을 실행" (PATH에 없는 실행 파일을 돌릴 때)
- 수행 내용
  - C/C++ 컴파일러 존재 확인
  - 필수 헤더(`stdlib.h`, `pthread.h` 등) 검색
  - 라이브러리(`-lpthread`, `-lz`, `-lreadline` 등) 링크 가능 여부
  - 시스템 타입(x86_64/ARM), OS 종류
- 산출물
  - **`Makefile`** — 실제 컴파일에 쓸 빌드 스크립트
  - `config.h` / `xxx_cfg.h` — 감지한 환경을 C 매크로로 기록
  - `config.log` — 상세 로그 (실패 시 디버깅용)

#### 자주 쓰는 옵션

```sh
./configure --help                    # 이 프로젝트가 지원하는 옵션 보기
./configure --prefix=/opt/sqlite      # 설치 경로 변경 (기본: /usr/local)
./configure --enable-foo              # 특정 기능 켜기
./configure --disable-bar             # 특정 기능 끄기
./configure --with-readline           # 외부 라이브러리 연동
./configure CC=gcc CFLAGS="-O3"       # 컴파일러/플래그 지정
```

> configure가 **"xxx not found"** 로 실패하면 **해당 개발 패키지 설치** 필요.
> 예: `sudo apt install libreadline-dev zlib1g-dev build-essential`

### 5. 컴파일 — `make`

`Makefile`에 기술된 규칙에 따라 **소스를 컴파일**한다.

```sh
make
make -j$(nproc)   # CPU 코어 수만큼 병렬 빌드 (훨씬 빠름)
```

빌드 로그에서 보이는 단계 (sqlite 예시)

```sh
cc -c sqlite3.c -o sqlite3.o ...             # .c → .o (오브젝트 파일)
cc -o libsqlite3.so sqlite3.o -shared ...    # 동적 라이브러리 .so
ar cr libsqlite3.a sqlite3.o                 # 정적 라이브러리 .a
cc -o sqlite3 shell.c sqlite3.c ...          # 실행 파일
```

| 산출물 | 확장자 | 설명 |
|--------|--------|------|
| 오브젝트 파일 | `.o` | 컴파일 중간물 |
| 정적 라이브러리 | `.a` | 빌드 시점에 실행 파일 안에 포함 |
| 동적(공유) 라이브러리 | `.so` | 런타임에 로드 (Linux), `.dylib`(macOS), `.dll`(Windows) |
| 실행 파일 | (없음) | 확장자 없이 이름만 |

### 6. 설치 — `sudo make install`

`/usr/local/` 등 **시스템 경로에 바이너리/라이브러리/헤더를 복사**한다.

```sh
sudo make install
```

- 기본 설치 경로
  - `/usr/local/bin/` — 실행 파일
  - `/usr/local/lib/` — 라이브러리
  - `/usr/local/include/` — 헤더
  - `/usr/local/share/` — 문서
- `sudo`가 필요한 이유 — `/usr/local`은 루트 권한 필요
- **제거 지원** (프로젝트에 따라): `sudo make uninstall`

> 시스템에 영향을 주지 않으려면 `--prefix=$HOME/.local` 로 설정하면 루트 없이 설치 가능.

### 7. 검증 — `ldd`, 실행

```sh
ldd /usr/local/bin/sqlite3
# linux-vdso.so.1 => ...
# libpthread.so.0 => /lib64/libpthread.so.0 ...
# libz.so.1 => /lib64/libz.so.1 ...
```

- **`ldd`** — 실행 파일이 참조하는 **동적 라이브러리** 목록. "런타임에 없으면 실행 실패"할 의존성을 미리 확인
- `=> not found` 가 뜨면 해당 라이브러리를 추가로 설치하거나 `LD_LIBRARY_PATH` 설정 필요

## 자주 쓰는 빌드 플래그

| 변수 | 의미 |
|------|------|
| `CC`, `CXX` | C/C++ 컴파일러 (gcc/clang) |
| `CFLAGS`, `CXXFLAGS` | 컴파일 플래그 (예: `-O2 -g`) |
| `LDFLAGS` | 링커 플래그 (예: `-L/opt/lib`) |
| `CPPFLAGS` | 전처리기 플래그 (예: `-I/opt/include`) |
| `-j N` | make의 병렬 빌드 스레드 수 |
| `-march=native` | 현재 CPU에 최적화 |
| `--prefix=PATH` | 설치 경로 |

## 필수 개발 도구 (사전 설치)

소스 빌드에 필수인 툴체인.

```sh
# Debian/Ubuntu
sudo apt install build-essential

# RHEL/CentOS/Rocky
sudo yum groupinstall "Development Tools"
# 또는
sudo dnf groupinstall "Development Tools"
```

설치되는 것들
- `gcc` / `g++` — C/C++ 컴파일러
- `make` — 빌드 도구
- `autoconf`, `automake`, `libtool` — Autotools
- `binutils` — ar, ld 등 링커/아카이브 도구

개별 프로젝트에 따라 필요한 **개발용 헤더 패키지** — Debian은 `-dev`, RHEL은 `-devel` 접미사.
```sh
# 예: zlib 개발 파일
sudo apt install zlib1g-dev        # Debian/Ubuntu
sudo yum install zlib-devel        # RHEL/CentOS
```

## Autotools 대안

Autotools는 오래되고 느리다. 현대 프로젝트는 다른 빌드 시스템을 쓰는 경우 많음.

| 빌드 시스템 | 진입점 | 대표 프로젝트 |
|------------|--------|--------------|
| **Autotools** | `./configure && make` | SQLite, OpenSSL 등 전통적 오픈소스 |
| **CMake** | `cmake . && make` | LLVM, MySQL, ClickHouse, 대부분의 C++ 프로젝트 |
| **Meson** | `meson setup build && ninja -C build` | GNOME, QEMU 일부, systemd |
| **Bazel** | `bazel build //...` | Google 오픈소스, gRPC |
| **Make only** | `make` | 커널, BusyBox 등 (간단한 프로젝트) |

### CMake 예시

```sh
mkdir build && cd build
cmake ..                     # CMakeLists.txt 읽어서 Makefile 생성
cmake -DCMAKE_INSTALL_PREFIX=/opt/xxx ..
make -j$(nproc)
sudo make install
```

## 정석 흐름 요약

```sh
# 1. 다운로드
wget https://xxx.org/project-1.2.3.tar.gz

# 2. 압축 해제
tar xvfz project-1.2.3.tar.gz

# 3. 소스 디렉터리로 이동
cd project-1.2.3

# 4. 빌드 설정
./configure --prefix=/usr/local

# 5. 컴파일 (병렬 빌드)
make -j$(nproc)

# 6. 설치
sudo make install

# 7. 검증
which xxx
ldd /usr/local/bin/xxx
xxx --version
```

## 문제 해결 체크리스트

- **`./configure: command not found`** — 파일이 실행 권한 없음 → `chmod +x configure`
- **`configure: error: C compiler cannot create executables`** — `build-essential`/`Development Tools` 미설치
- **`xxx.h not found`** — 개발 헤더 패키지 미설치 (`-dev`/`-devel`)
- **`make: *** No rule to make target`** — `./configure` 실패 또는 Makefile 없음. `config.log` 확인
- **`ldd`에서 `not found`** — `LD_LIBRARY_PATH` 설정 또는 `sudo ldconfig` 실행
- **같은 라이브러리 여러 버전 충돌** — `--prefix`로 별도 경로에 설치

## 관련 문서

- [빌드 파일 확장자 (.c .o .a .so .in).md](빌드%20파일%20확장자%20%28.c%20.o%20.a%20.so%20.in%29.md) — 빌드 중 등장하는 파일 확장자 정리
- [../Linux/파일/파일 관리 명령어.md](../Linux/%ED%8C%8C%EC%9D%BC/%ED%8C%8C%EC%9D%BC%20%EA%B4%80%EB%A6%AC%20%EB%AA%85%EB%A0%B9%EC%96%B4.md) — `tar`, `wget` 등 Linux 파일 관련 명령
- [../Linux/쉘/환경변수설정.md](../Linux/%EC%89%98/%ED%99%98%EA%B2%BD%EB%B3%80%EC%88%98%EC%84%A4%EC%A0%95.md) — `LD_LIBRARY_PATH`, `PATH`
- [../Linux/네트워크/서버 접속](../Linux/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/%EC%84%9C%EB%B2%84%20%EC%A0%91%EC%86%8D)
