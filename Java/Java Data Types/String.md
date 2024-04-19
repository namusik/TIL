# Java String 

## 개념
- Java 9 이상에서는 String의 내부 표현이 문자 배열에서 바이트 배열로 변경되어 메모리 사용량이 감소
  - Java에서는 String 객체가 문자 데이터를 저장하기 위해 char[] 배열을 사용
  - 각 char는 UTF-16 인코딩을 사용하여 2바이트의 공간을 차지
  - 모든 문자열 데이터가 두 바이트 단위로 저장되었기 때문에 메모리 사용이 비효율적
  - Java 9에서는 String의 내부 표현이 char[]에서 byte[]로 변경
  - 추가적으로 coder라는 필드가 도입
  - byte[] 배열은 문자 데이터를 저장하는 데 사용되며, coder 필드는 문자 데이터의 인코딩 형식을 나타냄
  - String 객체는 필요한 메모리를 문자 데이터의 실제 내용에 기반하여 조정할 수 있게 되었다.
  

## 문자열 생성법
### 1. 문자열 리터럴 
```java
String s1 = "Hello";
```
- 소스 코드 내에서 직접 입력된 텍스트
- 가장 간단하고 일반적인 방법
- 문자열이 컴파일 시에 문자열 풀에 저장
- 메모리 사용 측면에서 가장 효율적인 방법

### 2. new 키워드를 사용한 생성
```java
String s2 = new String("Hello");
```
- 항상 새로운 String 객체를 생성
- 이미 존재하는 문자열과 동일한 내용이라도 메모리의 새로운 위치에 객체를 생성
- 메모리 사용 측면에서 비효율적

### 3. StringBuilder 또는 StringBuffer 사용
```java
StringBuilder sb = new StringBuilder("Hello");
sb.append(" World");
String s5 = sb.toString();

StringBuffer buffer = new StringBuffer("Hello");
buffer.append(" World");
String result = buffer.toString();
```
- 문자열을 자주 변경해야 하는 경우, StringBuilder 또는 StringBuffer를 사용하여 문자열을 조작
- StringBuilder는 동기화를 지원하지 않기 때문에 싱글 스레드 환경에서 선호
- StringBuffer는 멀티 스레드 환경에서 사용할 수 있음

### 결론
- 정적인 문자열은 문자열 리터럴을 사용하여 생성하는 것이 메모리에 가장 효율적
- 문자열이 자주 변경되거나 조합되는 경우 StringBuilder (단일 스레드) 또는 StringBuffer (멀티 스레드)를 사용하는 것이 유리

## 문자열 조작법
### 1. concat()
```java
String s1 = "Hello";
String s2 = " World";
String s3 = s1.concat(s2);
System.out.println(s3); // 출력: "Hello World"
```
- 두 문자열을 결합
### 1. concat()
```java
String s1 = "Hello";
String s2 = " World";
String s3 = s1.concat(s2);
System.out.println(s3); // 출력: "Hello World"
```
- 두 문자열을 결합

### 2. substring()
```java
String s = "Hello World";
String sub = s.substring(6, 11);
System.out.println(sub); // 출력: "World"
```
- 문자열의 부분을 추출

### 3. replace()
```java
String s = "Hello World";
String replaced = s.replace("World", "Java");
System.out.println(replaced); // 출력: "Hello Java"
```
- 문자열 내의 문자를 다른 문자로 대체

### 4. toUpperCase(), toLowerCase()
```java
String s = "Hello World";
String upper = s.toUpperCase();
String lower = s.toLowerCase();
System.out.println(upper); // 출력: "HELLO WORLD"
System.out.println(lower); // 출력: "hello world"
```
- 문자열을 대문자 또는 소문자로 변환

### 5. trim()
```java
String s = "   Hello World   ";
String trimmed = s.trim();
System.out.println(trimmed); // 출력: "Hello World"
```
- 문자열 양쪽 끝의 공백을 제거

### 6. startsWith(), endsWith()
```java
String s = "Hello World";
boolean starts = s.startsWith("Hello");
boolean ends = s.endsWith("World");
System.out.println(starts); // 출력: true
System.out.println(ends); // 출력: true
```
- 문자열이 특정 문자로 시작하거나 끝나는지 확인

### 7. charAt()
```java
String s = "Hello World";
char c = s.charAt(0);
System.out.println(c); // 출력: 'H'
```
- 특정 위치의 문자를 반환

### 8. indexOf(), lastIndexOf()
```java
String s = "Hello World Hello";
int index = s.indexOf("Hello");
int lastIndex = s.lastIndexOf("Hello");
System.out.println(index); // 출력: 0
System.out.println(lastIndex); // 출력: 12
```
- 특정 문자 또는 문자열이 처음 나타나는 위치 또는 마지막으로 나타나는 위치를 반환

### 9. length()
```java
String s = "Hello World";
int length = s.length();
System.out.println(length); // 출력: 11
```
- 문자열의 길이를 반환

### 9. isEmpty()
```java
String s = "";
boolean empty = s.isEmpty();
System.out.println(empty); // 출력: true
```
- 문자열이 비어있는지 확인

## 관련 개념
### 문자열 인턴링 
- String Interning
- Java 성능 최적화 기법 중 하나
- 모든 문자열 리터럴은 자동으로 인턴(intern) 됨.
- JVM의 특정 영역인 **문자열 풀(String)** 에 문자열을 저장하는 프로세스
- 문자열 풀은 메모리 내에 위치하며, 모든 문자열 리터럴은 실행 시 이 풀에 저장됨.
- 주요 목적은 메모리 사용을 최적화 하는 것.
  - 동일한 문자열 리터럴이 여러번 사용된다면, JVM은 각 인스턴스에 대해 새로운 메모리 공간을 할당하는 대신, 이미 풀에 존재하는 동일한 문자열의 참조를 재사용한다.
  - 같은 문자열 리터럴이 여러 변수에 할당되어도, 모두 메모리 상 동일한 위치를 가리키게 됨.
- **new String()**을 사용하면 인턴링이 적용되지 않는다.


## 문자열 연결 방법

String을 한줄로 + 연산자로 썼을 때, 성능저하가 발생하지 않는다. 

여러줄에 걸쳐 연산하는 경우에는 명시적으로 `StringBuilder`를 사용해주자

https://www.baeldung.com/java-strings-concatenation

https://siyoon210.tistory.com/160

## 문자열 비교
### String.equals()
```java
"AA".equals("BB");
```
- 두 문자열의 내용이 같은지를 비교
- 대소문자를 구분하며, 두 문자열의 길이와 각 문자가 동일한지를 체크

### StringUtils.equals()
```java
StringUtils.equals(string1, string2)
```
- 두 문자열을 비교하되, null에 대한 안전한 처리가 내장
- 둘 중 하나만 null일 경우에는 false를 반환
- null 값을 null과 비교했을 때 true를 반환하는 것을 허용

### == 연산자
```java
string1 == string2
```
- 객체의 참조(메모리 주소)를 비교
- 두 문자열 객체가 메모리 상에서 동일한 위치를 가리키고 있을 때만 true를 반환
- 문자열 리터럴과 new String()을 통해 생성된 문자열은 서로 다른 메모리 주소를 가질 수 있습니다. 예를 들어, "hello" == new String("hello")는 false를 반환

### 결론
- 실제 응용 프로그램에서 문자열의 내용 비교가 필요할 때는 **equals()** 메서드를 사용하는 것이 일반적