const otpGenerator = (digit) => {
    let newOtp
    //generate 4 digit id 
    let randomNumberGenerator = ""
    for(let i = 1 ; i<=digit; i++ ){
        randomNumberGenerator = Math.floor(Math.random() * 9 + 1) + randomNumberGenerator
    } //generate the random number form appointment
    newOtp = randomNumberGenerator
    return newOtp

}
module.exports = otpGenerator