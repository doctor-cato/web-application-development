using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Net.payOS;
using Net.payOS.Types;
using appweb.Models;
using Microsoft.Extensions.Logging;

namespace appweb.Services
{
    public class PayOSService : IPayOSService
    {
        private readonly PayOS _payOS;
        private readonly ILogger<PayOSService> _logger;

        public PayOSService(IOptions<PayOSConfig> config, ILogger<PayOSService> logger)
        {
            var options = config.Value;
            _payOS = new PayOS(options.ClientId, options.ApiKey, options.ChecksumKey);
            _logger = logger;
        }

        public async Task<CreatePaymentResult> CreatePaymentLink(long orderCode, int amount, string description, string returnUrl, string cancelUrl, long expiredAt)
        {
            try
            {
                ItemData item = new ItemData("Vé xem phim", 1, amount);
                PaymentData paymentData = new PaymentData(
                    orderCode: orderCode,
                    amount: amount,
                    description: description,
                    items: new List<ItemData> { item },
                    cancelUrl: cancelUrl,
                    returnUrl: returnUrl,
                    expiredAt: (int)expiredAt
                );

                CreatePaymentResult createPayment = await _payOS.createPaymentLink(paymentData);
                return createPayment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo link thanh toán PayOS");
                throw;
            }
        }

        public WebhookData VerifyWebhookData(WebhookType webhookBody)
        {
            return _payOS.verifyPaymentWebhookData(webhookBody);
        }

        public async Task<PaymentLinkInformation> CancelPaymentLink(long orderCode, string cancellationReason)
        {
            try
            {
                PaymentLinkInformation paymentLinkInfo = await _payOS.cancelPaymentLink(orderCode, cancellationReason);
                return paymentLinkInfo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi hủy link thanh toán PayOS");
                throw;
            }
        }
    }
}
