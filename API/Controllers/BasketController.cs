using System;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class BasketController : BaseApiController
    {
        private readonly StoreContext _context;
        public BasketController(StoreContext context)
        {
            _context = context;
            
        }

        [HttpGet(Name = "GetBasket")]
        public async Task<ActionResult<BasketDto>> GetBasket()
        {
            var basket = await RetrieveBasket(GetbuyerId());

            if (basket == null) return NotFound();
            return basket.MapBasketToDto();
        }

    

        [HttpPost]
        public async Task<ActionResult<BasketDto>> AddItemToBasket(int productId, int quantity)
        {
            //get basket
            var basket = await RetrieveBasket(GetbuyerId());
            //create basket
            if (basket == null)
                basket = CreateBasket();
            //get product
            var product = await _context.Products.FindAsync(productId);
            if(product == null) 
                return BadRequest(new ProblemDetails{Title = "Product Not Found"});
            //add item
            basket.AddItem(product, quantity);

            //save changes
            //* Indicate the number of changes made to the database
            var result = await _context.SaveChangesAsync() > 0;
            if (result)
                return CreatedAtRoute("GetBasket", basket.MapBasketToDto());
            return BadRequest(new ProblemDetails{Title = "Problem Saving Item To Basket"});

        }
        
        [HttpDelete]
        public async Task<ActionResult> RemoveBasketItem(int productId, int quantity) {
            
            //get basket
            var basket = await RetrieveBasket(GetbuyerId());
            if (basket == null)
                return NotFound();
            //remove item or reduce quantiy
            basket.RemoveItem(productId, quantity);
            //save changes
            var result = await _context.SaveChangesAsync() > 0;
            if (result)
                return Ok();
            return BadRequest(new ProblemDetails{Title = "Problem removing item from basket"});
        }

        private async Task<Basket> RetrieveBasket(string buyerId)
        {
            
            if (string.IsNullOrEmpty(buyerId))
            {
                Response.Cookies.Delete("buyerId");
                return null;
            }

            return await _context.Baskets
                .Include(i => i.Items)
                .ThenInclude(p => p.Product)
                .FirstOrDefaultAsync(basket => basket.BuyerId == buyerId);
        }

        // Function to create an instance of a basket with buyer id and ads it to the cookies. Adds basket to the store context
        private Basket CreateBasket()
        {
            //* If user is logged in, buyerID will be their username
            var buyerId = User.Identity?.Name;

            //* If they arent logged in, we will be working with annonymous basket and create a buyer id and set as a cookie
            if(string.IsNullOrEmpty(buyerId))
            {
                buyerId = Guid.NewGuid().ToString();
                var cookieOptions = new CookieOptions{IsEssential = true, Expires = DateTime.Now.AddDays(30)};
                Response.Cookies.Append("buyerId", buyerId, cookieOptions);
            }

            var basket = new Basket{BuyerId = buyerId};
            _context.Baskets.Add(basket);
            return basket;
        }


        //* COMMENT: Function will check if there is a username and return that, if there isnt it will get the cookie
        private string GetbuyerId()
        {    
             return User.Identity?.Name ?? Request.Cookies["buyerId"];
        }

    }
}