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
  > 第一个是查询条件，第二个指定不显示的属性（0），或者指定显示的属性（1）， 只能写一个，不写就全部显示
- 2.findOne: 同理查询，但是只会返回查到符合条件的第一个结果
- ==3.关系运算符==


| 操作符       | 语法示例                  | 描述                                   | 适用类型                 |
|--------------|---------------------------|----------------------------------------|--------------------------|
| `$eq`        | `{ field: { $eq: value } }` | 匹配字段值**等于**指定值               | 所有类型（数字、字符串等） |
| `$ne`        | `{ field: { $ne: value } }` | 匹配字段值**不等于**指定值             | 所有类型                 |
| `$gt`        | `{ field: { $gt: value } }` | 匹配字段值**大于**指定值               | 数字、日期、字符串（按字典序） |
| `$gte`       | `{ field: { $gte: value } }`| 匹配字段值**大于等于**指定值           | 同上                     |
| `$lt`        | `{ field: { $lt: value } }` | 匹配字段值**小于**指定值               | 同上                     |
| `$lte`       | `{ field: { $lte: value } }`| 匹配字段值**小于等于**指定值           | 同上                     |
| `$in`        | `{ field: { $in: [v1, v2] } }` | 匹配字段值**等于数组中任意一个值**     | 所有类型（数组元素需与字段类型一致） |
| `$nin`       | `{ field: { $nin: [v1, v2] } }`| 匹配字段值**不等于数组中所有值**       | 同上                     |


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

### 改



## 排序与分页
- 排序语法： `db.collection.find({...}).sort({ field1: 1, field2: -1 })`
  > 可以写多个排序， 1升-1降， 比如上面是先按field1升再按field2降
  > 记住是先查出数据再排序
  > ==注意: MongoDB 在执行排序时会对查询结果进行排序，因此可能会影响性能，特别是在大型数据集上排序操作可能会较慢。如果排序字段上有索引，排序操作可能会更高效。在执行频繁的排序操作时，可以考虑创建适当的索引以提高性能。==
- 分页： 
  ```js
    // 跳过前 10 个文档(documnet,即10行数据)，返回接下来的 10 个文档
    db.myCollection.find().skip(10).limit(10);
  ```
## 索引



# node-fs
## 读写














