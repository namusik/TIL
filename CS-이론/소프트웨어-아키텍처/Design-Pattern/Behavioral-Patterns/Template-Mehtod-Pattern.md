# Template Method

## 개념
- 상위 클래스가 큰 틀에서의 작업 순서를 정의하고 세부적인 작업(메서드)은 하위 클래스가 구체적으로 구현

## 구조
- 추상 클래스
  - template method
    - final 타입으로 만들어준다. 상속 클래스에서 재정의 못하도록 하기 위해
  - 추상 method
- 상속 클래스
  - 구현 method

## 예시
- JDBC template
```java
public void executeQuery(String sql) {
    openConnection();
    Statement stmt = connection.createStatement();
    stmt.execute(sql);  // Abstract logic passed to subclass
    closeConnection();
}
```
