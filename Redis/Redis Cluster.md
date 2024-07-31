# Redis Cluster

![rediscluster](../images/Redis/rediscluster.png)


## 특징 

- gossip protocol
- hash slot
  - 16384개의 hash slot 공간
  - CRC16 해싱 후에 16384로 나눈 나머지로 key를 hash slot에 매핑
  - n개의 노드가 16384개를 n개로 나누어서 가져감.
- DB0



## redis.conf cluster 설정

- cluster-enabled yes
  - cluster 모드 실행 여부 설정
- cluster-config-file nodes-6379.conf
  - 해당 노드가 클러스터를 유지하기 위한 설정을 저장하는 파일. 사용자가 수정하는 것은 아님. 같은 머신에서 여러개의 노드를 띄울때는 filename을 다르게 설정해서 겹치지 않게 해줘야함.
- cluster-node-timeout 5000
  - 특정 노드가 비정상을 판단되는 기준 시간
  - master는 replica에 의해 failover가 이뤄짐
- cluster-replica-validity-factor 10
  - master가 장애가 생겼을 때, master와 통신한지 오래된 replica는 데이터가 최신이 아닐 수있음. **cluster-node-timeout** 곱하기 factor 시간 만큼 통신이 없던 replica는 failover 대상에서 제외
- cluster-migration-barrier 1
  - master가 유지해야 하는 최소한의 replica 개수
  - replica migration과 관련
- cluster-require-full-coverage yes
  - 항상 full coverage를 보장할 것인지
  - 일부 hash slot이 커버되지 않을 때, 일부 key 범위가 제대로 서빙되지 않을 때 write 요청을 받을지 여부
  - default는 yes
  - no로 하면 강제로 정상 hash slot은 동작
- cluster-allow-reads-when-down no
  - 클러스터가 정상 상태가 아닐 때 read 요청을 받을지 말지
  - dafault는 no
  - 데이터 일관성이 중요하지 않다면 yes로 설정할 수 도 있음



## redis 실행 

```sh
redis-server ./redis-7000.conf

Running in cluster mode
Port: 7000
```
- 노드 한대 실행


```sh
# 각 노드의 서버를 적어서 redis cluster 생성. cluster-replicas를 통해 최소 replica 개수 지정
 ioi01-ws_nam@syn-172-090-007-119  ~  redis-cli --cluster create localhost:7000 localhost:7001 localhost:7002 localhost:7003 localhost:7004 localhost:7005 --cluster-replicas 1

>>> Performing hash slots allocation on 6 nodes...
# hash slot 지정
Master[0] -> Slots 0 - 5460
Master[1] -> Slots 5461 - 10922
Master[2] -> Slots 10923 - 16383
# replica 연경
Adding replica localhost:7004 to localhost:7000
Adding replica localhost:7005 to localhost:7001
Adding replica localhost:7003 to localhost:7002
>>> Trying to optimize slaves allocation for anti-affinity
[WARNING] Some slaves are in the same host as their master
M: 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 localhost:7000
   slots:[0-5460] (5461 slots) master
M: 8902be1a0065bf94caa05e80a28b0d9b3368bd36 localhost:7001
   slots:[5461-10922] (5462 slots) master
M: 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 localhost:7002
   slots:[10923-16383] (5461 slots) master
S: 00dfee2c032583e5b555620d7eee49a1f572b805 localhost:7003
   replicates 8902be1a0065bf94caa05e80a28b0d9b3368bd36
S: 3bb6d137b300a8b88f13ce3c6ed7f7bd9f2a41ab localhost:7004
   replicates 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7
S: 6226d1c3b6b9cb56b082bc415d15a26f5f722ec3 localhost:7005
   replicates 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0
Can I set the above configuration? (type 'yes' to accept): yes
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join
.
>>> Performing Cluster Check (using node localhost:7000)
# 노드 아이디 정보 ex) 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0
M: 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 localhost:7000
   slots:[0-5460] (5461 slots) master
   1 additional replica(s)
S: 6226d1c3b6b9cb56b082bc415d15a26f5f722ec3 ::1:7005
   slots: (0 slots) slave
   replicates 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0
S: 3bb6d137b300a8b88f13ce3c6ed7f7bd9f2a41ab ::1:7004
   slots: (0 slots) slave
   replicates 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7
M: 8902be1a0065bf94caa05e80a28b0d9b3368bd36 ::1:7001
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
S: 00dfee2c032583e5b555620d7eee49a1f572b805 ::1:7003
   slots: (0 slots) slave
   replicates 8902be1a0065bf94caa05e80a28b0d9b3368bd36
M: 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 ::1:7002
   slots:[10923-16383] (5461 slots) master
   1 additional replica(s)
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
# hash slot 전부 cover됨
[OK] All 16384 slots covered.
```
- 노드들은 서로 노드 id 를 가지고 식별하게 됨
- 아이피가 달라져도 노드 id가 그대로라서 인식 가능

