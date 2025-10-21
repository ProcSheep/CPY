


module.exports = {
  async queryRes(req, res, next) {
    const query = req.query
    // console.log(query)    

    res.json({
      code: 200,
      query,
      success: true
    })
  },

  async paramsRes(req,res,next){
    const params = req.params
    // console.log(params)

    res.json({
      code: 200,
      params,
      success: true
    })
  },

  async formRes(req,res,next){
    const body = req.body
    // console.log(body)

    res.json({
      code: 200,
      body,
      success: true
    })
  }
}