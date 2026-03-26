CREATE DATABASE IF NOT EXISTS `usport`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `usport`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) DEFAULT NULL COMMENT '微信 OpenID',
  `unionid` varchar(100) DEFAULT NULL COMMENT '微信 UnionID',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像 URL',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态：1=正常，0=禁用',
  `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_openid` (`openid`),
  KEY `idx_users_unionid` (`unionid`),
  KEY `idx_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

CREATE TABLE IF NOT EXISTS `activities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `host_user_id` bigint unsigned NOT NULL COMMENT '主办方用户 ID',
  `title` varchar(120) NOT NULL COMMENT '活动标题',
  `description` text COMMENT '活动描述',
  `sport_code` varchar(32) NOT NULL COMMENT '运动编码',
  `sport_label` varchar(32) NOT NULL COMMENT '运动名称',
  `district` varchar(64) NOT NULL COMMENT '区域',
  `venue_name` varchar(120) NOT NULL COMMENT '场馆名称',
  `address_hint` varchar(255) DEFAULT NULL COMMENT '地址提示',
  `start_at` datetime NOT NULL COMMENT '开始时间',
  `end_at` datetime NOT NULL COMMENT '结束时间',
  `signup_deadline_at` datetime NOT NULL COMMENT '报名截止时间',
  `capacity` int NOT NULL COMMENT '正式名额',
  `waitlist_capacity` int NOT NULL DEFAULT '0' COMMENT '候补名额',
  `fee_type` varchar(32) NOT NULL COMMENT '收费类型',
  `fee_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '费用金额',
  `join_rule` varchar(32) NOT NULL COMMENT '报名规则',
  `visibility` varchar(32) NOT NULL COMMENT '可见性',
  `status` varchar(32) NOT NULL DEFAULT 'published' COMMENT '活动状态',
  `suitable_crowd` json DEFAULT NULL COMMENT '适合人群',
  `notices` json DEFAULT NULL COMMENT '报名须知',
  `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_activities_host_user_id` (`host_user_id`),
  KEY `idx_activities_sport_code` (`sport_code`),
  KEY `idx_activities_district` (`district`),
  KEY `idx_activities_start_at` (`start_at`),
  KEY `idx_activities_signup_deadline_at` (`signup_deadline_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动表';

CREATE TABLE IF NOT EXISTS `activity_participants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `activity_id` bigint unsigned NOT NULL COMMENT '活动 ID',
  `user_id` bigint unsigned NOT NULL COMMENT '用户 ID',
  `status` varchar(32) NOT NULL COMMENT '参与状态：registered / waitlisted / cancelled',
  `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_activity_participants_activity_user` (`activity_id`,`user_id`),
  KEY `idx_activity_participants_user_id` (`user_id`),
  KEY `idx_activity_participants_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动参与表';

CREATE TABLE IF NOT EXISTS `invitations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `activity_id` bigint unsigned NOT NULL COMMENT '活动 ID',
  `sender_user_id` bigint unsigned NOT NULL COMMENT '发起邀约的用户 ID',
  `receiver_user_id` bigint unsigned NOT NULL COMMENT '接收邀约的用户 ID',
  `message` varchar(255) DEFAULT NULL COMMENT '邀约附言',
  `status` varchar(32) NOT NULL DEFAULT 'pending' COMMENT '邀约状态：pending / accepted / declined / expired',
  `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_invitations_activity_id` (`activity_id`),
  KEY `idx_invitations_sender_user_id` (`sender_user_id`),
  KEY `idx_invitations_receiver_user_id` (`receiver_user_id`),
  KEY `idx_invitations_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动邀约表';

