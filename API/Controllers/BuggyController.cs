using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class BuggyController : BaseApiController
    {
        [HttpGet("Not-Found")]

        public ActionResult GetNotFound()
        {
            return NotFound();
        }
        
        [HttpGet("Bad-Request")]
        public ActionResult GetBadRequest()
        {
            return BadRequest(new ProblemDetails{Title="This Is A Bad Request"});
        }

        [HttpGet("Unauthorised")]
        public ActionResult GetUnorthorised()
        {
            return Unauthorized();
        }


        [HttpGet("Validation-Error")]
        public ActionResult GetValidationError()
        {
            ModelState.AddModelError("Problem1", "This Is Error 1");
            ModelState.AddModelError("Problem2", "This Is Error 2");
            return ValidationProblem();
        }

        [HttpGet("Server-Error")]
        public ActionResult GetServerError()
        {
            throw new Exception("This Is A Server Error");
        }
    }
}