```sh
ioi01-ws_nam@syn-172-090-007-119  ~  redis-cli -p 7000
127.0.0.1:7000> cluster nodes
6226d1c3b6b9cb56b082bc415d15a26f5f722ec3 ::1:7005@17005 slave 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 0 1722250160595 1 connected
2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 ::1:7000@17000 myself,master - 0 1722250159000 1 connected 0-5460
3bb6d137b300a8b88f13ce3c6ed7f7bd9f2a41ab ::1:7004@17004 slave 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 0 1722250160997 3 connected
8902be1a0065bf94caa05e80a28b0d9b3368bd36 ::1:7001@17001 master - 0 1722250160595 2 connected 5461-10922
00dfee2c032583e5b555620d7eee49a1f572b805 ::1:7003@17003 slave 8902be1a0065bf94caa05e80a28b0d9b3368bd36 0 1722250160000 2 connected
16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 ::1:7002@17002 master - 0 1722250160000 3 connected 10923-16383
```
- 노드에서 직접 클러스터 정보 확인


```sh
127.0.0.1:7000> set aa bb
OK
127.0.0.1:7000> set aaa dd
(error) MOVED 10439 ::1:7001

ioi01-ws_nam@syn-172-090-007-119  ~  redis-cli -p 7001
127.0.0.1:7001> set aaa dd
OK

 ioi01-ws_nam@syn-172-090-007-119  ~  redis-cli -p 7000
127.0.0.1:7000> get aaa
(error) MOVED 10439 ::1:7001
```
- 해당 노드에 맞지않는 hash key 일 때 


```sh
 ioi01-ws_nam@syn-172-090-007-119  ~  redis-cli -p 7003
127.0.0.1:7003> get aaa
(error) MOVED 10439 ::1:7001

127.0.0.1:7003> readonly
OK
127.0.0.1:7003> get aaa
"dd"


```
- 7001의 replica인 7003로 가도 처음에는 get이 안됨
- 읽기는 허용하도록 설정해야함.



