# ModelMapper


## 개념 
- java에서 사용하는 라이브러리
- 한 개체 모델을 데이터 변환 개체(DTO)라고 하는 다른 개체 모델에 매핑하는 방법을 결정하여 개체를 매핑하는 것

## 의존성 추가
```gradle
implementation 'org.modelmapper:modelmapper:3.2.0'
```

## mapper 설정
```java
modelMapper.getConfiguration()
  .setFieldMatchingEnabled(true)
  .setFieldAccessLevel(Configuration.AccessLevel.PRIVATE);
```
- 일반적으로 필드매칭활성화 속성을 true로 설정하고 비공개 필드 매칭을 허용해준다. 
- setFieldMatchingEnabled(true)
  - false 일때는 modelmapper가 getter/setter를 사용해서 값을 읽고 쓰지만, true로 설정해주면 필드에 직접 접근해서 값을 매핑해준다.
  - getter/setter가 없는 필드들도 modelmapper가 접근할 수 있도록 도와줌
- setFieldAccessLevel(Configuration.AccessLevel.PRIVATE)
  - 기본적으로 modelmapper는 PUBLIC, PROTECTED 필드에만 접근할 수 있음.
  - 이 설정은 ModelMapper가 클래스 내의 private 접근 수준을 가진 필드에도 접근할 수 있도록 해줌.

## 특징
- ModelMapper는 기본적으로 동일한 데이터 구조와 유사한 타입의 객체 사이에서 작동
- 컬렉션에서 컬렉션으로의 매핑을 지원하지만, 이는 주로 동일하거나 호환 가능한 요소 타입 사이에서만 잘 작동
- 목적지 객체에 **기본 생성자**가 있어야 한다.

## map()
```java
map(Object source, Class<D> destinationType)
- source : 매핑할 원본 객체
- destinationType : 목적지 객체의 클래스 타입

map(Object source, Object destination)
- source : 매핑할 원본 객체
- destinationType : 목적지 객체
```
- ModelMapper의 map 메소드는 소스 객체와 목적지 객체 유형의 구조와 멤버 필드 이름이 일치할 때 가장 잘 작동
- 1번을 사용하면 목적지 객체의 인스턴스를 생성해서 응답해주는 것이고, 2번은 이미 생성돼있는 인스턴스를 사용하는 것이다.


## typeMap()
```java
modelMapper.typeMap(Source.class, Destination.class)
    .addMapping(Source::getOldFieldName, Destination::setNewFieldName);
```
- 필드 이름이 다를 때 매핑 방법을 지정
  - Source의 OldFieldName 값을 Destination의 NewFieldName에 매핑시켜주는 예시


## collection mapping
```java
List<Destination> destinations = modelMapper.map(sources, new TypeToken<List<Destination>>(){}.getType());
```