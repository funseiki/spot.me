var User = {
    REGISTRATION              : 'INSERT INTO users SET ?'
,   VERIFY_REGISTRATION_TOKEN : 'SELECT * FROM users WHERE ?'
,   SET_REGISTRATION_VERIFIED : 'UPDATE users SET ? WHERE ? AND `dateJoined` >= DATE_SUB(NOW(), INTERVAL 5 DAY)'
,   CHECK_EMAIL_CONFIRMED     : 'SELECT emailConfirmed FROM users WHERE ?'
,   CHECK_EXISTING_EMAIL      : 'SELECT email FROM users WHERE ?'
,   VERIFY_LOGIN              : 'SELECT U.id, U.nickname, U.email, U.password, U.emailConfirmed FROM users U WHERE ?'
,   SPOT_VERIFIED             : 'INSERT INTO spotsfound SET ?'
,   GET_NICKNAME: 'SELECT nickname from users WHERE ?'
,   GET_PROFILE: 'SELECT F.spotid, F.picture, F.dateFound FROM users U ' +
                'INNER JOIN allfoundspots F ON F.finderid=U.id WHERE U.id=?'
};

var Spot = {
    CREATE : 'INSERT INTO spots SET ?'
,   GET_LOCATION : 'SELECT latitude, longitude FROM spots WHERE ?'
,   GET_SPOTS_RAND_NOT_FOUND:   'SELECT SF.spotid, SF.clue, SF.picture as picture_url from '+
                                '(SELECT * FROM allfoundspots) as SF ' +
                                'WHERE  (SF.finderid is NULL OR SF.finderid<>?) ' +
                                'AND (SF.creatorid<>?) ' +
                                'AND (SF.latitude BETWEEN ? AND ?) '+
                                'AND (SF.longitude BETWEEN ? AND ?) ' +
                                'GROUP BY SF.spotid ' +
                                'ORDER BY RAND() LIMIT 5'
                                //'ORDER BY SF.spotid asc'
,   CREATE_COMMENT: 'INSERT INTO comments SET ?'
,   CHECK_VERIFIED: 'SELECT * FROM spotsfound WHERE ? AND ?'
,   GET_SPOT_DATA: 'SELECT picture FROM spots WHERE ?'
,   GET_COMMENTS: 'SELECT U.nickname, C.message, C.picture, C.dateCommented FROM comments C ' +
                  'INNER JOIN users U on C.creatorid = U.id '+
                  'WHERE ? order by dateCommented asc'
,   GET_SPOTS_NOT_MINE: 'SELECT S.spotid, S.clue, S.picture, SF.dateFound ' +
                    'FROM allspotclues S ' +
                    'LEFT JOIN spotsfound SF ON (S.spotid = SF.spotid AND SF.userid=?) ' +
                    'WHERE (S.creatorid<>?) ' +
                    'AND (S.latitude BETWEEN ? AND ?) '+
                    'AND (S.longitude BETWEEN ? AND ?) ' +
                    'ORDER BY SF.spotid LIMIT 10'

};

var List = {
    CREATE: 'INSERT INTO userlists SET ?'
,   INSERT_RANDOM:  'INSERT INTO listcontains(spotid, listid) ' +
                    '(SELECT  SF.spotid, ? from '+
                    '(SELECT * FROM allfoundspots) as SF ' +
                    'WHERE  (SF.finderid is NULL OR SF.finderid<>?) ' +
                    'AND (SF.creatorid<>?) ' +
                    'AND (SF.latitude BETWEEN ? AND ?) '+
                    'AND (SF.longitude BETWEEN ? AND ?) ' +
                    'GROUP BY SF.spotid ' +
                    'ORDER BY RAND() LIMIT 5)'
,   GET_CURRENT_OLD: 'SELECT S.spotid, S.story, S.clue, S.picture, IFNULL(dateFound, \'NOT_FOUND\') as dateFound FROM listinfo L ' +
        'INNER JOIN allspotclues S on L.spotid=S.spotid ' +
        'LEFT JOIN spotsfound F on F.userid=L.ownerid ' +
        'WHERE L.ownerid=? AND L.isCurrent=1'
,   GET_CURRENT: 'SELECT SF.spotid, SF.clue, SF.picture, IFNULL(dateFound, \'NOT_FOUND\') as dateFound '+
                    'FROM allfoundspots as SF ' +
                    'WHERE (SF.creatorid<>?) ' +
                    'AND (SF.latitude BETWEEN ? AND ?) '+
                    'AND (SF.longitude BETWEEN ? AND ?) ' +
                    'GROUP BY SF.spotid ' +
                    'ORDER BY SF.spotid LIMIT 10'

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
