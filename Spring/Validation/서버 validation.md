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

1. 기존에 입력했던 값들 
2. 어떤 오류가 발생했는지

2가지 정보를 다시 전달해줘야 한다.

## BindingResult

### 사용법
~~~java
@PostMapping
public String addItemV1(@ModelAttribute Item item, BindingResult bindingResult,Model model)
~~~
파라미터로 BindingResult를 받는다.

~~~java
bindingResult.addError(new FieldError("item", "itemName", item.getItemName(), false, null, null, "상품이름은 필수입니다."));
~~~

### FieldError
Field에 오류가 있을 때, FieldError를 생성해 bindingResult에 addError로 담아준다.

~~~java
new FiedError("@ModelAttribute이름", "오류 발생 field명", "잘못입력한 값", "binding오류 boolean", null, null, "에러 메세지")
~~~

### ObjectError
특정 Field오류가 아니라 복합 오류일 때 사용.

~~~java
new ObjectError("@ModelAttribute 이름", null, null, "오류 메세지");
~~~
