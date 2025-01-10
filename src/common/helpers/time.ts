// Function which returns timestamp of 'hours' from now
export const postHours = (hours: number): Date  => {
    const now = new Date();
    const currHour = new Date().getHours();
    now.setHours(currHour + hours);
    return now;
};