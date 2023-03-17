using System.Reflection.Metadata;
using System.Text;
using API.Data;
using API.Entities;
using API.Middleware;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

//Add Services to the container.

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
               var  jwtSecurityScheme = new OpenApiSecurityScheme
               {
                    BearerFormat = "JWT",
                    Name = "Authorization", 
                    In = ParameterLocation.Header, 
                    Type = SecuritySchemeType.ApiKey, 
                    Scheme = JwtBearerDefaults.AuthenticationScheme,
                    Description = "Put Bearer + your token in the box below",
                    Reference = new OpenApiReference {
                        Id = JwtBearerDefaults.AuthenticationScheme,
                        Type = ReferenceType.SecurityScheme
                    }
               };
               c.AddSecurityDefinition(jwtSecurityScheme.Reference.Id, jwtSecurityScheme);
               c.AddSecurityRequirement(new OpenApiSecurityRequirement
               {
                    {
                        jwtSecurityScheme, Array.Empty<string>()
                    }
               });
            });

            builder.Services.AddDbContext<StoreContext>(opt => 
            {
                // This line points to the default conn string inside appsettings.Development.json
                opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
            });
            builder.Services.AddCors();
            builder.Services.AddIdentityCore<User>(opt => 
            {
                //* COMMENT: Prevents duplicate emails in database. e.g. 2 users with same Email address. 
                opt.User.RequireUniqueEmail = true;
            })
                .AddRoles<Role>()
                .AddEntityFrameworkStores<StoreContext>();
            
            //* COMMENT: authentication - users will present token inside auth header in http request, server will then check for validity
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(opt =>
                {
                    opt.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true, //validate against lifetime of token
                        ValidateIssuerSigningKey = true, //server checks validity of token based on signature it used when creating token.
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWTSettings:TokenKey"]))
                    };
                });
            builder.Services.AddAuthorization();
            builder.Services.AddScoped<TokenService>();

var app = builder.Build();

            app.UseMiddleware<ExceptionMiddleware>();

            if (builder.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI( c => 
                {
                    c.ConfigObject.AdditionalItems.Add("persistAuthorization", "true");
                }
        
                );
            }

            // app.UseHttpsRedirection();
            app.UseCors(opt => 
            {
                //* Using AllowCredentials to allow client side cookie passing back and forth.
                opt.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins("http://localhost:3000");
            });

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            using var scope = app.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<StoreContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            try {
                //* context migrate will create a database if one doesnt exist on program start up
                    await context.Database.MigrateAsync();
                //* Dbinitialiser will then populate the database with the seed class
                    await DbInitialiser.Initialise(context, userManager);
            }
            catch(Exception ex){
                logger.LogError(ex, "Problem Migrating Data");
            }
app.Run();

