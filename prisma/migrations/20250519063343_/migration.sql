-- CreateTable
CREATE TABLE `WeixinConnection` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `corpId` VARCHAR(191) NOT NULL,
    `agentId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `encodingAESKey` VARCHAR(191) NOT NULL,
    `n8nWebhookUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WeixinConnection_corpId_agentId_key`(`corpId`, `agentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
