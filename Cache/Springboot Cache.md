# SpringBoot Cache

## 스프링부트에서 사용하기 

1. starter-cache 의존성 추가.
2. Application에 @EnableCaching 애너테이션 추가
3. @Cacheable(value = "sample") : 캐시 저장
   1. 서버의 메모리에 sample이라는 해쉬 테이블을 만들게 됨.
   2. 첫번째 접근 때는 DB에서 find해서 가져옴
4. @CachePut(value = "sample", key = "#sam") : 캐시 수정
5. @CacheEvict() : 캐시 삭제 
