USE movie_booking_db;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Vouchers' and xtype='U')
BEGIN
    CREATE TABLE Vouchers (
        Id UNIQUEIDENTIFIER PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL,
        Description NVARCHAR(200) NOT NULL DEFAULT '',
        DiscountType NVARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE',
        DiscountValue DECIMAL(18, 2) NOT NULL,
        MinOrderAmount DECIMAL(18, 2) NOT NULL DEFAULT 0,
        MaxDiscountAmount DECIMAL(18, 2) NULL,
        ExpiryDate DATETIME2 NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1
    );

    -- Insert a sample voucher
    INSERT INTO Vouchers (Id, Code, Description, DiscountType, DiscountValue, MinOrderAmount, MaxDiscountAmount, ExpiryDate, IsActive)
    VALUES (NEWID(), 'GIAM10K', 'Giảm 10K cho mọi đơn hàng', 'FIXED_AMOUNT', 10000, 0, NULL, '2026-12-31', 1);
END
GO
