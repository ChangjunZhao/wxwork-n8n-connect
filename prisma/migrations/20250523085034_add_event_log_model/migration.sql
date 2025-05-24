-- CreateTable
CREATE TABLE `EventLog` (
    `id` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `connectionId` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `details` TEXT NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EventLog_timestamp_idx`(`timestamp`),
    INDEX `EventLog_connectionId_idx`(`connectionId`),
    INDEX `EventLog_eventType_idx`(`eventType`),
    INDEX `EventLog_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EventLog` ADD CONSTRAINT `EventLog_connectionId_fkey` FOREIGN KEY (`connectionId`) REFERENCES `WeixinConnection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
