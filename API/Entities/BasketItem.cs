using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities
{

    [Table("BasketItems")]

    // one to one relationship. entity framework convention makes connection between "Basket Item" and Product Product
    public class BasketItem
    {

        public int Id { get; set; }

        public int Quantity { get; set; }


        //* navigation properties
        public int ProductId { get; set; }

        public Product Product { get; set; }



        public int BasketId { get; set; }
        //* By specifying the parent it means that the child can't exist without the parent item so basket items
        //* will be removed from db if a basket is removed. Makes delete "cascading"
        public Basket Basket { get; set; }

    }


}