function getCurrentDate() {
  let now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth()
  let date = now.getDate()
  month += 1
  month = month.toString().padStart(2, '0')
  date = date.toString().padStart(2, '0')
  let defaultDate = year + '-' + month + '-' + date
  return defaultDate
}
module.exports = {
  date: getCurrentDate
}