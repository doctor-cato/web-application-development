using System;
using System.Data;
using Microsoft.Data.SqlClient;

namespace MigrateUsers
{
    class Program
    {
        static void Main(string[] args)
        {
            string localConnectionString = "Server=localhost;Database=movie_booking_db;Trusted_Connection=True;TrustServerCertificate=True;";
            string someeConnectionString = "Server=movie_booking_db.mssql.somee.com;Database=movie_booking_db;User Id=lekhuong_SQLLogin_1;Password=jmgavwj41z;TrustServerCertificate=True;";

            Console.WriteLine("Connecting to local database...");
            try
            {
                using (SqlConnection localConnection = new SqlConnection(localConnectionString))
                {
                    localConnection.Open();
                    Console.WriteLine("Connected locally.");

                    string selectQuery = "SELECT * FROM Users";
                    using (SqlCommand localCommand = new SqlCommand(selectQuery, localConnection))
                    using (SqlDataReader reader = localCommand.ExecuteReader())
                    {
                        using (SqlConnection someeConnection = new SqlConnection(someeConnectionString))
                        {
                            Console.WriteLine("Connecting to Somee database...");
                            someeConnection.Open();
                            Console.WriteLine("Connected to Somee.");

                            try {
                                using (SqlCommand alterCommand = new SqlCommand("ALTER TABLE Users ADD social_provider nvarchar(max) NULL, social_id nvarchar(max) NULL", someeConnection))
                                {
                                    alterCommand.ExecuteNonQuery();
                                    Console.WriteLine("Added missing columns to Somee.");
                                }
                            } catch (Exception ex) {
                                Console.WriteLine("Columns might already exist or error: " + ex.Message);
                            }

                            while (reader.Read())
                            {
                                Guid userId = reader.GetGuid(reader.GetOrdinal("user_id"));
                                string email = reader.GetString(reader.GetOrdinal("email"));
                                Console.WriteLine($"Migrating user: {email}");

                                // Check if user exists on Somee
                                string checkQuery = "SELECT COUNT(1) FROM Users WHERE user_id = @UserId";
                                using (SqlCommand checkCommand = new SqlCommand(checkQuery, someeConnection))
                                {
                                    checkCommand.Parameters.AddWithValue("@UserId", userId);
                                    int count = (int)checkCommand.ExecuteScalar();

                                    if (count == 0)
                                    {
                                        var cols = new System.Collections.Generic.List<string>();
                                        for (int i = 0; i < reader.FieldCount; i++)
                                        {
                                            cols.Add(reader.GetName(i));
                                        }
                                        string colNames = string.Join(", ", cols);
                                        string paramNames = string.Join(", ", cols.ConvertAll(c => "@" + c));
                                        
                                        string insertQuery = $"INSERT INTO Users ({colNames}) VALUES ({paramNames})";
                                        
                                        using (SqlCommand insertCommand = new SqlCommand(insertQuery, someeConnection))
                                        {
                                            for (int i = 0; i < reader.FieldCount; i++)
                                            {
                                                string colName = reader.GetName(i);
                                                object val = reader.GetValue(i);
                                                insertCommand.Parameters.AddWithValue("@" + colName, val == DBNull.Value ? DBNull.Value : val);
                                            }
                                            insertCommand.ExecuteNonQuery();
                                            Console.WriteLine($" -> Inserted!");
                                        }
                                    }
                                    else
                                    {
                                        var sets = new System.Collections.Generic.List<string>();
                                        for (int i = 0; i < reader.FieldCount; i++)
                                        {
                                            if (reader.GetName(i) != "user_id")
                                                sets.Add(reader.GetName(i) + " = @" + reader.GetName(i));
                                        }
                                        string setClause = string.Join(", ", sets);
                                        
                                        string updateQuery = $"UPDATE Users SET {setClause} WHERE user_id = @user_id";
                                            
                                        using (SqlCommand updateCommand = new SqlCommand(updateQuery, someeConnection))
                                        {
                                            for (int i = 0; i < reader.FieldCount; i++)
                                            {
                                                string colName = reader.GetName(i);
                                                object val = reader.GetValue(i);
                                                updateCommand.Parameters.AddWithValue("@" + colName, val == DBNull.Value ? DBNull.Value : val);
                                            }
                                            updateCommand.ExecuteNonQuery();
                                            Console.WriteLine($" -> Updated!");
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                Console.WriteLine("Migration complete!");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
            }
        }
    }
}