```sh
# 7001 master 종료

# 7003 노드 로그
20934:S 29 Jul 2024 19:57:57.458 * Connection with master lost.
20934:S 29 Jul 2024 19:57:57.458 * Caching the disconnected master state.
20934:S 29 Jul 2024 19:57:57.458 * Reconnecting to MASTER ::1:7001
20934:S 29 Jul 2024 19:57:57.458 * MASTER <-> REPLICA sync started
20934:S 29 Jul 2024 19:57:57.458 # Error condition on socket for SYNC: Connection refused
20934:S 29 Jul 2024 19:57:58.007 * Connecting to MASTER ::1:7001
20934:S 29 Jul 2024 19:57:58.008 * MASTER <-> REPLICA sync started
20934:S 29 Jul 2024 19:57:58.008 # Error condition on socket for SYNC: Connection refused
20934:S 29 Jul 2024 19:57:59.019 * Connecting to MASTER ::1:7001
20934:S 29 Jul 2024 19:57:59.019 * MASTER <-> REPLICA sync started
20934:S 29 Jul 2024 19:57:59.019 # Error condition on socket for SYNC: Connection refused
20934:S 29 Jul 2024 19:58:00.030 * Connecting to MASTER ::1:7001
20934:S 29 Jul 2024 19:58:00.030 * MASTER <-> REPLICA sync started
20934:S 29 Jul 2024 19:58:00.030 # Error condition on socket for SYNC: Connection refused
20934:S 29 Jul 2024 19:58:01.040 * Connecting to MASTER ::1:7001
20934:S 29 Jul 2024 19:58:01.040 * MASTER <-> REPLICA sync started
20934:S 29 Jul 2024 19:58:01.040 # Error condition on socket for SYNC: Connection refused
20934:S 29 Jul 2024 19:58:02.054 * Connecting to MASTER ::1:7001
20934:S 29 Jul 2024 19:58:02.054 * MASTER <-> REPLICA sync started
20934:S 29 Jul 2024 19:58:02.055 # Error condition on socket for SYNC: Connection refused
20934:S 29 Jul 2024 19:58:03.067 * Connecting to MASTER ::1:7001
20934:S 29 Jul 2024 19:58:03.068 * MASTER <-> REPLICA sync started
20934:S 29 Jul 2024 19:58:03.068 # Error condition on socket for SYNC: Connection refused
20934:S 29 Jul 2024 19:58:03.835 * FAIL message received from 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 () about 8902be1a0065bf94caa05e80a28b0d9b3368bd36 ()
20934:S 29 Jul 2024 19:58:03.835 # Cluster state changed: fail
20934:S 29 Jul 2024 19:58:03.877 * Start of election delayed for 535 milliseconds (rank #0, offset 1075).
20934:S 29 Jul 2024 19:58:04.078 * Connecting to MASTER ::1:7001
20934:S 29 Jul 2024 19:58:04.078 * MASTER <-> REPLICA sync started
20934:S 29 Jul 2024 19:58:04.078 # Error condition on socket for SYNC: Connection refused
20934:S 29 Jul 2024 19:58:04.482 * Starting a failover election for epoch 7.
20934:S 29 Jul 2024 19:58:04.506 * Failover election won: I'm the new master.
20934:S 29 Jul 2024 19:58:04.506 * configEpoch set to 7 after successful failover
20934:M 29 Jul 2024 19:58:04.506 * Discarding previously cached master state.
20934:M 29 Jul 2024 19:58:04.506 * Setting secondary replication ID to 19661af0b1f3e44e072a0dee1837ffaaca4c3fe9, valid up to offset: 1076. New replication ID is a53fb95e07210cb1ba7df733a6498ad7451f5aec


127.0.0.1:7003> cluster node
2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 ::1:7000@17000 master - 0 1722250716000 1 connected 0-5460
# 종료시킨 7001이 fail상태
8902be1a0065bf94caa05e80a28b0d9b3368bd36 ::1:7001@17001 master,fail - 1722250678615 1722250676089 2 disconnected
# 7001의 replica였던 7003이 master가 됨. hash slot도 배정받음.
00dfee2c032583e5b555620d7eee49a1f572b805 ::1:7003@17003 myself,master - 0 1722250716000 7 connected 5461-10922
6226d1c3b6b9cb56b082bc415d15a26f5f722ec3 ::1:7005@17005 slave 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 0 1722250717095 1 connected
3bb6d137b300a8b88f13ce3c6ed7f7bd9f2a41ab ::1:7004@17004 slave 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 0 1722250716387 3 connected
16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 ::1:7002@17002 master - 0 1722250717399 3 connected 10923-16383

# 7001번이 담당한 hash slot이 7003에서 정상적으로 set 됨
127.0.0.1:7003> set aaa newnew
OK
```

