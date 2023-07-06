# MVC 관련 annotaion

## @RestController
@Controller의 반환 String은 뷰 이름으로 인식된다. 

@RestController의 반환 값은 HTTP 메시지 바디에 바로 입력한다. 

## @ResponseBody
@Controller일 때, 
메서드에 붙이면 View 조회를 하지 않고 응답을 HTTP 메시지 바디에 직접 입력한다. 

## @RequestMapping("/ddd")
메서드의 URL을 지정.
{"/aa", "/bb"}  이렇게 배열로 여러개도 가능.
"/aaa"와 "/aaa/"를 동일하게 인식힌다. 

## @RequestParam
쿼리 파라미터를 받을 수 있다.
~~~java
public String test(@RequestParam("name") String name)
~~~

~~~java
@RequestParam(required=false)
~~~
required 옵션을 줘서, 파라미터가 없어도 호출되게 할 수 있다. 

~~~java
@RequestParam(defaultValue="aa")
~~~
파라미터 값이 들어오지 않을 때, 기본값을 줄 수 있다. 


GET 쿼리 파라미터와, POST Form 데이터 모두 받을 수 있음.

?name=aa 의 형식이면 가능하다. 

~~~java
@RequestParam Map<String, Object> paramMap
~~~
혹은 MultiValueMap을 쓸 수 도 있음. 

파라미터의 key, value를 자동으로 map에 넣어서 데이터를 받는다. 

## @PathVariable
경로 변수

~~~java
@GetMapping("/mapping/{userId}")
public String mappingPath(@PathVariable String userId)
~~~

최근 HTTP API에서 자주 쓴다. 


## @ModelAttribute

HTTP 파라미터를 객체 형태로 받을 때.

~~~java
@ModelAttribute Data data
~~~

### 원리
1. spring mvc 가 @ModelAttribute가 붙은 객체를 생성한다. 
2. 쿼리 파라미터의 이름과 일치하는 객체의 필드를 찾는다.
3. 일치하는 필드가 있으면 setter를 가지고 value를 입력한다. 

즉, 객체에 setter가 필요하다. 없으면 null이 입력됨.

@ModelAttribute를 사용하면 따로 Model에 객체를 자동으로 넣어준다. 

~~~java
@ModelAttribute("item") Item item
~~~
이때, "item" 이름을 지정해주면 해당 이름으로 Model에 담긴다.

생략하면, 클래스의 소문자로 담긴다.

물론 수정을 해서 넘겨준다면 따로 담아줘야 한다. 

## 여기서 부터는 HTTP 메시지 바디에 담긴 데이터를 읽는 방법이다. 

## InputStream

어노테이션은 아니지만, HTTP 메시지 바디에 있는 데이터를 읽는 방법 중 하나.

데이터를 String으로 읽어드린다. 

1. HttpServletRequest에서 가져오는 방법
~~~java
ServletInputStream inputStream = request.getInputStream();
String messageBody = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
~~~

1. InputStream을 파라미터로 받아서 읽는 방법. HTTP 바디 메시지가 그대로 InputStream에 담긴다.
~~~java
public void requestBodyStringV2(InputStream inputStream, Writer responseWriter) throws IOException {

String messageBody = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
}
~~~

## HttpEntity

~~~java
public HttpEntity<String> requestBodyStringV3(HttpEntity<String> httpEntity) {
String messageBody = httpEntity.getBody();
}
~~~

HTTPEntity를 파라미터로 받으면 HTTP 요청의 header와 body를 조회할 수 있다. 

## @RequestBody

~~~java
@RequestBody String name
~~~

HTTP 메시지 바디에 있는 String을 바로 받을 수 있다. 

@RequestBody는 메시지 바디가 JSON 형태로 올 때도 사용할 수 있다. 

마치 @ModelAttribute가 쿼리 파라미터를 객체로 바로 받듯이, JSON을 객체로 변환해서 받을 수 있다. 

~~~java
@RequestBody People people
~~~
직접 만든 객체를 지정해서 받을 수 있다.
HTTP 메시지 컨버터가 변환 역할을 대신 해준다.

참고로 content-type:application/json인 경우에만 적용이 가능하다.

