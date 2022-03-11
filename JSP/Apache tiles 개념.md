# Apcahe tiles

## tiles 란?

![tiles](../Images/JSP/tiles.png)

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


## maven 라이브러리 다운로드

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

## tilesConfigurer 추가 

~~~java
@Bean
public TilesConfigurer tilesConfigurer() {
    TilesConfigurer tilesConfigurer = new TilesConfigurer();
    tilesConfigurer.setPreparerFactoryClass(SpringBeanPreparerFactory.class);
    tilesConfigurer.setDefinitions("WEB-INF/tiles/tiles3.xml", "WEB-INF/tiles/tiles3-mobile.xml");
    
    return tilesConfigurer;
    }
~~~

dispatcher-servlet.xml이 아닌 @Bean으로 추가해주는 방식을 씀. 

tiles.xml과 그 안에서 view에 맞는 해당 definition을 찾아줄 tilesViewResolver 추가.



## Tiles Definition

Tiles를 정의해줌. 

tiles.xml 같은 곳에 써준다.

~~~java
<definition name="mainpage" template="/templates/layout.jsp">    
   <put-attribute name="header" value="/tiles/banner.jsp" /> 
   <put-attribute name="menu" value="/tiles/common_menu.jsp" /> 
   <put-attribute name="body" value="/tiles/home_body.jsp" /> 
   <put-attribute name="footer" value="/tiles/credits.jsp" /> 
</definition>
~~~

xml에 template과 attribute의 경로를 정의해줌. 

menu, header, footer는 자주 사용되므로 상속을 이용해서 중복을 피할 수 있음.

## Definition 상속

~~~java
<definition name="base" template="/templates/layout.jsp">
	<put-attribute name ="title" vlaue="Homepage" />
   <put-attribute name="header" value="/tiles/banner.jsp" /> 
   <put-attribute name="menu" value="/tiles/common_menu.jsp" /> 
   <put-attribute name="content" value="/tiles/home_body.jsp" /> 
   <put-attribute name="footer" value="/tiles/credits.jsp" /> 
</definition>

<definition name="home" extends="base">
	<put-attribute name ="title" vlaue="Offers Homepage" />
    <put-attribute name="content" value="/WEB-INF/tiles/home.jsp" />
</definition>
~~~

## Template - layout.jsp

~~~html
 <%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles" %>
<table>
	<tr>
    	<td colspan="2">
        	<tiles:insertAttribute name ="header" />
        </td>
    </tr>
    <tr>
    	<td>
        	<tiles:insertAttribute name ="menu" />
        </td>
        <td>
        	<tiles:insertAttribute name ="body" />
        </td>
    </tr>
    <tr>
    	<td colspan="2">
        	<tiles:insertAttribute name="footer" />
        </td>
    </tr>
<table>
~~~





## 참고  

https://sjh836.tistory.com/133

https://tiles.apache.org/framework/tutorial/index.html

https://hyoni-k.tistory.com/39

https://offbyone.tistory.com/10