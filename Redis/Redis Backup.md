# Redis Backup

## Redis Database 백업

- RDS
- 템플릿 다운로드
https://redis.io/docs/latest/operate/oss_and_stack/management/config/


### docker 명령어
```sh
// 마운트 사용하여 redis 설정파일 적용해서 실행
docker run -v /my/redis.conf:/redis.conf --name my-redis redis redis-server /redis.conf
```

### rdb 방식

- redis.conf 수정항목
  - save 60 100

- dump 파일이 생성됨
![redisdump](../images/Redis/redisdump.png)


### aof 방식

- redis.conf 수정항목
  - appendonly yes

```sh
cat appendonly.aof.1.incr.aof
*2
$6
SELECT
$1
0
*3
$3
set
$1 // 명령어 글자수
a
$1
1
*3
$3
set
$1
b
$3
123
```


## Redis Replication

- redis 복제

### docker 명령어
```sh
docker network create redis-network

// master config 설정
appendonly yes
bind 0.0.0.0
protected-mode no

// master 실행
docker run --network redis-network -v /Users/ioi01-ws_nam/Downloads/redis.master.conf:/redis.conf --name redis-master -p 5001:6379 redis redis-server /redis.conf

// repica confg 설정
replicaof redis-master 6379

// replica 실행
docker run --network redis-network -v /Users/ioi01-ws_nam/Downloads/redis.replica.conf:/redis.conf --name redis-replica -p 5002:6379 redis redis-server /redis.conf

1:S 24 Jul 2024 11:08:50.410 * MASTER <-> REPLICA sync started
1:S 24 Jul 2024 11:08:50.410 * Non blocking connect for SYNC fired the event.
1:S 24 Jul 2024 11:08:50.410 * Master replied to PING, replication can continue...
1:S 24 Jul 2024 11:08:50.410 * Partial resynchronization not possible (no cached master)
1:S 24 Jul 2024 11:08:55.662 * Full resync from master: 69a5b1cbbdba07dc47fae4a000f65d3992308ccd:14
1:S 24 Jul 2024 11:08:55.665 * MASTER <-> REPLICA sync: receiving streamed RDB from master with EOF to disk
1:S 24 Jul 2024 11:08:55.665 * MASTER <-> REPLICA sync: Flushing old data
1:S 24 Jul 2024 11:08:55.665 * MASTER <-> REPLICA sync: Loading DB in memory
1:S 24 Jul 2024 11:08:55.668 * Loading RDB produced by version 7.2.5
1:S 24 Jul 2024 11:08:55.669 * RDB age 0 seconds
1:S 24 Jul 2024 11:08:55.669 * RDB memory usage when created 0.95 Mb
1:S 24 Jul 2024 11:08:55.669 * Done loading RDB, keys loaded: 0, keys expired: 0.
1:S 24 Jul 2024 11:08:55.669 * MASTER <-> REPLICA sync: Finished with success
```


