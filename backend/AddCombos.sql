IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[combos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[combos] (
        [id] nvarchar(450) NOT NULL,
        [name] nvarchar(200) NOT NULL,
        [description] nvarchar(max) NOT NULL,
        [price] decimal(10, 2) NOT NULL,
        [stock] int NOT NULL,
        [image_url] nvarchar(max) NOT NULL,
        [category] nvarchar(100) NOT NULL,
        CONSTRAINT [PK_combos] PRIMARY KEY ([id])
    );
END
GO

-- Seed Data
IF NOT EXISTS (SELECT * FROM [dbo].[combos] WHERE [id] = 'cb_1')
BEGIN
    INSERT INTO [dbo].[combos] ([id], [name], [description], [price], [stock], [image_url], [category])
    VALUES 
    ('cb_1', N'Combo Solo', N'1 Bắp ngọt lớn + 1 Nước ngọt 22oz tự chọn', 75000, 120, '/images/F&B/combo_single.png', 'Combo'),
    ('cb_2', N'Combo Couple', N'1 Bắp ngọt khổng lồ + 2 Nước ngọt 22oz', 99000, 85, '/images/F&B/combo_couple.png', 'Combo'),
    ('cb_3', N'Combo Gia Đình (Party)', N'2 Bắp lớn + 3 Nước ngọt tùy chọn + 1 Snack', 155000, 40, '/images/F&B/combo_family.png', 'Combo'),
    ('fb_1', N'Bắp Ngọt (Lớn)', N'Bắp rang bơ vị ngọt', 45000, 200, '/shared/images/food_popcorn.png', N'Đồ thường'),
    ('fb_2', N'Pepsi Lon 330ml', N'Nước ngọt có ga', 25000, 150, '/shared/images/food_pepsi.png', N'Đồ thường'),
    ('fb_3', N'Coca-Cola Chai 390ml', N'Nước ngọt có ga', 25000, 150, '/shared/images/food_coca.png', N'Đồ thường');
END
GO
