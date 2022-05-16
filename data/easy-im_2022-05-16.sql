# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.7.35)
# Database: easy-im
# Generation Time: 2022-05-16 02:28:07 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table app_group
# ------------------------------------------------------------

DROP TABLE IF EXISTS `app_group`;

CREATE TABLE `app_group` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `creator` bigint(20) NOT NULL COMMENT '创建人',
  `name` varchar(255) NOT NULL DEFAULT '',
  `avatar` varchar(255) DEFAULT NULL,
  `intrduce` text COMMENT '群介绍',
  `limit` int(5) NOT NULL DEFAULT '100' COMMENT '群上限',
  `create_time` int(11) NOT NULL,
  `update_time` int(11) DEFAULT NULL,
  `status` int(2) NOT NULL DEFAULT '1' COMMENT '状态',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `app_group` WRITE;
/*!40000 ALTER TABLE `app_group` DISABLE KEYS */;

INSERT INTO `app_group` (`id`, `creator`, `name`, `avatar`, `intrduce`, `limit`, `create_time`, `update_time`, `status`)
VALUES
	(1000,1000,'测试一群','https://im.wangcai.me/speedy_avatar_7.jpg','测试一群',100,1591349594,NULL,1);

/*!40000 ALTER TABLE `app_group` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table app_message
# ------------------------------------------------------------

DROP TABLE IF EXISTS `app_message`;

CREATE TABLE `app_message` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `hash` varchar(40) NOT NULL DEFAULT '',
  `dist_id` bigint(20) NOT NULL COMMENT '群聊是群的id',
  `dist_type` tinyint(2) NOT NULL DEFAULT '1' COMMENT '1 - 私聊 2 - 群聊',
  `content_type` varchar(20) NOT NULL DEFAULT 'text' COMMENT 'text,audio,image,video',
  `content` text NOT NULL COMMENT '内容或者地址',
  `is_received` tinyint(2) NOT NULL DEFAULT '0' COMMENT '对方是否收到',
  `is_sent` tinyint(2) NOT NULL DEFAULT '0' COMMENT '是否已经发送给对方',
  `is_read` tinyint(2) NOT NULL DEFAULT '0',
  `create_time` int(11) NOT NULL,
  `update_time` int(11) DEFAULT NULL,
  `status` tinyint(2) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table app_relation
# ------------------------------------------------------------

DROP TABLE IF EXISTS `app_relation`;

CREATE TABLE `app_relation` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint(20) NOT NULL,
  `friend_id` bigint(20) NOT NULL,
  `remark` varchar(255) NOT NULL DEFAULT '',
  `create_time` int(11) NOT NULL,
  `update_time` int(11) DEFAULT NULL,
  `status` int(2) NOT NULL DEFAULT '1' COMMENT '0 - 删除 1 - 正常 2 - 拉黑',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `app_relation` WRITE;
/*!40000 ALTER TABLE `app_relation` DISABLE KEYS */;

INSERT INTO `app_relation` (`id`, `uid`, `friend_id`, `remark`, `create_time`, `update_time`, `status`)
VALUES
	(1,1000,1001,'test',0,NULL,1),
	(2,1000,1002,'',0,NULL,1),
	(3,1000,1003,'',0,NULL,1),
	(4,1001,1000,'',0,NULL,1),
	(5,1002,1000,'',0,NULL,1),
	(6,1003,1000,'',0,NULL,1),
	(9,1000,1004,'',0,NULL,1),
	(10,1004,1000,'',0,NULL,1),
	(11,1006,1000,'',0,NULL,1),
	(12,1000,1006,'',0,NULL,1);

