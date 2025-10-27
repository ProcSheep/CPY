module.exports = function arrayChunks(arr,size){
    let chunks = []
    for(let i = 0; i < arr.length; i += size){
        let chunk = arr.slice(i,i+size)   
        chunks.push(chunk)
    }
    return chunks
}