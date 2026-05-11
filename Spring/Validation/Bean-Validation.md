# Bean Validation

## 의의
직접 field마다 검증 코드를 작성하는 것의 불편함을 없애기 위해.

## 정의
Jakarta Bean Validation 이라는 기술표준이 있다.
현재 3.0 버전까지 나온 상태.

[Bean Validation 공식](https://beanvalidation.org/3.0/)

구현체로 `Hibernate Validator`가 존재한다.

[Hibernate Validator 공식](https://hibernate.org/validator/documentation/getting-started/)

마치 JPA 기술 표준이 있고 구현체로 Hibernate가 있는것과 유사.

## 의존관계
~~~gradle
implementation 'org.springframework.boot:spring-boot-starter-validation'
~~~

[검증 애노테이션](https://jakarta.ee/specifications/bean-validation/3.0/jakarta-bean-validation-spec-3.0.html#builtinconstraints)

annotation들을 사용해보면 
`javax.validation` 패키지(표준 인터페이스에서 제공)

`org.hibernate.validator `패키지(hibernate 구현체에서 제공)

가 혼재되어있는데, 자유롭게 사용하면 된다.

## 동작 

### LocalValidatorFactoryBean
기존에는 validator를 직접만들어서 Controller에 DI하고
@InitBinder로 등록해줘야 했다. 

하지만, spring validation 의존관계를 받은 다음 부터는 LocalValidatorFactoryBean를 글로벌 Bean Validator로 자동 등록해준다. 

이 valiator는 @Validated, @Valid가 붙은 객체의 검증 애노테이션을 보고 validate를 진행한다.

내부 진행은 동일하게 bindingResult에 FieldError, ObjetError를 담아준다.

이때, 오류 메세지도 자동생성되는 것을 볼 수 있다.

* 참고로, TypeMismatch로 인해 바인딩자체가 실패하면 바인딩 오류가 넘어가고 BeanValidator는 동작하지 않는다.

### @Validated & @Valid
`@Validated`는 springframework.validation.annotation 패키지에 속한 Spring 전용 애노테이션.

`@Valid`는 javax.validation 에 속한 자바 표준 애노테이션

동일한 기능을 하지만, groups기능은 @Validated에만 포함되어있다.

## Bean Validation 오류 메세지 
BeanValidator는 애노테이션 이름을 기반으로 message code를 탐색한다. 

@NotBlank인 경우에는 
~~~properties
NotBlank.item.itemName
NotBlank.itemName
NotBlank.java.lang.String
NotBlank
~~~
의 순서대로 검색을 한다. 상세한것이 우선순위를 가지는 것과 형식은 bindingResult의 경우와 동일하다.

추가적으로 고민할 부분은 {0} 인자부분인데, 이는 애노테이션 마다 위치가 다르기때문에 확인 후 작성해야 한다.

### @ScriptAssert()
Bean Validaiton에서 ObjectError를 처리할 때,
`@ScriptAssert()`를 사용한다. 

하지만, 한계가 있기 때문에 복합 오류의 경우 **bindingResult**를 써서 자바 코드로 직접 작성하는 것이 유리하다.

### 같은 객체에 검증 요구사항이 서로 다른 경우

보통 어떤 객체를 등록하면, 수정기능도 있기 마련이다. 

하지만, 등록할 때와 수정할 때의 검증 기준이 다르다면 기존의 방법으로는 불가능하다.

예를 들어, ID(식별자)값은 등록시에는 등록 POST요청이 온 후에 서버 혹은 DB에서 생성해서 저장이 되지만, 

수정 POST 요청을 할 때에는 ID(식별자)가 필수로 있어야 한다.

이를 해결하기 위해 2가지 방법이 있다.

#### 방법 1 - groups 사용
~~~java
public interface SaveCheck{
    ....
}
~~~
상황에 따른 interface를 하나 만들어준다.

~~~java
@Max(value = 9999, groups = {SaveCheck.class})  //등록시에만 사용
private Integer quantity;
~~~
특정 상황에만 동작시킬 field의 validation annotation에 groups = {} 속성을 추가시켜준다.

~~~java
@Validated(value = SaveCheck.class) @ModelAttribute Item item
~~~
해당 상황의 method @Validated에 interface를 추가시켜 준다.

* groups 기능은 `@Validated`에만 존재한다.

#### 방법 2 - DTO를 따로 구성하기

사실 groups 기능을 쓰면 interface도 추가되고 코드도 복잡해진다. 

게다가 등록과 수정에서 받는 값이 서로 다르기 때문에 당연스럽게 같은 객체를 사용않는다.

그래서 대부분, DTO를 상황별로 구분하는 방법을 사용한다.

Entity와 VO와 DTO의 개념을 구분해서 생각해보자.

## @RequestBody에 적용하기 
지금까지의 설명은 @ModelAttribute 즉, 쿼리 파라미터로 형식으로 값이 넘어올 때의 예시였다. 

~~~java
@PostMapping("/add")
public Object addItem(
    @Validated @RequestBody ItemSaveForm itemSaveForm,
    BindingResult bindingResult) {
}
~~~

@RequestBody에 검증 오류를 적용할 땐 3가지 경우를 따져야 한다. 

1. 성공
2. JSON 데이터를 객체로 바꾸는 것 부터 실패
3. JSON 데이터를 객체로 바꾸었으나, validation을 통과하지 못했을 때.

여기서 2번은 HttpMessageConverter 에서 JSON parse error가 발생하므로, BeanValidation을 시작하기 전에 예외가 날라간다.

3번을 Bean Validation으로 처리해야 한다.


