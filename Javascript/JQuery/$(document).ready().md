# $(document).ready()

## 의미 

    DOM(Document Object Model)이 완전히 불러와지면 실행되는 Event

    DOM이란 간략하게 디자인이 입혀지지않은 문서구조를 말함. 

    태그 등의 세팅이 완료되었을 시점에 이벤트 발생.

    이미지, 영상이 로드되기 전에 JS 구문이 실행됨. 

## DOM

    Document Object Model 

    문서객체모델

    문서 객체란, <html>, <body> 같은 html 태그들을 JS가 이용할 수 있는 객체로 만든 상태.  

    tree 자료구조를 가지고 있음. 


## 사용법 

    과거에는 

    $(document).ready(function(){
        제이쿼리 코드;
    })

    방식을 썼었음. 

    하지만, .reday()가 deprecated 되었기에

    $(function(){
        제이쿼리 코드;
    })

    를 사용하는 것이 좋다. 

## 비슷한 문법

    $(window).load(function(){
        제이쿼리 코드;
    })

    : 창이 모두 로드되는 시점에 실행. 가장 마지막에 실행된다고 생각하면 됨.

## 여러개를 써도 될까?

만약 아래처럼 3개가 있다면 

~~~javascript
<script>
    $(function(){
        alert("첫번째")
    })

    $(function(){
        alert("두번째")
    })

    $(function(){
        alert("세번째")
    })
</script>
~~~

3개가 쓰여진 순서대로 모두 실행됨.

### 일반 JS 함수가 있을 때는??

~~~javascript
    <script> 
           alert("일반 자스 함수 앞") ------- 1

           $(function(){
               alert("dom이후")    ------- 2
           })

           alert("일반 자스 함수 뒤") ------- 3
    </script> 
~~~

이런 경우에는 $(function())은 DOM 이후에 실행되기 때문에 

일반 자바스크립트 함수는 먼저 있든, 나중에 있든 무조건 먼저 실행된다. 

따라서 1 > 3 > 2 순서로 실행됨.

## 참고 

https://7942yongdae.tistory.com/77

https://m.blog.naver.com/magnking/220972680805
