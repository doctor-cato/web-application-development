-- ============================================
-- SAFE Migration: Add showtime matrix fields (cinema_id, cinema_name, room_name, movie_title)
-- Idempotent: checks if column exists before adding
-- Run this on Somee SQL Manager if needed
-- ============================================

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Showtimes' AND COLUMN_NAME = 'cinema_id')
BEGIN
    ALTER TABLE Showtimes ADD cinema_id nvarchar(100) NULL;
    PRINT 'Added column: cinema_id';
END
ELSE PRINT 'Column cinema_id already exists';
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Showtimes' AND COLUMN_NAME = 'cinema_name')
BEGIN
    ALTER TABLE Showtimes ADD cinema_name nvarchar(255) NULL;
    PRINT 'Added column: cinema_name';
END
ELSE PRINT 'Column cinema_name already exists';
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Showtimes' AND COLUMN_NAME = 'room_name')
BEGIN
    ALTER TABLE Showtimes ADD room_name nvarchar(100) NULL;
    PRINT 'Added column: room_name';
END
ELSE PRINT 'Column room_name already exists';
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Showtimes' AND COLUMN_NAME = 'movie_title')
BEGIN
    ALTER TABLE Showtimes ADD movie_title nvarchar(255) NULL;
    PRINT 'Added column: movie_title';
END
ELSE PRINT 'Column movie_title already exists';
GO

PRINT '=== Showtime Matrix Migration Complete ===';
GO
