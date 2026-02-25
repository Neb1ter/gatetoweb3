ALTER TABLE `exchange_feature_support` MODIFY COLUMN `levelZh` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `exchange_feature_support` MODIFY COLUMN `levelEn` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `exchange_feature_support` MODIFY COLUMN `maxLeverage` varchar(16);--> statement-breakpoint
ALTER TABLE `exchange_feature_support` MODIFY COLUMN `feeInfo` varchar(256);--> statement-breakpoint
ALTER TABLE `exchange_feature_support` ADD `kycLevel` varchar(16) DEFAULT 'standard';--> statement-breakpoint
ALTER TABLE `exchange_feature_support` ADD `supportedRegions` varchar(256);--> statement-breakpoint
ALTER TABLE `exchange_feature_support` ADD `feeLevel` varchar(8);--> statement-breakpoint
ALTER TABLE `exchange_feature_support` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `exchange_feature_support` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;