-- ============================================
-- SAFE Migration: Add movie extra fields (director, cast, language, gallery, backdrop_url)
-- Idempotent: checks if column exists before adding
-- Run this on Somee SQL Manager after uploading publish-latest.zip
-- ============================================

-- Add director column
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'movies' AND COLUMN_NAME = 'director')
BEGIN
    ALTER TABLE movies ADD director nvarchar(max) NULL;
    PRINT 'Added column: director';
END
ELSE PRINT 'Column director already exists';
GO

-- Add cast column
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'movies' AND COLUMN_NAME = 'cast')
BEGIN
    ALTER TABLE movies ADD [cast] nvarchar(max) NULL;
    PRINT 'Added column: cast';
END
ELSE PRINT 'Column cast already exists';
GO

-- Add language column
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'movies' AND COLUMN_NAME = 'language')
BEGIN
    ALTER TABLE movies ADD [language] nvarchar(max) NULL;
    PRINT 'Added column: language';
END
ELSE PRINT 'Column language already exists';
GO

-- Add gallery column
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'movies' AND COLUMN_NAME = 'gallery')
BEGIN
    ALTER TABLE movies ADD gallery nvarchar(max) NULL;
    PRINT 'Added column: gallery';
END
ELSE PRINT 'Column gallery already exists';
GO

-- Add backdrop_url column (may already exist if added manually before)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'movies' AND COLUMN_NAME = 'backdrop_url')
BEGIN
    ALTER TABLE movies ADD backdrop_url nvarchar(max) NULL;
    PRINT 'Added column: backdrop_url';
END
ELSE PRINT 'Column backdrop_url already exists';
GO

-- Update EF migration history so future migrations know this was applied
IF NOT EXISTS (SELECT 1 FROM __EFMigrationsHistory WHERE MigrationId = '20260731114346_AddMovieExtraFields')
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    VALUES ('20260731114346_AddMovieExtraFields', '8.0.27');
    PRINT 'Recorded migration in __EFMigrationsHistory';
END
GO

PRINT '=== Migration complete ===';
GO
