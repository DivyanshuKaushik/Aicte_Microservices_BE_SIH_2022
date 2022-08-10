function Response(status=200,message="success",data=[]){
    return {status,message,data};
}
module.exports = {Response};