/*!40000 ALTER TABLE `app_relation` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table app_relation_request
# ------------------------------------------------------------

DROP TABLE IF EXISTS `app_relation_request`;

CREATE TABLE `app_relation_request` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint(20) NOT NULL,
  `dist_id` bigint(20) NOT NULL,
  `message` varchar(512) DEFAULT NULL,
  `remark` varchar(512) DEFAULT NULL,
  `create_time` int(11) NOT NULL,
  `update_time` int(11) DEFAULT NULL,
  `status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0 - 发起 1 - 同意 2 - 拒绝',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table app_role
# ------------------------------------------------------------

DROP TABLE IF EXISTS `app_role`;

CREATE TABLE `app_role` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `create_time` int(11) NOT NULL,
  `update_time` int(11) DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table app_user
# ------------------------------------------------------------

DROP TABLE IF EXISTS `app_user`;

CREATE TABLE `app_user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nickname` varchar(255) NOT NULL DEFAULT '',
  `mobile` bigint(11) NOT NULL,
  `password` varchar(255) NOT NULL DEFAULT '',
  `avatar` varchar(255) DEFAULT '',
  `gender` tinyint(3) NOT NULL DEFAULT '2',
  `token` varchar(255) DEFAULT NULL,
  `client_id` varchar(255) DEFAULT NULL COMMENT 'socket_id',
  `client_type` varchar(50) DEFAULT NULL,
  `create_time` int(11) NOT NULL,
  `update_time` int(11) DEFAULT NULL,
  `status` tinyint(2) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `app_user` WRITE;
/*!40000 ALTER TABLE `app_user` DISABLE KEYS */;

