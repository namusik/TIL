

## DataAccessException

RuntimeException을 상속한 예외 클래스

각 DB 기술마다 서로 다른 예외를 추상화 하였다. 

Transient와 NonTransient로 구분

## SQLExceptionTranslator

DB에서 발생한 오류 코드를 스프링이 정의한 예외로 자동으로 변환해주는 변환기 역할.

sql-error-code.xml에서 에러코드를 참고한다. 