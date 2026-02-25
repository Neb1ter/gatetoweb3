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
