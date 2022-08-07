function Response(status=200,message="success",data=[]){
    return {status,message,data};
}
function ErrorResponse(code=500,message="error"){
    return {error:{code,message}};
}
module.exports = {Response,ErrorResponse};