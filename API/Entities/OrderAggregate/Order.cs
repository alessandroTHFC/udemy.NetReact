using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace API.Entities.OrderAggregate
{
    public class Order
    {
        public int Id { get; set; }

        public string BuyerId { get; set; }
        
        [Required]
        public ShippingAddress  ShippingAddress { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.Now;

        public List<OrderItems> OrderItems { get; set; }

        public long Subtotal { get; set; }

        public long DeliveryFee { get; set; }

        public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;

        public string PaymentIntentId { get; set; }

        public long GetTotal() { 
            return Subtotal + DeliveryFee;
        }
    }
}