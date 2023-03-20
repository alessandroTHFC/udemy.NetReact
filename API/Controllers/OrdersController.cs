using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Entities.OrderAggregate;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{

    [Authorize]
    public class OrdersController : BaseApiController
    {
        private readonly StoreContext _context;
        public OrdersController(StoreContext context)
        {
            _context = context;
            
        }
        

        //* HTTPGET to retrieve list of all orders based on Username. Goes through ProjectOrdertoDto for formatting data.
        [HttpGet]
        public async Task<ActionResult<List<OrderDto>>> GetOrders()
        {
            return await _context.Orders
                .ProjectOrdertoOrderDto()
                .Where(x => x.BuyerId == User.Identity.Name)
                .ToListAsync();
        }


        //* HTTPGET to get a specific order based on the ID of the order.
        [HttpGet("{id}", Name = "GetOrder")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            return await _context.Orders
                .ProjectOrdertoOrderDto()
                .Where(x => x.BuyerId == User.Identity.Name && x.Id == id)
                .FirstOrDefaultAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
        {
            //* First Step is to get the basket
            var basket = await _context.Baskets
                .RetrieveBasketWithItems(User.Identity.Name)
                .FirstOrDefaultAsync();

            if(basket == null) return BadRequest(new ProblemDetails{Title = "Could Not Locate Basket"});
            //* COMMENT: create new list of items being ordered.
            var items = new List<OrderItems>();
            
            //* COMMENT: Loop over items returned from API inside basket where the Id is the username of current user.
            foreach (var item in basket.Items)
            {
                //* COMMENT: Goes back to API for product info based on that items ID
                var productItem = await _context.Products.FindAsync(item.ProductId);
                //* COMMENT: create two new objects, itemOrdered is then added into the second object orderItem.
                var itemOrdered = new ProductItemOrdered
                {
                    ProductId = productItem.Id,
                    Name = productItem.Name,
                    PictureUrl = productItem.PictureUrl,
                }; 
                var orderItem = new OrderItems
                {
                    ItemOrdered = itemOrdered,
                    Price = productItem.Price,
                    Quantity = item.Quantity, 
                };
                //* COMMENT: Adding newly created object order item into the list
                items.Add(orderItem);
                //* COMMENT: decrease the quantity in stock of the current item in the loop.
                productItem.QuantityInStock -= item.Quantity;
            }
            var subtotal = items.Sum(item => item.Price * item.Quantity);

            var deliveryFee = subtotal > 10000 ? 0 : 500;


            var order = new Order
            {
                OrderItems = items,
                BuyerId = User.Identity.Name,
                ShippingAddress = orderDto.ShippingAddress,
                Subtotal = subtotal,
                DeliveryFee = deliveryFee,
                PaymentIntentId = basket.PaymentIntentId,
            };
            //* Tracking and save to database.
            _context.Orders.Add(order);
            _context.Baskets.Remove(basket);


            //* COMMENT: Updating the user address if they click the save user address field in the UI
            if(orderDto.SaveAddress)
            {
                var user = await _context.Users
                .Include(a => a.Address)
                .FirstOrDefaultAsync(x => x.UserName == User.Identity.Name);
                var address = new UserAddress
                {
                    FullName = orderDto.ShippingAddress.FullName,
                    Address1 = orderDto.ShippingAddress.Address1, 
                    Address2 = orderDto.ShippingAddress.Address2, 
                    City = orderDto.ShippingAddress.City, 
                    State = orderDto.ShippingAddress.State, 
                    PostCode = orderDto.ShippingAddress.PostCode,
                    Country = orderDto.ShippingAddress.Country, 
                };
                user.Address = address;
                // _context.Update(user);
            }
            var result = await _context.SaveChangesAsync() > 0;

            //* COMMENT: Sets up the route for when we need to go Get this order, returns URI of /GetOrder/{id}
            if (result) return CreatedAtRoute("GetOrder", new {id = order.Id}, order.Id);


            return BadRequest("Problem Creating Order");
        }

    }
}