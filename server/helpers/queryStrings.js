var User = {
    REGISTRATION              : 'INSERT INTO users SET ?'
,   VERIFY_REGISTRATION_TOKEN : 'SELECT * FROM users WHERE ?'
,   SET_REGISTRATION_VERIFIED : 'UPDATE users SET ? WHERE ? AND `dateJoined` >= DATE_SUB(NOW(), INTERVAL 5 DAY)'
,   CHECK_EMAIL_CONFIRMED     : 'SELECT emailConfirmed FROM users WHERE ?'
,   CHECK_EXISTING_EMAIL      : 'SELECT email FROM users WHERE ?'
,   VERIFY_LOGIN              : 'SELECT U.id, U.nickname, U.email, U.password, U.emailConfirmed FROM users U WHERE ?'
,   SPOT_VERIFIED             : 'INSERT INTO spotsfound SET ?'
};

var Spot = {
    CREATE : 'INSERT INTO spots SET ?'
,   GET_LOCATION : 'SELECT latitude, longitude FROM spots WHERE ?'
,   GET_SPOTS_RAND_NOT_FOUND:   'SELECT SF.spotid, SF.clue, SF.picture as picture_url from '+
                                '(SELECT * FROM allFoundSpots) as SF ' +
                                'WHERE  (SF.finderid is NULL OR SF.finderid<>?) ' +
                                'AND (SF.creatorid<>?) ' +
                                'AND (SF.latitude BETWEEN ? AND ?) '+
                                'AND (SF.longitude BETWEEN ? AND ?) ' +
                                'GROUP BY SF.spotid ' +
                                'ORDER BY RAND() LIMIT 5'
                                //'ORDER BY SF.spotid asc'
};

var List = {
    CREATE: 'INSERT INTO userlists SET ?'
,   INSERT_RANDOM:  'INSERT INTO listcontains(spotid, listid) ' +
                    '(SELECT  SF.spotid, ? from '+
                    '(SELECT * FROM allFoundSpots) as SF ' +
                    'WHERE  (SF.finderid is NULL OR SF.finderid<>?) ' +
                    'AND (SF.creatorid<>?) ' +
                    'AND (SF.latitude BETWEEN ? AND ?) '+
                    'AND (SF.longitude BETWEEN ? AND ?) ' +
                    'GROUP BY SF.spotid ' +
                    'ORDER BY RAND() LIMIT 5)'

};

var Clue = {
    CREATE : 'INSERT INTO clues SET ?'
}

module.exports = {
    User: User,
    Spot: Spot,
    Clue: Clue,
    List: List
};
