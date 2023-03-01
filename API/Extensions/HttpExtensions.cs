using System.Text.Json;
using API.RequestHelpers;
using Microsoft.AspNetCore.Http;

namespace API.Extensions
{
    public static class HttpExtensions
    {
        public static void AddPaginationHeader(this HttpResponse response, MetaData metaData) 
        {
            var options = new JsonSerializerOptions{PropertyNamingPolicy = JsonNamingPolicy.CamelCase};
            
            //* COMMENT: This custom header is how we will pass our pagination details to the client application, to be used in creating the UI features. I.e What page are we on, how many items we are displaying etc.
            response.Headers.Add("Pagination", JsonSerializer.Serialize(metaData, options));
            //*COMMENT: Below Add must be spelled as is to allow client to access the Header you want available, in this case, the Pagination header above!
            response.Headers.Add("Access-Control-Expose-Headers", "Pagination");
        }
    }
}