```sh
127.0.0.1:7003> cluster nodes
2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 ::1:7000@17000 master - 0 1722250971000 1 connected 0-5460
8902be1a0065bf94caa05e80a28b0d9b3368bd36 ::1:7001@17001 slave 00dfee2c032583e5b555620d7eee49a1f572b805 0 1722250970554 7 connected
00dfee2c032583e5b555620d7eee49a1f572b805 ::1:7003@17003 myself,master - 0 1722250970000 7 connected 5461-10922
6226d1c3b6b9cb56b082bc415d15a26f5f722ec3 ::1:7005@17005 slave 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 0 1722250970050 1 connected
3bb6d137b300a8b88f13ce3c6ed7f7bd9f2a41ab ::1:7004@17004 slave 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 0 1722250971563 3 connected
16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 ::1:7002@17002 master - 0 1722250970000 3 connected 10923-16383
```
- 7001을 되살리면 이제 replica가 됨


```sh
# 추가할 노드의 서버를 적어주고, 클러스트에서 하나의 노드 포트만 뒤에 적어주면 됨
 ioi01-ws_nam@syn-172-090-007-119  ~  redis-cli --cluster add-node localhost:7006 localhost:7000
>>> Adding node localhost:7006 to cluster localhost:7000
>>> Performing Cluster Check (using node localhost:7000)
M: 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 localhost:7000
   slots:[0-5460] (5461 slots) master
   1 additional replica(s)
S: 6226d1c3b6b9cb56b082bc415d15a26f5f722ec3 ::1:7005
   slots: (0 slots) slave
   replicates 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0
S: 3bb6d137b300a8b88f13ce3c6ed7f7bd9f2a41ab ::1:7004
   slots: (0 slots) slave
   replicates 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7
S: 8902be1a0065bf94caa05e80a28b0d9b3368bd36 ::1:7001
   slots: (0 slots) slave
   replicates 00dfee2c032583e5b555620d7eee49a1f572b805
M: 00dfee2c032583e5b555620d7eee49a1f572b805 ::1:7003
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
M: 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 ::1:7002
   slots:[10923-16383] (5461 slots) master
   1 additional replica(s)
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
>>> Getting functions from cluster
>>> Send FUNCTION LIST to localhost:7006 to verify there is no functions in it
>>> Send FUNCTION RESTORE to localhost:7006
>>> Send CLUSTER MEET to node localhost:7006 to make it join the cluster.
[OK] New node added correctly.
```
- 클러스터에 새로운 노드 추가


```sh
 ioi01-ws_nam@syn-172-090-007-119  ~  redis-cli -p 7006
127.0.0.1:7006> cluster nodes
00dfee2c032583e5b555620d7eee49a1f572b805 ::1:7003@17003 master - 0 1722251259040 7 connected 5461-10922
573881a573e7868c6ba5496183122fd9a231ed62 ::1:7006@17006 myself,master - 0 1722251258000 0 connected
16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 ::1:7002@17002 master - 0 1722251259000 3 connected 10923-16383
2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 ::1:7000@17000 master - 0 1722251260553 1 connected 0-5460
6226d1c3b6b9cb56b082bc415d15a26f5f722ec3 ::1:7005@17005 slave 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 0 1722251261158 1 connected
8902be1a0065bf94caa05e80a28b0d9b3368bd36 ::1:7001@17001 slave 00dfee2c032583e5b555620d7eee49a1f572b805 0 1722251260000 7 connected
3bb6d137b300a8b88f13ce3c6ed7f7bd9f2a41ab ::1:7004@17004 slave 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 0 1722251260000 3 connected
```
- 7006이 master로 추가됨
  - add-node 명령어는 무조건 master로 추가됨



