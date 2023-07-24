# 서버 validation

## Validation이란?

사용자로부터 데이터를 입력 받을 때, 항상 오류를 생각해야 한다. 

그리고 그 오류를 다시 사용자에게 알려줘야 한다. 

검증을 하는 위치는 

1. View에서 1차적으로 검증해서 잘못된 데이터를 입력 시, 알리기

2. 서버에서 데이터를 받아 검증해서 잘못된 경우, View로 다시 되돌려 보내기.

이 둘을 섞어서 사용해야 하며, 서버에서의 검증을 필수적으로 확인해야 한다.

## 검증 시 챙겨야할 정보 

서버에서 검증을 하고 오류가 발생 시, View로 다시 보내야 할 때 

1. 기존에 유저가 입력했던 값들
2. 어떤 값에서 어떤 오류가 발생했는지

2가지 정보를 다시 전달해줘야 한다.

## BindingResult

Errors의 상속받은 interface.

BeanPropertyBindingResult가 BindingResult를 구현하고 있다.

~~~java
@PostMapping
public String add(@ModelAttribute Item item, 
BindingResult bindingResult){
    ......
}
~~~
파라미터로 `BindingResult`를 받는다.

`BindingResult`는 반드시 @ModelAttribute 다음에 와야 해당 객체의 오류 정보를 담는다.

### 사용법 1
~~~java
bindingResult.addError(new FieldError());
bindingResult.addError(new ObjectError());
~~~

`BindingResult`에는 ObjectError 타입의 클래스를 add할 수 있다.

BindingResult는 **Model**에 자동으로 포함된다.

#### FieldError
Field에 오류가 있을 때 사용한다.

~~~java
new FieldError(
    objectName: "@ModelAttribute이름", 
    field : "오류가 발생한 field명", 
    rejectedValue : "잘못입력한 값 저장용", 
    bindingFailure : "typeMismath같은 바인딩 오류인지(true) 아닌지(false)", 
    codes : "message source 코드, new String[]{message code}", 
    arguments : "message source 코드 인자, new Object[]{0,1}", 
    defaultMessage : "기본 오류 메세지");
~~~

#### ObjectError
특정 Field오류가 아니라 Global error일 때 사용.

~~~java
new ObjectError(
    objectName : "@ModelAttribute 이름", codes : "message source Key", 
    arguments : "message source Key argument", 
    defaultMessage : "기본 오류 메세지");
~~~

### 사용법 2
~~~java
bindingResult.getObjectName()
bindingResult.getTarget()
~~~

`BindingResult`는 @ModelAttribute 뒤에 쓰는 것 만으로도 target 객체의 이름과 field 값들을 알고 있다.

이를 바탕으로, FieldError ObjectError를 사용하지 않고 Error를 처리할 수 있다.

#### rejectValue() - Field Errors
~~~java
bindingResult.rejectValue(
    field : "field 명",
    errorCode : "messageResolver 오류 코드",
    errorArgs : "message 코드 인자",
    defaultMessage : "기본 에러 메세지"
)
~~~
* obejctName에 대한 정보는 이미 알고 있기 때문에 생략되었다.

#### reject() - Global Errors
~~~java
bindingResult.reject(
    errorCode : "messageResolver 오류 코드",
    errorArgs : "message 코드 인자",
    defaultMessage : "기본 에러 메세지"
)
~~~

### MessageCodesResolver
BindingResult의 error message resolve를 위해 호출하는 Class.

validation을 사용하는 경우인 
FieldError, ObjectError, rejectValue, reject 사용하는 경우의 **error code**를 resolve할 때, `resolveMessageCodes()`를 호출한다.

평범한 message code를 읽는 경우에는 동작하지 않음.

field error 혹은 rejectValue()와 같은 **필드오류**에서 error code를 입력할 때, 

`required`라고 적어주면, 

~~~properties
required.item.itemName,  객체명.필드명
required.itemName,       필드명
required.java.lang.String, 필드 Type
required
~~~

global error, reject()와 같은 **객체 오류**에는 field가 없으므로 

~~~properties
required.item   객체명
required
~~~
를 반환한다. 

thymeleaf에서 th:errors가 실행될 때, 자세한 순서부터 message를 탐색한다.

#### 타입 오류의 경우 오류 코드
typeMismatch의 오류가 발생한 경우는 스프링이 자동으로 직접 에러 메세지를 추가하는데, 

별도의 설정이 없으면 에러 로그가 그대로 날라간다.

에러 메세지를 직접 설정해주고 싶다면,

~~~properties
typeMismatch.객체명.필드명
typeMismatch.필드명
typeMismatch.필드타입
typeMismatch
~~~

### 사용법 3 - Validator 분리

Controller 코드에서 검증 부분을 따로 분리해주는 방법이다.

#### Validator 

Validator interface를 구현한 CustomValidator를 만들어준다.

~~~java
public class MyValidator implements Validator{
@Override
public boolean supports(Class<?> clazz) {
    return Item.class.isAssignableFrom(clazz);
}
지정한 Class와 자식 Class 객체의 @Validated에만 사용이 가능하다.

validate(modelAttribute 객체, BindingResult){    
    Controller에 있던 오류 검증 코드를 모아 넣는다.}
}
~~~

#### @InitBinder & @Validated

~~~java
@InitBinder
public void init(WebDataBinder dataBinder) {
    dataBinder.addValidators(등록한 validator);
}
~~~

~~~java
@Validated @ModelAttribute Item item
~~~
오류 검증을 할 객체인 @ModelAttribute 앞에 @Validated를 붙인다. 

이러면, validator를 직접 호출하는 코드가 사라지고 요청이 오면 @InitBinder에 등록한 validator의 supports()와 validate()를 스프링이 알아서 실행한다.








