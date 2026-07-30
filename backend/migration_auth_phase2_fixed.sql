BEGIN TRANSACTION;
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[users]') AND [c].[name] = N'phone_number');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [users] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [users] ALTER COLUMN [phone_number] nvarchar(450) NOT NULL;
GO

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[users]') AND [c].[name] = N'email');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [users] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [users] ALTER COLUMN [email] nvarchar(450) NOT NULL;
GO

ALTER TABLE [users] ADD [access_failed_count] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [users] ADD [last_otp_request_time] datetime2 NULL;
GO

ALTER TABLE [users] ADD [lockout_end] datetime2 NULL;
GO

ALTER TABLE [users] ADD [points] int NOT NULL DEFAULT 0;
GO

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
GO

CREATE UNIQUE INDEX [IX_users_email] ON [users] ([email]);
GO

CREATE UNIQUE INDEX [IX_users_phone_number] ON [users] ([phone_number]) WHERE [phone_number] IS NOT NULL AND [phone_number] <> '';
GO

CREATE INDEX [IX_refresh_tokens_user_id] ON [refresh_tokens] ([user_id]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260730055607_AuthPhase2', N'8.0.27');
GO

COMMIT;
GO

