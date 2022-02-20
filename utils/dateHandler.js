const getCurrentMonthStartAndEndDay = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
        firstDay,
        lastDay
    }
}

const getTodayDate = () => {
    var start = new Date();
    start.setHours(0,0,0,0);

    var end = new Date();
    end.setHours(23,59,59,999);

    return {
        start,
        end
    }
}

module.exports = {
    currentMonthDateLimit : getCurrentMonthStartAndEndDay,
    getTodayDate
}