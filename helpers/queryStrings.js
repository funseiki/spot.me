var User = {
    REGISTRATION              : 'INSERT INTO users SET ?'
,   VERIFY_REGISTRATION_TOKEN : 'SELECT * FROM users WHERE ?'
,   SET_REGISTRATION_VERIFIED : 'UPDATE users SET ? WHERE ? AND `dateJoined` >= DATE_SUB(NOW(), INTERVAL 5 DAY)'
,   CHECK_EMAIL_CONFIRMED     : 'SELECT emailConfirmed FROM users WHERE ?'
,   CHECK_EXISTING_EMAIL      : 'SELECT email FROM users WHERE ?'
,   VERIFY_LOGIN              : 'SELECT U.id, U.nickname, U.email, U.password, U.emailConfirmed FROM users U WHERE ?'
}

module.exports = {
    User: User
}