CREATE TABLE IF NOT EXISTS `reports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reporter_user_id` bigint unsigned NOT NULL COMMENT '举报人用户 ID',
  `target_type` varchar(32) NOT NULL COMMENT '举报对象类型',
  `target_id` bigint unsigned NOT NULL COMMENT '举报对象 ID',
  `reason_code` varchar(64) NOT NULL COMMENT '举报原因编码',
  `description` varchar(500) DEFAULT NULL COMMENT '举报补充说明',
  `status` varchar(32) NOT NULL DEFAULT 'open' COMMENT '举报状态',
  `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_reports_reporter_user_id` (`reporter_user_id`),
  KEY `idx_reports_target` (`target_type`,`target_id`),
  KEY `idx_reports_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='举报工单表';

CREATE TABLE IF NOT EXISTS `credit_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '用户 ID',
  `event_code` varchar(64) NOT NULL COMMENT '信用事件编码',
  `delta` int NOT NULL COMMENT '信用分变动',
  `description` varchar(255) DEFAULT NULL COMMENT '信用事件说明',
  `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_credit_records_user_id` (`user_id`),
  KEY `idx_credit_records_event_code` (`event_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='信用记录表';

CREATE TABLE IF NOT EXISTS `membership_plans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(32) NOT NULL COMMENT '套餐编码',
  `name` varchar(64) NOT NULL COMMENT '套餐名称',
  `price_cents` int NOT NULL COMMENT '价格（分）',
  `duration_days` int NOT NULL COMMENT '有效天数',
  `description` varchar(255) DEFAULT NULL COMMENT '套餐说明',
  `benefits` json DEFAULT NULL COMMENT '权益列表',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否可售',
  `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_membership_plans_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员套餐表';

CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '用户 ID',
  `plan_code` varchar(32) NOT NULL COMMENT '套餐编码',
  `status` varchar(32) NOT NULL COMMENT '订阅状态',
  `start_at` datetime DEFAULT NULL COMMENT '生效时间',
  `expire_at` datetime DEFAULT NULL COMMENT '过期时间',
  `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_subscriptions_user_id` (`user_id`),
  KEY `idx_subscriptions_plan_code` (`plan_code`),
  KEY `idx_subscriptions_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员订阅表';

CREATE TABLE IF NOT EXISTS `payment_orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '用户 ID',
  `plan_code` varchar(32) NOT NULL COMMENT '套餐编码',
  `amount_cents` int NOT NULL COMMENT '订单金额（分）',
  `status` varchar(32) NOT NULL COMMENT '订单状态',
  `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_payment_orders_user_id` (`user_id`),
  KEY `idx_payment_orders_plan_code` (`plan_code`),
  KEY `idx_payment_orders_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员订单表';

CREATE TABLE IF NOT EXISTS `admin_audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `operator` varchar(64) NOT NULL COMMENT '后台操作人',
  `action_code` varchar(64) NOT NULL COMMENT '操作类型',
  `target_type` varchar(32) NOT NULL COMMENT '目标类型',
  `target_id` bigint unsigned NOT NULL COMMENT '目标 ID',
  `detail` varchar(500) DEFAULT NULL COMMENT '补充说明',
  `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_admin_audit_logs_action_code` (`action_code`),
  KEY `idx_admin_audit_logs_target` (`target_type`,`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='后台审计日志表';

INSERT INTO `users` (`id`, `openid`, `phone`, `nickname`, `status`)
VALUES
  (1, 'dev:mock-phone-user', '13800138000', 'USport手机用户', 1),
  (2, 'dev:mock-code-for-rn', NULL, 'USport体验官', 1),
  (3, 'dev:mock-running-buddy', '13900139000', '晨跑搭子', 1)
ON DUPLICATE KEY UPDATE
  `nickname` = VALUES(`nickname`),
  `phone` = VALUES(`phone`),
  `status` = VALUES(`status`);

INSERT INTO `activities` (
  `id`, `host_user_id`, `title`, `description`, `sport_code`, `sport_label`, `district`, `venue_name`, `address_hint`,
  `start_at`, `end_at`, `signup_deadline_at`, `capacity`, `waitlist_capacity`, `fee_type`, `fee_amount`,
  `join_rule`, `visibility`, `status`, `suitable_crowd`, `notices`
)
VALUES
  (
    1001, 1, '今晚 8 人羽毛球友好局', '下班后快速成局，适合单人直接加入。', 'badminton', '羽毛球', '浦东新区', '源深体育馆 3 号场', '距离地铁口步行约 300 米。',
    '2026-03-24 19:30:00', '2026-03-24 21:30:00', '2026-03-24 18:50:00', 8, 2, 'aa', 48.00,
    'direct', 'public', 'published', JSON_ARRAY('中级友好', '单人可报', '女生友好'), JSON_ARRAY('建议提前 15 分钟到场热身。', '临时无法参加请尽量在截止前取消。')
  ),
  (
    1002, 1, '周六清晨滨江 8 公里配速跑', '固定配速领跑，跑后一起早餐。', 'running', '跑步', '徐汇区', '龙美术馆集合点', '公开集合点明确，路线沿江。',
    '2026-03-28 07:15:00', '2026-03-28 08:30:00', '2026-03-28 06:30:00', 18, 0, 'free', 0.00,
    'direct', 'public', 'published', JSON_ARRAY('晨跑习惯者', '轻社交', '长期复约'), JSON_ARRAY('遇雨会在前一晚通知调整。')
  )
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `district` = VALUES(`district`),
  `venue_name` = VALUES(`venue_name`),
  `start_at` = VALUES(`start_at`),
  `end_at` = VALUES(`end_at`),
  `signup_deadline_at` = VALUES(`signup_deadline_at`),
  `capacity` = VALUES(`capacity`),
  `waitlist_capacity` = VALUES(`waitlist_capacity`),
  `fee_type` = VALUES(`fee_type`),
  `fee_amount` = VALUES(`fee_amount`),
  `status` = VALUES(`status`),
  `suitable_crowd` = VALUES(`suitable_crowd`),
  `notices` = VALUES(`notices`);

INSERT INTO `activity_participants` (`activity_id`, `user_id`, `status`)
VALUES
  (1001, 1, 'registered'),
  (1001, 2, 'registered'),
  (1002, 1, 'registered')
ON DUPLICATE KEY UPDATE
  `status` = VALUES(`status`);

INSERT INTO `invitations` (`id`, `activity_id`, `sender_user_id`, `receiver_user_id`, `message`, `status`)
VALUES
  (4001, 1002, 1, 2, '周六晨跑这次节奏会比较稳，欢迎你一起来。', 'pending'),
  (4002, 1001, 1, 2, '今晚这场羽毛球局还差两位稳定搭子，我觉得你会很适合。', 'accepted')
ON DUPLICATE KEY UPDATE
  `message` = VALUES(`message`),
  `status` = VALUES(`status`);

INSERT INTO `reports` (`id`, `reporter_user_id`, `target_type`, `target_id`, `reason_code`, `description`, `status`)
VALUES
  (5001, 2, 'activity', 1001, 'host_no_show', '主办方临时迟到，现场组织比较混乱。', 'in_review'),
  (5002, 1, 'user', 2, 'spam_invite', '短时间内重复发送无关邀约。', 'resolved_invalid')
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`),
  `status` = VALUES(`status`);

INSERT INTO `credit_records` (`id`, `user_id`, `event_code`, `delta`, `description`)
VALUES
  (6001, 1, 'attendance_stable', 4, '连续 3 场稳定到场'),
  (6002, 1, 'attendance_stable', 2, '本周履约表现稳定'),
  (6003, 2, 'late_cancel', -6, '活动开始前 1 小时临时取消'),
  (6004, 2, 'report_valid', -8, '举报成立，推荐权重下调')
ON DUPLICATE KEY UPDATE
  `delta` = VALUES(`delta`),
  `description` = VALUES(`description`);

INSERT INTO `membership_plans` (`id`, `code`, `name`, `price_cents`, `duration_days`, `description`, `benefits`, `is_active`)
VALUES
  (7001, 'starter_month', '月度会员', 1990, 30, '适合稳定每周参加 2-3 次同城运动局的用户。', JSON_ARRAY('活动曝光提升', '高级筛选', '推荐优先展示'), 1),
  (7002, 'season_pass', '季度会员', 4990, 90, '适合持续找搭子、频繁组局和沉淀履约信用的深度用户。', JSON_ARRAY('更高曝光加权', '优先候补转正', '更完整履约数据看板'), 1)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `price_cents` = VALUES(`price_cents`),
  `duration_days` = VALUES(`duration_days`),
  `description` = VALUES(`description`),
  `benefits` = VALUES(`benefits`),
  `is_active` = VALUES(`is_active`);

INSERT INTO `subscriptions` (`id`, `user_id`, `plan_code`, `status`, `start_at`, `expire_at`)
VALUES
  (8001, 1, 'season_pass', 'active', '2026-03-01 00:00:00', '2026-05-30 23:59:59')
ON DUPLICATE KEY UPDATE
  `plan_code` = VALUES(`plan_code`),
  `status` = VALUES(`status`),
  `start_at` = VALUES(`start_at`),
  `expire_at` = VALUES(`expire_at`);

INSERT INTO `payment_orders` (`id`, `user_id`, `plan_code`, `amount_cents`, `status`)
VALUES
  (9001, 1, 'season_pass', 4990, 'paid'),
  (9002, 2, 'starter_month', 1990, 'paid')
ON DUPLICATE KEY UPDATE
  `amount_cents` = VALUES(`amount_cents`),
  `status` = VALUES(`status`);

INSERT INTO `admin_audit_logs` (`id`, `operator`, `action_code`, `target_type`, `target_id`, `detail`)
VALUES
  (10001, 'ops.luna', 'report_in_review', 'report', 5001, '已转入人工复核'),
  (10002, 'ops.luna', 'report_resolved_invalid', 'report', 5002, '证据不足，关闭工单')
ON DUPLICATE KEY UPDATE
  `detail` = VALUES(`detail`);
