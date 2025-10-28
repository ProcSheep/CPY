const { Appid, Topappdata, Appcategory } = require("../database/models");
const store = require("app-store-scraper");
const moment = require("moment");
const axios = require("axios");
const smm_path = "https://d3bgz9zkaro8zu.cloudfront.net/appevents";
const mongo_path = "https://d3bgz9zkaro8zu.cloudfront.net/mongo";
const getAppId = async (req, res) => {
  try {
    const result = await Appid.find();
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
};

const addAppId = async (req, res) => {
  try {
    console.log(req.body);
    const { appId, appName } = req.body;
    const result = await Appid.insertMany({ app_id: appId, app_name: appName });
    console.log(result);
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
};

// 主函数
const getAppData = async (req, res) => {
  try {
    // console.log(new Date());
    const page = parseInt(req.query.page) || 1; // 从请求中获取页码，默认为第一页
    const limit = parseInt(req.query.limit) || 10; // 从请求中获取每页的数据量，默认为 10 条
    const {
      genreId,
      free,
      time,
      time_value,
      id,
      appId,
      title,
      developer,
      released,
      released_value,
      checked,
    } = req.query;

    const collection_name = req.query.collection || "TOP_GROSSING_IOS";

    let matchQuery = { collection_name: collection_name };

    let totalpipe = { collection_name: collection_name };

    // 无需修改
    if (genreId) {
      matchQuery.genreId = genreId;
      totalpipe.genreId = genreId;
    }
    if (free != "all") {
      matchQuery.free = free;
      totalpipe.free = free;
    }
    if (id) {
      totalpipe.id = id;
      matchQuery.id = id;
    }
    if (appId) {
      // 查询操作符
      // i大小写不敏感， 针对appid数据
      // $regex: 用于在查询中通过正则表达式匹配字符串字段的值，实现模糊查询（类似 SQL 中的 LIKE 关键字）
      matchQuery.appId = { $regex: appId, $options: "i" };
      totalpipe.appId = { $regex: appId, $options: "i" };
    }

    if (title) {
      let regStr = title.split(/\s+/).join(".*");
      let reg = new RegExp(regStr, "i"); // 正则2
      matchQuery.title = { $regex: reg };
      totalpipe.title = { $regex: reg };
    }

    if (developer) {
      matchQuery.developer = { $regex: developer, $options: "i" };
      totalpipe.developer = { $regex: developer, $options: "i" };
    }

    if (time || time_value) {
      const filter = {};
      switch (time_value) {
        case "$gte":
          filter[time_value] = time; // 等价于 filter = { "$gte": time }
          break;
        case "$lte":
          filter[time_value] = time;
          break;
        case "$eq":
          // 查询全天的数据
          const startOfDay = new Date(time);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(time);
          endOfDay.setHours(23, 59, 59, 999);
          filter["$gte"] = moment(startOfDay).format("YYYY-MM-DD HH:mm:ss");
          filter["$lte"] = moment(endOfDay).format("YYYY-MM-DD HH:mm:ss");
          break;
        default:
          break;
      }
      matchQuery.time = filter;
      totalpipe.time = filter;
    }

    if (released || released_value) {
      const filter = {};
      switch (released_value) {
        case "$gte":
          filter[released_value] = released;
          break;
        case "$lte":
          filter[released_value] = released;
          break;
        case "$eq":
          let targetDate = new Date(released);
          let startOfDay = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate(),
            0,
            0,
            0,
            0
          );
          let endOfDay = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate(),
            23,
            59,
            59,
            999
          );
          filter["$gte"] = startOfDay.toISOString(); // 转换为UTC时间的ISO日期字符串
          filter["$lte"] = endOfDay.toISOString();
          break;
        default:
          // 处理未知的比较操作符或错误情况
          break;
      }
      matchQuery.released = filter;
      totalpipe.released = filter;
    }

    // 获取数据库数据
    const allCategories = await Appcategory.find().lean();

    // 1。data的参数
    const query =
      checked == "true"
        ? [
            // 去重
            {
              $group: {
                _id: "$id", // 根据 id 字段分组
                data: { $first: "$$ROOT" }, // 保留每组的第一个文档，假设原始文档结构是嵌套的（如包含 data、info 等子字段），$replaceRoot 可以将某个子字段的内容 “拎出来” 作为新的根文档，删除原文档的其他字段。
              },
            },
            {
              // $replaceRoot 是一个用于重定义文档结构的阶段操作符，它的核心作用是：将指定的子文档（或表达式结果）提升为文档的根节点，替换原文档的结构。
              $replaceRoot: {
                newRoot: "$data", // 重新投影为原始文档格式
              },
            },
            { $sort: { time: -1, sort: 1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ]
        : [{ $skip: (page - 1) * limit }, { $limit: limit }];

    // 2. total的参数
    let totalRecords;
    let data;
    if (checked == "true") {
      let total = [
        {
          $group: {
            _id: "$id", // 根据 id 字段分组
            data: { $first: "$$ROOT" }, // 保留每组的第一个文档
          },
        },
        {
          $count: "totalRecords", // 计算符合条件的文档数量
        },
      ];

      const pipeline = [
        { $match: matchQuery }, // 共享的过滤条件
        {
          $facet: {
            // 子管道1：获取当前页数据（分页）
            data: [{ $sort: { time: -1, sort: 1 } }, ...query],
            // 子管道2：获取总记录数
            total: [...total],
          },
        },
      ];

      // 一次请求完成2个参数，check为true的情况下data/totalRecords
      const result = await Topappdata.aggregate(pipeline).allowDiskUse(true);
      data = result[0].data;

      if (data.length === 0) {
        return res.json({
          data,
          currentPage: 0,
          totalPages: 0,
          totalRecords: 0,
          allCategories,
        });
      }

      totalRecords = result[0].total[0]?.totalRecords || 0; // 从 total 子管道取总数
    } else {
      // else的data和totalRecords
      data = await Topappdata.aggregate(pipeline).allowDiskUse(true);
      totalRecords = await Topappdata.countDocuments(totalpipe);
      console.log("数量2 " + new Date());
    }
    // 计算总页数
    const totalPages = Math.ceil(totalRecords / limit);

    return res.json({
      data,
      currentPage: page,
      totalPages, // 总页数
      totalRecords, // 总记录(总参数)
      allCategories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "服务器错误" });
  }
};

const getSimilarApp = async (req, res) => {
  try {
    const { id } = req.query;
    const response = await store.similar({ id });
    res.status(200).send(response);
  } catch (error) {
    res.status(404).send(error);
  }
};

const smmEventsData = async (req, res) => {
  try {
    const query = req.query;
    console.log(query);
    let result = [];
    const response = await axios.get(smm_path, {
      params: query,
    });
    console.log(response);
    result = response.data.data;
    console.log(result.length);
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
};

const mongoService = async (req, res) => {
  try {
    const query = req.query;
    let result = [];
    const response = await axios.get(mongo_path, {
      params: query,
    });
    result = response.data.result;
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
};
module.exports = {
  getAppId,
  addAppId,
  getAppData,
  getSimilarApp,
  smmEventsData,
  mongoService,
};
