# Java Map

### Map.Entry<K,V>
Map interface 안에 있는 Entry interface
entrySet()의 리턴값이 Set<Map.Entry<K,V>>이다.

### entrySet()
~~~java
for (Map.Entry<String, String> entry : map.entrySet()) {

}
~~~
Map의 전체 key와 value를 꺼냄