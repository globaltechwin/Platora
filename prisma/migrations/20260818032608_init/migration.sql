-- CreateTable
CREATE TABLE `Site` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `address` VARCHAR(500) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(10) NULL,
    `area` DECIMAL(10, 4) NOT NULL,
    `areaUnit` VARCHAR(191) NOT NULL DEFAULT 'Acres',
    `zoning` VARCHAR(191) NOT NULL,
    `rera` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Site_code_key`(`code`),
    INDEX `Site_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('FullPayment', 'Installment') NOT NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `siteId` INTEGER NULL,
    `discount` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PaymentPlan_siteId_idx`(`siteId`),
    INDEX `PaymentPlan_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanInstallment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `paymentPercent` DECIMAL(5, 2) NOT NULL,
    `dueDays` INTEGER NOT NULL,
    `mandatory` BOOLEAN NOT NULL DEFAULT true,
    `orderIndex` INTEGER NOT NULL,

    INDEX `PlanInstallment_planId_idx`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `block` VARCHAR(191) NOT NULL,
    `area` DECIMAL(10, 2) NOT NULL,
    `areaUnit` VARCHAR(191) NOT NULL DEFAULT 'Sq.ft',
    `status` ENUM('Available', 'Blocked', 'Booked', 'Registered', 'Sold', 'BlockedAdmin') NOT NULL DEFAULT 'Available',
    `facing` VARCHAR(191) NOT NULL,
    `siteId` INTEGER NOT NULL,
    `type` ENUM('Corner', 'RoadFacing', 'Regular', 'ParkFacing') NULL,
    `dimensions` VARCHAR(50) NULL,
    `ratePerSqft` DECIMAL(10, 2) NULL,
    `plcCharges` DECIMAL(10, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Plot_status_idx`(`status`),
    INDEX `Plot_facing_idx`(`facing`),
    INDEX `Plot_type_idx`(`type`),
    UNIQUE INDEX `Plot_siteId_code_key`(`siteId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(15) NOT NULL,
    `alternateMobile` VARCHAR(15) NULL,
    `email` VARCHAR(255) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `occupation` VARCHAR(191) NULL,
    `panNumber` VARCHAR(10) NULL,
    `aadhaarNumber` VARCHAR(12) NULL,
    `passportNo` VARCHAR(191) NULL,
    `addressLine` VARCHAR(500) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `pincode` VARCHAR(10) NULL,
    `coApplicantName` VARCHAR(191) NULL,
    `coApplicantPan` VARCHAR(10) NULL,
    `coApplicantAadhaar` VARCHAR(12) NULL,
    `leadSource` VARCHAR(191) NULL,
    `leadStage` ENUM('Lead', 'Contacted', 'SiteVisit', 'Negotiation', 'Booked', 'Lost') NOT NULL DEFAULT 'Lead',
    `referredByAgentId` INTEGER NULL,
    `interestedIn` VARCHAR(191) NULL,
    `notesRemarks` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Customer_code_key`(`code`),
    INDEX `Customer_leadStage_idx`(`leadStage`),
    INDEX `Customer_referredByAgentId_idx`(`referredByAgentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Agent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(15) NOT NULL,
    `email` VARCHAR(255) NULL,
    `pan` VARCHAR(10) NULL,
    `reraNo` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `accountNo` VARCHAR(191) NULL,
    `ifscCode` VARCHAR(191) NULL,
    `commission` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `joined` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Agent_code_key`(`code`),
    INDEX `Agent_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingNo` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `plotId` INTEGER NOT NULL,
    `customerId` INTEGER NOT NULL,
    `agentId` INTEGER NULL,
    `paymentPlanId` INTEGER NULL,
    `total` DECIMAL(12, 2) NOT NULL,
    `advance` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `status` ENUM('Confirmed', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Booking_bookingNo_key`(`bookingNo`),
    INDEX `Booking_plotId_idx`(`plotId`),
    INDEX `Booking_customerId_idx`(`customerId`),
    INDEX `Booking_agentId_idx`(`agentId`),
    INDEX `Booking_date_idx`(`date`),
    INDEX `Booking_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receiptNo` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bookingId` INTEGER NOT NULL,
    `mode` ENUM('Cash', 'UPI', 'BankTransfer', 'Cheque') NOT NULL,
    `ref` VARCHAR(100) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `postedBy` VARCHAR(100) NULL,
    `status` ENUM('Approved', 'Pending', 'Rejected') NOT NULL DEFAULT 'Pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_receiptNo_key`(`receiptNo`),
    INDEX `Payment_bookingId_idx`(`bookingId`),
    INDEX `Payment_date_idx`(`date`),
    INDEX `Payment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstallmentSchedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `installmentName` VARCHAR(191) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `due` DECIMAL(12, 2) NOT NULL,
    `paid` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `status` ENUM('Pending', 'Overdue', 'Paid') NOT NULL DEFAULT 'Pending',
    `orderIndex` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `InstallmentSchedule_bookingId_idx`(`bookingId`),
    INDEX `InstallmentSchedule_dueDate_idx`(`dueDate`),
    INDEX `InstallmentSchedule_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PaymentPlan` ADD CONSTRAINT `PaymentPlan_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanInstallment` ADD CONSTRAINT `PlanInstallment_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `PaymentPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plot` ADD CONSTRAINT `Plot_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_referredByAgentId_fkey` FOREIGN KEY (`referredByAgentId`) REFERENCES `Agent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_plotId_fkey` FOREIGN KEY (`plotId`) REFERENCES `Plot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `Agent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_paymentPlanId_fkey` FOREIGN KEY (`paymentPlanId`) REFERENCES `PaymentPlan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstallmentSchedule` ADD CONSTRAINT `InstallmentSchedule_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
