# MongoDB
- 公司内学习相关, 设计node的微小后端以及数据库mongoDB, 使用的可视化软件由原本的studio 3t变为mongoDB compass 
- 笔记初始下没有大纲,随记随整理,后续会优化
- 业务: 图片处理, 文件读取等

下载了mongosh(仅本用户) mongodb8.2版本

## MongoDB下载配置
- ==**为了适配mongodb compass(可视化工具GUI),现阶段MongoDB已经升级为8.2版本(8.x)**==
- 几个重要的部分: (都按默认的版本来,即最新最稳定的版本)
  - ==MongoDB==: 数据库,下载完成后,可以配置全局环境变量,方便后续启动数据库 
  - ==Mongosh shell:== 可以直接操作mongodb数据库的命令行交互工具, 可以单独下载, 推荐`.msi`,它会自动配置系统环境变量
  - ==FPV:== FPV 本质是数据库内核的动态能力调节器，它决定了数据库可以使用的特性和功能。当 MongoDB 升级后，为了确保旧版客户端或驱动能够继续正常工作，不会因为新版本的某些特性而导致兼容性问题，就需要通过设置 FPV 来暂时禁用一些新特性。比如某高校图书馆系统使用古老的 Python 2.7+PyMongo 3.4 驱动，直接升级 MongoDB 至 7.0，驱动会因无法识别新协议而崩溃，此时将 FPV 设为 4.2（驱动支持的版本），系统即可无痛运行。
    > **更新 MongoDB 前要先更新 FPV 的原因**：如果不先更新 FPV，直接更新 MongoDB 版 本，可能会导致数据库使用了新版本的特性，但旧的客户端或驱动并不支持这些特性，从而引发兼容性问题，导致应用程序无法正常连接数据库或执行操作。先更新 FPV 可以让数据库在升级后仍然保持与旧客户端或驱动的兼容性，确保系统能够平稳过渡到新版本。同时，FPV 的更新也需要按照一定的顺序进行，不能直接从一个较低的版本设置到一个较高的版本，需要逐步升级，以避免出现不兼容的情况。==主要为了保证本地数据库内的数据兼容性问题,如果只是自己测试玩玩,数据本身没有重要性,可以忽略掉,直接升级一步到位,不过之前版本下创建的数据库集合就不建议使用了,删除掉吧==
  > 后续设置全局变量后,通过`mongod --verion`和`mongosh --verison`来确定是否安装成功和版本信息
