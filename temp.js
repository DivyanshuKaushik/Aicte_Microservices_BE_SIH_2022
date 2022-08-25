function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
console.log(generatePassword());

const user = [{
    name:"Divyanshu Kauhsik",
    email:"divyanshukaushik44@gmail.com",
    phone:"7974707475",
    role:"admin",
    department:"admin"
}]

// console.log(JSON.stringify(user));
console.log(JSON.stringify(JSON.stringify(user)));