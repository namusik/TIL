# Apcahe tiles

## tiles 란?


    tiles는 웹페이지의 상단이나 하단 메뉴와 같이 반복적으로 사용되는 부분들에 대한 코드를 분리해서 

    한 곳에서 관리를 가능하게 해주는 프레임워크


## JSP include와의 차이


    include를 사용할 경우, 공통페이지명이 바뀌면 사용되는 모든 곳을 수정해줘야하지만

    tiles의 경우, 설정 파일만 변경해주면 됨.

## Composite View 패턴

![tiles](../Images/JSP/tiles%20pattern.jpeg)

    모듈 단위의 뷰 들을 조합해서 하나의 뷰를 구성.

    하나의 전체 뷰를 부모로 볼 수 있고, 자식 뷰를 작은 한 부분으로 볼 수 있음.

    Leaf는 Component의 구현체

    Composite는 Component의 구현체들을 자식으로 삼는다. 

## 용어 

#### Template

    페이지 레이아웃.

    jsp파일로 페이지의 기본 골격을 구성하고 각 페이지의 실제 구성 내용은 definition에서 설정되는 Attribute 태그를 사용하여 런타임시 뿌려줌. 

    string 타입 Attribute 추가 : <titles:getAsString name="속성명" />

    template 및 definition Attribute 추가 : <tiles:insertAttribute name="속성명" />

#### Attribute

    Template의 빈 공간을 채우기 위해 사용되는 정보로 3가지 타입으로 구성.

    string : 직접 출력할 문자열

    template : 템플릿 내 또는 일부의 레이아웃을 기술

    definition : 전체 혹은 일부 Attribute들이 실제 내용으로 채워진 페이지. 
                 template과 attribute가 같이 정의된 페이지를 의미 


## maven 설정 

~~~java
<properties>
    <!-- /** tiles **/ -->
    <tiles.version>3.0.8</tiles.version>
</properties>

<dependency>
    <groupId>org.apache.tiles</groupId>
    <artifactId>tiles-core</artifactId>
    <version>${tiles.version}</version>
    <scope>compile</scope>
    <exclusions>
        <exclusion>
            <artifactId>jcl-over-slf4j</artifactId>
            <groupId>org.slf4j</groupId>
        </exclusion>
    </exclusions>
</dependency>

<dependency>
    <groupId>org.apache.tiles</groupId>
    <artifactId>tiles-servlet</artifactId>
    <version>${tiles.version}</version>
    <scope>compile</scope>
</dependency>

<dependency>
    <groupId>org.apache.tiles</groupId>
    <artifactId>tiles-jsp</artifactId>
    <version>${tiles.version}</version>
    <scope>compile</scope>
</dependency>
~~~

## Template




## 참고  

https://sjh836.tistory.com/133

https://tiles.apache.org/framework/tutorial/index.html