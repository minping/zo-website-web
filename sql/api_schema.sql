-- =====================================================
-- ZO Website - API 模块 数据库表结构
-- 基于 ApiDetail.vue / AdminApiList.vue 设计
-- =====================================================

CREATE DATABASE IF NOT EXISTS `zo_website` DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `zo_website`;

-- -----------------------------------------------------
-- 1. API 分类标签表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `zo_api_tag`;
CREATE TABLE `zo_api_tag` (
  `id`            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `tag_name`      VARCHAR(50)      NOT NULL                 COMMENT '标签名称（如：工具、AI、图片、生活）',
  `tag_color`     VARCHAR(20)      NOT NULL DEFAULT '#6366f1' COMMENT '标签颜色（HEX）',
  `sort_order`    INT              NOT NULL DEFAULT 0       COMMENT '排序权重，越大越靠前',
  `created_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tag_name` (`tag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='API 分类标签表';


-- -----------------------------------------------------
-- 2. API 主表
-- -----------------------------------------------------
DROP TABLE IF EXISTS `zo_api`;
CREATE TABLE `zo_api` (
  `id`              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `name`            VARCHAR(200)     NOT NULL                 COMMENT 'API 名称（如：随机壁纸 API）',
  `description`     TEXT                                      COMMENT 'API 描述',
  `endpoint`        VARCHAR(500)     NOT NULL                 COMMENT '请求地址（如：https://api.example.com/wallpaper）',
  `method`          ENUM('GET','POST','PUT','DELETE','PATCH') NOT NULL DEFAULT 'GET' COMMENT '请求方法',
  `tag_id`          BIGINT UNSIGNED  DEFAULT NULL             COMMENT '关联分类标签 ID',
  `tag_color`       VARCHAR(20)      DEFAULT NULL             COMMENT '标签颜色（冗余字段，方便前端直接使用）',
  `is_free`         TINYINT(1)       NOT NULL DEFAULT 1       COMMENT '是否免费：1-免费，0-付费',
  `price`           DECIMAL(10,2)    DEFAULT 0.00             COMMENT '付费价格（元/月），免费时为 0',
  `response_format` VARCHAR(20)      NOT NULL DEFAULT 'JSON'  COMMENT '返回格式（JSON / XML 等）',
  `request_example` TEXT                                      COMMENT '请求示例（curl 命令等）',
  `response_example` TEXT                                     COMMENT '返回示例（JSON 结构）',
  `status`          TINYINT(1)       NOT NULL DEFAULT 1       COMMENT '状态：1-已上架，0-已下架',
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_tag_id` (`tag_id`),
  KEY `idx_method` (`method`),
  KEY `idx_is_free` (`is_free`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_api_tag` FOREIGN KEY (`tag_id`) REFERENCES `zo_api_tag` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='API 接口主表';


-- -----------------------------------------------------
-- 3. API 统计数据表（高频更新，独立拆分）
-- -----------------------------------------------------
DROP TABLE IF EXISTS `zo_api_stats`;
CREATE TABLE `zo_api_stats` (
  `id`              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `api_id`          BIGINT UNSIGNED  NOT NULL                 COMMENT '关联 API ID',
  `total_calls`     BIGINT UNSIGNED  NOT NULL DEFAULT 0       COMMENT '累计调用次数',
  `success_calls`   BIGINT UNSIGNED  NOT NULL DEFAULT 0       COMMENT '成功调用次数',
  `fail_calls`      BIGINT UNSIGNED  NOT NULL DEFAULT 0       COMMENT '失败调用次数',
  `avg_response_time` INT UNSIGNED   NOT NULL DEFAULT 0       COMMENT '平均响应时间（毫秒）',
  `likes`           INT UNSIGNED     NOT NULL DEFAULT 0       COMMENT '点赞数',
  `updated_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_api_id` (`api_id`),
  -- 计算成功率用，不直接存百分比
  KEY `idx_likes` (`likes`),
  CONSTRAINT `fk_stats_api` FOREIGN KEY (`api_id`) REFERENCES `zo_api` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='API 统计数据表';


-- -----------------------------------------------------
-- 4. API 调用日志表（可选，用于统计和监控）
-- -----------------------------------------------------
DROP TABLE IF EXISTS `zo_api_call_log`;
CREATE TABLE `zo_api_call_log` (
  `id`              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `api_id`          BIGINT UNSIGNED  NOT NULL                 COMMENT '关联 API ID',
  `user_id`         BIGINT UNSIGNED  DEFAULT NULL             COMMENT '调用用户 ID（未登录则为 NULL）',
  `client_ip`       VARCHAR(45)      DEFAULT NULL             COMMENT '调用方 IP',
  `status_code`     SMALLINT         NOT NULL                 COMMENT 'HTTP 状态码（200 / 400 / 500 等）',
  `response_time`   INT UNSIGNED     NOT NULL DEFAULT 0       COMMENT '接口响应耗时（毫秒）',
  `request_params`  TEXT                                      COMMENT '请求参数快照',
  `created_at`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '调用时间',
  PRIMARY KEY (`id`),
  KEY `idx_api_id_created` (`api_id`, `created_at`),
  KEY `idx_status_code` (`status_code`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='API 调用日志表';


-- =====================================================
-- 初始化数据：插入默认标签
-- =====================================================
INSERT INTO `zo_api_tag` (`tag_name`, `tag_color`, `sort_order`) VALUES
('图片',   '#10b981', 1),
('工具',   '#8b5cf6', 2),
('AI',     '#f97316', 3),
('生活',   '#3b82f6', 4);

-- =====================================================
-- 初始化数据：插入示例 API（对应前端 modules.js 中的 mock 数据）
-- =====================================================

-- 获取标签 ID
SET @tag_img = (SELECT id FROM zo_api_tag WHERE tag_name = '图片');
SET @tag_tool = (SELECT id FROM zo_api_tag WHERE tag_name = '工具');
SET @tag_ai = (SELECT id FROM zo_api_tag WHERE tag_name = 'AI');
SET @tag_life = (SELECT id FROM zo_api_tag WHERE tag_name = '生活');

INSERT INTO `zo_api` (`name`, `description`, `endpoint`, `method`, `tag_id`, `tag_color`, `is_free`, `price`, `request_example`, `response_example`) VALUES
('随机壁纸 API',  '获取高清随机壁纸，支持分类筛选',           'https://api.example.com/wallpaper/random',  'GET',    @tag_img,  '#10b981', 1, 0.00, 
 'curl -X GET "https://api.example.com/wallpaper/random" -H "Authorization: Bearer YOUR_TOKEN"',
 '{"code":200,"message":"success","data":{"url":"https://cdn.example.com/img/001.jpg","category":"nature"}}'),

('天气查询 API',  '实时天气数据，支持全国城市',               'https://api.example.com/weather',           'GET',    @tag_life, '#3b82f6', 1, 0.00, 
 'curl -X GET "https://api.example.com/weather?city=beijing" -H "Authorization: Bearer YOUR_TOKEN"',
 '{"code":200,"message":"success","data":{"city":"北京","temp":25,"weather":"晴"}}'),

('短链接生成',    '长链接转换为短链接服务',                   'https://api.example.com/shorten',           'POST',   @tag_tool, '#8b5cf6', 1, 0.00, 
 'curl -X POST "https://api.example.com/shorten" -H "Content-Type: application/json" -d \'{"url":"https://example.com/very-long-url"}\'',
 '{"code":200,"message":"success","data":{"shortUrl":"https://s.example.com/abc123"}}'),

('二维码生成',    '支持自定义颜色和logo',                    'https://api.example.com/qrcode',            'POST',   @tag_tool, '#f59e0b', 0, 9.90, 
 'curl -X POST "https://api.example.com/qrcode" -H "Content-Type: application/json" -d \'{"text":"hello","color":"#000"}\'',
 '{"code":200,"message":"success","data":{"image":"base64..."}}'),

('IP 归属地查询', '精准 IP 地理位置定位',                    'https://api.example.com/ip',                'GET',    @tag_tool, '#ec4899', 1, 0.00, 
 'curl -X GET "https://api.example.com/ip?ip=8.8.8.8" -H "Authorization: Bearer YOUR_TOKEN"',
 '{"code":200,"message":"success","data":{"country":"美国","city":"Mountain View","isp":"Google"}}'),

('图片格式转换',  '支持 PNG/JPEG/WebP 互转',                 'https://api.example.com/image/convert',     'POST',   @tag_img,  '#06b6d4', 0, 4.90, 
 'curl -X POST "https://api.example.com/image/convert" -F "file=@photo.png" -F "format=webp"',
 '{"code":200,"message":"success","data":{"url":"https://cdn.example.com/converted.webp"}}'),

('文字转语音',    '多语言多音色 TTS 服务',                   'https://api.example.com/tts',               'POST',   @tag_ai,   '#f97316', 0, 19.90, 
 'curl -X POST "https://api.example.com/tts" -H "Content-Type: application/json" -d \'{"text":"你好世界","voice":"zh-CN-female"}\'',
 '{"code":200,"message":"success","data":{"audioUrl":"https://cdn.example.com/audio.mp3"}}'),

('敏感词检测',    '文本内容安全审核',                         'https://api.example.com/moderation',        'POST',   @tag_ai,   '#84cc16', 1, 0.00, 
 'curl -X POST "https://api.example.com/moderation" -H "Content-Type: application/json" -d \'{"text":"审核内容"}\'',
 '{"code":200,"message":"success","data":{"passed":true,"words":[]}}');

-- 插入对应统计数据
INSERT INTO `zo_api_stats` (`api_id`, `total_calls`, `success_calls`, `fail_calls`, `avg_response_time`, `likes`)
SELECT id, 
  CASE name 
    WHEN '随机壁纸 API'  THEN 1200000 WHEN '天气查询 API'   THEN 3500000
    WHEN '短链接生成'    THEN 856000  WHEN '二维码生成'     THEN 420000
    WHEN 'IP 归属地查询' THEN 2100000 WHEN '图片格式转换'   THEN 234000
    WHEN '文字转语音'    THEN 567000  WHEN '敏感词检测'     THEN 1800000
  END,
  CASE name
    WHEN '随机壁纸 API'  THEN 1197600 WHEN '天气查询 API'   THEN 3482500
    WHEN '短链接生成'    THEN 855144  WHEN '二维码生成'     THEN 418740
    WHEN 'IP 归属地查询' THEN 2091600 WHEN '图片格式转换'   THEN 231426
    WHEN '文字转语音'    THEN 562464  WHEN '敏感词检测'     THEN 1789200
  END,
  CASE name
    WHEN '随机壁纸 API'  THEN 2400   WHEN '天气查询 API'   THEN 17500
    WHEN '短链接生成'    THEN 856    WHEN '二维码生成'     THEN 1260
    WHEN 'IP 归属地查询' THEN 8400   WHEN '图片格式转换'   THEN 2574
    WHEN '文字转语音'    THEN 4536   WHEN '敏感词检测'     THEN 10800
  END,
  CASE name
    WHEN '随机壁纸 API'  THEN 45    WHEN '天气查询 API'   THEN 38
    WHEN '短链接生成'    THEN 52    WHEN '二维码生成'     THEN 78
    WHEN 'IP 归属地查询' THEN 32    WHEN '图片格式转换'   THEN 156
    WHEN '文字转语音'    THEN 234   WHEN '敏感词检测'     THEN 67
  END,
  CASE name
    WHEN '随机壁纸 API'  THEN 892   WHEN '天气查询 API'   THEN 2341
    WHEN '短链接生成'    THEN 567   WHEN '二维码生成'     THEN 1234
    WHEN 'IP 归属地查询' THEN 1567  WHEN '图片格式转换'   THEN 456
    WHEN '文字转语音'    THEN 2890  WHEN '敏感词检测'     THEN 1789
  END
FROM zo_api;


-- =====================================================
-- 常用查询示例
-- =====================================================

-- 1. 前台：获取 API 列表（含标签信息 + 统计数据）
-- SELECT 
--   a.id, a.name, a.description, a.endpoint, a.method, a.is_free, 
--   t.tag_name AS tag, t.tag_color,
--   s.total_calls AS calls, s.likes,
--   ROUND(s.success_calls * 100.0 / NULLIF(s.total_calls, 0), 1) AS success_rate,
--   s.avg_response_time
-- FROM zo_api a
-- LEFT JOIN zo_api_tag t ON a.tag_id = t.id
-- LEFT JOIN zo_api_stats s ON a.id = s.api_id
-- WHERE a.status = 1;

-- 2. 前台：获取 API 详情
-- SELECT 
--   a.*, t.tag_name AS tag, t.tag_color,
--   s.total_calls, s.likes,
--   ROUND(s.success_calls * 100.0 / NULLIF(s.total_calls, 0), 1) AS success_rate,
--   s.avg_response_time
-- FROM zo_api a
-- LEFT JOIN zo_api_tag t ON a.tag_id = t.id
-- LEFT JOIN zo_api_stats s ON a.id = s.api_id
-- WHERE a.id = ? AND a.status = 1;

-- 3. 后台：按标签筛选 API 列表
-- SELECT * FROM zo_api WHERE tag_id = ? AND status = 1;

-- 4. 更新统计数据（每次调用时）
-- UPDATE zo_api_stats 
-- SET total_calls = total_calls + 1,
--     success_calls = success_calls + IF(? = 200, 1, 0),
--     fail_calls = fail_calls + IF(? != 200, 1, 0),
--     avg_response_time = ROUND((avg_response_time * 0.99 + ? * 0.01), 0)
-- WHERE api_id = ?;
