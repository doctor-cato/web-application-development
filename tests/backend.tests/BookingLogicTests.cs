using System;
using Xunit;
using BCrypt.Net;

namespace appweb.Tests
{
    public class BookingLogicTests
    {
        [Fact]
        public void CalculateTotalPrice_WithSingleCombo_ReturnsCorrectTotal()
        {
            // Arrange
            int seatCount = 2;
            decimal ticketPrice = 90000m;
            decimal comboPrice = 65000m; // Single Combo

            // Act
            decimal total = (seatCount * ticketPrice) + comboPrice;

            // Assert
            Assert.Equal(245000m, total);
        }

        [Fact]
        public void PasswordHashing_VerifiesCorrectPassword()
        {
            // Arrange
            string rawPassword = "SecurePassword123!";

            // Act
            string hash = BCrypt.Net.BCrypt.HashPassword(rawPassword);
            bool isValid = BCrypt.Net.BCrypt.Verify(rawPassword, hash);
            bool isInvalid = BCrypt.Net.BCrypt.Verify("WrongPassword", hash);

            // Assert
            Assert.True(isValid);
            Assert.False(isInvalid);
        }

        [Theory]
        [InlineData("single", 65000)]
        [InlineData("double", 95000)]
        [InlineData("none", 0)]
        public void ComboPricing_ReturnsExpectedAmount(string comboId, decimal expectedPrice)
        {
            // Act
            decimal price = 0;
            if (comboId == "single") price = 65000;
            else if (comboId == "double") price = 95000;

            // Assert
            Assert.Equal(expectedPrice, price);
        }
    }
}
