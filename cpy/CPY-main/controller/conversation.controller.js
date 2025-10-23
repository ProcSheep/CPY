const Conversation = require("../models/ai_conversation.model")
const Charactergroup = require("../models/ai_charactergroup.model")


module.exports = {
  async conversations(req,res,next){
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        createdAtStart,
        createdAtEnd,
        messagesCount,
        group,
        // checked,
        // ab_test_group,
        ...filters
        /**
         * model_id
         * ConversaionId
         * 
         */
    } = req.body;

    const query = { ...filters };
    
    // 处理用户筛选数据
    let userQuery = {}
    // if (ab_test_group) {
    //     userQuery.ab_test_group = ab_test_group
    // }

    // if(checked) {
    //   // 初始化createdAt为一个空对象，用于存储时间筛选条件
    //   userQuery.createdAt = {};
    //   // 添加大于等于条件：筛选创建时间晚于或等于createdAtStart的记录
    //   userQuery.createdAt.$gte = new Date(createdAtStart);
    //   // 添加小于等于条件：筛选创建时间早于或等于createdAtEnd的记录
    //   userQuery.createdAt.$lte = new Date(createdAtEnd);
    // }
    // 整体效果：当checked为真时，会筛选出创建时间在createdAtStart到createdAtEnd这个时间区间内的记录

     // 添加 createdAt 筛选条件
    if (createdAtStart || createdAtEnd) {
        query.createdAt = {};
        
        if (createdAtStart) {
          query.createdAt.$gte = new Date(createdAtStart)
        }
        if (createdAtEnd) {
          query.createdAt.$lte = new Date(createdAtEnd)
        }
    }

    if (messagesCount) {
      // 使用$expr可以在查询中使用聚合表达式
      query.$expr = {
        // $gt表示"大于"（greater than）
        $gt: [
          { $size: '$messages' },  // $size用于获取数组长度，这里是获取messages数组的长度
          Number(messagesCount)    // 将messagesCount转换为数字作为比较值
        ]
      };
    }
    // 整体效果：当messagesCount存在时，会筛选出消息数量（messages数组长度）大于messagesCount的记录

    // 构建排序条件
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // 根据group进行查询
    if(group) {
      // 查询模型
      const data = await Charactergroup.findOne({name: group})
      query.character_uuid = {$in: data?.characters || []}
    }
    
    // if(checked || ab_test_group) {
    //   console.log(userQuery);
      
    //   const user = await findAIUser(userQuery)
    //   console.log(user.length);
      
    //   const ids = user.map(e => e.user_id)
    //   query.user_id = {$in: ids}
    // }


    // 查询数据
    const conversations = await Conversation.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      // .explain("executionStats")
      
    // console.log("是否全表（COLLSCAN/ IXSCAN索引）",conversations.executionStats); 

    // 获取总条数
    // const total = await Conversation.countDocuments(query);

    const result = {
      data: conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        // total,
      }
    }

    res.json({
      result,
      reqBody: req.body,
      query,
      // queryRes: conversations.executionStats.executionStages
    })

    // return result;
}
}