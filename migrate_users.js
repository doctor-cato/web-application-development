const sql = require('mssql');

const localConfig = {
    server: 'localhost',
    database: 'movie_booking_db',
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
};

const someeConfig = {
    server: 'movie_booking_db.mssql.somee.com',
    database: 'movie_booking_db',
    user: 'lekhuong_SQLLogin_1',
    password: 'jmgavwj41z',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function migrateUsers() {
    try {
        console.log('Connecting to local database...');
        const localPool = await sql.connect(localConfig);
        const result = await localPool.request().query('SELECT * FROM Users');
        const users = result.recordset;
        console.log(`Found ${users.length} users locally.`);
        
        console.log('Connecting to Somee database...');
        const someePool = await sql.connect(someeConfig);
        
        for (const user of users) {
            try {
                // Check if user exists
                const check = await someePool.request()
                    .input('user_id', sql.UniqueIdentifier, user.user_id)
                    .query('SELECT 1 FROM Users WHERE user_id = @user_id');
                    
                if (check.recordset.length === 0) {
                    await someePool.request()
                        .input('user_id', sql.UniqueIdentifier, user.user_id)
                        .input('full_name', sql.NVarChar, user.full_name)
                        .input('email', sql.NVarChar, user.email)
                        .input('phone_number', sql.NVarChar, user.phone_number)
                        .input('password_hash', sql.NVarChar, user.password_hash)
                        .input('role', sql.NVarChar, user.role)
                        .input('loyalty_points', sql.Int, user.loyalty_points || 0)
                        .input('loyalty_tier', sql.NVarChar, user.loyalty_tier || 'BRONZE')
                        .input('avatar_url', sql.NVarChar, user.avatar_url || null)
                        .input('avatar_border', sql.NVarChar, user.avatar_border || null)
                        .query(`
                            INSERT INTO Users (user_id, full_name, email, phone_number, password_hash, role, loyalty_points, loyalty_tier, avatar_url, avatar_border) 
                            VALUES (@user_id, @full_name, @email, @phone_number, @password_hash, @role, @loyalty_points, @loyalty_tier, @avatar_url, @avatar_border)
                        `);
                    console.log(`Imported user: ${user.email} (${user.role})`);
                } else {
                    // Update user
                    await someePool.request()
                        .input('user_id', sql.UniqueIdentifier, user.user_id)
                        .input('full_name', sql.NVarChar, user.full_name)
                        .input('email', sql.NVarChar, user.email)
                        .input('phone_number', sql.NVarChar, user.phone_number)
                        .input('password_hash', sql.NVarChar, user.password_hash)
                        .input('role', sql.NVarChar, user.role)
                        .input('loyalty_points', sql.Int, user.loyalty_points || 0)
                        .input('loyalty_tier', sql.NVarChar, user.loyalty_tier || 'BRONZE')
                        .input('avatar_url', sql.NVarChar, user.avatar_url || null)
                        .input('avatar_border', sql.NVarChar, user.avatar_border || null)
                        .query(`
                            UPDATE Users 
                            SET full_name = @full_name, email = @email, phone_number = @phone_number, 
                                password_hash = @password_hash, role = @role, loyalty_points = @loyalty_points, 
                                loyalty_tier = @loyalty_tier, avatar_url = @avatar_url, avatar_border = @avatar_border
                            WHERE user_id = @user_id
                        `);
                    console.log(`Updated user: ${user.email} (${user.role})`);
                }
            } catch (err) {
                console.error(`Error migrating user ${user.email}:`, err.message);
            }
        }
        console.log('Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrateUsers();
