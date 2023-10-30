# Jooq method

## .onDuplicateKeyIgnore()
중복 키 충돌이 발생했을 때 무시하도록 설정합니다. 이는 중복 키 엔트리를 추가하지 않고 무시하라는 의미입니다.

## .returning()
삽입 또는 업데이트 작업이 실행된 후 결과를 반환하도록 설정

## .fetchOne()
returning()의 결과는 .fetchOne() 메서드를 통해 가져옴.