### docker-compose로 redis 컨테이너 실행
```sh
docker pull bitnami/redis

docker-compose up --build

 WARN[0000] /Users/ioi01-ws_nam/Documents/GitHub/TIL-SampleProject/Redis/docker-compose.yml: `version` is obsolete
[+] Running 3/0
 ✔ Network redis_default       Created                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              0.0s
 ✔ Container redis-master      Created                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              0.0s
 ✔ Container redis-replicas-1  Created                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              0.0s
Attaching to redis-master, redis-replicas-1
redis-master      | redis 10:11:03.03 INFO  ==>
redis-master      | redis 10:11:03.03 INFO  ==> Welcome to the Bitnami redis container
redis-master      | redis 10:11:03.03 INFO  ==> Subscribe to project updates by watching https://github.com/bitnami/containers
redis-master      | redis 10:11:03.03 INFO  ==> Submit issues and feature requests at https://github.com/bitnami/containers/issues
redis-master      | redis 10:11:03.03 INFO  ==> Upgrade to Tanzu Application Catalog for production environments to access custom-configured and pre-packaged software components. Gain enhanced features, including Software Bill of Materials (SBOM), CVE scan result reports, and VEX documents. To learn more, visit https://bitnami.com/enterprise
redis-master      | redis 10:11:03.03 INFO  ==>
redis-master      | redis 10:11:03.04 INFO  ==> ** Starting Redis setup **
redis-master      | redis 10:11:03.05 WARN  ==> You set the environment variable ALLOW_EMPTY_PASSWORD=yes. For safety reasons, do not use this flag in a production environment.
redis-master      | redis 10:11:03.05 INFO  ==> Initializing Redis
redis-master      | redis 10:11:03.06 INFO  ==> Setting Redis config file
redis-master      | redis 10:11:03.07 INFO  ==> Configuring replication mode
redis-master      | redis 10:11:03.08 INFO  ==> ** Redis setup finished! **
redis-master      |
redis-master      | redis 10:11:03.08 INFO  ==> ** Starting Redis **
redis-master      | 1:C 25 Jul 2024 10:11:03.097 * oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
redis-master      | 1:C 25 Jul 2024 10:11:03.098 * Redis version=7.2.5, bits=64, commit=00000000, modified=0, pid=1, just started
redis-master      | 1:C 25 Jul 2024 10:11:03.098 * Configuration loaded
redis-master      | 1:M 25 Jul 2024 10:11:03.098 * monotonic clock: POSIX clock_gettime
redis-master      | 1:M 25 Jul 2024 10:11:03.099 * Running mode=standalone, port=6379.
redis-master      | 1:M 25 Jul 2024 10:11:03.100 * Server initialized
redis-master      | 1:M 25 Jul 2024 10:11:03.105 * Creating AOF base file appendonly.aof.1.base.rdb on server start
redis-master      | 1:M 25 Jul 2024 10:11:03.107 * Creating AOF incr file appendonly.aof.1.incr.aof on server start
redis-master      | 1:M 25 Jul 2024 10:11:03.107 * Ready to accept connections tcp
redis-replicas-1  | redis 10:11:03.18 INFO  ==>
redis-replicas-1  | redis 10:11:03.18 INFO  ==> Welcome to the Bitnami redis container
redis-replicas-1  | redis 10:11:03.18 INFO  ==> Subscribe to project updates by watching https://github.com/bitnami/containers
redis-replicas-1  | redis 10:11:03.18 INFO  ==> Submit issues and feature requests at https://github.com/bitnami/containers/issues
redis-replicas-1  | redis 10:11:03.18 INFO  ==> Upgrade to Tanzu Application Catalog for production environments to access custom-configured and pre-packaged software components. Gain enhanced features, including Software Bill of Materials (SBOM), CVE scan result reports, and VEX documents. To learn more, visit https://bitnami.com/enterprise
redis-replicas-1  | redis 10:11:03.18 INFO  ==>
redis-replicas-1  | redis 10:11:03.18 INFO  ==> ** Starting Redis setup **
redis-replicas-1  | redis 10:11:03.19 WARN  ==> You set the environment variable ALLOW_EMPTY_PASSWORD=yes. For safety reasons, do not use this flag in a production environment.
redis-replicas-1  | redis 10:11:03.19 INFO  ==> Initializing Redis
redis-replicas-1  | redis 10:11:03.20 INFO  ==> Setting Redis config file
redis-replicas-1  | redis 10:11:03.21 INFO  ==> Configuring replication mode
redis-replicas-1  |
redis-replicas-1  | redis 10:11:03.23 INFO  ==> ** Redis setup finished! **
redis-replicas-1  | redis 10:11:03.24 INFO  ==> ** Starting Redis **
redis-replicas-1  | 1:C 25 Jul 2024 10:11:03.247 * oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
redis-replicas-1  | 1:C 25 Jul 2024 10:11:03.247 * Redis version=7.2.5, bits=64, commit=00000000, modified=0, pid=1, just started
redis-replicas-1  | 1:C 25 Jul 2024 10:11:03.247 * Configuration loaded
redis-replicas-1  | 1:S 25 Jul 2024 10:11:03.247 * monotonic clock: POSIX clock_gettime
redis-replicas-1  | 1:S 25 Jul 2024 10:11:03.247 * Running mode=standalone, port=6379.
redis-replicas-1  | 1:S 25 Jul 2024 10:11:03.248 * Server initialized
redis-replicas-1  | 1:S 25 Jul 2024 10:11:03.249 * Creating AOF base file appendonly.aof.1.base.rdb on server start
redis-replicas-1  | 1:S 25 Jul 2024 10:11:03.251 * Creating AOF incr file appendonly.aof.1.incr.aof on server start
redis-replicas-1  | 1:S 25 Jul 2024 10:11:03.251 * Ready to accept connections tcp
redis-replicas-1  | 1:S 25 Jul 2024 10:11:03.251 * Connecting to MASTER redis-master:6379
redis-replicas-1  | 1:S 25 Jul 2024 10:11:03.251 * MASTER <-> REPLICA sync started
redis-master      | 1:M 25 Jul 2024 10:11:03.252 * Replica 172.19.0.3:6379 asks for synchronization
redis-replicas-1  | 1:S 25 Jul 2024 10:11:03.251 * Non blocking connect for SYNC fired the event.
redis-master      | 1:M 25 Jul 2024 10:11:03.252 * Full resync requested by replica 172.19.0.3:6379
redis-replicas-1  | 1:S 25 Jul 2024 10:11:03.251 * Master replied to PING, replication can continue...
redis-master      | 1:M 25 Jul 2024 10:11:03.252 * Replication backlog created, my new replication IDs are '1353af09e9633fe0134f1fbfaed9abe8e1552753' and '0000000000000000000000000000000000000000'
redis-replicas-1  | 1:S 25 Jul 2024 10:11:03.251 * Partial resynchronization not possible (no cached master)
redis-master      | 1:M 25 Jul 2024 10:11:03.252 * Delay next BGSAVE for diskless SYNC
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.219 * Full resync from master: 1353af09e9633fe0134f1fbfaed9abe8e1552753:0
redis-master      | 1:M 25 Jul 2024 10:11:08.217 * Starting BGSAVE for SYNC with target: replicas sockets
redis-master      | 1:M 25 Jul 2024 10:11:08.227 * Background RDB transfer started by pid 52
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.228 * MASTER <-> REPLICA sync: receiving streamed RDB from master with EOF to disk
redis-master      | 52:C 25 Jul 2024 10:11:08.228 * Fork CoW for RDB: current 0 MB, peak 0 MB, average 0 MB
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.229 * MASTER <-> REPLICA sync: Flushing old data
redis-master      | 1:M 25 Jul 2024 10:11:08.228 * Diskless rdb transfer, done reading from pipe, 1 replicas still up.
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.229 * MASTER <-> REPLICA sync: Loading DB in memory
redis-master      | 1:M 25 Jul 2024 10:11:08.231 * Background RDB transfer terminated with success
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.230 * Loading RDB produced by version 7.2.5
redis-master      | 1:M 25 Jul 2024 10:11:08.232 * Streamed RDB transfer with replica 172.19.0.3:6379 succeeded (socket). Waiting for REPLCONF ACK from replica to enable streaming
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.230 * RDB age 0 seconds
redis-master      | 1:M 25 Jul 2024 10:11:08.232 * Synchronization with replica 172.19.0.3:6379 succeeded
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.230 * RDB memory usage when created 0.93 Mb
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.230 * Done loading RDB, keys loaded: 0, keys expired: 0.
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.230 * MASTER <-> REPLICA sync: Finished with success
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.231 * Creating AOF incr file temp-appendonly.aof.incr on background rewrite
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.231 * Background append only file rewriting started by pid 65
redis-replicas-1  | 65:C 25 Jul 2024 10:11:08.233 * Successfully created the temporary AOF base file temp-rewriteaof-bg-65.aof
redis-replicas-1  | 65:C 25 Jul 2024 10:11:08.233 * Fork CoW for AOF rewrite: current 0 MB, peak 0 MB, average 0 MB
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.323 * Background AOF rewrite terminated with success
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.324 * Successfully renamed the temporary AOF base file temp-rewriteaof-bg-65.aof into appendonly.aof.2.base.rdb
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.324 * Successfully renamed the temporary AOF incr file temp-appendonly.aof.incr into appendonly.aof.2.incr.aof
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.327 * Removing the history file appendonly.aof.1.incr.aof in the background
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.327 * Removing the history file appendonly.aof.1.base.rdb in the background
redis-replicas-1  | 1:S 25 Jul 2024 10:11:08.335 * Background AOF rewrite finished successfully
```


