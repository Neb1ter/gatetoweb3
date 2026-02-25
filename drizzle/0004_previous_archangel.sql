CREATE TABLE `contact_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` varchar(64) NOT NULL,
	`accountName` varchar(256) NOT NULL,
	`exchangeUid` varchar(128),
	`exchangeUsername` varchar(256),
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crypto_news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`source` varchar(64) NOT NULL DEFAULT '律动BlockBeats',
	`url` text,
	`category` varchar(32) NOT NULL DEFAULT 'market',
	`isPinned` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crypto_news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exchange_feature_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(32) NOT NULL,
	`nameZh` varchar(64) NOT NULL,
	`nameEn` varchar(64) NOT NULL,
	`icon` varchar(8) NOT NULL,
	`descZh` text NOT NULL,
	`descEn` text NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `exchange_feature_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `exchange_feature_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `exchange_feature_support` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exchangeSlug` varchar(32) NOT NULL,
	`featureSlug` varchar(32) NOT NULL,
	`supported` tinyint NOT NULL DEFAULT 1,
	`levelZh` varchar(16) NOT NULL,
	`levelEn` varchar(32) NOT NULL,
	`detailZh` text NOT NULL,
	`detailEn` text NOT NULL,
	`maxLeverage` varchar(8),
	`feeInfo` varchar(128),
	`highlight` tinyint NOT NULL DEFAULT 0,
	CONSTRAINT `exchange_feature_support_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exchange_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(32) NOT NULL,
	`name` varchar(64) NOT NULL,
	`referralLink` text NOT NULL,
	`inviteCode` varchar(64) NOT NULL,
	`rebateRate` varchar(16) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exchange_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `exchange_links_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`category` varchar(32) NOT NULL DEFAULT 'basic',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
