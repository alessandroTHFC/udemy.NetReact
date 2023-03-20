using API.Data;
using API.DTOs;
using API.Entities.OrderAggregate;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace API.Controllers
{
    public class PaymentsController: BaseApiController 
    {
        private readonly PaymentService _paymentService;
        private readonly StoreContext _context;
        private readonly IConfiguration _config;
        public PaymentsController(PaymentService paymentService, StoreContext context, IConfiguration config)
        {
            _config = config;
            _context = context;
            _paymentService = paymentService;
            
        }


        //* This HttpPost is related to our PaymentService.
        //* In order to make a payment we must first create or update an existing payment intent which is related to Stripe.
        //* Our payment intent (if one exists) will be stored inside our basket we are looking to purchase.
        //* First step is retrieve the basket from our database, check if its null(return not Found) or
        //* then we need to create the intent and we do this by using the method inside our PaymentServices class
        //* and pass our retrieved basket into that. see PaymentService.cs ln 16 for that method. 
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<BasketDto>> CreateOrUpdatePaymentIntent()
        {   
            var basket = await _context.Baskets
                .RetrieveBasketWithItems(User.Identity.Name)
                .FirstOrDefaultAsync();

            if (basket == null) return NotFound();

            var intent = await _paymentService.CreateOrUpdatePaymentIntent(basket);

            if(intent == null) return BadRequest(new ProblemDetails{Title= "Problem Creating Payment Intent"});

            basket.PaymentIntentId = basket.PaymentIntentId ?? intent.Id;
            basket.ClientSecret = basket.ClientSecret ?? intent.ClientSecret;

            _context.Update(basket);
            var result = await _context.SaveChangesAsync() > 0;

            if(!result) return BadRequest(new ProblemDetails{Title = "Problem updating basket with intent"});

            return basket.MapBasketToDto();
        }

        [HttpPost("webhook")]
        public async Task<ActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], 
                _config["StripeSettings:WhSecret"]);

            var charge = (Charge)stripeEvent.Data.Object;

            var order = await _context.Orders.FirstOrDefaultAsync(x => x.PaymentIntentId == charge.PaymentIntentId);

            if(charge.Status == "succeeded") order.OrderStatus = OrderStatus.PaymentRecieved;

            await _context.SaveChangesAsync();

            return new EmptyResult(); //* This is how Stripe knows we have recieved their request. 
        }
    }
}