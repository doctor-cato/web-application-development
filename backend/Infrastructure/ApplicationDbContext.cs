using appweb.Models;
using Microsoft.EntityFrameworkCore;

namespace appweb.Infrastructure
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        // --- CÁC BẢNG ĐÃ CÓ ---
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingDetail> BookingDetails { get; set; }
        public DbSet<Movie> Movies { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Showtime> Showtimes { get; set; }

        public DbSet<Cinema> Cinemas { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Seat> Seats { get; set; }
        
        // --- BỔ SUNG BẢNG CINE-MATCH ---
        public DbSet<CineMatch> CineMatches { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Cấu hình bảng Bookings
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK_bookings__3213E83F981ED873");
                entity.ToTable("bookings");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");

                entity.Property(e => e.PaymentMethod)
                    .HasMaxLength(50)
                    .HasColumnName("payment_method");

                entity.Property(e => e.PaymentStatus)
                    .HasMaxLength(20)
                    .IsUnicode(false)
                    .HasDefaultValue("pending")
                    .HasColumnName("payment_status");

                entity.Property(e => e.ShowtimeId).HasColumnName("showtime_id");

                entity.Property(e => e.TotalPrice)
                    .HasColumnType("decimal(10, 2)")
                    .HasColumnName("total_price");

                entity.Property(e => e.UserId).HasColumnName("user_id");

                entity.HasOne(d => d.Showtime).WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.ShowtimeId)
                    .HasConstraintName("FK__bookings__showti__6383C8BA");

                entity.HasOne(d => d.User).WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.SetNull)
                    .HasConstraintName("FK__bookings__user_i__628FA481");
            });

            // 2. Cấu hình bảng Booking Details
            modelBuilder.Entity<BookingDetail>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK_booking___3213E83F8B692CA5");
                entity.ToTable("booking_details");

                entity.HasIndex(e => new { e.ShowtimeId, e.SeatId }, "UQ_Seat_Per_Showtime").IsUnique();

                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.BookingId).HasColumnName("booking_id");

                entity.Property(e => e.Price)
                    .HasColumnType("decimal(10, 2)")
                    .HasColumnName("price");

                entity.Property(e => e.SeatId).HasColumnName("seat_id");
                entity.Property(e => e.ShowtimeId).HasColumnName("showtime_id");

                entity.HasOne(d => d.Booking).WithMany(p => p.BookingDetails)
                    .HasForeignKey(d => d.BookingId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK__booking__booki__6754599E");

                entity.HasOne(d => d.Seat).WithMany(p => p.BookingDetails)
                    .HasForeignKey(d => d.SeatId)
                    .HasConstraintName("FK__booking__seat_i__66603565");
            });
        }
    }
}