```sh
# 추가할 노드 서버를 적어주고 master로 지정할 노드의 서버를 뒤에 적어준다. --cluster-slave 옵션을 준다.
 ✘ ioi01-ws_nam@syn-172-090-007-119  ~  redis-cli --cluster add-node localhost:7007 localhost:7006 --cluster-slave
>>> Adding node localhost:7007 to cluster localhost:7006
>>> Performing Cluster Check (using node localhost:7006)
M: 573881a573e7868c6ba5496183122fd9a231ed62 localhost:7006
   slots: (0 slots) master
M: 00dfee2c032583e5b555620d7eee49a1f572b805 ::1:7003
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
M: 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 ::1:7002
   slots:[10923-16383] (5461 slots) master
   1 additional replica(s)
M: 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 ::1:7000
   slots:[0-5460] (5461 slots) master
   1 additional replica(s)
S: 6226d1c3b6b9cb56b082bc415d15a26f5f722ec3 ::1:7005
   slots: (0 slots) slave
   replicates 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0
S: 8902be1a0065bf94caa05e80a28b0d9b3368bd36 ::1:7001
   slots: (0 slots) slave
   replicates 00dfee2c032583e5b555620d7eee49a1f572b805
S: 3bb6d137b300a8b88f13ce3c6ed7f7bd9f2a41ab ::1:7004
   slots: (0 slots) slave
   replicates 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
Automatically selected master localhost:7006
>>> Send CLUSTER MEET to node localhost:7007 to make it join the cluster.
Waiting for the cluster to join

>>> Configure node as replica of localhost:7006.
[OK] New node added correctly.



127.0.0.1:7007> cluster nodes
3bb6d137b300a8b88f13ce3c6ed7f7bd9f2a41ab ::1:7004@17004 slave 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 0 1722251527570 3 connected
aa986dc5d88384fb779577b65ee208686f1d3fc9 ::1:7007@17007 myself,slave 573881a573e7868c6ba5496183122fd9a231ed62 0 1722251527000 8 connected
00dfee2c032583e5b555620d7eee49a1f572b805 ::1:7003@17003 master - 0 1722251528000 7 connected 5461-10922
573881a573e7868c6ba5496183122fd9a231ed62 ::1:7006@17006 master - 0 1722251527000 8 connected
2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 ::1:7000@17000 master - 0 1722251528280 1 connected 0-5460
6226d1c3b6b9cb56b082bc415d15a26f5f722ec3 ::1:7005@17005 slave 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 0 1722251528582 1 connected
8902be1a0065bf94caa05e80a28b0d9b3368bd36 ::1:7001@17001 slave 00dfee2c032583e5b555620d7eee49a1f572b805 0 1722251527062 7 connected
16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 ::1:7002@17002 master - 0 1722251527264 3 connected 10923-16383
```
- 새로운 노드를 redls cluster에 replica로 추가


```sh
# cluster 내부의 아무 노드를 적어주고 cluster에서 제거할 노드의 id를 적어준다.
 ✘ ioi01-ws_nam@syn-172-090-007-119  ~  redis-cli --cluster del-node localhost:7000 aa986dc5d88384fb779577b65ee208686f1d3fc9
>>> Removing node aa986dc5d88384fb779577b65ee208686f1d3fc9 from cluster localhost:7000
>>> Sending CLUSTER FORGET messages to the cluster...
>>> Sending CLUSTER RESET SOFT to the deleted node.


127.0.0.1:7000> cluster nodes
6226d1c3b6b9cb56b082bc415d15a26f5f722ec3 ::1:7005@17005 slave 2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 0 1722251950109 1 connected
2439fd5c67b4af956bc9f1ca8a8cad6a42be2dd0 ::1:7000@17000 myself,master - 0 1722251948000 1 connected 0-5460
3bb6d137b300a8b88f13ce3c6ed7f7bd9f2a41ab ::1:7004@17004 slave 16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 0 1722251950714 3 connected
8902be1a0065bf94caa05e80a28b0d9b3368bd36 ::1:7001@17001 slave 00dfee2c032583e5b555620d7eee49a1f572b805 0 1722251949000 7 connected
00dfee2c032583e5b555620d7eee49a1f572b805 ::1:7003@17003 master - 0 1722251949000 7 connected 5461-10922
16ff4b9d0247bbaa9cf103f760a90db5f36b57e7 ::1:7002@17002 master - 0 1722251950000 3 connected 10923-16383
```
- 클러스터에서 특정 노드제거
- 7006, 7007 제거 완료
- 해당 노드들이 켜저있는 상태에서 해야됨.

