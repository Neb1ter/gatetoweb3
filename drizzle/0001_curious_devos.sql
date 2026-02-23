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
