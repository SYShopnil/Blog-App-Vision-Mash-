const cookieOptionHandler = (time) => {
    const options = {
        expires: new Date(
            Date.now() + time * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    return options
}

module.exports = cookieOptionHandler