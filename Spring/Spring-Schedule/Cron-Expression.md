# Cron 표현식

## 개념
- 스프링에서는 주로 Quartz 크론 방식을 사용한다.

## 필드
|     Field    | Required |    Allowed Values    | Allowed Special Characters |
|:------------:|:--------:|:--------------------:|:--------------------------:|
| Seconds      | Yes      | 0-59                 | , – * /                    |
| Minutes      | Yes      | 0-59                 | , – * /                    |
| Hours        | Yes      | 0-23                 | , – * /                    |
| Day of Month | Yes      | 1-31                 | , – * / ? L W              |
| Month        | Yes      | 0-11 (or JAN-DEC)    | , – * /                    |
| Day of Week  | Yes      | 1-7 (or SUN-SAT)     | , – * / ? L C #            |
| Year         | No       | 1970-2099 (or empty) | , – * /                    |

## ? 기호
- 특정 값을 나타내지 않음.
- 월 / 요일 필드에서만 사용가능하다.
- 


## 출처
https://www.baeldung.com/java-cron-expressions-wildcards-diff