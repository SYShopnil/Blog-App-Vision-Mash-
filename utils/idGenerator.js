const idGenerator = (firstName) => {
    let newId
    //generate 4 digit id 
    let randomNumberGenerator = ""
    for(let i = 1 ; i<=5; i++ ){
        randomNumberGenerator = Math.floor(Math.random() * 9 + 1) + randomNumberGenerator
    } //generate the random number form appointment
    newId = firstName + randomNumberGenerator
    return newId

}
module.exports = idGenerator
