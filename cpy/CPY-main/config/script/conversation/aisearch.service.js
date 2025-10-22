const {AiConfig, Conversation, Character, AiPhoto, PhotosAlias, NewCharacter, Charactergroup, AiSetting, AiExplore, AiPrompt, CharacterWorldInfo, AiCard, AiUser, RemoteConfig, Localization } = require('../models')
const {Binary } = require('mongodb');
const {v4: uuidv4} = require('uuid');
const { Buffer } = require('buffer');
const { Binary: mBinary } = require('bson');
const {pushDeviceToken} = require('./push/index')
const {findAIUser} = require('./baseservice/user')
require('dotenv').config();
const moment = require('moment');

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
      query.$expr = {$gt: [{ $size: '$messages' }, Number(messagesCount)]}
    }

    // 构建排序条件
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // 根据group进行查询
    if(group) {
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

// =================================


const getImageRename = async (url, type) => {
  let alias
  try {
    const info = await AiPhoto.findOne({url})
    if (!info) return url
    let key = type == 'avatar' ? 'avatar' : type == 'cover' ? 'cover' :'small'
    const name = await PhotosAlias.findOne({url: info.photos[key]})
    alias = name ? `${process.env.PHOTOS_CACHE_PATH}${name.alias}.jpg` : url
  } catch (error) {
    alias = url
    console.log(error); 
  }
  return alias
}
const convertUUIDToBinary = (uuidString) => {
  const hexString = uuidString.replace(/-/g, '');
  return new Binary(Buffer.from(hexString, 'hex'), Binary.SUBTYPE_UUID);
};
const characters = async (params) => {
  const {createdAtStart, createdAtEnd, uuid, limit = 10, page = 1, name, type, ...filters} = params
  const query = { ...filters };

  if (createdAtStart || createdAtEnd) {
    query.createdAt = {};
    if (createdAtStart) query.createdAt.$gte = new Date(createdAtStart);
    if (createdAtEnd) query.createdAt.$lte = new Date(createdAtEnd);
  }
  if (uuid) {
    query.uuid = convertUUIDToBinary(uuid)
  }
  // name name or original_name 相同即可
  if (name) {
    query.$or = [
      {name: {$regex: name, $options: 'i'}},
      {original_name: {$regex: name, $options: 'i'}}
    ]
  }

  if(type) {
    query.user_id = type == "0" ? {$exists: false} : {$exists: true}
  }
  const character = await Character.find(query).sort({createdAt: -1, _id: -1})
  .skip((page - 1) * limit)
  .limit(parseInt(limit)).lean();
  
  let result = []
  for (const item of character) {
    item.avatar = await getImageRename(item.avatar, 'avatar')
    item.cover = await getImageRename(item.cover, 'cover')
    const photos = []
    for (const pic of item.photos) {
      photos.push(await getImageRename(pic, 'photos'))
    }
    item.photos = photos
    result.push(item)
  }

  const total = await Character.countDocuments(query);

  return {
    data: result,
    limit: Number(limit),
    page: Number(page),
    total: Number(total)
  }
}

const avatars = async (uuidArray) => {
    const binaryUUIDs = uuidArray.map(u => convertUUIDToBinary(u));
    const characters = await Character.find(
        { uuid: { $in: binaryUUIDs } },
        { avatar: 1, uuid: 1, _id: 0 }
    ).lean();
    const result = [];
    for (const item of characters) {
        item.avatar = await getImageRename(item.avatar, 'avatar');
        result.push(item);
    }
    return result;
};
const reviseInfo = async (params) => {
  console.log(params);
  
  let result = {state: false}
  try {
    if (!params.name) {
      delete params.name
    }
    if (!params.theme) {
      delete params.theme
    }

    params.personality = params.personality?.split('/')?.filter(res => res) || []
    
    let uuid = convertUUIDToBinary(params.uuid)
    delete params.uuid
    
    await Character.updateOne({uuid}, {$set: params});
    result = {state: true}
  } catch (error) {
    result = {state: false}
    console.log(error);
  }
  return  result
}

const createUUID =  () => {
  const uuidString = uuidv4();
  const uuidBuffer =  Buffer.from(uuidString.replace(/-/g, ''), 'hex');
  const uuidBinary = new mBinary(uuidBuffer, 4);
  return uuidBinary
}
const addcharacter = async (data) => {
  let result = {state: 500, message: 'fail'}
  try {
    let info = {
      ...data,
      uuid: createUUID(),
      ts: Date.now()
    }
    await NewCharacter.insertMany(info)
    result = {state: 200, message: 'success'}
  } catch (error) {
    console.log(error.message);
  }
  return result
}

const change_ms = async () => {
  // await AiSetting.updateOne(
  //   {_id: '6760ddbdc1f910414a1f48b3'},
  //   { $set: { 'setting.character_change_ms': new Date().getTime() } }
  // );
}
const getgroups = async () => {
  try {
    const result = await Charactergroup.find().sort({createdAt: -1})
    return result
  } catch (error) {
    throw new Error(error.message)
  }
  
}
const deletegroups = async (data) => {
  try {
    const result = await Charactergroup.deleteOne({ _id: data.id });
    // await change_ms()
    return {state: 200}
  } catch (error) {
    throw new Error(error.message)
  }
}
const updategroups = async (data) => {
  try {
    if (data?.id || data?._id) {
      const {_id, id, ...info} = data
      await Charactergroup.updateOne({_id: id || _id}, info);
    }else {
      let info = {
        name: data.name || '',
        characters: data.characters || []
      }
      await Charactergroup.insertMany(info)
    }
    // await change_ms()
    return {state: 200}
  } catch (error) {
    throw new Error(error.message)
  }
}

const findExplore = async (query = {}) => {
  return await AiExplore.find(query)
}

const updateOneExplore = async (query, updateField) => {
  return await AiExplore.updateOne(query, updateField)
}

const deleteOneExplore = async (query) => {
  return await AiExplore.deleteOne(query)
}

const addExplore = async (query) => {
  return await AiExplore.insertMany(query)
}

const updateManyExplore = async (query, updateField) => {
  return await AiExplore.updateMany(query, updateField)
}

const addPrompt = async (query) => {
  return await AiPrompt.insertMany(query)
}

const updatePrompt = async (query, updateField) => {
  return await AiPrompt.updateOne(query, updateField)
}

const deletePrompt = async (query) => {
  return await AiPrompt.deleteOne(query)
}

const findPrompt = async (query = {}) => {
  return await AiPrompt.find(query)
}

const pushData = async (data, token) => {
  console.log(process.env.AI_APNS_KEY_PATH);
  
  let provider = {
    token: {
        key: process.env.AI_APNS_KEY_PATH, // 替换为你的 .p8 文件路径
        keyId: process.env.AI_PUSHID,   // 替换为你的 Key ID
        teamId: process.env.AI_TEAMID // 替换为你的 Team ID
    },
    production: true // 设置为 true 表示使用生产环境的 APNs 服务
  }
  let message = {
    topic: process.env.AI_TOPIC, // 替换为你的应用程序的 bundle ID
    sound: "ping.aiff",
    alert: data.content,
  }
  if(data.payload) {
    message.payload = data.payload
  }
  let result = await pushDeviceToken(provider, message, token);
  
  if (!result || !result.sent || result.sent.length === 0) {
    provider.production = !provider.production;
    result = await pushDeviceToken(provider, message, token);
  }
  return result;
}

const addWorldInfo = async (query) => {
  console.log(query);
  
  return await CharacterWorldInfo.insertMany(query)
}

const deleteWorldInfo = async (query) => {
  return await CharacterWorldInfo.deleteOne(query)
}

const updateWorldInfo = async (query, updateField) => {
  return await CharacterWorldInfo.updateOne(query, updateField)
}

const findWorldInfo = async (query = {}) => {
  return await CharacterWorldInfo.find(query)
}

const addCardPool = async (query) => {
  return await AiCard.insertMany(query)
}

const deleteCardPool = async (query) => {
  return AiCard.deleteOne(query)
}

const updateCardPool = async (query, updateField) => {
  return await AiCard.updateOne(query, updateField)
}

const findCardPool = async (query = {}) => {
  return await AiCard.find(query)
}

const filterByMaxMessages = (data) => {
  const userMap = new Map();

  // Group data by user_id and keep track of the one with max messages length
  data.forEach(item => {
    const currentLength = item.messages.length;
    const existingItem = userMap.get(item.user_id);

    if (!existingItem || currentLength > existingItem.messages.length) {
      userMap.set(item.user_id, item);
    }
  });

  // Convert the map values back to an array
  return Array.from(userMap.values());
}

// 获取对话数据
const getChatData = async (query, debugUserId, userIds) => {
  // 初始化结果对象
  const result = {
      chatNum: 0,
      userChatdetail: {
          low: 0,
          medium: 0,
          high: 0,
          superhigh: 0,
          severe: 0,
          chatUsers: 0,
          createdChatUsers: 0,
          noChatUsers: 0
      }
  };

  try {
      // 查询符合条件的聊天记录
      const chats = await Conversation.find({ ...query, user_id: { $nin: debugUserId } });

      // 每日数据统计
      const todayChat = chats.filter(chat => userIds.includes(chat.user_id)); //每日新增用户的聊天数据
      const todayChatUser = todayChat.filter(chat => chat.model)//参与聊天的用户

      const userTodayChat = filterByMaxMessages(todayChatUser)
      
      userTodayChat.forEach(chat => {
          const userChatNum = chat.messages.filter(msg => msg.role === 'user').length;
          if (userChatNum <= 5) {
              result.userChatdetail.low++;
          } else if (userChatNum <= 10) {
              result.userChatdetail.medium++;
          } else if(userChatNum <= 100) {
              result.userChatdetail.high++;
          } else if( userChatNum <= 200) {
              result.userChatdetail.superhigh++;
          } else {
              result.userChatdetail.severe++;
          }
      });

      // 统计参与聊天和未参与聊天的用户数量
      const chatUserIds = userTodayChat.map(chat => chat.user_id);
      result.userChatdetail.chatUsers = userTodayChat.length; //参与聊天的用户
      const createdChatUser = new Set(
          todayChat
            .filter(chat => !chat.model && !chatUserIds.includes(chat.user_id))  // 筛选出没有model字段的聊天记录
            .map(chat => chat.user_id)     // 提取user_id
        )
      const created = createdChatUser.size;
      console.log(createdChatUser);
       
      result.userChatdetail.createdChatUsers =  created                // 使用size属性获取Set的大小 //仅创建对话的用户
      result.userChatdetail.noChatUsers = userIds.length - userTodayChat.length - created; //未参与聊天的用户

      // 统计总聊天记录数、有模型的聊天记录数和无模型的聊天记录数
      result.chatNum = chats.length; //总共对话实例
  } catch (error) {
      console.error('Error fetching chat data:', error);
  }

  return result;
}

// 导出新增用户信息
const exportNewUser = async (params = {}) => {
  const query = {
      createdAt: { $gte: new Date(params.createdAtStart), $lte: new Date(params.createdAtEnd) }
  };
  const day = moment.utc(params.createdAtStart).local().format('YYYY-MM-DD');

  try {
      // 查询符合条件且 build_type 为 'release' 的用户文档
      const users = await AiUser.find({ ...query, build_type: 'release' }).select('user_id').lean();
      const userIds = users.map(user => user.user_id);

      // 查询符合条件且 build_type 为 'debug' 的用户文档
      const debugUserList = await AiUser.find({ build_type: 'debug' }).select('user_id').lean();
      const debugUserIds = debugUserList.map(user => user.user_id);

      // 获取聊天数据
      const chatInfo = await getChatData(query, debugUserIds, userIds);

      // 计算参与聊天的用户数量
      const chatUserIds = chatInfo.userChatdetail.chatUsers;
      const createdChatUsers = chatInfo.userChatdetail.createdChatUsers;

      // 构建结果对象
      const result = {
          day,
          userCount: userIds.length,
          dialogCount: chatInfo.chatNum,
          chatNum: chatUserIds,
          takeUpRate: userIds.length == 0 ? '无' : ((chatUserIds / userIds.length) * 100).toFixed(2) + '%',
          noReplyCount: createdChatUsers,
          uncreatedCount: chatInfo.userChatdetail.noChatUsers,
          notParticipateRate: userIds.length == 0 ? '无' : (((userIds.length - chatUserIds) / userIds.length) * 100).toFixed(2) + '%',
          lowParticipate: chatInfo.userChatdetail.low,
          lowParticipateRate: chatUserIds == 0 ? '无' : ((chatInfo.userChatdetail.low / chatUserIds) * 100).toFixed(2) + '%',
          mediumParticipate: chatInfo.userChatdetail.medium,
          highParticipate: chatInfo.userChatdetail.high,
          mediumAndHighParticipateRate: chatUserIds == 0 ? '无' : (((chatInfo.userChatdetail.medium + chatInfo.userChatdetail.high) / chatUserIds) * 100).toFixed(2) + '%',
          superhighParticipate: chatInfo.userChatdetail.superhigh,
          severePaticipate: chatInfo.userChatdetail.severe,
      };

      return result;

  } catch (error) {
      console.error('Error fetching export new user data:', error);
      throw new Error('Failed to fetch export new user data');
  }
}

const remoteConfigsAdd = async (params) => {
    let version = params.version;
    let data = params.data;

    try {
        await RemoteConfig.create({ version, data });
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const remoteConfigsFind = async (params) => {
    let version = params.version;
    console.log("remoteConfigsFind", params);

    try {
        const doc = await RemoteConfig.findOne({ version });
        if (!doc) {
            return { success: false };
        }
        return doc
    } catch (error) {
        return { error: error };
    }
};

const remoteConfigsUpdate = async (params) => {
    console.log("Update params", params)
    let version = params.version;
    let data = params.data;
    try {
        const doc = await RemoteConfig.findOneAndUpdate(
            { version },              
            { $set: { data: data } },       
            { new: true }              
        );
        if (!doc) {
            return { success: false };
        }
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

const getRemoteConfigs = async () => {
    try {
        let docs = await RemoteConfig.find(
            { version: { $exists: true, $ne: "1.14" } },
            { version: 1, _id: 0 }
        ).lean();
        if (!docs || docs.length === 0) {
            return { success: false, message: "No valid versions found" };
        }
        return { success: true, data: docs };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

const localizationsAdd = async (params) => {
    let key = params.key;
    let values = params.values;

    try {
        await Localization.create({ key, values });
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

const localizationsFind = async (params) => {
    let key = params.key;

    try {
        const doc = await Localization.findOne({ key });
        if (!doc) {
            return { success: false };
        }
        return doc
    } catch (error) {
        return { error: error };
    }
}

const localizationsUpdate = async (params) => {
    let key = params.key;
    let values = params.values;
    try {
        const doc = await Localization.findOneAndUpdate(
            { key },              
            { $set: { values: values } },       
            { new: true }              
        );
        if (!doc) {
            return { success: false };
        }
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

const getLocalizations = async () => {
    try {
        let docs = await Localization.find(
            { key: { $exists: true } },
            { key: 1, _id: 0 }
        ).lean();
        if (!docs || docs.length === 0) {
            return { success: false, message: "No valid key found" };
        }
        return { success: true, data: docs };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

const setRemoteConfig = async (bundleId, version, data) => {
  const versionData = await AiConfig.findOne({bundleId, version });
  if (!versionData) {
    await AiConfig.create({bundleId, version, data });
  } else {
    const updateData = { ...versionData.data, ...data };
    await AiConfig.updateOne({ version, bundleId }, { $set: { data: updateData } });
  }
}

module.exports = {
    conversations,
    characters,
    reviseInfo,
    addcharacter,
    getgroups,
    deletegroups,
    updategroups,
    findExplore,
    updateOneExplore,
    deleteOneExplore,
    addExplore,
    addPrompt,
    updatePrompt,
    deletePrompt,
    findPrompt,
    pushData,
    updateManyExplore,
    addWorldInfo,
    deleteWorldInfo,
    updateWorldInfo,
    findWorldInfo,
    addCardPool,
    deleteCardPool,
    updateCardPool,
    findCardPool,
    exportNewUser,
    avatars,
    remoteConfigsAdd,
    remoteConfigsFind,
    remoteConfigsUpdate,
    getRemoteConfigs,
    localizationsAdd,
    localizationsFind,
    localizationsUpdate,
    getLocalizations,
    setRemoteConfig
}