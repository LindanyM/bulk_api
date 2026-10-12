-- Reconstructed from the SQL statements and request fields in index.js.
-- This creates an empty schema; it cannot restore deleted records or passwords.
CREATE DATABASE IF NOT EXISTS bbm_bulk_api
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE bbm_bulk_api;

CREATE TABLE IF NOT EXISTS Church (
    churchId INT UNSIGNED NOT NULL AUTO_INCREMENT,
    churchName VARCHAR(255),
    location VARCHAR(255),
    branch VARCHAR(255),
    province VARCHAR(255),
    city VARCHAR(255),
    region VARCHAR(255),
    pastorId INT UNSIGNED,
    PRIMARY KEY (churchId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Person (
    personId INT UNSIGNED NOT NULL AUTO_INCREMENT,
    address TEXT,
    comments TEXT,
    contactNumber VARCHAR(50),
    gender INT,
    maritalStatus VARCHAR(100),
    name VARCHAR(255),
    surname VARCHAR(255),
    churchId INT UNSIGNED,
    cellLeader VARCHAR(255),
    cellLocation VARCHAR(255),
    ministry VARCHAR(255),
    church VARCHAR(255),
    region VARCHAR(255),
    regContribution DECIMAL(12, 2),
    seedContribution DECIMAL(12, 2),
    amount DECIMAL(12, 2),
    PRIMARY KEY (personId),
    INDEX idx_person_churchId (churchId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Stats (
    statsId INT UNSIGNED NOT NULL AUTO_INCREMENT,
    adult INT,
    car INT,
    fk INT,
    saved INT,
    offering DECIMAL(12, 2),
    visitors INT,
    `date` BIGINT,
    churchId INT UNSIGNED,
    aow INT,
    ck INT,
    PRIMARY KEY (statsId),
    INDEX idx_stats_churchId (churchId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `User` (
    userId INT UNSIGNED NOT NULL AUTO_INCREMENT,
    role INT,
    username VARCHAR(191),
    `password` VARCHAR(255),
    personId INT UNSIGNED,
    PRIMARY KEY (userId),
    INDEX idx_user_username (username),
    INDEX idx_user_personId (personId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Calendar (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255),
    `time` VARCHAR(100),
    month VARCHAR(50),
    year INT,
    department VARCHAR(255),
    region VARCHAR(255),
    dayFrom VARCHAR(50),
    dayTo VARCHAR(50),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Locations (
    location_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255),
    address TEXT,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    PRIMARY KEY (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Assets (
    asset_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    location_id INT UNSIGNED,
    name VARCHAR(255),
    description TEXT,
    purchase_date DATE,
    purchase_price DECIMAL(12, 2),
    serial_number VARCHAR(255),
    category VARCHAR(255),
    `condition` VARCHAR(100),
    last_maintenance_date DATE,
    PRIMARY KEY (asset_id),
    INDEX idx_assets_location_id (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
