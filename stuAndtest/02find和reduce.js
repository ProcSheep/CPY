// 筛选问题
const orderList = [
  {
    orderId: "OD20240501001",
    goods: ["衬衫", "裤子"],
    status: "待付款"
  },
  {
    orderId: "OD20240501002",
    goods: ["运动鞋"],
    status: "已发货"
  },
  {
    orderId: "OD20240501001", // 重复orderId
    goods: ["袜子"], // 新增商品
    status: "已付款" // 状态更新
  },
  {
    orderId: "OD20240501003",
    goods: ["背包"],
    status: "待发货"
  }
];

// acc是已经存入数据的临时表
const finalOrderList = orderList.reduce((acc,item) => {
    // 如果重复会返回acc的重复item
    const existInfo = acc.find((info) => info.orderId === item.orderId)
    if(existInfo){
        // 完善重复数据的信息
        existInfo.goods = [ ...existInfo.goods, ...item.goods]
        existInfo.status = item.status
    }else {
        acc.push(item)
    }
    return acc
}, []) // 初始值为空

console.log(finalOrderList)