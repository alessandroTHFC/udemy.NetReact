using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using API.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace API.Data
{

    public class StoreContext : IdentityDbContext<User>
    {
        public StoreContext(DbContextOptions options) : base(options)
        {
        }

        //* Defines the dbsets or entities we are using to create the table in database using the products class
        public DbSet<Product> Products { get; set; }

        public DbSet<Basket> Baskets {get; set;}

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<IdentityRole>()
                .HasData(
                    new IdentityRole{Name = "Member", NormalizedName = "MEMBER"},
                    new IdentityRole{Name = "Admin", NormalizedName = "ADMIN"}
                );
        }
    }
}