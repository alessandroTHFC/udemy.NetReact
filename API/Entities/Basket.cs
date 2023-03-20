using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
    public class Basket
    {
        public int Id { get; set; }

        public string BuyerId { get; set; }

        //* Whenever a Basket is made it initialises a List of Basket Items whether there are or arent items in the Basket. 

        
        public List<BasketItem> Items { get; set; } = new List<BasketItem>();

        public string PaymentIntentId { get; set; }

        public string ClientSecret { get; set; }

        public void AddItem(Product product, int quantity)
        {
            if (Items.All(item => item.ProductId != product.Id))
            {
                Items.Add(new BasketItem{Product = product, Quantity = quantity });
                return;
            }

            var exisitingItem = Items.FirstOrDefault(item => item.ProductId == product.Id);
            if(exisitingItem != null) 
                exisitingItem.Quantity += quantity;
        }

        public void RemoveItem(int productId, int quantity) {
            var item = Items.FirstOrDefault(item => item.ProductId == productId);
            if (item == null) return;
            item.Quantity -= quantity;
            if (item.Quantity == 0) Items.Remove(item);
        }
    }
}