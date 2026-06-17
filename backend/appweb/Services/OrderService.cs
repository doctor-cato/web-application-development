using System;
using System.Collections.Generic;

namespace appweb.Services
{
    public class OrderService
    {
        // Hàm xử lý tính toán hóa đơn bắp nước tại quầy
        public double CalculateConcessionOrder(string comboName, int quantity)
        {
            double pricePerCombo = 0;

            if (comboName == "Combo_Bap_Nuoc") pricePerCombo = 85000; // 85k/combo
            else if (comboName == "Pepsi_Le") pricePerCombo = 30000;
            else if (comboName == "Bap_Ngot_Le") pricePerCombo = 60000;

            if (quantity <= 0) throw new ArgumentException("Số lượng bán phải lớn hơn 0!");

            return pricePerCombo * quantity;
        }
    }
}