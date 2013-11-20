// Setting up the database for a postgres
var users =
    "CREATE  TABLE users (
        `id` INT NOT NULL AUTO_INCREMENT,
        `email` VARCHAR(100) NOT NULL ,
        `password` CHAR(60) NOT NULL ,
        `nickname` VARCHAR(100) NOT NULL ,
        `score` INT NOT NULL DEFAULT 0 ,
        `profileImage` VARCHAR(320) NULL ,
        `emailToken` VARCHAR(60) NULL ,
        `dateJoined` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
        `dateConfirmed` TIMESTAMP NULL ,
        `facebookToken` VARCHAR(500) NULL ,
        `twitterToken` VARCHAR(500) NULL ,
        PRIMARY KEY (`id`) ,
        UNIQUE INDEX `email_UNIQUE` (`email` ASC) );";

var spots =
    "CREATE  TABLE spots (
        `id` INT NOT NULL AUTO_INCREMENT ,
        `creatorid` INT NOT NULL ,
        `hint` VARCHAR(120) NOT NULL ,
        `story` VARCHAR(500) NOT NULL ,
        `picture` VARCHAR(320) NOT NULL ,
        `latitude` FLOAT(10,6) NOT NULL ,
        `longitude` FLOAT(10,6) NOT NULL ,
        `voteCount` INT NOT NULL DEFAULT 0 ,
        `dateCreated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
        PRIMARY KEY (`id`) );";

var spots_fkeys =
    "ALTER TABLE spots
        ADD CONSTRAINT `s_creatorid`
        FOREIGN KEY (`creatorID` )
        REFERENCES users (`id` )
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    , ADD INDEX `s_creatorid_idx` (`creatorID` ASC) ;";

var comments =
    "CREATE  TABLE comments (
        `id` INT NOT NULL AUTO_INCREMENT ,
        `spotid` INT NOT NULL ,
        `creatorid` INT NOT NULL ,
        `message` VARCHAR(120) NOT NULL ,
        `picture` VARCHAR(320) NOT NULL ,
        `dateCreated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
        PRIMARY KEY (`id`) );";

var comments_fkeys =
    "ALTER TABLE comments
        ADD CONSTRAINT `c_spotid`
        FOREIGN KEY (`spotid` )
        REFERENCES spots (`id` )
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
        ADD CONSTRAINT `c_creatorid`
        FOREIGN KEY (`creatorid` )
        REFERENCES users (`id` )
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    , ADD INDEX `c_spotid_idx` (`spotid` ASC)
    , ADD INDEX `c_userid_idx` (`creatorid` ASC) ;";

var spotsFound =
    "CREATE  TABLE spotsFound (
        `spotid` INT NOT NULL ,
        `userid` INT NOT NULL ,
        `dateFound` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
        PRIMARY KEY (`spotid`, `userid`) );";

var spotsFound_fkeys =
    "ALTER TABLE spotsfound
        ADD CONSTRAINT `sf_spotid`
        FOREIGN KEY (`spotid` )
        REFERENCES spots (`id` )
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
        ADD CONSTRAINT `sf_userid`
        FOREIGN KEY (`userid` )
        REFERENCES users (`id` )
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    , ADD INDEX `sf_sid_idx` (`spotid` ASC)
    , ADD INDEX `sf_userid_idx` (`userid` ASC) ;";
