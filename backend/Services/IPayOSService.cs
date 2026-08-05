using Net.payOS.Types;
using System.Threading.Tasks;

namespace appweb.Services
{
    public interface IPayOSService
    {
        Task<CreatePaymentResult> CreatePaymentLink(long orderCode, int amount, string description, string returnUrl, string cancelUrl, long expiredAt);
        WebhookData VerifyWebhookData(WebhookType webhookBody);
        Task<PaymentLinkInformation> CancelPaymentLink(long orderCode, string cancellationReason);
    }
}