## Redis Sentinel
```sh
 ioi01-ws_nam@MZ01-WSNAM  ~/Documents/GitHub/TIL-SampleProject/Redis   main ±✚  docker-compose up --build
WARN[0000] /Users/ioi01-ws_nam/Documents/GitHub/TIL-SampleProject/Redis/docker-compose.yml: `version` is obsolete

Attaching to redis-master, redis-replicas-1, sentinel1, sentinel2, sentinel3
redis-master      | redis 10:22:18.43 INFO  ==>
redis-master      | redis 10:22:18.43 INFO  ==> Welcome to the Bitnami redis container
redis-master      | redis 10:22:18.43 INFO  ==> Subscribe to project updates by watching https://github.com/bitnami/containers
redis-master      | redis 10:22:18.43 INFO  ==> Submit issues and feature requests at https://github.com/bitnami/containers/issues
redis-master      | redis 10:22:18.43 INFO  ==> Upgrade to Tanzu Application Catalog for production environments to access custom-configured and pre-packaged software components. Gain enhanced features, including Software Bill of Materials (SBOM), CVE scan result reports, and VEX documents. To learn more, visit https://bitnami.com/enterprise
redis-master      | redis 10:22:18.43 INFO  ==>
redis-master      | redis 10:22:18.43 INFO  ==> ** Starting Redis setup **
redis-master      | redis 10:22:18.44 WARN  ==> You set the environment variable ALLOW_EMPTY_PASSWORD=yes. For safety reasons, do not use this flag in a production environment.
redis-master      | redis 10:22:18.45 INFO  ==> Initializing Redis
redis-master      | redis 10:22:18.46 INFO  ==> Setting Redis config file
redis-master      | redis 10:22:18.47 INFO  ==> Configuring replication mode
redis-master      |
redis-master      | redis 10:22:18.48 INFO  ==> ** Redis setup finished! **
redis-master      | redis 10:22:18.49 INFO  ==> ** Starting Redis **
redis-master      | 1:C 25 Jul 2024 10:22:18.499 * oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
redis-master      | 1:C 25 Jul 2024 10:22:18.499 * Redis version=7.2.5, bits=64, commit=00000000, modified=0, pid=1, just started
redis-master      | 1:C 25 Jul 2024 10:22:18.499 * Configuration loaded
redis-master      | 1:M 25 Jul 2024 10:22:18.500 * monotonic clock: POSIX clock_gettime
redis-master      | 1:M 25 Jul 2024 10:22:18.500 * Running mode=standalone, port=6379.
redis-master      | 1:M 25 Jul 2024 10:22:18.501 * Server initialized
redis-master      | 1:M 25 Jul 2024 10:22:18.504 * Creating AOF base file appendonly.aof.1.base.rdb on server start
redis-master      | 1:M 25 Jul 2024 10:22:18.508 * Creating AOF incr file appendonly.aof.1.incr.aof on server start
redis-master      | 1:M 25 Jul 2024 10:22:18.508 * Ready to accept connections tcp
redis-replicas-1  | redis 10:22:18.58 INFO  ==>
redis-replicas-1  | redis 10:22:18.58 INFO  ==> Welcome to the Bitnami redis container
redis-replicas-1  | redis 10:22:18.58 INFO  ==> Subscribe to project updates by watching https://github.com/bitnami/containers
redis-replicas-1  | redis 10:22:18.58 INFO  ==> Submit issues and feature requests at https://github.com/bitnami/containers/issues
redis-replicas-1  | redis 10:22:18.58 INFO  ==> Upgrade to Tanzu Application Catalog for production environments to access custom-configured and pre-packaged software components. Gain enhanced features, including Software Bill of Materials (SBOM), CVE scan result reports, and VEX documents. To learn more, visit https://bitnami.com/enterprise
redis-replicas-1  | redis 10:22:18.58 INFO  ==>
redis-replicas-1  | redis 10:22:18.58 INFO  ==> ** Starting Redis setup **
redis-replicas-1  | redis 10:22:18.60 WARN  ==> You set the environment variable ALLOW_EMPTY_PASSWORD=yes. For safety reasons, do not use this flag in a production environment.
redis-replicas-1  | redis 10:22:18.60 INFO  ==> Initializing Redis
redis-replicas-1  | redis 10:22:18.61 INFO  ==> Setting Redis config file
redis-replicas-1  | redis 10:22:18.62 INFO  ==> Configuring replication mode
redis-replicas-1  |
redis-replicas-1  | redis 10:22:18.64 INFO  ==> ** Redis setup finished! **
redis-replicas-1  | redis 10:22:18.64 INFO  ==> ** Starting Redis **
redis-replicas-1  | 1:C 25 Jul 2024 10:22:18.651 * oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
redis-replicas-1  | 1:C 25 Jul 2024 10:22:18.651 * Redis version=7.2.5, bits=64, commit=00000000, modified=0, pid=1, just started
redis-replicas-1  | 1:C 25 Jul 2024 10:22:18.651 * Configuration loaded
redis-replicas-1  | 1:S 25 Jul 2024 10:22:18.652 * monotonic clock: POSIX clock_gettime
redis-replicas-1  | 1:S 25 Jul 2024 10:22:18.652 * Running mode=standalone, port=6379.
redis-replicas-1  | 1:S 25 Jul 2024 10:22:18.652 * Server initialized
redis-replicas-1  | 1:S 25 Jul 2024 10:22:18.657 * Creating AOF base file appendonly.aof.1.base.rdb on server start
redis-replicas-1  | 1:S 25 Jul 2024 10:22:18.659 * Creating AOF incr file appendonly.aof.1.incr.aof on server start
redis-replicas-1  | 1:S 25 Jul 2024 10:22:18.659 * Ready to accept connections tcp
redis-replicas-1  | 1:S 25 Jul 2024 10:22:18.659 * Connecting to MASTER redis-master:6379
redis-replicas-1  | 1:S 25 Jul 2024 10:22:18.660 * MASTER <-> REPLICA sync started
redis-master      | 1:M 25 Jul 2024 10:22:18.660 * Replica 172.19.0.3:6379 asks for synchronization
redis-replicas-1  | 1:S 25 Jul 2024 10:22:18.660 * Non blocking connect for SYNC fired the event.
redis-master      | 1:M 25 Jul 2024 10:22:18.660 * Full resync requested by replica 172.19.0.3:6379
redis-replicas-1  | 1:S 25 Jul 2024 10:22:18.660 * Master replied to PING, replication can continue...
redis-master      | 1:M 25 Jul 2024 10:22:18.660 * Replication backlog created, my new replication IDs are 'b119813a8a06619aff655355a3064d871660a61d' and '0000000000000000000000000000000000000000'
redis-replicas-1  | 1:S 25 Jul 2024 10:22:18.660 * Partial resynchronization not possible (no cached master)
redis-master      | 1:M 25 Jul 2024 10:22:18.660 * Delay next BGSAVE for diskless SYNC
sentinel3         | redis-sentinel 10:22:18.80 INFO  ==>
sentinel3         | redis-sentinel 10:22:18.80 INFO  ==> Welcome to the Bitnami redis-sentinel container
sentinel3         | redis-sentinel 10:22:18.80 INFO  ==> Subscribe to project updates by watching https://github.com/bitnami/containers
sentinel3         | redis-sentinel 10:22:18.80 INFO  ==> Submit issues and feature requests at https://github.com/bitnami/containers/issues
sentinel3         | redis-sentinel 10:22:18.80 INFO  ==> Upgrade to Tanzu Application Catalog for production environments to access custom-configured and pre-packaged software components. Gain enhanced features, including Software Bill of Materials (SBOM), CVE scan result reports, and VEX documents. To learn more, visit https://bitnami.com/enterprise
sentinel3         | redis-sentinel 10:22:18.81 INFO  ==>
sentinel2         | redis-sentinel 10:22:18.81 INFO  ==>
sentinel1         | redis-sentinel 10:22:18.81 INFO  ==>
sentinel3         | redis-sentinel 10:22:18.81 INFO  ==> ** Starting Redis sentinel setup **
sentinel2         | redis-sentinel 10:22:18.81 INFO  ==> Welcome to the Bitnami redis-sentinel container
sentinel1         | redis-sentinel 10:22:18.81 INFO  ==> Welcome to the Bitnami redis-sentinel container
sentinel2         | redis-sentinel 10:22:18.81 INFO  ==> Subscribe to project updates by watching https://github.com/bitnami/containers
sentinel1         | redis-sentinel 10:22:18.81 INFO  ==> Subscribe to project updates by watching https://github.com/bitnami/containers
sentinel2         | redis-sentinel 10:22:18.81 INFO  ==> Submit issues and feature requests at https://github.com/bitnami/containers/issues
sentinel1         | redis-sentinel 10:22:18.81 INFO  ==> Submit issues and feature requests at https://github.com/bitnami/containers/issues
sentinel2         | redis-sentinel 10:22:18.82 INFO  ==> Upgrade to Tanzu Application Catalog for production environments to access custom-configured and pre-packaged software components. Gain enhanced features, including Software Bill of Materials (SBOM), CVE scan result reports, and VEX documents. To learn more, visit https://bitnami.com/enterprise
sentinel2         | redis-sentinel 10:22:18.82 INFO  ==>
sentinel1         | redis-sentinel 10:22:18.82 INFO  ==> Upgrade to Tanzu Application Catalog for production environments to access custom-configured and pre-packaged software components. Gain enhanced features, including Software Bill of Materials (SBOM), CVE scan result reports, and VEX documents. To learn more, visit https://bitnami.com/enterprise
sentinel1         | redis-sentinel 10:22:18.82 INFO  ==>
sentinel2         | redis-sentinel 10:22:18.82 INFO  ==> ** Starting Redis sentinel setup **
sentinel1         | redis-sentinel 10:22:18.82 INFO  ==> ** Starting Redis sentinel setup **
sentinel3         | redis-sentinel 10:22:18.82 INFO  ==> Initializing Redis Sentinel...
sentinel3         | redis-sentinel 10:22:18.83 INFO  ==> Configuring Redis Sentinel...
sentinel2         | redis-sentinel 10:22:18.83 INFO  ==> Initializing Redis Sentinel...
sentinel1         | redis-sentinel 10:22:18.83 INFO  ==> Initializing Redis Sentinel...
sentinel1         | redis-sentinel 10:22:18.83 INFO  ==> Configuring Redis Sentinel...
sentinel2         | redis-sentinel 10:22:18.83 INFO  ==> Configuring Redis Sentinel...
sentinel3         |
sentinel3         | redis-sentinel 10:22:18.86 INFO  ==> ** Redis sentinel setup finished! **
sentinel1         | redis-sentinel 10:22:18.86 INFO  ==> ** Redis sentinel setup finished! **
sentinel1         |
sentinel2         |
sentinel2         | redis-sentinel 10:22:18.86 INFO  ==> ** Redis sentinel setup finished! **
sentinel3         | redis-sentinel 10:22:18.87 INFO  ==> ** Starting Redis Sentinel **
sentinel1         | redis-sentinel 10:22:18.87 INFO  ==> ** Starting Redis Sentinel **
sentinel2         | redis-sentinel 10:22:18.87 INFO  ==> ** Starting Redis Sentinel **
sentinel3         | 1:X 25 Jul 2024 10:22:18.876 * oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
sentinel3         | 1:X 25 Jul 2024 10:22:18.876 * Redis version=7.2.5, bits=64, commit=00000000, modified=0, pid=1, just started
sentinel3         | 1:X 25 Jul 2024 10:22:18.876 * Configuration loaded
sentinel3         | 1:X 25 Jul 2024 10:22:18.876 * monotonic clock: POSIX clock_gettime
sentinel3         | 1:X 25 Jul 2024 10:22:18.877 * Running mode=sentinel, port=26379.
sentinel1         | 1:X 25 Jul 2024 10:22:18.879 * oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
sentinel1         | 1:X 25 Jul 2024 10:22:18.879 * Redis version=7.2.5, bits=64, commit=00000000, modified=0, pid=1, just started
sentinel1         | 1:X 25 Jul 2024 10:22:18.879 * Configuration loaded
sentinel1         | 1:X 25 Jul 2024 10:22:18.879 * monotonic clock: POSIX clock_gettime
sentinel1         | 1:X 25 Jul 2024 10:22:18.879 * Running mode=sentinel, port=26379.
sentinel2         | 1:X 25 Jul 2024 10:22:18.880 * oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
sentinel2         | 1:X 25 Jul 2024 10:22:18.880 * Redis version=7.2.5, bits=64, commit=00000000, modified=0, pid=1, just started
sentinel2         | 1:X 25 Jul 2024 10:22:18.880 * Configuration loaded
sentinel2         | 1:X 25 Jul 2024 10:22:18.880 * monotonic clock: POSIX clock_gettime
sentinel2         | 1:X 25 Jul 2024 10:22:18.880 * Running mode=sentinel, port=26379.
sentinel3         | 1:X 25 Jul 2024 10:22:18.883 * Sentinel new configuration saved on disk
sentinel3         | 1:X 25 Jul 2024 10:22:18.883 * Sentinel ID is 4cb3cf763841eeb8336b0b7bd2a8da96bfc63044
sentinel3         | 1:X 25 Jul 2024 10:22:18.883 # +monitor master mymaster 172.19.0.2 6379 quorum 2
sentinel2         | 1:X 25 Jul 2024 10:22:18.884 * Sentinel new configuration saved on disk
sentinel2         | 1:X 25 Jul 2024 10:22:18.884 * Sentinel ID is dc9372b868176cf1cd45c2b04f74196d97db20d4
sentinel2         | 1:X 25 Jul 2024 10:22:18.884 # +monitor master mymaster 172.19.0.2 6379 quorum 2
sentinel1         | 1:X 25 Jul 2024 10:22:18.884 * Sentinel new configuration saved on disk
sentinel3         | 1:X 25 Jul 2024 10:22:18.884 * +slave slave 172.19.0.3:6379 172.19.0.3 6379 @ mymaster 172.19.0.2 6379
sentinel1         | 1:X 25 Jul 2024 10:22:18.884 * Sentinel ID is feb0691008a90e05e7852a69b1245f689df0693f
sentinel2         | 1:X 25 Jul 2024 10:22:18.885 * +slave slave 172.19.0.3:6379 172.19.0.3 6379 @ mymaster 172.19.0.2 6379
sentinel1         | 1:X 25 Jul 2024 10:22:18.884 # +monitor master mymaster 172.19.0.2 6379 quorum 2
sentinel1         | 1:X 25 Jul 2024 10:22:18.885 * +slave slave 172.19.0.3:6379 172.19.0.3 6379 @ mymaster 172.19.0.2 6379
sentinel3         | 1:X 25 Jul 2024 10:22:18.888 * Sentinel new configuration saved on disk
sentinel2         | 1:X 25 Jul 2024 10:22:18.888 * Sentinel new configuration saved on disk
sentinel1         | 1:X 25 Jul 2024 10:22:18.888 * Sentinel new configuration saved on disk
sentinel2         | 1:X 25 Jul 2024 10:22:20.933 * +sentinel sentinel feb0691008a90e05e7852a69b1245f689df0693f 172.19.0.4 26379 @ mymaster 172.19.0.2 6379
sentinel3         | 1:X 25 Jul 2024 10:22:20.933 * +sentinel sentinel feb0691008a90e05e7852a69b1245f689df0693f 172.19.0.4 26379 @ mymaster 172.19.0.2 6379
sentinel3         | 1:X 25 Jul 2024 10:22:20.936 * Sentinel new configuration saved on disk
sentinel2         | 1:X 25 Jul 2024 10:22:20.936 * Sentinel new configuration saved on disk
sentinel2         | 1:X 25 Jul 2024 10:22:20.943 * +sentinel sentinel 4cb3cf763841eeb8336b0b7bd2a8da96bfc63044 172.19.0.5 26379 @ mymaster 172.19.0.2 6379
sentinel1         | 1:X 25 Jul 2024 10:22:20.943 * +sentinel sentinel 4cb3cf763841eeb8336b0b7bd2a8da96bfc63044 172.19.0.5 26379 @ mymaster 172.19.0.2 6379
sentinel2         | 1:X 25 Jul 2024 10:22:20.945 * Sentinel new configuration saved on disk
sentinel1         | 1:X 25 Jul 2024 10:22:20.946 * Sentinel new configuration saved on disk
sentinel1         | 1:X 25 Jul 2024 10:22:20.957 * +sentinel sentinel dc9372b868176cf1cd45c2b04f74196d97db20d4 172.19.0.6 26379 @ mymaster 172.19.0.2 6379
sentinel3         | 1:X 25 Jul 2024 10:22:20.957 * +sentinel sentinel dc9372b868176cf1cd45c2b04f74196d97db20d4 172.19.0.6 26379 @ mymaster 172.19.0.2 6379
sentinel3         | 1:X 25 Jul 2024 10:22:20.959 * Sentinel new configuration saved on disk
sentinel1         | 1:X 25 Jul 2024 10:22:20.960 * Sentinel new configuration saved on disk
redis-master      | 1:M 25 Jul 2024 10:22:23.665 * Starting BGSAVE for SYNC with target: replicas sockets
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.665 * Full resync from master: b119813a8a06619aff655355a3064d871660a61d:833
redis-master      | 1:M 25 Jul 2024 10:22:23.666 * Background RDB transfer started by pid 52
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.672 * MASTER <-> REPLICA sync: receiving streamed RDB from master with EOF to disk
redis-master      | 52:C 25 Jul 2024 10:22:23.669 * Fork CoW for RDB: current 0 MB, peak 0 MB, average 0 MB
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.672 * MASTER <-> REPLICA sync: Flushing old data
redis-master      | 1:M 25 Jul 2024 10:22:23.671 * Diskless rdb transfer, done reading from pipe, 1 replicas still up.
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.672 * MASTER <-> REPLICA sync: Loading DB in memory
redis-master      | 1:M 25 Jul 2024 10:22:23.675 * Background RDB transfer terminated with success
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.674 * Loading RDB produced by version 7.2.5
redis-master      | 1:M 25 Jul 2024 10:22:23.675 * Streamed RDB transfer with replica 172.19.0.3:6379 succeeded (socket). Waiting for REPLCONF ACK from replica to enable streaming
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.674 * RDB age 0 seconds
redis-master      | 1:M 25 Jul 2024 10:22:23.675 * Synchronization with replica 172.19.0.3:6379 succeeded
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.674 * RDB memory usage when created 1.18 Mb
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.674 * Done loading RDB, keys loaded: 0, keys expired: 0.
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.674 * MASTER <-> REPLICA sync: Finished with success
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.674 * Creating AOF incr file temp-appendonly.aof.incr on background rewrite
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.675 * Background append only file rewriting started by pid 65
redis-replicas-1  | 65:C 25 Jul 2024 10:22:23.676 * Successfully created the temporary AOF base file temp-rewriteaof-bg-65.aof
redis-replicas-1  | 65:C 25 Jul 2024 10:22:23.676 * Fork CoW for AOF rewrite: current 0 MB, peak 0 MB, average 0 MB
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.707 * Background AOF rewrite terminated with success
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.707 * Successfully renamed the temporary AOF base file temp-rewriteaof-bg-65.aof into appendonly.aof.2.base.rdb
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.707 * Successfully renamed the temporary AOF incr file temp-appendonly.aof.incr into appendonly.aof.2.incr.aof
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.710 * Removing the history file appendonly.aof.1.incr.aof in the background
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.710 * Removing the history file appendonly.aof.1.base.rdb in the background
redis-replicas-1  | 1:S 25 Jul 2024 10:22:23.712 * Background AOF rewrite finished successfully
```

