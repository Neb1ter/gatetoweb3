CREATE TABLE `sim_trade_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`simType` enum('spot','futures','margin') NOT NULL,
	`symbol` varchar(16) NOT NULL,
	`direction` enum('long','short','buy','sell') NOT NULL,
	`entryPrice` varchar(32) NOT NULL,
	`exitPrice` varchar(32) NOT NULL,
	`size` varchar(32) NOT NULL,
	`leverage` int NOT NULL DEFAULT 1,
	`pnl` varchar(32) NOT NULL,
	`pnlPct` varchar(16) NOT NULL,
	`closeReason` varchar(32) NOT NULL DEFAULT 'manual',
	`marginMode` varchar(16),
	`openedAt` timestamp NOT NULL,
	`closedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sim_trade_history_id` PRIMARY KEY(`id`)
);
