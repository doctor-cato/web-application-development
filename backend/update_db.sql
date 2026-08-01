IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE TABLE [Cinemas] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Address] nvarchar(max) NOT NULL,
        [City] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_Cinemas] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE TABLE [movies] (
        [movie_id] uniqueidentifier NOT NULL,
        [title] nvarchar(max) NOT NULL,
        [description] nvarchar(max) NOT NULL,
        [duration_minutes] int NOT NULL,
        [release_date] datetime2 NOT NULL,
        [genres] nvarchar(max) NOT NULL,
        [poster_url] nvarchar(max) NOT NULL,
        [trailer_url] nvarchar(max) NULL,
        [age_rating] nvarchar(max) NOT NULL,
        [status] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_movies] PRIMARY KEY ([movie_id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE TABLE [users] (
        [user_id] uniqueidentifier NOT NULL,
        [full_name] nvarchar(max) NOT NULL,
        [email] nvarchar(max) NOT NULL,
        [phone_number] nvarchar(max) NOT NULL,
        [password_hash] nvarchar(max) NOT NULL,
        [role] nvarchar(max) NOT NULL,
        [is_verified_otp] bit NOT NULL,
        [avatar_url] nvarchar(max) NULL,
        [created_at] datetime2 NOT NULL,
        [updated_at] datetime2 NOT NULL,
        [date_of_birth] datetime2 NULL,
        [gender] nvarchar(max) NULL,
        [otp_code] nvarchar(max) NULL,
        [otp_expiry_time] datetime2 NULL,
        [vip_plan] nvarchar(max) NULL,
        CONSTRAINT [PK_users] PRIMARY KEY ([user_id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE TABLE [Rooms] (
        [Id] uniqueidentifier NOT NULL,
        [CinemaId] uniqueidentifier NULL,
        [Name] nvarchar(max) NOT NULL,
        [TotalSeats] int NOT NULL,
        CONSTRAINT [PK_Rooms] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Rooms_Cinemas_CinemaId] FOREIGN KEY ([CinemaId]) REFERENCES [Cinemas] ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE TABLE [Seats] (
        [Id] uniqueidentifier NOT NULL,
        [RoomId] uniqueidentifier NULL,
        [SeatRow] nvarchar(max) NOT NULL,
        [SeatNumber] int NOT NULL,
        [SeatType] nvarchar(max) NULL,
        [Status] nvarchar(max) NOT NULL,
        [HeldByUserId] nvarchar(max) NULL,
        [HeldUntil] datetime2 NULL,
        [RowVersion] rowversion NULL,
        CONSTRAINT [PK_Seats] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Seats_Rooms_RoomId] FOREIGN KEY ([RoomId]) REFERENCES [Rooms] ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE TABLE [Showtimes] (
        [Id] uniqueidentifier NOT NULL,
        [MovieId] uniqueidentifier NULL,
        [RoomId] uniqueidentifier NULL,
        [StartTime] datetime2 NOT NULL,
        [EndTime] datetime2 NOT NULL,
        [TicketPrice] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_Showtimes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Showtimes_Rooms_RoomId] FOREIGN KEY ([RoomId]) REFERENCES [Rooms] ([Id]),
        CONSTRAINT [FK_Showtimes_movies_MovieId] FOREIGN KEY ([MovieId]) REFERENCES [movies] ([movie_id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE TABLE [bookings] (
        [id] uniqueidentifier NOT NULL,
        [user_id] uniqueidentifier NULL,
        [showtime_id] uniqueidentifier NOT NULL,
        [MovieId] uniqueidentifier NOT NULL,
        [Seats] nvarchar(max) NULL,
        [total_price] decimal(10,2) NOT NULL,
        [payment_method] nvarchar(50) NULL,
        [payment_status] varchar(20) NOT NULL DEFAULT 'pending',
        [created_at] datetime NOT NULL DEFAULT ((getdate())),
        CONSTRAINT [PK_bookings__3213E83F981ED873] PRIMARY KEY ([id]),
        CONSTRAINT [FK__bookings__showti__6383C8BA] FOREIGN KEY ([showtime_id]) REFERENCES [Showtimes] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK__bookings__user_i__628FA481] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id]) ON DELETE SET NULL,
        CONSTRAINT [FK_bookings_movies_MovieId] FOREIGN KEY ([MovieId]) REFERENCES [movies] ([movie_id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE TABLE [cinematches] (
        [id] uniqueidentifier NOT NULL,
        [user_id] uniqueidentifier NOT NULL,
        [showtime_id] uniqueidentifier NOT NULL,
        [seat_id] nvarchar(max) NOT NULL,
        [adjacent_seat_id] nvarchar(max) NOT NULL,
        [match_preference] nvarchar(max) NOT NULL,
        [matched_user_id] uniqueidentifier NULL,
        [status] nvarchar(max) NOT NULL,
        [reveal_code] nvarchar(max) NOT NULL,
        [is_revealed] bit NOT NULL,
        [created_at] datetime2 NOT NULL,
        CONSTRAINT [PK_cinematches] PRIMARY KEY ([id]),
        CONSTRAINT [FK_cinematches_Showtimes_showtime_id] FOREIGN KEY ([showtime_id]) REFERENCES [Showtimes] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_cinematches_users_matched_user_id] FOREIGN KEY ([matched_user_id]) REFERENCES [users] ([user_id]),
        CONSTRAINT [FK_cinematches_users_user_id] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE TABLE [booking_details] (
        [id] uniqueidentifier NOT NULL,
        [booking_id] uniqueidentifier NULL,
        [showtime_id] uniqueidentifier NULL,
        [seat_id] uniqueidentifier NULL,
        [price] decimal(10,2) NOT NULL,
        CONSTRAINT [PK_booking___3213E83F8B692CA5] PRIMARY KEY ([id]),
        CONSTRAINT [FK__booking__booki__6754599E] FOREIGN KEY ([booking_id]) REFERENCES [bookings] ([id]) ON DELETE CASCADE,
        CONSTRAINT [FK__booking__seat_i__66603565] FOREIGN KEY ([seat_id]) REFERENCES [Seats] ([Id]),
        CONSTRAINT [FK_booking_details_Showtimes_showtime_id] FOREIGN KEY ([showtime_id]) REFERENCES [Showtimes] ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE INDEX [IX_booking_details_booking_id] ON [booking_details] ([booking_id]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE INDEX [IX_booking_details_seat_id] ON [booking_details] ([seat_id]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UQ_Seat_Per_Showtime] ON [booking_details] ([showtime_id], [seat_id]) WHERE [showtime_id] IS NOT NULL AND [seat_id] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE INDEX [IX_bookings_MovieId] ON [bookings] ([MovieId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE INDEX [IX_bookings_showtime_id] ON [bookings] ([showtime_id]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE INDEX [IX_bookings_user_id] ON [bookings] ([user_id]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE INDEX [IX_cinematches_matched_user_id] ON [cinematches] ([matched_user_id]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE INDEX [IX_cinematches_showtime_id] ON [cinematches] ([showtime_id]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE INDEX [IX_cinematches_user_id] ON [cinematches] ([user_id]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE INDEX [IX_Rooms_CinemaId] ON [Rooms] ([CinemaId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE INDEX [IX_Seats_RoomId] ON [Seats] ([RoomId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE INDEX [IX_Showtimes_MovieId] ON [Showtimes] ([MovieId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    CREATE INDEX [IX_Showtimes_RoomId] ON [Showtimes] ([RoomId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260729094752_AddSeatRealTimeFields'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260729094752_AddSeatRealTimeFields', N'8.0.27');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730055607_AuthPhase2'
)
BEGIN
    DECLARE @var0 sysname;
    SELECT @var0 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[users]') AND [c].[name] = N'phone_number');
    IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [users] DROP CONSTRAINT [' + @var0 + '];');
    ALTER TABLE [users] ALTER COLUMN [phone_number] nvarchar(450) NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730055607_AuthPhase2'
)
BEGIN
    DECLARE @var1 sysname;
    SELECT @var1 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[users]') AND [c].[name] = N'email');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [users] DROP CONSTRAINT [' + @var1 + '];');
    ALTER TABLE [users] ALTER COLUMN [email] nvarchar(450) NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730055607_AuthPhase2'
)
BEGIN
    ALTER TABLE [users] ADD [access_failed_count] int NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730055607_AuthPhase2'
)
BEGIN
    ALTER TABLE [users] ADD [last_otp_request_time] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730055607_AuthPhase2'
)
BEGIN
    ALTER TABLE [users] ADD [lockout_end] datetime2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730055607_AuthPhase2'
)
BEGIN
    ALTER TABLE [users] ADD [points] int NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730055607_AuthPhase2'
)
BEGIN
    CREATE TABLE [refresh_tokens] (
        [id] uniqueidentifier NOT NULL,
        [token] nvarchar(max) NOT NULL,
        [jwt_id] nvarchar(max) NOT NULL,
        [is_used] bit NOT NULL,
        [is_revoked] bit NOT NULL,
        [user_id] uniqueidentifier NOT NULL,
        [added_date] datetime2 NOT NULL,
        [expiry_date] datetime2 NOT NULL,
        CONSTRAINT [PK_refresh_tokens] PRIMARY KEY ([id]),
        CONSTRAINT [FK_refresh_tokens_users_user_id] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730055607_AuthPhase2'
)
BEGIN
    CREATE UNIQUE INDEX [IX_users_email] ON [users] ([email]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730055607_AuthPhase2'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_users_phone_number] ON [users] ([phone_number]) WHERE [phone_number] IS NOT NULL AND [phone_number] <> ''''');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730055607_AuthPhase2'
)
BEGIN
    CREATE INDEX [IX_refresh_tokens_user_id] ON [refresh_tokens] ([user_id]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730055607_AuthPhase2'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260730055607_AuthPhase2', N'8.0.27');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260731114346_AddMovieExtraFields'
)
BEGIN
    ALTER TABLE [movies] ADD [backdrop_url] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260731114346_AddMovieExtraFields'
)
BEGIN
    ALTER TABLE [movies] ADD [cast] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260731114346_AddMovieExtraFields'
)
BEGIN
    ALTER TABLE [movies] ADD [director] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260731114346_AddMovieExtraFields'
)
BEGIN
    ALTER TABLE [movies] ADD [gallery] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260731114346_AddMovieExtraFields'
)
BEGIN
    ALTER TABLE [movies] ADD [language] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260731114346_AddMovieExtraFields'
)
BEGIN
    DECLARE @var2 sysname;
    SELECT @var2 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[cinematches]') AND [c].[name] = N'status');
    IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [cinematches] DROP CONSTRAINT [' + @var2 + '];');
    ALTER TABLE [cinematches] ALTER COLUMN [status] nvarchar(450) NOT NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260731114346_AddMovieExtraFields'
)
BEGIN
    CREATE INDEX [IX_Showtimes_StartTime] ON [Showtimes] ([StartTime]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260731114346_AddMovieExtraFields'
)
BEGIN
    CREATE INDEX [IX_cinematches_status] ON [cinematches] ([status]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260731114346_AddMovieExtraFields'
)
BEGIN
    CREATE INDEX [IX_bookings_created_at] ON [bookings] ([created_at]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260731114346_AddMovieExtraFields'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260731114346_AddMovieExtraFields', N'8.0.27');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260731114913_AddTwoFactorAuth'
)
BEGIN
    ALTER TABLE [users] ADD [is_two_factor_enabled] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260731114913_AddTwoFactorAuth'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260731114913_AddTwoFactorAuth', N'8.0.27');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801051419_AddComboTable'
)
BEGIN
    ALTER TABLE [Showtimes] ADD [cinema_id] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801051419_AddComboTable'
)
BEGIN
    ALTER TABLE [Showtimes] ADD [cinema_name] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801051419_AddComboTable'
)
BEGIN
    ALTER TABLE [Showtimes] ADD [movie_title] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801051419_AddComboTable'
)
BEGIN
    ALTER TABLE [Showtimes] ADD [room_name] nvarchar(max) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801051419_AddComboTable'
)
BEGIN
    CREATE TABLE [combos] (
        [id] nvarchar(450) NOT NULL,
        [name] nvarchar(200) NOT NULL,
        [description] nvarchar(max) NOT NULL,
        [price] decimal(10,2) NOT NULL,
        [stock] int NOT NULL,
        [image_url] nvarchar(max) NOT NULL,
        [category] nvarchar(100) NOT NULL,
        CONSTRAINT [PK_combos] PRIMARY KEY ([id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801051419_AddComboTable'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260801051419_AddComboTable', N'8.0.27');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801053258_AddVoucherTable'
)
BEGIN
    CREATE TABLE [Vouchers] (
        [Id] uniqueidentifier NOT NULL,
        [Code] nvarchar(50) NOT NULL,
        [Description] nvarchar(200) NOT NULL,
        [DiscountType] nvarchar(20) NOT NULL,
        [DiscountValue] decimal(18,2) NOT NULL,
        [MinOrderAmount] decimal(18,2) NOT NULL,
        [MaxDiscountAmount] decimal(18,2) NULL,
        [ExpiryDate] datetime2 NOT NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_Vouchers] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801053258_AddVoucherTable'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260801053258_AddVoucherTable', N'8.0.27');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801141405_AddSettingsAndVoucherPoints'
)
BEGIN
    ALTER TABLE [Vouchers] ADD [PointsRequired] int NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801141405_AddSettingsAndVoucherPoints'
)
BEGIN
    CREATE TABLE [settings] (
        [key] nvarchar(100) NOT NULL,
        [value] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_settings] PRIMARY KEY ([key])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801141405_AddSettingsAndVoucherPoints'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260801141405_AddSettingsAndVoucherPoints', N'8.0.27');
END;
GO

COMMIT;
GO

