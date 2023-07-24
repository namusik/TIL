# 클라이언트 validation

## Thymeleaf와 BindingResult 

[공식문서](https://www.thymeleaf.org/doc/tutorials/3.1/thymeleafspring.html#field-errors)

`#fields`
 `#fields`를 사용하면 BindingResult가 제공하는 검증 오류에 접근할 수 있다.

### global errors 처리

~~~html
<div th:if="${#fields.hasGlobalErrors()}">
    <p th:each="err : ${#fields.globalErrors()}" 
    th:text="${err}">
    global errors
    </p>
</div>
~~~

보통 Global errors는 특정 field에 대한 error가 아니기 때문에 input 태그 아래 보다는 별도로 메세지가 뜨는것이 일반적이다. 

그래서 별도의 \<div>로 Global errors를 표시해준다.

`#fields.hasGlobalErrors()` or `#fields.hasErrors('global')`

 #fields에 GlobalErrors가 있는지 확인 하는 method. boolean을 반환한다.
 th:if와 결합해서 Global Error가 있으면 표시, 없으면 무시하는 방법을 쓴다.

`{#fields.globalErrors()` or `#fields.errors('global')`

 #fields에 있는 globalErrors()를 전부 꺼내는 method.

 global error가 여러개 있을 수 있는 상황에서 th:each와 결합해서 사용한다. 

 iterate를 돌려서 뽑은 ${err}는 th:text로 메세지를 적어준다.


### field errors 처리
~~~html
<input type="text" id="itemName" 
        th:field="*{itemName}"
        th:errorclass="field-error"
        class="form-control">
<div class="field-error" 
    th:errors="*{itemName}">
</div>
~~~

`th:errors="*{itemName}"`
여기서 *{itemName}은 th:field의 *{itemName}과는 다른 걸 지칭한다. 

서버에서 FieldError 생성자의 field 인자이다.

그래서, input의 field명과 BindingResult의 field명을 동일하게 해주어야 *{}를 사용해줄 수 있다.

해당하는 error가 없는 경우에는, 아예 렌더링이 되지 않는다. if의 기능도 겸한다고 생각하면 된다.

`th:errorclass`
css 처리를 용이하게 해주는 속성이다. 

주로 form tag(input, select)에 붙는데, th:field에서 지정한 field에 error가 있는 경우, 
기존 class 위에 th:errorclass=".."를 append한다.

`th:field="*{..}"`

오류가 발생한 경우에는 Model의 th:object에서 value를 가져오는 것이 아니라,
BindingResult의 rejectedValue에서 value를 가져온다. 
그래서, 사용자가 기존에 입력한 정보를 그대로 가져올 수 있게 된다. (타입 오류가 발생해도)












