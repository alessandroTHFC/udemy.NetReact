using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SQLitePCL;

namespace API.Middleware
{

    //! This class relates to exception that is thrown in BuggyController line 42.
    
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        
        private readonly IHostEnvironment _env;
        

        // Request Delegate next method allows us to pass on the exception to the next middleware;
        // Ilogger logs any exception and takes the type of exception;
        // Ihost checks whether in production or dev mode.
        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, 
                IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;

        }

        // because its middleware, it must have a method called invokeasync.
        public async Task InvokeAsync(HttpContext context)
        {
            try 
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = 500;

                var response =  new ProblemDetails
                {
                    // if the app is in dev mode, we will return stack trace, otherwise no.
                    Status = 500, 
                    Detail = _env.IsDevelopment() ? ex.StackTrace?.ToString() : null,
                    Title = ex.Message
                };
                var options = new JsonSerializerOptions{PropertyNamingPolicy = JsonNamingPolicy.CamelCase};

                var json = JsonSerializer.Serialize(response, options);

                await context.Response.WriteAsync(json);
            }
        }
    }
}