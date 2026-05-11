## 정리

* 최신 언어 장점. 자바에서 10줄이 코틀린에서 2-3줄
* 구글 안드로이드 메인 언어
* 안드로이드에서 쓰는 java는 java와 비슷한 무언가
  * dalvik 코드
  * 예전 java api 복붙한 코드들. java8 일부분
  * syntax sugar
* 속도 차이는 별로 없고 보기에 좋다. 
* 컴파일 속도가 느리다. 
* 코틀린 컴파일러 개발은 jetbrain에서 
  * 보조 툴 annotation processor는 구글 젯브레인 협업
  * KSP 개발중.
* Unit test
  * 애매한 부분. 결과물이 java 클래스 파일로 나옴
  * Modifier 수정 못하는 final 형식으로 나옴.
  * unit test에서 쓸 때, mocking을 쓸 때, java 바이트 코드를 변경해서 쓰는데 
  * bytebuddy로 강제로 사용.
* kotlin companion object를 자바에서 접근 불가. 
* mockk 를 쓰다가 이슈가 많아서 버림. 


* 자바와 100프로 호환 가능 
* JVM 
  * compiltaion과 interpretation의 조합.
  * 자바어, 코틀린어를 쓸 때, 기계어로 compile하는 것이 아니라 java bytecode로 컴파일된다. 
  * 윈도우, 맥 , 리눅스에서 이 java bytecode를 실행하려면 JVM이 필요함. Jvm이 java bytecode를 이해하고, 맥, 윈도우, 리눅스로 변역함. 이부분이 interpretation. 
* Compilation
  * C프로그램을 기계어로 컴파일
  * 항상 interpretation보다 빠름. 
  * 하지만, 플랫폼에 의존적. 윈도우, 리눅스, 맥 으로 각각 다르계 컴파일해야한다.
* Interpretation
  *  파이썬을 컴파일하지 안혹, 프로그램을 실행하면 거기에 interpreter가 있어서 리얼타임으로 기계어로 전달. 
  *  플랫폼 독립적. interpreter가 알아서 변환해줌. 

* 따라서, 코틀린이 java bytecode로 컴파일되기 때문에, 자바와 100프로 호환되는 것이다. 

* 코틀린의 2가지 큰 장점 
* null safe
* coroutine
  * go 언어 go routine과 비슷
  * 많은걸 한번에 실행하는 코드를 짤 수 있음. 

* 코틀린은 자바스크립트로 컴파일 된다. 
* 데이타 사이언스 활용 사례
## 출처 
https://www.youtube.com/watch?v=qFitd3Ukgcc