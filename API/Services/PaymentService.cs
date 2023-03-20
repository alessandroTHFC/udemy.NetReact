using API.Entities;
using Stripe;

namespace API.Services
{
    public class PaymentService
    {
        private readonly IConfiguration _config;
    
        public PaymentService(IConfiguration config)
        {
            _config = config;
             
        }

        public async Task<PaymentIntent> CreateOrUpdatePaymentIntent(Basket basket)
        {
            StripeConfiguration.ApiKey = _config["StripeSettings:SecretKey"];

            var service = new PaymentIntentService();

            var intent = new PaymentIntent();

            var subtotal = basket.Items.Sum(item => item.Quantity * item.Product.Price);

            var deliverFee = subtotal > 10000 ? 0 : 500;

            //* CREATE NEW PAYMENT INTENT IF ONE ISNT ALREADY ASSOCIATED WITH OUR BASKET
            if (string.IsNullOrEmpty(basket.PaymentIntentId))
            {
                var options = new PaymentIntentCreateOptions
                {
                    Amount = subtotal + deliverFee,
                    Currency = "usd", 
                    PaymentMethodTypes = new List<string> {"card"}
                };

                intent = await service.CreateAsync(options);

            }
            else //* IF INTENT ALREADY EXISTS IN OUR BASKET
            {   
                //* We update the intent because in between accessing old intent and now
                //* client may have added or removed an item from the basket so the intent needs to be updated
                var options = new PaymentIntentUpdateOptions 
                {
                    Amount = subtotal + deliverFee
                };
                await service.UpdateAsync(basket.PaymentIntentId, options);
            }

            return intent;
        }
    }
}