### sentinel 상태 확인
```sh
 ioi01-ws_nam@MZ01-WSNAM  ~/App  docker exec -it sentinel1 /bin/sh
# port를 붙여야함
$ redis-cli -p 26379
127.0.0.1:26379> info sentinel
# Sentinel
sentinel_masters:1
sentinel_tilt:0
sentinel_tilt_since_seconds:-1
sentinel_running_scripts:0
sentinel_scripts_queue_length:0
sentinel_simulate_failure_flags:0
master0:name=mymaster,status=ok,address=172.19.0.2:6379,slaves=1,sentinels=3
```

### master down
```sh
docker stop redis-master

# sentinel 다운 판단
sentinel3         | 1:X 25 Jul 2024 10:25:52.927 # +sdown master mymaster 172.19.0.2 6379
sentinel2         | 1:X 25 Jul 2024 10:25:52.982 # +sdown master mymaster 172.19.0.2 6379
sentinel1         | 1:X 25 Jul 2024 10:25:52.982 # +sdown master mymaster 172.19.0.2 6379
sentinel2         | 1:X 25 Jul 2024 10:25:53.042 # +odown master mymaster 172.19.0.2 6379 #quorum 3/2

# replicas-1이 master mode로 변경
redis-replicas-1  | 1:M 25 Jul 2024 10:25:53.281 * Discarding previously cached master state.
redis-replicas-1  | 1:M 25 Jul 2024 10:25:53.281 * Setting secondary replication ID to b119813a8a06619aff655355a3064d871660a61d, valid up to offset: 42042. New replication ID is 14205c2d771ce683832f6b000278129886a13836
redis-replicas-1  | 1:M 25 Jul 2024 10:25:53.281 * MASTER MODE enabled (user request from 'id=7 addr=172.19.0.6:55566 laddr=172.19.0.3:6379 fd=14 name=sentinel-dc9372b8-cmd age=215 idle=0 flags=x db=0 sub=0 psub=0 ssub=0 multi=4 qbuf=188 qbuf-free=20286 argv-mem=4 multi-mem=169 rbs=2048 rbp=1024 obl=45 oll=0 omem=0 tot-mem=23717 events=r cmd=exec user=default redir=-1 resp=2 lib-name= lib-ver=')
redis-replicas-1  | 1:M 25 Jul 2024 10:25:53.285 * CONFIG REWRITE executed with success.

# master로 승격
sentinel2         | 1:X 25 Jul 2024 10:25:54.075 # +promoted-slave slave 172.19.0.3:6379 172.19.0.3 6379 @ mymaster 172.19.0.2 6379
sentinel2         | 1:X 25 Jul 2024 10:25:54.137 # +switch-master mymaster 172.19.0.2 6379 172.19.0.3 6379

# 지속 에러 모니터링
sentinel1         | 1:X 25 Jul 2024 10:30:29.709 # Failed to resolve hostname 'redis-master'
sentinel3         | 1:X 25 Jul 2024 10:30:29.969 # Failed to resolve hostname 'redis-master'
sentinel2         | 1:X 25 Jul 2024 10:30:30.031 # Failed to resolve hostname 'redis-master'

# 변경된 master ip 주소
127.0.0.1:26379> info sentinel
# Sentinel
sentinel_masters:1
sentinel_tilt:0
sentinel_tilt_since_seconds:-1
sentinel_running_scripts:0
sentinel_scripts_queue_length:0
sentinel_simulate_failure_flags:0
master0:name=mymaster,status=ok,address=172.19.0.3:6379,slaves=1,sentinels=3


# redis-master 재시작 
# sentinel 감지
sentinel3         | 1:X 25 Jul 2024 10:32:47.398 # -sdown slave :6379 172.19.0.2 6379 @ mymaster 172.19.0.3 6379
sentinel1         | 1:X 25 Jul 2024 10:32:47.490 # -sdown slave :6379 172.19.0.2 6379 @ mymaster 172.19.0.3 6379
sentinel2         | 1:X 25 Jul 2024 10:32:47.734 # -sdown slave :6379 172.19.0.2 6379 @ mymaster 172.19.0.3 6379

# redis-master는 새로 승격된 master의 replica가 됨.
redis-master      | 1:S 25 Jul 2024 10:32:57.370 * Before turning into a replica, using my own master parameters to synthesize a cached master: I may be able to synchronize with the new master with just a partial transfer.
redis-master      | 1:S 25 Jul 2024 10:32:57.370 * Connecting to MASTER 172.19.0.3:6379
redis-master      | 1:S 25 Jul 2024 10:32:57.370 * MASTER <-> REPLICA sync started
redis-master      | 1:S 25 Jul 2024 10:32:57.370 * REPLICAOF 172.19.0.3:6379 enabled (user request from 'id=4 addr=172.19.0.5:44538 laddr=172.19.0.2:6379 fd=9 name=sentinel-4cb3cf76-cmd age=10 idle=0 flags=x db=0 sub=0 psub=0 ssub=0 multi=4 qbuf=198 qbuf-free=20276 argv-mem=4 multi-mem=178 rbs=1024 rbp=1024 obl=45 oll=0 omem=0 tot-mem=22702 events=r cmd=exec user=default redir=-1 resp=2 lib-name= lib-ver=')

# redis-master는 read-only 상태 확인됨
ioi01-ws_nam@MZ01-WSNAM  ~/App  docker exec -it redis-master /bin/sh
$ redis-cli
127.0.0.1:6379> set a aaaa
(error) READONLY You can't write against a read only replica.
```

