# @modelAttribute

## setter와 기본생성자가 필요한가?
@modelattribute를 사용하려면 DTO(사용하려는 객체)에 setter나 기본생성자가 있어야 한다는 얘기는 많이 있다. 하지만, 이상하게 둘 중 하나만 만들어줬는데 동작을 안하는 경우가 있었다. 

찾아보니
오히려, 둘 중 하나만 있으면 안된다.

ModelAttributeMethodProcessor.constructAttribute()에 의해서 DTO에 기본 생성자와 setter 없이도 @ModelAttribute를 통한 데이터 바인딩이 가능하다.

## 출처 

https://hyeon9mak.github.io/model-attribute-without-setter/