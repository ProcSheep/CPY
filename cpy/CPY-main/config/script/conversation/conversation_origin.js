const conversations = async (params) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        createdAtStart,
        createdAtEnd,
        messagesCount,
        group,
        checked,
        ab_test_group,
        ...filters
    } = params;

    const query = { ...filters };
    
    // 处理用户筛选数据
    let userQuery = {}
    if (ab_test_group) {
        userQuery.ab_test_group = ab_test_group
    }

    if(checked) {
      userQuery.createdAt = {};
      // .$gte .$lte
      userQuery.createdAt.$gte = new Date(createdAtStart)
      userQuery.createdAt.$lte = new Date(createdAtEnd)
    }

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
      // $gt $size ??  
      query.$expr = {$gt: [{ $size: '$messages' }, Number(messagesCount)]}
    }

    // 构建排序条件
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // 根据group进行查询
    if(group) {
      // 查询模型
      const data = await Charactergroup.findOne({name: group})
      query.character_uuid = {$in: data?.characters || []}
    }
    
    if(checked || ab_test_group) {
      console.log(userQuery);
      
      const user = await findAIUser(userQuery)
      console.log(user.length);
      
      const ids = user.map(e => e.user_id)
      query.user_id = {$in: ids}
    }
    // 查询数据
    const conversations = await Conversation.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // 获取总条数
    const total = await Conversation.countDocuments(query);

    const result = {
      data: conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      }
    }
    return result;
}