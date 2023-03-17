using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly UserManager<User> _userManager;
        private readonly TokenService _tokenService;
        private readonly StoreContext _context;

        public AccountController(UserManager<User> userManager, TokenService tokenService, StoreContext context)
        {
            _tokenService = tokenService;
            _context = context;
            _userManager = userManager;
            
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            //* COMMENT: Checks for username, if not returns null
            var user = await _userManager.FindByNameAsync(loginDto.Username);
            //* COMMENT: Checks for password in databas. If user is null or the password doesnt match the user
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
                return Unauthorized();

            var userBasket = await RetrieveBasket(loginDto.Username); //* COMMENT: Checks if there is a basket associated with user in DB
            var anonBasket = await RetrieveBasket(Request.Cookies["buyerId"]); //* Otherwise will get anonymous basket from cookie. 

            // =========================================================================================================================== \\
            //* Basket Relationship with User:
            //* Above we have two potential baskets, the userBasket and the anonBasket. We have multiple potential scenarios for how a user 
            //* can have a relationship with a basket: 
            //* 1. A user already has a basket associated with them and stored in the DB
            //! In this scenario things can go one of two ways, they could have come on the website, logged straight on and gone back to their original 
            //! basket. Alternatively, they have been shopping without logging in, in which case have put items in an annoymous basket. In order to pay,
            //! they will need to log in, in which case we want to overwrite their userBasket with the current anon basket. As it is the latest basket that
            //! they are associated with. 
            //* 2. A user does not have have a basket associated with them.
            //! In this case the basket will be created as a userBasket not an anon basket.
            // =========================================================================================================================== \\

            //* COMMENT: The below code, will go about removing the associated DB basket if the user has started shopping with an anon basket
            //* and go about making the anonBasket into a 'userBasket' by assigning its ID from the cookie hash id to the username!
            if (anonBasket != null) 
            {
                if(userBasket != null) _context.Baskets.Remove(userBasket);
                anonBasket.BuyerId = user.UserName;
                Response.Cookies.Delete("buyerId");
                await _context.SaveChangesAsync();
            }
            //* else, user and password exists, in which case return the user
            return new UserDto
            {
                Email = user.Email,
                Token = await _tokenService.GenerateToken(user),
                Basket = anonBasket != null ? anonBasket.MapBasketToDto() : userBasket?.MapBasketToDto(),
            };
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterDto registerDto)
        {
            var user = new User{UserName = registerDto.Username, Email = registerDto.Email};

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if(!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return ValidationProblem();
            }

            await _userManager.AddToRoleAsync(user, "Member");
            return StatusCode(201);
        }

        //* COMMENT: need to use Authorize so only authenticated users can access this
        [Authorize]
        [HttpGet("currentUser")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            //* This will go get the Name claim from the token
            var user = await _userManager.FindByNameAsync(User.Identity.Name);
             var userBasket = await RetrieveBasket(User.Identity.Name);

            return new UserDto
            {
                Email = user.Email,
                Token = await _tokenService.GenerateToken(user),
                Basket = userBasket?.MapBasketToDto(),
            };
        }

        [Authorize]
        [HttpGet("savedAddress")]
        public async Task<ActionResult<UserAddress>> GetSavedAddress()
        {
            return await _userManager.Users
                    .Where(x => x.UserName == User.Identity.Name)
                    .Select(user => user.Address)
                    .FirstOrDefaultAsync();
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
    }
}