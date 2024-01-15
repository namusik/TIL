```gradle
jooq {
	version = '3.16.4'
	edition = JooqEdition.OSS

	configurations {
		main {
      ......
		}
    		test{
			generateSchemaSourceOnCompilation = true

			generationTool {
				jdbc {
					driver = "com.mysql.cj.jdbc.Driver"
					url = 'jdbc:mysql://localhost:3308/megabird?characterEncoding=UTF-8&serverTimezone=Asia/Seoul'
					user = 'root'
					properties {
						property {
							key = 'ssl'
							value = 'true'
						}
					}
				}
				generator {
					name = 'org.jooq.codegen.DefaultGenerator'
					database {
						name = 'org.jooq.meta.mysql.MySQLDatabase'
						includes = ".*"
						excludes = "test_.* | temp_.* | zDEL.* | zBAK.*"
						schemata {
							schema {
								inputSchema = 'megabird'
							}
						}
					}
					generate {
						deprecated = false
						records = true
						pojos = true
						fluentSetters = true
					}
					target {
						packageName = 'com.mz.message.test'
						directory = 'src/test/jooq'
					}
					strategy.name = 'org.jooq.codegen.DefaultGeneratorStrategy'
				}
			}
		}
	}
}
```

- test{}영역을 작성해준후, target의 경로를 원하는 곳으로 해준다.