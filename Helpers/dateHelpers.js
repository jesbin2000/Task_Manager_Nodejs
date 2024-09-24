const remainingDays = (dueDate) =>{
    const currentDate = new Date();
    const timeDifference = new Date(dueDate) - currentDate ;
    const dayRemaining =  Math.ceil(timeDifference / (1000 * 60 * 60 * 24));   //millisecond to days
    return dayRemaining;
}

const formatDate = (date) => {
    const day = (`${date.getDate()}`);
    const month = (`${date.getMonth() + 1}`);
    const year = date.getFullYear().toString();
    
    return `${day}-${month}-${year}`;
};


const dateformating = (date) =>{
    const dueDate = new Date(date);
    const formattedDate = dueDate.toISOString().split('T')[0];
    return formattedDate; 
}


module.exports = { remainingDays, formatDate, dateformating }   