- mongosh示意图: 
  [![pVbQJTU.png](https://s21.ax1x.com/2025/10/12/pVbQJTU.png)](https://imgchr.com/i/pVbQJTU)
## MongoDB启动配置
- db有一个开机自启动的服务器,存储路径就是db安装路径: `C:\Program Files\MongoDB\Server\8.2\data`, 这个默认启动的服务器数据库数据地址就在这个文件夹内部,同时自启动的服务器会占用端口27017,所以当自定义数据存储位置,比如D盘的某个位置,假z设为`D:\mongdb\stuDB`,如果想以这个文件夹作为目录,启动命令如下
  - 1.可以直接进入这个mongdb文件夹使用相对路径启动服务器
  - 2.也可以在全局用绝对路径启动(环境变量已经设置)
  > ==重点是设置好不同的端口号,以防止后续出现端口冲突问题==,最终选择使用方法2,指令如下:`mongod --dbpath "D:\mongdb\stuDB" --port 27018`
- 任务管理器-服务:
  [![pVbQGwT.png](https://s21.ax1x.com/2025/10/12/pVbQGwT.png)](https://imgchr.com/i/pVbQGwT)
- 检测是否正常启用以及数据库的真实路径命令如下: 
  - 连接数据库(端口默认27017): `mongosh --port XXX`
  - 检测数据库信息指令: `db.adminCommand({ getCmdLineOpts: 1 })`
- ==下面是默认数据库和自定义数据库的展示==
  - 默认服务器(开机自启动,无需mongod启动,直接连接)
    [![pVbQNY4.png](https://s21.ax1x.com/2025/10/12/pVbQNY4.png)](https://imgchr.com/i/pVbQNY4)
  - 自定义服务器(需要自启动``mongosh --port 27018``)
    [![pVbQtkF.png](https://s21.ax1x.com/2025/10/12/pVbQtkF.png)](https://imgchr.com/i/pVbQtkF)
  > ==最后强调: 先启动mongodb服务器(mongod)再连接数据库检测信息(mongodb compass或mongosh)==
## compass数据测试
- ==相对于mongosh shell,可视化工具mongodb compass更加的直观,管理数据更加方便==
- ==引入的json文件格式要求如下:==
  - 单个文档格式：如果 JSON 文件只包含一个文档，那么直接使用标准的 JSON 对象格式即可，例如：{"studentId": "2025001", "name": "张三", "age": 20}。
  - ==多个文档格式==：如果 JSON 文件包含多个文档，需要保证每个文档占一行，且不能有额外的格式化字符或分隔符。
  - 编码格式：确保 JSON 文件的编码为 UTF-8，以避免字符乱码问题。
- ==正确的格式==
  ```json
    {"studentId": "2025001", "name": "张三", "age": 20}
    {"studentId": "2025002", "name": "李四", "age": 19}
    {"studentId": "2025003", "name": "王五", "age": 21}
  ```
- ==错误的格式==
  ```json
    // 错误格式，多个文档在一行
    {"studentId": "2025001", "name": "张三", "age": 20}{"studentId": "2025002", "name": "李四", "age": 19}

    // 错误格式，使用了格式化缩进和换行
    {
        "studentId": "2025001",
        "name": "张三",
        "age": 20
    }
    {
        "studentId": "2025002",
        "name": "李四",
        "age": 19
    }
  ```
## MongoDB与MySQL的对应
-  MongoDB 与 MySQL 核心概念/操作对应表

| 对比维度         | MongoDB（文档型数据库）                          | MySQL（关系型数据库）                          | 说明与补充                                                                 |
|------------------|--------------------------------------------------|------------------------------------------------|----------------------------------------------------------------------------|
| **核心数据模型** | 文档（Document）                                 | 行（Row）                                      | MongoDB 文档以 JSON/BSON 格式存储，支持嵌套结构；MySQL 行基于表结构（Schema 固定） |
| **数据容器**     | 集合（Collection）                               | 表（Table）                                    | 集合无需预定义结构（动态 Schema），表需提前定义字段类型和约束（静态 Schema）       |
| **数据库实例**   | 数据库（Database）                               | 数据库（Database）                             | 两者均支持多数据库隔离，MongoDB 默认包含 `admin`/`local`/`config` 系统库        |
| **字段约束**     | 无强制约束（需手动通过代码/索引实现）             | 支持主键、外键、唯一、非空、默认值等约束       | MongoDB 推荐通过业务逻辑保证数据完整性，外键需手动维护；MySQL 依赖数据库约束     |
| **主键**         | `_id`（自动生成的 ObjectId，唯一标识文档）       | 主键（PRIMARY KEY，可自定义字段，如 ID）       | MongoDB `_id` 不可修改，支持手动指定（需确保唯一）；MySQL 主键可自增（AUTO_INCREMENT） |
| **索引**         | 支持单字段、复合、地理空间、文本索引等           | 支持 B-Tree、Hash、全文、空间索引等             | 两者索引逻辑类似，MongoDB 复合索引需注意字段顺序，MySQL 索引需避免过度创建       |
| **查询语言**     | MongoDB Query（类 JSON 语法，如 `find({age: 20})`） | SQL（结构化查询语言，如 `SELECT * FROM user WHERE age=20`） | MongoDB 查询更灵活（适配嵌套文档），MySQL 适合复杂关联查询                     |
| **关联查询**     | 需通过 `$lookup` 聚合操作实现（类似左连接）       | 支持 `JOIN`（INNER/LEFT/RIGHT 等）直接关联多表 | MongoDB 不原生支持外键关联，`$lookup` 性能低于 MySQL JOIN，需合理设计数据结构   |
| **插入数据**     | `db.collection.insertOne({name: "Alice"})`        | `INSERT INTO user (name) VALUES ("Alice")`     | MongoDB 插入文档无需匹配固定结构；MySQL 插入需严格符合表字段定义               |
| **更新数据**     | `db.collection.updateOne({name: "Alice"}, {$set: {age: 20}})` | `UPDATE user SET age=20 WHERE name="Alice"`    | MongoDB 支持原子更新操作符（`$set`/`$inc` 等）；MySQL 需指定完整更新字段       |
| **删除数据**     | `db.collection.deleteOne({name: "Alice"})`        | `DELETE FROM user WHERE name="Alice"`          | 两者均支持条件删除，需注意加过滤条件（否则删除全量数据）                       |
| **用户权限**     | 基于角色（如 `readWrite`/`dbAdmin`/`root`）       | 基于权限（如 `SELECT`/`INSERT`/`ALL PRIVILEGES`） | MongoDB 角色绑定数据库/集群权限；MySQL 可细化到表/字段级权限                   |
| **事务支持**     | 4.0+ 支持多文档事务（需副本集/分片集群）         | 支持 ACID 事务（InnoDB 引擎）                  | MongoDB 单文档操作天生原子性，多文档事务需满足集群环境；MySQL 事务更成熟稳定     |
| **适用场景**     | 非结构化/半结构化数据（如日志、社交、IoT）、快速迭代业务 | 结构化数据（如电商订单、金融数据）、强事务需求场景 | MongoDB 适合灵活扩展，MySQL 适合数据一致性要求高、关联复杂的业务               |

# MongoDB shell
- ==MongoDB Shell 是 MongoDB 提供的官方交互式界面，允许用户与 MongoDB 数据库进行交互、执行命令和操作数据库==。MongoDB Shell 是基于 JavaScript 的，允许用户直接在命令行或者脚本中使用 JavaScript 语言来操作 MongoDB 数据库。
## 数据库与集合
- ==基础指令(数据库与集合)==:
  - 1.连接数据库(先启动数据库) | cmd
    ```cmd
      mongosh --host <hostname> --<port>
    ``` 
    > 如果是自己的电脑上(127.0.0.1/localhost), 实际hostname可以不写; 不写port就默认27017; ==后面的操作都是在MongoDB shell内的指令==
  - 2.查看当前连接内的所有数据库
    ```shell
      show dbs
    ```
  - 3.进入数据库database (==不存在就创建==)
    ```shell
      use <database_name>
      db # 查看当前在哪一个数据库内部
    ```
  - 4.查看所有的集合collections
    ```shell 
      # 进入一个数据库后可以查看这个数据库的集合
      show collections
    ```
  - 5.创建集合
    ```shell
      # 集合名字, 集合选项(自查)
      db.createCollection(name, options)
    ```
  示例: XXXX
  - 6.删除数据库与删除集合
    ```shell
      # 进入要删除的数据库,执行下面
      db.dropDatabase()
      # 进入要删除集合的数据库,执行
      db.<collectionName>.drop() # 中间是集合名
    ```
  - 7.更新集合名
    ```shell
      db.adminCommand({
        renameCollection: "sourceDb.sourceCollection",
        to: "targetDb.targetCollection",
        dropTarget: <boolean>
      })
    ```
    1.renameCollection：要重命名的集合的完全限定名称（包括数据库名）。
    2.to：目标集合的完全限定名称（包括数据库名）。
    3.dropTarget（可选）：布尔值。如果目标集合已经存在，是否删除目标集合。(防止出现重名集合,比较危险,可能因为命名失误删除重要集合) 默认值为 false (重名就失败)。
    > db.adminCommand: 用于执行管理级命令的方法, 执行 renameCollection 命令需要具有对源数据库和目标数据库的适当权限。通常需要 dbAdmin 或 dbOwner 角色 (==数据库角色==), 如果数据库启动没有任何权限限制则不用管

## 数据库角色 (待测试)
- ==更加安全操作数据库,不同角色有不同的权限,每个数据库的角色只可操作当前数据库,对别的数据库没有操作权限==
  >
- ==一、内置角色的分类（核心类别）==
MongoDB 的内置角色按权限范围可分为以下几类，总数约 **20+ 种**（不同版本可能略有差异）：

- 1.数据库用户角色（适用于指定数据库）
  - `read`：允许读取指定数据库
  - `readWrite`：允许读写指定数据库

-  2.数据库管理角色（适用于指定数据库）
   - `dbAdmin`：数据库管理权限（如索引创建、统计信息查看等）
   - `dbOwner`：数据库所有者（包含 `readWrite`、`dbAdmin`、`userAdmin` 权限）
   - `userAdmin`：管理当前数据库的用户和角色

-  3.集群管理角色（适用于整个集群，需在 `admin` 数据库创建）
   - `clusterAdmin`：集群最高管理权限（包含 `clusterManager`、`clusterMonitor`、`hostManager`）
   - `clusterManager`：集群管理和监控权限
   - `clusterMonitor`：集群监控权限（只读）
   - `hostManager`：管理服务器（如 `shutdown`、日志查看）

-  4.备份恢复角色（适用于 `admin` 数据库）
   - `backup`：备份数据权限
   - `restore`：恢复数据权限

-  5.超级用户角色（适用于 `admin` 数据库）
   - `root`：超级权限（包含所有内置角色权限，及 `dropDatabase` 等高危操作）

-  6.其他特殊角色
   - `readAnyDatabase`：读取所有数据库（除 `local` 和 `config`，需在 `admin` 数据库创建）
   - `readWriteAnyDatabase`：读写所有数据库（除 `local` 和 `config`，需在 `admin` 数据库创建）
   - `userAdminAnyDatabase`：管理所有数据库的用户（需在 `admin` 数据库创建）


- ==二、查看所有可用角色的方法==
在 MongoDB Shell（`mongosh`）中，可以通过以下命令查看角色信息：

-  1.查看当前数据库的所有角色（包括内置和自定义）
```shell
# 切换到目标数据库（如 admin）
use admin

# 查看当前数据库的所有角色
show roles
```

-  2.查看指定数据库的角色
```shell
# 查看 test 数据库的所有角色
show roles from test
```

-  3.查看单个角色的详细权限（推荐）
```shell
# 查看 admin 数据库中 root 角色的详细信息
db.getRole("root", { showPrivileges: true, showBuiltinRoles: true })
```
- `showPrivileges: true`：显示该角色包含的具体权限
- `showBuiltinRoles: true`：即使是内置角色也显示详情

-  4.查看所有数据库的角色（需管理员权限）
```shell
# 列出所有数据库中的所有角色
db.adminCommand({ rolesInfo: 1, showBuiltinRoles: true })
```


- **说明:**
1. 内置角色的权限是固定的，自定义角色需通过 `db.createRole()` 创建。
2. 角色权限是**数据库级别的**（除集群角色外），例如在 `stuDB` 创建的 `read` 角色仅能访问 `stuDB`。
3. 超级用户角色（如 `root`）通常只在 `admin` 数据库中创建，才能获得全局权限。

- ==3. 创建用户==

- 使用 db.createUser 命令创建用户并分配角色。

- 例如，创建一个名为 testuser 的用户，密码为 123，并赋予 readWrite 和 dbAdmin 角色：
```shell
  db.createUser({
    user: "testuser",
    pwd: "123",
    roles: [
      { role: "readWrite", db: "<database_name>" },
      { role: "dbAdmin", db: "<database_name>" }
    ]
  })
```
- 4.验证用户

- 创建用户后，你可以使用 db.auth 命令验证用户身份：
```shell
db.auth("testuser", "123")
```
- ==成功后都会返回{ok: 1}==
  
- 5.启用身份验证

- 为了确保只有经过身份验证的用户才能访问 MongoDB，需要启用身份验证。编辑 MongoDB 配置文件 mongod.conf，并在其中添加以下内容：一般存在`Windows：默认路径为 C:\Program Files\MongoDB\Server\版本号\bin\mongod.cfg`和`Linux/macOS：默认路径为 /etc/mongod.conf`
- 已修改
  ```js
    security:
      authorization: "enabled"
  ```
- 然后重启 MongoDB 服务以应用更改。在任务管理器的服务栏中重启即可
- 或管理员权限的Windows（服务）：
```powershell
  net stop MongoDB
  net start MongoDB
```

- 6.使用用户身份登录

- 启用身份验证后，你需要使用创建的用户身份连接到 MongoDB：
```shell
mongosh --host <hostname> --port <port> -u "testuser" -p "password123" --authenticationDatabase "<database_name>"
```
  > 如果没有用户和密码,直接进入数据库,假如设置角色的数据库是test,那么use test进入这个数据库后,发现无法进行命令操作,例如最基础的`show dbs`,因为没有权限
- 7.特殊地,授权模式启动服务器
- ==通过`mongod --help`获取更多指令==
  ```
    # cmd: 这样启动服务器 
    mongod --dbpath "D:\mongdb\stuDB" --port 27018
    # shell: 此时服务器是没有鉴权模式的,连接后,角色失效 
    mongosh --port <port>
    # cmd: 需要打开鉴权模式 
    mongod --dbpath "D:\mongdb\stuDB" --port 27018 --auth
    # shell: 此时服务器开启鉴权模式,不通过角色登录无法使用shell功能 
    mongosh --port <port>
  ```
  > 另外地, 鉴权模式下启动的mongodb,通过compass连接的地址也需要附上用户名密码等,否则无权访问内部数据
  ```
    mongodb://用户名:密码@主机地址:端口号/认证数据库?authSource=认证数据库
    mongodb://testuser:123@127.0.0.1:27017/test?authSource=test
  ```

## CRUD
### 增
- 增删改查的增: 向集合中插入数据 (insertOne/insertMany)
  ```shell
    # collection是集合名字, document是数据, options参数(可选自查)
    db.collection.insertOne(document, options)
    db.collection.insertMany(documents, options)
  ```
- 示例: 
  ```shell
    db.myCollection.insertOne({
        name: "Alice",
        age: 25,
        city: "New York"
    });
  ```
  ```
    {
      "acknowledged": true,
      "insertedId": ObjectId("60c72b2f9b1d8b5a5f8e2b2d")
    }
  ```
  ```shell
    db.myCollection.insertMany([
        { name: "Bob", age: 30, city: "Los Angeles" },
        { name: "Charlie", age: 35, city: "Chicago" }
    ]);
  ```
  ```
    {
        "acknowledged": true,
        "insertedIds": [
            ObjectId("60c72b2f9b1d8b5a5f8e2b2e"),
            ObjectId("60c72b2f9b1d8b5a5f8e2b2f")
        ]
    }
  ```
  > 1.插入数据库别写错了集合名字,否则会创建处新的集合,然后插入数据
  > ==2.插入操作只会追加数据,自动生成_id(唯一标识),所以即使重复插入,也会被当作不同的数据对待==
- 插入优化: 如果需要插入大量文档，可以使用 insertMany() 并启用 ordered: false 选项，以提高插入性能。
  - ordered: true（默认值）：MongoDB 会按照数组中文档的顺序依次执行插入。如果中途某条文档插入失败（如违反唯一索引），则后续所有文档的插入都会被终止。
  - ordered: false：MongoDB 会并行执行插入操作（不保证按数组顺序执行），即使某些文档插入失败，也不会影响其他文档的插入。
  ```shell
    db.collection.insertMany([document1, document2, ...], { ordered: false })
  ```
  > 但是不保证数据插入是否成功,所以丢失数据也不知道

### 删（可扩展）
- 删除对标新增: `deleteOne deleteMany findOneAndDelete`, 参数也是filter和options(可选自查)，写好要删除的文档的查询条件；
  - 删除单个文档（匹配的第一个）
  ```js
    db.collection.deleteOne(<查询条件>)
  ```
  > 返回值：包含删除结果的对象（deletedCount 表示实际删除的文档数）
  - 多个(语法同理，匹配的全删)
  ```js
    db.collection.deleteMany(<查询条件>)
    // 清空数据库 慎用
    db.collection.deleteMany({})
  ``` 
  > deleteOne() 和 deleteMany() 都是==原子操作==，要么全部成功，要么全部失败（==不会部分删除==）。
- ==findOneAndDelete() 是一个原子操作方法==，用于查询并删除单个文档，同时返回被删除的文档。它结合了 “查询” 和 “删除” 两个步骤，适用于需要获取被删除文档信息的场景（如记录操作日志、确认删除内容等）
  ```js
    db.collection.findOneAndDelete(
      <查询条件>, // 筛选要删除的文档（与 find() 条件语法一致）
      <可选配置>  // 可选参数，如排序方式（sort）、投影（projection）等
    )
  ```
- 核心特性:  
  - 只删一个：即使查询条件匹配多个文档，也只会删除第一个符合条件的文档（默认按自然顺序，可通过 sort 配置调整顺序）。
  - 返回被删文档：删除成功后，会返回被删除的完整文档（区别于 deleteOne() 只返回删除数量）。
  - 支持排序：通过 sort 配置可指定删除 “符合条件的文档中排序后的第一个”（如删除最新 / 最早的文档）。
- ==3个删除==
  - findOneAndDelete()	删除单个文档 + 返回被删文档	需要获取被删除内容（如日志记录、二次确认）
  - deleteOne()	删除单个文档 + 返回删除数量（无文档内容）	只需删除，无需关心被删文档详情
  - deleteMany()	删除所有匹配文档 + 返回删除数量	批量删除多个文档

### 查
- 1.find查询: 
  ```shell
    db.collection.find(query, projection)
  ```
  - query：用于查找文档的查询条件。默认为 {}，即匹配所有文档。
  - projection（可选）：指定返回结果中包含或排除的字段。
- 实例如下：
  ···shell
    db.studentInfo.find(
      { age: { $gt: 20 } },  
      { grade: 0, _id: 0 }  
    )
  ···
  > 第一个是查询条件，第二个指定不显示的属性（0），或者指定显示的属性（1）， 只能写一种（0或1），不写就全部显示
- 2.findOne: 同理查询，但是只会返回查到符合条件的第一个结果
- ==3.关系运算符(查询最常用)==


| 操作符       | 语法示例                  | 描述                                   | 适用类型                 |
|--------------|---------------------------|----------------------------------------|--------------------------|
| `$eq`        | `{ field: { $eq: value } }` | 匹配字段值**等于**指定值               | 所有类型（数字、字符串等） |
| `$ne`        | `{ field: { $ne: value } }` | 匹配字段值**不等于**指定值             | 所有类型                 |
| `$gt`        | `{ field: { $gt: value } }` | 匹配字段值**大于**指定值               | 数字、日期、字符串（按字典序） |
| `$gte`       | `{ field: { $gte: value } }`| 匹配字段值**大于等于**指定值           | 同上                     |
| `$lt`        | `{ field: { $lt: value } }` | 匹配字段值**小于**指定值               | 同上                     |
| `$lte`       | `{ field: { $lte: value } }`| 匹配字段值**小于等于**指定值           | 同上                     |
| `$in`        | `{ field: { $in: [v1, v2, ...] } }` | 匹配字段值**等于数组中任意一个值**     | 所有类型（数组元素需与字段类型一致） |
| `$nin`       | `{ field: { $nin: [v1, v2, ...] } }`| 匹配字段值**不等于数组中所有值**       | 同上                     |


- 示例说明：
  1. 查询年龄大于 20 的学生：
    ```javascript
    db.students.find({ age: { $gt: 20 } })
    ```

  2. 查询数学成绩在 80-90 之间（含 80 和 90）的学生：
    ```javascript
    db.students.find({ "score.math": { $gte: 80, $lte: 90 } })
    ```

  3. 查询专业为「计算机科学与技术」或「软件工程」的学生：
    ```javascript
    db.students.find({ major: { $in: ["计算机科学与技术", "软件工程"] } })
    ```

  4. 查询性别不是「男」且年龄不等于 20 的学生：
    ```javascript
    db.students.find({ gender: { $ne: "男" }, age: { $ne: 20 } })
   ```


- 注意事项：
  - 比较操作符需放在字段值的对象中（如 `{ age: { $gt: 20 } }`，而非 `{ age: $gt: 20 }`）。
  - 字符串比较按字典序（如 `"apple" < "banana"`），但不建议对字符串使用 `$gt`/`$lt` 等操作符，通常用于数字和日期。
  - `$in`/`$nin` 中的数组元素类型需与字段类型一致（如字段是数字，数组元素不能是字符串）。

- ==4.逻辑运算符==
以下是 MongoDB 中常用逻辑运算符的总结表格，用于组合多个查询条件进行复杂判断：

| 操作符       | 语法示例                                  | 描述                                                                 | 适用场景                                   |
|--------------|-------------------------------------------|----------------------------------------------------------------------|--------------------------------------------|
| `$and`       | `{ $and: [ {条件1}, {条件2}, ... ] }`      | 匹配**同时满足所有条件**的文档（逻辑“与”）                           | 需要多个条件同时成立时                     |
| `$or`        | `{ $or: [ {条件1}, {条件2}, ... ] }`       | 匹配**至少满足一个条件**的文档（逻辑“或”）                           | 多个条件中满足任意一个即可                 |
| `$not`       | `{ field: { $not: { 条件 } } }`            | 匹配**不满足指定条件**的文档（逻辑“非”，对条件取反）                 | 对单个条件进行否定                         |
| `$nor`       | `{ $nor: [ {条件1}, {条件2}, ... ] }`      | 匹配**所有条件都不满足**的文档（逻辑“或非”，对 `$or` 结果取反）       | 多个条件中一个都不满足时                   |


- 示例说明：
1. **`$and` 示例**：查询年龄大于 20 且专业为“计算机科学与技术”的学生
   ```javascript
   db.students.find({
     $and: [
       { age: { $gt: 20 } },
       { major: "计算机科学与技术" }
     ]
   })
   ```
   *注：简单的“与”条件可简化为 `{ age: { $gt: 20 }, major: "计算机科学与技术" }`*


2. **`$or` 示例**：查询年龄小于 19 或成绩（数学）大于 90 的学生
   ```javascript
   db.students.find({
     $or: [
       { age: { $lt: 19 } },
       { "score.math": { $gt: 90 } }
     ]
   })
   ```


3. **`$not` 示例**：查询年龄不大于 22 的学生（即年龄 ≤ 22）
   ```javascript
   db.students.find({
     age: { $not: { $gt: 22 } }  // 等价于 { age: { $lte: 22 } }
   })
   ```


4. **`$nor` 示例**：查询既不是大三（grade=3）也不是女生（gender="女"）的学生
   ```javascript
   db.students.find({
     $nor: [
       { grade: 3 },
       { gender: "女" }
     ]
   })
   ```

- 注意事项：
  - 逻辑运算符的参数是**条件数组**（即使只有一个条件，也需放在数组中）。
  - ==`$and` 可省略的场景：当多个条件用逗号分隔时，默认就是“与”逻辑（如 `{ a: 1, b: 2 }` 等价于 `{ $and: [ {a:1}, {b:2} ] }`）==。
  - `$not` 作用于**整个条件**，而非单个字段（例如可用于否定正则表达式匹配）。
  - 复杂查询中可嵌套使用逻辑运算符（如 `$and` 中包含 `$or`），实现多维度条件判断。
### 查-操作符（拓）

- 1.元素操作符
  - `$`exists	字段是否存在	{ email: { $exists: true } } → 存在 email 字段
  - `$`type	字段值的类型	{ age: { $type: "number" } } → age 是数字类型
- 2.数组操作符
  - `$`all	数组包含所有指定元素	{ tags: { $all: ["js", "css"] } } → tags 数组同时包含 "js" 和 "css"
  - `$`elemMatch	数组中至少有一个元素满足所有条件	`{ scores: { $elemMatch: { $gt: 80, $lt: 90 } } }` → scores 数组中存在 80-90 之间的元素
  - `$`size	数组长度等于指定值	{ hobbies: { $size: 3 } } → hobbies 数组有 3 个元素
- 3.其他常用操作符
  - `$`regex：正则匹配（已讲），如 `{ name: { $regex: "^A", $options: "i" } }` → 名字以 A 开头（忽略大小写）。
  - `$`text：文本搜索（需先创建文本索引），如 `{ $text: { $search: "mongodb tutorial" } }` → 搜索包含指定关键词的文档。
  - `$`expr：使用聚合表达式在查询中计算，如 `{ $expr: { $gt: ["$score", "$passLine"] } }` → 比较两个字段的值。


### 改
- 1.`db.collection.updateOne()`: 参数为 query(条件)，update(更新操作符+更新内容) options（更新选项）
  ```js
    db.myCollection.updateOne(
      { name: "Alice" },                // 过滤条件
      { $set: { age: 26 } },            // 更新操作
      { upsert: false }                 // 可选参数
    );
  ```
  > 不同的api返回的值不同,比如上面更新成功后会显示如下
    ```js
        {
          acknowledged: true,
          insertedId: null,
          matchedCount: 1,
          modifiedCount: 1,
          upsertedCount: 0
        }
    ```
- ==还有常见的api==：`updateMany()、replaceOne() 和 findOneAndUpdate()`； 另外的：returnDocument：在 findOneAndUpdate 中使用，指定返回更新前 ("before") 或更新后 ("after") 的文档
- ==1.常见地options==
  - upsert: true=更新查询的数据不存在就插入更新内容
  - arrayFilters: 数组条件筛选并更新
  ```js
    {
      _id: 1,
      name: "小明",
      age: 18,
      scores: [ // 核心：scores 是数组，数组元素是对象
        { subject: "数学", score: 85, passed: true },  // 分数≥60，原本已通过
        { subject: "英语", score: 58, passed: true },  // 分数<60，需要更新 passed 为 false
        { subject: "语文", score: 45, passed: true },  // 分数<60，需要更新 passed 为 false
        { subject: "物理", score: 72, passed: true }   // 分数≥60，不更新
      ]
    }

    // 更新数组中 "scores.score" < 60 的元素，将其 "passed" 设为 false
    db.students.updateOne(
      { _id: 1 },
      { $set: { "scores.$[elem].passed": false } },
      { arrayFilters: [{ "elem.score": { $lt: 60 } }] }
    );
  ```
  - ==解释：`scores.$[elem].passed`关键语法==
    - scores：要操作的数组字段名; 
    - $[elem]：数组筛选占位符（elem 是自定义的变量名，你也可以叫 item/scoreItem 等），表示 “满足 arrayFilters 条件的数组元素
    - 整体含义：给 scores 数组中，所有符合 elem 筛选条件的元素，把 passed 设为 false
  - ==arrayFilters：数组类型，里面是筛选规则对象，用于定义 $[elem] 要匹配的条件==
    - **elem 对应前面的占位符 $[elem]（变量名必须一致！）**
    - elem.score：表示 “数组元素中的 score 字段, $lt: 60：小于 60（MongoDB 的比较操作符）
    - 整体含义：$[elem] 只匹配 scores 数组中 score < 60 的元素。
  - ==核心==
    - ==占位符与筛选器的关联==：$[变量名] 必须和 arrayFilters 中的 变量名.字段 对应（比如这里的 elem 统一）
    - ==批量更新数组元素==：如果数组中有多个元素符合筛选条件，会 批量更新所有匹配的元素（比如这里同时更新英语和语文），无需循环； 对比传统写法：如果没有 arrayFilters，用 `$` 占位符只能更新数组中 第一个匹配查询条件的元素（比如 scores`.$.`passed 只能改英语，改不了语文），而 arrayFilters 可以批量更新所有符合条件的元素。
    - 原子操作： 找到_id用户数据，一次性修改所有数组符合条件的元素
  - collation： 指定字符串比较规则，比如大小写
    ```js
      // 强制使用 "email" 索引查询并更新
      db.users.updateOne(
        { email: "user@example.com" },
        { $set: { status: "active" } },
        { hint: "email_1" } // 指定索引名称
      );
    ```
  - hint: 强制 MongoDB 使用指定的索引进行查询，优化更新操作的性能; 索引相关了解
  - session： ？
- ==2.常见的更新操作符==
  - 2.1 字段操作符
  - $set: 修改字段
  - $unset: 删除指定字段
    ```js
      db.users.updateOne(
        { _id: 1 },
        { $unset: { age: "" } } // 值可以是任意类型（通常用空字符串）
      );
    ```
  - $rename: 重命名字段
    ```js
      db.users.updateOne(
        { _id: 1 },
        { $rename: { "name": "username", "address.city": "address.urban" } }
      );
    ```
  - 2.2 数值操作符
  - $inc: 自增自减， 示例：给商品库存减 1，销量加 1
    ```js
      db.products.updateOne(
        { _id: 100 },
        { $inc: { stock: -1, sales: 1 } }
      );
    ```
  - $mul: 乘法运算
    ```js
      db.products.updateOne(
        { _id: 100 },
        { $mul: { price: 1.2 } }
      );
    ```
  - 2.3 数组操作符 `$push $pop $pull $addToSet` .....
  - 2.4 条件操作符 `$setOnInsert $currentDate` ..... 
### 改-操作符（拓）
- 更新操作通过 updateOne()、updateMany() 等方法执行，核心是通过更新操作符（以 `$` 开头）定义字段的修改逻辑，常用操作符如下：
  - ==`$set`	设置字段值（新增或覆盖现有字段）==	{ $set: { age: 25, status: "active" } } → 将 age 设为 25，status 设为 active
  - `$unset`	删除指定字段	{ $unset: { address: 1 } } → 删除 address 字段
  - `$inc`	对数字字段进行增减（原子操作）	{ $inc: { score: 10, views: 1 } } → score+10，views+1
  - `$mul`	对数字字段进行乘法运算	{ $mul: { price: 0.9 } } → 价格乘以 0.9（打 9 折）
  - `$rename`	重命名字段	{ $rename: { "oldName": "newName" } } → 将 oldName 改名为 newName
- 2.数组更新
  - `$`push	向数组添加元素（可配合 `$`each 批量添加）	`{ $push: { tags: { $each: ["js", "css"] } } }` → 向 tags 数组添加两个元素
  - ==`$`addToSet	向数组添加元素（去重，已存在则不添加）==	{ $addToSet: { hobbies: "reading" } } → 仅当 hobbies 中没有 reading 时添加
  - `$`pop	删除数组首尾元素（1 删尾，-1 删首）	{ $pop: { scores: 1 } } → 删除 scores 数组最后一个元素
  - `$`pull	删除数组中符合条件的元素	`{ $pull: { scores: { $lt: 60 } } }` → 删除 scores 中小于 60 的元素
  - `$`pullAll	删除数组中与指定值匹配的所有元素	{ $pullAll: { tags: ["old", "useless"] } } → 删除 tags 中的两个元素
- 3.其他
  - ==`$`currentDate	将字段值设为当前时间（Date 类型）==	{ $currentDate: { lastLogin: true } } → lastLogin 设为当前时间
  - `$`min	仅当新值小于当前值时更新	{ $min: { score: 80 } } → 若当前 score>80，则更新为 80，否则不变
  - `$`max	仅当新值大于当前值时更新	{ $max: { level: 5 } } → 若当前 level<5，则更新为 5，否则不变

## 排序与分页
- 排序语法： `db.collection.find({...}).sort({ field1: 1, field2: -1 })`
  > 排序为 1升-1降
  > 记住是先查出数据再排序
  > ==注意: MongoDB 在执行排序时会对查询结果进行排序，因此可能会影响性能，特别是在大型数据集上排序操作可能会较慢。如果排序字段上有索引，排序操作可能会更高效。在执行频繁的排序操作时，可以考虑创建适当的索引以提高性能。==
- 分页： 
  ```js
    // 跳过前 10 个文档(documnet,即10行数据)，返回接下来的 10 个文档
    db.myCollection.find().skip(10).limit(10);
  ```
- ==多个排序的情况==
  ```js
    $sort: { { time: -1, sort: 1 }} 
  ```
  > ==先根据time降序，在time相同的情况下，可以继续根据sort升序排列==
## 优化的跳页(待)
- skip跳页的数据太多，比如上千页，可能比较慢，可以尝试使用时间索引实现快速跳页，需要前端传递一些数据
- ==由于依靠锚点定位，所以不支持直接跳转到某页，同时在千/万页进行数据查看跳转的实际应用很少所以暂时不记了==



## 索引
- 可以把 MongoDB 的索引理解成 图书馆的「图书目录」，这样就很好懂了：
- ==1.什么是索引？==
  假设你去图书馆找一本关于「MongoDB 索引」的书：
  如果没有目录（无索引），你得从第一排书架开始一本本翻，直到找到目标书，效率极低（全表扫描）。
  如果有目录（有索引），你可以直接查目录，找到这本书所在的书架编号和位置，直接过去取，瞬间搞定（精准定位）。
  在 MongoDB 中，索引就是给集合（表）中的字段创建的「目录」，它单独存储了字段的值和对应文档的位置信息，避免了查询时扫描整个集合。
- ==2.索引的作用？==
  加速查询（核心作用）就像查目录比翻全馆书快，带索引的查询能跳过无关文档，直接定位到符合条件的数据。比如查询 age: 25 时，有 age 索引就不用遍历所有文档，直接找 age=25 的位置。
  优化排序如果需要按某个字段排序（比如 db.students.find().sort({score: -1})），没有索引的话，MongoDB 会先查所有数据再排序（内存中排序）；有索引的话，索引本身是有序的，直接按索引顺序取数据即可，速度极快。
- ==3.举个反例：没有索引会怎样？==
  假设你的 students 集合有 100 万条数据，想查 major: "计算机科学" 的学生：
  无索引：MongoDB 会逐行检查这 100 万条文档的 major 字段，像翻字典从头找某个词，耗时可能几秒甚至更久。
  有索引：MongoDB 直接查 major 字段的索引表，瞬间找到所有「计算机科学」对应的文档位置，耗时可能只有几毫秒。
- ==注意点（和图书馆目录的区别）==：
  索引会占用额外空间（目录本身也要占几页纸），不是越多越好。
  增删改数据时，索引会同步更新（比如新书上架要更新目录），所以过多索引会拖慢写操作。
  总结：索引是「用空间换时间」的典型设计，合理创建索引能让查询效率提升几十到几千倍。
- ==创建索引createIndex函数:== `db.collection.createIndex( keys, options )`
  - db：数据库的引用。
    collection：集合的名称。
    keys：一个对象，指定了字段名和索引的排序方向（1 表示升序，-1 表示降序）。
    options：一个可选参数，可以包含索引的额外选项。
    - options 参数是一个对象，可以包含多种配置选项，以下是一些常用的选项：
      - unique：如果设置为 true，则创建唯一索引，确保索引字段的值在集合中是唯一的。
      - background：如果设置为 true，则索引创建过程在后台运行，不影响其他数据库操作。
      - name：指定索引的名称，如果不指定，MongoDB 会根据索引的字段自动生成一个名称。
      - sparse：如果设置为 true，创建稀疏索引，只索引那些包含索引字段的文档。
      - expireAfterSeconds：设置索引字段的过期时间，MongoDB 将自动删除过期的文档。
      - v：索引版本，通常不需要手动设置。
      - weights：为文本索引指定权重。
  ```js
    // 创建唯一索引
    db.collection.createIndex( { field: 1 }, { unique: true } )

    // 创建后台运行的索引
    db.collection.createIndex( { field: 1 }, { background: true } )

    // 创建稀疏索引
    db.collection.createIndex( { field: 1 }, { sparse: true } )

    // 创建文本索引并指定权重
    db.collection.createIndex( { field: "text" }, { weights: { field: 10 } } )
  ```
- ==如何建立合适的索引==
  - 总结：索引创建的「黄金法则」
  - 查询多、修改少」的字段优先建索引；
  - 「区分度高」的字段比「重复度高」的字段更适合；
  - 多条件查询用「复合索引」，字段顺序按「查询频率」排序；
  - 索引不是越多越好，够用就行（过多索引会拖慢插入 / 更新 / 删除操作， 因为更新数据索引也会跟着改变）。
- ==不合适建立索引的情况==
  - 查询极少的字段：比如「学生的家庭住址」，一年都查不了一次，建索引只会浪费空间（类似给图书馆里没人查的书做目录）。
  - 重复度极高的字段：比如 gender（男 / 女 / 其他）、isStudent（true/false），索引无法有效过滤数据，查询效率提升有限。
  - 频繁修改的字段：比如「学生的在线状态」（每秒更新），修改字段时需要同步更新索引，会拖慢写操作（类似图书馆里的书频繁换位置，目录要天天改，反而麻烦）。
  - 值长度过大的字段：比如「学生的个人简介」（几千字），索引会占用大量空间，查询时也会变慢（类似目录里写满了书的内容，而不是简单的关键词）。
  - 小集合字段：如果集合只有几百条数据，全表扫描比查索引还快（类似只有几本书的小书店，直接翻找比查目录更省事）
  >
- ==适合创建索引的 6 类字段（附场景）==
  1. 「查询条件字段」（最常用，对应 find() 中的 query 条件）
  类比：图书馆中大家最常按「书名」「作者」查书，这两个字段就该做目录。场景：如果经常用某个字段过滤数据（比如 where 条件），就适合建索引。
  示例：
  经常查 major: "计算机科学"（专业）、age: 20（年龄）、gender: "男"（性别），这些字段可以建索引。
  代码示例（创建单字段索引）：
    ```js
      db.students.createIndex({ major: 1 }); // 1=升序，-1=降序（单字段索引中影响不大）
      db.students.createIndex({ age: 1 });
    ```
  2. 「排序字段」（对应 sort() 中的字段）
  类比：如果大家经常需要按「出版年份」排序找书，图书馆会给「出版年份」做专门的有序目录，避免找完书再手动排序。场景：查询时需要用 sort() 排序的字段，建索引后排序速度会大幅提升（索引本身是有序的，不用额外排序）。
  示例：
  经常执行 db.students.find().sort({ score.programming: -1 })（按编程成绩降序），就给 score.programming 建索引。
  代码示例（嵌套字段索引）：
  ```js
    db.students.createIndex({ "score.programming": -1 }); // 排序字段建议和索引排序方向一致
  ```
  3. 「区分度高的字段」（值不重复 / 重复少的字段）
  类比：「ISBN 编号」（每本书唯一）比「出版社」（很多书同一出版社）区分度高，按 ISBN 查书能精准定位，按出版社查还是要翻一堆书。场景：字段的值越独特，索引的查询效率越高。比如「姓名」（重复少）比「性别」（只有男 / 女 / 其他，重复极多）更适合建索引。
  反例：给 gender 建索引意义不大 —— 即使有索引，查询 gender: "男" 还是要返回一半数据，索引无法大幅减少扫描量（类似按「性别」查图书馆目录，还是要找半馆书）。
  正向示例：给 studentId（学号，唯一）、email（邮箱，唯一）建索引，查询时能瞬间定位到单个文档。
  代码示例（唯一索引，确保字段值不重复）：
  ```js
    db.students.createIndex({ studentId: 1 }, { unique: true }); // 唯一索引，避免重复学号
  ```
  4. 「多条件查询的前缀字段」（复合索引场景）
  类比：如果大家经常按「分类 + 书名」查书（比如「计算机类 + MongoDB 索引」），图书馆会做一个「分类 - 书名」的组合目录，不用先查分类再查书名。场景：经常用多个字段组合查询（比如 major: "计算机科学" + grade: "大二"），可以创建「复合索引」，但要注意字段顺序（高频查询的字段放前面）。
  示例：
  经常执行 db.students.find({ major: "计算机科学", grade: "大二" })，创建复合索引 { major: 1, grade: 1 }。
  注意：复合索引遵循「前缀匹配原则」—— 比如索引 { a:1, b:1, c:1 } 能匹配 a、a+b、a+b+c 的查询，但不能匹配 b、b+c 的查询（类似目录只按「分类 - 书名」排序，不能直接按「书名」查）。
  代码示例（复合索引）：
  ```js
    db.students.createIndex({ major: 1, grade: 1 }); // 高频查询字段放前面
  ```
  5. 「文本搜索字段」（需要模糊匹配的字段）
  类比：如果大家经常按「关键词」搜书（比如 “MongoDB 入门”），图书馆会做一个「关键词索引」，而不是让你翻所有书的内容。场景：需要用`$`text 做模糊搜索的字段（比如搜索学生姓名、专业描述中的关键词），可以创建文本索引。
  示例：
  想通过关键词搜索学生（比如 db.students.find({ `$`text: { $search: "计算机 编程" } })），给 name、major 字段创建文本索引。
  代码示例（文本索引）：
  ```js
    db.students.createIndex({ name: "text", major: "text" }); // 支持多字段联合文本搜索
  ```
  6. 「聚合管道中的过滤 / 排序字段」（对应 `$`match/`$`sort）
  类比：如果图书馆需要统计「2020 年后出版的计算机类书籍数量」，提前给「出版年份 + 分类」做索引，统计时不用翻全馆书。场景：聚合查询（aggregate()）中，`$`match（过滤）和 `$`sort（排序）阶段用到的字段，建索引能加速聚合过程。
  示例：
  聚合查询:
  ``` 
    db.students.aggregate([{ $match: { major: "计算机科学" } }, { $sort: { age: 1 } }])，给 major 和 age 建索引（或复合索引 { major:1, age:1 }）。
  ```
### 复合索引
- ==复合索引可以更好缩小范围，查询速度会更快一些==
- 比如下面的查询条件:
  ```js
    "query": {
        "character_name": "Camila",
        "model_id": "mistralai/mistral-nemo",
        "character_uuid": "60828cda-56d9-4402-8f5c-aaa757a2416d",
        "createdAt": {
            "$gte": "2025-08-02T16:00:00.000Z",
            "$lte": "2025-09-10T16:00:00.000Z"
        },
        "messageCount": {
          "gte": 10,
          "lte": 20
        }
    }
  ```
- ==mongoDB查询逻辑与单字段索引的问题==：当查询包含多个条件（如character_name、model_id、createdAt等），且每个字段都有单独的单字段索引时，数据库（以 MongoDB 为例）
  - ==无法同时使用多个单字段索引==（或效率极低）： 数据库通常会选择 “最优” 的一个单字段索引（如区分度最高的字段，比如character_uuid，因为 UUID 几乎唯一），用它过滤出一部分文档后，再对剩余文档逐条检查其他条件
- ==联合查询的优势==: `db.col.createIndex(character_uuid: 1,model_id: 1,character_name: 1,createdAt: 1)`, 为表达简便，用`{a: 1, b:1, c:1, d:1}`暂时代替, ==符合左连缀格式，如下== 
    - 依次匹配 a->b->c->d，比如进行匹配，a=x(缩小范围) -> b=y（基于a=x查询到的数据）-> c=z(同理,基于a=x&b=y) -> d > 30 (基于a=x&b=y&c=z查的数据范围)， 通过依次匹配，最后查询d范围时的数据已经很少了，加快了速度； 而直接从a到d中随机获取一个辨识度最高的索引（比如a），进行一次性范围缩小，这样筛出的数据肯定比多次筛选的数据要多一些，然后再在这些数据中比对（bcd），整体时间会更长
  - ==左连缀规则:==
    - 查询时最左侧字段必须存在，即a必须存在，否则无法进入复合索引
    - 遵循左连缀连续查询，不可以跳过（a->c->d）；少了无所谓（a->b->c, 无d）
    - ==精确匹配可以缩小范围，但是范围匹配后续的字段无法再次缩小范围==， 
      - 例如：查询 { a: { `$`gt: x }, b: y }, 通过a > x缩小到一个候选范围（但这个范围里a的值是不固定的）,由于a是范围查询，索引中b的排序是 “a相同前提下的排序”，现在a的取值是一个范围（不同的a），b的排序在整个候选范围内是无序的，无法通过b = y缩小范围，只能扫描候选范围，逐个判断b是否等于y。
      - ==即只有最左字段是 “精确匹配”（=、`$`eq）时，后续字段才能通过索引排序继续缩小范围；最左字段是范围查询时，后续字段的索引相当于失效==
- ==多个范围查询下的复合索引查询问题(不同索引顺序的效果对比)==
  - 1. 顺序1：精确字段 → createdAt（范围） → messageCount（范围）
    ```
      // 索引：{ character_uuid: 1, model_id: 1, createdAt: 1, messageCount: 1 }
    ```
    - 先通过character_uuid和model_id（精确匹配）快速缩小范围；
    - 再通过createdAt（范围查询）进一步缩小范围，但此时createdAt是范围查询，后续的messageCount无法利用索引
    - 最终需要对createdAt筛选后的文档逐条检查messageCount，若该范围仍较大（==如 1 万条==），则耗时较高（==但比全表(共5万条)扫描好==）
    - ==结论：messageCount无法利用索引，但前面的精确字段和createdAt已大幅缩小范围，不是全表扫描，只是messageCount的筛选仍有开销。==

  - 2. 顺序2：精确字段 → messageCount（范围） → createdAt（范围）
    ```
      // 索引：{ character_uuid: 1, model_id: 1, messageCount: 1, createdAt: 1 }
    ```
    - 先通过character_uuid和model_id（精确匹配）快速缩小范围；
    - 再通过messageCount（范围查询）进一步缩小范围，此时messageCount可利用索引；
    - 最后通过createdAt（范围查询）筛选，但createdAt在范围查询字段messageCount之后，无法利用索引
    - 最终对messageCount筛选后的文档逐条检查createdAt，若messageCount的筛选效果好（==如仅剩 100 条==），则createdAt的逐条检查开销极小
    - ==优先让messageCount（替代$expr的核心条件）利用索引，即使createdAt无法利用索引，整体效率也更高（因为messageCount的筛选通常更关键）。==
  - ==**3.关键总结**==
    - 当存在多个范围查询字段时，应将筛选性更强、更核心的范围字段放在前面，让它优先利用索引，即使后续的范围字段失效，整体效率也更优：
      - 若messageCount的筛选性更强（如能将范围从 10 万条缩小到 100 条），则让它在索引中位于createdAt之前，优先利用索引；
      - 若createdAt的筛选性更强（如时间范围极窄，能缩小到 100 条），则让createdAt在前，messageCount在后。
    - ==这种情况下，不会出现全表扫描，因为前面的精确字段和第一个范围字段已大幅缩小范围，只是后续的范围字段无法利用索引，需要在缩小后的范围内逐条检查（开销可控）。==
- ==拓展：索引交集==
  - 虽然mongodb无法自己整合多个单独的索引，但是有时会采用索引交集方式查询数据，这个速度也是很快的
  比如下面的查询,这两个字段都有单独的索引，没有联合索引
  ```js
    "query": {
          "character_name": "Camila",
          "model_id": "mistralai/mistral-nemo"
      }
  ```
  - 优化器会分别评估使用这两个索引单独查询的成本（如匹配文档数量、索引大小等），并判断是否可以通过 索引交集 来组合两个索引的结果，以获得更高效的查询。
- ==索引交集的流程==
  - 第一步：使用 character_name: "Camila" 对应的索引，快速定位所有 character_name 为 "Camila" 的文档 索引条目（包含文档的 _id 和索引字段值）。
  - 第二步：使用 model_id: "mistralai/mistral-nemo" 对应的索引，快速定位所有 model_id 为目标值的文档 索引条目。
  - 第三步：计算两个结果集的交集（通过 _id 匹配），得到同时满足两个条件的文档 _id 列表。
  - 文档获取: 根据交集得到的 _id 列表，到集合中读取完整的文档数据（即 fetch 阶段）。

### 多键索引
- 多键索引（Multikey Index） 是一种特殊的索引类型，==用于优化对数组字段或包含数组元素的文档的查询性能==。当索引字段的值为数组时，数据库会为数组中的每个元素单独创建索引条目，从而允许通过数组中的任意元素快速匹配和查询文档
  - 针对数组字段：多键索引仅适用于字段值为数组的场景（如 tags: ["js", "node", "db"]）。
  - 元素级索引：数据库会为数组中的每个元素生成独立的索引项，而非将整个数组作为单一键值
- 例如：
  ```json
    {
      _id: 1,
      name: "Node.js 教程",
      tags: ["javascript", "node", "backend"]  // 数组字段
    }
  ```
- 查询加速：
  ```js
    db.articles.find({ tags: "node" });  // 命中多键索引
  ```
### 全文索引
- 对文字进行索引，根据文字查询含有这个文字的文档，对英文友好，不支持中文，限制大
- 全文索引会对字段中的==文本（**英文**）进行分词处理（按空格、标点等分隔为单词）==， 内置对常见停用词（如 “the”“and”“的” 等无意义词汇）的过滤
- 创建索引(可以多个)
  ```js
    // 对 articles 集合的 content 字段创建全文索引
    db.articles.createIndex({ content: "text" });
  ```
- 全文索引
  ```js
    // 搜索包含 "MongoDB" 或 "索引" 的文档
    db.articles.find({
      $text: { $search: "MongoDB 索引" }
    });

    // 搜索包含 "MongoDB" 但不包含 "基础" 的文档（- 表示排除）
    db.articles.find({
      $text: { $search: "MongoDB -基础" }
    });

    // 搜索必须同时包含 "MongoDB" 和 "优化" 的文档（"" 表示精确匹配短语）
    db.articles.find({
      $text: { $search: "\"MongoDB 优化\"" }
    });
  ```
### 哈希索引(待)
- 哈希索引（Hashed Index） 是一种特殊的索引类型，它通过对字段值进行哈希计算（生成固定长度的哈希值）来构建索引，而非直接使用字段的原始值。哈希索引主要用于优化基于分片键的均匀数据分布，==尤其在分片集群中发挥重要作用==。

### 通配符索引
- 针对不确定的属性建立索引，以匹配“更多”的情况，这种数据库内数据的属性不统一，==特别适合处理 schema 不固定的文档（如包含大量动态键的 JSON 数据）==
- 比如，数据库内字段数据每一个属性都不同
  ```json
    // user.xxx不统一
    {
      _id: 001,
      user: {
        "name": "kkk",
        "age": 19
      }
    },
    {
      _id: 002
      user: {
        "classes": 1,
        "hobby": "goo"
      }
    }
  ```
- 通配符索引通过 $** 表示匹配任意字段或嵌套路径，基本语法：
  ```js
    // 匹配集合中所有字段（包括嵌套字段）
    db.collection.createIndex({ "$**": 1 });

    // 匹配特定前缀的字段（如以 "user." 开头的嵌套字段：user.name、user.age 等）
    db.collection.createIndex({ "user.$**": 1 });

    // 匹配数组中的所有元素（如 tags 数组的每个元素）
    db.collection.createIndex({ "tags.$**": 1 });
  ```
- ==使用场景==
  - 1. 动态字段查询
    当文档包含大量动态生成的字段（如用户自定义属性），且需要根据这些字段查询时，通配符索引可避免为每个字段单独创建索引。
    示例：文档包含动态属性 attr1、attr2...，查询 attr1: "value" 时，通配符索引可加速查询：
    ```js
      // 创建匹配所有动态属性的通配符索引
      db.products.createIndex({ "attrs.$**": 1 });

      // 查询 attrs 下的任意字段（如 attrs.color = "red"）
      db.products.find({ "attrs.color": "red" }); // 命中通配符索引
    ```
  - 2. 嵌套结构查询
      对嵌套层级不固定的字段（如多级嵌套的 address），通配符索引可匹配所有子字段，无需手动指定每个嵌套路径。
      示例：匹配 address 下的所有子字段（city、province、street 等）
      ```js
        db.users.createIndex({ "address.$**": 1 });

        // 查询 address.city = "Shanghai"
        db.users.find({ "address.city": "Shanghai" }); // 命中索引

        // 查询 address.street = "Main St"（即使 street 字段不常出现）
        db.users.find({ "address.street": "Main St" }); // 同样命中索引
      ```
  - 3. 数组元素查询
      对数组中的元素（尤其是动态数组），通配符索引可匹配数组中的所有元素，支持基于数组元素的查询。
      示例：匹配 tags 数组中的任意元素：
      ```js
        db.articles.createIndex({ "tags.$**": 1 });

        // 查询 tags 数组中包含 "mongodb" 的文档
        db.articles.find({ "tags": "mongodb" }); // 命中索引
      ```
      > 和多值索引不同的，通配符是针对数组内的所有数据，而多值索引是精确的，针对单个字段的，两者本质不同，通配符更常用于动态变化的字段
- ==注意：不兼容==
  - 1.==不支持联合索引，只能单独使用==
  - 2.不支持排序，索引体积很大
  - 3。属于稀疏索引

### 唯一属性索引
- 用于强制指定字段（或组合字段）的值在集合中唯一不重复，==防止插入或更新时出现重复数据==，类似关系型数据库中的 “唯一约束”。
- 特殊地
  - 支持多字段组合：可对多个字段创建复合唯一索引，强制组合值的唯一性
  - 空值处理：==字段值为 null 时，唯一索引会将 null 视为一个有效值，因此整个集合中只能有一个文档的该字段为 null==（如需允许多个 null，需特殊处理）
- 创建复合唯一索引（单个的留一个即可）： 
  ```js
    // 加属性unique为true即可
    db.collection.createIndex({ 字段名: 1, 字段2: 1 }, { unique: true });
  ```
### 部分索引
- 对部分符合要求的数据添加索引，不是对所有数据都添加索引
  ```js
    db.collection.createIndex(
      { 索引字段: 排序方向 }, // 索引的字段和排序（如单字段、复合字段）
      { 
        partialFilterExpression: { 过滤条件 } // 仅对满足该条件的文档创建索引
      }
    );
  ```
  > 过滤条件可以使用的表达式有：`$eq、$gt、$lt、$in、$exists` 等操作符(不支持 `$expr、$where`) 等
- 假设集合 orders 存储订单数据，其中 status 字段可能为 pending（待处理）、completed（已完成）、cancelled（已取消），==而业务中 90% 的查询都针对 status: "completed" 的订单==
- 只为 status: "completed" 的文档创建索引
  ```js
    db.orders.createIndex(
      { orderNo: 1 }, // 对 orderNo 字段创建索引
      { 
        partialFilterExpression: { status: "completed" } // 仅包含 status 为 completed 的文档
      }
    );
  ```
- 根据条件判断索引是否生效
  ```js
    // 命中部分索引（查询条件匹配 partialFilterExpression）
    db.orders.find({ status: "completed", orderNo: "ORD123" });
    // 不命中部分索引（status 不是 completed）
    db.orders.find({ status: "pending", orderNo: "ORD456" });
  ```
- ==高级用法：结合唯一索引==
- 部分索引可与唯一索引结合，仅对符合条件的文档强制唯一性。例如：“仅对 isVerified: true 的用户强制 email 唯一（未验证用户允许重复邮箱）”
  ```js
    db.users.createIndex(
      { email: 1 },
      {
        unique: true, // 唯一约束
        partialFilterExpression: { isVerified: true } // 仅对已验证用户生效
      }
    );
  ```
- ==适用场景==
  - 高频查询的子集：当查询集中在集合的某个子集（如 “已激活用户”“已完成订单”），为该子集创建部分索引，避免为全集合建索引的冗余。
  - 非空字段索引：对存在 null 或缺失值的字段，仅为非空值创建索引（通过 { field: { $exists: true } } 过滤），减少无效索引条目。
  - 示例：只为存在 phone 字段的用户创建索引：
  ```js
    db.users.createIndex(
      { phone: 1 },
      { partialFilterExpression: { phone: { $exists: true } } }
    );
  ```
### 稀疏索引
- 稀疏索引（Sparse Index） 是一种仅对包含指定索引字段的文档创建索引条目的特殊索引类型。==它会自动忽略那些不包含该字段（或字段值为 null）的文档，从而减少索引的存储体积==，优化针对 “存在特定字段” 的查询性能; ==功能单一：稀疏索引的过滤逻辑固定（仅基于字段是否存在），无法自定义其他过滤条件(这一点与部分索引不同)==
- ==稀疏索引和部分索引都能缩小索引覆盖范围，但核心差异在于过滤逻辑, **注意：部分索引的功能完全覆盖稀疏索引（例如，partialFilterExpression: { phone: { $exists: true } } 等价于稀疏索引），因此 MongoDB 推荐优先使用部分索引，除非需要兼容旧版本或场景极简单。**==

### TTL索引
- TTL 索引（Time-To-Live Index） 是一种特殊的单字段索引，用于自动删除集合中 “过期” 的文档。==它通过指定字段的时间值（日期类型），让 MongoDB 定期清理超过预设时间的文档，无需手动编写删除逻辑==。
- ==核心特性==
  - 自动过期删除：基于索引字段的时间值，文档超过指定 “存活时间（TTL）” 后会被自动删除。
  - 仅支持日期字段：==**索引字段必须是 Date 类型（如 timestamp 数字需转为 Date）**==（如 createdAt: new Date()）或包含日期的数组（仅数组第一个日期生效）。
  - 后台自动执行：MongoDB 有专门的后台线程（默认每 60 秒运行一次）检查并删除过期文档，不影响前台查询性能。
  - 不可变 TTL 配置：==创建索引后，无法修改 TTL 时间，需删除旧索引重新创建==。
- ==1.文档创建后 N 秒自动删除==
  - 场景：存储临时验证码，10 分钟（600 秒）后自动失效。
  ```js
    // 1. 创建 TTL 索引（expireAfterSeconds = 600 秒）
    db.codes.createIndex({ createdAt: 1 }, { expireAfterSeconds: 600 });

    // 2. 插入文档（createdAt 为当前时间）
    db.codes.insertOne({
      code: "123456",
      userId: 101,
      createdAt: new Date() // 日期字段，用于计算过期时间
    });

    // 效果：文档插入 10 分钟后，会被 MongoDB 自动删除
  ```
- =2.文档在指定时间点自动删除==
  - 场景：预约提醒，在 remindAt 时间点后自动删除提醒记录。
  ```js
    // 1. 创建 TTL 索引（expireAfterSeconds = 0，依赖字段本身的日期）
    db.reminders.createIndex({ remindAt: 1 }, { expireAfterSeconds: 0 });

    // 2. 插入文档（remindAt 为未来时间点）
    db.reminders.insertOne({
      userId: 101,
      content: "赚够一个亿",
      remindAt: new Date("2099-12-01T10:00:00") // 明确的过期时间点
    });

    // 效果：到 2099-12-01 10:00 后，文档自动删除
  ```
- 注意事项：
  - 1.==仅支持 Date 类型字段==或包含 Date 的数组（数组仅第一个日期生效），不支持字符串、数字等类型（==如 timestamp 数字需转为 Date==）
  - 2.==复合索引不支持==：TTL 索引只能是单字段索引，无法创建复合 TTL 索引（如 { userId: 1, createdAt: 1 } 不能设为 TTL 索引）
- ==适用场景==
  - 临时数据存储：验证码、会话信息、临时缓存（如登录态，2 小时过期）。
  - 自动清理日志：应用日志、操作记录，保留 7 天后自动删除。
  - 定时任务记录：一次性提醒、任务调度记录，执行后自动清理。
### 隐藏索引
- 它的核心特点是索引存在但不会被查询优化器自动使用，仅在显式指定时生效。这种特性主要用于索引的 ==“灰度测试” 或 “安全下线”==，避免直接删除索引带来的风险。
- 1.创建隐藏索引
  - 创建时通过 hidden: true 标记为隐藏索引：
  ```js
    db.collection.createIndex(
      { 字段名: 1 }, // 索引字段
      { hidden: true } // 标记为隐藏
    );
  ```
- 2.切换索引的隐藏状态(反向切同理)
  - 通过 collMod 命令修改已有索引的隐藏属性（无需删除重建）： 
  ```js
    // 将索引从隐藏改为可见
    db.runCommand({
      collMod: "collectionName", // 集合名
      index: {
        name: "索引名称", // 索引的名称（如 "字段名_1"）
        hidden: false // false 表示可见，true 表示隐藏
      }
    });
  ```
- ==假设集合 products 有一个隐藏索引 { category: 1 }==
  - 1.默认查询不使用隐藏索引
    ```js
      // 查询不会自动使用隐藏的 category 索引
      db.products.find({ category: "electronics" });
    ```
  - 2.显式强制使用隐藏索引：
    ```js 
      // 通过 hint() 强制使用隐藏索引（需指定索引名称或字段）
      db.products.find({ category: "electronics" }).hint({ category: 1 });
    ```
  - 3.验证索引是否隐藏：  
    ```js
      // 查看索引信息，hidden 字段为 true 表示隐藏
      db.products.getIndexes();
    ```
- 适用场景
  - ==索引下线前验证==：计划删除某个索引时，先将其隐藏，观察查询性能是否下降（若无影响，说明索引无用，可安全删除）。
  - ==新索引灰度测试==：创建新索引后先隐藏，通过 hint() 对部分查询测试其性能，确认有效后再设为可见。
  - 避免干扰查询计划：某些索引可能在特定场景下被优化器错误选择，隐藏后可排除干扰。
- 注意事项
  - 维护成本：隐藏索引仍会占用存储空间，且随数据更新而更新，若确认无用需及时删除，避免浪费资源。
  - 与删除的区别：隐藏索引是 “暂时不用”，删除是 “永久移除”；隐藏可恢复，删除需重建。
  - 不支持的索引类型：地理空间索引（2d、2dsphere）和文本索引（text）目前不支持隐藏属性。

## **explain执行计划(*)**
- ==mongodb提供了explain来帮助我们检测模型查询的效果（mysql同理）==，尤其
  - ==查询是否应用索引 - stage==
  - 索引是否减少了扫描的数量
  - 是否存在低效的查询
- explain() 是附加在查询操作后的方法， 比如 `find()、aggregate()、update()、deleteOne()`
  ```js
    // 对查询操作使用 explain
    db.collection.find(<query>).explain([verbosity])

    // 对聚合操作使用 explain
    db.collection.aggregate(<pipeline>).explain([verbosity]);
  ```
- verbosity: 
  - queryPlanner（默认）：返回查询计划的核心信息（如选择的索引、扫描方式等），不包含执行统计。
  - ==executionStats==：在 queryPlanner 基础上，增加实际执行的统计数据（==如扫描文档数、执行时间等==）
  - allPlansExecution：返回所有候选查询计划的执行统计（用于分析 MongoDB 为何选择某一计划）
- 例：executionStats数据展示：
  ```json
    "executionStats": {
        "executionSuccess": true,
        "nReturned": 3, // 返回数据
        "executionTimeMillis": 1, // 总执行时间 毫秒
        "totalKeysExamined": 0, // 索引扫描次数(为0代表索引未被使用，需优化)
        "totalDocsExamined": 3, // 文档扫描次数
        "executionStages": {
            "isCached": false,
            "stage": "SORT", // 阶段
            "nReturned": 3,
            "executionTimeMillisEstimate": 0, // 检索文档耗时
            "works": 8,
            "advanced": 3,
            "needTime": 4,
            "needYield": 0,
            "saveState": 0,
            "restoreState": 0,
            "isEOF": 1,
            "sortPattern": {
                "createdAt": -1
            },
            "memLimit": 104857600,
            "limitAmount": 10,
            "type": "simple",
            "totalDataSizeSorted": 21332,
            "usedDisk": false,
            "spills": 0,
            "spilledRecords": 0,
            "spilledBytes": 0,
            "spilledDataStorageSize": 0,
            "inputStage": { // 嵌套阶段 描述子stage，为父stage提供文档和索引
                "stage": "COLLSCAN", // 阶段
                "filter": { // 查询语句
                    "$and": [
                        {
                            "createdAt": {
                                "$lte": "2025-10-20T16:00:00.000Z"
                            }
                        },
                        {
                            "createdAt": {
                                "$gte": "2025-01-01T16:00:00.000Z"
                            }
                        }
                    ]
                },
                "nReturned": 3, // 返回数据数
                "executionTimeMillisEstimate": 0, // 检索文档耗时
                "works": 4,
                "advanced": 3,
                "needTime": 0,
                "needYield": 0,
                "saveState": 0,
                "restoreState": 0,
                "isEOF": 1,
                "direction": "forward",
                "docsExamined": 3
            }
        },
        "allPlansExecution": []
    },
  ```
- ==重要信息解析==
- 1.stage: 
  - ==COLLSCAN==：全集合扫描（未使用索引，性能差，需优化）。
  - ==IXSCAN==：索引扫描（使用索引，性能较好）。
  - FETCH：根据索引（子stage）结果读取文档（常与 IXSCAN 配合）。
  - LIMIT/SORT：对应查询中的 limit() 或 sort() 操作。
- ==执行计划尽量不要出现的stage==
  - ==collscam==： 全表扫描，代表你的查询十分低效，需要加索引或优化索引
  - ==sort==: 查询需要对结果进行排序，但无法利用索引完成排序，只能在内存中对扫描到的文档进行排序,若排序的数据量超过内存限制（由 internalQueryExecMaxBlockingSortBytes 控制，默认 100MB），会触发磁盘临时文件排序，性能急剧下降, ==创建包含排序字段的索引（如查询条件 + 排序字段的复合索引）, 即要给查询出的结果数据字段添加索引，比如最终查询出的字段为createAt，则给这个字段添加索引，查询结束后自动根据索引排序==
  - ==HASH_JOIN==（哈希连接）
    含义：多集合关联查询（如 `$`lookup）时，使用哈希表进行连接，未利用索引。
    问题：需要将关联字段的所有值加载到内存构建哈希表，数据量大时内存占用高，且连接效率低。
    优化：为 `$`lookup 的关联字段（如 localField 和 foreignField）创建索引，使关联操作通过索引匹配（此时可能转为更高效的索引连接）。


## $expr（可扩展）
- `$expr`可以写数据库操作符(比如`$lt $gt $size $add ...`)，处理复杂的，可能需要计算的，跨字段的数据比较等; ==内部运算符写法与常规不相同==
  ```js
     /**
      * $expr内部的操作符， 处理复杂的，可能需要计算的，跨字段的数据比较等 
          $lt: [field1, field2].   $lt: ["$score.math", "$score.english"] (field需要加$)
      * 常规操作符，处理简单的，固定值比较，不跨字段的数据等 
          field：字段 value： 值
          比如: field: { $lt: value }.   price: { $lt: 200 }
      *   
      */

      // 单个字段
      db.students.find( {"score.math": {$gt: 85}, "score.math": {$lt: 90}} )

      // 跨字段，比较不同学科成绩，数学/英语
      db.students.find({
        $expr: {
          $lt: ["$score.math","$score.english"] // 数学 < 英语
        }
      })
  ```
- ==需要注意的点==
  - ==`$`expr内部的操作运算符: 形如`$`size这种需要计算的==，如果针对大体量数据查询，会在每个符合条件的数据中进行运算，比如下面的数据`$`messages是一个数组，那么在进行查询比较时，会对每条数据的messages数组长度进行获取，然后进行比对，==由于无法进行索引查询，这是很耗时的==
  ```js
    "query": {
      "createdAt": {
          "$gte": "2025-01-01T16:00:00.000Z",
          "$lte": "2025-10-20T16:00:00.000Z"
      },
      "$expr": {
          "$gt": [
              {
                  "$size": "$messages"
              },
              1
          ]
      }
    }
  ```
  - ==但是针对友好型操作符，比如比较操作符 `$lt(e)/$gt(e)`是可以利用索引的==，只要查询字段（createAt）有单独索引。只有当字段无索引时，才会触发全表扫描（逐条检查createdAt是否在范围内）, 因为时间字段createAt有索引， 所以mongodb查数据时，会根据索引快速找到createdAt大于等于起始时间的第一个位置和createdAt小于等于结束时间的最后一个位置，然后索引会直接返回这两个位置之间的所有文档，无需扫描整个集合； 这类似于在一本按时间排序的日志中，通过目录直接翻到 “2025-01-01” 到 “2025-10-20” 的页码范围，而不是逐页查找。

## 聚合函数与管道
- ==MongoDB 的聚合函数（Aggregation Pipeline）可以理解成 「数据加工厂的流水线」== —— 就像工厂把原材料（原始数据）通过多道工序（聚合阶段）加工成最终产品（统计结果），聚合函数能对集合中的文档进行多步处理，实现复杂的统计、分析、转换等操作; ==这个「多步骤处理流程」就是 MongoDB 的聚合管道，每一步称为一个「阶段（Stage）」， **聚合管道由多个阶段组成，每个阶段用 { 阶段名: { 配置 } } 表示，数据按顺序流过每个阶段，逐步被处理， 每个阶段可以重复使用**==
- 在其中的 MongoDB 中的「管道（Pipeline）」概念，其实和生活中 「自来水管道」 或者 「工厂流水线」 完全一致 —— 简单说就是：数据像水流一样，按顺序通过多个「处理节点」，每个节点只做一件事，最终输出处理后的结果。
- ==常见的阶段==：
  - 第一道管道（过滤）：去除大颗粒杂质（比如泥沙）→ 类似聚合中的 `$match`（筛选符合条件的文档）。
  - 第二道管道（净化）：消毒杀菌（比如加氯）→ 类似聚合中的 `$group`（分组计算）。
  - 第三道管道（过滤）：去除多余的氯和异味 → 类似聚合中的 `$project`（筛选输出字段）。
    ```js
      // 学习 筛选$match 分组$group 输出$project
      db.students.aggregate([
        // 阶段按顺序执行，可以重复，比如下面也可以继续$match
        // 阶段1: 匹配
        {
          $match: {grade: "大三"}
        },
        // 按性别分组 - 内容有计算数学平均分和每组人数 (分组后仅剩这几个属性)
        // 阶段2: 分组
        {
          $group: {
            _id: "$gender",
            avgMathScore: {$avg: "$score.math"},
            totalStudents: {$sum: 1}
          }
        },
        // 美化输出 - 确定输出项 - 别名
        // 阶段3: 输出
        {
          $project: {
            _id: 0, // 隐藏显示
            性别: "$_id", // 分组（男/女） _id -> 别名为“性别”
            数学平均分: "$avgMathScore", // avgMathScore -> 别名为“数学平均分”
            学生人数: "$totalStudents"
          }
        }
      ])
    ```
- ==其他管道阶段比如有==
  - $count: 
  - $limit：用来限制MongoDB聚合管道返回的文档数。
  - $skip：在聚合管道中跳过指定数量的文档，并返回余下的文档。
  - $unwind：将文档中的某一个数组类型字段拆分成多条，每条包含数组中的一个值
  - $sort：将输入文档排序后输出
- ==MongoDB 中聚合(aggregate)主要用于处理数据(诸如统计平均值，求和等)，并返回计算后的数据结果, ==所以可以使用各种计算的操作符，比如常见的`$sum $avg $max $min $first $last $push $addToSet`等==
## count
- 计算字段的数量
  ```json
    { $count: "结果字段名" }
  ```
- $count 是一个用于统计文档数量的阶段操作，它会返回一个包含单个字段（默认名为 count）的文档，==该字段的值为**经过管道前面阶段处理后剩余**的文档总数(也可以直接获取未筛选的全部字段)==
## exists
- ==`$`exists 是一个查询操作符，用于判断文档中是否存在指定字段（无论该字段的值是什么，包括 **null**）==。它常用于筛选包含或不包含特定字段的文档，是处理动态 schema 或可选字段的重要工具
- 基本语法：
  ```js
    { 字段名: { $exists: <boolean> } }
  ```
- 核心特点
  - 字段存在性判断：仅关注字段是否存在，不关心字段的值（即使值为 null，只要字段存在，就会被 $exists: true 匹配）。
  - ==与 null 的区别==：{ field: null } 会匹配 “字段值为 null 或 字段不存在” 的文档；而 `{ field: { $exists: true, $eq: null } }` 才会精准匹配 “字段存在且值为 null” 的文档（需结合 `$`eq）。
  - 适用所有字段类型：无论字段是字符串、数字、数组还是对象，`$`exists 都能判断其存在性。
- 1.存在与否的匹配(包括null)
  ```js
    // 查询包含 age 字段的文档（无论 age 值是什么，包括 null）
    db.users.find({ age: { $exists: true } });
    // 查询不包含 email 字段的文档, 慎用， 全表扫描
    db.users.find({ email: { $exists: false } });
  ```
- 2.精准匹配只有null的字段  
  ```js
    // 需同时满足：字段存在（$exists: true）且值为 null（$eq: null）
    db.users.find({ age: { $exists: true, $eq: null } });
  ```
- 与索引结合使用
- `$`exists 可以与索引配合，但需注意索引类型对查询效率的影响：
  - 普通索引：若字段上有普通索引，`{ field: { $exists: true } }` 会扫描整个索引（因索引仅包含有该字段的文档），效率高于全表扫描。
  - 稀疏索引：稀疏索引（sparse: true）仅包含有该字段的文档，因此 { field: { `$`exists: true } } 会高效命中稀疏索引。
  - ==**`$`exists: false：查询 “不包含字段” 的文档时，无法使用索引（因索引不存储 “不存在的字段” 信息），会触发全表扫描，需谨慎使用（尤其大集合）**==。
## push与unwind
- ==接着深入，整体查询语句==：
  ```js
    db.students.aggregate([
      {
        $match: {
          gender: "男",
          enrollYear: {$gte : 2021},
          "score.english": {$gte: 85},
          "score.math": {$gte: 85}
        }
      },
      // 分组后保留数据
      {
        $group: { 
          _id: "$gender", // 按性别分组（此处只有“男”）
          students: { // 新建一个名为 students 的数组字段
            $push: { // 将组内每个学生的以下信息，逐条添加到 students 数组, 例如：[{姓名: "张三", ...}, {姓名: "李四", ...}]
              姓名: "$name",
              入学年: "$enrollYear",
              英语: "$score.english",
              数学: "$score.math"
            }
          }
        } 
      },
      { $unwind: "$students" }, // 拆分数组，让每个学生成为独立文档
      { $sort: { "students.数学": 1 } }, // 按学生的数学成绩升序排序
      { $skip: 1 }, 
      { $limit: 2 },
      { $group: { // 重新分组，将排序后的学生合并回数组
        _id: "$_id", 
        students: { $push: "$students" }
      }},
      { $project: { // 输出美化
        _id: 0,
        性别: "$_id",
        符合条件的学生: "$students"
      }}
    ])
  ```
- ==1.`$`push和`$`unwind==
  - ==push是把多条数据放入数组中整合，数据库中每一个学生数据结构如下（单文档单体）==
    ```js
      {
        "_id": ObjectId("..."),
        "name": "张三", // 学生的属性
        "age": 20,
        "major": "计算机科学",
        "score": { "math": 90, "english": 85 }, // 附属信息（成绩）
        "hobbies": ["编程", "篮球"] // 附属信息（爱好数组，非独立实体）
      }
    ```
  - 在$group阶段中，需要写好要保存字段属性，而push操作相当于创建了一个新字段studnets，它是数组，会依次把符合条件的学生相关信息存入，最终保留结果如下，如果没有push，最终仅会留下_id字段，学生信息会丢失， push相当于一个新文件夹，把多条数据集中存在里面
    ```js
      {
        "_id": 男,
        "students": [{姓名: "张三", ...}, {姓名: "李四", ...}]
      }
    ```
  - unwind是拆分数组行为，刚刚把分组的学生数据集合到students字段中，但是如果要对学生内的数据进行聚合运算，比如avg sum sort等，需要拆分数组为单项数据，mongodb对整体数组数据无法操作
  - 拆分操作大致如下 （可以拆分完直接打印，格式就是这样）
  ```js
    // push
    {
      "_id": "男",
      "students": [
        { "姓名": "张三", "入学年": 2022, "英语": 85, "数学": 92 },
        { "姓名": "王五", "入学年": 2023, "英语": 88, "数学": 95 },
        { "姓名": "钱十一", "入学年": 2022, "英语": 84, "数学": 87 }
      ]
    }

    // unwind
    // 第1条：包含数组的第1个元素
    {
      "_id": "男",
      "students": { "姓名": "张三", "入学年": 2022, "英语": 85, "数学": 92 }
    }

    // 第2条：包含数组的第2个元素
    {
      "_id": "男",
      "students": { "姓名": "王五", "入学年": 2023, "英语": 88, "数学": 95 }
    }

    // 第3条：包含数组的第3个元素
    {
      "_id": "男",
      "students": { "姓名": "钱十一", "入学年": 2022, "英语": 84, "数学": 87 }
    }
  ```
  > 针对拆分后的数组单个数据进行sort操作，排序结束后重新组合回数组格式，整理输出格式输出
  > ==数组就像「打包好的一捆文件」，如果要对里面的「单个文件内容」进行操作（比如统计、排序），必须先把捆解开（`$`unwind），才能逐个处理==
  > ==如果想不明白拆分数组的格式以及如何对数组内数据进行操作可以先打印下unwind后的查询结果，然后继续思考下一步==
- ==拓展1：大体量数据操作（20w）==
  - 耗时的核心不是 `$`unwind 本身，而是以下两个关键问题：
      - 数据膨胀效应：如果每条文档的数组字段有 N 个元素，`$`unwind 后会生成「20 万 × N」条文档（比如 N=10，就变成 200 万条），后续聚合阶段（`$`group `$`sort）需要处理的数据量暴增；
      - 缺少索引支持：如果 `$`match 阶段没有筛选条件（或筛选条件无索引），会对全集合拆分数组，相当于 “遍历 20 万条文档 + 拆分 200 万条数据”
    > 核心： 1.合理的索引 + `$`match操作缩小要拆分的范围 2.避免不必要的拆分，只有必须要计算数组内数据时才可拆分
- 拓展2: 查询中有skip/limit阶段操作，这里注，同理的skip与limit也无法对整个数组进行操作，所以要在拆分时进行操作，所以这2条语句就在第一次拆分unwind与第二次集合push之间
## facet
- `$facet` 是一个非常实用的阶段操作符，它的核心作用是：在同一个聚合管道中，对同一批输入文档并行执行多个独立的子管道（facet），并将每个子管道的结果汇总到一个文档中; ==允许你 “一次查询，完成多个统计任务”==
  ```json
    {
      $facet: {
        "子管道1名称": [ 子管道1的阶段数组 ],
        "子管道2名称": [ 子管道2的阶段数组 ],
        // ... 更多子管道
      }
    }
  ```
  > 每一个子管道对应着一个match group project等等的聚合函数，前置位可以放共享的筛选条件，字管道内部可以使用，但是字管道之间相互独立

- 一次操作完成两个数据统计
  ```js
    const pipeline = [
      { $match: matchQuery }, // 共享的过滤条件
      { $sort: { time: -1, sort: 1 } }, // 共享的排序
      {
        $facet: {
          // 子管道1：获取当前页数据（分页）
          data: [
            { $skip: (page-1)*limit },
            { $limit: limit }
          ],
          // 子管道2：获取总记录数
          total: [
            { $count: "count" } // 统计符合条件的总条数
          ]
        }
      }
    ];

    // 一次聚合完成两个任务
    const result = await Topappdata.aggregate(pipeline).allowDiskUse(true);

    // 解析结果
    const data = result[0].data;
    const totalRecords = result[0].total[0]?.count || 0; // 从 total 子管道取总数
  ```

## lookup
- `$lookup`:==类似mysql连表查询+外键这种的概念实现,同样可写多个，每写一个就多加一个关联的字段和数据==
  ```js
    {
      $lookup: {
        from: "关联的目标集合名称",       // 必选，要关联的集合
        localField: "当前集合中的关联字段", // 必选，当前集合中用于匹配的字段
        foreignField: "目标集合中的关联字段", // 必选，目标集合中用于匹配的字段
        as: "存储关联结果的数组字段名" // 必选，关联结果将以数组形式存入该字段
      }
    }
  ```
- 例如： usr表 关联 order表，关联键_id <---> user_id
- user:
  ```json
    [
      { _id: 101, name: "Alice", age: 25 },
      { _id: 102, name: "Bob", age: 30 }
    ]
  ```
- order:
  ```json
    [
      { _id: 1, order_no: "ORD001", user_id: 101, amount: 200 },
      { _id: 2, order_no: "ORD002", user_id: 102, amount: 300 }
    ]
  ```
- 查询：
  ```js
    db.orders.aggregate([
      {
        $lookup: {
          from: "users",       // 关联 users 集合
          localField: "user_id", // 订单集合的关联字段是 user_id
          foreignField: "_id",   // 用户集合的关联字段是 _id
          as: "user_info"        // 关联结果存入 user_info 数组
        }
      }
    ])
  ```
- 查询结果: 
  ```js
    [
      {
        _id: 1,
        order_no: "ORD001",
        user_id: 101,
        amount: 200,
        user_info: [{ _id: 101, name: "Alice", age: 25 }] // 匹配到的用户,新的关联字段，内部是关联数据
      },
      {
        _id: 2,
        order_no: "ORD002",
        user_id: 102,
        amount: 300,
        user_info: [{ _id: 102, name: "Bob", age: 30 }]
      }
    ]
  ```
- ==与 SQL JOIN 的区别==
  - ==$lookup 仅支持类似 LEFT JOIN 的逻辑==：即使目标集合无匹配文档，当前文档仍会保留，关联结果为 empty 数组。
  - ==结果格式不同==：$lookup 将关联文档嵌入当前文档的数组字段中，而 SQL JOIN 会将结果展平为多列。

## replaceRoot
- `$replaceRoot` 是一个用于重定义文档结构的阶段操作符，它的核心作用是：==将指定的子文档（或表达式结果）提升为文档的根节点，替换原文档的结构==
- 原始文档
  ```json
    {
      _id: 1,
      user: { name: "Alice", age: 25 },
      score: 90
    }
  ```
- 使用 $replaceRoot 后, 提升user
  ```js
    { $replaceRoot: { newRoot: "$user" } }
  ```
  ```json
    // 结果文档（仅保留 user 内容，原 _id、score 被移除）
    { name: "Alice", age: 25 }
  ```
## 聚合系统变量
- 系统变量有2个`$`, 比如`$$ROOT`,==`$$ROOT` 是最常用的系统变量，代表 “当前完整文档”==
- 例如： 假设 Topappdata 集合中有两条 id 相同的文档：
  ```json
    // 文档1
    { id: "6753701106", appId: "com.test.app1", title: "测试应用1", time: "2025-10-09" }
    // 文档2（id 与文档1相同，属于同一组）
    { id: "6753701106", appId: "com.test.app1", title: "测试应用1", time: "2025-10-10" }
  ```
- 执行语句 `{ $group: { _id: "$id", data: { $first: "$$ROOT" } } }`
- 按照id分组，然后`$$ROOT`就代表分组后的完整文档，然后取这条文档的第一条数据
  ```js
    {
      _id: "6753701106", // 分组键（id字段值）
      data: { id: "6753701106", appId: "com.test.app1", title: "测试应用1", time: "2025-10-09" } // 分组内第一条完整文档（$$ROOT 引用的内容）
    }
  ```
- ==其他的常用==
  - `$$CURRENT`：引用当前聚合阶段正在处理的文档（和 `$$ROOT` 类似，但在某些嵌套场景下更精准）。
  - `$$REMOVE`：在 `$`project 或 `$`addFields 中使用，代表 “移除当前文档”（返回空，不包含该文档在结果中）
- ==去重案例应用==
- 1.有重复id的数据(数据库插入)
  ```js
    // 插入测试数据（模拟你的 Topappdata 集合结构）
    db.testTopappdata.insertMany([
      {
        id: "6753701106",
        appId: "com.linquist.motorlogbook",
        title: "MotorLogBook",
        time: "2025-10-09 00:00:53",
        collection_name: "TOP_PAID_IOS"
      },
      {
        id: "6753701106", // 重复 id
        appId: "com.linquist.motorlogbook",
        title: "MotorLogBook（重复）",
        time: "2025-10-09 01:00:53", // 时间更新
        collection_name: "TOP_PAID_IOS"
      },
      {
        id: "6753686972",
        appId: "com.mah.v0y4j3rr04d",
        title: "VoyagerRoad",
        time: "2025-10-09 00:02:29",
        collection_name: "NEW_FREE_IOS"
      },
      {
        id: "6753686972", // 重复 id
        appId: "com.mah.v0y4j3rr04d",
        title: "VoyagerRoad（重复）",
        time: "2025-10-09 02:02:29", // 时间更新
        collection_name: "NEW_FREE_IOS"
      }
    ]);
  ```
- 2.执行去重操作
- 实现 “按 id 分组去重 → 保留每组第一条完整文档 → 还原原始文档结构”
  ```js
    // 聚合管道（对应你代码中 checked == 'true' 的核心逻辑）
    const result = db.testTopappdata.aggregate([
      // 步骤1：按 id 分组，保留每组第一条完整文档（$$ROOT 引用完整文档）
      {
        $group: {
          _id: "$id", // 分组键：按 id 去重
          data: { $first: "$$ROOT" } // 保留每组第一条完整文档到 data 字段
        }
      },
      // 步骤2：将 data 字段的完整文档提升为根节点（还原原始结构）
      {
        $replaceRoot: { newRoot: "$data" }
      },
      // 步骤3：按时间降序排序（可选，和你代码中的排序逻辑一致）
      {
        $sort: { time: -1 }
      }
    ]).toArray();

    // 打印结果
    console.log("去重后的文档（共", result.length, "条）：");
    console.log(result);
  ```
- 3.测试结果
- 最终输出会是 2 条去重后的文档，每条都是对应 id 分组内的第一条完整文档，结构和原始文档完全一致
  ```json
    // 输出示例（已去重，保留原始文档结构）
    // 去重后的文档（共 2 条）：
    [
      {
        "_id": ObjectId("..."),
        "id": "6753686972",
        "appId": "com.mah.v0y4j3rr04d",
        "title": "VoyagerRoad",
        "time": "2025-10-09 00:02:29",
        "collection_name": "NEW_FREE_IOS"
      },
      {
        "_id": ObjectId("..."),
        "id": "6753701106",
        "appId": "com.linquist.motorlogbook",
        "title": "MotorLogBook",
        "time": "2025-10-09 00:00:53",
        "collection_name": "TOP_PAID_IOS"
      }
    ]
  ```
- ==核心观点==
  - `$`group: `{ _id: "$id", data: { $first: "$$ROOT" } }`：和你代码完全一致，按 id 去重，用 `$$ROOT` 保留完整文档。
  - `$`replaceRoot：还原文档结构，去掉分组产生的 _id 和 data 临时字段，和原始文档格式一致。
  - 整个流程无数据丢失，且实现了 “相同 id 只保留一条” 的去重效果。
 
## 视图
- 视图（View） 是基于一个或多个集合的查询结果构建的虚拟集合，它本身不存储实际数据，而是动态计算并返回底层集合的数据。视图的作用类似于 SQL 中的视图，==主要用于简化复杂查询、封装数据逻辑或限制数据访问范围==
- 核心特性
  - 虚拟集合：视图不存储数据，数据来源于底层集合（或其他视图）的查询结果，每次访问视图时都会动态计算。
  - 基于聚合管道：视图由一个聚合管道（aggregate）定义，通过管道逻辑筛选、转换或组合底层数据。
  - ==只读性==：视图只能用于查询（find 或聚合操作），不能执行 insert、update、delete 等写操作（写操作需直接针对底层集合）。
  - 动态更新：底层集合的数据变化会实时反映在视图中（因为视图是动态计算的）。
- 创建视图的语法
  ```js
    db.createView(
      "视图名称",          // 必选，视图的名称
      "底层集合名称",      // 必选，视图基于的源集合（或其他视图）
      [聚合管道阶段],      // 必选，定义视图数据的聚合管道（如 $match、$project 等）
      { 可选配置 }         // 可选，如默认排序规则（collation）等
    )
  ```
- 存在集合user
  ```json
    [
      { _id: 1, name: "Alice", age: 25, city: "Beijing", salary: 8000 },
      { _id: 2, name: "Bob", age: 30, city: "Shanghai", salary: 12000 },
      { _id: 3, name: "Charlie", age: 35, city: "Beijing", salary: 15000 }
    ]
  ```
- 创建视图：基于user进行操作
  ```js
    db.createView(
      "beijing_users",       // 视图名称
      "users",               // 底层集合
      [
        { $match: { city: "Beijing" } }, // 筛选北京的用户
        { $project: { name: 1, age: 1, _id: 0 } } // 只显示 name、age，隐藏 _id
      ]
    )
  ```
- 使用视图,和普通查询一样
  ```js
    db.beijing_users.find()
  ```
  > 之后会执行视图内的聚合阶段并输出结果
- ==视图可以嵌套==
  ```js
    // 创建视图：北京的成年用户（age > 30）
    db.createView(
      "beijing_adults",
      "beijing_users",       // 基于已有的 beijing_users 视图
      [{ $match: { age: { $gt: 30 } } }]
    )

    // 查询新视图
    db.beijing_adults.find() // 输出：{ "name": "Charlie", "age": 35 }
  ```
  > beijing_adults： 先执行视图beijing_users，在对结果match
- 视图的作用： 
  - 将常用的复杂聚合管道封装为视图，避免重复编写代码（如多阶段筛选、关联、计算的逻辑）。
  - 数据访问控制：通过视图限制可见字段或行（如隐藏敏感字段 salary，只展示部分用户），实现数据脱敏或权限控制。
  - 数据一致性：多个业务场景依赖相同的数据逻辑时，通过视图统一数据处理规则，避免逻辑分散和不一致。
- 查看视图定义和删除视图
  ```js
    db.getCollectionInfos({ name: "beijing_users" })
    db.beijing_users.drop()
  ```
 
# node-fs
## 创建与读写
- 中游文件夹的自动创建
  ```js
    /** 问题1&2
     * 文件夹的创建(默认中间路径不自动创建), 但是文件可以
     * 文件夹路径的获取
    */
    const fPath = path.resolve(__dirname, './config/testData/student.txt')

    // 可以获取文件夹的路径部分,实际就是删除最后一部分(/student.txt)
    const pathDir = path.dirname(fPath)

    // recursive: 异步创建文件夹,如果路径中包含不存在的父级目录，会自动创建所有缺失的目录
    // 不会重复创建文件夹
    fs.mkdirSync(pathDir, { recursive: true })
  ```
  > 1.拓展方法：`path.join(a,b,c)`,单纯的字符串拼接`a/b/c`，可以没有绝对路径（__dirname），但是`path.resolve`,总会以当前文件的绝对路径为基准进行拼接，实际使用区别不大
  > 2.拓展方法：`fs.dirname(fpath)`删除`/`最后一部分,一般用于删除文件部分，例如：`a/b/c.js -> a/b`
- 存入数据进入文件夹
  ```js
    /** 
     * 存入数据格式
     * info: 字符串 Buffer Uint8Array
    */

    const stu1 = '字符串: 小明'

    const stu2 = {
      name: "小明"
    }
    const stu2Str = JSON.stringify(stu2, null, 2) // 参数： 要被转化内容, 筛选条件(可选,没有就写null占位), 缩进格式

    const stu3 = ["小明"]
    const stu3Str = JSON.stringify(stu3, null, 2)

    fs.writeFileSync(fPath, stu1, { flag: 'a' }) // 追加
    fs.writeFileSync(fPath, stu2Str, { flag: 'a' })
    fs.writeFileSync(fPath, stu3Str, { flag: 'a' })
  ```
- 写入数据进入文件的总结:
  ```js
    /**
      * 1.指定文件路径
      * 2.获取文件夹路径
      * 3.检测文件夹路径是否都被创建
      * 4.传入数据(针对对象和数组要JSON转化)
      * 
      * 注意: 文件操作是异步操作,所以最好try-catch
    */
  ```
- 读取文本
  ```js
    /**
     * 设置格式utf-8,会作为纯字符串输出, 否则格式为Buffer
     * 对单一的数据(对象/字符串) 读取后正常使用需要JSON解析 JSON.parse()
    */
    const res = fs.readFileSync(fPath, 'utf-8')
    console.log(JSON.parse(res))
  ```
- ==pipe==:pipe() 是流（Stream）对象的核心方法，用于将一个可读流（Readable）的数据 “管道” 到一个可写流（Writable）中，实现数据的自动传递和处理。它简化了流之间的数据传输逻辑，无需手动监听 data 和 end 事件。
- 核心用法: `readableStream.pipe(writableStream);`
- 简单用法: 
  ```js
    const fs = require('fs');

    // 创建可读流（源文件）和可写流（目标文件）
    const readStream = fs.createReadStream('source.txt');
    const writeStream = fs.createWriteStream('target.txt');

    // 通过 pipe 传递数据
    readStream.pipe(writeStream);

    // 监听完成事件
    writeStream.on('finish', () => {
      console.log('文件复制完成');
    });
  ```
- 支持连缀写法
  ```js
    const fs = require('fs');
    const zlib = require('zlib'); // 提供压缩/解压转换流

    // 流程：读取文件 → 压缩 → 写入压缩文件
    fs.createReadStream('largeFile.txt')
      .pipe(zlib.createGzip()) // 压缩转换流
      .pipe(fs.createWriteStream('largeFile.txt.gz'))
      .on('finish', () => {
        console.log('文件压缩完成');
      });
  ```
- ==pipe() 不会自动处理错误，需为流单独监听 error 事件，否则错误可能导致程序崩溃==
  ```js
    readStream.on('error', (err) => console.error('读取错误:', err));
    writeStream.on('error', (err) => console.error('写入错误:', err));
  ```
- pipe第二个参数：
  ```js
    readable.pipe(writable, {
      end: true, // 默认为 true，可读流结束时自动结束可写流；设为 false 可保持可写流打开
    });
  ```
- pipe连缀写入文件
  ```js
    const fs = require('fs');
    const writeStream = fs.createWriteStream('combined.txt');

    // 第一个文件写入后不关闭可写流
    fs.createReadStream('file1.txt').pipe(writeStream, { end: false });

    // 第一个文件写完后再写第二个文件
    writeStream.on('unpipe', () => {
      fs.createReadStream('file2.txt').pipe(writeStream);
    });
  ```
  > ==监听 unpipe 事件的核心目的，是确保第一个可读流完全写完并断开管道后，再向同一个可写流写入第二个文件==

- 当第一个流（file1.txt）通过 pipe(writeStream, { end: false }) 写入时，end: false 会让可写流在第一个流结束后保持打开（不触发 finish 事件）。
- 但第一个流写完后，会自动与可写流断开管道连接（触发 unpipe 事件），此时可写流处于 “空闲可写入” 状态。
- 若不监听 unpipe，直接连续调用 pipe（如 file1.pipe(ws).pipe(file2.pipe(ws))），两个可读流会同时向可写流写数据，导致文件内容错乱（比如 file1 的末尾和 file2 的开头混在一起）。

## 删除文件
- 删除文件需要权限，设置好权限后，如下重置文件的操作
  ```js
    const fPath = Path.resolve(__dirname, `../../testData/addphotosByChunk`)
    if(fs.existsSync(fPath)){
      fs.rmSync(fPath, { 
        recursive: true,  // 递归删除子文件/目录
        force: true       // 强制删除（忽略权限限制，需要用户实际有权限）
      });
      console.log('上一次执行文件清除成功')
    }
  ```

# node-express
## multer命名
- multer是上传文件的第三方包，比如`multer.array(xxx)`和`multer.single(xxx)`; 这个命名取决于表单上传时的命名，如下
  | 位置 | 代码示例 | 说明 |
  | --- | --- | --- |
  | 前端 | FormData	formData.append('files', file) | 给每个文件绑定键名 'files' |
  | 后端 | multer 中间件	upload.array('files') | 告诉 multer：「提取键名为 'files' 的所有文件」 |
  | 后端控制器 | req.files	multer | 会自动将提取到的文件数组，挂载到 req.files（固定属性名，由 multer 约定） |
  > ==1.这三处的键名必须一致，否则无法找到对应存储的文件==
  > ==2.formData类型的数据无法直接打印==，需要entries转化 `for(const {key,value} of formData.entries)`， 对象也可以这样迭代成键值对 `Object.entries(obj)`
- 2.不同的文件数量上传
  - 2.1 `multer.single(xxx, maxCount)` 多文件,可选最大数量
  - 2.2 `multer.array(xxx)` 单文件
  - 2.3 `multer.field([ name: key, maxCount: x ], [....])` 多文件，不同键名
 	
## req与res
- ==Express 路由中所有中间件（包括全局中间件、路由中间件、控制器）接收的 req 和 res 都是同一个实例==—— 整个请求生命周期内，req 和 res 不会被重新创建，只会被持续传递和修改。**中间件之间的信息传递就依靠req和res进行传递**
>
- ==一个请求从发送到服务器，到最终返回响应，会经历以下流程==
  - 浏览器发送请求 → 服务器创建 1 个 req 对象（存储请求信息）和 1 个 res 对象（用于构建响应）；
  - 这两个对象会按「中间件顺序」依次传递给每一个中间件（全局 → 路由 → 控制器）；
  - 所有中间件都可以读写 req 和 res 的属性（比如给 req 加自定义数据，给 res 加响应头）；
  - 最终，res 对象携带所有中间件设置的信息（响应头、业务数据等）返回给前端。
    > 简单说：req 和 res 是请求的「专属容器」，从请求开始到结束，全程复用同一个实例。

- ==req与res的作用==
	- ==req 负责「接收和解析前端的请求数据」（比如参数、文件、请求头）==
      - 基础的req.query/params/body的数据获取,常规req.method,req.url, 特殊的multer比如req.files(根据键名确定，非固定)
      - token的获取, req.headers.authorization
      - 信息传递，自定义req.username = username,在下一个中间件使用
  - ==res 负责「构建和返回给前端的响应结果」（比如数据、状态码、响应头）==
    - 设置跨域: res.setHeaders
    - 设置状态码/返回值：res.status(200) , res.json() / res.send()
    - 直接结束请求： res.end() 没有返回
    - 额外的： 重定向res.redirect(url)
    > 注意： 如果一个http请求没有设置任何的res来返回信息或者结束，那么这个http将会一直占用服务器，不会结束
- 总结：
  - req 是「输入工具」：负责接收前端请求数据，传递中间件加工后的信息（如解析后的用户数据、文件信息）；
  - res 是「输出工具」：负责设置响应规则（头信息、状态码），返回最终处理结果给前端；
## 跨域补充
- ==在node后端中设置res跨域时的问题: 为什么是res而不是req呢？==
- 跨域拦截： 浏览器会先发送请求到后端（后端能正常收到并处理），但在将响应返回给前端之前，会主动校验后端返回的响应头；如果响应头中没有包含「允许当前前端域名访问」的标识，浏览器会拦截响应，不让前端读取数据（前端会看到 CORS 错误）， ==总结为请求会正常请求，但是返回信息给浏览器时，浏览器会检查此次请求是否跨域，这个取决于服务器返回的res，所以设置跨域操作是在res上而不是req上, **跨域限制的核心是浏览器的 “响应拦截”，而非 “请求拦截”（请求本身能正常发到后端）, 浏览器校验的是后端返回的响应头，而不是前端发送的请求头（即使前端在 req 中添加跨域标识，浏览器也不认,**== 比如：前端强行在请求头中添加 Access-Control-Allow-Origin，浏览器会直接忽略这个头，因为跨域校验的是后端返回的响应头，而非前端发送的请求头

## express的默认
- ==一个express后端路由的常见默认,按照顺序==
  ```js
    const app = express()
    const PORT = 4000

    // 全局中间件：跨域处理
    app.use(corsMiddleware);

    // 重要的中间件
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // 注册路由
    app.use(imageRouter)
    app.use(uploadRouter)
    app.use('/test',testRouter)

    // 未匹配路由处理（404错误）
    app.use((req, res, next) => {
      // 当请求的路由未被任何已注册的路由匹配时，会进入这里
      const error = new Error(`未找到请求的路由: ${req.method} ${req.originalUrl}`);
      error.statusCode = 404; // 标记为404错误
      next(error); // 传递给全局错误处理中间件
    });

    // 全局错误处理中间件
    app.use((err, req, res, next) => {
      console.error('服务器错误：', err);
      res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        error: err.message
      });
    });

    app.listen(PORT, () => {
      console.log(`后端运行: http://localhost:${PORT}`)
    })
  ```
- 1.`express.json()`和`express.urlencoded()`
  - ==app.use(express.json())==
    - 功能：==解析JSON 格式的请求体==。
    - 适用场景：当客户端发送的请求头中包含 Content-Type: application/json 时（通常是前端通过 fetch、axios 等工具发送 JSON 数据），该中间件会自动将请求体中的 JSON 字符串解析为 JavaScript 对象，并挂载到 req.body 上。
    > ==主要是别忘记，前后端交互处理数据都是JSON字符串格式，前端传给node后端都是JSON字符串，没有express.json()处理JSON字符串变为对象格式，后端无法操作任何数据==
  - ==app.use(express.urlencoded({ extended: false }))==
    - 功能：==解析表单格式的请求体（application/x-www-form-urlencoded）==。
    - 适用场景：当客户端通过 HTML 表单提交数据（默认 method="POST" 时），或请求头为 Content-Type: application/x-www-form-urlencoded 时（如表单提交、某些 API 工具模拟表单数据），该中间件会解析请求体中的键值对（如 name=张三&age=20），并转换为 JavaScript 对象挂载到 req.body 上。
    - 关于 extended: false：不支持表单嵌套
      - false：使用 Node 内置的 querystring 模块解析，只能处理简单的键值对（不支持嵌套对象）。
      - true：使用第三方 qs 模块解析，支持嵌套对象（如 user[name]=张三&user[age]=20 可解析为 { user: { name: '张三', age: 20 } }）。通常设置为 false 即可满足大多数简单表单场景，若需要处理复杂嵌套数据，可设为 true。
- ==2.路由处理和错误处理== 
  - 路由出错： 当上面的路由都没有匹配时，进入这个中间件，然后报错, `next()`是进入下一个中间夹，`next(err)`是进入全局处理错误中间件，同时把错误信息err传递过去
  - 全局错误处理中间件： 固定写法，收集全局的错误处理，传递方式就是`next(err)`