INSERT INTO `app_user` (`id`, `nickname`, `mobile`, `password`, `avatar`, `gender`, `token`, `client_id`, `client_type`, `create_time`, `update_time`, `status`)
VALUES
	(1000,'老罗',13600000000,'bfb65029b42c5f55c5011640e6694fc2f7ff135b','/im/app/avatar/8.jpeg',0,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEwMDAsImlhdCI6MTY1MjE1MDE0NiwiZXhwIjoxNjU5OTI2MTQ2fQ.0UQTZmFtsstha-31H9n1OxOKl6f_tPRiMJq9jiIlUZ0','','android',1591349594,NULL,1),
	(1001,'小七',13600000001,'bfb65029b42c5f55c5011640e6694fc2f7ff135b','/im/app/avatar/1.jpeg',1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEwMDEsImlhdCI6MTY1MTkxNTczMCwiZXhwIjoxNjU5NjkxNzMwfQ.SWq3VU1LmAG_k5jm4yezf3hEWXCcK68H7huKaCPDfOE','','android',1591349594,NULL,1),
	(1002,'小青',13600000002,'f3d96989e354a986df74f6459afe38cb88c28c4c','/im/app/avatar/2.jpeg',1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEwMDIsImlhdCI6MTYwMzMzNTIyNSwiZXhwIjoxNjAzOTQwMDI1fQ.IqqHtpIVfqixmvq5uSIzJB8rJe7BBIMTTnse7Em6EpI','','android',1591349594,NULL,1),
	(1003,'小白',13600000003,'f3d96989e354a986df74f6459afe38cb88c28c4c','/im/app/avatar/3.jpeg',1,'','','',1591349594,NULL,1),
	(1004,'kitim1004',13600000004,'f3d96989e354a986df74f6459afe38cb88c28c4c','/im/app/avatar/4.jpeg',0,NULL,NULL,NULL,1591349594,NULL,1),
	(1005,'kitim1005',13600000005,'f3d96989e354a986df74f6459afe38cb88c28c4c','/im/app/avatar/5.jpeg',0,NULL,NULL,NULL,1591349594,NULL,1),
	(1006,'kitim_1006',13600000006,'f3d96989e354a986df74f6459afe38cb88c28c4c','/im/app/avatar/6.jpeg',0,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEwMDYsImlhdCI6MTYxMDYyMTA3OSwiZXhwIjoxNjExMjI1ODc5fQ.AdjZM-93F2JL5XEtTBWR5SekML_ATS6EjjmMf4wDjwI','','android',1591349594,NULL,1),
	(1007,'小楠',13600000007,'f3d96989e354a986df74f6459afe38cb88c28c4c','/im/app/avatar/7.jpeg',0,NULL,NULL,NULL,1591349594,NULL,1);

/*!40000 ALTER TABLE `app_user` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table app_user_group
# ------------------------------------------------------------

DROP TABLE IF EXISTS `app_user_group`;

CREATE TABLE `app_user_group` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `remark` varchar(255) DEFAULT NULL COMMENT '群备注，别名',
  `role_id` int(11) DEFAULT NULL COMMENT '群角色',
  `create_time` int(11) NOT NULL,
  `update_time` int(11) DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table view_user_friends
# ------------------------------------------------------------

DROP VIEW IF EXISTS `view_user_friends`;

CREATE TABLE `view_user_friends` (
   `id` BIGINT(20) UNSIGNED NOT NULL DEFAULT '0',
   `uid` BIGINT(20) NOT NULL,
   `friend_id` BIGINT(20) NOT NULL,
   `remark` VARCHAR(255) NOT NULL DEFAULT '',
   `nickname` VARCHAR(255) NOT NULL DEFAULT '',
   `mobile` BIGINT(11) NOT NULL,
   `avatar` VARCHAR(255) NULL DEFAULT '',
   `gender` TINYINT(3) NOT NULL DEFAULT '2',
   `client_id` VARCHAR(255) NULL DEFAULT NULL,
   `client_type` VARCHAR(50) NULL DEFAULT NULL,
   `create_time` INT(11) NOT NULL,
   `status` INT(2) NOT NULL DEFAULT '1'
) ENGINE=MyISAM;



# Dump of table view_user_group
# ------------------------------------------------------------

DROP VIEW IF EXISTS `view_user_group`;

CREATE TABLE `view_user_group` (
   `uid` BIGINT(20) NOT NULL,
   `user_group_remark` VARCHAR(255) NULL DEFAULT NULL,
   `user_group_status` TINYINT(4) NOT NULL DEFAULT '1',
   `group_id` BIGINT(20) NOT NULL,
   `name` VARCHAR(255) NULL DEFAULT '',
   `avatar` VARCHAR(255) NULL DEFAULT NULL,
   `intrduce` TEXT NULL DEFAULT NULL,
   `limit` INT(5) NULL DEFAULT '100',
   `group_status` INT(2) NULL DEFAULT '1',
   `create_time` INT(11) NULL DEFAULT NULL,
   `role_name` VARCHAR(255) NULL DEFAULT '',
   `role_id` INT(11) NULL DEFAULT NULL,
   `role_status` TINYINT(4) NULL DEFAULT '1'
) ENGINE=MyISAM;





# Replace placeholder table for view_user_friends with correct view syntax
# ------------------------------------------------------------

DROP TABLE `view_user_friends`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `view_user_friends`
AS SELECT
   `R`.`id` AS `id`,
   `R`.`uid` AS `uid`,
   `R`.`friend_id` AS `friend_id`,
   `R`.`remark` AS `remark`,
   `U`.`nickname` AS `nickname`,
   `U`.`mobile` AS `mobile`,
   `U`.`avatar` AS `avatar`,
   `U`.`gender` AS `gender`,
   `U`.`client_id` AS `client_id`,
   `U`.`client_type` AS `client_type`,
   `U`.`create_time` AS `create_time`,
   `R`.`status` AS `status`
FROM (`app_user` `U` join `app_relation` `R` on((`U`.`id` = `R`.`friend_id`)));


# Replace placeholder table for view_user_group with correct view syntax
# ------------------------------------------------------------

DROP TABLE `view_user_group`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `view_user_group`
AS SELECT
   `u`.`uid` AS `uid`,
   `u`.`remark` AS `user_group_remark`,
   `u`.`status` AS `user_group_status`,
   `u`.`group_id` AS `group_id`,
   `a`.`name` AS `name`,
   `a`.`avatar` AS `avatar`,
   `a`.`intrduce` AS `intrduce`,
   `a`.`limit` AS `limit`,
   `a`.`status` AS `group_status`,
   `a`.`create_time` AS `create_time`,
   `b`.`name` AS `role_name`,
   `u`.`role_id` AS `role_id`,
   `b`.`status` AS `role_status`
FROM ((`app_user_group` `u` left join `app_group` `a` on((`u`.`group_id` = `a`.`id`))) left join `app_role` `b` on((`u`.`role_id` = `b`.`id`)));

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
