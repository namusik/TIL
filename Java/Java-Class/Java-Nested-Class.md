# Java 중첩 클래스 (Nested Class)

> 최종 업데이트: 2026-07-16 | Java 기준

## 개념

중첩 클래스는 **다른 클래스 안에 선언한 클래스**다. 한 클래스에서만 쓰이는 보조 클래스를 바깥으로 빼지 않고 안에 두어, **논리적으로 묶고 캡슐화**하기 위해 쓴다. Java 1.1부터 지원한다.

> 서랍 안의 칸막이에 비유할 수 있다. 특정 서랍(바깥 클래스)에서만 쓰는 물건을 방 여기저기 두지 않고 그 서랍 안에 칸을 나눠 담는 것. 다만 그 칸이 **서랍에 붙어 있느냐, 떼어낼 수 있느냐**가 뒤에 볼 핵심 차이다.

> ℹ️ **"바깥 인스턴스"란?** 바깥 클래스를 `new`로 만든 **실제 객체**를 뜻한다(설계도인 클래스가 아니라, 그 설계도로 찍어낸 객체). 이 구분이 헷갈리면 → [클래스와 인스턴스](Java-Class-and-Instance.md)

## 4가지 종류

| 종류 | 선언 위치 | 바깥 인스턴스 참조(`this$0`) |
|------|-----------|------------------------------|
| **static 중첩 클래스** | 클래스 안, `static` | **없음** (독립) |
| **내부 클래스 (inner)** | 클래스 안, non-static | **있음** |
| **지역 클래스 (local)** | 메서드 안 | 있음 |
| **익명 클래스 (anonymous)** | 식(expression) | 있음(비static 문맥일 때) → [Java Anonymous Class](Java-Anonymous-Class.md) |

핵심 갈림길은 **`static`이 붙었느냐**다. 붙으면 바깥과 무관한 독립 클래스, 안 붙으면 바깥 인스턴스에 종속된다.

## static 중첩 vs 내부(inner) 클래스 — 핵심 차이

```java
public class Outer {
    private int x = 10;

    class Inner {                 // non-static 내부 클래스 — 바깥에 종속
        void print() {
            System.out.println(x);   // 바깥 필드 x에 바로 접근 가능
        }
    }

    static class StaticNested {    // static 중첩 클래스 — 독립
        void print() {
            // System.out.println(x);  // ❌ 컴파일 에러 — 바깥 인스턴스가 없음
        }
    }
}
```

| | 내부 클래스 (non-static) | static 중첩 클래스 |
|---|--------------------------|-------------------|
| 바깥 인스턴스 | **필요** | 불필요 |
| 바깥 필드·메서드 접근 | 가능 | 불가 |
| 숨은 참조 `this$0` | **있음** | 없음 |

## this$0 — 숨은 바깥 참조

내부 클래스가 바깥의 `x`에 접근할 수 있는 이유는, 컴파일러가 **바깥 인스턴스를 가리키는 숨겨진 필드 `this$0`를 자동으로 심어두기** 때문이다. 위 `Inner`를 디컴파일하면 이렇게 보인다.

```java
class Outer$Inner {
    final Outer this$0;              // ← 컴파일러가 자동 생성한 바깥 참조
    Outer$Inner(Outer outer) {       // ← 생성자가 바깥 인스턴스를 강제로 받음
        this.this$0 = outer;
    }
    void print() {
        System.out.println(this$0.x);  // 코드의 x는 실제론 this$0.x
    }
}
```

즉 코드에 쓴 `x`는 사실 **`this$0.x`**다. 눈에 안 보이지만 **모든 내부 클래스 인스턴스가 바깥 객체 하나를 손에 쥐고 있는** 것이다. (`this$0` 자체는 디컴파일로 확인 가능 → [Java Decompile](../Java-Decompile.md))

## 생성 방법

바깥 참조 유무가 생성 문법에도 드러난다.

```java
Outer outer = new Outer();

Outer.Inner inner = outer.new Inner();          // 내부 클래스 — 바깥 인스턴스 필요
Outer.StaticNested n = new Outer.StaticNested(); // static — 바깥 없이 독립 생성
```

내부 클래스는 `this$0`에 넣을 바깥 객체가 없으면 아예 만들 수 없다.

## ⚠️ 메모리 누수

`this$0`가 **바깥 객체를 계속 붙잡고 있어서**, 내부 클래스 인스턴스가 살아있는 한 **바깥 객체도 GC되지 못한다.**

```java
// 내부 클래스 인스턴스를 오래 사는 곳(리스너·스레드·정적 컬렉션)에 등록
eventBus.register(outer.new Inner());   // Inner가 살아있는 한 Outer 전체가 메모리에 붙잡힘
```

- 리스너·콜백·`Runnable`을 내부 클래스로 만들어 **오래 사는 객체**에 넘기면, 바깥 객체가 못 죽고 누적된다.
- (안드로이드에서 `Handler`/`AsyncTask` 내부 클래스가 `Activity`를 누수시키는 고전적 사례가 이것이다.)

## ⚠️ 직렬화 함정

내부 클래스를 직렬화하면 `this$0`를 타고 **바깥 객체까지 딸려간다.** 바깥이 `Serializable`이 아니면 `NotSerializableException`이 터진다. 그래서 직렬화 대상 클래스에는 내부 클래스를 신중히 쓴다.

## 언제 뭘 쓰나 — 되도록 static

원칙은 단순하다.

> **내부 클래스에서 바깥 인스턴스 멤버를 쓰지 않는다면, 무조건 `static`을 붙인다.**

`static`을 붙이면 `this$0`가 생기지 않아 **메모리 누수·직렬화 문제가 원천 차단**된다. Effective Java도 "멤버 클래스는 되도록 static으로 만들라"고 못 박는다. 바깥 인스턴스와 진짜로 엮여야 할 때만 non-static 내부 클래스를 쓴다.

## 관련 문서

- [클래스와 인스턴스](Java-Class-and-Instance.md) — "바깥 인스턴스" 등 클래스/인스턴스 기초
- [Java Anonymous Class](Java-Anonymous-Class.md) — 익명 클래스(중첩 클래스의 한 형태)
- [Static](../Java-Modifiers/Static.md) — static의 의미와 동작
- [Java Decompile](../Java-Decompile.md) — `this$0` 등 컴파일러 생성 코드 확인
