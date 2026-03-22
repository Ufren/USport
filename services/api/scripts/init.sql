-- 创建数据库
CREATE DATABASE IF NOT EXISTS `usport` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `usport`;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL COMMENT '用户名',
    `password` varchar(255) NOT NULL COMMENT '密码(加密)',
    `openid` varchar(100) DEFAULT NULL COMMENT '微信OpenID',
    `unionid` varchar(100) DEFAULT NULL COMMENT '微信UnionID',
    `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
    `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
    `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
    `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
    `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态: 1=正常, 0=禁用',
    `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_users_username` (`username`),
    UNIQUE KEY `idx_users_openid` (`openid`),
    UNIQUE KEY `idx_users_email` (`email`),
    KEY `idx_users_unionid` (`unionid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 场馆表
CREATE TABLE IF NOT EXISTS `venues` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL COMMENT '场馆名称',
    `address` varchar(255) DEFAULT NULL COMMENT '地址',
    `description` text COMMENT '描述',
    `image` varchar(255) DEFAULT NULL COMMENT '图片URL',
    `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态: 1=正常, 0=禁用',
    `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场馆表';

-- 活动表
CREATE TABLE IF NOT EXISTS `activities` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `title` varchar(100) NOT NULL COMMENT '活动标题',
    `description` text COMMENT '活动描述',
    `time` datetime NOT NULL COMMENT '活动时间',
    `venue_id` bigint unsigned DEFAULT NULL COMMENT '所属场馆ID',
    `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态: 1=正常, 0=取消',
    `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `idx_activities_venue_id` (`venue_id`),
    KEY `idx_activities_time` (`time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动表';

-- 预约表
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
    `venue_id` bigint unsigned NOT NULL COMMENT '场馆ID',
    `book_time` datetime NOT NULL COMMENT '预约时间',
    `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态: 1=已预约, 2=已完成, 0=已取消',
    `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `idx_bookings_user_id` (`user_id`),
    KEY `idx_bookings_venue_id` (`venue_id`),
    KEY `idx_bookings_book_time` (`book_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预约表';
